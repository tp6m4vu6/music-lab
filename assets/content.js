const CATEGORIES=['樂理與調式','合成器教學','節奏與曲風','編曲與歌曲分析','混音與音色','插件與資源','其他'];
const routeCategories={theory:'樂理與調式',synth:'合成器教學',groove:'節奏與曲風',arrangement:'編曲與歌曲分析',mix:'混音與音色',resources:'插件與資源'};
const modules=[['theory','♬','樂理與調式','調式亮暗、和弦、次屬與 Voice Leading'],['synth','▥','合成器教學','Serum → Vital 對照、音色配方與調變'],['groove','◉','節奏與曲風','Funk、Acid Jazz、UK Garage 與切分'],['arrangement','▦','編曲與歌曲分析','歌曲結構、K-pop 音色拆解、Loop'],['mix','≋','混音與音色','EQ、音量、Pan、Reverb、Sidechain'],['resources','↗','插件與資源','免費工具、教學、Preset 與收藏'],['articles','▤','主題教材','GitHub 內容管理：K-pop、樂理與合成器教學']];
const MODES=[
 {name:'Lydian',notes:[0,2,4,6,7,9,11],scale:['C','D','E','F♯','G','A','B'],chord:'Cmaj7',desc:'明亮、漂浮；與 Ionian 相比，升高第 4 音 F → F♯。',formula:'1 · 2 · 3 · ♯4 · 5 · 6 · 7',degrees:'C · E · G · B'},
 {name:'Ionian',notes:[0,2,4,5,7,9,11],scale:['C','D','E','F','G','A','B'],chord:'Cmaj7',desc:'大調基準；清楚、明亮，適合當作其他調式的比較基準。',formula:'1 · 2 · 3 · 4 · 5 · 6 · 7',degrees:'C · E · G · B'},
 {name:'Mixolydian',notes:[0,2,4,5,7,9,10],scale:['C','D','E','F','G','A','B♭'],chord:'C7',desc:'大調骨架但有 ♭7；常可聽到 Blues、Funk、Rock 色彩。',formula:'1 · 2 · 3 · 4 · 5 · 6 · ♭7',degrees:'C · E · G · B♭'},
 {name:'Dorian',notes:[0,2,3,5,7,9,10],scale:['C','D','E♭','F','G','A','B♭'],chord:'Cm7',desc:'小調基底保留 E♭，第 6 音是 A；對照 Aeolian 的 A♭ → A。',formula:'1 · 2 · ♭3 · 4 · 5 · 6 · ♭7',degrees:'C · E♭ · G · B♭'},
 {name:'Aeolian',notes:[0,2,3,5,7,8,10],scale:['C','D','E♭','F','G','A♭','B♭'],chord:'Cm7',desc:'自然小調基準；與 Dorian 比，第 6 音降低為 A♭。',formula:'1 · 2 · ♭3 · 4 · 5 · ♭6 · ♭7',degrees:'C · E♭ · G · B♭'},
 {name:'Phrygian',notes:[0,1,3,5,7,8,10],scale:['C','D♭','E♭','F','G','A♭','B♭'],chord:'Cm7',desc:'強烈的 ♭2 是重要特色；與 Aeolian 比 D → D♭。',formula:'1 · ♭2 · ♭3 · 4 · 5 · ♭6 · ♭7',degrees:'C · E♭ · G · B♭'},
 {name:'Locrian',notes:[0,1,3,5,6,8,10],scale:['C','D♭','E♭','F','G♭','A♭','B♭'],chord:'Cm7♭5',desc:'根音上方是減五度 G♭，穩定感較低；不是常見流行樂主調。',formula:'1 · ♭2 · ♭3 · 4 · ♭5 · ♭6 · ♭7',degrees:'C · E♭ · G♭ · B♭'}
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
const RESOURCES=[
 ['Vital 官方網站','免費與付費方案、安裝及插件資訊','https://vital.audio/'],
 ['Vital 官方說明','Vital 操作與功能文件入口','https://vital.audio/'],
 ['Xfer Records / Serum','Serum 官方資訊，確認版本與介面差異','https://xferrecords.com/products/serum'],
 ['YouTube：Vital K-pop Sound Design','搜尋 K-pop 歌曲音色還原教學','https://www.youtube.com/results?search_query=Vital+Kpop+sound+design+tutorial'],
 ['YouTube：Serum K-pop Remake','用 Serum 歌曲教學練習改成 Vital','https://www.youtube.com/results?search_query=Serum+Kpop+sound+design+remake'],
 ['YouTube：Jazen Sounds Vital','偏向「每次做一種聲音」的合成器教學','https://www.youtube.com/results?search_query=Jazen+Sounds+Vital+sound+design'],
 ['Studio One / Fender Studio Pro','DAW 官方產品與學習入口','https://www.presonus.com/']
];