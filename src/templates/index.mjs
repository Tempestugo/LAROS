// Importa todas as funções de template diretamente.
// Assumindo que os arquivos foram renomeados para .mjs para consistência.
import { templateA } from './templateA.mjs';
import { templateB } from './templateB.mjs';
import { templateC } from './templateC.mjs';
import { templateD } from './templateD.mjs';
import { templateE } from './templateE.mjs';
import { templateF } from './templateF.mjs';
import { templateG } from './templateG.mjs';
import { templateH } from './templateH.mjs';

// Cria um mapa de templates para facilitar a busca
const TEMPLATES = {
  A: templateA,
  B: templateB,
  C: templateC,
  D: templateD,
  E: templateE,
  F: templateF,
  G: templateG,
  H: templateH,
};

export function renderTemplate(story, logoUrl) {
  // Usa o template 'A' como padrão caso o solicitado não exista
  const fn = TEMPLATES[story.template] || templateA;
  return fn({
    titulo:    story.titulo    || '',
    subtitulo: story.subtitulo || '',
    cta:       story.cta       || '',
    cor:       story.cor       || '#C47B2B',
    fotoUrl:   story.fotoUrl   || '',
    // Garante que o logo seja ocultado se a flag estiver ativa
    logoUrl:   story.hideLogo ? null : (logoUrl || null),
    endereco:  story.endereco  || '',
  });
}