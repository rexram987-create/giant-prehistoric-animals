function toggleDrawer(open){
  drawerEl.classList.toggle('open', open);
  backdropEl.classList.toggle('open', open);
}

function renderDrawer(){
  const container = document.getElementById('drawerCategories');
  container.innerHTML = HABITATS.map(h => {
    const list = ANIMALS.filter(a => a.habitat === h.id).map(a => `
      <button class="nav-item ${state.view==='animal' && state.animalId===a.id ? 'active' : ''}" onclick="selectAnimal('${a.id}')">
        <div>
          <div>${a.nameHe}</div>
          <div class="latin" style="font-size:11px">${a.nameEn}</div>
        </div>
        <span style="font-size:12px">דף יצור ←</span>
      </button>
    `).join('');
    return `
      <div class="cat-box">
        <div class="cat-head"><span>${h.icon} ${h.nameHe}</span><span class="badge">${ANIMALS.filter(a=>a.habitat===h.id).length}</span></div>
        <div class="cat-list">${list}</div>
      </div>
    `;
  }).join('');
}

function selectIntro(){
  state.view = 'intro';
  state.animalId = null;
  toggleDrawer(false);
  renderDrawer();
  renderMain();
  window.scrollTo({top:0, behavior:'smooth'});
}

function selectAnimal(id){
  state.view = 'animal';
  state.animalId = id;
  state.tab = 'overview';
  toggleDrawer(false);
  renderDrawer();
  renderMain();
  window.scrollTo({top:0, behavior:'smooth'});
}

function setTab(t){
  state.tab = t;
  renderMain();
}

