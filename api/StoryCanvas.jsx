import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { fabric } from 'fabric';

const StoryCanvas = forwardRef(({ onSelectObject, onClearSelection }, ref) => {
  const canvasEl = useRef(null);
  const canvasInstance = useRef(null);
  const wrapperRef = useRef(null);

  // Inicialização do Canvas
  useEffect(() => {
    const canvas = new fabric.Canvas(canvasEl.current, {
      preserveObjectStacking: true, // Mantém a ordem dos elementos ao selecionar
      backgroundColor: '#111',
    });
    canvasInstance.current = canvas;

    // Responsividade: Escalar 1080x1920 para caber no wrapper
    const resizeCanvas = () => {
      if (!wrapperRef.current) return;
      const { clientWidth, clientHeight } = wrapperRef.current;
      
      // Calcula a escala para caber na tela (com uma pequena margem)
      const scale = Math.min((clientWidth - 40) / 1080, (clientHeight - 40) / 1920);
      
      canvas.setWidth(1080 * scale);
      canvas.setHeight(1920 * scale);
      canvas.setZoom(scale);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Eventos de Seleção
    canvas.on('selection:created', (e) => onSelectObject(e.selected[0]));
    canvas.on('selection:updated', (e) => onSelectObject(e.selected[0]));
    canvas.on('selection:cleared', () => onClearSelection());

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.dispose();
    };
  }, []); // Dependências vazias para rodar apenas uma vez

  // Expõe métodos para o componente pai (EditorScreen)
  useImperativeHandle(ref, () => ({
    getCanvas: () => canvasInstance.current,
    
    // Lógica do Template A convertida para Fabric.js
    loadTemplateA: (data) => {
      const canvas = canvasInstance.current;
      canvas.clear();

      // 1. Fundo (Estático)
      if (data.fotoUrl) {
        fabric.Image.fromURL(data.fotoUrl, (img) => {
          const scale = Math.max(1080 / img.width, 1920 / img.height);
          img.set({
            originX: 'center', originY: 'center',
            left: 540, top: 960,
            scaleX: scale, scaleY: scale,
            selectable: false, evented: false
          });
          canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
        }, { crossOrigin: 'anonymous' });
      }

      // 2. Pill de Título (Editável)
      const text = new fabric.IText(data.titulo || 'Escreva seu título', {
        fontFamily: 'Fraunces',
        fontSize: 78, fontWeight: 900,
        fill: data.cor || '#C47B2B',
        originX: 'center', originY: 'center',
        textBackgroundColor: '#FFF8EE', // Simplificação para não precisar de um Group complexo
        padding: 22, // Simula o padding da Pill
      });
      
      text.set({ left: 540, top: 190 });
      canvas.add(text);

      // 3. Logo (Arrastável)
      if (data.logoUrl) {
        fabric.Image.fromURL(data.logoUrl, (img) => {
          img.scaleToHeight(108);
          img.set({ left: 72, top: 1920 - 145 - 108 });
          canvas.add(img);
        }, { crossOrigin: 'anonymous' });
      }
    }
  }));

  return (
    <div ref={wrapperRef} style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <canvas ref={canvasEl} style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }} />
    </div>
  );
});

export default StoryCanvas;