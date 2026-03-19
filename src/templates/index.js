export function templateA({ titulo, subtitulo, cta, cor, fotoUrl, logoUrl, endereco }) {
  return `<!DOCTYPE html><html><head>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@800;900&family=Nunito:wght@700;800&display=swap');
    * { margin:0; padding:0; box-sizing:border-box; }
    html, body { width:1080px; height:1920px; overflow:hidden; position:relative; font-family:'Fraunces',serif; }
    .bg { position:absolute; inset:0; width:1080px; height:1920px; z-index:0; }
    .overlay {
      position:absolute; inset:0; z-index:1; pointer-events:none;
      background: linear-gradient(to bottom, rgba(0,0,0,0.30) 0%, rgba(0,0,0,0) 35%), linear-gradient(to top, rgba(0,0,0,0.60) 0%, rgba(0,0,0,0) 35%);
    }
    .topo { position:absolute; z-index:2; top:190px; left:0; right:0; padding:0 72px; display:flex; flex-direction:column; align-items:flex-start; }
    .pill-1 { display:inline-block; background:#FFF8EE; color:${cor}; font-family:'Fraunces',serif; font-size:78px; font-weight:900; line-height:1.2; padding:22px 56px; border-radius:999px; max-width:940px; }
    .linha-sep { width:100%; height:4px; background:rgba(255,255,255,0.80); margin:26px 0 0; }
    .meio { position:absolute; z-index:2; bottom:310px; left:0; right:0; padding:0 72px; }
    .pill-2 { display:inline-block; background:${cor}; color:#fff; font-family:'Nunito',sans-serif; font-size:52px; font-weight:700; line-height:1.25; padding:18px 50px; border-radius:999px; max-width:940px; }
    .faixa { position:absolute; bottom:0; left:0; right:0; z-index:3; background:${cor}; height:210px; clip-path:polygon(0 65px, 100% 0, 100% 210px, 0 210px); display:flex; align-items:flex-end; padding:0 88px 40px 220px; }
    .faixa-end { font-family:'Nunito',sans-serif; font-size:36px; font-weight:700; color:#FFF8EE; white-space:nowrap; }
    .logo-esc { position:absolute; bottom:145px; left:72px; z-index:4; height:108px; width:108px; object-fit:contain; filter:drop-shadow(0 4px 14px rgba(0,0,0,0.55)); }
  </style>
</head><body>
  <div class="bg" style="background-image: url('${fotoUrl}'); background-size: cover; background-position: center; background-repeat: no-repeat;"></div>
  <div class="overlay"></div>
  <div class="topo">
    ${titulo ? `<div class="pill-1">${titulo.replace(/\n/g,'<br>')}</div>` : ''}
    <div class="linha-sep"></div>
  </div>
  ${subtitulo ? `<div class="meio"><div class="pill-2">${subtitulo.replace(/\n/g,'<br>')}</div></div>` : ''}
  <div class="faixa">
    <span class="faixa-end">📍 ${endereco}</span>
  </div>
  ${logoUrl ? `<img class="logo-esc" src="${logoUrl}" alt="logo">` : ''}
</body></html>`;
}

export function templateB({ titulo, subtitulo, cta, cor, fotoUrl, logoUrl, endereco }) {
  const palavras = titulo ? titulo.replace(/\n/g, ' ').trim() : '';
  return `<!DOCTYPE html><html><head>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Lato:wght@700&display=swap');
    * { margin:0; padding:0; box-sizing:border-box; }
    html, body { width:1080px; height:1920px; overflow:hidden; position:relative; font-family:'Playfair Display',serif; }
    .bg { position:absolute; inset:0; width:1080px; height:1920px; z-index:0; }
    .overlay { position:absolute; inset:0; z-index:1; pointer-events:none; background:linear-gradient(150deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.05) 50%, rgba(0,0,0,0) 65%, rgba(0,0,0,0.4) 100%); }
    .top { position:absolute; z-index:2; top:110px; left:72px; right:72px; display:flex; flex-direction:column; gap:8px; }
    .t-wrap { display:flex; flex-direction:column; align-items:flex-start; gap:12px; margin-bottom:4px; text-align:left; width:100%; }
    .t-hl { display:inline-block; max-width:100%; background:${cor}; color:#fff; font-size:96px; font-weight:900; line-height:1.4; padding:8px 32px; }
    .linha-dec { width:280px; height:5px; background:#fff; border-radius:2px; opacity:0.8; margin:22px 0 0; }
    .sub-wrap { position:absolute; z-index:2; bottom:310px; left:72px; right:72px; }
    .sub-card { display:inline-block; background:rgba(255,248,235,0.92); color:#2a1408; font-family:'Lato',sans-serif; font-size:50px; font-weight:700; line-height:1.4; padding:22px 40px; border-radius:8px 52px 52px 8px; max-width:880px; }
    .bottom { position:absolute; z-index:2; bottom:115px; right:72px; }
    .cta-badge { display:inline-block; background:#fff; color:#1a1a1a; font-family:'Lato',sans-serif; font-size:44px; font-weight:700; padding:20px 50px; border-radius:999px; filter:drop-shadow(0 6px 18px rgba(0,0,0,0.45)); }
    .logo-rod { position:absolute; bottom:90px; left:72px; z-index:3; height:95px; object-fit:contain; filter:drop-shadow(0 3px 10px rgba(0,0,0,0.55)); }
  </style>
</head><body>
  <div class="bg" style="background-image: url('${fotoUrl}'); background-size: cover; background-position: center; background-repeat: no-repeat;"></div>
  <div class="overlay"></div>
  <div class="top">
    <div class="t-wrap" id="tw"><span class="t-hl" id="hl">${palavras}</span></div>
    <div class="linha-dec"></div>
  </div>
  ${subtitulo ? `<div class="sub-wrap"><div class="sub-card">${subtitulo.replace(/\n/g,'<br>')}</div></div>` : ''}
  <div class="bottom">${cta ? `<span class="cta-badge">${cta}</span>` : ''}</div>
  ${logoUrl ? `<img class="logo-rod" src="${logoUrl}" alt="logo">` : ''}
  <script>
  (function() {
    const hl = document.getElementById('hl');
    const tw = document.getElementById('tw');
    const words = ${JSON.stringify(palavras)}.split(' ');
    const MAX = 96, MIN = 60;
    function lineCount(fs) {
      hl.style.fontSize = fs + 'px';
      return Math.round(hl.offsetHeight / parseFloat(getComputedStyle(hl).lineHeight));
    }
    let fs = MAX;
    while (fs > MIN && lineCount(fs) > 2) fs -= 2;
    hl.style.fontSize = fs + 'px';
    if (lineCount(fs) <= 1 || words.length <= 2) return;
    let wordsLine1 = 0;
    for (let i = 1; i <= words.length; i++) {
      hl.innerHTML = words.slice(0, i).join(' ');
      hl.style.fontSize = fs + 'px';
      if (Math.round(hl.offsetHeight / parseFloat(getComputedStyle(hl).lineHeight)) > 1) { 
        wordsLine1 = Math.max(1, i - 1); 
        break; 
      }
    }
    let breakAt = wordsLine1;
    const wordsLastLine = words.length - wordsLine1;
    if (wordsLastLine === 1 && wordsLine1 >= 2) {
      breakAt = wordsLine1 - 1;
    }
    const line1 = words.slice(0, breakAt).join(' ');
    const line2 = words.slice(breakAt).join(' ');
    tw.innerHTML = '<span class="t-hl" style="font-size:' + fs + 'px">' + line1 + '</span>' + 
                   '<span class="t-hl" style="font-size:' + fs + 'px">' + line2 + '</span>';
  })();
  </script>
</body></html>`;
}

export function templateC({ titulo, subtitulo, cor, fotoUrl }) {
  return `<!DOCTYPE html><html><head>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,800;0,900;1,900&family=Nunito:wght@700;800&display=swap');
    * { margin:0; padding:0; box-sizing:border-box; }
    html, body { width:1080px; height:1920px; overflow:hidden; position:relative; font-family:'Fraunces',serif; }
    .bg { position:absolute; inset:0; width:1080px; height:1920px; z-index:0; }
    .overlay { position:absolute; inset:0; z-index:1; pointer-events:none; background: linear-gradient(to bottom, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0) 30%), linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.0) 58%); }
    .zona { position:absolute; bottom:0; left:0; right:0; z-index:2; padding:0 72px 95px; display:flex; flex-direction:column; align-items:flex-start; gap:22px; }
    .titulo-gde { font-family:'Fraunces',serif; font-size:108px; font-weight:900; font-style:italic; color:#FFF8EE; line-height:1.1; text-shadow: 0 4px 32px rgba(0,0,0,0.70), 0 2px 0 rgba(0,0,0,0.30); }
    .pill-sub { display:inline-block; background:${cor}; color:#fff; font-family:'Nunito',sans-serif; font-size:48px; font-weight:700; padding:16px 48px; border-radius:999px; box-shadow:0 4px 18px rgba(0,0,0,0.4); }
  </style>
</head><body>
  <div class="bg" style="background-image: url('${fotoUrl}'); background-size: cover; background-position: center; background-repeat: no-repeat;"></div>
  <div class="overlay"></div>
  <div class="zona">
    ${titulo ? `<div class="titulo-gde">${titulo.replace(/\n/g,'<br>')}</div>` : ''}
    ${subtitulo ? `<div class="pill-sub">${subtitulo.replace(/\n/g,'<br>')}</div>` : ''}
  </div>
</body></html>`;
}

export function templateD({ titulo, subtitulo, cta, cor, fotoUrl, endereco }) {
  const r = parseInt(cor.slice(1,3),16) || 0;
  const g = parseInt(cor.slice(3,5),16) || 0;
  const b = parseInt(cor.slice(5,7),16) || 0;
  const cor2 = `rgb(${Math.round(r*.50)},${Math.round(g*.50)},${Math.round(b*.50)})`;
  return `<!DOCTYPE html><html><head>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@800;900&family=Nunito:wght@700;800&display=swap');
    * { margin:0; padding:0; box-sizing:border-box; }
    html, body { width:1080px; height:1920px; overflow:hidden; position:relative; font-family:'Fraunces',serif; }
    .bg { position:absolute; inset:0; width:1080px; height:1920px; z-index:0; }
    .overlay { position:absolute; inset:0; z-index:1; pointer-events:none; background: linear-gradient(to bottom, rgba(0,0,0,0.30) 0%, rgba(0,0,0,0.0) 30%), linear-gradient(to top, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.0) 30%); }
    .top { position:absolute; z-index:2; top:90px; left:0; right:0; padding:0 70px; display:flex; flex-direction:column; align-items:center; gap:22px; }
    .pill-titulo { background:#FFF8EE; color:${cor}; font-family:'Fraunces',serif; font-size:88px; font-weight:900; line-height:1.2; padding:26px 64px; border-radius:999px; text-align:center; display:inline-block; filter:drop-shadow(0 4px 18px rgba(0,0,0,0.35)); }
    .banner-sub-wrap { width:100%; display:flex; justify-content:center; }
    .banner-sub { background:${cor2}; color:#fff; font-family:'Nunito',sans-serif; font-size:38px; font-weight:700; line-height:1.3; padding:16px 52px; border-radius:18px; display:inline-block; max-width:940px; text-align:center; }
    .bottom { position:absolute; z-index:2; bottom:90px; left:0; right:0; padding:0 70px; display:flex; flex-direction:column; align-items:center; gap:20px; }
    .cta-pill { background:#FFF8EE; color:${cor}; font-family:'Fraunces',serif; font-size:80px; font-weight:900; padding:28px 80px; border-radius:999px; text-align:center; display:inline-block; filter:drop-shadow(0 4px 18px rgba(0,0,0,0.35)); }
    .pill-end { display:inline-flex; align-items:center; gap:10px; background:#FFF8EE; color:#2a1408; font-family:'Nunito',sans-serif; font-size:34px; font-weight:700; padding:14px 44px; border-radius:999px; }
  </style>
</head><body>
  <div class="bg" style="background-image: url('${fotoUrl}'); background-size: cover; background-position: center; background-repeat: no-repeat;"></div>
  <div class="overlay"></div>
  <div class="top">
    ${titulo ? `<div class="pill-titulo">${titulo.replace(/\n/g,'<br>')}</div>` : ''}
    ${subtitulo ? `<div class="banner-sub-wrap"><div class="banner-sub">${subtitulo.replace(/\n/g,'<br>')}</div></div>` : ''}
  </div>
  <div class="bottom">
    ${cta ? `<span class="cta-pill">${cta}</span>` : ''}
    <span class="pill-end">📍 ${endereco}</span>
  </div>
</body></html>`;
}

export function templateE({ titulo, subtitulo, cor, fotoUrl, logoUrl }) {
  return `<!DOCTYPE html><html><head>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@800;900&family=Nunito:wght@700;800&display=swap');
    * { margin:0; padding:0; box-sizing:border-box; }
    html, body { width:1080px; height:1920px; overflow:hidden; position:relative; font-family:'Fraunces',serif; }
    .bg { position:absolute; inset:0; width:1080px; height:1920px; z-index:0; }
    .overlay { position:absolute; inset:0; z-index:1; background:rgba(240,200,150,0.72); }
    .content { position:absolute; inset:0; z-index:2; display:flex; flex-direction:column; align-items:center; justify-content:flex-start; padding:280px 80px 0; gap:0; }
    .pill-ctx { display:inline-block; background:#FFF8EE; color:${cor}; font-family:'Nunito',sans-serif; font-size:44px; font-weight:700; padding:16px 56px; border-radius:999px; text-align:center; margin-bottom:30px; }
    .card-titulo { width:100%; background:${cor}; color:#fff; font-size:74px; font-weight:900; line-height:1.25; padding:48px 60px; border-radius:48px; text-align:center; }
    .linha { width:80%; height:3px; background:rgba(255,255,255,0.7); margin-top:48px; }
    .logo-centro { position:absolute; bottom:110px; left:50%; transform:translateX(-50%); z-index:3; height:155px; object-fit:contain; filter:drop-shadow(0 4px 14px rgba(0,0,0,0.18)); }
  </style>
</head><body>
  <div class="bg" style="background-image: url('${fotoUrl}'); background-size: cover; background-position: center; background-repeat: no-repeat;"></div>
  <div class="overlay"></div>
  <div class="content">
    ${subtitulo ? `<div class="pill-ctx">${subtitulo.replace(/\n/g,' ')}</div>` : ''}
    ${titulo ? `<div class="card-titulo">${titulo.replace(/\n/g,'<br>')}</div>` : ''}
    <div class="linha"></div>
  </div>
  ${logoUrl ? `<img class="logo-centro" src="${logoUrl}" alt="logo">` : ''}
</body></html>`;
}

export const TEMPLATES = { A: templateA, B: templateB, C: templateC, D: templateD, E: templateE };