import { useEffect, useRef, useCallback } from 'react';
import { fabric } from 'fabric';
import { TEMPLATES } from '../templates/index.js';

// Canvas real em 1080×1920 mas escalado na tela
export const CANVAS_W = 1080;
export const CANVAS_H = 1920;
export const DISPLAY_SCALE = 0.35; // ajuste conforme o monitor

export function useFabric(canvasElRef) {
  const fcRef = useRef(null);

  useEffect(() => {
    if (!canvasElRef.current || fcRef.current) return;

    const fc = new fabric.Canvas(canvasElRef.current, {
      width: CANVAS_W,
      height: CANVAS_H,
      backgroundColor: '#111',
      selection: true,
      preserveObjectStacking: true,
    });

    // Escala para exibição
    const wrapper = canvasElRef.current.closest('.canvas-outer');
    if (wrapper) {
      const s = DISPLAY_SCALE;
      fc.setZoom(s);
      fc.setWidth(CANVAS_W * s);
      fc.setHeight(CANVAS_H * s);
    }

    fcRef.current = fc;
    return () => { fc.dispose(); fcRef.current = null; };
  }, []);

  // ── Carrega uma imagem como fundo ─────────────────────────────────────────
  const setBackground = useCallback((imageUrl) => {
    const fc = fcRef.current;
    if (!fc) return;
    fabric.Image.fromURL(imageUrl, (img) => {
      img.scaleToWidth(CANVAS_W);
      img.scaleToHeight(CANVAS_H);
      img.set({ selectable: false, evented: false, originX: 'left', originY: 'top', left: 0, top: 0 });
      // Remove fundo anterior
      const old = fc.getObjects().filter(o => o._isBackground);
      old.forEach(o => fc.remove(o));
      img._isBackground = true;
      fc.add(img);
      fc.sendToBack(img);
      fc.renderAll();
    }, { crossOrigin: 'anonymous' });
  }, []);

  // ── Carrega logo ──────────────────────────────────────────────────────────
  const setLogo = useCallback((logoUrl) => {
    const fc = fcRef.current;
    if (!fc) return;
    fabric.Image.fromURL(logoUrl, (img) => {
      img.scaleToHeight(108);
      img.set({ left: 72, top: CANVAS_H - 250, selectable: true, _isLogo: true });
      const old = fc.getObjects().filter(o => o._isLogo);
      old.forEach(o => fc.remove(o));
      fc.add(img);
      fc.bringToFront(img);
      fc.renderAll();
    }, { crossOrigin: 'anonymous' });
  }, []);

  // ── Aplica um template (gera textboxes) ───────────────────────────────────
  const applyTemplate = useCallback((templateKey, data) => {
    const fc = fcRef.current;
    if (!fc) return;
    const tpl = TEMPLATES[templateKey];
    if (!tpl) return;

    // Remove elementos de texto anteriores (preserva bg e logo)
    const old = fc.getObjects().filter(o => o._storyEl);
    old.forEach(o => fc.remove(o));

    const elements = tpl.elements(data);
    elements.forEach(el => {
      if (!el.text) return; // Não cria se texto vazio
      const tb = new fabric.Textbox(el.text, {
        left: el.left,
        top: el.top,
        width: el.width,
        fontSize: el.fontSize,
        fontFamily: el.fontFamily,
        fontWeight: el.fontWeight,
        fontStyle: el.fontStyle || 'normal',
        fill: el.fill || '#ffffff',
        textAlign: el.textAlign || 'left',
        backgroundColor: el.backgroundColor || '',
        padding: el.padding || 0,
        lineHeight: 1.2,
        editable: true,
        selectable: true,
        hasControls: true,
        _storyEl: true,
        _elId: el.id,
      });
      fc.add(tb);
    });

    fc.renderAll();
  }, []);

  // ── Atualiza propriedades do objeto selecionado ───────────────────────────
  const updateSelected = useCallback((props) => {
    const fc = fcRef.current;
    if (!fc) return;
    const obj = fc.getActiveObject();
    if (!obj) return;
    obj.set(props);
    fc.renderAll();
  }, []);

  // ── Remove objeto selecionado ─────────────────────────────────────────────
  const removeSelected = useCallback(() => {
    const fc = fcRef.current;
    if (!fc) return;
    const obj = fc.getActiveObject();
    if (!obj || obj._isBackground) return;
    fc.remove(obj);
    fc.renderAll();
  }, []);

  // ── Limpa tudo (preserva bg) ──────────────────────────────────────────────
  const clearElements = useCallback(() => {
    const fc = fcRef.current;
    if (!fc) return;
    const toRemove = fc.getObjects().filter(o => !o._isBackground);
    toRemove.forEach(o => fc.remove(o));
    fc.renderAll();
  }, []);

  // ── Exporta PNG ───────────────────────────────────────────────────────────
  const toDataURL = useCallback(() => {
    const fc = fcRef.current;
    if (!fc) return null;
    // Reseta zoom para exportar em resolução real
    const origZoom = fc.getZoom();
    const origW = fc.getWidth();
    const origH = fc.getHeight();
    fc.setZoom(1);
    fc.setWidth(CANVAS_W);
    fc.setHeight(CANVAS_H);
    const url = fc.toDataURL({ format: 'png', quality: 1 });
    fc.setZoom(origZoom);
    fc.setWidth(origW);
    fc.setHeight(origH);
    fc.renderAll();
    return url;
  }, []);

  return { fcRef, setBackground, setLogo, applyTemplate, updateSelected, removeSelected, clearElements, toDataURL };
}
