# LAROS — Story Editor

Editor visual de stories 1080×1920. Importa CSV, aplica templates A–E, edita elementos no canvas (arrastar, redimensionar, editar texto, trocar fonte/cor) e exporta PNG.

---

## Estrutura do projeto

```
LAROS/                         ← raiz do repositório
├── api/
│   └── server.js              ← Express (ESM) — API + serve dist/ em produção
├── src/
│   ├── App.jsx / App.css
│   ├── main.jsx / index.css
│   ├── components/            ← Toolbar, StoryList, CanvasEditor, PropertiesPanel
│   ├── hooks/useFabric.js     ← Toda a lógica do Fabric.js
│   ├── templates/index.js     ← Templates A–E
│   └── utils/api.js | export.js
├── public/
│   ├── fotos/                 ← Fotos adicionadas via FTP (não commitadas)
│   └── logos/                 ← Logos enviadas pela interface
├── index.html                 ← Entry point do Vite
├── vite.config.js
├── package.json               ← Scripts: build / start / dev
└── .gitignore
```

---

## Hostinger — Deploy automático via Git

A Hostinger detecta automaticamente o `package.json` na raiz e executa:

```
npm install   →   npm run build   →   npm run start
```

**O que cada script faz:**
- `npm run build` → Vite compila `src/` → `dist/`
- `npm run start` → `node api/server.js` (Express serve `dist/` + rotas `/api`)

**Não é necessário nenhuma configuração adicional** além de apontar o repositório Git no painel da Hostinger.

### Variáveis de ambiente (painel Hostinger)

| Variável | Valor |
|----------|-------|
| `NODE_ENV` | `production` |
| `PORT` | (automático — Hostinger injeta) |

---

## Desenvolvimento local

```bash
# Clone / entre na pasta
cd LAROS

# Instala tudo (um só npm install na raiz)
npm install

# Roda dev (Vite na 5173 + Express na 3001)
npm run dev
```

Acesse: `http://localhost:5173`

### Adicionar fotos (dev)
```bash
# Copie as fotos para public/fotos/
cp ~/suas-fotos/*.jpg public/fotos/
```

---

## Formato do CSV

```csv
Dia;Titulo;Subtitulo;CTA;Nome_Foto;Cor;Template;Endereco
01;Novo Empreendimento;Vista incrível;Saiba mais;foto_01;#C47B2B;A;R. Ártico, SBC
02;Pronto para Morar;;Ligue já;foto_02;#2B7BC4;B;
```

| Coluna | Obrigatório | Exemplo |
|--------|-------------|---------|
| Dia | não | `01` |
| Titulo | sim | `Novo Empreendimento` |
| Subtitulo | não | `Vista incrível` |
| CTA | não | `Saiba mais` |
| Nome_Foto | **sim** | `foto_01` (sem extensão) |
| Cor | não | `#C47B2B` |
| Template | não | `A` \| `B` \| `C` \| `D` \| `E` |
| Endereco | não | usa padrão se vazio |

**Separador**: `;` (fallback automático para `,`)

---

## Como usar

| Ação | Como |
|------|------|
| Importar stories | Toolbar → **Importar CSV** |
| Upload de logo | Toolbar → **Upload Logo** |
| Selecionar foto de fundo | Painel direito → Foto de fundo |
| Mudar template | Painel direito → Visual → Template |
| Mover elemento | Clique e arraste no canvas |
| Editar texto | Duplo-clique no elemento |
| Trocar fonte/cor/tamanho | Clique no elemento → aba **Elemento** |
| Remover elemento | Aba Elemento → Remover |
| Exportar 1 story | Painel direito → **Exportar PNG** |
| Exportar todos | Toolbar → **Exportar Todos** |

---

## Adicionar novo template

Edite `src/templates/index.js` — adicione uma chave nova ao objeto `TEMPLATES`:

```js
F: {
  name: 'Template F',
  description: 'Descrição curta',
  elements: (data) => [
    {
      id: 'titulo',
      type: 'textbox',
      text: data.titulo || '',
      left: 72, top: 200, width: 936,
      fontSize: 80, fontFamily: 'Fraunces', fontWeight: '900',
      fill: '#fff', backgroundColor: data.cor, padding: 24,
    },
  ]
},
```

Aparece automaticamente na interface.
