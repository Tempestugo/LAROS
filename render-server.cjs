// Instala fontes de emoji no Linux se não existirem
const { execSync } = require('child_process');
try {
  execSync('fc-list | grep -i noto', { stdio: 'pipe' });
} catch {
  try {
    execSync('apt-get install -y fonts-noto-color-emoji 2>/dev/null || true', { stdio: 'pipe' });
  } catch {}
}

const express   = require('express');
const cors      = require('cors');
const puppeteer = require('puppeteer-core');
const chromium  = require('@sparticuz/chromium');
const JSZip     = require('jszip');

// Import dinâmico dos templates ESM
let renderTemplate;
(async () => {
  const mod = await import('./src/templates/index.js');
  renderTemplate = mod.renderTemplate;
})();

const app  = express();
const PORT = process.env.PORT || 3001;

// Aceitar requisições do frontend na Hostinger
app.use(cors({
  origin: '*'
}));
app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ extended: true, limit: '200mb' }));

app.get('/api/ping', (req, res) => res.json({ ok: true }));

app.post('/api/export', async (req, res) => {
  const { stories, logoUrl, projectName } = req.body;
  if (!stories || !Array.isArray(stories)) {
    return res.status(400).json({ error: 'stories ausentes' });
  }
  if (!renderTemplate) {
    return res.status(503).json({ error: 'Templates ainda carregando, tente em 2 segundos' });
  }

  console.log(`\n🚀 Iniciando exportação de ${stories.length} stories do projeto: "${projectName || 'sem nome'}"`);

  try {
    const zip  = new JSZip();

    // Remove emojis do texto para evitar problema de fonte no servidor
    function removeEmojis(str) {
      if (!str) return str;
      return str.replace(/[\u{1F300}-\u{1FFFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F000}-\u{1F02F}\u{1F0A0}-\u{1F0FF}\u{1F100}-\u{1F1FF}\u{1F200}-\u{1F2FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}]/gu, '').trim();
    }

    for (let i = 0; i < stories.length; i++) {
      const story = stories[i];
      console.log(`⏳ [${i + 1}/${stories.length}] Iniciando: ${story.titulo || 'sem título'}`);
      
      const storyClean = {
        ...story,
        titulo:    removeEmojis(story.titulo),
        subtitulo: removeEmojis(story.subtitulo),
        cta:       removeEmojis(story.cta),
      };
      const html  = renderTemplate(storyClean, logoUrl);

      // Abre e fecha browser a cada story para liberar memória
      const browser = await puppeteer.launch({
        args: [
          ...chromium.args,
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--single-process',
          '--no-zygote',
        ],
        defaultViewport: { width: 1080, height: 1920 },
        executablePath: await chromium.executablePath(),
        headless: true,
      });

      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'domcontentloaded' });
      
      console.log(`🖼️  [${i + 1}/${stories.length}] Renderizando...`);
      await page.evaluate(() =>
        new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))
      );

      const screenshot = await page.screenshot({ type: 'png' });
      await browser.close();
      console.log(`✅ [${i + 1}/${stories.length}] Concluído: ${story.titulo || 'sem título'}`);

      const tpl = story.template || 'A';
      zip.file(`story_${String(i + 1).padStart(2, '0')}_T${tpl}.png`, screenshot);
    }

    console.log(`📦 Gerando ZIP com ${stories.length} stories...`);
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
    console.log(`🎉 ZIP gerado com sucesso! Tamanho: ${(zipBuffer.length / 1024 / 1024).toFixed(2)} MB. Enviando para o cliente...`);
    
    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${(projectName || 'stories').replace(/[^a-zA-Z0-9_-]/g, '_')}_export.zip"`,
    });
    res.send(zipBuffer);

  } catch (err) {
    console.error('Erro na exportação:', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`LAROS Export Server — porta ${PORT}`));