let articles=[];
function renderArticles(){
  const grid=document.getElementById('articleGrid');
  const status=document.getElementById('articleStatus');
  if(!articles.length){grid.innerHTML='';status.textContent='目前尚無教材。請在 content/articles.json 新增文章。';return;}
  status.textContent=`已載入 ${articles.length} 篇主題教材 · 點選卡片可閱讀完整內容`;
  grid.innerHTML=articles.map(a=>`<article class="card module" role="button" tabindex="0" data-open-article="${escapeHtml(a.id)}"><div class="chips"><span class="chip mint">${escapeHtml(a.category||'其他')}</span>${(a.tags||[]).slice(0,2).map(t=>`<span class="chip">${escapeHtml(t)}</span>`).join('')}</div><h3>${escapeHtml(a.title)}</h3><p>${escapeHtml(a.summary||'')}</p><div class="go">閱讀教材 ↗</div></article>`).join('');
}
function showArticle(id){
  const a=articles.find(x=>x.id===id);if(!a)return;
  document.getElementById('modalRoot').innerHTML=`<div class="modal-overlay" data-close><div class="modal article-modal" role="dialog" aria-modal="true"><div class="modal-head"><div><span class="chip mint">${escapeHtml(a.category||'主題教材')}</span><h2>${escapeHtml(a.title)}</h2></div><button class="close" data-close aria-label="關閉">✕</button></div><div class="article-body">${escapeHtml(a.body||'')}</div>${a.sourceUrl?`<p>${linkButton(a.sourceUrl,'參考來源')}</p>`:''}<button class="button ghost small" data-save-article="${escapeHtml(a.id)}">＋ 把自己的心得加入筆記</button></div></div>`;
}
async function loadArticles(){
  try{
    const r=await fetch('./content/articles.json',{cache:'no-store'});if(!r.ok)throw new Error('HTTP '+r.status);
    const data=await r.json();if(!Array.isArray(data))throw new Error('資料格式錯誤');
    articles=data.filter(a=>a&&typeof a.id==='string'&&typeof a.title==='string'&&typeof a.body==='string');
    renderArticles();
  }catch(e){document.getElementById('articleStatus').textContent='尚未載入 JSON 教材。請用 GitHub Pages 或啟動本機 HTTP 伺服器開啟（file:// 模式無法可靠讀取 JSON）。';}
}
const STORE='music_lab_knowledge_v2';
const state={notes:[],practices:[]};let activeView='home',activeMode=3,activeRoot=0,activeSynthTab='振盪器 OSC',activeNoteFilter='全部',activeProgressionId='pop-1564',activeProgressionKey=0,activeProgressionInstrument='piano',activeProgressionTempo=96,progressionLoop=false,progressionTimers=[],progressionPlaying=false,progressionStep=-1,progressionGeneration=0,searchTerm='',audioCtx=null,activeNodes=[];
function uid(){return Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,8)}
function escapeHtml(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function safeURL(url){try{const a=new URL(url);return ['http:','https:'].includes(a.protocol)?a.href:null;}catch{return null}}
function readStore(){try{const raw=localStorage.getItem(STORE);if(!raw)return;const obj=JSON.parse(raw);if(Array.isArray(obj.notes))state.notes=obj.notes.filter(x=>x&&typeof x.title==='string');if(Array.isArray(obj.practices))state.practices=obj.practices.filter(x=>x&&typeof x.topic==='string');}catch(e){console.warn('無法讀取儲存資料',e)}}
function saveStore(){try{localStorage.setItem(STORE,JSON.stringify({...state,version:2}));}catch(e){toast('無法寫入瀏覽器儲存空間；請先匯出備份。')}}
function toast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove('show'),3200)}
function setSynthPanel(panel){
 const key=panel==='reference'?'reference':'tutorial';
 const ids={tutorial:'synthPanelTutorial',reference:'synthPanelReference'};
 for(const [name,id] of Object.entries(ids)){
  const el=document.getElementById(id),active=name===key;
  if(el){el.hidden=!active;el.classList.toggle('active',active)}
  const tab=document.getElementById(name==='tutorial'?'synthTabTutorial':'synthTabReference');
  if(tab){tab.classList.toggle('active',active);tab.setAttribute('aria-selected',String(active))}
 }
}
function go(v){
 if(activeView==='progressions'&&v!=='progressions')stopAudio();
 activeView=v;
 document.querySelectorAll('.view').forEach(x=>x.classList.toggle('active',x.id==='view-'+v));
 document.querySelectorAll('.nav button').forEach(x=>x.classList.toggle('active',x.dataset.view===v));
 if(v==='synth')setSynthPanel('tutorial');
 if(v==='home')renderHome();if(v==='notes')renderNotes();if(v==='practice')renderPractices();if(v==='arrangement')renderSongNotes();
 window.scrollTo({top:0,behavior:'smooth'});
}
function linkButton(url,label='查看連結'){let safe=safeURL(url);return safe?`<a class="button ghost small" href="${escapeHtml(safe)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)} ↗</a>`:''}
function renderHome(){document.getElementById('stats').innerHTML=`<div class="card"><div class="small-label">知識分類</div><div class="stat">${modules.length}</div><p>樂理、合成器、律動、編曲、混音、資源與主題教材</p></div><div class="card"><div class="small-label">個人筆記</div><div class="stat">${state.notes.length}</div><p>可整理教學重點、音色設定、歌曲分析</p></div><div class="card"><div class="small-label">練習紀錄</div><div class="stat">${state.practices.length}</div><p>持續記下實際完成的音樂練習</p></div>`;document.getElementById('moduleGrid').innerHTML=modules.map(([id,icon,title,desc])=>`<div class="card module" role="button" tabindex="0" data-go="${id}"><div class="emoji">${icon}</div><h3>${title}</h3><p>${desc}</p><div class="go">進入知識區域　→</div></div>`).join('');}
function notateMode(m){
 const root=ROOT_OPTIONS[activeRoot],letters=['C','D','E','F','G','A','B'];
 const natural={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
 const choices=root.names.map((rootName)=>{
  const first=letters.indexOf(rootName[0]);
  const notes=[];let cost=0;
  for(let i=0;i<m.notes.length;i++){
   const letter=letters[(first+i)%7],expected=(root.pc+m.notes[i])%12;
   let delta=(expected-natural[letter]+12)%12;if(delta>6)delta-=12;
   const abs=Math.abs(delta);cost+=abs+20*Math.max(0,abs-1);
   notes.push(letter+(delta>0?'♯'.repeat(delta):delta<0?'♭'.repeat(-delta):''));
  }
  return {rootName,notes,cost};
 });
 choices.sort((a,b)=>a.cost-b.cost);
 return choices[0];
}
function getModeChord(m,spelled){
 const suffix=m.notes[4]===6?'m7♭5':m.notes[2]===4?(m.notes[6]===11?'maj7':'7'):'m7';
 return {name:spelled.rootName+suffix,tones:[spelled.notes[0],spelled.notes[2],spelled.notes[4],spelled.notes[6]]};
}
function renderModes(){
 const root=ROOT_OPTIONS[activeRoot],m=MODES[activeMode],spelled=notateMode(m),chord=getModeChord(m,spelled);
 document.getElementById('rootPicker').innerHTML=ROOT_OPTIONS.map((r,i)=>`<button type="button" class="root-button ${i===activeRoot?'active':''}" data-root="${i}" aria-pressed="${i===activeRoot}">${escapeHtml(r.label)}</button>`).join('');
 document.getElementById('tonicDisplay').textContent=spelled.rootName;
 document.getElementById('modePicker').innerHTML=MODES.map((x,i)=>`<button class="mode-button ${i===activeMode?'active':''}" data-mode="${i}" aria-pressed="${i===activeMode}">${escapeHtml(x.name)}</button>`).join('');
 document.getElementById('brightness').innerHTML=MODES.map((x,i)=>`<button class="${i===activeMode?'active':''}" data-mode="${i}">${i===0?'☀ ':''}${escapeHtml(x.name)}</button>`).join('');
 document.getElementById('modeTitle').textContent=spelled.rootName+' '+m.name;
 document.getElementById('modeChord').textContent=chord.name;
 document.getElementById('modeDesc').textContent=m.desc;
 document.getElementById('scaleNotes').innerHTML=spelled.notes.map((x,i)=>`<span ${i===0?'class="tonic"':''}>${escapeHtml(x)}</span>`).join('');
 const featureIndex={Lydian:3,Mixolydian:6,Dorian:5,Aeolian:5,Phrygian:1,Locrian:4};
 const featureDegree={Lydian:'♯4',Mixolydian:'♭7',Dorian:'6',Aeolian:'♭6',Phrygian:'♭2',Locrian:'♭5'};
 const feature=featureIndex[m.name]===undefined?'':`<br>特色音：<strong style="color:#71e5c5">${escapeHtml(spelled.notes[featureIndex[m.name]])}（${featureDegree[m.name]}）</strong>`;
 document.getElementById('modeDetails').innerHTML=`音程度數：<strong style="color:#dff6ef">${escapeHtml(m.formula)}</strong>${feature}<br>主七和弦：<strong style="color:#edc88b">${escapeHtml(chord.name)} · ${escapeHtml(chord.tones.join(' · '))}</strong>`;
 document.getElementById('playScale').textContent='▶ 聽音階＋'+spelled.rootName+' 低音';
 renderKeyboard(m,spelled);
}
function renderKeyboard(m,spelled){
 const rootMidi=60+ROOT_OPTIONS[activeRoot].pc;
 const selected=new Map(m.notes.map((offset,i)=>[rootMidi+offset,spelled.notes[i]]));
 selected.set(rootMidi+12,spelled.notes[0]);
 const whites=[60,62,64,65,67,69,71,72,74,76,77,79,81,83,84];
 const blacks=[61,63,66,68,70,73,75,78,80,82];
 const whiteNames=['C','D','E','F','G','A','B','C','D','E','F','G','A','B','C'];
 const standardSharps=['C♯','D♯','F♯','G♯','A♯','C♯','D♯','F♯','G♯','A♯'];
 const white=whites.map((midi,i)=>`<div class="white-key ${selected.has(midi)?'selected':''} ${midi===rootMidi||midi===rootMidi+12?'root':''}" title="${escapeHtml(selected.get(midi)||whiteNames[i])}"><span>${escapeHtml(selected.get(midi)||whiteNames[i])}</span></div>`).join('');
 const black=blacks.map((midi,i)=>{
  const left=100*(whites.filter(x=>x<midi).length/whites.length);
  const keyName=selected.get(midi)||standardSharps[i];
  return `<div class="black-key ${selected.has(midi)?'selected':''} ${midi===rootMidi||midi===rootMidi+12?'root':''}" style="left:${left.toFixed(4)}%" title="${escapeHtml(keyName)}"><span>${escapeHtml(keyName)}</span></div>`;
 }).join('');
 document.getElementById('keyboard').innerHTML=`<div class="keyboard-range">${white}${black}</div>`;
}
function stopAudio(){activeNodes.forEach(x=>{try{x.stop()}catch{}});activeNodes=[];stopProgressionTimeline()}
function noteTone(midi,start,duration=.32,type='triangle',gain=.075){const ctx=audioCtx;const f=440*Math.pow(2,(midi-69)/12);const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.value=f;g.gain.setValueAtTime(0,start);g.gain.linearRampToValueAtTime(gain,start+.012);g.gain.setTargetAtTime(0,start+Math.max(.07,duration-.09),.045);o.connect(g);g.connect(ctx.destination);o.start(start);o.stop(start+duration+.18);activeNodes.push(o);o.onended=()=>{activeNodes=activeNodes.filter(n=>n!==o)}}
function play(kind){
 stopAudio();
 try{
  audioCtx=audioCtx||new(window.AudioContext||window.webkitAudioContext)();audioCtx.resume();
  const m=MODES[activeMode],t=audioCtx.currentTime+.06,rootMidi=60+ROOT_OPTIONS[activeRoot].pc;
  if(kind==='scale'){
   noteTone(rootMidi-12,t,3.2,'sine',.032);
   [...m.notes,12].forEach((offset,i)=>noteTone(rootMidi+offset,t+i*.31,.27,'triangle',.095));
  }else{
   [m.notes[0],m.notes[2],m.notes[4],m.notes[6]].forEach((offset,i)=>noteTone(rootMidi+offset,t+i*.03,1.6,'triangle',.06));
  }
 }catch(e){toast('目前瀏覽器無法播放 Web Audio')}
}

const PROGRESSION_MAJOR_NAMES=[
 ['C','D','E','F','G','A','B'],['D♭','E♭','F','G♭','A♭','B♭','C'],
 ['D','E','F♯','G','A','B','C♯'],['E♭','F','G','A♭','B♭','C','D'],
 ['E','F♯','G♯','A','B','C♯','D♯'],['F','G','A','B♭','C','D','E'],
 ['F♯','G♯','A♯','B','C♯','D♯','E♯'],['G','A','B','C','D','E','F♯'],
 ['A♭','B♭','C','D♭','E♭','F','G'],['A','B','C♯','D','E','F♯','G♯'],
 ['B♭','C','D','E♭','F','G','A'],['B','C♯','D♯','E','F♯','G♯','A♯']
];
const PROGRESSION_MINOR_NAMES=[
 ['C','D','E♭','F','G','A♭','B♭'],['C♯','D♯','E','F♯','G♯','A','B'],
 ['D','E','F','G','A','B♭','C'],['E♭','F','G♭','A♭','B♭','C♭','D♭'],
 ['E','F♯','G','A','B','C','D'],['F','G','A♭','B♭','C','D♭','E♭'],
 ['F♯','G♯','A','B','C♯','D','E'],['G','A','B♭','C','D','E♭','F'],
 ['G♯','A♯','B','C♯','D♯','E','F♯'],['A','B','C','D','E','F','G'],
 ['B♭','C','D♭','E♭','F','G♭','A♭'],['B','C♯','D','E','F♯','G','A']
];
const PROGRESSION_MAJOR_OFFSETS=[0,2,4,5,7,9,11],PROGRESSION_MINOR_OFFSETS=[0,2,3,5,7,8,10];
const CHORD_INTERVALS={maj:[0,4,7],min:[0,3,7],maj7:[0,4,7,11],m7:[0,3,7,10],'7':[0,4,7,10],m7b5:[0,3,6,10]};
const CHORD_SUFFIX={maj:'',min:'m',maj7:'maj7',m7:'m7','7':'7',m7b5:'m7♭5'};
function currentProgression(){return PROGRESSION_PRESETS.find(x=>x.id===activeProgressionId)||PROGRESSION_PRESETS[0]}
function currentProgressionInstrument(){return PROGRESSION_INSTRUMENTS.find(x=>x.id===activeProgressionInstrument)||PROGRESSION_INSTRUMENTS[0]}
function progressionTonicName(preset){return (preset.tonality==='minor'?PROGRESSION_MINOR_NAMES:PROGRESSION_MAJOR_NAMES)[activeProgressionKey][0]}
function progressionRootName(offset,preset){
 const minor=preset.tonality==='minor',offsets=minor?PROGRESSION_MINOR_OFFSETS:PROGRESSION_MAJOR_OFFSETS;
 const names=(minor?PROGRESSION_MINOR_NAMES:PROGRESSION_MAJOR_NAMES)[activeProgressionKey];
 const i=offsets.indexOf(offset);if(i!==-1)return names[i];
 const pc=(activeProgressionKey+offset)%12;
 const chromatic=['C','D♭','D','E♭','E','F','G♭','G','A♭','A','B♭','B'];
 const sharp=['C','C♯','D','D♯','E','F','F♯','G','G♯','A','A♯','B'];
 const sharpKeys=[1,2,4,6,9,11];return (sharpKeys.includes(activeProgressionKey)?sharp:chromatic)[pc];
}
function progressionChord(index){
 const p=currentProgression(),step=p.steps[index];if(!step)return null;
 const [offset,quality,roman]=step;
 return {index,offset,quality,roman,name:progressionRootName(offset,p)+(CHORD_SUFFIX[quality]||''),pitch:(activeProgressionKey+offset)%12,intervals:CHORD_INTERVALS[quality]||CHORD_INTERVALS.maj};
}
function renderProgressionChoices(){
 document.getElementById('progressionCount').textContent=PROGRESSION_PRESETS.length+' 組';
 document.getElementById('progressionChoices').innerHTML=PROGRESSION_PRESETS.map(x=>
 `<button class="progression-choice ${x.id===activeProgressionId?'active':''}" data-progression="${escapeHtml(x.id)}" aria-pressed="${x.id===activeProgressionId}"><span class="pc-genre">${escapeHtml(x.genre)}</span><strong>${escapeHtml(x.name)}</strong><small>${escapeHtml(x.steps.map(step=>step[2]).join(' → '))}</small></button>`).join('');
}
function renderProgressionChords(){
 const preset=currentProgression();
 document.getElementById('progressionTitle').textContent=preset.name;
 document.getElementById('progressionKeyBadge').textContent=progressionTonicName(preset)+(preset.tonality==='minor'?' minor':' major');
 document.getElementById('progressionDescription').textContent=preset.desc;
 let elapsedBeats=0;
 document.getElementById('progressionChords').innerHTML=preset.steps.map((s,i)=>{
  const c=progressionChord(i),beats=s[3]||4;
  const bar=Math.floor(elapsedBeats/4)+1,firstBeat=elapsedBeats%4+1;
  const location=beats===4?'BAR '+bar:'BAR '+bar+' · '+firstBeat+'–'+(firstBeat+beats-1)+' 拍';
  elapsedBeats+=beats;
  return `<button class="progression-chord ${i===progressionStep?'current':''}" data-preview-chord="${i}" aria-label="試聽第 ${i+1} 個和弦 ${escapeHtml(c.name)}"><span class="pc-step">${escapeHtml(location)}</span><strong>${escapeHtml(c.name)}</strong><small>${escapeHtml(c.roman)}</small></button>`;
 }).join('');
 document.getElementById('instrumentNote').textContent=currentProgressionInstrument().tip;
}
function setupProgressions(){
 document.getElementById('progressionKey').innerHTML=ROOT_OPTIONS.map((k,i)=>`<option value="${i}">${escapeHtml(k.label)}</option>`).join('');
 document.getElementById('progressionInstrument').innerHTML=PROGRESSION_INSTRUMENTS.map(i=>`<option value="${i.id}">${escapeHtml(i.name)}</option>`).join('');
 document.getElementById('progressionKey').value=String(activeProgressionKey);
 document.getElementById('progressionInstrument').value=activeProgressionInstrument;
 document.getElementById('progressionTempo').value=String(activeProgressionTempo);
 document.getElementById('progressionTempoValue').textContent=activeProgressionTempo+' BPM';
 renderProgressionChoices();renderProgressionChords();
}
function clearProgressionTimeline(){
 progressionGeneration++;
 progressionTimers.forEach(clearTimeout);progressionTimers=[];
 progressionPlaying=false;progressionStep=-1;
 const status=document.getElementById('progressionStatus');
 if(status)status.textContent='已停止／準備播放';
 const play=document.getElementById('progressionPlay');if(play)play.disabled=false;
 document.querySelectorAll('.progression-chord.current').forEach(el=>el.classList.remove('current'));
}
function stopProgressionTimeline(){clearProgressionTimeline()}
function scheduleProgressionNote(ctx,midi,t,duration,inst,levelFactor){
 const freq=440*Math.pow(2,(midi-69)/12);
 const attack=inst.attack,decay=inst.decay,release=inst.release;
 // Use one envelope per note, shared by the instrument's harmonics.
 const env=ctx.createGain(),gain=Math.max(.0001,inst.level*levelFactor);
 env.gain.setValueAtTime(.0001,t);
 env.gain.linearRampToValueAtTime(gain,t+attack);
 env.gain.exponentialRampToValueAtTime(Math.max(.0001,gain*inst.sustain),t+attack+decay);
 env.gain.setValueAtTime(Math.max(.0001,gain*inst.sustain),t+duration);
 env.gain.exponentialRampToValueAtTime(.0001,t+duration+release);
 const filter=inst.lowpass?ctx.createBiquadFilter():null;
 if(filter){filter.type='lowpass';filter.frequency.value=inst.lowpass;env.connect(filter);filter.connect(ctx.destination)}
 else env.connect(ctx.destination);
 inst.partials.forEach(([ratio,wave,partGain])=>{
  const osc=ctx.createOscillator(),vol=ctx.createGain();
  osc.type=wave;osc.frequency.value=freq*ratio;vol.gain.value=partGain;
  osc.connect(vol);vol.connect(env);osc.start(t);osc.stop(t+duration+release+.06);
  activeNodes.push(osc);osc.onended=()=>{activeNodes=activeNodes.filter(o=>o!==osc)};
 });
}
function scheduleProgressionChord(index,start,duration){
 const ctx=audioCtx,c=progressionChord(index),inst=currentProgressionInstrument();
 if(!c)return;
 const chordMidis=c.intervals.map(offset=>60+c.pitch+offset);
 // Root plus chord voicing, with moderate headroom to avoid clipping.
 chordMidis.forEach((m,i)=>scheduleProgressionNote(ctx,m,start+((inst.id==='guitar'||inst.id==='clean')?i*.022:0),Math.max(.35,duration-.10),inst,1/Math.sqrt(chordMidis.length)));
 scheduleProgressionNote(ctx,36+c.pitch,start,Math.max(.30,duration-.14),inst,.30);
}
function addProgressionTimer(fn,delay){progressionTimers.push(setTimeout(fn,Math.max(0,delay)))}
function scheduleProgressionRound(token){
 const preset=currentProgression(),beat=60/activeProgressionTempo;
 const start=audioCtx.currentTime+.075;
 let elapsedBeats=0;
 preset.steps.forEach((step,i)=>{
  const beats=step[3]||4,onset=start+elapsedBeats*beat;
  scheduleProgressionChord(i,onset,beats*beat);
  addProgressionTimer(()=>{
   if(token!==progressionGeneration)return;
   progressionStep=i;renderProgressionChords();
   document.getElementById('progressionStatus').textContent=`播放中 · ${i+1}/${preset.steps.length} · ${progressionChord(i).name}`;
  },(onset-audioCtx.currentTime)*1000);
  elapsedBeats+=beats;
 });
 addProgressionTimer(()=>{
  if(token!==progressionGeneration)return;
  if(progressionLoop)scheduleProgressionRound(token);
  else{
   progressionPlaying=false;progressionStep=-1;renderProgressionChords();
   document.getElementById('progressionStatus').textContent='播放完成';
   document.getElementById('progressionPlay').disabled=false;
  }
 },(start+elapsedBeats*beat-audioCtx.currentTime)*1000+25);
}
function startProgression(){
 stopAudio();
 try{
  audioCtx=audioCtx||new(window.AudioContext||window.webkitAudioContext)();
  audioCtx.resume();
  progressionPlaying=true;
  document.getElementById('progressionPlay').disabled=true;
  document.getElementById('progressionStatus').textContent='開始播放…';
  scheduleProgressionRound(progressionGeneration);
 }catch(e){clearProgressionTimeline();toast('目前瀏覽器無法播放 Web Audio')}
}
function previewProgressionChord(index){
 stopAudio();
 try{
  audioCtx=audioCtx||new(window.AudioContext||window.webkitAudioContext)();
  audioCtx.resume();
  scheduleProgressionChord(index,audioCtx.currentTime+.05,1.2);
  progressionStep=index;renderProgressionChords();
  document.getElementById('progressionStatus').textContent='試聽 · '+progressionChord(index).name;
  const token=progressionGeneration;
  addProgressionTimer(()=>{if(token!==progressionGeneration)return;progressionStep=-1;renderProgressionChords();document.getElementById('progressionStatus').textContent='試聽完成';},1550);
 }catch(e){toast('目前瀏覽器無法播放音色')}
}

function renderSynthMaps(){
 const legend=document.getElementById('synthLegend');
 legend.innerHTML=Object.keys(SYNTH_META).map(key=>{const m=SYNTH_META[key];return `<div class="synth-legend-item"><span class="synth-icon ${m.color}" aria-hidden="true">${m.symbol}</span><strong>${escapeHtml(key)}</strong></div>`}).join('');
 const render=(id,blocks)=>{document.getElementById(id).innerHTML=blocks.map(b=>`<div class="map-zone zone-${b.area} ${b.group===activeSynthTab?'selected':''}" aria-label="${escapeHtml(b.where)} ${escapeHtml(b.label)}">
 <small>${escapeHtml(b.where)}</small><strong>${escapeHtml(b.label)}</strong><span>${escapeHtml(b.detail)}</span></div>`).join('')};
 render('serumMap',SERUM_MAP_BLOCKS);render('vitalMap',VITAL_MAP_BLOCKS);
}
function renderSynth(){
 const m=SYNTH_META[activeSynthTab];
 document.getElementById('synthTabs').innerHTML=Object.keys(SYNTH).map(t=>{const x=SYNTH_META[t];return `<button class="tab synth-tab ${t===activeSynthTab?'active':''}" data-synth-tab="${escapeHtml(t)}" aria-pressed="${t===activeSynthTab}"><span class="synth-icon ${x.color}" aria-hidden="true">${x.symbol}</span>${escapeHtml(t)}</button>`}).join('');
 renderSynthMaps();
 document.getElementById('synthTable').innerHTML=SYNTH[activeSynthTab].map(a=>`<tr><td><div class="param-label"><span class="synth-icon ${m.color}" aria-hidden="true">${m.symbol}</span><div><strong>${escapeHtml(a[0])}</strong><small>${escapeHtml(m.serum)}</small></div></div></td><td><strong>${escapeHtml(a[1])}</strong><small class="param-sub">${escapeHtml(m.vital)}</small></td><td>${escapeHtml(a[2])}</td></tr>`).join('');
 document.getElementById('recipeGrid').innerHTML=RECIPES.map((r,i)=>`<div class="card"><span class="chip mint">${escapeHtml(r.tag)}</span><h3>${escapeHtml(r.title)}</h3><p>${escapeHtml(r.desc)}</p><button class="button ghost small" data-recipe="${i}">查看製作步驟</button></div>`).join('');
}
function showRecipe(i){const r=RECIPES[i];document.getElementById('modalRoot').innerHTML=`<div class="modal-overlay" data-close><div class="modal" role="dialog" aria-modal="true"><div class="modal-head"><div><span class="small-label">VITAL SOUND RECIPE</span><h2>${escapeHtml(r.title)}</h2></div><button class="close" data-close>✕</button></div><p class="text-explain">${escapeHtml(r.desc)}</p>${r.steps.map((step,i)=>`<div class="step"><span class="step-num">${i+1}</span><p>${escapeHtml(step)}</p></div>`).join('')}<div class="callout">這是練習起點，不是聲稱完全還原某首歌曲的精確 Preset。不同版本／波表請以耳朵調整。</div><button class="button" onclick="openNote('合成器教學','${escapeHtml(r.title)}')">記下這個音色的實作結果</button></div></div>`}
function renderGroove(){document.getElementById('grooveGrid').innerHTML=GROOVES.map(g=>`<div class="card"><span class="chip gold">${escapeHtml(g.tag)}</span><h3>${escapeHtml(g.name)}</h3><p>${escapeHtml(g.desc)}</p><div class="dim text-explain">${escapeHtml(g.task)}</div></div>`).join('')}
function renderMix(){document.getElementById('mixGrid').innerHTML=MIX.map(x=>`<div class="card"><h3>${escapeHtml(x[0])}</h3><p>${escapeHtml(x[1])}</p></div>`).join('')}
function renderResources(){document.getElementById('resourceList').innerHTML=RESOURCES.map(x=>`<div class="resource"><div><h3>${escapeHtml(x[0])}</h3><p>${escapeHtml(x[1])}</p></div>${linkButton(x[2])}</div>`).join('')}
function noteCard(n){return `<article class="card note-card"><div class="list-head"><span class="chip mint">${escapeHtml(n.category||'其他')}</span><span class="note-date">${escapeHtml((n.updatedAt||'').slice(0,10))}</span></div><div class="n-title" style="margin-top:15px">${escapeHtml(n.title)}</div><div class="n-desc">${escapeHtml(n.content||'')}</div><div class="chips" style="margin-top:10px">${String(n.tags||'').split(',').filter(Boolean).map(x=>`<span class="chip">#${escapeHtml(x.trim())}</span>`).join('')}</div><div class="note-actions"><button class="button ghost small" data-edit-note="${escapeHtml(n.id)}">編輯</button>${n.url&&safeURL(n.url)?linkButton(n.url):''}<button class="button danger small" data-delete-note="${escapeHtml(n.id)}">刪除</button></div></article>`}
function renderNotes(){document.getElementById('noteFilters').innerHTML=['全部',...CATEGORIES].map(x=>`<button class="tab ${activeNoteFilter===x?'active':''}" data-note-filter="${escapeHtml(x)}">${escapeHtml(x)}</button>`).join('');const list=[...state.notes].filter(x=>activeNoteFilter==='全部'||x.category===activeNoteFilter).sort((a,b)=>String(b.updatedAt||'').localeCompare(String(a.updatedAt||'')));document.getElementById('notesGrid').innerHTML=list.length?list.map(noteCard).join(''):'<div class="empty">這個分類還沒有筆記。<br>按「新增筆記」開始收集自己的知識。</div>'}
function renderSongNotes(){const list=state.notes.filter(x=>x.category==='編曲與歌曲分析');document.getElementById('songNotes').innerHTML=list.length?list.map(noteCard).join(''):'<div class="empty">尚未有歌曲分析。<br>可先新增你喜歡的 K-pop 歌曲拆解。</div>'}
function openNote(category='合成器教學',title='',id=null){const existing=id?state.notes.find(n=>n.id===id):null;document.getElementById('modalRoot').innerHTML=`<div class="modal-overlay" data-close><div class="modal" role="dialog" aria-modal="true"><div class="modal-head"><h2>${existing?'編輯筆記':'新增知識筆記'}</h2><button class="close" data-close>✕</button></div><form id="noteForm"><input type="hidden" name="id" value="${escapeHtml(existing?.id||'')}"><div class="form-field"><label>標題 *</label><input name="title" required maxlength="120" placeholder="例：aespa 某首歌的 Bass 音色" value="${escapeHtml(existing?.title||title)}"></div><div class="form-row"><div class="form-field"><label>分類</label><select name="category">${CATEGORIES.map(c=>`<option value="${c}" ${c===(existing?.category||category)?'selected':''}>${c}</option>`).join('')}</select></div><div class="form-field"><label>標籤（逗號分隔）</label><input name="tags" placeholder="Vital, Bass, K-pop" value="${escapeHtml(existing?.tags||'')}"></div></div><div class="form-field"><label>學習內容／參數與心得</label><textarea name="content" rows="9" placeholder="記錄學到了什麼、Vital 參數、和原曲不同之處…">${escapeHtml(existing?.content||'')}</textarea></div><div class="form-field"><label>影片／文章／Preset 連結（選填）</label><input name="url" type="url" placeholder="https://..." value="${escapeHtml(existing?.url||'')}"></div><div class="panel"><small class="muted">本機自動儲存；建議在筆記頁匯出備份。</small><button class="button" type="submit">儲存筆記</button></div></form></div></div>`;document.querySelector('#noteForm input[name=title]').focus()}
function saveNote(form){const data=new FormData(form),id=data.get('id')||uid(),title=String(data.get('title')||'').trim();if(!title)return;const n={id,title,category:String(data.get('category')),content:String(data.get('content')||''),tags:String(data.get('tags')||''),url:safeURL(String(data.get('url')||''))||'',updatedAt:new Date().toISOString()};const ix=state.notes.findIndex(x=>x.id===id);if(ix<0)state.notes.unshift(n);else state.notes[ix]=n;saveStore();closeModal();renderHome();renderNotes();renderSongNotes();go('notes');toast('筆記已儲存')}
function deleteNote(id){const x=state.notes.find(n=>n.id===id);if(!x||!confirm('確定刪除筆記「'+x.title+'」？'))return;state.notes=state.notes.filter(n=>n.id!==id);saveStore();renderNotes();renderSongNotes();renderHome();toast('筆記已刪除')}
function openPractice(){const now=new Date();const d=new Date(now.getTime()-now.getTimezoneOffset()*60000).toISOString().slice(0,10);document.getElementById('modalRoot').innerHTML=`<div class="modal-overlay" data-close><div class="modal" role="dialog" aria-modal="true"><div class="modal-head"><h2>新增練習紀錄</h2><button class="close" data-close>✕</button></div><form id="practiceForm"><div class="form-row"><div class="form-field"><label>練習日期</label><input type="date" name="date" required value="${d}"></div><div class="form-field"><label>練習時間（分鐘）</label><input type="number" name="minutes" min="0" max="1440" value="20" required></div></div><div class="form-field"><label>今天練什麼？ *</label><input name="topic" required placeholder="例：Vital Supersaw / Funk Bass"></div><div class="form-field"><label>完成的內容與下次改進方向</label><textarea name="takeaway" rows="5" placeholder="例：調出 7-voice Supersaw，但高頻太尖，下次先調 Filter…"></textarea></div><button type="submit" class="button">儲存紀錄</button></form></div></div>`}
function savePractice(form){const d=new FormData(form),p={id:uid(),date:String(d.get('date')),minutes:Math.max(0,Number(d.get('minutes'))||0),topic:String(d.get('topic')||'').trim(),takeaway:String(d.get('takeaway')||'')};if(!p.topic)return;state.practices.unshift(p);saveStore();closeModal();renderPractices();renderHome();toast('練習已記錄')}
function renderPractices(){const total=state.practices.reduce((s,x)=>s+(Number(x.minutes)||0),0);const days=new Set(state.practices.map(x=>x.date)).size;document.getElementById('practiceStats').innerHTML=`<div class="card"><div class="small-label">練習次數</div><div class="stat">${state.practices.length}</div></div><div class="card"><div class="small-label">累計時間</div><div class="stat">${total} <span style="font-size:13px">分鐘</span></div></div><div class="card"><div class="small-label">實際練習日</div><div class="stat">${days} <span style="font-size:13px">天</span></div></div>`;const list=[...state.practices].sort((a,b)=>String(b.date).localeCompare(String(a.date)));document.getElementById('practiceList').innerHTML=list.length?list.map(x=>`<div class="card"><div class="list-head"><span class="chip mint">${escapeHtml(x.date)}</span><span class="note-date">${Number(x.minutes)||0} 分鐘</span></div><h3>${escapeHtml(x.topic)}</h3><p style="white-space:pre-wrap">${escapeHtml(x.takeaway||'未填寫心得')}</p><button class="button danger small" data-delete-practice="${escapeHtml(x.id)}">刪除紀錄</button></div>`).join(''):'<div class="empty">還沒有練習紀錄。<br>從今天的 15–20 分鐘開始吧。</div>'}
function exportData(){const payload={format:'MusicLabBackup',version:2,exportedAt:new Date().toISOString(),notes:state.notes,practices:state.practices};const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='music-lab-backup-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);toast('已匯出備份檔')}
function importData(file){const reader=new FileReader();reader.onload=()=>{try{const obj=JSON.parse(String(reader.result));if(obj.format!=='MusicLabBackup'||!Array.isArray(obj.notes)||!Array.isArray(obj.practices))throw Error('格式不符');if(!confirm(`匯入 ${obj.notes.length} 筆筆記、${obj.practices.length} 筆練習？將覆蓋目前瀏覽器的資料，請確認你已有備份。`))return;state.notes=obj.notes.filter(x=>x&&typeof x.title==='string').map(x=>({...x,id:String(x.id||uid())}));state.practices=obj.practices.filter(x=>x&&typeof x.topic==='string').map(x=>({...x,id:String(x.id||uid())}));saveStore();renderNotes();renderPractices();renderHome();renderSongNotes();toast('資料匯入完成');}catch(e){toast('匯入失敗：請選擇本網站匯出的 JSON 備份。')}};reader.readAsText(file)}
const searchable=[{title:'Serum → Vital 對照',desc:'合成器功能對應、介面區塊圖、OSC Filter LFO FX',view:'synth',synthPanel:'reference'},...modules.map(x=>({title:x[2],desc:x[3],view:x[0]})),...Object.entries(SYNTH).flatMap(([t,items])=>items.map(x=>({title:x[0]+' → '+x[1],desc:x[2]+' '+t,view:'synth',synthPanel:'reference',synthTab:t}))),...MODES.map(m=>({title:'C '+m.name,desc:m.desc+' '+m.formula,view:'theory'})),...GROOVES.map(x=>({title:x.name,desc:x.desc,view:'groove'})),...RECIPES.map(x=>({title:x.title,desc:x.desc,view:'synth'})),...RESOURCES.map(x=>({title:x[0],desc:x[1],view:'resources'}))];
function doSearch(q){searchTerm=q.trim();if(!searchTerm){go('home');return}const s=searchTerm.toLocaleLowerCase(),staticItems=[...searchable,...articles.map(a=>({title:a.title,desc:a.summary||'',view:'articles',articleId:a.id}))].filter(x=>(x.title+' '+x.desc).toLocaleLowerCase().includes(s)),personal=state.notes.filter(x=>(x.title+' '+x.content+' '+x.tags+' '+x.category).toLocaleLowerCase().includes(s));document.getElementById('searchHeading').textContent=`「${searchTerm}」的搜尋結果`;document.getElementById('searchResults').innerHTML=staticItems.map((x,i)=>`<div class="search-result" data-search-index="${i}"><strong>${escapeHtml(x.title)}</strong><small>${escapeHtml(x.desc.slice(0,130))}</small></div>`).join('')+personal.map(n=>`<div class="search-result" data-search-note="${escapeHtml(n.id)}"><strong>✎ ${escapeHtml(n.title)}</strong><small>${escapeHtml(n.category)} · ${escapeHtml((n.content||'').slice(0,130))}</small></div>`).join('')||'<div class="empty">沒有符合的內容，試試其他關鍵字。</div>';window.currentSearchItems=staticItems;go('search')}
function closeModal(){document.getElementById('modalRoot').innerHTML=''}
document.addEventListener('click',e=>{const el=e.target.closest('button,[data-go],[data-mode],[data-recipe],[data-note-filter],[data-edit-note],[data-delete-note],[data-delete-practice],[data-search-index],[data-search-note],[data-open-article],[data-save-article]');if(!el)return;if(el.dataset.view)go(el.dataset.view);if(el.dataset.go)go(el.dataset.go);if(el.dataset.synthPanel){if(activeView!=='synth')go('synth');setSynthPanel(el.dataset.synthPanel)}if(el.dataset.mode!==undefined){activeMode=Number(el.dataset.mode);stopAudio();renderModes()}if(el.dataset.progression){stopAudio();activeProgressionId=el.dataset.progression;renderProgressionChoices();renderProgressionChords()}if(el.dataset.previewChord!==undefined){previewProgressionChord(Number(el.dataset.previewChord))}if(el.dataset.root!==undefined){activeRoot=Number(el.dataset.root);stopAudio();renderModes()}if(el.dataset.synthTab){activeSynthTab=el.dataset.synthTab;renderSynth()}if(el.dataset.recipe)showRecipe(Number(el.dataset.recipe));if(el.dataset.noteFilter){activeNoteFilter=el.dataset.noteFilter;renderNotes()}if(el.dataset.editNote){const n=state.notes.find(x=>x.id===el.dataset.editNote);if(n)openNote(n.category,'',n.id)}if(el.dataset.deleteNote)deleteNote(el.dataset.deleteNote);if(el.dataset.deletePractice&&confirm('要刪除這筆練習紀錄嗎？')){state.practices=state.practices.filter(x=>x.id!==el.dataset.deletePractice);saveStore();renderPractices();renderHome()}if(el.dataset.openArticle){go('articles');showArticle(el.dataset.openArticle)}if(el.dataset.saveArticle){const a=articles.find(x=>x.id===el.dataset.saveArticle);if(a)openNote(a.category,a.title)}if(el.dataset.searchIndex!==undefined){const item=window.currentSearchItems?.[Number(el.dataset.searchIndex)];if(item){if(item.synthTab)activeSynthTab=item.synthTab;renderSynth();go(item.view);if(item.synthPanel)setSynthPanel(item.synthPanel);if(item.articleId)showArticle(item.articleId)}}if(el.dataset.searchNote){const n=state.notes.find(x=>x.id===el.dataset.searchNote);if(n)openNote(n.category,'',n.id)}});
document.addEventListener('keydown',e=>{const el=e.target.closest('[data-go]');if(el&&(e.key==='Enter'||e.key===' ')){e.preventDefault();go(el.dataset.go)}if(e.key==='Escape')closeModal()});
document.getElementById('modalRoot').addEventListener('click',e=>{if(e.target.hasAttribute('data-close'))closeModal()});document.getElementById('modalRoot').addEventListener('submit',e=>{e.preventDefault();if(e.target.getAttribute('id')==='noteForm')saveNote(e.target);if(e.target.getAttribute('id')==='practiceForm')savePractice(e.target)});
document.getElementById('globalSearch').addEventListener('keydown',e=>{if(e.key==='Enter')doSearch(e.target.value)});document.getElementById('globalSearch').addEventListener('input',e=>{if(!e.target.value.trim()&&activeView==='search')go('home')});
document.getElementById('newNoteTop').onclick=()=>openNote();document.getElementById('newPractice').onclick=openPractice;document.getElementById('exportData').onclick=exportData;document.getElementById('importData').onclick=()=>document.getElementById('fileInput').click();document.getElementById('fileInput').onchange=e=>{if(e.target.files?.[0])importData(e.target.files[0]);e.target.value=''};document.getElementById('progressionKey').onchange=e=>{stopAudio();activeProgressionKey=Number(e.target.value);renderProgressionChords()};
document.getElementById('progressionInstrument').onchange=e=>{stopAudio();activeProgressionInstrument=e.target.value;renderProgressionChords()};
document.getElementById('progressionTempo').oninput=e=>{
 activeProgressionTempo=Number(e.target.value);document.getElementById('progressionTempoValue').textContent=activeProgressionTempo+' BPM';
 if(progressionPlaying)stopAudio();
};
document.getElementById('progressionLoop').onchange=e=>{progressionLoop=e.target.checked};
document.getElementById('progressionPlay').onclick=startProgression;
document.getElementById('progressionStop').onclick=stopAudio;
document.getElementById('playScale').onclick=()=>play('scale');document.getElementById('playChord').onclick=()=>play('chord');document.getElementById('stopAudio').onclick=stopAudio;
readStore();loadArticles();renderHome();renderModes();setupProgressions();renderSynth();renderGroove();renderMix();renderResources();renderNotes();renderPractices();renderSongNotes();