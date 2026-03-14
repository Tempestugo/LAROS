import React, { useState, useEffect } from 'react';
import { FONTS, TEMPLATE_KEYS, TEMPLATES } from '../templates/index.js';
import './PropertiesPanel.css';

export default function PropertiesPanel({
  story,
  onStoryChange,
  selectedObj,
  onUpdateSelected,
  onRemoveSelected,
  fotos,
  logos,
  onSetBackground,
  onSetLogo,
  onApplyTemplate,
  onExport,
}) {
  const [tab, setTab] = useState('story'); // 'story' | 'element'

  useEffect(() => {
    if (selectedObj) setTab('element');
  }, [selectedObj]);

  if (!story) return (
    <aside className="props-panel">
      <div className="props-empty">Selecione um story para editar</div>
    </aside>
  );

  return (
    <aside className="props-panel">
      {/* Tabs */}
      <div className="props-tabs">
        <button className={`props-tab ${tab === 'story' ? 'active' : ''}`} onClick={() => setTab('story')}>
          Story
        </button>
        <button
          className={`props-tab ${tab === 'element' ? 'active' : ''}`}
          onClick={() => setTab('element')}
          disabled={!selectedObj}
        >
          Elemento {selectedObj ? '●' : ''}
        </button>
      </div>

      <div className="props-body">
        {tab === 'story' && (
          <StoryTab
            story={story}
            onChange={onStoryChange}
            fotos={fotos}
            logos={logos}
            onSetBackground={onSetBackground}
            onSetLogo={onSetLogo}
            onApplyTemplate={onApplyTemplate}
            onExport={onExport}
          />
        )}
        {tab === 'element' && selectedObj && (
          <ElementTab
            obj={selectedObj}
            onUpdate={onUpdateSelected}
            onRemove={onRemoveSelected}
          />
        )}
        {tab === 'element' && !selectedObj && (
          <div className="props-empty">Clique em um elemento no canvas para editar</div>
        )}
      </div>
    </aside>
  );
}

// ── Aba Story ─────────────────────────────────────────────────────────────────
function StoryTab({ story, onChange, fotos, logos, onSetBackground, onSetLogo, onApplyTemplate, onExport }) {
  const field = (key, label, type = 'text') => (
    <div className="prop-group">
      <label>{label}</label>
      <input
        type={type}
        value={story[key] || ''}
        onChange={e => onChange({ ...story, [key]: e.target.value })}
      />
    </div>
  );

  return (
    <>
      <div className="prop-section">
        <div className="prop-section__title">Conteúdo</div>
        {field('titulo', 'Título')}
        {field('subtitulo', 'Subtítulo')}
        {field('cta', 'CTA')}
        {field('endereco', 'Endereço')}
      </div>

      <div className="prop-section">
        <div className="prop-section__title">Visual</div>
        <div className="prop-group">
          <label>Template</label>
          <div className="template-grid">
            {TEMPLATE_KEYS.map(k => (
              <button
                key={k}
                className={`tpl-btn ${story.template === k ? 'active' : ''}`}
                onClick={() => { onChange({ ...story, template: k }); onApplyTemplate(k); }}
                title={TEMPLATES[k].description}
              >
                <span className={`tag tag-${k}`}>{k}</span>
                <span className="tpl-btn__name">{TEMPLATES[k].name.replace('Template ', '')}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="prop-group">
          <label>Cor principal</label>
          <div className="color-row">
            <input
              type="color"
              value={story.cor || '#C47B2B'}
              onChange={e => onChange({ ...story, cor: e.target.value })}
              className="color-input"
            />
            <input
              type="text"
              value={story.cor || '#C47B2B'}
              onChange={e => onChange({ ...story, cor: e.target.value })}
              style={{ flex: 1 }}
            />
          </div>
        </div>
      </div>

      <div className="prop-section">
        <div className="prop-section__title">Foto de fundo</div>
        <div className="prop-group">
          <label>Selecionar foto</label>
          <select
            value={story.foto || ''}
            onChange={e => { onChange({ ...story, foto: e.target.value }); onSetBackground(e.target.value); }}
          >
            <option value="">-- escolha --</option>
            {fotos.map(f => (
              <option key={f.filename} value={f.name}>{f.name}</option>
            ))}
          </select>
        </div>
        {story.foto && (
          <div className="foto-preview-wrap">
            {fotos.find(f => f.name === story.foto) && (
              <img
                src={fotos.find(f => f.name === story.foto).url}
                className="foto-preview"
                alt="preview"
              />
            )}
          </div>
        )}
      </div>

      <div className="prop-section">
        <div className="prop-section__title">Logo</div>
        <div className="prop-group">
          <label>Selecionar logo</label>
          <select
            value={story.logoFile || ''}
            onChange={e => { onChange({ ...story, logoFile: e.target.value }); onSetLogo(e.target.value); }}
          >
            <option value="">-- sem logo --</option>
            {logos.map(l => (
              <option key={l.filename} value={l.filename}>{l.filename}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="prop-section">
        <button className="btn btn-primary" style={{ width: '100%' }} onClick={onExport}>
          ↓ Exportar PNG
        </button>
      </div>
    </>
  );
}

// ── Aba Elemento ──────────────────────────────────────────────────────────────
function ElementTab({ obj, onUpdate, onRemove }) {
  const isText = obj.type === 'textbox' || obj.type === 'i-text' || obj.type === 'text';

  return (
    <>
      {isText && (
        <div className="prop-section">
          <div className="prop-section__title">Texto</div>
          <div className="prop-group">
            <label>Conteúdo</label>
            <textarea
              value={obj.text || ''}
              rows={3}
              onChange={e => onUpdate({ text: e.target.value })}
            />
          </div>
          <div className="prop-group">
            <label>Fonte</label>
            <select
              value={obj.fontFamily || 'Nunito'}
              onChange={e => onUpdate({ fontFamily: e.target.value })}
            >
              {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div className="prop-group-row">
            <div className="prop-group" style={{ flex: 1 }}>
              <label>Tamanho</label>
              <input
                type="number"
                value={Math.round(obj.fontSize || 48)}
                min={8} max={200}
                onChange={e => onUpdate({ fontSize: +e.target.value })}
              />
            </div>
            <div className="prop-group" style={{ flex: 1 }}>
              <label>Alinhamento</label>
              <select
                value={obj.textAlign || 'left'}
                onChange={e => onUpdate({ textAlign: e.target.value })}
              >
                <option value="left">Esquerda</option>
                <option value="center">Centro</option>
                <option value="right">Direita</option>
              </select>
            </div>
          </div>
          <div className="prop-group-row">
            <div className="prop-group" style={{ flex: 1 }}>
              <label>Negrito</label>
              <select
                value={obj.fontWeight || 'normal'}
                onChange={e => onUpdate({ fontWeight: e.target.value })}
              >
                <option value="normal">Normal</option>
                <option value="700">700</option>
                <option value="800">800</option>
                <option value="900">900</option>
              </select>
            </div>
            <div className="prop-group" style={{ flex: 1 }}>
              <label>Itálico</label>
              <select
                value={obj.fontStyle || 'normal'}
                onChange={e => onUpdate({ fontStyle: e.target.value })}
              >
                <option value="normal">Normal</option>
                <option value="italic">Itálico</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="prop-section">
        <div className="prop-section__title">Cores</div>
        <div className="prop-group">
          <label>Cor do texto</label>
          <div className="color-row">
            <input
              type="color"
              value={obj.fill || '#ffffff'}
              onChange={e => onUpdate({ fill: e.target.value })}
              className="color-input"
            />
            <input
              type="text"
              value={obj.fill || '#ffffff'}
              onChange={e => onUpdate({ fill: e.target.value })}
              style={{ flex: 1 }}
            />
          </div>
        </div>
        <div className="prop-group">
          <label>Cor de fundo</label>
          <div className="color-row">
            <input
              type="color"
              value={obj.backgroundColor || '#000000'}
              onChange={e => onUpdate({ backgroundColor: e.target.value })}
              className="color-input"
            />
            <input
              type="text"
              value={obj.backgroundColor || ''}
              placeholder="transparente"
              onChange={e => onUpdate({ backgroundColor: e.target.value })}
              style={{ flex: 1 }}
            />
          </div>
        </div>
      </div>

      <div className="prop-section">
        <div className="prop-section__title">Posição</div>
        <div className="prop-group-row">
          <div className="prop-group" style={{ flex: 1 }}>
            <label>X</label>
            <input
              type="number"
              value={Math.round(obj.left || 0)}
              onChange={e => onUpdate({ left: +e.target.value })}
            />
          </div>
          <div className="prop-group" style={{ flex: 1 }}>
            <label>Y</label>
            <input
              type="number"
              value={Math.round(obj.top || 0)}
              onChange={e => onUpdate({ top: +e.target.value })}
            />
          </div>
        </div>
        <div className="prop-group-row">
          <div className="prop-group" style={{ flex: 1 }}>
            <label>Largura</label>
            <input
              type="number"
              value={Math.round(obj.width || 0)}
              onChange={e => onUpdate({ width: +e.target.value })}
            />
          </div>
          <div className="prop-group" style={{ flex: 1 }}>
            <label>Padding</label>
            <input
              type="number"
              value={Math.round(obj.padding || 0)}
              onChange={e => onUpdate({ padding: +e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="prop-section">
        <button className="btn btn-danger btn-sm" style={{ width: '100%' }} onClick={onRemove}>
          🗑 Remover elemento
        </button>
      </div>
    </>
  );
}
