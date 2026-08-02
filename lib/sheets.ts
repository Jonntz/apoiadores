import 'server-only';
import { createSign } from 'node:crypto';

/**
 * Minimal Google Sheets append client.
 *
 * The official `googleapis` package pulls in several MB for what is, here, one
 * signed JWT and one POST. This does the same OAuth2 service-account flow with
 * node:crypto only, so nothing is added to the dependency tree or the function
 * bundle.
 *
 * Required env (Vercel → Settings → Environment Variables):
 *   GOOGLE_SA_EMAIL        service account address (…iam.gserviceaccount.com)
 *   GOOGLE_SA_PRIVATE_KEY  its PEM private key ("\n" escapes are accepted)
 *   SHEETS_SPREADSHEET_ID  id from the sheet URL
 *   SHEETS_TAB_NAME        optional, defaults to "Apoiadores"
 *
 * The spreadsheet must be shared with GOOGLE_SA_EMAIL as an Editor.
 */

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const SCOPE = 'https://www.googleapis.com/auth/spreadsheets';

function base64url(input: string | Buffer): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

/**
 * Vercel's env UI stores the PEM with literal "\n" sequences; a key pasted from
 * the JSON file may also arrive wrapped in quotes.
 */
function normalizePrivateKey(raw: string): string {
  return raw.replace(/^["']|["']$/g, '').replace(/\\n/g, '\n');
}

/**
 * Cached across invocations of the same warm lambda. Google's tokens last an
 * hour; refreshing a minute early avoids racing the expiry.
 */
let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.value;

  const email = requireEnv('GOOGLE_SA_EMAIL');
  const privateKey = normalizePrivateKey(requireEnv('GOOGLE_SA_PRIVATE_KEY'));

  const issuedAt = Math.floor(Date.now() / 1000);
  const claims = {
    iss: email,
    scope: SCOPE,
    aud: TOKEN_URL,
    iat: issuedAt,
    exp: issuedAt + 3600,
  };

  const signingInput = `${base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))}.${base64url(
    JSON.stringify(claims),
  )}`;

  const signature = createSign('RSA-SHA256').update(signingInput).sign(privateKey);
  const assertion = `${signingInput}.${base64url(signature)}`;

  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(
      `Google token request failed (${response.status}): ${await response.text()}`,
    );
  }

  const token = (await response.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    value: token.access_token,
    expiresAt: Date.now() + (token.expires_in - 60) * 1000,
  };
  return token.access_token;
}

/** Appends one row to the configured tab. */
export async function appendRow(values: readonly (string | number)[]): Promise<void> {
  const spreadsheetId = requireEnv('SHEETS_SPREADSHEET_ID');
  const tab = process.env.SHEETS_TAB_NAME ?? 'Apoiadores';
  const accessToken = await getAccessToken();

  const url =
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}` +
    `/values/${encodeURIComponent(`${tab}!A:Z`)}:append` +
    `?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ values: [values] }),
    cache: 'no-store',
  });

  if (!response.ok) {
    // A token can still be rejected if the key was rotated mid-flight; drop it
    // so the next attempt re-authenticates rather than replaying a stale one.
    if (response.status === 401) cachedToken = null;
    throw new Error(
      `Sheets append failed (${response.status}): ${await response.text()}`,
    );
  }
}
