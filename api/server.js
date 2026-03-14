import express from 'express'
import cors from 'cors'
import multer from 'multer'
import { createReadStream, existsSync, mkdirSync, readdirSync, readFileSync } from 'fs'
import { join, extname, parse, resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { Readable } from 'stream'

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

// ─── Upload + parse de CSV ────────────────────────────────────────────────────
const uploadCSV = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 * 1024 } })

function parseCSV(buffer, separator) {
  return new Promise((resolve) => {
    const results = []
    const stream  = Readable.from(buffer.toString('utf-8'))
    stream
      .pipe(csv({ separator }))
      .on('data', (row) => {
        const v    = Object.values(row)
        const foto = v[4] ? v[4].trim() : ''
        if (!foto || foto === 'Nome_Foto') return
        results.push({
          dia:       v[0] ? v[0].trim() : '',
          titulo:    v[1] ? v[1].trim() : '',
          subtitulo: v[2] ? v[2].trim() : '',
          cta:       v[3] ? v[3].trim() : '',
          foto,
          cor:      v[5] ? v[5].trim() : '#C47B2B',
          template: v[6] ? v[6].trim().toUpperCase() : 'A',
          endereco: v[7] && v[7].trim() ? v[7].trim() : '',
        })
      })
      .on('end', () => resolve(results))
  })
}

app.post('/api/upload/csv', uploadCSV.single('csv'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado' })
  try {
    let stories = await parseCSV(req.file.buffer, ';')
    if (!stories.length) stories = await parseCSV(req.file.buffer, ',')
    if (!stories.length) return res.status(422).json({ error: 'CSV sem linhas válidas' })
    res.json({ stories, total: stories.length })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
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