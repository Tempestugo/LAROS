// Arquivo de ponte obrigatório para o LiteSpeed da Hostinger
// O painel da Hostinger está configurado para iniciar por este arquivo.

const { join } = require('path');
const { existsSync, mkdirSync } = require('fs');
const TMP_DIR = join(__dirname, '..', 'tmp');
if (!existsSync(TMP_DIR)) mkdirSync(TMP_DIR, { recursive: true });
process.env.TMPDIR = TMP_DIR;

import('./server.mjs').catch(err => console.error("Erro ao iniciar o servidor:", err));