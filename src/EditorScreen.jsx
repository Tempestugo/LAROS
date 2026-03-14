import React, { useRef, useState, useEffect } from 'react';
import StoryCanvas from './components/StoryCanvas';
import Papa from 'papaparse';
import './EditorScreen.css';

export default function EditorScreen({ project, setProjects, setActiveProjectId }) {
  const canvasRef = useRef(null);
  
  // Refs para inputs invisíveis
  const csvInputRef = useRef(null);
  const logoInputRef = useRef(null);
  const fotosInputRef = useRef(null);
  const bgInputRef = useRef(null);
  const [activeObject, setActiveObject] = useState(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [saveStatus, setSaveStatus] = useState('');
  
  // Função para testar a renderização do Template A
  const addTestStory = () => {
    const testData = {
      titulo: "Olha esse lanche pronto",
      cor: "#C47B2B",
      fotoUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1080&auto=format&fit=crop", // Imagem genérica para teste
      logoUrl: null // Pode ser '/uploads/logos/logo.jpg' futuramente
    };
    
    // Adiciona o story ao projeto para sair da Welcome Zone
    const updatedProject = { ...project, stories: [testData] };
    setProjects(prev => prev.map(p => p.id === project.id ? updatedProject : p));
    setCurrentStoryIndex(0);
    if (canvasRef.current && canvasRef.current.forceReload) {
      canvasRef.current.forceReload();
    }
  };

  // --- Handlers de Upload Integrados à API ---

  const handleCsvUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('csv', file);

    try {
      const res = await fetch('/api/upload/csv', { method: 'POST', body: formData });
      const data = await res.json();

      if (data.content) {
        Papa.parse(data.content, {
          header: true,
          skipEmptyLines: true,
          delimiter: function(csvString) { return csvString.indexOf(';') > -1 ? ';' : ','; },
          complete: (results) => {
            const parsedStories = results.data.map(row => {
              const values = Object.values(row);
              return {
                titulo: row.Titulo || values[1] || '',
                subtitulo: row.Subtitulo || values[2] || '',
                cta: row.CTA || values[3] || '',
                foto: row.Nome_Foto || values[4] || '',
                cor: row.Cor || values[5] || project.defaultCor || '#C47B2B',
                template: row.Template || values[6] || 'A',
                endereco: row.Endereco || values[7] || project.defaultEndereco || 'R. Ártico, Jardim do Mar, SBC',
              };
            });

            const updatedProject = { ...project, stories: parsedStories };
            setProjects(prev => prev.map(p => p.id === project.id ? updatedProject : p));
            setCurrentStoryIndex(0); // Seleciona automaticamente o primeiro story importado
            if (canvasRef.current && canvasRef.current.forceReload) {
              canvasRef.current.forceReload();
            }
          }
        });
      }
    } catch (err) { console.error("Erro no upload do CSV:", err); }
    e.target.value = ''; // Reseta o input
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('logo', file);
    
    try {
      const res = await fetch('/api/upload/logo', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.url) {
        const updatedProject = { ...project, logoUrl: data.url };
        setProjects(prev => prev.map(p => p.id === project.id ? updatedProject : p));
        if (canvasRef.current && canvasRef.current.forceReload) {
          canvasRef.current.forceReload();
        }
      }
    } catch (err) { console.error("Erro no upload do Logo:", err); }
    e.target.value = '';
  };

  const handleFotosUpload = async (e) => {
    const files = e.target.files;
    if (!files.length) return;
    
    const formData = new FormData();
    Array.from(files).forEach(f => formData.append('fotos', f));

    try {
      const res = await fetch('/api/upload/fotos', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.fotos && data.fotos.length > 0) {
        const updatedProject = { ...project, fotos: [...(project.fotos || []), ...data.fotos] };
        setProjects(prev => prev.map(p => p.id === project.id ? updatedProject : p));
        if (canvasRef.current && canvasRef.current.forceReload) {
          canvasRef.current.forceReload();
        }
      }
    } catch (err) { console.error("Erro no upload das Fotos:", err); }
    e.target.value = '';
  };

  const handleBgUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('fotos', file); // Utiliza a rota de array de fotos para coerência

    try {
      const res = await fetch('/api/upload/fotos', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.fotos && data.fotos.length > 0) {
        const url = data.fotos[0].url;
        
        if (canvasRef.current) canvasRef.current.setBackground(url);

        // Guarda no estado a imagem específica e adiciona-a à galeria geral
        const updatedStories = [...project.stories];
        updatedStories[currentStoryIndex] = { ...updatedStories[currentStoryIndex], fotoUrl: url };
        const updatedProject = { ...project, fotos: [...(project.fotos || []), ...data.fotos], stories: updatedStories };
        setProjects(prev => prev.map(p => p.id === project.id ? updatedProject : p));
      }
    } catch (err) { console.error("Erro no upload do fundo:", err); }
    e.target.value = '';
  };

  // --- Sincronização Canvas -> Estado ---
  
  const handleUpdateStory = (fabricData) => {
    if (project.stories && project.stories[currentStoryIndex]) {
      setSaveStatus('A guardar...');
      const updatedStories = [...project.stories];
      updatedStories[currentStoryIndex] = { ...updatedStories[currentStoryIndex], fabricData };
      const updatedProject = { ...project, stories: updatedStories };
      setProjects(prev => prev.map(p => p.id === project.id ? updatedProject : p));
      
      setTimeout(() => setSaveStatus('Guardado'), 600);
      setTimeout(() => setSaveStatus(''), 2500);
    }
  };
  
  const triggerManualSave = () => {
    if (canvasRef.current) {
      handleUpdateStory(canvasRef.current.getCanvas().toJSON());
    }
  };

  const handleColorChange = (e) => {
    if (!activeObject || !canvasRef.current) return;
    activeObject.set('fill', e.target.value);
    canvasRef.current.getCanvas().renderAll();
    triggerManualSave();
  };

  const handleExport = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current.getCanvas();
    // Multiplica a resolução por 3 (simula alta qualidade)
    const dataUrl = canvas.toDataURL({ format: 'png', multiplier: 3 });
    
    // Dispara download
    const link = document.createElement('a');
    link.download = `story-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  };

  const handleSaveState = () => {
    if (!canvasRef.current) return;
    const json = canvasRef.current.getCanvas().toJSON();
    localStorage.setItem('laros_canvas_save', JSON.stringify(json));
    alert("Estado salvo no LocalStorage!");
  };

  const currentStory = project.stories?.[currentStoryIndex];

  return (
    <div className="editor-screen">
      {/* Inputs Invsíveis para gerenciar o sistema de arquivos */}
      <input type="file" ref={csvInputRef} style={{ display: 'none' }} accept=".csv" onChange={handleCsvUpload} />
      <input type="file" ref={logoInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleLogoUpload} />
      <input type="file" ref={fotosInputRef} style={{ display: 'none' }} accept="image/*" multiple onChange={handleFotosUpload} />
      <input type="file" ref={bgInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleBgUpload} />

      <header className="editor-toolbar">
         <div className="toolbar-left">
            <span className="logo-text">◆ LAROS</span>
            <span className="separator">/</span>
            <button className="breadcrumb-btn" onClick={() => setActiveProjectId(null)}>Projetos</button>
            <span className="separator">/</span>
            <span className="project-name">{project.name}</span>
            {saveStatus && <span className="save-status">{saveStatus}</span>}
         </div>
         <div className="toolbar-right">
            <button className="btn-icon" onClick={() => csvInputRef.current?.click()}>
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
              Importar CSV
            </button>
            <button className="btn-icon" onClick={() => logoInputRef.current?.click()}>
               <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              Upload Logo
            </button>
            <button className="btn-primary" onClick={handleExport}>Exportar Todos</button>
         </div>
      </header>

      <main className="editor-workspace">
        {(!project.stories || project.stories.length === 0) ? (
          <div className="welcome-zone">
            <h2>Comece a criar para {project.name}</h2>
            <div className="action-cards">
              <div className="action-card" onClick={() => csvInputRef.current?.click()}>
                <div className="icon-wrapper">
                  <svg viewBox="0 0 24 24" width="48" height="48" stroke="var(--accent)" strokeWidth="1.5" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                </div>
                <h3>Importar CSV</h3>
                <p>Gere stories em massa a partir de uma planilha de dados</p>
              </div>
              <div className="action-card" onClick={() => fotosInputRef.current?.click()}>
                <div className="icon-wrapper">
                  <svg viewBox="0 0 24 24" width="48" height="48" stroke="var(--accent)" strokeWidth="1.5" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                </div>
                <h3>Adicionar Fotos</h3>
                <p>Faça upload de imagens para a galeria do projeto</p>
              </div>
              <div className="action-card" onClick={addTestStory}>
                <div className="icon-wrapper">
                  <svg viewBox="0 0 24 24" width="48" height="48" stroke="var(--accent)" strokeWidth="1.5" fill="none"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                </div>
                <h3>Testar Editor</h3>
                <p>Abra o canvas interativo com um template de demonstração</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="editor-layout">
            {/* 1. Sidebar Esquerda */}
            <div className="sidebar-left">
               <div className="story-list-header">Stories ({project.stories?.length})</div>
               <div className="story-list">
                 {project.stories?.map((story, index) => (
                   <div 
                     key={index} 
                     className={`story-card ${index === currentStoryIndex ? 'active' : ''}`}
                     onClick={() => {
                       setCurrentStoryIndex(index);
                       setActiveObject(null);
                     }}
                   >
                     <span className="story-index">{index + 1}</span>
                     <span className="story-title">{story.titulo || 'Sem título'}</span>
                   </div>
                 ))}
               </div>
            </div>
            
            {/* 2. Área do Canvas */}
            <div className="canvas-area">
              <StoryCanvas 
                ref={canvasRef} 
                storyIndex={currentStoryIndex}
                story={currentStory}
                assets={project.fotos}
                logoUrl={project.logoUrl}
                onSelectObject={setActiveObject} 
                onClearSelection={() => setActiveObject(null)}
                onUpdateStory={handleUpdateStory}
              />
            </div>
            
            {/* 3. Painel de Propriedades Direita */}
            <div className="sidebar-right">
               <div className="panel-header">Propriedades</div>
               
               {/* Controlos Gerais do Story */}
               <div className="properties-form" style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                 <div className="form-group">
                   <label>Template</label>
                   <select 
                     value={currentStory?.template || 'A'} 
                     onChange={(e) => {
                       const updatedStories = [...project.stories];
                       updatedStories[currentStoryIndex] = { ...updatedStories[currentStoryIndex], template: e.target.value };
                       delete updatedStories[currentStoryIndex].fabricData; // Força render do zero
                       setProjects(prev => prev.map(p => p.id === project.id ? { ...project, stories: updatedStories } : p));
                       setActiveObject(null);
                       if (canvasRef.current) canvasRef.current.forceReload();
                     }}
                   >
                     <option value="A">Template A (Pill Topo)</option>
                     <option value="B">Template B (Highlight Esq.)</option>
                     <option value="C">Template C (Foto Dominante)</option>
                     <option value="D">Template D (Centralizado)</option>
                     <option value="E">Template E (Enquete)</option>
                   </select>
                 </div>
                 <button className="btn-secondary" onClick={() => bgInputRef.current?.click()}>Alterar Imagem de Fundo</button>
               </div>

               {activeObject ? (
                 <div className="properties-form">
                    <div className="form-group">
                      <label>Cor do Preenchimento</label>
                      <div className="color-input-wrapper">
                        <input type="color" value={activeObject.fill || '#ffffff'} onChange={handleColorChange} />
                        <span>{activeObject.fill || '#ffffff'}</span>
                      </div>
                    </div>
                    {activeObject.type === 'i-text' && (
                       <div className="form-group">
                          <label>Tamanho da Fonte</label>
                          <input type="number" defaultValue={activeObject.fontSize} onChange={(e) => {
                            activeObject.set('fontSize', parseInt(e.target.value));
                            canvasRef.current.getCanvas().renderAll();
                            triggerManualSave();
                          }} />
                       </div>
                    )}
                 </div>
               ) : (
                 <div className="empty-properties">Selecione um objeto no canvas para editar suas propriedades.</div>
               )}

               <div className="panel-actions">
                  <button className="btn-secondary" onClick={handleSaveState}>Salvar Projeto</button>
                  <button className="btn-primary" onClick={handleExport}>Gerar Preview</button>
               </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}