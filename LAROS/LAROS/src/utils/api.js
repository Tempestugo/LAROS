const BASE = '/api'
// URLs de mídia servidas pelo Express em /uploads/;

export async function uploadLogo(file) {
  const fd = new FormData();
  fd.append('logo', file);
  const res = await fetch(`${BASE}/upload/logo`, { method: 'POST', body: fd });
  if (!res.ok) throw new Error((await res.json()).error || 'Erro no upload');
  return res.json();
}

export async function uploadCSV(file) {
  const fd = new FormData();
  fd.append('csv', file);
  const res = await fetch(`${BASE}/upload/csv`, { method: 'POST', body: fd });
  if (!res.ok) throw new Error((await res.json()).error || 'Erro no CSV');
  return res.json(); // { stories: [...], total }
}

export async function fetchFotos() {
  const res = await fetch(`${BASE}/fotos`);
  return res.json(); // { fotos: [{ filename, name, url }] }
}

export async function fetchLogos() {
  const res = await fetch(`${BASE}/logos`);
  return res.json(); // { logos: [{ filename, url }] }
}
