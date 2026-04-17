// Arquivo de ponte para a Hostinger (Phusion Passenger)
// O Passenger da Hostinger não suporta carregar arquivos ESM ("type": "module") diretamente.
// Este arquivo contorna o problema fazendo o import dinâmico do servidor real.
// Restart forçado para o Phusion Passenger carregar os templates .mjs

import('./api/server.js').catch(err => console.error("Erro ao iniciar o servidor:", err));