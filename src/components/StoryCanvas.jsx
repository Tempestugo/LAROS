import React, { useMemo, useRef, useEffect, useState } from 'react';
import { renderTemplate } from '../templates';

export default function StoryCanvas({ story, logoUrl, defaultEndereco }) {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(0.3);

  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;
      const scaleX = clientWidth / 1080;
      const scaleY = clientHeight / 1920;
      setScale(Math.min(scaleX, scaleY) * 0.95); // 0.95 para deixar uma margem segura
    };
    updateScale();
    const ro = new ResizeObserver(updateScale);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Monta o story com o endereço padrão do projeto se o story não tiver
  const storyWithDefaults = useMemo(() => ({
    ...story,
    endereco: story?.endereco || defaultEndereco || '',
  }), [story, defaultEndereco]);

  const html = useMemo(() => {
    if (!story) return '';
    return renderTemplate(storyWithDefaults, logoUrl);
  }, [storyWithDefaults, logoUrl]);

  return (
    <div 
      ref={containerRef}
      style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}
    >
      {story ? (
        <iframe
          key={html} // Força remount quando o HTML muda para feedback imediato
          srcDoc={html}
          style={{
            width:  '1080px',
            height: '1920px',
            border: 'none',
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
            flexShrink: 0,
            borderRadius: '4px',
            boxShadow: '0 8px 48px rgba(0,0,0,0.6)',
          }}
          sandbox="allow-scripts"
          scrolling="no"
        />
      ) : (
        <div style={{ color: 'var(--text3)', fontSize: '0.9rem' }}>Selecione um story para visualizar</div>
      )}
    </div>
  );
}