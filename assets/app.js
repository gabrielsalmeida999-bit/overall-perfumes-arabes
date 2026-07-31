/* Overall Perfumes Árabes — catálogo público (somente visualização + compra via WhatsApp).
   Dados em assets/data.js (window.PRODUTOS_BASE). Sem edição, sem painel administrativo. */

const WHATSAPP_NUMERO = "5573991626457";
const LS_THEME = "overall_perfumes_theme";

let produtos = [];
let categoriaAtual = "Todas";
let buscaAtual = "";

function fmtPreco(v) {
  const n = Number(v);
  if (isNaN(n)) return "-";
  return n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function buildProdutos() {
  produtos = window.PRODUTOS_BASE.map((p, i) => ({ id: "p" + i, ...p }));
}

function categorias() {
  const set = new Set(produtos.map((p) => p.marca));
  return ["Todas", ...Array.from(set).sort((a, b) => a.localeCompare(b, "pt-BR"))];
}

function renderCategorias() {
  const wrap = document.getElementById("catsBar");
  wrap.innerHTML = "";
  categorias().forEach((cat) => {
    const btn = document.createElement("button");
    btn.className = "cat-pill" + (cat === categoriaAtual ? " active" : "");
    btn.textContent = cat;
    btn.onclick = () => {
      categoriaAtual = cat;
      renderCategorias();
      renderGrid();
    };
    wrap.appendChild(btn);
  });
}

function filtrarProdutos() {
  const termo = buscaAtual.trim().toLowerCase();
  const palavras = termo.split(/\s+/).filter(Boolean);
  return produtos.filter((p) => {
    const okCat = categoriaAtual === "Todas" || p.marca === categoriaAtual;
    const alvo = (p.marca + " " + p.produto).toLowerCase();
    const okBusca = !palavras.length || palavras.every((w) => alvo.includes(w));
    return okCat && okBusca;
  });
}

function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

function cardHtml(p) {
  const temPromo = p.preco_original && Number(p.preco_original) > Number(p.preco_atual);
  const img = p.img
    ? `<img src="${p.img}" alt="${escapeHtml(p.produto)}" loading="lazy" onerror="this.parentElement.innerHTML='<span class=ph>sem imagem</span>'">`
    : `<span class="ph">sem imagem</span>`;
  return `
  <div class="card" data-id="${p.id}">
    <div class="card-img">
      ${temPromo ? '<span class="badge">OFERTA</span>' : ""}
      ${img}
    </div>
    <div class="card-body">
      <div class="card-brand">${escapeHtml(p.marca)}</div>
      <div class="card-name">${escapeHtml(p.produto)}</div>
      <div class="card-prices">
        ${temPromo ? `<span class="price-old">R$ ${fmtPreco(p.preco_original)}</span>` : ""}
        <span class="price-now"><span class="cifrao">R$</span>${fmtPreco(p.preco_atual)}</span>
      </div>
      <div class="card-actions">
        <button class="btn btn-primary" data-action="whats" style="width:100%;">Comprar</button>
      </div>
    </div>
  </div>`;
}

function renderGrid() {
  const lista = filtrarProdutos();
  const grid = document.getElementById("grid");
  const count = document.getElementById("resultCount");
  count.textContent = lista.length + (lista.length === 1 ? " produto" : " produtos");

  if (!lista.length) {
    grid.innerHTML = `<div class="empty">Nenhum produto encontrado.</div>`;
    return;
  }
  grid.innerHTML = lista.map(cardHtml).join("");
}

function bindGridEvents() {
  document.getElementById("grid").addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action='whats']");
    if (!btn) return;
    const card = e.target.closest(".card");
    const id = card.dataset.id;
    const p = produtos.find((x) => x.id === id);
    const msg = encodeURIComponent(`Olá! Tenho interesse em: ${p.produto} (${p.marca}) - R$ ${fmtPreco(p.preco_atual)}`);
    window.open(`https://wa.me/${WHATSAPP_NUMERO}?text=${msg}`, "_blank");
  });
}

function initTheme() {
  const saved = localStorage.getItem(LS_THEME);
  if (saved) document.documentElement.setAttribute("data-theme", saved);
  document.getElementById("themeBtn").onclick = () => {
    const cur = document.documentElement.getAttribute("data-theme") ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const next = cur === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem(LS_THEME, next);
  };
}

function initBusca() {
  const input = document.getElementById("searchInput");
  input.addEventListener("input", () => {
    buscaAtual = input.value;
    renderGrid();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  buildProdutos();
  initTheme();
  initBusca();
  bindGridEvents();
  renderCategorias();
  renderGrid();
});
