export function templateE({ titulo, subtitulo, cor, fotoUrl, logoUrl }) {
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
    .content { position:absolute; z-index:2; top:320px; left:0; right:0; display:flex; flex-direction:column; align-items:center; padding:0 80px; gap:0; }
    .pill-ctx { display:inline-block; background:#FFF8EE; color:${cor}; font-family:'Nunito',sans-serif; font-size:44px; font-weight:700; padding:16px 56px; border-radius:999px; text-align:center; margin-bottom:30px; }
    .card-titulo { width:100%; background:${cor}; color:#fff; font-size:74px; font-weight:900; line-height:1.25; padding:48px 60px; border-radius:48px; text-align:center; }
    .linha { width:80%; height:3px; background:rgba(255,255,255,0.7); margin-top:48px; }
    .logo-centro { position:absolute; bottom:110px; left:50%; transform:translateX(-50%); z-index:3; height:155px; object-fit:contain; filter:drop-shadow(0 4px 14px rgba(0,0,0,0.18)); }
  </style>
</head><body>
  <img class="bg" src="${fotoUrl}" alt="">
  <div class="overlay"></div>
  <div class="content">
    ${subtitulo ? `<div class="pill-ctx">${subtitulo.replace(/\n/g,' ')}</div>` : ''}
    ${titulo ? `<div class="card-titulo">${titulo.replace(/\n/g,'<br>')}</div>` : ''}
    <div class="linha"></div>
  </div>
  ${logoUrl ? `<img class="logo-centro" src="${logoUrl}" alt="logo">` : ''}
</body></html>`;
}