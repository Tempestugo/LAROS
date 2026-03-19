export function templateB({ titulo, subtitulo, cta, cor, fotoUrl, logoUrl, endereco }) {
  const palavras = titulo ? titulo.replace(/\n/g, ' ').trim() : '';
  return `<!DOCTYPE html><html><head>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Lato:wght@700&display=swap');
    * { margin:0; padding:0; box-sizing:border-box; }
    html, body { width:1080px; height:1920px; overflow:hidden; position:relative; font-family:'Playfair Display',serif; }
    .bg { position:absolute; inset:0; width:1080px; height:1920px; object-fit:cover; z-index:0; }
    .overlay { position:absolute; inset:0; z-index:1; pointer-events:none; background:linear-gradient(150deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.05) 50%, rgba(0,0,0,0) 65%, rgba(0,0,0,0.4) 100%); }
    .top { position:absolute; z-index:2; top:110px; left:72px; right:72px; display:flex; flex-direction:column; gap:8px; }
    .t-wrap { line-height:1; margin-bottom:4px; text-align:left; }
    .t-hl { display:inline; background:${cor}; color:#fff; font-size:96px; font-weight:900; line-height:1.55; padding:2px 32px; box-decoration-break:clone; -webkit-box-decoration-break:clone; }
    .linha-dec { width:280px; height:5px; background:#fff; border-radius:2px; opacity:0.8; margin:22px 0 0; }
    .sub-wrap { position:absolute; z-index:2; bottom:310px; left:72px; right:72px; }
    .sub-card { display:inline-block; background:rgba(255,248,235,0.92); color:#2a1408; font-family:'Lato',sans-serif; font-size:50px; font-weight:700; line-height:1.4; padding:22px 40px; border-radius:8px 52px 52px 8px; max-width:880px; }
    .bottom { position:absolute; z-index:2; bottom:115px; right:72px; }
    .cta-badge { display:inline-block; background:#fff; color:#1a1a1a; font-family:'Lato',sans-serif; font-size:44px; font-weight:700; padding:20px 50px; border-radius:999px; filter:drop-shadow(0 6px 18px rgba(0,0,0,0.45)); }
    .logo-rod { position:absolute; bottom:90px; left:72px; z-index:3; height:95px; object-fit:contain; filter:drop-shadow(0 3px 10px rgba(0,0,0,0.55)); }
  </style>
</head><body>
  <img class="bg" src="${fotoUrl}" alt="">
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
    if (!hl) return;
    const words = hl.textContent.trim().split(' ');
    const MAX = 96, MIN = 60;
    function lineCount(fs) {
      hl.style.fontSize = fs + 'px';
      const lh = parseFloat(getComputedStyle(hl).lineHeight);
      return Math.round(hl.offsetHeight / lh);
    }
    let fs = MAX;
    while (fs > MIN && lineCount(fs) > 2) fs -= 2;
    hl.style.fontSize = fs + 'px';
    if (lineCount(fs) <= 1 || words.length <= 2) return;
    let wordsLine1 = 0;
    for (let i = 1; i <= words.length; i++) {
      hl.innerHTML = words.slice(0, i).join(' ');
      hl.style.fontSize = fs + 'px';
      const lh = parseFloat(getComputedStyle(hl).lineHeight);
      if (Math.round(hl.offsetHeight / lh) > 1) { wordsLine1 = i - 1; break; }
    }
    hl.innerHTML = words.join(' ');
    const wordsLastLine = words.length - wordsLine1;
    if (wordsLastLine === 1 && wordsLine1 >= 2) {
      const breakAt = wordsLine1 - 1;
      hl.innerHTML = words.slice(0, breakAt).join(' ') + '<br>' + words.slice(breakAt).join(' ');
    }
  })();
  </script>
</body></html>`;
}