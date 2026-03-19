const { execSync } = require('child_process');
try {
  const fonts = execSync('fc-list | grep -i noto').toString();
  console.log('✅ Fontes Noto encontradas:', fonts.slice(0, 200));
} catch (e) {
  console.log('❌ Noto Color Emoji NÃO instalada — usando Twemoji SVG');
}

const express        = require('express');
const cors           = require('cors');
const puppeteer      = require('puppeteer-core');
const chromium       = require('@sparticuz/chromium');
const JSZip          = require('jszip');
const https          = require('https');
const twemojiParser  = require('twemoji-parser');

// Import dinâmico dos templates ESM
let renderTemplate;
(async () => {
  const mod = await import('./src/templates/index.js');
  renderTemplate = mod.renderTemplate;
})();

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ extended: true, limit: '200mb' }));

app.get('/api/ping', (req, res) => res.json({ ok: true }));

// Cache de SVGs de emoji — baixa uma vez, reutiliza
const emojiCache = {};

function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function emojiParaBase64(texto) {
  if (!texto) return texto;
  const entities = twemojiParser.parse(texto, { assetType: 'svg' });
  if (!entities.length) return texto;

  let resultado = texto;
  for (let i = entities.length - 1; i >= 0; i--) {
    const e = entities[i];
    if (!emojiCache[e.url]) {
      try {
        const buf = await fetchBuffer(e.url);
        emojiCache[e.url] = `data:image/svg+xml;base64,${buf.toString('base64')}`;
      } catch {
        console.warn(`⚠️ Falha ao baixar emoji: ${e.url}`);
        emojiCache[e.url] = null;
      }
    }
    if (emojiCache[e.url]) {
      const img = `<img src="${emojiCache[e.url]}" style="height:1em;width:1em;vertical-align:-0.1em;display:inline-block;" alt="${e.text}">`;
      resultado = resultado.slice(0, e.indices[0]) + img + resultado.slice(e.indices[1]);
    }
  }
  return resultado;
}

app.post('/api/export', async (req, res) => {
  const { stories, logoUrl, projectName } = req.body;
  if (!stories || !Array.isArray(stories)) {
    return res.status(400).json({ error: 'stories ausentes' });
  }
  if (!renderTemplate) {
    return res.status(503).json({ error: 'Templates ainda carregando, tente em 2 segundos' });
  }

  console.log(`\n🚀 Iniciando exportação de ${stories.length} stories: "${projectName || 'sem nome'}"`);

  try {
    const zip = new JSZip();

    for (let i = 0; i < stories.length; i++) {
      const story = stories[i];
      console.log(`⏳ [${i + 1}/${stories.length}] Iniciando: ${story.titulo || 'sem título'}`);

      // Substitui emojis por SVG base64 inline
      const storyClean = {
        ...story,
        titulo:    await emojiParaBase64(story.titulo),
        subtitulo: await emojiParaBase64(story.subtitulo),
        cta:       await emojiParaBase64(story.cta),
      };

      const html = renderTemplate(storyClean, logoUrl);

      const browser = await puppeteer.launch({
        args: [
          ...chromium.args,
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--single-process',
          '--no-zygote',
          '--font-render-hinting=none',
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
    console.log(`🎉 ZIP gerado! ${(zipBuffer.length / 1024 / 1024).toFixed(2)} MB`);

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
