const home = document.getElementById('home');
const mapScreen = document.getElementById('mapScreen');
const mindmap = document.getElementById('mindmap');
const definitionContent = document.getElementById('definitionContent');
let selectedId = 'overview';
const nodeIndex = new Map();

function collect(nodes, parent = null, branch = null) {
  nodes.forEach(node => {
    node.parent = parent;
    node.branchColor = node.color || branch;
    nodeIndex.set(node.id, node);
    if (node.items) collect(node.items, node, node.branchColor);
  });
}
collect(familyMap);

function makeButton(node, className, labelPrefix = '') {
  const button = document.createElement('button');
  button.className = className;
  button.type = 'button';
  button.dataset.node = node.id;
  button.textContent = labelPrefix + node.title;
  button.addEventListener('click', () => selectNode(node.id, button));
  return button;
}
function renderMap() {
  const root = document.createElement('button');
  root.className = 'root-node'; root.type = 'button'; root.textContent = 'FAMÍLIA';
  root.addEventListener('click', () => selectOverview(root));
  mindmap.appendChild(root);
  const branches = document.createElement('div'); branches.className = 'branches';
  familyMap.forEach((branch, index) => {
    const column = document.createElement('article'); column.className = 'branch'; column.style.setProperty('--branch', branch.color);
    const title = makeButton(branch, 'branch-title');
    title.innerHTML = `<span class="number">RAMO ${String(index + 1).padStart(2,'0')}</span>${branch.title}`;
    column.appendChild(title);
    const children = document.createElement('div'); children.className = 'branch-children';
    (branch.items || []).forEach(item => {
      const group = document.createElement('div'); group.className = 'node-group';
      group.appendChild(makeButton(item, 'node-button'));
      if (item.items && item.items.length) {
        const leaves = document.createElement('div'); leaves.className = 'leaf-list';
        item.items.forEach(leaf => leaves.appendChild(makeButton(leaf, 'leaf-button')));
        group.appendChild(leaves);
      }
      children.appendChild(group);
    });
    column.appendChild(children); branches.appendChild(column);
  });
  mindmap.appendChild(branches);
  document.getElementById('nodeCount').textContent = `${nodeIndex.size + 1} conceitos e subdivisões · todos os ramos abertos`;
}
function selectOverview(button) {
  selectedId = 'overview'; document.querySelectorAll('[data-node],.root-node').forEach(el => el.classList.remove('selected'));
  button.classList.add('selected');
  definitionContent.innerHTML = `<span class="definition-tag">VISÃO GERAL</span><h2>Família</h2><p>A família é uma realidade social plural, formada por relações de parentesco, conjugalidade, filiação, cuidado e responsabilidade. Não existe uma única estrutura familiar.</p><div class="panel-tip"><strong>Como explorar</strong><br>Seleciona qualquer conceito no mapa. A sua definição, características e exemplos aparecem aqui.</div>`;
}
function selectNode(id, button) {
  const node = nodeIndex.get(id); if (!node) return;
  selectedId = id;
  document.querySelectorAll('[data-node],.root-node').forEach(el => el.classList.remove('selected'));
  button.classList.add('selected');
  const parent = node.parent ? `<div class="panel-tip"><strong>Localização no mapa</strong><br>${node.parent.title}</div>` : '';
  const extras = node.items?.length ? `<h3>Subdivisões neste ramo</h3><ul>${node.items.map(item => `<li>${escapeHtml(item.title)}</li>`).join('')}</ul>` : '';
  definitionContent.innerHTML = `<span class="definition-tag">${node.parent ? 'CONCEITO / SUBTEMA' : 'RAMO PRINCIPAL'}</span><h2>${escapeHtml(node.title)}</h2><p>${escapeHtml(node.desc || 'Este conceito integra a organização e a diversidade das estruturas familiares.')}</p>${extras}${parent}<div class="panel-tip"><strong>Exploração do mapa</strong><br>O mapa mantém todos os ramos visíveis. Seleciona outro conceito para consultar a respetiva definição.</div>`;
}
function escapeHtml(value='') { return value.replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])); }
function showMap() { home.classList.add('leaving'); setTimeout(() => { home.classList.add('hidden'); mapScreen.classList.remove('hidden'); window.scrollTo(0,0); }, 420); }
document.getElementById('startButton').addEventListener('click', showMap);
document.getElementById('backHome').addEventListener('click', () => { mapScreen.classList.add('hidden'); home.classList.remove('hidden','leaving'); window.scrollTo(0,0); });
document.getElementById('expandAll').addEventListener('click', () => { document.querySelectorAll('.branch').forEach(el => el.classList.remove('collapsed')); });
document.getElementById('collapseAll').addEventListener('click', () => { document.querySelectorAll('.branch').forEach(el => el.classList.add('collapsed')); });
renderMap();
