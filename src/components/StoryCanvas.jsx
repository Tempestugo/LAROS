import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { fabric } from 'fabric';

/* --- Helpers de Renderização --- */
const darkenColor = (hex) => {
  if(!hex) return '#000000';
  const r = parseInt(hex.slice(1,3), 16) || 0;
  const g = parseInt(hex.slice(3,5), 16) || 0;
  const b = parseInt(hex.slice(5,7), 16) || 0;
  return `rgb(${Math.round(r*0.5)},${Math.round(g*0.5)},${Math.round(b*0.5)})`;
};

const loadLogo = (canvas, logoUrl, left, top, originX = 'left') => {
  if (!logoUrl) return;
  fabric.Image.fromURL(logoUrl, (img) => {
    img.scaleToHeight(108);
    img.set({ left, top, originX, selectable: true });
    canvas.add(img);
  }, { crossOrigin: 'anonymous' });
};

const setCanvasBackground = (canvas, fotoUrl, callback) => {
  if (!fotoUrl) return callback();
  fabric.Image.fromURL(fotoUrl, (img) => {
    const scale = Math.max(1080 / img.width, 1920 / img.height);
    img.set({
      originX: 'center', originY: 'center',
      left: 540, top: 960,
      scaleX: scale, scaleY: scale,
      selectable: false, evented: false
    });
    canvas.setBackgroundImage(img, () => {
      canvas.renderAll();
      callback();
    });
  }, { crossOrigin: 'anonymous' });
};

/* --- Dicionário de Templates --- */
const TEMPLATE_RENDERERS = {
  A: (canvas, data, logoUrl) => {
    const overlay = new fabric.Rect({
      left: 0, top: 0, width: 1080, height: 1920, selectable: false, evented: false,
      fill: new fabric.Gradient({
        type: 'linear', coords: { x1: 0, y1: 0, x2: 0, y2: 1920 },
        colorStops: [
          { offset: 0, color: 'rgba(0,0,0,0.3)' }, { offset: 0.35, color: 'rgba(0,0,0,0)' },
          { offset: 0.65, color: 'rgba(0,0,0,0)' }, { offset: 1, color: 'rgba(0,0,0,0.6)' }
        ]
      })
    });
    canvas.add(overlay);

    const title = new fabric.IText(data.titulo || 'Título', {
      left: 72, top: 190, fontFamily: 'Fraunces', fontSize: 78, fontWeight: 900,
      fill: data.cor || '#C47B2B', textBackgroundColor: '#FFF8EE', padding: 22
    });
    canvas.add(title);

    const sub = new fabric.IText(data.subtitulo || 'Subtítulo', {
      left: 72, top: 1920 - 310, fontFamily: 'Nunito', fontSize: 52, fontWeight: 700,
      fill: '#FFFFFF', textBackgroundColor: data.cor || '#C47B2B', padding: 18
    });
    canvas.add(sub);

    loadLogo(canvas, logoUrl, 72, 1920 - 145 - 108);
  },
  B: (canvas, data, logoUrl) => {
    const overlay = new fabric.Rect({
      left: 0, top: 0, width: 1080, height: 1920, selectable: false, evented: false,
      fill: new fabric.Gradient({
        type: 'linear', coords: { x1: 0, y1: 0, x2: 1080, y2: 1920 },
        colorStops: [ { offset: 0, color: 'rgba(0,0,0,0.5)' }, { offset: 0.5, color: 'rgba(0,0,0,0.05)' }, { offset: 1, color: 'rgba(0,0,0,0.4)' } ]
      })
    });
    canvas.add(overlay);

    const title = new fabric.IText(data.titulo || 'Título', {
      left: 72, top: 110, fontFamily: 'Playfair Display', fontSize: 96, fontWeight: 900,
      fill: '#FFFFFF', textBackgroundColor: data.cor || '#C47B2B', padding: 10
    });
    canvas.add(title);

    const line = new fabric.Rect({ left: 72, top: title.top + title.height + 22, width: 280, height: 5, fill: '#FFFFFF', rx: 2, ry: 2 });
    canvas.add(line);

    const pathStr = 'M 8 0 H 828 A 52 52 0 0 1 880 52 V 88 A 52 52 0 0 1 828 140 H 8 A 8 8 0 0 1 0 132 V 8 A 8 8 0 0 1 8 0 Z';
    const subBg = new fabric.Path(pathStr, { fill: 'rgba(255,248,235,0.92)' });
    const subText = new fabric.IText(data.subtitulo || 'Subtítulo', { fontFamily: 'Lato', fontSize: 50, fontWeight: 700, fill: '#2a1408', left: 40, top: 40 });
    const subGroup = new fabric.Group([subBg, subText], { left: 72, top: 1920 - 310 });
    canvas.add(subGroup);

    loadLogo(canvas, logoUrl, 72, 1920 - 90 - 95);
  },
  C: (canvas, data, logoUrl) => {
    const overlay = new fabric.Rect({
      left: 0, top: 0, width: 1080, height: 1920, selectable: false, evented: false,
      fill: new fabric.Gradient({
        type: 'linear', coords: { x1: 0, y1: 0, x2: 0, y2: 1920 },
        colorStops: [{ offset: 0, color: 'rgba(0,0,0,0)' }, { offset: 1, color: 'rgba(0,0,0,0.82)' }]
      })
    });
    canvas.add(overlay);

    const subBg = new fabric.Rect({ width: 600, height: 100, fill: data.cor || '#C47B2B', rx: 50, ry: 50, originX: 'center', originY: 'center' });
    const subText = new fabric.IText(data.subtitulo || 'Subtítulo', { fontFamily: 'Nunito', fontSize: 48, fontWeight: 700, fill: '#FFFFFF', originX: 'center', originY: 'center' });
    const subGroup = new fabric.Group([subBg, subText], { left: 372, top: 1920 - 95 - 50, shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.4)', blur: 18, offsetY: 4 }) });
    canvas.add(subGroup);

    const title = new fabric.IText(data.titulo || 'Título', {
      left: 72, top: subGroup.top - 200, fontFamily: 'Fraunces', fontSize: 108, fontStyle: 'italic', fontWeight: 900,
      fill: '#FFF8EE', shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.7)', blur: 32, offsetY: 4 })
    });
    canvas.add(title);
  },
  D: (canvas, data, logoUrl) => {
    const overlay = new fabric.Rect({
      left: 0, top: 0, width: 1080, height: 1920, selectable: false, evented: false,
      fill: new fabric.Gradient({ type: 'linear', coords: { x1: 0, y1: 0, x2: 0, y2: 1920 }, colorStops: [{ offset: 0, color: 'rgba(0,0,0,0.3)' }, { offset: 0.3, color: 'rgba(0,0,0,0)' }, { offset: 1, color: 'rgba(0,0,0,0.45)' }] })
    });
    canvas.add(overlay);

    const titleText = new fabric.IText(data.titulo || 'Título', { fontFamily: 'Fraunces', fontSize: 88, fontWeight: 900, fill: data.cor || '#C47B2B', originX: 'center', originY: 'center', textBackgroundColor: '#FFF8EE', padding: 26 });
    titleText.set({ left: 540, top: 180, shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.35)', blur: 18, offsetY: 4 }) });
    canvas.add(titleText);

    const subBg = new fabric.Rect({ width: 940, height: 90, fill: darkenColor(data.cor || '#C47B2B'), rx: 18, ry: 18, originX: 'center', originY: 'center' });
    const subText = new fabric.IText(data.subtitulo || 'Subtítulo', { fontFamily: 'Nunito', fontSize: 38, fontWeight: 700, fill: '#FFFFFF', originX: 'center', originY: 'center' });
    const subGroup = new fabric.Group([subBg, subText], { left: 540, top: titleText.top + 160 });
    canvas.add(subGroup);
  },
  E: (canvas, data, logoUrl) => {
    const overlay = new fabric.Rect({ left: 0, top: 0, width: 1080, height: 1920, fill: 'rgba(240,200,150,0.72)', selectable: false, evented: false });
    canvas.add(overlay);

    const ctxText = new fabric.IText(data.subtitulo || 'Contexto', { fontFamily: 'Nunito', fontSize: 44, fontWeight: 700, fill: data.cor || '#C47B2B', textBackgroundColor: '#FFF8EE', padding: 16, originX: 'center', originY: 'center', left: 540, top: 960 - 250 });
    canvas.add(ctxText);

    const titleBg = new fabric.Rect({ width: 920, height: 300, fill: data.cor || '#C47B2B', rx: 48, ry: 48, originX: 'center', originY: 'center' });
    const titleText = new fabric.IText(data.titulo || 'Pergunta?', { fontFamily: 'Fraunces', fontSize: 74, fontWeight: 900, fill: '#FFFFFF', originX: 'center', originY: 'center', textAlign: 'center' });
    const titleGroup = new fabric.Group([titleBg, titleText], { left: 540, top: 960 - 80 });
    canvas.add(titleGroup);

    loadLogo(canvas, logoUrl, 540, 1920 - 110 - 155, 'center');
  }
};

const StoryCanvas = forwardRef(({ storyIndex, story, assets, logoUrl, onSelectObject, onClearSelection, onUpdateStory }, ref) => {
  const canvasEl = useRef(null);
  const canvasInstance = useRef(null);
  const wrapperRef = useRef(null);
  const loadedIndexRef = useRef(-1);

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

    // Auto-Save listeners
    const notifyChange = () => {
      if (onUpdateStory) onUpdateStory(canvasInstance.current.toJSON());
    };
    canvas.on('object:modified', notifyChange);
    canvas.on('text:changed', notifyChange);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.dispose();
    };
  }, []); // Dependências vazias para rodar apenas uma vez

  // Lógica de Carregamento Inteligente
  useEffect(() => {
    if (!story || !canvasInstance.current || storyIndex === loadedIndexRef.current) return;

    const canvas = canvasInstance.current;
    
    // Match Dinâmico de Fundo (Procura no array assets o nome que começa pela string do CSV)
    const matchFoto = () => {
      if (story.fotoUrl) return story.fotoUrl; // Se já tiver uma manual
      if (!story.foto || !assets) return null;
      const match = assets.find(f => f.name.toLowerCase().startsWith(story.foto.toLowerCase()));
      return match ? match.url : null;
    };

    // Prioridade 1: Carregar estado salvo (Edições do utilizador)
    if (story.fabricData) {
      canvas.loadFromJSON(story.fabricData, () => {
        canvas.renderAll();
        loadedIndexRef.current = storyIndex;
      });
    } else {
      // Prioridade 2: Renderização Padrão pelo Dicionário
      canvas.clear();
      
      setCanvasBackground(canvas, matchFoto(), () => {
        const template = story.template || 'A';
        const renderer = TEMPLATE_RENDERERS[template] || TEMPLATE_RENDERERS['A'];
        renderer(canvas, story, logoUrl);
        
        canvas.renderAll();
        loadedIndexRef.current = storyIndex;
      });
    }
  }, [storyIndex, story, assets, logoUrl]);

  // Expõe métodos para o componente pai (EditorScreen)
  useImperativeHandle(ref, () => ({
    getCanvas: () => canvasInstance.current,
    setBackground: (url) => {
      if (!canvasInstance.current) return;
      setCanvasBackground(canvasInstance.current, url, () => {
        if (onUpdateStory) onUpdateStory(canvasInstance.current.toJSON());
      });
    },
    forceReload: () => { loadedIndexRef.current = -1; }
  }));

  return (
    <div ref={wrapperRef} style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <canvas ref={canvasEl} style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }} />
    </div>
  );
});

export default StoryCanvas;