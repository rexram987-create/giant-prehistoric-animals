let HABITATS = [];
let ANIMALS = [];
let state = { view:'intro', animalId:null, tab:'overview', separated:true, showLatin:true };

const mainEl = document.getElementById('mainContent');
const drawerEl = document.getElementById('drawer');
const backdropEl = document.getElementById('backdrop');


async function initializeData(){
  try {
    const [habitatResponse, indexResponse] = await Promise.all([fetch('./data/habitats.json'), fetch('./data/animals/index.json')]);
    if (!habitatResponse.ok || !indexResponse.ok) throw new Error('Failed to load catalog');
    HABITATS = await habitatResponse.json();
    const ids = await indexResponse.json();
    ANIMALS = await Promise.all(ids.map(async id => {
      const response = await fetch('./data/animals/' + encodeURIComponent(id) + '.json');
      if (!response.ok) throw new Error('Failed to load ' + id);
      return response.json();
    }));
    renderDrawer(); renderMain();
  } catch(error) {
    console.error(error);
    mainEl.textContent = 'לא ניתן לטעון את נתוני בעלי החיים. נסו לרענן את הדף.';
  }
}
