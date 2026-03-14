import React, { useState, useEffect, useRef, useCallback } from 'react';
import Toolbar from './components/Toolbar.jsx';
import StoryList from './components/StoryList.jsx';
import CanvasEditor from './components/CanvasEditor.jsx';
import PropertiesPanel from './components/PropertiesPanel.jsx';
import { fetchFotos, fetchLogos } from './utils/api.js';
import './App.css';

let _idCounter = 1;
function makeId() { return `story_${_idCounter++}`; }

function newStory(overrides = {}) {
  return {
    id: makeId(),
    titulo: '',
    subtitulo: '',
    cta: '',
    foto: '',
    cor: '#C47B2B',
    template: 'A',
    endereco: '',
    logoFile: '',
    ...overrides,
  };
}

export default function App() {
  const [stories, setStories]         = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [selectedObj, setSelectedObj] = useState(null);
  const [fotos, setFotos]             = useState([]);
  const [logos, setLogos]             = useState([]);
  const [exporting, setExporting]     = useState(false);

  // Ref into CanvasEditor's Fabric API
  const fabricRef = useRef(null);

  // ── Carrega fotos e logos disponíveis ─────────────────────────────────────
  useEffect(() => {
    fetchFotos().then(d => setFotos(d.fotos || [])).catch(() => {});
    fetchLogos().then(d => setLogos(d.logos || [])).catch(() => {});
  }, []);

  // Recarrega logos quando um novo é enviado
  const refreshLogos = useCallback(() => {
    fetchLogos().then(d => setLogos(d.logos || [])).catch(() => {});
  }, []);

  const activeStory = activeIndex !== null ? stories[activeIndex] : null;

  // ── CRUD de stories ───────────────────────────────────────────────────────
  function handleAdd() {
    const s = newStory();
    setStories(prev => [...prev, s]);
    setActiveIndex(stories.length);
  }

  function handleRemove(i) {
    setStories(prev => prev.filter((_, idx) => idx !== i));
    setActiveIndex(prev => {
      if (prev === null) return null;
      if (i === prev) return stories.length > 1 ? Math.max(0, prev - 1) : null;
      if (i < prev) return prev - 1;
      return prev;
    });
  }

  function handleSelect(i) {
    setActiveIndex(i);
    setSelectedObj(null);
  }

  function handleStoryChange(updated) {
    setStories(prev => prev.map((s, i) => i === activeIndex ? updated : s));
  }

  // ── CSV import ────────────────────────────────────────────────────────────
  function handleStoriesLoaded(imported) {
    const withIds = imported.map(s => newStory(s));
    setStories(prev => [...prev, ...withIds]);
    setActiveIndex(stories.length); // aponta para o primeiro importado
  }

  // ── Logo upload callback ──────────────────────────────────────────────────
  function handleLogoUploaded({ url, filename }) {
    refreshLogos();
    // Aplica automaticamente ao story ativo
    if (activeIndex !== null) {
      handleStoryChange({ ...activeStory, logoFile: filename });
      fabricRef.current?.setLogo(url);
    }
  }

  // ── Fabric callbacks ──────────────────────────────────────────────────────
  function handleSetBackground(fotoName) {
    const f = fotos.find(x => x.name === fotoName);
    if (f) fabricRef.current?.setBackground(f.url);
  }

  function handleSetLogo(filename) {
    const l = logos.find(x => x.filename === filename);
    if (l) fabricRef.current?.setLogo(l.url);
  }

  function handleApplyTemplate(key) {
    if (!activeStory) return;
    fabricRef.current?.applyTemplate(key, {
      titulo:    activeStory.titulo,
      subtitulo: activeStory.subtitulo,
      cta:       activeStory.cta,
      cor:       activeStory.cor,
      endereco:  activeStory.endereco,
    });
  }

  function handleUpdateSelected(props) {
    fabricRef.current?.updateSelected(props);
    // Reflecte mudanças no selectedObj local p/ o painel
    setSelectedObj(prev => prev ? { ...prev, ...props } : prev);
  }

  function handleRemoveSelected() {
    fabricRef.current?.removeSelected();
    setSelectedObj(null);
  }

  // ── Export single ─────────────────────────────────────────────────────────
  function handleExport() {
    const dataUrl = fabricRef.current?.toDataURL();
    if (!dataUrl) return;
    const a = document.createElement('a');
    const name = activeStory?.foto || `story_${activeIndex + 1}`;
    a.href = dataUrl;
    a.download = `${name}_T${activeStory?.template || 'A'}.png`;
    a.click();
  }

  // ── Export all (sequencial, um por um) ───────────────────────────────────
  async function handleExportAll() {
    if (!stories.length) return;
    setExporting(true);

    // Para exportar todos precisamos renderizar cada um.
    // Estratégia: percorre cada story, aplica no canvas, exporta.
    for (let i = 0; i < stories.length; i++) {
      setActiveIndex(i);
      // Aguarda render do canvas (dois frames)
      await new Promise(r => setTimeout(r, 600));
      const dataUrl = fabricRef.current?.toDataURL();
      if (dataUrl) {
        const s = stories[i];
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `story_${String(i + 1).padStart(2, '0')}_T${s.template || 'A'}.png`;
        a.click();
        await new Promise(r => setTimeout(r, 400));
      }
    }
    setExporting(false);
  }

  return (
    <div className="app">
      <Toolbar
        onStoriesLoaded={handleStoriesLoaded}
        onLogoUploaded={handleLogoUploaded}
        onExportAll={handleExportAll}
        storyCount={stories.length}
      />

      <div className="workspace">
        <StoryList
          stories={stories}
          activeIndex={activeIndex}
          onSelect={handleSelect}
          onAdd={handleAdd}
          onRemove={handleRemove}
        />

        {activeStory ? (
          <CanvasEditor
            story={activeStory}
            fotos={fotos}
            logos={logos}
            onSelectObj={setSelectedObj}
            selectedObj={selectedObj}
            fabricRef={fabricRef}
          />
        ) : (
          <EmptyState onAdd={handleAdd} onImport={() => document.querySelector('input[type=file]')?.click()} />
        )}

        <PropertiesPanel
          story={activeStory}
          onStoryChange={handleStoryChange}
          selectedObj={selectedObj}
          onUpdateSelected={handleUpdateSelected}
          onRemoveSelected={handleRemoveSelected}
          fotos={fotos}
          logos={logos}
          onSetBackground={handleSetBackground}
          onSetLogo={handleSetLogo}
          onApplyTemplate={handleApplyTemplate}
          onExport={handleExport}
        />
      </div>

      {exporting && (
        <div className="export-overlay">
          <div className="export-modal">
            <div className="export-spin">↻</div>
            <div>Exportando stories...</div>
            <div style={{ fontSize: 12, opacity: .6, marginTop: 4 }}>
              Os downloads vão aparecer um a um no seu navegador
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyState({ onAdd }) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">◆</div>
      <h2 className="empty-state__title">Nenhum story selecionado</h2>
      <p className="empty-state__desc">
        Importe um CSV com seus stories ou crie um manualmente.
      </p>
      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        <button className="btn btn-primary" onClick={onAdd}>+ Criar story</button>
      </div>
    </div>
  );
}
