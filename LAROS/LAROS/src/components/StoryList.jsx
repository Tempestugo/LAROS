import React from 'react';
import './StoryList.css';

export default function StoryList({ stories, activeIndex, onSelect, onAdd, onRemove }) {
  return (
    <aside className="story-list">
      <div className="story-list__header">
        <span className="story-list__title">Stories</span>
        <button className="btn btn-primary btn-sm" onClick={onAdd}>+ Novo</button>
      </div>

      <div className="story-list__items">
        {stories.length === 0 && (
          <div className="story-list__empty">
            Importe um CSV ou crie manualmente
          </div>
        )}
        {stories.map((s, i) => (
          <div
            key={i}
            className={`story-item ${i === activeIndex ? 'story-item--active' : ''}`}
            onClick={() => onSelect(i)}
          >
            <div className="story-item__left">
              <span className={`tag tag-${s.template}`}>{s.template}</span>
              <div className="story-item__info">
                <div className="story-item__titulo">
                  {s.titulo || <em style={{ opacity: .4 }}>sem título</em>}
                </div>
                {s.foto && (
                  <div className="story-item__foto">{s.foto}</div>
                )}
              </div>
            </div>
            <button
              className="story-item__del"
              onClick={(e) => { e.stopPropagation(); onRemove(i); }}
              title="Remover"
            >✕</button>
          </div>
        ))}
      </div>
    </aside>
  );
}
