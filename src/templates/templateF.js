export function templateF({ titulo, subtitulo, cta, cor, fotoUrl, logoUrl, endereco }) {
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