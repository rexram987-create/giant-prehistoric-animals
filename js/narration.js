function normalizeNarrationText(value){
  return String(value || '').replace(/<[^>]*>/g,' ').replace(/https?:\/\/\S+/g,' ')
    .replace(/&quot;/g,'"').replace(/&amp;/g,'ו').replace(/&nbsp;/g,' ')
    .replace(/קמ[״"]ש/g,'קילומטרים לשעה').replace(/ק[״"]ג/g,'קילוגרם').replace(/מ[׳']/g,'מטרים')
    .replace(/(\d)[–-](?=\d)/g,'$1 עד ').replace(/[A-Za-z][A-Za-z .&'-]*/g,' ')
    .replace(/\(\s*\)/g,'').replace(/\s+/g,' ').trim();
}
function buildNarrationText(animal){
  const sections = [animal.nameHe, animal.subHe, 'אזור מחיה. ' + animal.habitatHe,
    'ממדים וגודל. ' + animal.sizeHe, 'משקל מוערך. ' + animal.weightHe,
    'תקופה גאולוגית. ' + animal.epochHe, 'תפוצה ותזונה. ' + animal.regionHe,
    'סקירה כללית. ' + animal.overview, 'אנטומיה וממדים. ' + animal.anatomy,
    'השוואה לאדם. ' + animal.ratio, 'אקולוגיה והכחדה. ' + animal.ecology,
    'היסטוריית הגילוי. ' + (animal.discoveryHistory || animal.discovery || ''),
    'שלמות המאובנים. ' + (animal.fossilCompleteness || 'אין מידע מאומת')];
  return sections.map(normalizeNarrationText).filter(Boolean).join('. ');
}
function splitNarrationText(text, limit = 180){
  let remaining = String(text || '').replace(/\s+/g,' ').trim();
  const chunks=[];
  while (remaining.length > limit) {
    const candidate = remaining.slice(0,limit + 1);
    const sentence = Math.max(candidate.lastIndexOf('. '),candidate.lastIndexOf('! '),candidate.lastIndexOf('? '));
    const space = candidate.lastIndexOf(' ');
    const cut = sentence >= limit / 3 ? sentence + 1 : space > 0 ? space : limit;
    chunks.push(remaining.slice(0,cut).trim());
    remaining = remaining.slice(cut).trim();
  }
  if (remaining) chunks.push(remaining);
  return chunks;
}
function createNarrator({synthesis,Utterance,onChange=()=>{}} = {}){
  const supported = Boolean(synthesis && typeof synthesis.speak === 'function' && typeof synthesis.cancel === 'function' && typeof Utterance === 'function');
  let status='idle',chunks=[],index=0,rate=1,generation=0,currentUtterance=null;
  function notify(message){ onChange({status,message,index,total:chunks.length}); }
  function cancelEngine(){ if (supported) { try { synthesis.cancel(); } catch (_) {} } }
  function fail(error){
    generation++;status='idle';currentUtterance=null;cancelEngine();
    const message = error === 'not-allowed' ? 'הדפדפן לא אישר הקראה. לחצו שוב על הקרא את הדף.'
      : 'לא ניתן להשמיע כרגע. בדקו שקול בעברית מותקן במכשיר ונסו שוב; ייתכן שנדרש חיבור לאינטרנט.';
    notify(message);
  }
  function speakNext(){
    if (status !== 'speaking') return;
    if (index >= chunks.length) { status='idle';currentUtterance=null;notify('ההקראה הסתיימה.');return; }
    const token=generation;
    try {
      const utterance = new Utterance(chunks[index]);
      currentUtterance=utterance;
      utterance.lang='he-IL';utterance.rate=rate;
      const hebrew=(synthesis.getVoices?.() || []).filter(v=>/^(he|iw)(-|_|$)/i.test(v.lang));
      const voice=hebrew.find(v=>v.localService) || hebrew[0];
      if (voice) utterance.voice=voice;
      utterance.onend=()=>{if(token===generation && status==='speaking'){index++;speakNext();}};
      utterance.onerror=event=>{if(token===generation && status==='speaking')fail(event.error);};
      notify(`מקריא… קטע ${index+1} מתוך ${chunks.length}.`);
      synthesis.speak(utterance);
    } catch (_) { if(token===generation)fail(); }
  }
  return {
    supported,
    get status(){ return status; },
    start(text,requestedRate=1){
      generation++;cancelEngine();
      chunks=splitNarrationText(text);index=0;
      rate=[0.8,1,1.2].includes(Number(requestedRate)) ? Number(requestedRate) : 1;
      if (!supported) {status='idle';notify('הדפדפן הזה אינו תומך בהקראה. נסו לפתוח את האתר ב־Chrome או ב־Safari.');return;}
      if (!chunks.length) {status='idle';notify('אין תוכן להקראה בדף הזה.');return;}
      try { synthesis.resume?.(); } catch (_) {}
      status='speaking';speakNext();
    },
    pause(){
      if(status!=='speaking')return;
      // Cancel and keep the current short chunk: native pause/resume is not
      // dependable in every mobile engine. Resume repeats only this chunk.
      generation++;status='paused';cancelEngine();currentUtterance=null;
      notify('ההקראה מושהית. ההמשך מתחיל מהקטע הנוכחי.');
    },
    resume(){
      if(status!=='paused')return;
      generation++;status='speaking';
      try { synthesis.resume?.(); } catch (_) {}
      speakNext();
    },
    stop(){
      generation++;status='idle';chunks=[];index=0;currentUtterance=null;cancelEngine();
      notify('ההקראה נעצרה.');
    }
  };
}

let pageNarrator = null;
let narrationMessage = 'לחצו על הקרא את הדף להאזנה בעברית.';
let narrationRate = 1;
function initializeNarration(){
  try {const saved=Number(localStorage.getItem('giants-narration-rate'));if([0.8,1,1.2].includes(saved))narrationRate=saved;} catch (_) {}
  pageNarrator=createNarrator({synthesis:window.speechSynthesis,Utterance:window.SpeechSynthesisUtterance,onChange:({message})=>{narrationMessage=message;syncNarrationUI();}});
  if(!pageNarrator.supported)narrationMessage='הדפדפן הזה אינו תומך בהקראה. אפשר לנסות לפתוח את האתר ב־Chrome או ב־Safari.';
  // Some engines populate their voice list asynchronously. The selected
  // Hebrew voice is resolved afresh for every utterance, including late voices.
  try { window.speechSynthesis?.getVoices?.(); } catch (_) { /* A voice service failure must not block the encyclopedia. */ }
  window.addEventListener('pagehide',stopNarration);
}
function renderNarrationControls(){
  const unsupported = pageNarrator && !pageNarrator.supported;
  return `<section class="narration" aria-label="הקראת דף בעל החיים בעברית">
    <div class="narration-buttons">
      <button id="narrationPlay" class="btn-amber" onclick="startNarration()" ${unsupported?'disabled':''}>🔊 הקרא את הדף</button>
      <button id="narrationPause" class="btn-sec" onclick="toggleNarrationPause()" disabled>השהה</button>
      <button id="narrationStop" class="btn-sec" onclick="stopNarration()" disabled>עצור</button>
      <label class="narration-rate" for="narrationRate">מהירות <select id="narrationRate" onchange="changeNarrationRate(this.value)"><option value="0.8" ${narrationRate===0.8?'selected':''}>איטית</option><option value="1" ${narrationRate===1?'selected':''}>רגילה</option><option value="1.2" ${narrationRate===1.2?'selected':''}>מהירה</option></select></label>
    </div>
    <p id="narrationStatus" role="status" aria-live="polite">${escapeText(narrationMessage)}</p>
    <p class="narration-note">ההקראה כוללת את כל תוכן הדף. הקול וזמינותו ללא אינטרנט תלויים בקולות המותקנים במכשיר.</p>
  </section>`;
}
function syncNarrationUI(){
  const play=document.getElementById('narrationPlay');
  if(!play)return;
  const status=pageNarrator?.status || 'idle';
  const previousFocus=document.activeElement;
  play.disabled=!pageNarrator?.supported || status!=='idle';
  document.getElementById('narrationPause').disabled=status==='idle';
  document.getElementById('narrationPause').textContent=status==='paused'?'המשך':'השהה';
  document.getElementById('narrationStop').disabled=status==='idle';
  document.getElementById('narrationStatus').textContent=narrationMessage;
  if(previousFocus===play && status==='speaking')document.getElementById('narrationPause').focus();
  else if(status==='idle' && ['narrationPause','narrationStop'].includes(previousFocus?.id))play.focus();
}
function startNarration(){
  const animal=ANIMALS.find(a=>a.id===state.animalId);
  if(animal)pageNarrator?.start(buildNarrationText(animal),narrationRate);
}
function toggleNarrationPause(){
  if(pageNarrator?.status==='paused')pageNarrator.resume();else pageNarrator?.pause();
}
function stopNarration(){
  if(pageNarrator?.status!=='idle')pageNarrator?.stop();
}
function changeNarrationRate(value){
  if(![0.8,1,1.2].includes(Number(value)))return;
  stopNarration();narrationRate=Number(value);
  try {localStorage.setItem('giants-narration-rate',String(narrationRate));} catch (_) {}
}
