export function templateA({ titulo, subtitulo, cta, cor, fotoUrl, logoUrl, endereco }) {
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
  <img class="bg" src="${fotoUrl}" alt="">
  <div class="overlay"></div>
  <div class="topo">
    ${titulo ? `<div class="pill-1">${titulo.replace(/\n/g,'<br>')}</div>` : ''}
    <div class="linha-sep"></div>
  </div>
  ${subtitulo ? `<div class="meio"><div class="pill-2">${subtitulo.replace(/\n/g,'<br>')}</div></div>` : ''}
  <div class="faixa">
    <span class="faixa-end">${endereco}</span>
  </div>
  ${logoUrl ? `<img class="logo-esc" src="${logoUrl}" alt="logo">` : ''}
</body></html>`;
}