/**
 * Validation shared by the browser and the server action. The client copy gives
 * instant feedback; the server runs the exact same rules and is authoritative —
 * a request that skips the UI is validated identically.
 */

export const HELP_OPTIONS = [
  { value: 'redes', label: 'Divulgação nas redes' },
  { value: 'rua', label: 'Material de rua e bandeira' },
  { value: 'liderancas', label: 'Organizar lideranças na minha cidade' },
  { value: 'doacao', label: 'Doação' },
] as const;

export type HelpValue = (typeof HELP_OPTIONS)[number]['value'];

const HELP_LABELS = new Map<string, string>(
  HELP_OPTIONS.map((option) => [option.value, option.label]),
);

export type SupporterFields = {
  nome: string;
  whatsapp: string;
  cidade: string;
  ajuda: string;
};

export const FIELD_NAMES = ['nome', 'whatsapp', 'cidade', 'ajuda'] as const;

export type FieldErrors = Partial<Record<keyof SupporterFields, string>>;

/** Digits only — what gets stored and what the length rules run against. */
export function onlyDigits(value: string): string {
  return value.replace(/\D+/g, '');
}

/** Progressive "(31) 98593-1115" mask, safe to run on every keystroke. */
export function formatWhatsapp(value: string): string {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length === 0) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function collapseSpaces(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

export function validateField(
  field: keyof SupporterFields,
  value: string,
): string | undefined {
  switch (field) {
    case 'nome': {
      const nome = collapseSpaces(value);
      if (!nome) return 'Informe seu nome completo.';
      if (nome.length < 3) return 'Nome muito curto.';
      if (!nome.includes(' ')) return 'Informe nome e sobrenome.';
      return undefined;
    }
    case 'whatsapp': {
      const digits = onlyDigits(value);
      if (!digits) return 'Informe seu WhatsApp com DDD.';
      // 11 digits = DDD + 9-digit mobile. WhatsApp only runs on mobile lines.
      if (digits.length !== 11) {
        return 'Informe um WhatsApp válido com DDD (ex.: 31 98593-1115).';
      }
      if (Number(digits.slice(0, 2)) < 11) return 'DDD inválido.';
      if (digits[2] !== '9') return 'O número de celular deve começar com 9 após o DDD.';
      return undefined;
    }
    case 'cidade': {
      if (!collapseSpaces(value)) return 'Informe sua cidade.';
      return undefined;
    }
    case 'ajuda': {
      if (!value) return 'Escolha como você quer ajudar.';
      if (!HELP_LABELS.has(value)) return 'Escolha uma das opções da lista.';
      return undefined;
    }
  }
}

export function validateAll(fields: SupporterFields): FieldErrors {
  const errors: FieldErrors = {};
  for (const key of FIELD_NAMES) {
    const error = validateField(key, fields[key]);
    if (error) errors[key] = error;
  }
  return errors;
}

/** Trimmed, mask-free values ready to write to the spreadsheet. */
export function normalize(fields: SupporterFields) {
  return {
    nome: collapseSpaces(fields.nome),
    whatsapp: onlyDigits(fields.whatsapp),
    cidade: collapseSpaces(fields.cidade),
    // Stored as the human label so the sheet reads without a legend.
    ajuda: HELP_LABELS.get(fields.ajuda) ?? '',
  };
}
