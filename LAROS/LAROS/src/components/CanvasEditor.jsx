import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useFabric, CANVAS_W, CANVAS_H, DISPLAY_SCALE } from '../hooks/useFabric.js';
import './CanvasEditor.css';

export default function CanvasEditor({
  story,
  fotos,
  logos,
  onSelectObj,
  selectedObj,
  canvasRef: externalCanvasRef,
  fabricRef,
}) {
  const canvasElRef = useRef(null);
  const { fcRef, setBackground, setLogo, applyTemplate, updateSelected, removeSelected, clearElements, toDataURL } =
    useFabric(canvasElRef);

  // Expõe refs para o pai
  useEffect(() => {
    if (fabricRef) fabricRef.current = { fcRef, setBackground, setLogo, applyTemplate, updateSelected, removeSelected, clearElements, toDataURL };
  }, [fcRef, setBackground, setLogo, applyTemplate, updateSelected, removeSelected, clearElements, toDataURL, fabricRef]);

  // Detecta seleção de objetos
  useEffect(() => {
    const fc = fcRef.current;
    if (!fc) return;
    const handleSel   = (e) => onSelectObj(e.selected?.[0] || null);
    const handleClear = ()  => onSelectObj(null);
    fc.on('selection:created', handleSel);
    fc.on('selection:updated', handleSel);
    fc.on('selection:cleared', handleClear);
    return () => {
      fc.off('selection:created', handleSel);
      fc.off('selection:updated', handleSel);
      fc.off('selection:cleared', handleClear);
    };
  }, [fcRef.current, onSelectObj]);

  // Carrega story no canvas quando muda
  useEffect(() => {
    if (!story || !fcRef.current) return;
    const fc = fcRef.current;

    // Fundo
    const fotoData = fotos.find(f => f.name === story.foto);
    if (fotoData) setBackground(fotoData.url);
    else {
      // Sem foto — fundo escuro sólido
      fc.setBackgroundColor('#1a1a1a', () => fc.renderAll());
    }

    // Logo
    const logoData = story.logoFile ? logos.find(l => l.filename === story.logoFile) : null;
    if (logoData) setLogo(logoData.url);

    // Template
    applyTemplate(story.template || 'A', {
      titulo:    story.titulo,
      subtitulo: story.subtitulo,
      cta:       story.cta,
      cor:       story.cor || '#C47B2B',
      endereco:  story.endereco,
    });
  }, [story?.id, story?.foto, story?.logoFile, story?.template, story?.cor]);

  return (
    <div className="canvas-area">
      <div className="canvas-outer" style={{
        width:  CANVAS_W * DISPLAY_SCALE,
        height: CANVAS_H * DISPLAY_SCALE,
      }}>
        <canvas ref={canvasElRef} />
      </div>
      <div className="canvas-hint">
        Clique para selecionar · Arraste para mover · Duplo-clique para editar texto
      </div>
    </div>
  );
}
