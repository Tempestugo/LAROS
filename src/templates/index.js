export { templateA } from './templateA.js';
export { templateB } from './templateB.js';
export { templateC } from './templateC.js';
export { templateD } from './templateD.js';
export { templateE } from './templateE.js';

import { templateA } from './templateA.js';
import { templateB } from './templateB.js';
import { templateC } from './templateC.js';
import { templateD } from './templateD.js';
import { templateE } from './templateE.js';

export const TEMPLATES = { A: templateA, B: templateB, C: templateC, D: templateD, E: templateE };

export function renderTemplate(story, logoUrl) {
  const fn = TEMPLATES[story.template] || templateA;
  return fn({
    titulo:    story.titulo    || '',
    subtitulo: story.subtitulo || '',
    cta:       story.cta       || '',
    cor:       story.cor       || '#C47B2B',
    fotoUrl:   story.fotoUrl   || '',
    logoUrl:   story.hideLogo ? null : (logoUrl || null),
    endereco:  story.endereco  || '',
  });
}