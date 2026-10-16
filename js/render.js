function renderMain(){
  if(state.view === 'intro' || !state.animalId){
    mainEl.innerHTML = `
      <article class="card">
        <span class="badge">🌍 מבוא לעידן הקנוזואיקון (66 מיליון שנה לפני זמננו ועד ימינו)</span>
        <h2 style="font-size:34px;font-weight:900;margin:16px 0 12px;color:#fff">עידן הענקים החדש: החיים הגדולים שאחרי הדינוזאורים</h2>
        <p style="font-size:17px;color:#cbd5e1">לפני כ-66 מיליון שנה הובילה הכחדת הקרטיקון-פלאוגן להיעלמות הדינוזאורים שאינם-עופות והזוחלים הימיים העצומים. העולם שנותר אחריהם הותיר נישות אקולוגיות פתוחות ביבשה, בים ובאוויר, והוביל להתפרצות אבולוציונית אדירה בעידן הקנוזואיקון ("החיים החדשים").</p>
        <p style="font-size:17px;color:#cbd5e1">באתר זה תמצאו סקירה מדעית של שיאני הגודל הפרהיסטוריים שחיו לאחר תקופת הדינוזאורים. העמוד הראשי מוקדש למבוא בלבד, וכל בעל חיים מוצג בדף נפרד ועצמאי הנגיש דרך תפריט ההמבורגר הצדדי לפי אזור המחיה שלו.</p>
        <div class="grid-3">
          ${HABITATS.map(h => `
            <div class="stat-box">
              <div style="font-size:26px">${h.icon}</div>
              <div style="font-weight:800;color:#fbbf24;margin-top:4px">${h.nameHe}</div>
              <p style="font-size:13px;color:#94a3b8;margin:6px 0 0">${h.desc}</p>
            </div>
          `).join('')}
        </div>
        <div style="margin-top:24px">
          <button class="btn-amber" onclick="toggleDrawer(true)">☰ פתח את תפריט ההמבורגר לבחירת בעל חיים</button>
        </div>
      </article>
    `;
    return;
  }

  const a = ANIMALS.find(x => x.id === state.animalId) || ANIMALS[0];
  const idx = ANIMALS.indexOf(a);
  const prev = ANIMALS[(idx - 1 + ANIMALS.length) % ANIMALS.length];
  const next = ANIMALS[(idx + 1) % ANIMALS.length];

  const tabsNav = state.separated ? `
    <div class="tabs">
      <button class="tab-btn ${state.tab==='overview'?'active':''}" onclick="setTab('overview')">סקירה כללית</button>
      <button class="tab-btn ${state.tab==='anatomy'?'active':''}" onclick="setTab('anatomy')">אנטומיה וממדים</button>
      <button class="tab-btn ${state.tab==='ecology'?'active':''}" onclick="setTab('ecology')">אקולוגיה והכחדה</button>
      <button class="tab-btn ${state.tab==='discovery'?'active':''}" onclick="setTab('discovery')">גילוי מדעי</button>
    </div>
  ` : '';

  let bodyHtml = '';
  if(state.separated){
    const map = {
      overview: {t:'סקירה כללית', c:a.overview},
      anatomy: {t:'אנטומיה, שלד והשוואת גודל', c:a.anatomy + '<br><br><strong>יחס לאדם:</strong> ' + a.ratio},
      ecology: {t:'אקולוגיה, תזונה והכחדה', c:a.ecology},
      discovery: {t:'היסטוריית גילוי ותיעוד מאובנים', c:a.discovery}
    };
    const cur = map[state.tab];
    bodyHtml = `<div class="card"><h3 style="margin-top:0;color:#fbbf24">${cur.t}</h3><p style="font-size:17px;margin:0">${cur.c}</p></div>`;
  } else {
    bodyHtml = `
      <div class="card"><h3 style="margin-top:0;color:#fbbf24">סקירה כללית</h3><p>${a.overview}</p></div>
      <div class="card"><h3 style="margin-top:0;color:#fbbf24">אנטומיה וממדים</h3><p>${a.anatomy}</p><p><strong>יחס לאדם:</strong> ${a.ratio}</p></div>
      <div class="card"><h3 style="margin-top:0;color:#fbbf24">אקולוגיה והכחדה</h3><p>${a.ecology}</p></div>
      <div class="card"><h3 style="margin-top:0;color:#fbbf24">גילוי מדעי</h3><p>${a.discovery}</p></div>
    `;
  }

  mainEl.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;flex-wrap:wrap;gap:8px">
      <div style="font-size:14px;color:#94a3b8">
        <span style="cursor:pointer;color:#fbbf24" onclick="selectIntro()">דף מבוא</span> / <span>${a.habitatHe}</span> / <strong style="color:#fff">${a.nameHe}</strong>
      </div>
      <button class="btn-sec" onclick="toggleDrawer(true)">לכל היצורים בתפריט ☰</button>
    </div>

    <article class="card">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:10px">
        <div>
          <h2 style="font-size:32px;font-weight:900;margin:0;color:#fff">${a.icon} ${a.nameHe}</h2>
          <div class="latin" style="font-size:18px;margin-top:2px">${a.nameEn}</div>
        </div>
        <span class="badge">אזור מחיה: ${a.habitatHe}</span>
      </div>
      <p style="font-size:17px;color:#cbd5e1;margin:10px 0 0">${a.subHe}</p>

      <div class="hero-visual">
        <div style="font-size:64px;line-height:1">${a.icon}</div>
        <div class="scale-bar-wrap">
          <div style="font-size:12px;color:#fbbf24;font-weight:700">השוואת קנה מידה מול אדם בוגר (1.80 מ׳)</div>
          <div style="font-size:14px;color:#e2e8f0;margin-top:4px">${a.ratio}</div>
        </div>
      </div>

      <div class="grid-4">
        <div class="stat-box"><div class="stat-label">ממדים וגודל</div><div class="stat-val">${a.sizeHe}</div></div>
        <div class="stat-box"><div class="stat-label">משקל מוערך</div><div class="stat-val" style="color:#fbbf24">${a.weightHe}</div></div>
        <div class="stat-box"><div class="stat-label">תקופה גאולוגית</div><div class="stat-val">${a.epochHe}</div></div>
        <div class="stat-box"><div class="stat-label">תפוצה ותזונה</div><div class="stat-val">${a.regionHe}</div></div>
      </div>
    </article>

    ${tabsNav}
    ${bodyHtml}

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:20px">
      <button class="btn-sec" style="text-align:right;padding:14px" onclick="selectAnimal('${prev.id}')">
        <div style="font-size:11px;color:#94a3b8">היצור הקודם</div>
        <div style="font-weight:800;font-size:15px;color:#fff">→ ${prev.nameHe}</div>
      </button>
      <button class="btn-sec" style="text-align:left;padding:14px" onclick="selectAnimal('${next.id}')">
        <div style="font-size:11px;color:#94a3b8">היצור הבא</div>
        <div style="font-weight:800;font-size:15px;color:#fff">${next.nameHe} ←</div>
      </button>
    </div>
  `;
}

