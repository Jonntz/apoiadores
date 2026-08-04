import assert from 'node:assert/strict';
import { test } from 'node:test';
import { formatWhatsapp, normalize, validateAll, validateField } from './validation.ts';

test('masks a WhatsApp number progressively', () => {
  assert.equal(formatWhatsapp(''), '');
  assert.equal(formatWhatsapp('3'), '(3');
  assert.equal(formatWhatsapp('31'), '(31');
  assert.equal(formatWhatsapp('31985'), '(31) 985');
  assert.equal(formatWhatsapp('3198593'), '(31) 9859-3');
  assert.equal(formatWhatsapp('31985931115'), '(31) 98593-1115');
  // Already-masked input stays stable, and extra digits are dropped.
  assert.equal(formatWhatsapp('(31) 98593-1115'), '(31) 98593-1115');
  assert.equal(formatWhatsapp('319859311159999'), '(31) 98593-1115');
  assert.equal(formatWhatsapp('abc'), '');
});

test('accepts a valid mobile and rejects the near misses', () => {
  assert.equal(validateField('whatsapp', '(31) 98593-1115'), undefined);
  assert.match(String(validateField('whatsapp', '')), /com DDD/);
  // Landline length — WhatsApp needs a mobile line.
  assert.match(String(validateField('whatsapp', '3132221111')), /válido/);
  assert.match(String(validateField('whatsapp', '(01) 98593-1115')), /DDD inválido/);
  assert.match(String(validateField('whatsapp', '(31) 88593-1115')), /começar com 9/);
});

test('requires a full name', () => {
  assert.equal(validateField('nome', 'Maria Silva'), undefined);
  assert.match(String(validateField('nome', '   ')), /nome completo/);
  assert.match(String(validateField('nome', 'Jo')), /muito curto/);
  assert.match(String(validateField('nome', 'Maria')), /sobrenome/);
});

test('requires a way to help from the known list', () => {
  assert.equal(validateField('ajuda', 'redes'), undefined);
  assert.match(String(validateField('ajuda', '')), /Escolha como/);
  // A hand-crafted POST cannot smuggle in a value the select never offered.
  assert.match(String(validateField('ajuda', 'hackeado')), /uma das opções/);
});

test('reports every missing field at once', () => {
  const errors = validateAll({ nome: '', whatsapp: '', cidade: '', ajuda: '' });
  assert.deepEqual(Object.keys(errors).sort(), ['ajuda', 'cidade', 'nome', 'whatsapp']);

  assert.deepEqual(
    validateAll({
      nome: 'Maria Silva',
      whatsapp: '(31) 98593-1115',
      cidade: 'Belo Horizonte',
      ajuda: 'rua',
    }),
    {},
  );
});

test('normalizes into spreadsheet-ready values', () => {
  const clean = normalize({
    nome: '  Maria   Aparecida  Silva ',
    whatsapp: '(31) 98593-1115',
    cidade: ' Belo  Horizonte ',
    // Stored as the human label so the sheet reads without a legend.
    ajuda: 'redes',
  });

  assert.deepEqual(clean, {
    nome: 'Maria Aparecida Silva',
    whatsapp: '31985931115',
    cidade: 'Belo Horizonte',
    ajuda: 'Divulgação nas redes',
  });
});
