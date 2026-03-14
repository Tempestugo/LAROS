import React, { useState, useEffect } from 'react';
import ProjectsScreen from './ProjectsScreen';
import EditorScreen from './EditorScreen';
import { v4 as uuidv4 } from 'uuid';

function App() {
  const [projects, setProjects] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState(null);

  // Carregar projetos do localStorage na inicialização
  useEffect(() => {
    const savedProjects = localStorage.getItem('laros_projects');
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    }
  }, []);

  // Salvar projetos no localStorage sempre que eles mudarem
  useEffect(() => {
    localStorage.setItem('laros_projects', JSON.stringify(projects));
  }, [projects]);

  const activeProject = projects.find(p => p.id === activeProjectId);

  if (!activeProject) {
    return <ProjectsScreen projects={projects} setProjects={setProjects} setActiveProjectId={setActiveProjectId} />;
  }

  return <EditorScreen project={activeProject} setProjects={setProjects} setActiveProjectId={setActiveProjectId} />;
}

export default App;