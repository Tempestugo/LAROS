const { execSync } = require('child_process');
try {
  const fonts = execSync('fc-list | grep -i noto').toString();
  console.log('✅ Fontes Noto encontradas:', fonts.slice(0, 200));
} catch (e) {
  console.log('❌ Noto Color Emoji NÃO instalada — usando Twemoji SVG');
}

const express        = require('express');
const cors           = require('cors');
const JSZip          = require('jszip');
const https          = require('https');
const twemojiParser  = require('twemoji-parser');
// puppeteer e chromium carregados sob demanda — evita OOM na inicialização
let puppeteer, chromium;

// Import dinâmico dos templates ESM
let renderTemplate;
(async () => {
  const mod = await import('./src/templates/index.mjs');
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

function fetchImageAsBase64(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? require('https') : require('http');
    protocol.get(url, (res) => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const buf = Buffer.concat(chunks);
        const mime = url.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
        resolve(`data:${mime};base64,${buf.toString('base64')}`);
      });
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

// ─── Puppeteer Singleton (Otimização de Memória) ──────────────────────────────
let browserInstance = null;
async function getBrowser() {
  if (!puppeteer) puppeteer = require('puppeteer-core');
  if (!chromium)  chromium  = require('@sparticuz/chromium');

  if (!browserInstance) {
    browserInstance = await puppeteer.launch({
      args: [...chromium.args, '--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--single-process', '--no-zygote'],
      defaultViewport: { width: 1080, height: 1920 },
      executablePath: await chromium.executablePath(),
      headless: true,
    });
    browserInstance.on('disconnected', () => { browserInstance = null; });
  }
  return browserInstance;
}

app.post('/api/export', async (req, res) => {
  // Carrega puppeteer e chromium só quando necessário
  if (!puppeteer) puppeteer = require('puppeteer-core');
  if (!chromium)  chromium  = require('@sparticuz/chromium');

  const { stories, logoUrl, projectName, logoFilename, hostingerBase } = req.body;
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
    fotoUrl: s.fotoUrl, hideLogo: s.hideLogo, fotoFilename: s.fotoFilename
  }));
  
  const localHostingerBase = hostingerBase || 'https://lightblue-jaguar-801108.hostingersite.com';
  let resolvedLogoUrl = logoUrl;
  const localLogoFilename = logoFilename;

  // Não guardar referência ao req.body
  req.body = null;

  try {
    // Resolve o logo da mesma forma (fora do loop para não baixar N vezes o mesmo logo)
    if (!resolvedLogoUrl && localLogoFilename) {
      try {
        const url = `${localHostingerBase}/uploads/logos/${localLogoFilename}`;
        resolvedLogoUrl = await fetchImageAsBase64(url);
      } catch {}
    }

    const zip = new JSZip();
    const browser = await getBrowser();
    const BATCH_SIZE = 3; // Reduzido para ambientes com pouca memória

    for (let i = 0; i < storiesCopy.length; i++) {
      const story = storiesCopy[i];
      console.log(`⏳ [${i + 1}/${storiesCopy.length}] Iniciando: ${story.titulo || 'sem título'}`);

      try {
        // Resolve a foto — busca do servidor se tiver filename, usa base64 se tiver fotoUrl
        let currentFotoUrl = story.fotoUrl || null;
        if (story.fotoFilename && story.fotoFilename.trim()) {
          try {
            const url = `${localHostingerBase}/uploads/fotos/${story.fotoFilename}`;
            currentFotoUrl = await fetchImageAsBase64(url);
            console.log(`🖼️  Foto carregada: ${story.fotoFilename}`);
          } catch (err) {
            console.warn(`⚠️  Falha ao buscar foto ${story.fotoFilename}: ${err.message}`);
          }
        }

        const storyClean = {
          ...story,
          fotoUrl:   currentFotoUrl,
          titulo:    await emojiParaBase64(story.titulo),
          subtitulo: await emojiParaBase64(story.subtitulo),
          cta:       await emojiParaBase64(story.cta),
          endereco:  await emojiParaBase64(story.endereco),
        };
  
        const html = renderTemplate(storyClean, resolvedLogoUrl);
        // Limpa a fotoUrl do story após gerar o HTML para limpar a memória o mais cedo possível
        storiesCopy[i].fotoUrl = null;
        currentFotoUrl = null;

        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'domcontentloaded' });
  
        // Garante que as fontes carregaram
        await page.evaluate(() => new Promise(r => requestAnimationFrame(r)));
        await page.evaluate(async () => { await document.fonts.ready; });
  
        const screenshot = await page.screenshot({ type: 'png' });
        await page.close();
        
        zip.file(`${i + 1}.png`, screenshot);
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
