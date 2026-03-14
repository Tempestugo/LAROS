import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';

// Replicação da funcionalidade __dirname em módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..'); // Sobe um nível de /api para a raiz do projeto

// --- Configuração de Diretórios ---
const UPLOADS_DIR = path.join(projectRoot, 'public', 'uploads');
const FOTOS_DIR = path.join(UPLOADS_DIR, 'fotos');
const LOGOS_DIR = path.join(UPLOADS_DIR, 'logos');

// Garante que os diretórios de upload existam
try {
  [UPLOADS_DIR, FOTOS_DIR, LOGOS_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
} catch (error) {
  console.error("⚠️ Aviso: Erro ao criar diretórios de upload. Verifique as permissões.", error);
}

const app = express();
const PORT = process.env.PORT || 3001;

// --- Configuração de Upload (Multer) ---
const imageFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new Error('Apenas imagens são permitidas!'), false);
};

const createStorage = (destinationDir) => multer.diskStorage({
  destination: destinationDir,
  filename: (req, file, cb) => {
    const safeName = file.originalname.toLowerCase().replace(/[^a-z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const uploadFoto = multer({ storage: createStorage(FOTOS_DIR), fileFilter: imageFileFilter, limits: { fileSize: 20 * 1024 * 1024 } });
const uploadLogo = multer({ storage: createStorage(LOGOS_DIR), fileFilter: imageFileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
const uploadCsv = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// --- Rotas da API ---

// Listar arquivos
app.get('/api/files/:type', (req, res) => {
  const dir = req.params.type === 'fotos' ? FOTOS_DIR : LOGOS_DIR;
  fs.readdir(dir, (err, files) => {
    if (err) return res.status(500).json({ error: `Erro ao ler o diretório ${req.params.type}` });
    const fileData = files
      .filter(file => !file.startsWith('.')) // Ignora arquivos ocultos
      .map(file => ({
        name: path.parse(file).name,
        filename: file,
        url: `/uploads/${req.params.type}/${file}`,
      }));
    res.json(fileData);
  });
});

// Upload de múltiplas fotos
app.post('/api/upload/fotos', uploadFoto.array('fotos', 50), (req, res) => {
  if (!req.files?.length) return res.status(400).json({ error: 'Nenhum arquivo enviado' });
  const fotos = req.files.map(f => ({
    url: `/uploads/fotos/${f.filename}`,
    filename: f.filename,
    name: path.parse(f.filename).name,
  }));
  res.json({ fotos });
});

// Upload de um logo
app.post('/api/upload/logo', uploadLogo.single('logo'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado' });
  res.json({
    url: `/uploads/logos/${req.file.filename}`,
    filename: req.file.filename,
    name: path.parse(req.file.filename).name,
  });
});

// Upload de CSV (retorna conteúdo como JSON)
app.post('/api/upload/csv', uploadCsv.single('csv'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado' });
  res.json({ content: req.file.buffer.toString('utf8') });
});

// --- Servir Arquivos Estáticos ---

// Servir a pasta de uploads publicamente
app.use('/uploads', express.static(UPLOADS_DIR));

// Servir o build do React em produção
app.use(express.static(path.join(projectRoot, 'dist')));

// Rota "catch-all": para qualquer requisição que não corresponda às anteriores,
// envia o index.html do React. Essencial para o roteamento no lado do cliente.
app.get('*', (req, res) => {
  res.sendFile(path.join(projectRoot, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor API rodando em http://localhost:${PORT}`);
});