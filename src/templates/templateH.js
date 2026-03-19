export function templateH({ titulo, subtitulo, cta, cor, fotoUrl, logoUrl, endereco }) {
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