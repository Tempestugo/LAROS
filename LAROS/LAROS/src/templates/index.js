// Configurações de cada template — usadas para montar o canvas Fabric.js
// Cada template descreve quais elementos são gerados e suas posições default

export const TEMPLATES = {
  A: {
    name: 'Template A',
    description: 'Pill cream no topo + faixa diagonal colorida no rodapé',
    elements: (data) => [
      {
        id: 'titulo',
        type: 'textbox',
        text: data.titulo || 'Título',
        left: 72, top: 190,
        width: 880,
        fontSize: 72, fontFamily: 'Fraunces', fontWeight: '900',
        fill: data.cor,
        backgroundColor: '#FFF8EE',
        padding: 22,
        borderRadius: 999,
      },
      {
        id: 'subtitulo',
        type: 'textbox',
        text: data.subtitulo || 'Subtítulo',
        left: 72, top: 1580,
        width: 880,
        fontSize: 48, fontFamily: 'Nunito', fontWeight: '700',
        fill: '#ffffff',
        backgroundColor: data.cor,
        padding: 18,
      },
      {
        id: 'endereco',
        type: 'textbox',
        text: '📍 ' + (data.endereco || ''),
        left: 220, top: 1740,
        width: 760,
        fontSize: 32, fontFamily: 'Nunito', fontWeight: '700',
        fill: '#FFF8EE',
      },
    ]
  },

  B: {
    name: 'Template B',
    description: 'Highlight colorido no topo + card cream centralizado',
    elements: (data) => [
      {
        id: 'titulo',
        type: 'textbox',
        text: data.titulo || 'Título',
        left: 72, top: 110,
        width: 936,
        fontSize: 92, fontFamily: 'Playfair Display', fontWeight: '900',
        fill: '#ffffff',
        backgroundColor: data.cor,
        padding: 12,
      },
      {
        id: 'subtitulo',
        type: 'textbox',
        text: data.subtitulo || 'Subtítulo',
        left: 72, top: 1570,
        width: 880,
        fontSize: 46, fontFamily: 'Lato', fontWeight: '700',
        fill: '#2a1408',
        backgroundColor: 'rgba(255,248,235,0.92)',
        padding: 22,
      },
      {
        id: 'cta',
        type: 'textbox',
        text: data.cta || '',
        left: 700, top: 1800,
        width: 340,
        fontSize: 40, fontFamily: 'Lato', fontWeight: '700',
        fill: '#1a1a1a',
        backgroundColor: '#ffffff',
        padding: 20,
        textAlign: 'center',
      },
    ]
  },

  C: {
    name: 'Template C',
    description: 'Foto dominante + título itálico grande no rodapé',
    elements: (data) => [
      {
        id: 'titulo',
        type: 'textbox',
        text: data.titulo || 'Título',
        left: 72, top: 1650,
        width: 936,
        fontSize: 104, fontFamily: 'Fraunces', fontWeight: '900',
        fontStyle: 'italic',
        fill: '#FFF8EE',
        shadow: '0px 4px 32px rgba(0,0,0,0.70)',
      },
      {
        id: 'subtitulo',
        type: 'textbox',
        text: data.subtitulo || '',
        left: 72, top: 1820,
        width: 700,
        fontSize: 44, fontFamily: 'Nunito', fontWeight: '700',
        fill: '#ffffff',
        backgroundColor: data.cor,
        padding: 16,
      },
    ]
  },

  D: {
    name: 'Template D',
    description: 'Centralizado — pill título no topo + CTA no rodapé',
    elements: (data) => [
      {
        id: 'titulo',
        type: 'textbox',
        text: data.titulo || 'Título',
        left: 70, top: 90,
        width: 940,
        fontSize: 84, fontFamily: 'Fraunces', fontWeight: '900',
        fill: data.cor,
        backgroundColor: '#FFF8EE',
        padding: 26,
        textAlign: 'center',
      },
      {
        id: 'subtitulo',
        type: 'textbox',
        text: data.subtitulo || '',
        left: 70, top: 240,
        width: 940,
        fontSize: 36, fontFamily: 'Nunito', fontWeight: '700',
        fill: '#ffffff',
        backgroundColor: data.cor,
        padding: 16,
        textAlign: 'center',
      },
      {
        id: 'cta',
        type: 'textbox',
        text: data.cta || '',
        left: 70, top: 1710,
        width: 940,
        fontSize: 76, fontFamily: 'Fraunces', fontWeight: '900',
        fill: data.cor,
        backgroundColor: '#FFF8EE',
        padding: 28,
        textAlign: 'center',
      },
      {
        id: 'endereco',
        type: 'textbox',
        text: '📍 ' + (data.endereco || ''),
        left: 70, top: 1840,
        width: 940,
        fontSize: 30, fontFamily: 'Nunito', fontWeight: '700',
        fill: '#2a1408',
        backgroundColor: '#FFF8EE',
        padding: 14,
        textAlign: 'center',
      },
    ]
  },

  E: {
    name: 'Template E',
    description: 'Enquete — overlay bege + card colorido central',
    elements: (data) => [
      {
        id: 'subtitulo',
        type: 'textbox',
        text: data.subtitulo || 'Contexto',
        left: 90, top: 780,
        width: 900,
        fontSize: 40, fontFamily: 'Nunito', fontWeight: '700',
        fill: data.cor,
        backgroundColor: '#FFF8EE',
        padding: 16,
        textAlign: 'center',
      },
      {
        id: 'titulo',
        type: 'textbox',
        text: data.titulo || 'Pergunta?',
        left: 40, top: 880,
        width: 1000,
        fontSize: 70, fontFamily: 'Fraunces', fontWeight: '900',
        fill: '#ffffff',
        backgroundColor: data.cor,
        padding: 48,
        textAlign: 'center',
      },
    ]
  },
};

export const TEMPLATE_KEYS = Object.keys(TEMPLATES);

export const FONTS = [
  'Fraunces',
  'Nunito',
  'Playfair Display',
  'Lato',
  'Georgia',
  'Arial',
  'Verdana',
];
