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

// Timeout de 15 minutos para a rota de exportação
app.use('/api/export', (req, res, next) => {
  req.setTimeout(900000);  // 15 min
  res.setTimeout(900000);
  next();
});

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

  console.log(`\n🚀 Exportando ${stories.length} stories: "${projectName || 'sem nome'}"`);

  // Libera o body da requisição da memória assim que possível
  const storiesCopy = stories.map(s => ({
    titulo: s.titulo, subtitulo: s.subtitulo, cta: s.cta,
    cor: s.cor, template: s.template, endereco: s.endereco,
    fotoUrl: s.fotoUrl, hideLogo: s.hideLogo,
  }));
  // Não guardar referência ao req.body
  req.body = null;

  try {
    const zip = new JSZip();
    const BATCH_SIZE = 5;

    for (let i = 0; i < storiesCopy.length; i++) {
      const story = storiesCopy[i];
      console.log(`⏳ [${i + 1}/${storiesCopy.length}] Iniciando: ${story.titulo || 'sem título'}`);

      try {
        const storyClean = {
          ...story,
          titulo:    await emojiParaBase64(story.titulo),
          subtitulo: await emojiParaBase64(story.subtitulo),
          cta:       await emojiParaBase64(story.cta),
          endereco:  await emojiParaBase64(story.endereco),
        };
  
        const html = renderTemplate(storyClean, logoUrl);
        // Limpa o fotoUrl do story após gerar o HTML
        storiesCopy[i].fotoUrl = null;
  
        const browser = await puppeteer.launch({
          args: [
            ...chromium.args,
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--single-process',
            '--no-zygote',
            '--memory-pressure-off',
          ],
          defaultViewport: { width: 1080, height: 1920 },
          executablePath: await chromium.executablePath(),
          headless: true,
        });
  
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'domcontentloaded' });
  
        await page.evaluate(() =>
          new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))
        );
  
        const screenshot = await page.screenshot({ type: 'png' });
        await browser.close();
        
        const tpl = story.template || 'A';
        zip.file(`story_${String(i + 1).padStart(2, '0')}_T${tpl}.png`, screenshot);
        console.log(`✅ [${i + 1}/${storiesCopy.length}] Concluído`);

      } catch (err) {
        console.error(`❌ [${i + 1}] Falhou: ${err.message}`);
      }

      // A cada BATCH_SIZE stories, força GC e pausa
      if ((i + 1) % BATCH_SIZE === 0) {
        if (global.gc) global.gc();
        await new Promise(r => setTimeout(r, 1000));
        console.log(`🧹 GC forçado após story ${i + 1}`);
      } else {
        await new Promise(r => setTimeout(r, 300));
      }
    }

    console.log(`📦 Gerando ZIP...`);
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
    console.log(`🎉 ZIP: ${(zipBuffer.length / 1024 / 1024).toFixed(2)}MB`);

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
