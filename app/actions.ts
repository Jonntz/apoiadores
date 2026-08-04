'use server';

import { headers } from 'next/headers';
import { appendRow, readColumn } from '@/lib/sheets';
import type { FormState } from '@/lib/form-state';
import { normalize, onlyDigits, validateAll, type SupporterFields } from '@/lib/validation';

/** A real person needs more than a couple of seconds to fill four fields. */
const MIN_FILL_MS = 2500;

/**
 * Column holding the WhatsApp number — the third value written by `appendRow`
 * below. It is the deduplication key: names and cities repeat, a mobile line
 * belongs to one person.
 */
const WHATSAPP_COLUMN = 'C';

const dateTimeInBrasilia = new Intl.DateTimeFormat('pt-BR', {
  timeZone: 'America/Sao_Paulo',
  dateStyle: 'short',
  timeStyle: 'medium',
});

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
}

export async function registerSupporter(
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const fields: SupporterFields = {
    nome: readString(formData, 'nome'),
    whatsapp: readString(formData, 'whatsapp'),
    cidade: readString(formData, 'cidade'),
    ajuda: readString(formData, 'ajuda'),
  };

  const echo = { ...fields };

  // --- Anti-spam ------------------------------------------------------------
  // Two cheap checks instead of a CAPTCHA: a field only a bot fills in, and the
  // time the form was on screen. Both are silent — a bot gets the same "thanks"
  // response as a human, so there is no signal to tune against. Neither costs
  // the visitor a request or a kilobyte.
  const trap = readString(formData, 'website');
  const openedAt = Number(readString(formData, 'openedAt'));
  const tooFast = Number.isFinite(openedAt) && openedAt > 0 && Date.now() - openedAt < MIN_FILL_MS;

  if (trap.length > 0 || tooFast) {
    return { status: 'success' };
  }

  const errors = validateAll(fields);
  if (Object.keys(errors).length > 0) {
    return {
      status: 'invalid',
      errors,
      values: echo,
      message: 'Preencha todos os campos obrigatórios para finalizar sua inscrição.',
    };
  }

  const clean = normalize(fields);
  const requestHeaders = await headers();

  // --- Deduplication --------------------------------------------------------
  // Compared on digits only, because the column is read back as a number and a
  // row typed by hand may carry a mask. Fails *open*: if the read breaks, we
  // still save. A duplicated row is a nuisance to clean up; a supporter lost to
  // an outage is gone for good.
  let alreadyRegistered = false;
  try {
    const registered = await readColumn(WHATSAPP_COLUMN);
    alreadyRegistered = registered.some((cell) => onlyDigits(cell) === clean.whatsapp);
  } catch (error) {
    console.error('[registerSupporter] duplicate check failed, saving anyway', error);
  }

  if (alreadyRegistered) return { status: 'duplicate' };

  try {
    await appendRow([
      dateTimeInBrasilia.format(new Date()),
      clean.nome,
      clean.whatsapp,
      clean.cidade,
      clean.ajuda,
      readString(formData, 'utm_source'),
      readString(formData, 'utm_medium'),
      readString(formData, 'utm_campaign'),
      readString(formData, 'utm_content'),
      readString(formData, 'utm_term'),
      readString(formData, 'referrer') || requestHeaders.get('referer') || '',
    ]);
  } catch (error) {
    // Logged for the Vercel runtime log; the visitor gets an actionable message
    // rather than the underlying Google error.
    console.error('[registerSupporter] Sheets append failed', error);
    return {
      status: 'error',
      values: echo,
      message:
        'Não conseguimos salvar seu cadastro agora. Tente novamente em instantes ou chame a gente no WhatsApp.',
    };
  }

  // No redirect: the visitor stays on the landing page and SupporterForm opens
  // the confirmation modal off this status. Keeps the scroll position, the UTMs
  // in the URL and the ad pixel's page context intact.
  return { status: 'success' };
}
