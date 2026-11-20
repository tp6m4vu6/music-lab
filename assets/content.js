const CATEGORIES=['樂理與調式','合成器教學','節奏與曲風','編曲與歌曲分析','混音與音色','插件與資源','其他'];
const routeCategories={theory:'樂理與調式',progressions:'樂理與調式',synth:'合成器教學',groove:'節奏與曲風',arrangement:'編曲與歌曲分析',mix:'混音與音色',resources:'插件與資源'};
const modules=[['theory','♬','樂理與調式','調式亮暗、和弦、次屬與 Voice Leading'],['progressions','♫','和弦進行','經典進行、12 主音、BPM 與多種合成樂器音色試聽'],['synth','▥','合成器教學','音色製作教學與 Serum → Vital 對照，共用一個入口'],['groove','◉','節奏與曲風','Funk、Acid Jazz、UK Garage 與切分'],['arrangement','▦','編曲與歌曲分析','歌曲結構、K-pop 音色拆解、Loop'],['mix','≋','混音與音色','EQ、音量、Pan、Reverb、Sidechain'],['resources','↗','插件與資源','免費工具、教學、Preset 與收藏'],['articles','▤','主題教材','GitHub 內容管理：K-pop、樂理與合成器教學']];
const ROOT_OPTIONS=[
 {pc:0,label:'C',names:['C']},{pc:1,label:'C♯ / D♭',names:['D♭','C♯']},
 {pc:2,label:'D',names:['D']},{pc:3,label:'D♯ / E♭',names:['E♭','D♯']},
 {pc:4,label:'E',names:['E']},{pc:5,label:'F',names:['F']},
 {pc:6,label:'F♯ / G♭',names:['F♯','G♭']},{pc:7,label:'G',names:['G']},
 {pc:8,label:'G♯ / A♭',names:['A♭','G♯']},{pc:9,label:'A',names:['A']},
 {pc:10,label:'A♯ / B♭',names:['B♭','A♯']},{pc:11,label:'B',names:['B']}
];
const MODES=[
 {name:'Lydian',notes:[0,2,4,6,7,9,11],scale:['C','D','E','F♯','G','A','B'],chord:'Cmaj7',desc:'明亮、帶有漂浮感；第 4 音升高半音（♯4）是主要特色。',formula:'1 · 2 · 3 · ♯4 · 5 · 6 · 7',degrees:'C · E · G · B'},
 {name:'Ionian',notes:[0,2,4,5,7,9,11],scale:['C','D','E','F','G','A','B'],chord:'Cmaj7',desc:'自然大調的標準音階，是比較其他調式的明亮基準。',formula:'1 · 2 · 3 · 4 · 5 · 6 · 7',degrees:'C · E · G · B'},
 {name:'Mixolydian',notes:[0,2,4,5,7,9,10],scale:['C','D','E','F','G','A','B♭'],chord:'C7',desc:'大調骨架搭配降低的第 7 音（♭7），常見於 Funk、Blues、Rock。',formula:'1 · 2 · 3 · 4 · 5 · 6 · ♭7',degrees:'C · E · G · B♭'},
 {name:'Dorian',notes:[0,2,3,5,7,9,10],scale:['C','D','E♭','F','G','A','B♭'],chord:'Cm7',desc:'小調色彩保留自然第 6 音（6），比自然小調更明亮。',formula:'1 · 2 · ♭3 · 4 · 5 · 6 · ♭7',degrees:'C · E♭ · G · B♭'},
 {name:'Aeolian',notes:[0,2,3,5,7,8,10],scale:['C','D','E♭','F','G','A♭','B♭'],chord:'Cm7',desc:'自然小調的典型色彩，第 6 與第 7 音都降低。',formula:'1 · 2 · ♭3 · 4 · 5 · ♭6 · ♭7',degrees:'C · E♭ · G · B♭'},
 {name:'Phrygian',notes:[0,1,3,5,7,8,10],scale:['C','D♭','E♭','F','G','A♭','B♭'],chord:'Cm7',desc:'強烈的降低第 2 音（♭2）帶來特殊張力。',formula:'1 · ♭2 · ♭3 · 4 · 5 · ♭6 · ♭7',degrees:'C · E♭ · G · B♭'},
 {name:'Locrian',notes:[0,1,3,5,6,8,10],scale:['C','D♭','E♭','F','G♭','A♭','B♭'],chord:'Cm7♭5',desc:'降低第 2 音與第 5 音（♭2、♭5），帶有不穩定、緊張的色彩。',formula:'1 · ♭2 · ♭3 · 4 · ♭5 · ♭6 · ♭7',degrees:'C · E♭ · G♭ · B♭'}
];
const SYNTH={
 '振盪器 OSC':[
 ['OSC A / OSC B','VOICE → OSC 1 / OSC 2','名稱直接對應，先開啟該振盪器'],['SUB','VOICE → 第三振盪器 OSC 3','可用 Sine 並降八度；但不完全等於獨立 SUB 訊號'],['NOISE','VOICE → Sampler','載入 Noise Sample，選擇路由'],['WT POS','OSC 的 Wavetable Frame 位置','若波表不同，數值不能直接複製'],['OCT / SEMI / FIN','OSC 的 Transpose / Tune','以半音與 cents 轉換；例如 -1 Oct = -12 semitones'],['LEVEL / PAN','各 OSC 的 Level / Pan','音量、左右位置'],['UNISON','OSC 的 Voices','例如 7 voices'],['DETUNE','OSC 的 Unison Detune','先聽相似寬度，避免數值照搬'],['BLEND','ADVANCED 中 Unison Blend 相關控制','依 Vital 版本和顯示名稱尋找'],['PHASE / RAND','OSC 的 Phase / Randomization','要看起音穩不穩定，特別是 Bass']
 ],
 'Filter 濾波器':[
 ['FILTER','VOICE → Filter 1 / Filter 2','Vital 可配置兩組濾波器'],['CUTOFF','Filter → Cutoff','兩者頻率概念一致'],['RES','Filter → Resonance','提高共振會改變濾波器強調的頻帶'],['DRIVE','Filter → Drive','依濾波器型態，飽和特色可能不同'],['MIX','Filter → Mix','乾濕比例'],['MG Low 12 / 24','Analog / Ladder 類 Low-pass','尋找相近坡度與聽感，不是完全同一演算法'],['High / Band Pass','High-pass / Band-pass','選擇相近類型'],['FILTER 路由 A/B/S/N','各 OSC / Sampler 的 Routing 選單','確認是否送 Filter 1/2、Effects 或 Direct Out']
 ],
 'ENV / LFO':[
 ['ENV 1 / 2 / 3','VOICE 右側 → ENV 1 / 2 / 3','ADSR 數值可作起點，但曲線不一定相同'],['ATTACK','ENV → Attack','決定起音快慢'],['HOLD','ENV → Hold','維持峰值的時間'],['DECAY','ENV → Decay','從峰值下降到 Sustain'],['SUSTAIN','ENV → Sustain','按鍵持續按下時的維持量'],['RELEASE','ENV → Release','放開按鍵後消失的速度'],['LFO 1 / 2 / 3','VOICE 右側 → LFO 1 / 2 / 3','拖曳到欲調變的參數'],['LFO RATE / BPM SYNC','LFO 的 Tempo / Frequency','例如 1/4、1/8'],['TRIG / ENV','LFO Mode → Trigger / Envelope','一個會循環、一個可能單次，依原影片確認'],['LFO → CUTOFF','LFO 拖到 Filter Cutoff','再調整調變量，觀察環形指示']
 ],
 'FX 效果器':[
 ['Reverb','EFFECTS → Reverb','延遲與殘響尾巴需調耳朵'],['Delay','EFFECTS → Delay','注意拍速同步'],['Chorus','EFFECTS → Chorus','增加厚度／寬度'],['Distortion','EFFECTS → Distortion','依失真類型會有很大聲音差別'],['Compressor / Multiband','EFFECTS → Compressor / Multiband','OTT 類處理需仔細控制增益'],['EQ','EFFECTS → Equalizer','修整頻段'],['Flanger / Phaser','EFFECTS → Flanger / Phaser','具週期性的相位／梳狀濾波效果'],['Filter FX','EFFECTS → Filter','效果器位置的濾波器，與 VOICE 的濾波路由不同'],['Hyper / Dimension','Chorus / Delay 等組合近似','沒有保證一對一對應']
 ],
 '進階與演奏':[
 ['MATRIX','MATRIX → 調變來源、目標、深度','調變深度數值不一定相同'],['MACRO 1–4','VOICE → Macro 1–4','適合控制 Brightness、Space 等多個參數'],['MONO','VOICE → Voices = 1','演奏方式可能還需搭配 Legato'],['LEGATO','VOICE → Legato','重疊彈奏時不重觸發的行為'],['PORTA / GLIDE','VOICE → Glide / Slope','滑音時間與曲線'],['MASTER','Master Level','避免比較時音量差造成誤判'],['Pitch Bend Range','VOICE 底部 Bend','注意上下行範圍'],['GLOBAL','ADVANCED 和 VOICE 底部','某些設定分散在不同頁面']
 ]
};

const SYNTH_META={
 '振盪器 OSC':{symbol:'◉',color:'osc',serum:'Serum · OSC A/B / SUB / NOISE',vital:'Vital · VOICE / OSC 1–3 / Sampler'},
 'Filter 濾波器':{symbol:'▽',color:'filter',serum:'Serum · OSC 頁 / FILTER',vital:'Vital · VOICE / Filter 1–2'},
 'ENV / LFO':{symbol:'∿',color:'mod',serum:'Serum · OSC 頁下方 ENV / LFO',vital:'Vital · VOICE 右側 ENV / LFO'},
 'FX 效果器':{symbol:'✦',color:'fx',serum:'Serum · FX 分頁',vital:'Vital · EFFECTS 分頁'},
 '進階與演奏':{symbol:'◎',color:'adv',serum:'Serum · MATRIX / GLOBAL / 演奏設定',vital:'Vital · MATRIX / ADVANCED / VOICE 底部'}
};
const SERUM_MAP_BLOCKS=[
 {area:'osc',group:'振盪器 OSC',label:'OSC A / B · SUB / NOISE',where:'OSC 頁 · 上方',detail:'波形、WT POS、Unison、Detune'},
 {area:'filter',group:'Filter 濾波器',label:'FILTER',where:'OSC 頁 · 右側',detail:'Cutoff、Resonance、Drive'},
 {area:'mod',group:'ENV / LFO',label:'ENV / LFO',where:'OSC 頁 · 下方',detail:'包絡、LFO、調變拖曳'},
 {area:'fx',group:'FX 效果器',label:'FX',where:'上方獨立分頁',detail:'Reverb、Delay、Distortion'},
 {area:'adv',group:'進階與演奏',label:'MATRIX / GLOBAL',where:'上方分頁',detail:'Macro、調變路由、演奏設定'}
];
const VITAL_MAP_BLOCKS=[
 {area:'osc',group:'振盪器 OSC',label:'OSC 1 / 2 / 3 · Sampler',where:'VOICE · 左上',detail:'Wavetable、Frame、Voices、Detune'},
 {area:'filter',group:'Filter 濾波器',label:'Filter 1 / Filter 2',where:'VOICE · 左下',detail:'Cutoff、Resonance、Mix'},
 {area:'mod',group:'ENV / LFO',label:'ENV / LFO',where:'VOICE · 右側',detail:'ADSR、LFO、Tempo、調變'},
 {area:'fx',group:'FX 效果器',label:'EFFECTS',where:'上方分頁',detail:'Delay、Reverb、Compressor、EQ'},
 {area:'adv',group:'進階與演奏',label:'ADVANCED / MATRIX',where:'上方及演奏區',detail:'Glide、Legato、Macro、路由'}
];
const RECIPES=[
 {title:'K-pop Supersaw Lead',tag:'K-pop · Synth Lead',desc:'亮、寬、適合 Hook 或副歌的大型合成器音色。',steps:['OSC 1 選 Saw；先單聲道確認音高','Unison 5–7 Voices，少量 Detune','設短 Attack，Sustain 偏高，Release 中短','Filter Low-pass 稍降 Cutoff，再用 ENV 控制明亮度','最後加 Chorus、少量 Reverb，對照原曲調整']},
 {title:'Funk Pluck Bass',tag:'Funk · Bass',desc:'短促、有彈性、與 Kick 交錯的音色。',steps:['OSC 1 選 Saw 或 Square；必要時加 Sine 作低頻','ENV 1：快速 Attack、短 Decay、較低 Sustain','Filter Low-pass，ENV 2 調變 Cutoff 形成 Pluck','依需要開 Mono / Glide，保持低頻起音穩定','先不加大 Reverb；讓 Bass 與 Drum 對齊 Groove']},
 {title:'Warm Keys / Pad',tag:'Acid Jazz · Warm',desc:'溫暖且柔和的合成鍵盤音色；不等同真實 Rhodes 取樣。',steps:['OSC 1 用較柔和波形，例如 Sine + 少量其他諧波','設略慢 Attack、適度 Release','低通濾波削弱刺耳高頻，調整 Velocity','加少量 Chorus 和短 Reverb，保留主體清晰','要更像真實 Rhodes，考慮使用專用電鋼琴插件']}
];
const GROOVES=[
 {name:'Funk',tag:'切分 · Pocket',desc:'重視 Bass、Kick、Snare、吉他或 Keys 的對話；空隙和休止能讓切分更有力量。',task:'練習：固定 Drum，在第 3 拍附近將 Bass 提前半拍，聽重音怎麼改變。'},
 {name:'Acid Jazz',tag:'Funk × Jazz × Soul',desc:'常把 Funk 的律動結合 Jazz 的和聲與電鋼琴質感；不只取決於使用哪一件樂器。',task:'練習：同一 Groove 加入 Rhodes 7th / 9th 和弦，比較明暗和流動感。'},
 {name:'UK Garage',tag:'2-step · Swing',desc:'常見 2-step 鼓組、Shuffle / Swing 和切分的電子 Bass；重點在鼓組排列與擺動感。',task:'練習：保留 Bass，改成 2-step Kick / Snare 與 Swing Hi-hat，做 A/B 對比。'}
];
const MIX=[
 ['Volume & Gain Staging','先用音量平衡建立層次，避免音軌或總輸出削波；不要把某個 dB 值當成通用標準。'],
 ['Pan 與 Stereo','主旋律與低頻通常優先維持中心穩定，其他層次依編曲需要展開；檢查 Mono 相容性。'],
 ['EQ','先聽是否有頻段互相遮蔽，再做削減或塑形；不要每軌都套固定切頻。'],
 ['Sidechain','以 Kick 控制 Bass 是常見技巧，調整 Threshold、Attack、Release 讓節奏清楚、不過度抽吸。'],
 ['Reverb / Delay','使用 Pre-delay、Decay 和 Mix 控制前後距離；太多空間效果容易讓節奏模糊。'],
 ['Automation','利用音量、Filter、Reverb Send 等自動化，讓過門、尾音和段落更自然。']
];

// Every step is [semitones above selected tonic, chord quality, roman numeral].
// All four-beat chords are examples, not transcriptions of named copyrighted works.
const PROGRESSION_PRESETS=[
 {id:'pop-1564',name:'萬用流行｜1–5–6–4',genre:'Pop / K-pop',tonality:'major',desc:'穩定、明亮又帶一點情緒；常見於流行歌主歌與副歌。',steps:[[0,'maj','I'],[7,'maj','V'],[9,'min','vi'],[5,'maj','IV']]},
 {id:'jpop-oudou',name:'王道進行｜4–5–3–6',genre:'J-pop / Anime / K-pop',tonality:'major',desc:'J-pop 經典 4536：IV → V → iii → vi。C 大調是 F → G → Em → Am，先明亮再帶出淡淡感傷。可與原有 City Pop 的七和弦版本比較。',steps:[[5,'maj','IV'],[7,'maj','V'],[4,'min','iii'],[9,'min','vi']]},
 {id:'marusa-full',name:'丸サ進行｜完整版',genre:'J-pop / Acid Jazz / Soul',tonality:'major',desc:'IVmaj7 → III7 → vi7 → v7 → I7。C 大調：Fmaj7 → E7 → Am7 → Gm7 → C7。最後 Gm7、C7 各半小節，構成回到 Fmaj7 的 ii–V。',steps:[[5,'maj7','IVmaj7'],[4,'7','III7'],[9,'m7','vi7'],[7,'m7','v7',2],[0,'7','I7',2]]},
 {id:'marusa-short',name:'丸サ進行｜四和弦版',genre:'J-pop / Soul / City Pop',tonality:'major',desc:'精簡版 IVmaj7 → III7 → vi7 → I7。C 大調：Fmaj7 → E7 → Am7 → C7。E7 是通往 Am 的次屬和弦，C7 則把和聲帶回 Fmaj7。',steps:[[5,'maj7','IVmaj7'],[4,'7','III7'],[9,'m7','vi7'],[0,'7','I7']]},
 {id:'pop-6415',name:'抒情流行｜6–4–1–5',genre:'Ballad / Pop',tonality:'major',desc:'先從相對小調開始，情緒較內斂，再回到大調的穩定感。',steps:[[9,'min','vi'],[5,'maj','IV'],[0,'maj','I'],[7,'maj','V']]},
 {id:'oldies-1645',name:'經典老歌｜1–6–4–5',genre:'Oldies / Doo-wop',tonality:'major',desc:'1950 年代流行歌常見的四和弦循環，和聲感清楚、容易記憶。',steps:[[0,'maj','I'],[9,'min','vi'],[5,'maj','IV'],[7,'maj','V']]},
 {id:'canon-1563',name:'卡農式循環｜1–5–6–3–4–1–4–5',genre:'Classical / Pop',tonality:'major',desc:'類似卡農常用的低音級數運動，適合鋼琴與弦樂練習。',steps:[[0,'maj','I'],[7,'maj','V'],[9,'min','vi'],[4,'min','iii'],[5,'maj','IV'],[0,'maj','I'],[5,'maj','IV'],[7,'maj','V']]},
 {id:'jazz-251',name:'Jazz 基礎｜2–5–1',genre:'Jazz',tonality:'major',desc:'經典的下行五度和聲功能連接：預備、屬功能、解決。',steps:[[2,'m7','ii7'],[7,'7','V7'],[0,'maj7','Imaj7']]},
 {id:'jazz-1625',name:'Jazz Turnaround｜1–6–2–5',genre:'Jazz / Soul',tonality:'major',desc:'Imaj7 → VI7 → ii7 → V7。VI7 是次屬和弦，讓和聲有更強的推進感。',steps:[[0,'maj7','Imaj7'],[9,'7','VI7'],[2,'m7','ii7'],[7,'7','V7']]},
 {id:'neosoul-4536',name:'City Pop／Neo Soul｜4–5–3–6',genre:'City Pop / R&B',tonality:'major',desc:'七和弦的溫暖與流動感；適合 Rhodes、電鋼琴和柔和 Pad。',steps:[[5,'maj7','IVmaj7'],[7,'7','V7'],[4,'m7','iii7'],[9,'m7','vi7']]},
 {id:'ballad-134m',name:'借用小四級｜1–3–4–小4',genre:'Ballad / OST',tonality:'major',desc:'最後的 iv 借用平行小調，產生細膩、懷舊的轉折。',steps:[[0,'maj','I'],[4,'min','iii'],[5,'maj','IV'],[5,'min','iv']]},
 {id:'funk-dominant',name:'Funk Vamp｜1⁷–4⁷',genre:'Funk / Blues',tonality:'major',desc:'兩個屬七和弦循環。可搭配切分 Bass、節奏吉他與 Clavinet 風格音色。',steps:[[0,'7','I7'],[5,'7','IV7']]},
 {id:'minor-pop',name:'小調流行｜i–♭VI–♭III–♭VII',genre:'Minor / Cinematic',tonality:'minor',desc:'暗色系流行、影視配樂常見的自然小調級數組合。',steps:[[0,'min','i'],[8,'maj','♭VI'],[3,'maj','♭III'],[10,'maj','♭VII']]},
 {id:'minor-251',name:'小調 Jazz｜iiø–V7–i',genre:'Jazz / Minor',tonality:'minor',desc:'半減七和弦 → 屬七和弦 → 小和弦，適合比較大小調的解決方式。',steps:[[2,'m7b5','iiø7'],[7,'7','V7'],[0,'min','i']]},
 {id:'blues-12',name:'12 小節 Blues',genre:'Blues / Funk',tonality:'major',desc:'I7、IV7、V7 的 12 小節輪替，可加 Swing、Shuffle 或 Funk Groove。',steps:[[0,'7','I7'],[0,'7','I7'],[0,'7','I7'],[0,'7','I7'],[5,'7','IV7'],[5,'7','IV7'],[0,'7','I7'],[0,'7','I7'],[7,'7','V7'],[5,'7','IV7'],[0,'7','I7'],[7,'7','V7']]}
];
const PROGRESSION_INSTRUMENTS=[
 {id:'piano',name:'鋼琴 Piano',tip:'清楚的起音與自然衰減，適合先聽出和聲方向。',attack:.006,decay:.7,sustain:.19,release:.22,partials:[[1,'triangle',1],[2,'sine',.20],[3,'sine',.07]],level:.045},
 {id:'rhodes',name:'電鋼琴 Rhodes 風格',tip:'柔和鈴響與略帶金屬感的電鋼琴風格；為合成模擬，非 Rhodes 取樣。',attack:.006,decay:.9,sustain:.36,release:.28,partials:[[1,'sine',1],[2,'sine',.25],[4,'sine',.10]],level:.048},
 {id:'guitar',name:'木吉他 Acoustic 風格',tip:'快速衰減的撥弦模擬；並非真實六弦吉他錄音。',attack:.003,decay:.33,sustain:.09,release:.20,partials:[[1,'triangle',1],[2,'sine',.18],[3,'sine',.07]],level:.043},
 {id:'clean',name:'Clean Guitar 風格',tip:'較柔的撥弦起音；適合比較 Funk 或 Neo Soul 的和弦。',attack:.008,decay:.52,sustain:.17,release:.18,partials:[[1,'sine',1],[2,'triangle',.14],[3,'sine',.06]],level:.049},
 {id:'organ',name:'風琴 Organ',tip:'持續、和聲飽滿的風琴合成聲響。',attack:.019,decay:.06,sustain:.92,release:.16,partials:[[1,'sine',1],[2,'sine',.34],[3,'sine',.16]],level:.038},
 {id:'strings',name:'弦樂 Strings',tip:'較慢起音、連續的弦樂合成聲響；並非真實弦樂團取樣。',attack:.19,decay:.24,sustain:.75,release:.58,partials:[[1,'sawtooth',.75],[1.005,'sawtooth',.28]],level:.024,lowpass:1750},
 {id:'pad',name:'合成器 Synth Pad',tip:'柔和、延展的合成器氛圍音色。',attack:.25,decay:.30,sustain:.75,release:.65,partials:[[1,'sawtooth',.62],[1.008,'sawtooth',.34]],level:.027,lowpass:1250},
 {id:'pluck',name:'Pluck Synth',tip:'明亮、短促的電子撥弦音色，適合節奏感強的和弦。',attack:.004,decay:.24,sustain:.08,release:.14,partials:[[1,'triangle',.9],[2,'sine',.26],[3,'sine',.12]],level:.053}
];

const RESOURCES=[
 ['Vital 官方網站','免費與付費方案、安裝及插件資訊','https://vital.audio/'],
 ['Vital 官方說明','Vital 操作與功能文件入口','https://vital.audio/'],
 ['Xfer Records / Serum','Serum 官方資訊，確認版本與介面差異','https://xferrecords.com/products/serum'],
 ['YouTube：Vital K-pop Sound Design','搜尋 K-pop 歌曲音色還原教學','https://www.youtube.com/results?search_query=Vital+Kpop+sound+design+tutorial'],
 ['YouTube：Serum K-pop Remake','用 Serum 歌曲教學練習改成 Vital','https://www.youtube.com/results?search_query=Serum+Kpop+sound+design+remake'],
 ['YouTube：Jazen Sounds Vital','偏向「每次做一種聲音」的合成器教學','https://www.youtube.com/results?search_query=Jazen+Sounds+Vital+sound+design'],
 ['Studio One / Fender Studio Pro','DAW 官方產品與學習入口','https://www.presonus.com/']
];