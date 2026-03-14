import React from 'react';
import './EditorScreen.css';

export default function EditorScreen({ project, setProjects, setActiveProjectId }) {
  
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
            </div>
          </div>
        ) : (
          <div className="editor-layout">Editor de Canvas entrará aqui</div>
        )}
      </main>
    </div>
  );
}