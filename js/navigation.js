const TAB_IDS = ['overview', 'anatomy', 'ecology', 'discovery'];
const SITE_TITLE = 'ענקי הפרהיסטוריה שאחרי הדינוזאורים';
let drawerReturnFocus = null;
function toggleDrawer(open){
  const wasOpen = drawerEl.getAttribute('aria-hidden') === 'false';
  if (open && !wasOpen) drawerReturnFocus = document.activeElement;
  drawerEl.hidden = !open;
  drawerEl.classList.toggle('open', open);
  backdropEl.classList.toggle('open', open);
  drawerEl.setAttribute('aria-hidden', String(!open));
  drawerEl.inert = !open;
  document.body.classList.toggle('drawer-open', open);
  document.getElementById('openMenuBtn').setAttribute('aria-expanded', String(open));
  ['siteHeader', 'mainContent', 'siteFooter', 'siteTools', 'loadingNotice'].forEach(id => document.getElementById(id).inert = open);
  if (open) document.getElementById('closeMenuBtn').focus();
  else if (wasOpen) (drawerReturnFocus?.isConnected ? drawerReturnFocus : document.getElementById('openMenuBtn')).focus();
}
function handleDrawerKeydown(event){
  if (drawerEl.getAttribute('aria-hidden') !== 'false') return;
  if (event.key === 'Escape') { event.preventDefault(); toggleDrawer(false); return; }
  if (event.key !== 'Tab') return;
  const controls = [...drawerEl.querySelectorAll('button:not([disabled]), a[href]')];
  const first = controls[0], last = controls[controls.length - 1];
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
}
function renderDrawer(){
  document.getElementById('drawerCategories').innerHTML = HABITATS.map(h => {
    const animals = ANIMALS.filter(a => a.habitat === h.id);
    return `<div class="cat-box"><div class="cat-head"><span>${h.icon} ${h.nameHe}</span><span class="badge">${animals.length}</span></div><div class="cat-list">${animals.map(a => `
      <a class="nav-item ${state.animalId===a.id?'active':''}" href="#animal/${a.id}/overview" ${state.animalId===a.id?'aria-current="page"':''} onclick="if(location.hash===this.hash)applyRoute()">
        <span><span class="nav-name">${a.nameHe}</span><span class="latin nav-latin">${a.nameEn}</span></span><span class="nav-hint">דף יצור ←</span>
      </a>`).join('')}</div></div>`;
  }).join('');
}
function applyRoute(focus = true){
  if (!ANIMALS.length) return;
  stopNarration();
  const previousAnimal = state.animalId;
  const previousTab = state.tab;
  const match = /^#animal\/([a-z0-9-]+)(?:\/([a-z]+))?$/.exec(location.hash);
  const animal = match && ANIMALS.find(a => a.id === match[1]);
  state.view = animal ? 'animal' : 'intro';
  state.animalId = animal ? animal.id : null;
  state.tab = animal && TAB_IDS.includes(match[2]) ? match[2] : 'overview';
  document.title = animal ? `${animal.nameHe} | ${SITE_TITLE}` : SITE_TITLE;
  toggleDrawer(false);
  renderDrawer();
  renderMain();
  if (focus) {
    const tabOnly = previousAnimal === state.animalId && previousTab !== state.tab && state.separated;
    (tabOnly ? document.getElementById('tab-' + state.tab) : mainEl).focus();
    if (!tabOnly) window.scrollTo({top:0, behavior:'auto'});
  }
}
function navigate(hash){
  if (location.hash === hash) applyRoute();
  else location.hash = hash;
}
function selectIntro(){ navigate('#intro'); }
function selectAnimal(id){ if (ANIMALS.some(a => a.id === id)) navigate('#animal/' + id + '/overview'); }
function setTab(tab){ if (TAB_IDS.includes(tab)) navigate('#animal/' + state.animalId + '/' + tab); }
function handleTabKeydown(event){
  const active = document.activeElement;
  const index = TAB_IDS.indexOf(active?.id?.replace('tab-', ''));
  if (index < 0 || !['ArrowRight','ArrowLeft','Home','End'].includes(event.key)) return;
  event.preventDefault();
  const next = event.key === 'Home' ? 0 : event.key === 'End' ? TAB_IDS.length - 1 : (index + (event.key === 'ArrowLeft' ? 1 : -1) + TAB_IDS.length) % TAB_IDS.length;
  setTab(TAB_IDS[next]);
}
