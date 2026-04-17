// Arquivo de ponte para a Hostinger (Phusion Passenger)
// O Passenger da Hostinger não suporta carregar arquivos ESM ("type": "module") diretamente.
// Este arquivo contorna o problema fazendo o import dinâmico do servidor real.
// Restart forçado para o Phusion Passenger carregar os templates .mjs

const { join } = require('path');
const { existsSync, mkdirSync } = require('fs');
const TMP_DIR = join(__dirname, 'tmp');
if (!existsSync(TMP_DIR)) mkdirSync(TMP_DIR, { recursive: true });
process.env.TMPDIR = TMP_DIR;

import('./api/server.mjs').catch(err => console.error("Erro ao iniciar o servidor:", err));