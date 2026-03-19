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

  let browser;
  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: { width: 1080, height: 1920 },
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
    const page = await browser.newPage();
    const zip  = new JSZip();

    for (let i = 0; i < stories.length; i++) {
      const story = stories[i];
      const html  = renderTemplate(story, logoUrl);

      await page.setContent(html, { waitUntil: 'domcontentloaded' });
      await page.evaluate(() =>
        new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))
      );

      const screenshot = await page.screenshot({ type: 'png' });
      const tpl = story.template || 'A';
      zip.file(`story_${String(i + 1).padStart(2, '0')}_T${tpl}.png`, screenshot);
    }

    await browser.close();

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${(projectName || 'stories').replace(/[^a-zA-Z0-9_-]/g, '_')}_export.zip"`,
    });
    res.send(zipBuffer);

  } catch (err) {
    if (browser) await browser.close().catch(() => {});
    console.error('Erro na exportação:', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`LAROS Export Server — porta ${PORT}`));