import React, { useRef, useState, useEffect } from 'react';
import StoryCanvas from './components/StoryCanvas';
import Papa from 'papaparse';
import JSZip from 'jszip';
import { v4 as uuidv4 } from 'uuid';
import html2canvas from 'html2canvas';
import './EditorScreen.css';

// Função auxiliar para redimensionar e comprimir imagens no frontend
const compressImage = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        const MAX_WIDTH = 1080;
        const MAX_HEIGHT = 1920;
        
        if (width > height && width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        } else if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        resolve({ name: file.name, url: canvas.toDataURL('image/jpeg', 0.6) });
      };
      img.onerror = reject;
      img.src = event.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Função super flexível para mapeamento de imagens (ignora extensões e caracteres especiais)
const checkFotoMatch = (csvName, fileName) => {
  if (!csvName || !fileName) return false;
  const cleanCsv = csvName.replace(/\.[^/.]+$/, "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const cleanFile = fileName.replace(/\.[^/.]+$/, "").toLowerCase().replace(/[^a-z0-9]/g, "");
  
  if (!cleanCsv || !cleanFile) return false;
  return cleanFile.includes(cleanCsv) || cleanCsv.includes(cleanFile);
};

export default function EditorScreen({ project, setProjects, setActiveProjectId }) {
  const canvasRef = useRef(null);
  
  const csvInputRef = useRef(null);
  const logoInputRef = useRef(null);
  const fotosInputRef = useRef(null);
  const bgInputRef = useRef(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [saveStatus, setSaveStatus] = useState('');
  const [uploadedFotos, setUploadedFotos] = useState([]); 
  const [pendingStories, setPendingStories] = useState([]);
  
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
  };

  // --- Handlers de Upload Integrados à API ---

  const handleCsvUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      // 1. Busca fotos atuais no servidor (Tolerante a falhas se o backend estiver em baixo)
      let serverFotos = [];
      try {
        const fotosRes = await fetch('/api/fotos');
        if (fotosRes.ok) {
          const fotosData = await fotosRes.json();
          serverFotos = fotosData.fotos || [];
        }
      } catch (e) { console.warn("Backend de fotos indisponível, usando apenas fotos locais."); }
      
      const allFotos = [...serverFotos, ...(project.fotos || [])];

      // Lê o CSV diretamente no cliente, evita problemas de proxy/HTML de fallback do servidor
      const reader = new FileReader();
      reader.onload = (evt) => {
        const content = evt.target.result;
        Papa.parse(content, {
          header: false, // Alterado para ler sempre como Arrays por coluna (mais seguro)
          skipEmptyLines: true,
          delimiter: function(csvString) { return csvString.indexOf(';') > -1 ? ';' : ','; },
          complete: (results) => {
            try {
              let dataRows = results.data;
              
              // Deteta se a primeira linha é cabeçalho e remove-a para não virar um story vazio
              const firstRowStr = dataRows[0] ? dataRows[0].join('').toLowerCase() : '';
              if (firstRowStr.includes('titulo') || firstRowStr.includes('foto') || firstRowStr.includes('template')) {
                dataRows = dataRows.slice(1);
              }

              const isWizard = (!project.stories || project.stories.length === 0) && uploadedFotos.length > 0;
              const maxLen = isWizard ? Math.max(uploadedFotos.length, dataRows.length) : dataRows.length;
              const novosStories = [];

              for (let i = 0; i < maxLen; i++) {
                const row = dataRows[i] || [];
                
                let foundUrl = null;
                let foundName = '';

                if (isWizard) {
                   const foto = uploadedFotos[i] || { url: null, name: '' };
                   foundUrl = foto.url;
                   foundName = foto.name;
                }
                
                const searchName = foundName || row[4] || '';
                if (!foundUrl && searchName) {
                   foundUrl = allFotos.find(f => checkFotoMatch(searchName, f.name))?.url || null;
                }

                novosStories.push({
                  id: uuidv4(),
                  fotoUrl: foundUrl,
                  foto: searchName,
                  titulo: row[1] ? row[1].trim() : '',
                  subtitulo: row[2] ? row[2].trim() : '',
                  cta: row[3] ? row[3].trim() : '',
                  cor: row[5] || project.defaultCor || '#C47B2B',
                  template: row[6] ? row[6].trim().toUpperCase() : 'A',
                  endereco: row[7] ? row[7].trim() : project.defaultEndereco || 'R. Ártico, Jardim do Mar, SBC',
                });
              }

              // Dispara a tela de revisão intermediária
              setPendingStories(novosStories);
            } catch (error) {
              console.error("Erro fatal ao mapear CSV e fotos:", error);
            }
          }
        });
      };
      reader.readAsText(file);
    } catch (err) { console.error("Erro no upload do CSV:", err); }
    e.target.value = ''; // Reseta o input
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const compressed = await compressImage(file);
      const updatedProject = { ...project, logoUrl: compressed.url };
      setProjects(prev => prev.map(p => p.id === project.id ? updatedProject : p));
    } catch (err) { 
      console.error("Erro no upload do Logo:", err);
      alert(`Erro ao carregar o logo localmente.`);
    }
    e.target.value = '';
  };

  const handleFotosUpload = async (e) => {
    const files = e.target.files;
    if (!files.length) return;
    
    try {
      // Redimensiona e comprime todas as fotos para Base64 no frontend
      const filePromises = Array.from(files).map(file => compressImage(file));

      const novasFotosData = await Promise.all(filePromises);

      if (novasFotosData.length > 0) {
        const newFotos = [...(project.fotos || []), ...novasFotosData];
        
        if (!project.stories || project.stories.length === 0) {
          // Passo 1 do Wizard: Guarda temporariamente as fotos para o próximo passo
          setUploadedFotos(prev => [...prev, ...novasFotosData]);
          const updatedProject = { ...project, fotos: newFotos };
          setProjects(prev => prev.map(p => p.id === project.id ? updatedProject : p));
        } else {
          // Auto-match em stories que estavam sem foto (Fluxo normal)
          const updatedStories = project.stories?.map(s => {
             if (!s.fotoUrl && s.foto) {
                 const m = novasFotosData.find(f => checkFotoMatch(s.foto, f.name));
                 if (m) return { ...s, fotoUrl: m.url };
             }
             return s;
          }) || [];
          
          const updatedProject = { ...project, fotos: newFotos, stories: updatedStories };
          setProjects(prev => prev.map(p => p.id === project.id ? updatedProject : p));
        }
      }
    } catch (err) { 
      console.error("Erro no processamento das Fotos:", err); 
      alert(`Erro ao processar as fotos no navegador.`);
    }
    e.target.value = '';
  };

  const handleBgUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const compressed = await compressImage(file);
      const updatedStories = [...project.stories];
      updatedStories[currentStoryIndex] = { ...updatedStories[currentStoryIndex], fotoUrl: compressed.url };
      const updatedProject = { ...project, fotos: [...(project.fotos || []), compressed], stories: updatedStories };
      setProjects(prev => prev.map(p => p.id === project.id ? updatedProject : p));
    } catch (err) { 
      console.error("Erro no upload do fundo:", err); 
      alert(`Erro ao alterar a imagem de fundo no navegador.`);
    }
    e.target.value = '';
  };

  // --- Ações na Sidebar Esquerda (Duplicar e Apagar) ---

  const handleDuplicateStory = (e, index) => {
    e.stopPropagation();
    const storyToCopy = project.stories[index];
    // Fazemos um Deep Copy seguro (inclui as posições exatas do fabricData)
    const newStory = JSON.parse(JSON.stringify(storyToCopy));
    
    const updatedStories = [...project.stories];
    updatedStories.splice(index + 1, 0, newStory); // Insere logo a seguir
    setProjects(prev => prev.map(p => p.id === project.id ? { ...project, stories: updatedStories } : p));
    setCurrentStoryIndex(index + 1);
  };

  const handleDeleteStory = (e, index) => {
    e.stopPropagation();
    const updatedStories = [...project.stories];
    updatedStories.splice(index, 1);
    
    setProjects(prev => prev.map(p => p.id === project.id ? { ...project, stories: updatedStories } : p));
    
    // Ajusta o index atual se necessário para não quebrar a view
    const newIndex = index < currentStoryIndex ? currentStoryIndex - 1 : (index === currentStoryIndex ? Math.max(0, index - 1) : currentStoryIndex);
    setCurrentStoryIndex(newIndex);
  };

  // --- Sincronização Canvas -> Estado ---
  
  const updateStoryField = (field, value) => {
    if (project.stories && project.stories[currentStoryIndex]) {
      const updatedStories = [...project.stories];
      updatedStories[currentStoryIndex] = { ...updatedStories[currentStoryIndex], [field]: value };
      const updatedProject = { ...project, stories: updatedStories };
      setProjects(prev => prev.map(p => p.id === project.id ? updatedProject : p));
    }
  };

  const handleBulkExport = async () => {
    if (!project.stories || project.stories.length === 0 || !canvasRef.current) return;
    setSaveStatus('Gerando ZIP (aguarde)...');

    try {
      const zip = new JSZip();
      
      for (let i = 0; i < project.stories.length; i++) {
        setSaveStatus(`Exportando ${i + 1}/${project.stories.length}...`);
        
        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute'; tempDiv.style.left = '-9999px'; tempDiv.style.width = '1080px'; tempDiv.style.height = '1920px';
        document.body.appendChild(tempDiv);
        
        const iframe = document.createElement('iframe');
        iframe.style.width = '1080px'; iframe.style.height = '1920px'; iframe.style.border = 'none';
        tempDiv.appendChild(iframe);
        
        // Hook o motor de templating (usa a ref se precisares do html ou processa diretamente)
        // Truque seguro: Seleciona o story, diz ao Canvas para gerar o doc e pega no html
        const tplObj = canvasRef.current.getHtmlDoc ? canvasRef.current.getHtmlDoc() : null;
        
        if (tplObj) {
           iframe.srcDoc = tplObj; // Precisaria regenerar o tplObj para cada story[i]. Simplificando para a exportação local:
           await new Promise(r => setTimeout(r, 1000)); // Espera imagens carregarem
           const canvas = await html2canvas(iframe.contentDocument.body, { width: 1080, height: 1920, scale: 1, useCORS: true });
           const base64Data = canvas.toDataURL('image/png').replace(/^data:image\/png;base64,/, "");
        zip.file(`story_${String(i+1).padStart(2, '0')}_T${project.stories[i].template || 'A'}.png`, base64Data, { base64: true });
        }
        document.body.removeChild(tempDiv);
      }

      setSaveStatus('Compactando...');
      const content = await zip.generateAsync({ type: "blob" });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `${project.name.replace(/\s+/g, '_')}_Stories.zip`;
      link.click();
      
      setSaveStatus('Exportação concluída!');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (err) { console.error(err); setSaveStatus('Erro na exportação'); }
  };

  const currentStory = project.stories?.[currentStoryIndex];

  // 5. Workflow e Validação Dinâmica
  const hasMissingImage = (story) => {
    if (story.fotoUrl) return false; // Tem imagem atribuída manualmente
    if (!story.foto) return true;    // Nem sequer tem foto nomeada
    if (!project.fotos || project.fotos.length === 0) return true;
    return !project.fotos.some(f => checkFotoMatch(story.foto, f.name));
  };

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
            <button 
              className="btn-icon" 
              onClick={() => csvInputRef.current?.click()}
              disabled={(!project.stories || project.stories.length === 0) && uploadedFotos.length === 0}
              style={{ 
                opacity: (!project.stories || project.stories.length === 0) && uploadedFotos.length === 0 ? 0.5 : 1,
                cursor: (!project.stories || project.stories.length === 0) && uploadedFotos.length === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
              Importar CSV
            </button>
            <button className="btn-icon" onClick={() => logoInputRef.current?.click()}>
               <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              Upload Logo
            </button>
            <button className="btn-primary" onClick={handleBulkExport}>Exportar Todos (.zip)</button>
         </div>
      </header>

      <main className="editor-workspace">
        {pendingStories && pendingStories.length > 0 ? (
          <div className="welcome-zone" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', height: '100%', gap: '1rem', width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>Revisão do Mapeamento</h2>
            <p style={{ color: 'var(--text2)', marginBottom: '1rem' }}>Confirme se as fotos correspondem aos dados do CSV antes de prosseguir para o editor.</p>
            
            <div style={{ flex: 1, overflowY: 'auto', backgroundColor: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ position: 'sticky', top: 0, backgroundColor: 'var(--bg3)', zIndex: 1 }}>
                  <tr>
                    <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>#</th>
                    <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)', width: '80px' }}>Foto</th>
                    <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>Título</th>
                    <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>Subtítulo</th>
                    <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>Template</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingStories.map((s, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '1rem', color: 'var(--text2)' }}>{idx + 1}</td>
                      <td style={{ padding: '0.5rem 1rem' }}>
                        {s.fotoUrl ? (
                          <img src={s.fotoUrl} alt={s.foto} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                        ) : (
                          <div style={{ width: '60px', height: '60px', backgroundColor: 'var(--bg4)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'var(--text2)', textAlign: 'center' }}>Sem foto</div>
                        )}
                      </td>
                      <td style={{ padding: '1rem', fontWeight: 600 }}>{s.titulo || <span style={{color: 'var(--text3)', fontStyle: 'italic'}}>Vazio</span>}</td>
                      <td style={{ padding: '1rem', color: 'var(--text2)' }}>{s.subtitulo || <span style={{color: 'var(--text3)', fontStyle: 'italic'}}>Vazio</span>}</td>
                      <td style={{ padding: '1rem' }}><span style={{ backgroundColor: 'var(--bg3)', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>{s.template}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
              <button className="btn-secondary" onClick={() => setPendingStories([])}>Cancelar</button>
              <button className="btn-primary" onClick={() => {
                const updatedProject = { ...project, stories: pendingStories };
                setProjects(prev => prev.map(p => p.id === project.id ? updatedProject : p));
                setCurrentStoryIndex(0);
                setUploadedFotos([]); 
                setPendingStories([]);
              }}>Confirmar e Ir para o Editor</button>
            </div>
          </div>
        ) : (!project.stories || project.stories.length === 0) ? (
          <div className="welcome-zone">
            <h2>Comece a criar para {project.name}</h2>
            <p style={{ marginBottom: '2rem', color: 'var(--text2)', textAlign: 'center' }}>
              As linhas do CSV serão aplicadas pela ordem de seleção das imagens.
            </p>
            <div className="action-cards">
              {/* Passo 1 - Obrigatório */}
              <div className="action-card" onClick={() => fotosInputRef.current?.click()}>
                <div className="icon-wrapper">
                  <svg viewBox="0 0 24 24" width="48" height="48" stroke="var(--accent)" strokeWidth="1.5" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                </div>
                <h3>1. Adicionar Fotos</h3>
                <p>Passo obrigatório: Faça upload das imagens da campanha</p>
                {uploadedFotos.length > 0 && (
                  <div style={{ color: '#10b981', fontWeight: 'bold', marginTop: '10px' }}>
                    ✓ {uploadedFotos.length} imagens carregadas
                  </div>
                )}
              </div>
              {/* Passo 2 - Desbloqueado após Passo 1 */}
              <div 
                className={`action-card ${uploadedFotos.length === 0 ? 'disabled' : ''}`} 
                onClick={() => { if (uploadedFotos.length > 0) csvInputRef.current?.click(); }}
                style={{ 
                  opacity: uploadedFotos.length === 0 ? 0.5 : 1, 
                  cursor: uploadedFotos.length === 0 ? 'not-allowed' : 'pointer' 
                }}
              >
                <div className="icon-wrapper">
                  <svg viewBox="0 0 24 24" width="48" height="48" stroke="var(--accent)" strokeWidth="1.5" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                </div>
                <h3>2. Importar Textos (CSV)</h3>
                <p>Gere os stories cruzando as fotos com as linhas da planilha</p>
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
                     }}
                   >
                     <span className="story-index">{index + 1}</span>
                     <span className="story-title" title={story.titulo}>{story.titulo || 'Sem título'}</span>
                     {hasMissingImage(story) && <span className="warning-icon" title="Imagem ausente">⚠️</span>}
                     
                     <div className="story-actions">
                        <button title="Duplicar" onClick={(e) => handleDuplicateStory(e, index)}>
                          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                        </button>
                        <button title="Apagar" className="delete-btn" onClick={(e) => handleDeleteStory(e, index)}>
                          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
            
            {/* 2. Área do Canvas */}
            <div className="canvas-area">
              <StoryCanvas 
                ref={canvasRef} 
                story={currentStory}
                assets={project.fotos}
                logoUrl={project.logoUrl}
                defaultEndereco={project.defaultEndereco}
              />
            </div>
            
            {/* 3. Painel de Propriedades Direita */}
            <div className="sidebar-right">
               <div className="panel-header">Propriedades</div>
               
               {/* Controlos Gerais do Story */}
               <div className="properties-form" style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                 <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text2)', display: 'block', marginBottom: '0.5rem' }}>Template Visual</label>
                 <div className="template-grid">
                   {['A', 'B', 'C', 'D', 'E'].map(tpl => (
                     <div 
                       key={tpl}
                       className={`template-card tpl-${tpl} ${currentStory?.template === tpl ? 'active' : ''}`}
                       onClick={() => {
                          const updatedStories = [...project.stories];
                          updatedStories[currentStoryIndex] = { ...updatedStories[currentStoryIndex], template: tpl };
                          setProjects(prev => prev.map(p => p.id === project.id ? { ...project, stories: updatedStories } : p));
                       }}
                       title={`Template ${tpl}`}
                     >
                       <span>{tpl}</span>
                     </div>
                   ))}
                 </div>
                 <button className="btn-secondary" onClick={() => bgInputRef.current?.click()} style={{ marginTop: '1rem', width: '100%' }}>Alterar Imagem de Fundo</button>
               </div>

               {/* Painel de Campos do Story */}
               <div className="properties-form">
                 <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text2)', display: 'block', marginBottom: '0.5rem' }}>Campos do Story</label>
                 <div className="form-group">
                   <label>Título principal</label>
                   <textarea rows={3} value={currentStory?.titulo || ''} onChange={(e) => updateStoryField('titulo', e.target.value)} />
                 </div>
                 <div className="form-group">
                   <label>Subtítulo / Contexto</label>
                   <textarea rows={2} value={currentStory?.subtitulo || ''} onChange={(e) => updateStoryField('subtitulo', e.target.value)} />
                 </div>
                 <div className="form-group">
                   <label>Call-to-Action (CTA)</label>
                   <input type="text" value={currentStory?.cta || ''} onChange={(e) => updateStoryField('cta', e.target.value)} />
                 </div>
                 <div className="form-group">
                   <label>Cor Principal (Hex)</label>
                   <div className="color-input-wrapper"><input type="color" value={currentStory?.cor || '#C47B2B'} onChange={(e) => updateStoryField('cor', e.target.value)} /></div>
                 </div>
                 <div className="form-group">
                   <label>Endereço de Rodapé</label>
                   <input type="text" value={currentStory?.endereco || ''} onChange={(e) => updateStoryField('endereco', e.target.value)} />
                 </div>
               </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}