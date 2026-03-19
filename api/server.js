import express from 'express'
import cors from 'cors'
import multer from 'multer'
import { createReadStream, existsSync, mkdirSync, readdirSync, readFileSync } from 'fs'
import { join, extname, parse, resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { Readable } from 'stream'

import puppeteer from 'puppeteer'
import JSZip from 'jszip'
import { renderTemplate } from '../src/templates/index.js'

// csv-parser é CommonJS — importamos com createRequire
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const csv = require('csv-parser')

const __filename = fileURLToPath(import.meta.url)
const __dirname  = dirname(__filename)
const ROOT       = resolve(__dirname, '..')  // raiz do projeto LAROS/

const app  = express()
const PORT = process.env.PORT || 3001

// ─── Pastas de uploads ────────────────────────────────────────────────────────
const FOTOS_DIR = join(ROOT, 'public', 'fotos')
const LOGOS_DIR = join(ROOT, 'public', 'logos')
;[FOTOS_DIR, LOGOS_DIR].forEach(d => { if (!existsSync(d)) mkdirSync(d, { recursive: true }) })

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors())
app.use(express.json())

// Serve arquivos estáticos da pasta public/ (fotos, logos)
app.use('/uploads', express.static(join(ROOT, 'public')))

// Em produção serve o build do Vite (dist/)
const DIST = join(ROOT, 'dist')
if (existsSync(DIST)) {
  app.use(express.static(DIST))
}

// ─── Upload de logo ───────────────────────────────────────────────────────────
const storageLogo = multer.diskStorage({
  destination: LOGOS_DIR,
  filename: (req, file, cb) => {
    const ext = extname(file.originalname)
    cb(null, `logo_${Date.now()}${ext}`)
  },
})
const uploadLogo = multer({
  storage: storageLogo,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true)
    else cb(new Error('Apenas imagens aceitas'))
  },
  limits: { fileSize: 5 * 1024 * 1024 },
})

app.post('/api/upload/logo', uploadLogo.single('logo'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado' })
  res.json({
    url:      `/uploads/logos/${req.file.filename}`,
    filename: req.file.filename,
  })
})

// ─── Upload de fotos ──────────────────────────────────────────────────────────
const storageFotos = multer.diskStorage({
  destination: FOTOS_DIR,
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`)
  },
})
const uploadFotos = multer({ storage: storageFotos, limits: { fileSize: 20 * 1024 * 1024 } })

app.post('/api/upload/fotos', uploadFotos.array('fotos', 50), (req, res) => {
  if (!req.files || !req.files.length) return res.status(400).json({ error: 'Nenhum arquivo enviado' })
  res.json({
    fotos: req.files.map(f => ({
      url: `/uploads/fotos/${f.filename}`,
      filename: f.filename,
      name: parse(f.originalname).name // Nome original é crucial para o Match automático!
    }))
  })
})

// ─── Upload + parse de CSV ────────────────────────────────────────────────────
const uploadCSV = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 * 1024 } })

app.post('/api/upload/csv', uploadCSV.single('csv'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado' })
  res.json({ content: req.file.buffer.toString('utf-8') })
})

// ─── Lista fotos e logos disponíveis ─────────────────────────────────────────
const IMG_EXTS = ['.jpg', '.jpeg', '.png', '.webp']

app.get('/api/fotos', (req, res) => {
  if (!existsSync(FOTOS_DIR)) return res.json({ fotos: [] })
  const fotos = readdirSync(FOTOS_DIR)
    .filter(f => IMG_EXTS.includes(extname(f).toLowerCase()))
    .map(f => ({ filename: f, name: parse(f).name, url: `/uploads/fotos/${f}` }))
  res.json({ fotos })
})

app.get('/api/logos', (req, res) => {
  if (!existsSync(LOGOS_DIR)) return res.json({ logos: [] })
  const logos = readdirSync(LOGOS_DIR)
    .filter(f => IMG_EXTS.includes(extname(f).toLowerCase()))
    .map(f => ({ filename: f, url: `/uploads/logos/${f}` }))
  res.json({ logos })
})

// ─── Exportação via Puppeteer ─────────────────────────────────────────────────
app.post('/api/export', async (req, res) => {
  const { stories, logoUrl, projectName } = req.body;
  
  try {
    const browser = await puppeteer.launch({ 
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1920 });

    const zip = new JSZip();

    for (let i = 0; i < stories.length; i++) {
      const story = stories[i];
      const html = renderTemplate(story, logoUrl);

      await page.setContent(html, { waitUntil: 'domcontentloaded' });
      
      // Duplo rAF para garantir que scripts inline do Template B executam
      await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));

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
    console.error('Erro na exportação via Puppeteer:', err);
    res.status(500).json({ error: 'Erro ao gerar imagens no servidor.' });
  }
});

// ─── SPA fallback (produção) ──────────────────────────────────────────────────
app.get('*', (req, res) => {
  const index = join(DIST, 'index.html')
  if (existsSync(index)) return res.sendFile(index)
  res.status(404).send('Build não encontrado. Rode: npm run build')
})

app.listen(PORT, "0.0.0.0", () => {
  console.log(`\n🚀 Story Editor — http://localhost:${PORT}`)
  console.log(`📁 Fotos: ${FOTOS_DIR}`)
  console.log(`📁 Logos: ${LOGOS_DIR}\n`)
})