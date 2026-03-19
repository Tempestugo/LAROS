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
    .bg { position:absolute; inset:0; width:1080px; height:1920px; object-fit:cover; z-index:0; }
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
  <img class="bg" src="${fotoUrl}" alt="">
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