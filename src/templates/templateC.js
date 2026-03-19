export function templateC({ titulo, subtitulo, cor, fotoUrl }) {
  return `<!DOCTYPE html><html><head>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,800;0,900;1,900&family=Nunito:wght@700;800&display=swap');
    * { margin:0; padding:0; box-sizing:border-box; }
    html, body { width:1080px; height:1920px; overflow:hidden; position:relative; font-family:'Fraunces',serif; }
    .bg { position:absolute; inset:0; width:1080px; height:1920px; object-fit:cover; z-index:0; }
    .overlay { position:absolute; inset:0; z-index:1; pointer-events:none; background: linear-gradient(to bottom, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0) 30%), linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.0) 58%); }
    .zona { position:absolute; bottom:0; left:0; right:0; z-index:2; padding:0 72px 95px; display:flex; flex-direction:column; align-items:flex-start; gap:22px; }
    .titulo-gde { font-family:'Fraunces',serif; font-size:108px; font-weight:900; font-style:italic; color:#FFF8EE; line-height:1.1; text-shadow: 0 4px 32px rgba(0,0,0,0.70), 0 2px 0 rgba(0,0,0,0.30); }
    .pill-sub { display:inline-block; background:${cor}; color:#fff; font-family:'Nunito',sans-serif; font-size:48px; font-weight:700; padding:16px 48px; border-radius:999px; box-shadow:0 4px 18px rgba(0,0,0,0.4); }
  </style>
</head><body>
  <img class="bg" src="${fotoUrl}" alt="">
  <div class="overlay"></div>
  <div class="zona">
    ${titulo ? `<div class="titulo-gde">${titulo.replace(/\n/g,'<br>')}</div>` : ''}
    ${subtitulo ? `<div class="pill-sub">${subtitulo.replace(/\n/g,'<br>')}</div>` : ''}
  </div>
</body></html>`;
}