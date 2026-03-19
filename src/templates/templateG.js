export function templateG({ titulo, subtitulo, cta, cor, fotoUrl, logoUrl, endereco }) {
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
    <div class="end-pill">📍 ${endereco}</div>
  </div>
</body></html>`;
}