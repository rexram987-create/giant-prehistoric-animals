document.getElementById('openMenuBtn').onclick = () => toggleDrawer(true);
document.getElementById('closeMenuBtn').onclick = () => toggleDrawer(false);
backdropEl.onclick = () => toggleDrawer(false);
document.getElementById('skipContentLink').onclick = event => { event.preventDefault(); mainEl.focus(); };
document.getElementById('navIntroBtn').onclick = selectIntro;
document.getElementById('retryLoadBtn').onclick = initializeData;
document.addEventListener('keydown', event => { handleDrawerKeydown(event); handleTabKeydown(event); });
window.addEventListener('hashchange', () => applyRoute());
document.getElementById('toggleModeBtn').onclick = () => {
  state.separated = !state.separated;
  savePreferences(); syncPreferences(); renderMain();
};
document.getElementById('toggleLatinBtn').onclick = () => {
  state.showLatin = !state.showLatin;
  savePreferences(); syncPreferences();
};
syncPreferences();
initializeData();
