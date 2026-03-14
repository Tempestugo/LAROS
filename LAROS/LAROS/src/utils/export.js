/**
 * Exporta o canvas Fabric.js como PNG em resolução 1080×1920.
 * Usa a API nativa do Fabric (toDataURL) que renderiza em alta res.
 */
export function exportCanvas(fabricCanvas, filename = 'story.png') {
  // Fabric.js renderiza na resolução real do canvas (1080×1920)
  const dataUrl = fabricCanvas.toDataURL({
    format: 'png',
    quality: 1,
    multiplier: 1,
  });

  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  link.click();
}

/**
 * Exporta todos os stories em batch como arquivos PNG individuais.
 * Retorna array de { filename, dataUrl }
 */
export async function exportBatch(stories, buildCanvas) {
  const results = [];
  for (let i = 0; i < stories.length; i++) {
    const story = stories[i];
    const canvas = await buildCanvas(story);
    const dataUrl = canvas.toDataURL({ format: 'png', quality: 1, multiplier: 1 });
    results.push({
      filename: `story_${String(i + 1).padStart(2, '0')}_T${story.template}.png`,
      dataUrl,
    });
    canvas.dispose();
  }
  return results;
}

/**
 * Baixa múltiplos arquivos um a um (sem JSZip).
 * Para zip real, instale jszip e substitua.
 */
export function downloadAll(files) {
  files.forEach(({ filename, dataUrl }, i) => {
    setTimeout(() => {
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = filename;
      a.click();
    }, i * 300);
  });
}
