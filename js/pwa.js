(() => {
  const installBtn = document.getElementById('installBtn');
  const updateBtn = document.getElementById('updateBtn');
  const status = document.getElementById('offlineStatus');
  let installPrompt = null;
  let registration = null;
  let refreshing = false;
  let hadController = Boolean(navigator.serviceWorker?.controller);
  const standalone = () => window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const syncInstall = () => {
    installBtn.hidden = !installPrompt || standalone();
    document.getElementById('installHelp').hidden = standalone();
  };
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault(); installPrompt = event; syncInstall();
  });
  window.addEventListener('appinstalled', () => { installPrompt = null; syncInstall(); });
  installBtn.onclick = async () => {
    if (!installPrompt) return;
    const prompt = installPrompt;
    installPrompt = null; syncInstall();
    try { await prompt.prompt(); await prompt.userChoice; }
    catch (_) { document.getElementById('installHelp').hidden = false; }
  };
  syncInstall();
  if (!('serviceWorker' in navigator)) {
    status.textContent = 'הדפדפן הזה אינו תומך בשמירת האתר לקריאה ללא אינטרנט.';
    return;
  }
  const syncOffline = () => {
    status.textContent = navigator.serviceWorker.controller
      ? (navigator.onLine ? 'התוכן נשמר לקריאה ללא אינטרנט. פתיחת מקורות חיצוניים דורשת חיבור.' : 'מצב לא מקוון — אפשר לקרוא את דפי בעלי החיים שנשמרו במכשיר.')
      : 'מכין את התוכן לקריאה ללא אינטרנט…';
  };
  window.addEventListener('online', syncOffline);
  window.addEventListener('offline', syncOffline);
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing || hadController) window.location.reload();
    else { hadController = true; syncOffline(); }
  });
  updateBtn.onclick = () => {
    if (registration?.waiting) {
      refreshing = true;
      updateBtn.disabled = true;
      registration.waiting.postMessage({type:'SKIP_WAITING'});
    }
  };
  navigator.serviceWorker.register('./sw.js', {updateViaCache:'none'}).then(reg => {
    registration = reg;
    if (reg.waiting) updateBtn.hidden = false;
    reg.addEventListener('updatefound', () => {
      const worker = reg.installing;
      worker?.addEventListener('statechange', () => {
        if (worker.state === 'installed' && navigator.serviceWorker.controller) updateBtn.hidden = false;
        if (worker.state === 'redundant' && !navigator.serviceWorker.controller) status.textContent = 'השמירה ללא אינטרנט לא הושלמה. התחברו לאינטרנט ורעננו כדי לנסות שוב.';
      });
    });
    syncOffline();
  }).catch(error => {
    console.warn('Offline setup failed', error);
    status.textContent = 'השמירה ללא אינטרנט אינה זמינה כרגע. אפשר להמשיך לקרוא עם חיבור לרשת.';
  });
})();
