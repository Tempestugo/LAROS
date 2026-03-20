const puppeteer = require('puppeteer');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
const twemojiParser = require('twemoji-parser');
const https = require('https');

const CSV_FILE     = 'dados.csv';
const FOLDER_FOTOS = 'fotos';
const FOLDER_ASSETS= 'assets'; // logo.png aqui
const FOLDER_OUTPUT= 'output';

// Endereço padrão usado quando a coluna 7 do CSV estiver vazia
const ENDERECO_PADRAO = 'R. Ártico, Jardim do Mar, SBC';

if (!fs.existsSync(FOLDER_OUTPUT)) fs.mkdirSync(FOLDER_OUTPUT);

function toDataUrl(filePath, mime = 'image/png') {
  if (!fs.existsSync(filePath)) return null;
  return `data:${mime};base64,${fs.readFileSync(filePath).toString('base64')}`;
}

function encontrarFoto(nome) {
  if (!fs.existsSync(FOLDER_FOTOS)) return null;
  const f = fs.readdirSync(FOLDER_FOTOS).find(f => f.toLowerCase().startsWith(nome.toLowerCase()));
  return f ? path.resolve(__dirname, FOLDER_FOTOS, f) : null;
}

// Cache para não baixar o mesmo emoji duas vezes
const emojiCache = {};

function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function emojiParaBase64(texto) {
  if (!texto) return texto;
  const entities = twemojiParser.parse(texto, { assetType: 'svg' });
  if (!entities.length) return texto;

  let resultado = texto;
  for (let i = entities.length - 1; i >= 0; i--) {
    const e = entities[i];
    if (!emojiCache[e.url]) {
      try {
        const buf = await fetchBuffer(e.url);
        emojiCache[e.url] = `data:image/svg+xml;base64,${buf.toString('base64')}`;
      } catch {
        emojiCache[e.url] = null;
      }
    }
    if (emojiCache[e.url]) {
      const img = `<img src="${emojiCache[e.url]}" style="height:1em;width:1em;vertical-align:-0.1em;display:inline-block;" alt="${e.text}">`;
      resultado = resultado.slice(0, e.indices[0]) + img + resultado.slice(e.indices[1]);
    }
  }
  return resultado;
}

/* ─────────────────────────────────────────────────────────────
   TEMPLATE A
   • Pill CREAM topo (título em cor principal)
   • Linha branca fina separadora
   • Pill COLORIDA topo (subtítulo branco)
   • Faixa diagonal colorida no rodapé cortando a foto
   • Logo "escapando" para cima da faixa
   • Endereço cream dentro da faixa
───────────────────────────────────────────────────────────── */
function templateA({ titulo, subtitulo, cta, cor, fotoUrl, logoUrl, endereco }) {
  return `<!DOCTYPE html><html><head>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@800;900&family=Nunito:wght@700;800&display=swap');
    @font-face {
      font-family: 'NotoEmoji';
      src: local('Noto Color Emoji');
    }
    * { margin:0; padding:0; box-sizing:border-box; font-family: 'Fraunces', 'NotoEmoji', serif; }
    html, body { width:1080px; height:1920px; overflow:hidden; position:relative; font-family:'Fraunces',serif; }
    .bg { position:absolute; inset:0; width:1080px; height:1920px; object-fit:cover; z-index:0; }
    .overlay {
      position:absolute; inset:0; z-index:1; pointer-events:none;
      background:
        linear-gradient(to bottom, rgba(0,0,0,0.30) 0%, rgba(0,0,0,0) 35%),
        linear-gradient(to top,    rgba(0,0,0,0.60) 0%, rgba(0,0,0,0) 35%);
    }
    .topo {
      position:absolute; z-index:2;
      top:190px; left:0; right:0; padding:0 72px;
      display:flex; flex-direction:column; align-items:flex-start;
    }
    .pill-1 {
      display:inline-block; background:#FFF8EE; color:${cor};
      font-family:'Fraunces',serif; font-size:78px; font-weight:900; line-height:1.2;
      padding:22px 56px; border-radius:999px; max-width:940px;
    }
    .linha-sep { width:100%; height:4px; background:rgba(255,255,255,0.80); margin:26px 0 0; }
    .meio {
      position:absolute; z-index:2;
      bottom:310px; left:0; right:0; padding:0 72px;
    }
    .pill-2 {
      display:inline-block; background:${cor}; color:#fff;
      font-family:'Nunito',sans-serif; font-size:52px; font-weight:700; line-height:1.25;
      padding:18px 50px; border-radius:999px; max-width:940px;
    }
    .faixa {
      position:absolute; bottom:0; left:0; right:0; z-index:3;
      background:${cor}; height:210px;
      clip-path:polygon(0 65px, 100% 0, 100% 210px, 0 210px);
      display:flex; align-items:flex-end; padding:0 88px 40px 220px;
    }
    .faixa-end {
      font-family:'Nunito',sans-serif; font-size:36px; font-weight:700;
      color:#FFF8EE; white-space:nowrap;
    }
    .logo-esc {
      position:absolute; bottom:145px; left:72px; z-index:4;
      height:108px; width:108px; object-fit:contain;
      filter:drop-shadow(0 4px 14px rgba(0,0,0,0.55));
    }
  </style>
</head><body>
  <img class="bg" src="${fotoUrl}" alt="">
  <div class="overlay"></div>
  <div class="topo">
    ${titulo    ? `<div class="pill-1">${titulo.replace(/\n/g,'<br>')}</div>` : ''}
    <div class="linha-sep"></div>
  </div>
  ${subtitulo ? `<div class="meio"><div class="pill-2">${subtitulo.replace(/\n/g,'<br>')}</div></div>` : ''}
  <div class="faixa">
    <span class="faixa-end">${endereco}</span>
  </div>
  ${logoUrl ? `<img class="logo-esc" src="${logoUrl}" alt="logo">` : ''}
</body></html>`;
}

/* ─────────────────────────────────────────────────────────────
   TEMPLATE B — Highlight colorido + card cream
   • JS reduz font-size até ≤2 linhas
   • Se última linha tem só 1 palavra, injeta <br> antes
     para garantir ≥2 palavras por linha
   • Sempre alinhado à esquerda
   • Logo no rodapé esquerdo
   • CTA badge no rodapé direito (se houver)
───────────────────────────────────────────────────────────── */
function templateB({ titulo, subtitulo, cta, cor, fotoUrl, logoUrl, endereco }) {
  const palavras = titulo ? titulo.replace(/\n/g, ' ').trim() : '';
  return `<!DOCTYPE html><html><head>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Lato:wght@700&display=swap');
    @font-face {
      font-family: 'NotoEmoji';
      src: local('Noto Color Emoji');
    }
    * { margin:0; padding:0; box-sizing:border-box; font-family: 'Fraunces', 'NotoEmoji', serif; }
    html, body { width:1080px; height:1920px; overflow:hidden; position:relative; font-family:'Playfair Display',serif; }
    .bg { position:absolute; inset:0; width:1080px; height:1920px; object-fit:cover; z-index:0; }
    .overlay {
      position:absolute; inset:0; z-index:1; pointer-events:none;
      background:linear-gradient(150deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.05) 50%, rgba(0,0,0,0) 65%, rgba(0,0,0,0.4) 100%);
    }
    .top { position:absolute; z-index:2; top:110px; left:72px; right:72px; display:flex; flex-direction:column; gap:8px; }
    .t-wrap { line-height:1; margin-bottom:4px; text-align:left; }
    .t-hl {
      display:inline; background:${cor}; color:#fff;
      font-size:96px; font-weight:900; line-height:1.55; padding:2px 32px;
      box-decoration-break:clone; -webkit-box-decoration-break:clone;
    }
    .linha-dec { width:280px; height:5px; background:#fff; border-radius:2px; opacity:0.8; margin:22px 0 0; }
    /* Subtítulo ancorado no centro-baixo, independente do título */
    .sub-wrap {
      position:absolute; z-index:2;
      bottom:310px; left:72px; right:72px;
    }
    .sub-card {
      display:inline-block; background:rgba(255,248,235,0.92); color:#2a1408;
      font-family:'Lato',sans-serif; font-size:50px; font-weight:700; line-height:1.4;
      padding:22px 40px; border-radius:8px 52px 52px 8px; max-width:880px;
    }
    .bottom { position:absolute; z-index:2; bottom:115px; right:72px; }
    .cta-badge {
      display:inline-block; background:#fff; color:#1a1a1a;
      font-family:'Lato',sans-serif; font-size:44px; font-weight:700;
      padding:20px 50px; border-radius:999px;
      filter:drop-shadow(0 6px 18px rgba(0,0,0,0.45));
    }
    .logo-rod {
      position:absolute; bottom:90px; left:72px; z-index:3;
      height:95px; object-fit:contain;
      filter:drop-shadow(0 3px 10px rgba(0,0,0,0.55));
    }
  </style>
</head><body>
  <img class="bg" src="${fotoUrl}" alt="">
  <div class="overlay"></div>
  <div class="top">
    <div class="t-wrap" id="tw">
      <span class="t-hl" id="hl">${palavras}</span>
    </div>
    <div class="linha-dec"></div>
  </div>
  ${subtitulo ? `<div class="sub-wrap"><div class="sub-card">${subtitulo.replace(/\n/g,'<br>')}</div></div>` : ''}
  <div class="bottom">${cta ? `<span class="cta-badge">${cta}</span>` : ''}</div>
  ${logoUrl ? `<img class="logo-rod" src="${logoUrl}" alt="logo">` : ''}
  <script>
  (function() {
    const hl    = document.getElementById('hl');
    const words = ${JSON.stringify(palavras)}.split(' ');
    const MAX   = 96, MIN = 60;

    function lineCount(fs) {
      hl.style.fontSize = fs + 'px';
      const lh = parseFloat(getComputedStyle(hl).lineHeight);
      return Math.round(hl.offsetHeight / lh);
    }

    // 1. Reduz font-size até caber em ≤2 linhas
    let fs = MAX;
    while (fs > MIN && lineCount(fs) > 2) fs -= 2;
    hl.style.fontSize = fs + 'px';

    // Se 1 linha ou poucas palavras, nada mais a fazer
    if (lineCount(fs) <= 1 || words.length <= 2) return;

    // 2. Descobre quantas palavras cabem na linha 1
    let wordsLine1 = 0;
    for (let i = 1; i <= words.length; i++) {
      hl.innerHTML = words.slice(0, i).join(' ');
      hl.style.fontSize = fs + 'px';
      const lh = parseFloat(getComputedStyle(hl).lineHeight);
      if (Math.round(hl.offsetHeight / lh) > 1) {
        wordsLine1 = i - 1;
        break;
      }
    }

    // Restaura texto completo
    hl.innerHTML = words.join(' ');

    // 3. Se última linha tem só 1 palavra, move a última da linha 1 para linha 2
    const wordsLastLine = words.length - wordsLine1;
    if (wordsLastLine === 1 && wordsLine1 >= 2) {
      const breakAt = wordsLine1 - 1;
      hl.innerHTML =
        words.slice(0, breakAt).join(' ') +
        '<br>' +
        words.slice(breakAt).join(' ');
    }
  })();
  </script>
</body></html>`;
}

/* ─────────────────────────────────────────────────────────────
   TEMPLATE C — Foto domina completamente
   • Gradiente pesado só na metade inferior
   • Título grande itálico cream com sombra densa
   • Pill colorida para subtítulo
   • SEM cta, SEM logo, SEM endereço, SEM rodapé
     (apenas título + subtítulo — dois elementos)
───────────────────────────────────────────────────────────── */
function templateC({ titulo, subtitulo, cta, cor, fotoUrl, logoUrl, endereco }) {
  return `<!DOCTYPE html><html><head>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,800;0,900;1,900&family=Nunito:wght@700;800&display=swap');
    @font-face {
      font-family: 'NotoEmoji';
      src: local('Noto Color Emoji');
    }
    * { margin:0; padding:0; box-sizing:border-box; font-family: 'Fraunces', 'NotoEmoji', serif; }
    html, body { width:1080px; height:1920px; overflow:hidden; position:relative; font-family:'Fraunces',serif; }
    .bg { position:absolute; inset:0; width:1080px; height:1920px; object-fit:cover; z-index:0; }
    .overlay {
      position:absolute; inset:0; z-index:1; pointer-events:none;
      background:
        linear-gradient(to bottom, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0) 30%),
        linear-gradient(to top,    rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.0) 58%);
    }
    .zona {
      position:absolute; bottom:0; left:0; right:0; z-index:2;
      padding:0 72px 95px;
      display:flex; flex-direction:column; align-items:flex-start; gap:22px;
    }
    .titulo-gde {
      font-family:'Fraunces',serif; font-size:108px; font-weight:900; font-style:italic;
      color:#FFF8EE; line-height:1.1;
      text-shadow: 0 4px 32px rgba(0,0,0,0.70), 0 2px 0 rgba(0,0,0,0.30);
    }
    .pill-sub {
      display:inline-block; background:${cor}; color:#fff;
      font-family:'Nunito',sans-serif; font-size:48px; font-weight:700;
      padding:16px 48px; border-radius:999px;
      box-shadow:0 4px 18px rgba(0,0,0,0.4);
    }
  </style>
</head><body>
  <img class="bg" src="${fotoUrl}" alt="">
  <div class="overlay"></div>
  <div class="zona">
    ${titulo    ? `<div class="titulo-gde">${titulo.replace(/\n/g,'<br>')}</div>` : ''}
    ${subtitulo ? `<div class="pill-sub">${subtitulo.replace(/\n/g,'<br>')}</div>` : ''}
  </div>
</body></html>`;
}

/* ─────────────────────────────────────────────────────────────
   TEMPLATE D — Centralizado, SEM logo
   • Pill CREAM topo (título, fonte maior)
   • Banner escurecido centralizado (subtítulo, fonte menor — 38px)
   • Foto respira no meio
   • CTA pill cream no rodapé (se houver)
   • Pill endereço cream no rodapé
───────────────────────────────────────────────────────────── */
function templateD({ titulo, subtitulo, cta, cor, fotoUrl, logoUrl, endereco }) {
  const r = parseInt(cor.slice(1,3),16);
  const g = parseInt(cor.slice(3,5),16);
  const b = parseInt(cor.slice(5,7),16);
  const cor2 = `rgb(${Math.round(r*.50)},${Math.round(g*.50)},${Math.round(b*.50)})`;

  return `<!DOCTYPE html><html><head>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@800;900&family=Nunito:wght@700;800&display=swap');
    @font-face {
      font-family: 'NotoEmoji';
      src: local('Noto Color Emoji');
    }
    * { margin:0; padding:0; box-sizing:border-box; font-family: 'Fraunces', 'NotoEmoji', serif; }
    html, body { width:1080px; height:1920px; overflow:hidden; position:relative; font-family:'Fraunces',serif; }
    .bg { position:absolute; inset:0; width:1080px; height:1920px; object-fit:cover; z-index:0; }
    .overlay {
      position:absolute; inset:0; z-index:1; pointer-events:none;
      background:
        linear-gradient(to bottom, rgba(0,0,0,0.30) 0%, rgba(0,0,0,0.0) 30%),
        linear-gradient(to top,    rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.0) 30%);
    }
    .top {
      position:absolute; z-index:2; top:90px; left:0; right:0; padding:0 70px;
      display:flex; flex-direction:column; align-items:center; gap:22px;
    }
    .pill-titulo {
      background:#FFF8EE; color:${cor}; font-family:'Fraunces',serif;
      font-size:88px; font-weight:900; line-height:1.2;
      padding:26px 64px; border-radius:999px; text-align:center; display:inline-block;
      filter:drop-shadow(0 4px 18px rgba(0,0,0,0.35));
    }
    .banner-sub-wrap { width:100%; display:flex; justify-content:center; }
    .banner-sub {
      background:${cor2}; color:#fff; font-family:'Nunito',sans-serif;
      font-size:38px; font-weight:700; line-height:1.3;
      padding:16px 52px; border-radius:18px; display:inline-block;
      max-width:940px; text-align:center;
    }
    .bottom {
      position:absolute; z-index:2; bottom:90px; left:0; right:0; padding:0 70px;
      display:flex; flex-direction:column; align-items:center; gap:20px;
    }
    .cta-pill {
      background:#FFF8EE; color:${cor}; font-family:'Fraunces',serif;
      font-size:80px; font-weight:900; padding:28px 80px; border-radius:999px;
      text-align:center; display:inline-block;
      filter:drop-shadow(0 4px 18px rgba(0,0,0,0.35));
    }
    .pill-end {
      display:inline-flex; align-items:center; gap:10px;
      background:#FFF8EE; color:#2a1408; font-family:'Nunito',sans-serif;
      font-size:34px; font-weight:700; padding:14px 44px; border-radius:999px;
    }
  </style>
</head><body>
  <img class="bg" src="${fotoUrl}" alt="">
  <div class="overlay"></div>
  <div class="top">
    ${titulo    ? `<div class="pill-titulo">${titulo.replace(/\n/g,'<br>')}</div>` : ''}
    ${subtitulo ? `<div class="banner-sub-wrap"><div class="banner-sub">${subtitulo.replace(/\n/g,'<br>')}</div></div>` : ''}
  </div>
  <div class="bottom">
    ${cta ? `<span class="cta-pill">${cta}</span>` : ''}
    <span class="pill-end">${endereco}</span>
  </div>
</body></html>`;
}

/* ─────────────────────────────────────────────────────────────
   TEMPLATE E — Interativo / Enquete
   • Overlay bege translúcido sobre a foto
   • Pill CREAM (subtítulo = contexto, sem ✦)
   • Card COLORIDO centralizado (título = pergunta)
   • Linha branca fina abaixo do card
   • Logo grande centralizada no rodapé
───────────────────────────────────────────────────────────── */
function templateE({ titulo, subtitulo, cta, cor, fotoUrl, logoUrl, endereco }) {
  return `<!DOCTYPE html><html><head>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@800;900&family=Nunito:wght@700;800&display=swap');
    @font-face {
      font-family: 'NotoEmoji';
      src: local('Noto Color Emoji');
    }
    * { margin:0; padding:0; box-sizing:border-box; font-family: 'Fraunces', 'NotoEmoji', serif; }
    html, body { width:1080px; height:1920px; overflow:hidden; position:relative; font-family:'Fraunces',serif; }
    .bg { position:absolute; inset:0; width:1080px; height:1920px; object-fit:cover; z-index:0; }
    .overlay { position:absolute; inset:0; z-index:1; background:rgba(240,200,150,0.72); }
    .content {
      position:absolute; z-index:2;
      top:320px; left:0; right:0;
      display:flex; flex-direction:column; align-items:center;
      padding:0 80px; gap:0;
    }
    .pill-ctx {
      display:inline-block; background:#FFF8EE; color:${cor};
      font-family:'Nunito',sans-serif; font-size:44px; font-weight:700;
      padding:16px 56px; border-radius:999px; text-align:center; margin-bottom:30px;
    }
    .card-titulo {
      width:100%; background:${cor}; color:#fff;
      font-size:74px; font-weight:900; line-height:1.25;
      padding:48px 60px; border-radius:48px; text-align:center;
    }
    .linha { width:80%; height:3px; background:rgba(255,255,255,0.7); margin-top:48px; }
    .logo-centro {
      position:absolute; bottom:110px; left:50%; transform:translateX(-50%); z-index:3;
      height:155px; object-fit:contain;
      filter:drop-shadow(0 4px 14px rgba(0,0,0,0.18));
    }
  </style>
</head><body>
  <img class="bg" src="${fotoUrl}" alt="">
  <div class="overlay"></div>
  <div class="content">
    ${subtitulo ? `<div class="pill-ctx">${subtitulo.replace(/\n/g,' ')}</div>` : ''}
    ${titulo    ? `<div class="card-titulo">${titulo.replace(/\n/g,'<br>')}</div>` : ''}
    <div class="linha"></div>
  </div>
  ${logoUrl ? `<img class="logo-centro" src="${logoUrl}" alt="logo">` : ''}
</body></html>`;
}

/* ─────────────────────────────────────────────────────────────
   TEMPLATE F — Manchete (Capa de revista)
───────────────────────────────────────────────────────────── */
function templateF({ titulo, subtitulo, cta, cor, fotoUrl, logoUrl, endereco }) {
  return `<!DOCTYPE html><html><head>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,900&family=Nunito:wght@700;800&display=swap');
    @font-face {
      font-family: 'NotoEmoji';
      src: local('Noto Color Emoji');
    }
    * { margin:0; padding:0; box-sizing:border-box; font-family: 'Playfair Display', 'NotoEmoji', serif; }
    html, body { width:1080px; height:1920px; overflow:hidden; position:relative; }
    .bg { position:absolute; inset:0; width:1080px; height:1920px; object-fit:cover; z-index:0; }
    .overlay {
      position:absolute; inset:0; z-index:1; pointer-events:none;
      background: linear-gradient(to bottom, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0) 55%);
    }
    .topo {
      position:absolute; top:100px; left:0; right:0; padding:0 72px; z-index:2;
    }
    .titulo-gde {
      font-family:'Playfair Display',serif; font-size:110px; font-weight:900; font-style:italic;
      color:#FFF8EE; line-height:1.05;
      text-shadow: 0 4px 40px rgba(0,0,0,0.8), 0 2px 0 rgba(0,0,0,0.4);
    }
    .faixa {
      position:absolute; bottom:0; left:0; right:0; height:420px; z-index:3;
      background:#FFF8EE;
      clip-path:polygon(0 40px, 100% 0, 100% 100%, 0 100%);
      display:flex; flex-direction:column; justify-content:center;
      padding:80px 72px 80px;
    }
    .subtitulo {
      font-family:'Nunito',sans-serif; font-size:48px; font-weight:700; color:#2a1408;
      margin-bottom:24px;
    }
    .cta-pill {
      font-family:'Nunito',sans-serif; font-size:44px; font-weight:800;
      background:${cor}; color:#fff;
      border-radius:999px; padding:16px 48px; display:inline-block;
    }
    .logo-rod {
      position:absolute; bottom:80px; right:72px;
      height:80px; object-fit:contain;
    }
  </style>
</head><body>
  <img class="bg" src="${fotoUrl}" alt="">
  <div class="overlay"></div>
  <div class="topo">
    ${titulo ? `<div class="titulo-gde">${titulo.replace(/\n/g,'<br>')}</div>` : ''}
  </div>
  <div class="faixa">
    ${subtitulo ? `<div class="subtitulo">${subtitulo.replace(/\n/g,'<br>')}</div>` : ''}
    <div>
      ${cta ? `<span class="cta-pill">${cta}</span>` : ''}
    </div>
    ${logoUrl ? `<img class="logo-rod" src="${logoUrl}" alt="logo">` : ''}
  </div>
</body></html>`;
}

/* ─────────────────────────────────────────────────────────────
   TEMPLATE G — Noite (Dark mode total)
───────────────────────────────────────────────────────────── */
function templateG({ titulo, subtitulo, cta, cor, fotoUrl, logoUrl, endereco }) {
  return `<!DOCTYPE html><html><head>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@800;900&family=Nunito:wght@700;800&display=swap');
    @font-face {
      font-family: 'NotoEmoji';
      src: local('Noto Color Emoji');
    }
    * { margin:0; padding:0; box-sizing:border-box; font-family: 'Fraunces', 'NotoEmoji', serif; }
    html, body { width:1080px; height:1920px; overflow:hidden; position:relative; font-family:'Fraunces',serif; }
    .bg { position:absolute; inset:0; width:1080px; height:1920px; object-fit:cover; z-index:0; }
    .overlay {
      position:absolute; inset:0; z-index:1; pointer-events:none;
      background: rgba(0,0,0,0.68);
    }
    .content {
      position:absolute; top:50%; transform:translateY(-50%); left:0; right:0; z-index:2;
      padding:0 80px;
    }
    .linha-dec {
      width:80px; height:4px; background:${cor}; margin-bottom:32px;
    }
    .titulo {
      font-size:96px; font-weight:900; color:#FFF8EE; line-height:1.15; text-align:left;
      margin-bottom:28px;
    }
    .subtitulo {
      font-family:'Nunito',sans-serif; font-size:48px; font-weight:700;
      color:rgba(255,248,238,0.75); text-align:left;
      margin-bottom:48px;
    }
    .cta-pill {
      font-family:'Nunito',sans-serif; font-size:46px; font-weight:800;
      background:${cor}; color:#fff;
      border-radius:999px; padding:18px 56px; display:inline-block;
    }
    .rodape {
      position:absolute; bottom:90px; left:0; right:0; z-index:2;
      padding:0 80px 0 72px;
      display:flex; justify-content:space-between; align-items:center;
    }
    .logo-esq {
      height:88px; object-fit:contain;
    }
    .end-pill {
      font-family:'Nunito',sans-serif; font-size:34px; font-weight:700;
      background:rgba(255,248,238,0.15); color:#FFF8EE;
      border-radius:999px; padding:12px 40px;
      border:1px solid rgba(255,248,238,0.3);
    }
  </style>
</head><body>
  <img class="bg" src="${fotoUrl}" alt="">
  <div class="overlay"></div>
  <div class="content">
    <div class="linha-dec"></div>
    ${titulo ? `<div class="titulo">${titulo.replace(/\n/g,'<br>')}</div>` : ''}
    ${subtitulo ? `<div class="subtitulo">${subtitulo.replace(/\n/g,'<br>')}</div>` : ''}
    ${cta ? `<div class="cta-pill">${cta}</div>` : ''}
  </div>
  <div class="rodape">
    ${logoUrl ? `<img class="logo-esq" src="${logoUrl}" alt="logo">` : '<div></div>'}
    <div class="end-pill">${endereco}</div>
  </div>
</body></html>`;
}

/* ─────────────────────────────────────────────────────────────
   TEMPLATE H — Vitrine (Produto centralizado)
───────────────────────────────────────────────────────────── */
function templateH({ titulo, subtitulo, cta, cor, fotoUrl, logoUrl, endereco }) {
  return `<!DOCTYPE html><html><head>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@800;900&family=Nunito:wght@700;800&display=swap');
    @font-face {
      font-family: 'NotoEmoji';
      src: local('Noto Color Emoji');
    }
    * { margin:0; padding:0; box-sizing:border-box; font-family: 'Fraunces', 'NotoEmoji', serif; }
    html, body { width:1080px; height:1920px; overflow:hidden; position:relative; background:${cor}; font-family:'Fraunces',serif; }
    .bg {
      position:absolute; left:50%; transform:translateX(-50%);
      top:280px; width:860px; height:860px; object-fit:cover;
      border-radius:24px; box-shadow:0 24px 80px rgba(0,0,0,0.5); z-index:1;
    }
    .topo {
      position:absolute; top:100px; left:0; right:0; padding:0 72px; z-index:2;
    }
    .titulo {
      font-size:72px; font-weight:900; color:#FFF8EE; text-align:center; width:100%;
    }
    .rodape {
      position:absolute; bottom:0; left:0; right:0; height:400px; z-index:2;
      background:rgba(0,0,0,0.25);
      display:flex; flex-direction:column; align-items:center;
      padding-top:48px;
    }
    .subtitulo {
      font-family:'Nunito',sans-serif; font-size:46px; font-weight:700; color:#FFF8EE; text-align:center;
    }
    .cta-pill {
      background:#FFF8EE; color:${cor}; font-family:'Fraunces',serif; font-size:64px; font-weight:900;
      border-radius:999px; padding:24px 72px; margin-top:28px;
      display:inline-block; text-align:center;
    }
    .logo-centro {
      height:80px; margin-top:24px; object-fit:contain;
    }
  </style>
</head><body>
  <img class="bg" src="${fotoUrl}" alt="">
  <div class="topo">
    ${titulo ? `<div class="titulo">${titulo.replace(/\n/g,'<br>')}</div>` : ''}
  </div>
  <div class="rodape">
    ${subtitulo ? `<div class="subtitulo">${subtitulo.replace(/\n/g,'<br>')}</div>` : ''}
    ${cta ? `<div class="cta-pill">${cta}</div>` : ''}
    ${logoUrl ? `<img class="logo-centro" src="${logoUrl}" alt="logo">` : ''}
  </div>
</body></html>`;
}

/* ── MAPA ── */
const TEMPLATES = { A: templateA, B: templateB, C: templateC, D: templateD, E: templateE, F: templateF, G: templateG, H: templateH };

/* ── CSV ──
   Colunas: 0:Dia | 1:Titulo | 2:Subtitulo | 3:CTA | 4:Foto | 5:Cor | 6:Template | 7:Endereco (opcional)
   Se coluna 7 ausente ou vazia, usa ENDERECO_PADRAO.
*/
function lerCSV(separator) {
  return new Promise((resolve) => {
    const stories = [];
    fs.createReadStream(CSV_FILE)
      .pipe(csv({ separator }))
      .on('data', (row) => {
        const v = Object.values(row);
        const foto = v[4] ? v[4].trim() : '';
        if (!foto || foto === 'Nome_Foto') return;
        stories.push({
          titulo:    v[1] ? v[1].trim() : '',
          subtitulo: v[2] ? v[2].trim() : '',
          cta:       v[3] ? v[3].trim() : '',
          foto,
          cor:       v[5] ? v[5].trim() : '#C47B2B',
          template:  v[6] ? v[6].trim().toUpperCase() : 'A',
          endereco:  v[7] && v[7].trim() ? v[7].trim() : ENDERECO_PADRAO,
        });
      })
      .on('end', () => resolve(stories));
  });
}

async function gerarImagens(lista) {
  const logoPath = path.resolve(__dirname, FOLDER_ASSETS, 'logo.jpg');
  const logoUrl  = toDataUrl(logoPath, 'image/jpg');
  if (!logoUrl) console.log('⚠️  /assets/logo.jpg não encontrada — stories sem logo.');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--allow-running-insecure-content']
  });
  const page    = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1920 });

  for (let i = 0; i < lista.length; i++) {
    const item = lista[i];
    const fotoPath = encontrarFoto(item.foto);
    if (!fotoPath) { console.log(`❌ [${i+1}] Foto não encontrada: ${item.foto}`); continue; }

    const mime    = fotoPath.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
    const fotoUrl = toDataUrl(fotoPath, mime);
    const fn      = TEMPLATES[item.template] || templateA;
    const html    = fn({
      titulo:    await emojiParaBase64(item.titulo),
      subtitulo: await emojiParaBase64(item.subtitulo),
      cta:       await emojiParaBase64(item.cta),
      endereco:  await emojiParaBase64(item.endereco),
      cor:       item.cor,
      fotoUrl,
      logoUrl,
    });

    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));

    const outFile = path.join(FOLDER_OUTPUT, `story_${String(i+1).padStart(2,'0')}_T${item.template}.png`);
    await page.screenshot({ path: outFile });
    console.log(`📸 [${i+1}/${lista.length}] ${item.foto} → T${item.template} | ${item.cor}`);
  }

  await browser.close();
  console.log('\n🚀 PRONTO — pasta /output');
}

async function main() {
  if (!fs.existsSync(CSV_FILE)) { console.error(`❌ ${CSV_FILE} não encontrado.`); return; }
  let stories = await lerCSV(';');
  if (!stories.length) { console.log('⚠️  Tentando vírgula...'); stories = await lerCSV(','); }
  if (!stories.length) { console.error('❌ CSV sem linhas válidas.'); return; }
  console.log(`📋 ${stories.length} stories encontradas...`);
  await gerarImagens(stories);
}

main();