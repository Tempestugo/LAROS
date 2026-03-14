import React, { useRef, useState } from 'react';
import StoryCanvas from './components/StoryCanvas';
import './EditorScreen.css';

export default function EditorScreen({ project, setProjects, setActiveProjectId }) {
  const canvasRef = useRef(null);
  const [activeObject, setActiveObject] = useState(null);
  
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
    
    // Pede ao Canvas para renderizar
    setTimeout(() => {
      if (canvasRef.current) canvasRef.current.loadTemplateA(testData);
    }, 100); // Aguarda o componente montar
  };

  const handleColorChange = (e) => {
    if (!activeObject || !canvasRef.current) return;
    activeObject.set('fill', e.target.value);
    canvasRef.current.getCanvas().renderAll();
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

  return (
    <div className="editor-screen">
      <header className="editor-toolbar">
         <div className="toolbar-left">
            <span className="logo-text">◆ LAROS</span>
            <span className="separator">/</span>
            <button className="breadcrumb-btn" onClick={() => setActiveProjectId(null)}>Projetos</button>
            <span className="separator">/</span>
            <span className="project-name">{project.name}</span>
         </div>
         <div className="toolbar-right">
            <button className="btn-icon">
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
              Importar CSV
            </button>
            <button className="btn-icon">
               <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              Upload Logo
            </button>
            <button className="btn-primary">Exportar Todos</button>
         </div>
      </header>

      <main className="editor-workspace">
        {(!project.stories || project.stories.length === 0) ? (
          <div className="welcome-zone">
            <h2>Comece a criar para {project.name}</h2>
            <div className="action-cards">
              <div className="action-card">
                <div className="icon-wrapper">
                  <svg viewBox="0 0 24 24" width="48" height="48" stroke="var(--accent)" strokeWidth="1.5" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                </div>
                <h3>Importar CSV</h3>
                <p>Gere stories em massa a partir de uma planilha de dados</p>
              </div>
              <div className="action-card">
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
               {/* Futura lista de thumbnails aqui */}
            </div>
            
            {/* 2. Área do Canvas */}
            <div className="canvas-area">
              <StoryCanvas 
                ref={canvasRef} 
                onSelectObject={setActiveObject} 
                onClearSelection={() => setActiveObject(null)} 
              />
            </div>
            
            {/* 3. Painel de Propriedades Direita */}
            <div className="sidebar-right">
               <div className="panel-header">Propriedades</div>
               
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