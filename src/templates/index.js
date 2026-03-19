export { templateA } from './templateA.js';
export { templateB } from './templateB.js';
export { templateC } from './templateC.js';
export { templateD } from './templateD.js';
export { templateE } from './templateE.js';
export { templateF } from './templateF.js';
export { templateG } from './templateG.js';
export { templateH } from './templateH.js';

import { templateA } from './templateA.js';
import { templateB } from './templateB.js';
import { templateC } from './templateC.js';
import { templateD } from './templateD.js';
import { templateE } from './templateE.js';
import { templateF } from './templateF.js';
import { templateG } from './templateG.js';
import { templateH } from './templateH.js';

export const TEMPLATES = { A: templateA, B: templateB, C: templateC, D: templateD, E: templateE, F: templateF, G: templateG, H: templateH };

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