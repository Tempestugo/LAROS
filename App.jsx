import React, { useState } from 'react';
import './App.css';

function App() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    setMessage('Iniciando geração, por favor aguarde...');
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Falha ao gerar imagens.');
      }
      setMessage(data.message);
    } catch (error) {
      setMessage(`Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Gerador de Imagens LAROS</h1>
        <p>Clique no botão para iniciar a geração de imagens a partir do arquivo <code>dados.csv</code>.</p>
        <button onClick={handleGenerate} disabled={loading}>
          {loading ? 'Gerando...' : 'Gerar Imagens'}
        </button>
        {message && <p className="message">{message}</p>}
      </header>
    </div>
  );
}

export default App;