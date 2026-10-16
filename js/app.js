let HABITATS = [];
let ANIMALS = [];
let state = { view:'intro', animalId:null, tab:'overview', separated:true, showLatin:true };
try {
  const saved = JSON.parse(localStorage.getItem('giants-preferences') || '{}');
  if (typeof saved.separated === 'boolean') state.separated = saved.separated;
  if (typeof saved.showLatin === 'boolean') state.showLatin = saved.showLatin;
} catch (_) { /* Reading is available even when storage is disabled. */ }

const mainEl = document.getElementById('mainContent');
const drawerEl = document.getElementById('drawer');
const backdropEl = document.getElementById('backdrop');
function savePreferences(){
  try { localStorage.setItem('giants-preferences', JSON.stringify({separated:state.separated, showLatin:state.showLatin})); } catch (_) {}
}
function syncPreferences(){
  document.body.classList.toggle('hide-latin', !state.showLatin);
  document.getElementById('toggleModeBtn').textContent = state.separated ? 'מצב תצוגה: מופרד ללשוניות' : 'מצב תצוגה: עמוד מלא רציף';
  document.getElementById('toggleLatinBtn').textContent = state.showLatin ? 'מונחים לטיניים: מוצגים' : 'מונחים לטיניים: מוסתרים';
  document.getElementById('toggleLatinBtn').setAttribute('aria-pressed', String(!state.showLatin));
}
async function fetchJSON(url){
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to load ' + url);
  return response.json();
}
async function initializeData(){
  const status = document.getElementById('loadStatus');
  const retry = document.getElementById('retryLoadBtn');
  retry.hidden = true;
  status.textContent = 'טוען את בעלי החיים…';
  mainEl.setAttribute('aria-busy', 'true');
  try {
    const [habitats, ids] = await Promise.all([fetchJSON('./data/habitats.json'), fetchJSON('./data/animals/index.json')]);
    HABITATS = habitats;
    const results = await Promise.allSettled(ids.map(id => fetchJSON('./data/animals/' + encodeURIComponent(id) + '.json').then(animal => {
      if (animal.id !== id || !animal.nameHe) throw new Error('Invalid animal: ' + id);
      return animal;
    })));
    ANIMALS = results.filter(r => r.status === 'fulfilled').map(r => r.value);
    const failed = results.length - ANIMALS.length;
    if (!ANIMALS.length) throw new Error('No entries available');
    status.textContent = failed ? `נטענו ${ANIMALS.length} מתוך ${ids.length} בעלי חיים. אפשר לנסות לטעון שוב את ${failed} הדפים החסרים.` : '';
    retry.hidden = !failed;
    applyRoute(false);
  } catch(error) {
    console.error(error);
    status.textContent = 'לא ניתן לטעון את נתוני בעלי החיים. בדקו את החיבור ונסו שוב.';
    retry.hidden = false;
    if (!ANIMALS.length) mainEl.textContent = 'התוכן יוצג לאחר השלמת הטעינה.';
  } finally {
    mainEl.setAttribute('aria-busy', 'false');
  }
}
