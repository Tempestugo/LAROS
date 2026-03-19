import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { TEMPLATES } from '../templates';

const StoryCanvas = forwardRef(({ story, assets, logoUrl, defaultEndereco }, ref) => {
  const wrapperRef = useRef(null);
  const iframeRef = useRef(null);
  const [scale, setScale] = useState(0.3);

  useEffect(() => {
    const resizeCanvas = () => {
      if (!wrapperRef.current) return;
      const { clientWidth, clientHeight } = wrapperRef.current;
      const scale = Math.min((clientWidth - 40) / 1080, (clientHeight - 40) / 1920);
      setScale(scale);
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  const getHtmlDoc = () => {
    if (!story) return '';
    let fUrl = story.fotoUrl;
    if (!fUrl && story.foto && assets) {
      const match = assets.find(f => {
        const cleanCsv = story.foto.replace(/\.[^/.]+$/, "").toLowerCase().replace(/[^a-z0-9]/g, "");
        const cleanFile = f.name.replace(/\.[^/.]+$/, "").toLowerCase().replace(/[^a-z0-9]/g, "");
        return cleanFile.includes(cleanCsv) || cleanCsv.includes(cleanFile);
      });
      if (match) fUrl = match.url;
    }
    const tpl = TEMPLATES[story.template || 'A'] || TEMPLATES['A'];
    return tpl({
      titulo: story.titulo,
      subtitulo: story.subtitulo,
      cta: story.cta,
      cor: story.cor || '#C47B2B',
      fotoUrl: fUrl || '',
      logoUrl: logoUrl || '',
      endereco: story.endereco || defaultEndereco || 'Endereço Padrão'
    });
  };

  useImperativeHandle(ref, () => ({
    getHtmlDoc,
    getIframe: () => iframeRef.current
  }));

  return (
    <div ref={wrapperRef} style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
      <div style={{ width: 1080, height: 1920, transform: `scale(${scale})`, transformOrigin: 'center center', boxShadow: 'var(--shadow-md)', borderRadius: 16, overflow: 'hidden', backgroundColor: '#000' }}>
        <iframe ref={iframeRef} srcDoc={getHtmlDoc()} style={{ width: '100%', height: '100%', border: 'none' }} title="Preview Story" />
      </div>
    </div>
  );
});

export default StoryCanvas;