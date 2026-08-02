/** Single source of truth for campaign copy targets, links and dates. */

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://matheusbiancardine.com.br'
).replace(/\/$/, '');

export const CANDIDATE = {
  name: 'Matheus Biancardine',
  role: 'Deputado Federal',
  state: 'MG',
  party: 'NOVO',
} as const;

export const LINKS = {
  donate: 'https://queroapoiar.com.br/matheusbiancardine',
  instagram: 'https://www.instagram.com/matheus.biancardine',
  whatsapp: 'https://wa.me/5531985931115',
  /**
   * Invite for the regional militancy group. Set NEXT_PUBLIC_WHATSAPP_GROUP_URL
   * to the real chat.whatsapp.com invite; until then this falls back to a direct
   * chat with the campaign line.
   */
  whatsappGroup:
    process.env.NEXT_PUBLIC_WHATSAPP_GROUP_URL ?? 'https://wa.me/5531985931115',
} as const;

/**
 * First round of the 2026 general election (a Sunday), in Brasília time.
 * The design file said 14/10 — the strategy brief and the official calendar
 * both say 04/10, so that is what the countdown uses.
 */
export const ELECTION_DATE = '2026-10-04';
export const ELECTION_LABEL = '4 de Outubro, 2026';
export const ELECTION_LABEL_SHORT = '4 de Out, 2026';

const TIMEZONE = 'America/Sao_Paulo';

const dateInBrasilia = new Intl.DateTimeFormat('en-CA', {
  timeZone: TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/**
 * Whole days from "today in Brasília" to election day. Compared as calendar
 * dates rather than instants so the number ticks over at local midnight and
 * never lands on an off-by-one from the server's own timezone.
 */
export function daysUntilElection(now: Date = new Date()): number {
  const today = Date.parse(`${dateInBrasilia.format(now)}T00:00:00Z`);
  const election = Date.parse(`${ELECTION_DATE}T00:00:00Z`);
  return Math.max(0, Math.round((election - today) / 86_400_000));
}
