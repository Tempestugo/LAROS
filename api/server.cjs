const express = require('express');
const fs      = require('fs');
const path    = require('path');
const multer  = require('multer');
const puppeteer = require('puppeteer-core');
const chromium  = require('@sparticuz/chromium');
const JSZip     = require('jszip');
const { execSync } = require('child_process');

let renderTemplate;
(async () => {
  const mod = await import('../src/templates/index.js');
  renderTemplate = mod.renderTemplate;
})();

const projectRoot = path.resolve(__dirname, '..');
const UPLOADS_DIR = path.join(projectRoot, 'public', 'uploads');
const FOTOS_DIR   = path.join(UPLOADS_DIR, 'fotos');
const LOGOS_DIR   = path.join(UPLOADS_DIR, 'logos');

// Força o uso de uma pasta temporária local (Hostinger costuma ter o /tmp bloqueado para execução)
const TMP_DIR     = path.join(projectRoot, 'tmp');
process.env.TMPDIR = TMP_DIR;

[UPLOADS_DIR, FOTOS_DIR, LOGOS_DIR, TMP_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// ─── Auto-Build do Frontend (Resolve o problema do index.html na Hostinger) ───
const distPath = path.join(projectRoot, 'dist');
if (!fs.existsSync(path.join(distPath, 'index.html'))) {
  console.log('⚠️ Frontend (dist) não encontrado. Rodando Vite build automaticamente...');
  try {
    execSync('npm run build', { cwd: projectRoot, stdio: 'inherit' });
    console.log('✅ Frontend compilado com sucesso!');
  } catch (e) {
    console.error('❌ Falha ao compilar o frontend:', e.message);
  }
}

const DB_FILE = path.join(projectRoot, 'data', 'projects.json');
if (!fs.existsSync(path.dirname(DB_FILE))) {
  fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
}

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ extended: true, limit: '200mb' }));

const imageFilter = (req, file, cb) => {
  file.mimetype.startsWith('image/') ? cb(null, true) : cb(new Error('Apenas imagens'), false);
};
const makeStorage = (dir) => multer.diskStorage({
  destination: dir,
  filename: (req, file, cb) => {
    const safe = file.originalname.toLowerCase().replace(/[^a-z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${safe}`);
  },
});
const uploadFoto = multer({ storage: makeStorage(FOTOS_DIR), fileFilter: imageFilter, limits: { fileSize: 20*1024*1024 } });
const uploadLogo = multer({ storage: makeStorage(LOGOS_DIR), fileFilter: imageFilter, limits: { fileSize: 5*1024*1024 } });
const uploadCsv  = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5*1024*1024 } });

app.get('/api/ping', (req, res) => res.json({ ok: true, ts: Date.now() }));

// GET /api/projects — carrega todos os projetos
app.get('/api/projects', (req, res) => {
  try {
    if (!fs.existsSync(DB_FILE)) return res.json({ projects: [] });
    const data = fs.readFileSync(DB_FILE, 'utf8');
    res.json(JSON.parse(data));
  } catch (err) {
    console.error('Erro ao ler projetos:', err);
    res.status(500).json({ error: 'Erro ao carregar projetos' });
  }
});

// POST /api/projects — salva todos os projetos
app.post('/api/projects', (req, res) => {
  try {
    const { projects } = req.body;
    if (!Array.isArray(projects)) return res.status(400).json({ error: 'projects deve ser um array' });

    const jsonStr = JSON.stringify({ projects }, null, 2);
    const sizeMB = Buffer.byteLength(jsonStr, 'utf8') / 1024 / 1024;
    console.log(`Salvando projetos: ${projects.length} projetos, ${sizeMB.toFixed(1)}MB`);

    fs.writeFileSync(DB_FILE, jsonStr, 'utf8');
    res.json({ ok: true, count: projects.length, sizeMB: sizeMB.toFixed(1) });
  } catch (err) {
    console.error('Erro ao salvar projetos:', err);
    res.status(500).json({ error: 'Erro ao salvar projetos' });
  }
});

app.get('/api/files/:type', (req, res) => {
  const dir = req.params.type === 'fotos' ? FOTOS_DIR : LOGOS_DIR;
  fs.readdir(dir, (err, files) => {
    if (err) return res.status(500).json({ error: 'Erro ao ler diretório' });
    res.json(files.filter(f => !f.startsWith('.')).map(f => ({
      name: path.parse(f).name, filename: f, url: `/uploads/${req.params.type}/${f}`
    })));
  });
});
app.post('/api/upload/fotos', uploadFoto.array('fotos', 50), (req, res) => {
  if (!req.files?.length) return res.status(400).json({ error: 'Nenhum arquivo' });
  res.json({ fotos: req.files.map(f => ({ url: `/uploads/fotos/${f.filename}`, filename: f.filename, name: path.parse(f.filename).name })) });
});
app.post('/api/upload/logo', uploadLogo.single('logo'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo' });
  res.json({ url: `/uploads/logos/${req.file.filename}`, filename: req.file.filename, name: path.parse(req.file.filename).name });
});
app.post('/api/upload/csv', uploadCsv.single('csv'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo' });
  res.json({ content: req.file.buffer.toString('utf8') });
});

// ─── Puppeteer Singleton (Otimização de Memória para Hostinger) ───────────────
let browserInstance = null;
async function getBrowser() {
  if (!browserInstance) {
    console.log('🚀 Lançando nova instância do navegador...');
    browserInstance = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: { width: 1080, height: 1920 },
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
    browserInstance.on('disconnected', () => {
      console.log('⚠️ Navegador desconectado. A instância será recriada na próxima requisição.');
      browserInstance = null;
    });
  }
  return browserInstance;
}

app.post('/api/export', async (req, res) => {
  const { stories, logoUrl, projectName } = req.body;
  if (!stories || !Array.isArray(stories)) {
    return res.status(400).json({ error: 'stories ausentes' });
  }

  if (!renderTemplate) return res.status(503).json({ error: 'Templates ainda carregando, tente novamente' });

  try {
    const browser = await getBrowser(); // Usa a instância única
    const page = await browser.newPage();

    const zip = new JSZip();

    for (let i = 0; i < stories.length; i++) {
      const story = stories[i];
      const html = renderTemplate(story, logoUrl);

      await page.setContent(html, { waitUntil: 'domcontentloaded' });
      // Garante scripts e fontes (corrige quadrados/emojis)
      await page.evaluate(() => new Promise(r => requestAnimationFrame(r)));
      await page.evaluate(async () => { await document.fonts.ready; });

      const screenshot = await page.screenshot({ type: 'png' });
      const tpl = story.template || 'A';
      zip.file(`story_${String(i + 1).padStart(2, '0')}_T${tpl}.png`, screenshot);
    }

    await page.close(); // Fecha apenas a aba, mantendo o navegador aberto

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
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

app.use('/uploads', express.static(UPLOADS_DIR));
app.use(express.static(path.join(projectRoot, 'dist')));
app.get('*', (req, res) => {
  const index = path.join(projectRoot, 'dist', 'index.html');
  if (!fs.existsSync(index)) return res.status(404).send('Erro: O frontend não foi compilado. A pasta dist/ não foi gerada pelo Vite no servidor.');
  res.sendFile(index);
});

app.listen(PORT, '0.0.0.0', () => console.log(`🚀 LAROS — porta ${PORT}`));