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
Data/Hora | Nome | WhatsApp | Cidade | Bairro | Como quer ajudar | utm_source | utm_medium | utm_campaign | utm_content | utm_term | Referrer
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

As fontes originais ficam fora do build e **não** vão para produção. Rode os
scripts só quando trocar foto ou fonte; a saída é versionada.

### Fotos

`scripts/prepare-assets.mjs` reduz as 8 fotos para o maior tamanho que o layout
realmente pinta, remove EXIF e gera o card social:

```bash
node scripts/prepare-assets.mjs
```

Origem: `Fotos Biancardine 2026/` → saída: `assets/`, `public/textures/`, `public/og.jpg`.

As fotos foram identificadas por EXIF (câmera + timestamp) a partir do arquivo de
design:

| Design | Original |
| --- | --- |
| `hero-palco` | `IMG_6672.JPG` |
| `grupo` | `Renova br/MMZ07112.jpeg` |
| `manifesto` | `FT_06483.jpeg` |
| `retrato-novo` | `MATHEUS 121.jpeg` |
| `fala-microfone` | `@dianematosfotografa29.jpeg` |
| `evento1` | `Renova br/ANM_8387.jpeg` |
| `evento2` | `Renova br/R6A_6354.jpeg` |
| `bh-predio` | `DSC_1792.jpeg` |

Créditos nos metadados originais: Marco Torelli, Arthur Menescal, @dianematosfotografa.

### Fontes

Neo Sans Std (identidade visual) convertida de OTF para WOFF2 com subset
Latin + acentuação pt-BR. Requer `pip install fonttools brotli`:

```bash
bash scripts/build-fonts.sh
```

| Arquivo | Peso | Tamanho |
| --- | --- | --- |
| `neo-sans-400.woff2` | 400 | 15 KB |
| `neo-sans-500.woff2` | 500–600 | 12 KB |
| `neo-sans-700.woff2` | 700 | 13 KB |
| `neo-sans-900.woff2` | 800–900 | 13 KB |
| `neo-sans-900-italic.woff2` | logotipo | 2 KB |

O italic carrega só os 14 glifos de "MATHEUS BIANCARDINE" — daí os 2 KB.

> **Licença:** Neo Sans Std é uma fonte comercial. Confirme que a campanha tem
> licença de *webfont* antes de publicar. Se não tiver, troque por Saira
> (`next/font/google`), que foi a substituta usada no arquivo de design.

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
| HTML | 14 KB |
| CSS | 6,5 KB |
| JS | 177 KB |
| Fontes (3 pré-carregadas) | 30 KB |
| **Total crítico** | **~227 KB** |

Imagens sob demanda: hero em AVIF vai de **18 KB** (mobile, 640w) a **36 KB**
(desktop, 1200w).

**Sobre os 177 KB de JS:** medindo uma página vazia no mesmo projeto, o piso do
Next 16 + React 19 é **165 KB**. Ou seja, todo o código desta landing page —
formulário, validação, máscara, CTA flutuante, `next/image` — soma ~12 KB. Os
165 KB são o framework e não têm como sair enquanto o projeto for Next.js. Se
esse número for inaceitável, o caminho é trocar de stack (Astro ou HTML estático
levariam isso a ~5 KB), não otimizar o app.

### Por que webpack no build

`next build` usa Turbopack por padrão. Medindo os dois neste projeto, o webpack
gerou **17 KB a menos** de JS (177 KB contra 194 KB) e menos chunks. O `dev`
continua no Turbopack pelo HMR. Para comparar de novo:
`npm run build:turbopack`.

---

## Divergências resolvidas

**Data da eleição.** O arquivo de design dizia 14/10/2026 e o brief estratégico,
04/10/2026. O contador usa **04/10/2026**, que é o 1º turno oficial das eleições
gerais de 2026 (domingo). Fica em `lib/site.ts`.

**"Pré-candidato".** O `logo.png` da pasta traz "PRÉ-CANDIDATO A DEPUTADO
FEDERAL". O brief pede explicitamente remover o "pré", então o logotipo é
renderizado como texto (Neo Sans Black Italic), como no arquivo de design.

**Link do grupo de WhatsApp.** O design aponta para `wa.me/5531985931115`, que é
uma conversa direta, não um convite de grupo. Configure
`NEXT_PUBLIC_WHATSAPP_GROUP_URL` com o link real do
`chat.whatsapp.com`; sem isso, o fallback é a conversa direta.

---

## Estrutura

```
app/
  layout.tsx          metadata, preload de fontes
  page.tsx            home (JSON-LD, composição das seções)
  actions.ts          server action do cadastro
  obrigado/           thank you page (noindex, fora do fluxo — ver Notas)
  globals.css         @font-face, tokens, reset, primitivos
components/           uma seção por arquivo + CSS Module
lib/
  sheets.ts           OAuth2 service account + append (node:crypto)
  validation.ts       regras compartilhadas cliente/servidor
  site.ts             links, datas, constantes da campanha
assets/               fotos otimizadas (import estático)
public/
  fonts/              WOFF2 subsetados
  textures/           camadas decorativas (avif + jpg)
scripts/              pipelines de fotos e fontes
```

---

## Notas

**Confirmação do cadastro.** A server action não redireciona mais: em caso de
sucesso ela devolve `status: 'success'` e o `SupporterForm` abre o
`SuccessModal` por cima da landing. A rota `/obrigado` continua no repositório,
mas nada mais aponta para ela — pode ser removida junto com o `disallow` em
`app/robots.ts`.

`npm audit` reporta 3 advisories de severidade alta em `postcss` e `sharp`
**dentro do próprio Next 16.2.12**. `npm audit fix --force` "resolve" fazendo
downgrade para o Next 14, o que é pior. São dependências de build, alimentadas
apenas por CSS e imagens do próprio repositório — sem entrada controlada por
terceiros. Some quando a Next publicar o patch.
