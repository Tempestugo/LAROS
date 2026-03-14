import React, { useRef, useState } from 'react';
import { uploadCSV, uploadLogo } from '../utils/api.js';
import './Toolbar.css';

export default function Toolbar({ onStoriesLoaded, onLogoUploaded, onExportAll, storyCount }) {
  const csvRef  = useRef();
  const logoRef = useRef();
  const [loadingCSV,  setLoadingCSV]  = useState(false);
  const [loadingLogo, setLoadingLogo] = useState(false);
  const [msg, setMsg] = useState('');

  function flash(text, isErr = false) {
    setMsg({ text, err: isErr });
    setTimeout(() => setMsg(''), 3000);
  }

  async function handleCSV(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoadingCSV(true);
    try {
      const { stories, total } = await uploadCSV(file);
      onStoriesLoaded(stories);
      flash(`✓ ${total} stories importados`);
    } catch (err) {
      flash(err.message, true);
    } finally {
      setLoadingCSV(false);
      e.target.value = '';
    }
  }

  async function handleLogo(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoadingLogo(true);
    try {
      const { url, filename } = await uploadLogo(file);
      onLogoUploaded({ url, filename });
      flash(`✓ Logo "${filename}" enviada`);
    } catch (err) {
      flash(err.message, true);
    } finally {
      setLoadingLogo(false);
      e.target.value = '';
    }
  }

  return (
    <header className="toolbar">
      <div className="toolbar__brand">
        <span className="toolbar__logo-mark">◆</span>
        <span className="toolbar__name">Story Editor</span>
      </div>

      <div className="toolbar__actions">
        {/* CSV */}
        <input ref={csvRef} type="file" accept=".csv" hidden onChange={handleCSV} />
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => csvRef.current?.click()}
          disabled={loadingCSV}
        >
          {loadingCSV ? <span className="spin">↻</span> : '📋'} Importar CSV
        </button>

        {/* Logo upload */}
        <input ref={logoRef} type="file" accept="image/*" hidden onChange={handleLogo} />
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => logoRef.current?.click()}
          disabled={loadingLogo}
        >
          {loadingLogo ? <span className="spin">↻</span> : '🖼'} Upload Logo
        </button>

        {/* Export all */}
        <button
          className="btn btn-primary btn-sm"
          onClick={onExportAll}
          disabled={storyCount === 0}
        >
          ↓ Exportar Todos ({storyCount})
        </button>
      </div>

      {msg && (
        <div className={`toolbar__msg ${msg.err ? 'err' : 'ok'}`}>
          {msg.text}
        </div>
      )}
    </header>
  );
}
