# LP Militância — Matheus Biancardine

Landing page de captação de apoiadores e militância digital. Cada cadastro vira
uma linha numa planilha do Google Sheets.

Next.js 16 (App Router) · React 19 · TypeScript · CSS Modules · zero dependências
de runtime além do próprio framework.

---

## Rodando localmente

```bash
npm install
cp .env.example .env.local   # preencha as credenciais (veja abaixo)
npm run dev                  # http://localhost:3000
```

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento (Turbopack) |
| `npm run build` | Build de produção (webpack — veja "Por que webpack") |
| `npm start` | Sobe o build de produção |
| `npm test` | Testes de validação e do cliente do Sheets |
| `npm run typecheck` | `tsc --noEmit` |

---

## Configurando o Google Sheets

O formulário grava via service account, direto da server action — as credenciais
nunca chegam ao browser.

**1. Crie a planilha.** A primeira aba deve se chamar `Apoiadores` (ou ajuste
`SHEETS_TAB_NAME`). Sugestão de cabeçalho na linha 1, na ordem em que as colunas
são gravadas:

```
Data/Hora | Nome | WhatsApp | Cidade | Como quer ajudar | utm_source | utm_medium | utm_campaign | utm_content | utm_term | Referrer
```

**2. Crie a service account.**

1. [console.cloud.google.com](https://console.cloud.google.com) → crie ou escolha um projeto
2. **APIs & Services → Library** → habilite **Google Sheets API**
3. **APIs & Services → Credentials → Create credentials → Service account**
4. Na service account criada: **Keys → Add key → Create new key → JSON**

**3. Dê acesso à planilha.** Copie o `client_email` do JSON e compartilhe a
planilha com esse endereço como **Editor**. Sem isso a API responde 403.

**4. Preencha as variáveis** (`.env.local` local, *Environment Variables* na
Vercel):

```bash
GOOGLE_SA_EMAIL="...@....iam.gserviceaccount.com"   # client_email do JSON
GOOGLE_SA_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEv...\n-----END PRIVATE KEY-----\n"
SHEETS_SPREADSHEET_ID="1AbC..."                     # da URL: /spreadsheets/d/<ISTO>/edit
SHEETS_TAB_NAME="Apoiadores"
NEXT_PUBLIC_SITE_URL="https://seudominio.com.br"
NEXT_PUBLIC_WHATSAPP_GROUP_URL="https://chat.whatsapp.com/..."
```

> A `private_key` vai **entre aspas e com os `\n` literais**, exatamente como
> aparece no JSON. `lib/sheets.ts` normaliza os dois formatos.

---

## Deploy na Vercel

1. Suba o repositório e importe o projeto na Vercel (framework detectado sozinho)
2. Cadastre as variáveis acima em *Settings → Environment Variables*
3. Deploy

`.vercelignore` mantém as fotos originais e os OTFs fora do upload — só os
assets já otimizados vão para produção.

---

## Pipeline de assets

As artes originais ficam em `assets/fundos/` e **não** vão para produção. Rode o
script só quando trocar arte; a saída é versionada.

```bash
node scripts/prepare-assets.mjs
```

`assets/fundos/` → `public/art/` + `public/og.jpg`.

Os seis quadros entregues se dividem em dois grupos:

| Bloco | Uso |
| --- | --- |
| BLOCO1 / 1m | Arte da faixa de doação (logo + apoiadores) |
| BLOCO2 / 2m | Arte do hero (Matheus ao microfone) |
| BLOCO5 / 5m | Arte do manifesto |
| BLOCO3, 4, 6 | Gradientes chapados — **refeitos em CSS**, não viram imagem |

Cada arte sai em AVIF + WebP + JPEG, nas versões desktop (1920x1080) e mobile
(600x899), consumidas por um `<picture>` com `media="(min-width: 48rem)"`. O
navegador baixa **exatamente um arquivo** por seção, direto do CDN, sem passar
pelo otimizador de imagem.

| | AVIF baixado |
| --- | --- |
| Desktop (3 artes) | 104 KB |
| Mobile (3 artes) | 37 KB |

> **Resolução do mobile:** os cortes verticais entregues têm 600px de largura.
> Num aparelho de 390px com DPR 3 isso fica levemente suave. Se quiser nitidez
> total, exporte os `BLOCO*m` a 1200x1798 e rode o script de novo — nada mais
> muda.

### Fontes

Barlow + Barlow Condensed, o mesmo par da referência, via `next/font/google`.
Diferente da referência, que busca no `fonts.googleapis.com` em runtime, aqui
elas são baixadas no build e servidas do próprio domínio — sem DNS nem conexão
externa no caminho crítico.

Só os pesos usados entram no bundle: Barlow 400/500/600/700 e Barlow Condensed
**700** (todo elemento display é bold). São 5 arquivos, 78 KB.

---

## Decisões de performance

**Praticamente tudo é Server Component.** Só dois componentes rodam no cliente:
o formulário (máscara, validação instantânea, estado de envio) e o CTA flutuante
do mobile. Todo o resto é HTML estático.

**O formulário funciona sem JavaScript.** Ele é uma server action com
`useActionState`. Se o JS não carregar, o submit ainda grava na planilha e
redireciona — a validação do servidor é a autoritativa de qualquer jeito.

**Imagens em duas trilhas.** As fotos de conteúdo usam `next/image` com import
estático (dimensões intrínsecas, blur placeholder, AVIF/WebP, sem CLS). As quatro
camadas decorativas — texturas a 8–20% de opacidade — não passam por `next/image`:
são um arquivo por formato servido via `image-set()` no CSS. Sem srcset, sem
otimizador, sem JS.

**Fontes self-hosted e pré-carregadas.** Zero conexão a terceiros no caminho
crítico. Os três pesos acima da dobra usam `ReactDOM.preload`; os outros dois
entram com `font-display: swap`.

**Anti-spam sem CAPTCHA.** Honeypot + tempo mínimo de preenchimento. Não custa
requisição nem kilobyte ao visitante, e não há reCAPTCHA para carregar.

**Cache.** A home é estática com `revalidate = 3600` (o único valor que muda é o
contador de dias). Fontes com `immutable`.

### Peso real da home

| | gzip |
| --- | --- |
| HTML | 8,5 KB |
| CSS | 2,2 KB |
| JS | 169 KB |
| Fontes (5 woff2) | 78 KB |
| **Total crítico** | **~251 KB** |

Mais as artes: **104 KB** no desktop, **37 KB** no mobile.

Para comparação, a referência baixa 449 KB só no `BLOCO1.webp`, porque nela o
texto é pixel dentro da imagem.

**Sobre os 169 KB de JS:** medindo uma página vazia no mesmo projeto, o piso do
Next 16 + React 19 é **165 KB**. Ou seja, todo o código desta landing page —
formulário, validação, máscara, CTA flutuante — soma ~4 KB. Os 165 KB são o
framework e não têm como sair enquanto o projeto for Next.js. Se esse número for
inaceitável, o caminho é trocar de stack (Astro ou HTML estático levariam isso a
~5 KB), não otimizar o app.

### Por que webpack no build

`next build` usa Turbopack por padrão. Medindo os dois neste projeto, o webpack
gerou **17 KB a menos** de JS (177 KB contra 194 KB) e menos chunks. O `dev`
continua no Turbopack pelo HMR. Para comparar de novo:
`npm run build:turbopack`.

---

## Divergências resolvidas

**Texto da arte virou HTML.** Na referência, os títulos dos blocos 1, 2 e 5 —
e até o botão "QUERO DOAR" — são pixels dentro do `.webp`; o DOM só tem um `<a>`
transparente por cima. As artes desta pasta são as mesmas **sem** texto, então
aqui o texto é HTML de verdade: indexável, selecionável, acompanha o zoom do
usuário e fica nítido em qualquer tela. O resultado visual é o mesmo.

**Campos do formulário.** A referência usa 4 campos, sem bairro — foi o que
seguimos. A única diferença: "Como você quer ajudar?" é um `<select>` com as 4
opções do brief (Divulgação nas redes / Material de rua e bandeira / Organizar
lideranças / Doação) em vez de campo de texto livre. Visualmente é a mesma pill;
a diferença é que a resposta chega segmentável na planilha, que é justamente o
objetivo declarado no brief. Trocar por texto livre é mudar uma linha em
`lib/validation.ts`.

**Confirmação em modal, não em redirect.** Ao salvar, a server action devolve
`status: 'success'` e o `SupporterForm` abre o `SuccessModal` sobre a landing
page — o visitante não perde a posição de scroll nem os UTMs da URL. O modal tem
foco preso, fecha no Escape/backdrop e trava o scroll do body; como ele é
renderizado a partir do markup do servidor, aparece também num envio sem
JavaScript (o `<dialog>` nativo não faria isso, por ficar invisível até
`showModal()`).

A página `/obrigado` continua existindo (noindex) para link direto, mas **não é
mais alcançada pelo fluxo do formulário** — a conversão acontece sem trocar de
URL. Por isso o evento é disparado no lugar do pageview; veja abaixo.

### Conversão para o time de tráfego

Ao abrir o modal de sucesso, `lib/analytics.ts` empilha um único evento:

```js
window.dataLayer.push({ event: 'cadastro_apoiador' })
```

Configure o gatilho do GTM em **Custom Event → `cadastro_apoiador`** e pendure
nele as tags de Google Ads / Meta / GA4. Não é preciso instalar nada no código:
o push acontece mesmo antes do container carregar (o GTM foi desenhado para ler
a fila do `dataLayer` quando inicializa), então basta colar o container.

Três decisões que valem saber:

- **Um sinal só.** O código não chama `gtag()` nem `fbq()` diretamente. Se
  chamasse, e o container também disparasse no mesmo evento, cada lead contaria
  duas vezes.
- **Sem dado pessoal no payload.** O `dataLayer` é legível por qualquer tag da
  página; nome e telefone ficam só na planilha.
- **Cadastro repetido não conta.** Quem já está na planilha recebe
  `status: 'duplicate'` e nenhum evento é disparado — o número de conversões
  bate com o número de linhas novas.

### Cadastro duplicado

Antes de gravar, a action lê a coluna C (WhatsApp) da aba e compara **só os
dígitos** — a planilha guarda o número como valor numérico e uma linha digitada
à mão pode vir com máscara. Se já existir, nada é gravado e o modal abre na
variante "você já está na lista".

A checagem **falha para o lado seguro**: se a leitura der erro, o cadastro é
gravado assim mesmo. Linha duplicada se limpa depois; apoiador perdido numa
instabilidade do Google, não.

Sobra uma janela de corrida de poucos milissegundos: dois envios simultâneos do
mesmo número podem passar os dois. Fechar isso exigiria trancar a planilha a
cada submit, o que custa mais do que o problema — na prática o caso real é o
duplo clique, e esse a checagem pega.

### Reset após o envio

Confirmado o cadastro, o formulário atrás do modal é limpo e os campos ocultos
de atribuição (UTMs, referrer, `openedAt`) são reescritos — `form.reset()` também
zera os ocultos, então eles são repovoados logo depois. É o comportamento certo
para o uso em rua: o mesmo celular passa de mão em mão e a próxima pessoa começa
do zero, sem editar a resposta de quem veio antes.

O `openedAt` **não** é reescrito quando o envio volta inválido: reiniciar a
janela ali faria uma correção rápida parecer robô e ser descartada em silêncio.

**Data da eleição.** O arquivo de design dizia 14/10/2026 e o brief estratégico,
04/10/2026. O contador usa **04/10/2026**, que é o 1º turno oficial das eleições
gerais de 2026 (domingo) e o que a referência mostra. Fica em `lib/site.ts`.

**Tipografia.** O PDF pede Neo Sans; a referência usa Barlow. Como a instrução
foi priorizar a referência, o site está em Barlow — o que também elimina a
questão de licença de webfont da Neo Sans.

**Link do grupo de WhatsApp.** Configure `NEXT_PUBLIC_WHATSAPP_GROUP_URL` com o
convite real do `chat.whatsapp.com`; sem isso, o fallback é a conversa direta.

## Estrutura

```
app/
  layout.tsx          metadata + next/font
  page.tsx            home (JSON-LD, composição dos blocos)
  actions.ts          server action do cadastro
  obrigado/           thank you page (noindex)
  globals.css         tokens, reset, primitivos (.shell .btn .eyebrow)
components/
  ArtBackdrop         <picture> art-directed das artes de bloco
  DonationBlock       faixa "seja um apoiador" + bloco 1
  Hero                bloco 2
  Countdown           bloco 3
  SignupSection       bloco 4 + SupporterForm
  Manifesto           bloco 5
  SiteFooter          bloco 6
  FloatingCta         CTA fixo do mobile
lib/
  sheets.ts           OAuth2 service account + append/read (node:crypto)
  validation.ts       regras compartilhadas cliente/servidor
  analytics.ts        push de conversão no dataLayer
  site.ts             links, datas, constantes da campanha
assets/fundos/        artes originais (fora do deploy)
public/art/           artes otimizadas (avif/webp/jpg, desktop+mobile)
scripts/              pipeline de assets
```

## Notas

**Rota `/obrigado`.** Continua no repositório, mas nada aponta para ela desde que
a confirmação virou modal. Assim que o gatilho `cadastro_apoiador` estiver no
GTM, pode ser removida junto com o `disallow` em `app/robots.ts`.

`npm audit` reporta 3 advisories de severidade alta em `postcss` e `sharp`
**dentro do próprio Next 16.2.12**. `npm audit fix --force` "resolve" fazendo
downgrade para o Next 14, o que é pior. São dependências de build, alimentadas
apenas por CSS e imagens do próprio repositório — sem entrada controlada por
terceiros. Some quando a Next publicar o patch.
