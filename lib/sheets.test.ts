/**
 * Verifies the hand-rolled service-account flow without touching Google:
 * the JWT must actually verify against the key, carry the right claims, and the
 * append request must hit the right URL with the right body.
 *
 *   npm test
 */
import assert from 'node:assert/strict';
import { generateKeyPairSync, createVerify } from 'node:crypto';
import { test } from 'node:test';

const { privateKey, publicKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});

process.env.GOOGLE_SA_EMAIL = 'lp@projeto.iam.gserviceaccount.com';
// Stored the way Vercel's env UI holds it: quoted, with escaped newlines.
process.env.GOOGLE_SA_PRIVATE_KEY = `"${privateKey.replace(/\n/g, '\\n')}"`;
process.env.SHEETS_SPREADSHEET_ID = 'sheet-id-123';
process.env.SHEETS_TAB_NAME = 'Apoiadores';

const { appendRow, readColumn } = await import('./sheets.ts');

type Call = { url: string; init: RequestInit };

function stubFetch(handler: (call: Call) => Response) {
  const calls: Call[] = [];
  globalThis.fetch = (async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const call = { url: String(input), init };
    calls.push(call);
    return handler(call);
  }) as typeof fetch;
  return calls;
}

const tokenResponse = (token = 'ya29.fake-token') =>
  new Response(JSON.stringify({ access_token: token, expires_in: 3600 }), { status: 200 });

function decodeSegment(segment: string): unknown {
  return JSON.parse(Buffer.from(segment.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString());
}

test('signs a verifiable RS256 assertion and appends the row', async () => {
  const calls = stubFetch((call) =>
    call.url.includes('oauth2') ? tokenResponse() : new Response('{}', { status: 200 }),
  );

  await appendRow(['01/08/2026 10:00:00', 'Maria Silva', '31985931115', 'Belo Horizonte']);

  assert.equal(calls.length, 2, 'one token request, one append');

  // --- the assertion -------------------------------------------------------
  const tokenCall = calls[0]!;
  const assertion = new URLSearchParams(tokenCall.init.body as string).get('assertion')!;
  const [header, payload, signature] = assertion.split('.');

  assert.deepEqual(decodeSegment(header!), { alg: 'RS256', typ: 'JWT' });

  const claims = decodeSegment(payload!) as Record<string, unknown>;
  assert.equal(claims.iss, 'lp@projeto.iam.gserviceaccount.com');
  assert.equal(claims.scope, 'https://www.googleapis.com/auth/spreadsheets');
  assert.equal(claims.aud, 'https://oauth2.googleapis.com/token');
  assert.equal((claims.exp as number) - (claims.iat as number), 3600);

  const verified = createVerify('RSA-SHA256')
    .update(`${header}.${payload}`)
    .verify(publicKey, Buffer.from(signature!.replace(/-/g, '+').replace(/_/g, '/'), 'base64'));
  assert.ok(verified, 'signature must verify against the service account key');

  // --- the append ----------------------------------------------------------
  const appendCall = calls[1]!;
  assert.ok(appendCall.url.startsWith('https://sheets.googleapis.com/v4/spreadsheets/sheet-id-123'));
  assert.ok(appendCall.url.includes('Apoiadores!A%3AZ:append'), appendCall.url);
  assert.ok(appendCall.url.includes('valueInputOption=USER_ENTERED'));
  assert.equal(
    (appendCall.init.headers as Record<string, string>).Authorization,
    'Bearer ya29.fake-token',
  );
  assert.deepEqual(JSON.parse(appendCall.init.body as string), {
    values: [['01/08/2026 10:00:00', 'Maria Silva', '31985931115', 'Belo Horizonte']],
  });
});

test('reuses the cached token, then re-authenticates after a 401', async () => {
  // Cached from the previous test: this append should not re-request a token.
  let calls = stubFetch(() => new Response('{}', { status: 200 }));
  await appendRow(['linha 2']);
  assert.equal(calls.length, 1, 'token was reused');

  // A 401 must drop the cache so the next call signs a fresh assertion.
  calls = stubFetch((call) =>
    call.url.includes('oauth2') ? tokenResponse('ya29.rotated') : new Response('nope', { status: 401 }),
  );
  await assert.rejects(() => appendRow(['linha 3']), /Sheets append failed \(401\)/);

  calls = stubFetch((call) =>
    call.url.includes('oauth2') ? tokenResponse('ya29.rotated') : new Response('{}', { status: 200 }),
  );
  await appendRow(['linha 4']);
  assert.equal(calls.length, 2, 'a new token was requested after the 401');
  assert.equal(
    (calls[1]!.init.headers as Record<string, string>).Authorization,
    'Bearer ya29.rotated',
  );
});

test('reads a column as strings, whatever type the sheet stored', async () => {
  // USER_ENTERED turns an 11-digit phone into a *number*, so the dedupe check
  // only works if numeric cells survive the round trip as their digits.
  const calls = stubFetch(
    () =>
      new Response(
        JSON.stringify({ values: [['WhatsApp', 31985931115, '(31) 98593-1116', null]] }),
        { status: 200 },
      ),
  );

  const column = await readColumn('C');

  assert.deepEqual(column, ['WhatsApp', '31985931115', '(31) 98593-1116', '']);

  const url = calls[0]!.url;
  assert.ok(url.includes('/values/Apoiadores!C%3AC?'), url);
  assert.ok(url.includes('majorDimension=COLUMNS'), url);
  assert.ok(url.includes('valueRenderOption=UNFORMATTED_VALUE'), url);
});

test('treats an empty range as an empty column', async () => {
  // The API omits `values` entirely when the range has no data.
  stubFetch(() => new Response('{}', { status: 200 }));
  assert.deepEqual(await readColumn('C'), []);
});

test('surfaces a missing environment variable by name', async () => {
  const saved = process.env.SHEETS_SPREADSHEET_ID;
  delete process.env.SHEETS_SPREADSHEET_ID;
  await assert.rejects(() => appendRow(['x']), /SHEETS_SPREADSHEET_ID/);
  process.env.SHEETS_SPREADSHEET_ID = saved;
});
