document.getElementById('openMenuBtn').onclick = () => toggleDrawer(true);
document.getElementById('closeMenuBtn').onclick = () => toggleDrawer(false);
backdropEl.onclick = () => toggleDrawer(false);
document.getElementById('homeTitleBtn').onclick = selectIntro;
document.getElementById('navIntroBtn').onclick = selectIntro;

document.getElementById('toggleModeBtn').onclick = (e) => {
  state.separated = !state.separated;
  e.target.textContent = state.separated ? 'מצב תצוגה: מופרד ללשוניות' : 'מצב תצוגה: עמוד מלא רציף';
  renderMain();
};

document.getElementById('toggleLatinBtn').onclick = (e) => {
  state.showLatin = !state.showLatin;
  document.body.classList.toggle('hide-latin', !state.showLatin);
  e.target.textContent = state.showLatin ? 'מונחים לטיניים: מוצגים' : 'מונחים לטיניים: מוסתרים';
};

initializeData();
