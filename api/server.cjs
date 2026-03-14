const express = require('express');
const fs      = require('fs');
const path    = require('path');
const multer  = require('multer');

const projectRoot = path.resolve(__dirname, '..');
const UPLOADS_DIR = path.join(projectRoot, 'public', 'uploads');
const FOTOS_DIR   = path.join(UPLOADS_DIR, 'fotos');
const LOGOS_DIR   = path.join(UPLOADS_DIR, 'logos');

[UPLOADS_DIR, FOTOS_DIR, LOGOS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const app  = express();
const PORT = process.env.PORT || 3001;

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

app.use('/uploads', express.static(UPLOADS_DIR));
app.use(express.static(path.join(projectRoot, 'dist')));
app.get('*', (req, res) => res.sendFile(path.join(projectRoot, 'dist', 'index.html')));

app.listen(PORT, '0.0.0.0', () => console.log(`🚀 LAROS — porta ${PORT}`));