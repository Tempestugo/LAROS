import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import './ProjectsScreen.css';

export default function ProjectsScreen({ projects, setProjects, setActiveProjectId }) {
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', defaultCor: '#e8a030', defaultEndereco: '' });

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newProject.name.trim()) return;

    const project = {
      id: uuidv4(),
      name: newProject.name,
      createdAt: new Date().toISOString(),
      defaultCor: newProject.defaultCor,
      defaultEndereco: newProject.defaultEndereco,
      stories: []
    };

    setProjects([...projects, project]);
    setShowModal(false);
    setNewProject({ name: '', defaultCor: '#e8a030', defaultEndereco: '' });
  };

  const deleteProject = (id) => {
    if(confirm('Tem certeza que deseja excluir este projeto?')) {
      setProjects(projects.filter(p => p.id !== id));
    }
  }

  return (
    <div className="projects-screen">
      <header className="projects-header">
        <h1>◆ LAROS <span className="light">| Projetos</span></h1>
        <button className="btn-primary" onClick={() => setShowModal(true)}>+ Novo Projeto</button>
      </header>

      <main className="projects-grid">
        {projects.length === 0 ? (
          <div className="empty-state">Nenhum projeto criado ainda.</div>
        ) : (
          projects.map(proj => (
            <div key={proj.id} className="project-card">
              <div className="project-card-header">
                <h3>{proj.name}</h3>
                <span className="story-count">{proj.stories?.length || 0} stories</span>
              </div>
              <div className="project-card-footer">
                <button className="btn-secondary" onClick={() => setActiveProjectId(proj.id)}>Abrir</button>
                <button className="btn-danger" onClick={() => deleteProject(proj.id)}>Excluir</button>
              </div>
            </div>
          ))
        )}
      </main>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Novo Projeto</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Nome do projeto</label>
                <input 
                  type="text" 
                  value={newProject.name} 
                  onChange={e => setNewProject({...newProject, name: e.target.value})}
                  placeholder="Ex: Cliente XYZ — Maio 2025"
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label>Cor principal (brand)</label>
                <div className="color-input-wrapper">
                  <input 
                    type="color" 
                    value={newProject.defaultCor} 
                    onChange={e => setNewProject({...newProject, defaultCor: e.target.value})}
                  />
                  <input 
                    type="text" 
                    value={newProject.defaultCor} 
                    onChange={e => setNewProject({...newProject, defaultCor: e.target.value})}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Endereço padrão</label>
                <input 
                  type="text" 
                  value={newProject.defaultEndereco} 
                  onChange={e => setNewProject({...newProject, defaultEndereco: e.target.value})}
                  placeholder="R. Ártico, Jardim do Mar, SBC"
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">Criar Projeto</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}