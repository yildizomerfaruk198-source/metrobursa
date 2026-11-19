import { D } from "./mapdata.js";
import { UI_ASSETS, HQI, IMG, UIC } from "./assets.js";

const L0=29.06,A0=40.19,KX=Math.cos(A0*Math.PI/180),COST=16,KM=4.5,DAYSEC=24,NETPAX=78e-6,COL=["#2a9d8f","#f4a261","#8e44ad","#2ecc71","#e76f51","#c9a227"],
CFG={B1:{type:"metro",price:230,pax:38000,base:1.5,cap:62000,wag:24,hw:7,color:"#e63946"},B2:{type:"metro",price:285,pax:52000,base:2.0,cap:72000,wag:36,hw:6,color:"#1d6fd1"},T1:{type:"tram",unlockTram:true,ring:true,oneWay:true,price:85,pax:22000,base:0.9,cap:26000,wag:3,hw:8,color:"#ea580c"},T2:{type:"tram",unlockTram:true,ring:false,oneWay:false,price:125,pax:28000,base:1.15,cap:34000,wag:4,hw:7,color:"#0d9488"}};
const isPre=k=>!!CFG[k],isBlUnlocked=id=>!CFG[id]?.unlockTram||tramUnlocked;
let g;const cv=document.getElementById("c"),g0=cv.getContext("2d"),wrap=document.getElementById("wrap"),cs=getComputedStyle(document.documentElement);
const THEME_KEYS=["--bg","--land","--dist","--dline","--water","--road0","--road1","--road2","--ink","--mut","--card","--bd"],THEME={};
const DARK_MQ=matchMedia("(prefers-color-scheme:dark)");let DARK_NOW=false;
function refreshTheme(){const ds=document.documentElement.dataset.theme;DARK_NOW=ds==="dark"||(ds!=="light"&&DARK_MQ.matches);for(const k of THEME_KEYS)THEME[k]=cs.getPropertyValue(k).trim()}
const V=n=>THEME[n]||cs.getPropertyValue(n).trim();
let W=0,H=0,dpr=1,cvRect=null,view={x:0,y:0,s:1},dirty=true,budget=550,st=[],lines=[],cur=null,sel=null,buildSt=false,moveSt=null,bendDrag=null,uid=1,lid=1,day=1,acc=0,spd=1,started=false,owned={},lastPax=0,lastNet=0,T=0,dem=false,evs=[],crisis=null,cdn=12,nextEv=5,tt=0;
let paused=false,RT=0,fx=[],fxText=[],schem=false,led={},hist=[],opp=[],tips=[],actv=[],base={},poiLoad={},ST_ANAL=new Map(),corp="Bursaray",dep={yerli:8,cin:0,alman:0,kore:0,tyerli:0,tcin:0,talman:0,tkore:0},dly={bilet:0,ticari:0,bakim:0,filo:0,personel:0,ray:0,bosta:0,tesvik:0};
let sat=74,lowSatDays=0,ct=null,ctOffers=[],ctCd=4,ctWon=0,follow=null,TRAIN_HITS=[],sfxMuted=false,ambMuted=false,stConCnt=0,tariff="std",demMode="pop",histP=[],histS=[];
let gameMode="career",diff="easy",activeSlotId=null,guideStep=0,guideDone=false,reportsShown=[],autoRenew=false,activeScn=null,councilCd=20,councilChoice=null,councilUsed=[],listFilter="all",listSort="def",camAnim=null;
try{
 const legM=localStorage.getItem("bursametro.mute")==="1";
 const sm0=localStorage.getItem("bursametro.sfxMute"),am0=localStorage.getItem("bursametro.ambMute");
 sfxMuted=sm0!==null?sm0==="1":legM;
 ambMuted=am0!==null?am0==="1":legM;
}catch(e){}
const L_COLS=["#e63946","#1d6fd1","#2a9d8f","#f4a261","#8e44ad","#2ecc71","#e76f51","#0ea5e9","#db2777","#c9a227"];
const SFX=(()=>{
 let ctx=null,mg=null,comp=null,sfxG=null,ambG=null;
 const AC2=typeof window!=="undefined"?(window.AudioContext||window.webkitAudioContext):null;
 const ensure=(allowWhenMuted=false)=>{
  if(!AC2||(!allowWhenMuted&&sfxMuted&&ambMuted))return null;
  try{
   if(!ctx){
    ctx=new AC2();comp=ctx.createDynamicsCompressor();mg=ctx.createGain();mg.gain.value=.36;
    sfxG=ctx.createGain();sfxG.gain.value=sfxMuted?0:1;
    ambG=ctx.createGain();ambG.gain.value=ambMuted?0:1;
    sfxG.connect(comp);ambG.connect(comp);comp.connect(mg);mg.connect(ctx.destination);
   }
   if(ctx.state==="suspended")ctx.resume();
   return ctx;
  }catch(e){return null}
 };
 const syncG=()=>{if(!ctx)return;const t=ctx.currentTime;if(sfxG)sfxG.gain.setTargetAtTime(sfxMuted?0:1,t,.04);if(ambG)ambG.gain.setTargetAtTime(ambMuted?0:1,t,.08)};
 const init=()=>ensure(false);
 const tn=(f,d=.09,t="sine",g=.14,dl=0,f2=null,lp=0)=>{if(sfxMuted)return;const c=ensure();if(!c||!sfxG)return;try{const t0=c.currentTime+dl,o=c.createOscillator(),gn=c.createGain();o.type=t;o.frequency.setValueAtTime(Math.max(40,f),t0);if(f2)o.frequency.exponentialRampToValueAtTime(Math.max(40,f2),t0+d);gn.gain.setValueAtTime(.0001,t0);gn.gain.linearRampToValueAtTime(g,t0+Math.min(.012,d*.25));gn.gain.exponentialRampToValueAtTime(.0001,t0+d);if(lp>0){const flt=c.createBiquadFilter();flt.type="lowpass";flt.frequency.setValueAtTime(lp,t0);o.connect(flt);flt.connect(gn)}else o.connect(gn);gn.connect(sfxG);o.start(t0);o.stop(t0+d+.03)}catch(e){}};
 const nse=(d=.06,hp=900,g=.06,dl=0)=>{if(sfxMuted)return;const c=ensure();if(!c||!sfxG)return;try{const sr=c.sampleRate,len=Math.max(64,Math.floor(sr*d)),buf=c.createBuffer(1,len,sr),ch=buf.getChannelData(0);for(let i=0;i<len;i++)ch[i]=(Math.random()*2-1)*(1-i/len);const src=c.createBufferSource(),flt=c.createBiquadFilter(),gn=c.createGain();src.buffer=buf;flt.type="highpass";flt.frequency.value=hp;const t0=c.currentTime+dl;gn.gain.setValueAtTime(g,t0);gn.gain.exponentialRampToValueAtTime(.0001,t0+d);src.connect(flt);flt.connect(gn);gn.connect(sfxG);src.start(t0)}catch(e){}};
 const SCALE=[293.66,329.63,369.99,440,493.88,587.33,659.25,739.99];
 return{
  init,ensure,syncG,
  getCtx:()=>ctx,
  getAmbNode:()=>ambG,
  click:()=>{tn(680,.038,"triangle",.09,0,520);nse(.02,2200,.025)},
  tab:()=>{tn(520,.045,"sine",.08,0,660);tn(780,.055,"sine",.06,.03)},
  open:()=>{tn(392,.07,"sine",.09,0,523);tn(587,.09,"triangle",.07,.04)},
  close:()=>{tn(523,.06,"sine",.08,0,349);nse(.02,1600,.02)},
  toggle:on=>{on?tn(523,.06,"triangle",.09,0,784):tn(620,.06,"triangle",.08,0,415)},
  zoom:inZ=>tn(inZ?540:440,.04,"sine",.06,0,inZ?680:330),
  speed:sp=>{const f=[392,523,659][sp===1?0:sp===2?1:2]||523;tn(f,.06,"triangle",.11,0,f*1.12)},
  step:d=>{tn(d>0?560:420,.045,"triangle",.09,0,d>0?700:340)},
  place:()=>{tn(190,.09,"triangle",.16,0,92);tn(587,.12,"sine",.11,.025,659);nse(.045,700,.06)},
  connect:idx=>{const f=SCALE[(idx||0)%SCALE.length];tn(f,.11,"triangle",.13,0,f*1.04);tn(f*1.5,.13,"sine",.06,.035)},
  undo:()=>{tn(520,.065,"triangle",.11,0,340);tn(360,.08,"sine",.09,.04,250)},
  del:()=>{tn(330,.08,"sawtooth",.07,0,165,900);nse(.07,500,.06,.02)},
  launch:()=>{[392,493.88,587.33,783.99].forEach((f,i)=>tn(f,i===3?.28:.12,i===3?"triangle":"sine",.14,i*.07));nse(.08,1400,.04,.2)},
  coin:()=>{tn(880,.08,"sine",.11,0,987);tn(1174.66,.12,"triangle",.11,.06);tn(1567.98,.18,"sine",.08,.11)},
  up:()=>{tn(310,.06,"sawtooth",.07,0,440,1200);tn(587,.1,"triangle",.11,.05,880);nse(.05,1500,.04,.02)},
  train:add=>{if(add){tn(240,.07,"square",.06,0,320,850);tn(480,.08,"triangle",.1,.04)}else{tn(440,.07,"triangle",.09,0,300)}},
  err:()=>{tn(195,.1,"sawtooth",.09,0,150,700);tn(155,.12,"sawtooth",.08,.07,130,650)},
  day:net=>{tn(net>=0?440:311,.05,"sine",.045,0,net>=0?494:294)},
  ev:good=>{if(good){tn(523,.09,"sine",.1);tn(659,.11,"sine",.1,.07);tn(784,.16,"triangle",.09,.14)}else{tn(392,.11,"triangle",.1);tn(311,.16,"sine",.1,.09)}},
  crisis:()=>{[0,.16].forEach(d=>{tn(587,.12,"sawtooth",.11,d,440,1500);tn(440,.13,"sawtooth",.1,d+.07,330,1400)})},
  fixed:()=>{tn(392,.09,"triangle",.11);tn(523,.11,"sine",.12,.07);tn(659,.18,"sine",.11,.15)},
  ach:()=>{[523.25,659.25,783.99,1046.5].forEach((f,i)=>tn(f,i===3?.34:.11,"triangle",.13,i*.08))},
  ctNew:()=>{tn(493.88,.08,"sine",.1);tn(659.25,.12,"triangle",.1,.07)},
  ctWin:()=>{[587.33,739.99,880,1174.66].forEach((f,i)=>tn(f,i===3?.32:.11,"triangle",.14,i*.07));nse(.06,1800,.03,.15)},
  ctFail:()=>{tn(349,.12,"triangle",.11,0,294);tn(261,.2,"sine",.11,.11,220)},
  warn:()=>{tn(293,.15,"sawtooth",.08,0,261,950);tn(220,.22,"triangle",.1,.13)},
  over:()=>{[330,293.66,246.94,196].forEach((f,i)=>tn(f,.22,"triangle",.13,i*.15,f*.95))},
  lock:()=>{tn(240,.05,"triangle",.09,0,180);tn(180,.07,"triangle",.08,.045,140)},
  unlock:()=>{[440,554.37,659.25,880].forEach((f,i)=>tn(f,i===3?.34:.11,i===3?"triangle":"sine",.13,i*.08));nse(.07,1800,.035,.18)},
  tram:()=>{tn(1174.66,.11,"sine",.13);tn(2349.3,.09,"sine",.05);tn(1174.66,.15,"sine",.12,.14);tn(2349.3,.12,"sine",.045,.14)}
 };
})();
const AMB=(()=>{
 const CHORDS=[
  [146.83,185.00,220.00,277.18],
  [123.47,146.83,185.00,220.00],
  [196.00,246.94,293.66,369.99],
  [110.00,164.81,220.00,277.18]
 ];
 const NOTES=[587.33,659.25,739.99,880.00,554.37,493.88,440.00];
 let nextChord=0,chordIdx=0,nextNote=0,nextChime=0,nextRail=0,noiseBuf=null;
 const getNoise=c=>{if(noiseBuf&&noiseBuf.sampleRate===c.sampleRate)return noiseBuf;const sr=c.sampleRate,len=Math.floor(sr*.09),b=c.createBuffer(1,len,sr),ch=b.getChannelData(0);for(let i=0;i<len;i++)ch[i]=(Math.random()*2-1)*Math.exp(-i/(len*.28));return noiseBuf=b};
 const playPad=(c,dest,freqs,dur)=>{
  const t0=c.currentTime+.02,flt=c.createBiquadFilter();flt.type="lowpass";flt.frequency.setValueAtTime(620,t0);
  const mg=c.createGain();mg.gain.setValueAtTime(.0001,t0);mg.gain.linearRampToValueAtTime(.032,t0+.9);mg.gain.setValueAtTime(.026,t0+dur-1.1);mg.gain.exponentialRampToValueAtTime(.0001,t0+dur);
  flt.connect(mg);mg.connect(dest);
  freqs.forEach((f,idx)=>{const o=c.createOscillator();o.type=idx===0?"triangle":"sine";o.frequency.setValueAtTime(f,t0);o.connect(flt);o.start(t0);o.stop(t0+dur+.05)});
 };
 const playBell=(c,dest,f,vol=.022,dur=1.6)=>{
  const t0=c.currentTime+.02,o=c.createOscillator(),gn=c.createGain();
  o.type="sine";o.frequency.setValueAtTime(f,t0);
  gn.gain.setValueAtTime(.0001,t0);gn.gain.linearRampToValueAtTime(vol,t0+.04);gn.gain.exponentialRampToValueAtTime(.0001,t0+dur);
  o.connect(gn);gn.connect(dest);o.start(t0);o.stop(t0+dur+.05);
 };
 const playClack=(c,dest,tram)=>{
  const t0=c.currentTime+.01;
  [0,tram?.072:.088].forEach((dl,idx)=>{
   const src=c.createBufferSource(),flt=c.createBiquadFilter(),gn=c.createGain();
   src.buffer=getNoise(c);flt.type="bandpass";flt.frequency.setValueAtTime(idx?(tram?520:420):(tram?390:310),t0+dl);flt.Q.value=2.1;
   gn.gain.setValueAtTime(tram?.055:.072,t0+dl);gn.gain.exponentialRampToValueAtTime(.0001,t0+dl+.055);
   src.connect(flt);flt.connect(gn);gn.connect(dest);src.start(t0+dl);
   const o=c.createOscillator(),og=c.createGain();
   o.type="triangle";o.frequency.setValueAtTime(idx?108:88,t0+dl);o.frequency.exponentialRampToValueAtTime(48,t0+dl+.05);
   og.gain.setValueAtTime(.045,t0+dl);og.gain.exponentialRampToValueAtTime(.0001,t0+dl+.055);
   o.connect(og);og.connect(dest);o.start(t0+dl);o.stop(t0+dl+.06);
  });
 };
 const tick=()=>{
  if(ambMuted||document.hidden||!started||over)return;
  const c=SFX.getCtx(),dest=SFX.getAmbNode();if(!c||!dest||c.state!=="running")return;
  const now=performance.now();
  if(now>=nextChord){playPad(c,dest,CHORDS[chordIdx%CHORDS.length],4.2);chordIdx++;nextChord=now+3900}
  if(!paused&&now>=nextNote){const f=NOTES[(chordIdx*3+Math.floor(Math.random()*NOTES.length))%NOTES.length];playBell(c,dest,f,.018,1.9);nextNote=now+1400+Math.random()*1300}
  if(!paused&&now>=nextChime){playBell(c,dest,659.25,.014,.65);setTimeout(()=>{if(!ambMuted&&started&&!paused)playBell(c,dest,554.37,.012,.9)},190);nextChime=now+18000+Math.random()*9000}
  if(!paused&&follow&&now>=nextRail){
   const fp=getFollowPt();
   if(fp&&!fp.dwell&&fp.speedKmh>8){
    playClack(c,dest,fp.isTram);
    const gap=Math.max(190,Math.min(920,1050/((fp.speedKmh/46)*Math.min(2.2,spd))));
    nextRail=now+gap;
   }else{nextRail=now+240}
  }
 };
 setInterval(tick,110);
 return{resetRail:()=>{nextRail=0}};
})();
addEventListener("pointerdown",()=>SFX.init(),{capture:true,passive:true});
addEventListener("keydown",()=>SFX.init(),{capture:true,passive:true});
const isDark=()=>DARK_NOW;
if(DARK_MQ.addEventListener)DARK_MQ.addEventListener("change",()=>{refreshTheme();invalidateLayers();dirty=true});
refreshTheme();
const mkSvg=(p,sz=17)=>`<svg class="svg-ic" style="width:${sz}px;height:${sz}px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
const IC={
 flame:mkSvg('<path d="M12 2.8c2.6 3.1 5.5 5.6 5.5 10a5.5 5.5 0 1 1-11 0c0-2.5 1.1-4.6 2.5-6.4.4 1.6 1.5 2.4 2.5 2.4.9 0 1.4-2 .5-6Z" fill="#f97316" fill-opacity=".24" stroke="#ea580c"/><path d="M12 18.5a2.6 2.6 0 0 1-2.5-2.7c0-1.4.8-2.4 2-3.4.9 1 1.4 1.7 2.1 1.7.6 0 .9-.4 1-.9.3.7.4 1.6.4 2.5a2.8 2.8 0 0 1-3 2.8Z" fill="#facc15" stroke="none"/>'),
 ff:mkSvg('<polygon points="4,6 12,12 4,18" fill="currentColor" fill-opacity=".2"/><polygon points="12,6 20,12 12,18" fill="currentColor" fill-opacity=".2"/>'),
 pause:mkSvg('<rect x="6" y="5" width="4" height="14" rx="1.2" fill="currentColor" fill-opacity=".2"/><rect x="14" y="5" width="4" height="14" rx="1.2" fill="currentColor" fill-opacity=".2"/>'),
 play:mkSvg('<polygon points="7,5 19,12 7,19" fill="currentColor" fill-opacity=".25"/>'),
 target:mkSvg('<circle cx="12" cy="12" r="8.5" stroke="#e63946"/><circle cx="12" cy="12" r="4.8" stroke="#e63946"/><circle cx="12" cy="12" r="1.8" fill="#e63946" stroke="none"/>'),
 schema:mkSvg('<path d="M4 17h6l4-10h6"/><circle cx="6" cy="17" r="2.2" fill="currentColor"/><circle cx="12" cy="12" r="2.2" fill="currentColor"/><circle cx="18" cy="7" r="2.2" fill="currentColor"/>'),
 map:mkSvg('<polygon points="3,6 9,4 15,6 21,4 21,18 15,20 9,18 3,20" fill="currentColor" fill-opacity=".14"/><line x1="9" y1="4" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="20"/>'),
 sun:mkSvg('<circle cx="12" cy="12" r="4.2" fill="#f59e0b" fill-opacity=".35" stroke="#f59e0b"/><path d="M12 2.5v2.2M12 19.3v2.2M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.9 19.1l1.6-1.6M17.5 6.5l1.6-1.6" stroke="#f59e0b"/>'),
 moon:mkSvg('<path d="M20.2 14.5A8.2 8.2 0 0 1 9.5 3.8a8.5 8.5 0 1 0 10.7 10.7Z" fill="#6366f1" fill-opacity=".25" stroke="#4f46e5"/>'),
 soundOn:mkSvg('<polygon points="5,9 9,9 14,5 14,19 9,15 5,15" fill="currentColor" fill-opacity=".2"/><path d="M17.5 8.8a4.5 4.5 0 0 1 0 6.4M19.8 6.5a7.8 7.8 0 0 1 0 11"/>'),
 soundOff:mkSvg('<polygon points="5,9 9,9 14,5 14,19 9,15 5,15" fill="currentColor" fill-opacity=".15"/><path d="M17 9.5l4 5M21 9.5l-4 5" stroke="#e63946"/>'),
 scroll:mkSvg('<path d="M7 4h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" fill="#f59e0b" fill-opacity=".16"/><path d="M9 9h6M9 13h6M9 17h4"/>')
};
const POI_SVGS={
 hospital:'<svg viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="4" fill="#ef4444" fill-opacity=".14" stroke="#dc2626" stroke-width="2"/><path d="M12 8v8M8 12h8" stroke="#dc2626" stroke-width="2.5"/></svg>',
 terminal:'<svg viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="4" width="14" height="14" rx="3" fill="#0284c7" fill-opacity=".15" stroke="#0369a1" stroke-width="2"/><path d="M5 12h14M8 18v2M16 18v2" stroke="#0369a1" stroke-width="2"/><circle cx="8.5" cy="15" r="1.1" fill="#0369a1"/><circle cx="15.5" cy="15" r="1.1" fill="#0369a1"/></svg>',
 ind:'<svg viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M3 20V11l6 3V11l6 3V8h6v12H3Z" fill="#d97706" fill-opacity=".18" stroke="#b45309" stroke-width="2"/><path d="M17 8V4h3v4" stroke="#b45309" stroke-width="2"/></svg>',
 heykel:'<svg viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11c0-3.5 3.6-6.2 8-6.2s8 2.7 8 6.2H4Z" fill="#7c3aed" fill-opacity=".18" stroke="#6d28d9" stroke-width="2"/><path d="M6 11v7M10 11v7M14 11v7M18 11v7M3 19.5h18" stroke="#6d28d9" stroke-width="2"/></svg>',
 teleferik:'<svg viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7l18-3" stroke="#0d9488" stroke-width="2"/><path d="M12 5.5v4.5" stroke="#0d9488" stroke-width="2"/><rect x="6.5" y="10" width="11" height="9" rx="2.5" fill="#14b8a6" fill-opacity=".18" stroke="#0f766e" stroke-width="2"/><path d="M9.5 13h5" stroke="#0f766e" stroke-width="1.8"/></svg>',
 yht:'<svg viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M7 16V8a5 5 0 0 1 10 0v8a3 3 0 0 1-3 3h-4a3 3 0 0 1-3-3Z" fill="#2563eb" fill-opacity=".16" stroke="#1d4ed8" stroke-width="2"/><path d="M7 12h10M8.5 19l-2 2.5M15.5 19l2 2.5" stroke="#1d4ed8" stroke-width="2"/><circle cx="9.5" cy="15.5" r="1" fill="#1d4ed8"/><circle cx="14.5" cy="15.5" r="1" fill="#1d4ed8"/></svg>'
};
const POI_IMGS={};for(const k in POI_SVGS){const im=new Image();im.src="data:image/svg+xml,"+encodeURIComponent(POI_SVGS[k].replace("<svg ","<svg xmlns='http://www.w3.org/2000/svg' "));im.onload=()=>{dirty=true};POI_IMGS[k]=im}
const poiSvg=(p,sz=18)=>`<span class="pic-ic" style="width:${sz}px;height:${sz}px">${POI_SVGS[p.icKey]||""}</span>`;
const POIS=[
 {id:"hospital",icKey:"hospital",name:"Bursa Şehir Hastanesi",area:"Doğanköy · Kuzeybatı Nilüfer",lo:28.9095,la:40.2640,type:"steady",base:12000},
 {id:"terminal",icKey:"terminal",name:"Bursa Otobüs Terminali",area:"İstanbul Yolu · Alaşarköy–Panayır",lo:29.0558,la:40.2668,type:"steady",base:14000},
 {id:"dosab",icKey:"ind",name:"DOSAB - Demirtaş OSB",area:"Panayır–Demirtaş",lo:29.0775,la:40.2565,type:"ind",base:13000},
 {id:"kayapa",icKey:"ind",name:"Kayapa / Hasanağa OSB",area:"Güneybatı Nilüfer",lo:28.8440,la:40.1765,type:"ind",base:11000},
 {id:"barakfakih",icKey:"ind",name:"Kestel / Barakfakih OSB",area:"Kestel Doğusu",lo:29.2520,la:40.2015,type:"ind",base:10000},
 {id:"heykel",icKey:"heykel",name:"Heykel / Tarihi Çarşı & Ulucami",area:"Osmangazi Merkez",lo:29.0665,la:40.1818,type:"tour",base:14000},
 {id:"teleferik",icKey:"teleferik",name:"Uludağ Teleferik",area:"Teferrüç",lo:29.0795,la:40.1685,type:"tour",base:9500},
 {id:"yht",icKey:"yht",name:"Bursa YHT Garı",area:"Balat / Geçit Kuzeyi",lo:28.943,la:40.276,type:"steady",base:13000}
];
const poiMult=(p,wd)=>p.type==="ind"?(wd>=5?.45:1.25):p.type==="tour"?(wd>=5?1.35:.85):1;
const poiTypeLabel=p=>p.type==="ind"?"Sanayi (Hafta içi yoğun · hafta sonu düşük)":p.type==="tour"?"Turizm & Çarşı (Hafta sonu daha yoğun)":"7 gün düzenli talep";
const segKey=(aId,bId)=>`${aId}>${bId}`;
const cloneWps=wps=>{const o={};if(!wps)return o;for(const k in wps)if(Array.isArray(wps[k])&&wps[k].length)o[k]=wps[k].map(p=>[p[0],p[1]]);return o};
function segPoints(a,b,wps){const arr=[a],list=wps&&wps[segKey(a.id,b.id)];if(list)for(let i=0;i<list.length;i++)arr.push({lo:list[i][0],la:list[i][1]});arr.push(b);return arr}
function segInfoChain(a,b,wps,type,mode){const pts=segPoints(a,b,wps);let dKm=0,riv=false,slope=false,center=false,cost=0;for(let i=1;i<pts.length;i++){const si=segInfo(pts[i-1],pts[i],type,mode);dKm+=si.dKm;if(si.riv)riv=true;if(si.slope)slope=true;if(si.center)center=true;cost+=si.cost}return{dKm,riv,slope,center,cost}}
function lineFullCoords(ids,ring,wps){const out=[],pts=ids.map(S).filter(Boolean);if(!pts.length)return out;out.push(pts[0].lo,pts[0].la);for(let i=1;i<pts.length;i++){const list=wps&&wps[segKey(pts[i-1].id,pts[i].id)];if(list)for(let j=0;j<list.length;j++)out.push(list[j][0],list[j][1]);out.push(pts[i].lo,pts[i].la)}if(ring&&pts.length>=3){const list=wps&&wps[segKey(pts[pts.length-1].id,pts[0].id)];if(list)for(let j=0;j<list.length;j++)out.push(list[j][0],list[j][1]);out.push(pts[0].lo,pts[0].la)}return out}
const lineKm=(ids,ring,wps)=>{if(!ids||ids.length<2)return 0;let L=0;for(let i=1;i<ids.length;i++){const a=S(ids[i-1]),b=S(ids[i]);if(!a||!b)continue;const pts=segPoints(a,b,wps);for(let j=1;j<pts.length;j++)L+=km(pts[j-1],pts[j])}if(ring&&ids.length>=3){const a=S(ids[ids.length-1]),b=S(ids[0]);if(a&&b){const pts=segPoints(a,b,wps);for(let j=1;j<pts.length;j++)L+=km(pts[j-1],pts[j])}}return L};
const RIV_SEGS=[];D.riv.forEach(r=>{for(let i=2;i<r.length;i+=2)RIV_SEGS.push([r[i-2],r[i-1],r[i],r[i+1]])});
const segIntersects=(ax,ay,bx,by,cx,cy,dx,dy)=>{if(Math.max(ax,bx)<Math.min(cx,dx)||Math.max(cx,dx)<Math.min(ax,bx)||Math.max(ay,by)<Math.min(cy,dy)||Math.max(cy,dy)<Math.min(ay,by))return false;const cr=(x1,y1,x2,y2,x3,y3)=>(x2-x1)*(y3-y1)-(y2-y1)*(x3-x1),d1=cr(ax,ay,bx,by,cx,cy),d2=cr(ax,ay,bx,by,dx,dy),d3=cr(cx,cy,dx,dy,ax,ay),d4=cr(cx,cy,dx,dy,bx,by);return((d1>0&&d2<0)||(d1<0&&d2>0))&&((d3>0&&d4<0)||(d3<0&&d4>0))};
const crossesRiver=(a,b)=>RIV_SEGS.some(s=>segIntersects(a.lo,a.la,b.lo,b.la,s[0],s[1],s[2],s[3]));
const DIFFS={
 easy:{id:"easy",name:"Kolay",ic:"🟢",mult:1.00,opMult:1.00,bScale:1.00,startBudget:550,desc:"Rahat ekonomi (1.0x) · Başlangıç ₺550M"},
 normal:{id:"normal",name:"Orta",ic:"🟡",mult:1.28,opMult:1.20,bScale:0.96,startBudget:440,desc:"1.28x inşaat · 1.20x gider · Başlangıç ₺440M"},
 hard:{id:"hard",name:"Zor",ic:"🔴",mult:1.55,opMult:1.38,bScale:0.92,startBudget:350,desc:"1.55x inşaat · 1.38x gider · Başlangıç ₺350M · Zorlu nakit akışı"}
};
const isSandbox=()=>gameMode==="sandbox";
const isScenario=()=>gameMode==="scenario";
const diffMult=()=>isSandbox()||isScenario()?1:(DIFFS[diff]?DIFFS[diff].mult:1);
const opMult=()=>isSandbox()||isScenario()?1:(DIFFS[diff]?DIFFS[diff].opMult:1);
const burPrice=id=>isSandbox()?0:Math.round(CFG[id].price*(DIFFS[diff]?DIFFS[diff].bScale:1));
function burEstNet(id){const c=CFG[id],l=D.bl.find(x=>x.id===id),nSt=l?l.sts.length:20,kmL=l?l.km:20,isT=c.type==="tram",op=isT?((0.012*nSt+c.wag*0.028+0.006*nSt+0.008*(c.wag*2)+0.004*kmL)*opMult()):((0.025*nSt+(c.wag/4)*4*0.02+0.01*nSt+0.008*c.wag+0.01*kmL)*opMult());return Math.max(0.2,Math.round((c.base*2.1-op)*10)/10)}
const SK_SCN="bursametro.scenarios.v1";
const SCENARIOS=[
 {id:"hospital_yht",ic:"🏥",title:"Şehir Hastanesi & YHT Ekspresi",sub:"Kuzeybatı Bursa'yı yüksek hızlı gar ve hastane ile buluştur.",days:30,startBudget:210,unlockTram:false,ownedInit:["B1"],tramInit:0,
  reqs:[
   {id:"hosp",t:"Bursa Şehir Hastanesi'ni bağla",chk:()=>!!(POIS.find(p=>p.id==="hospital")||{}).active},
   {id:"yht",t:"Bursa YHT Garı'nı bağla",chk:()=>!!(POIS.find(p=>p.id==="yht")||{}).active},
   {id:"pax",t:"Günlük 55.000+ yolcu taşı",chk:()=>lastPax>=55000,prog:()=>`${fmt(lastPax)} / 55.000`},
   {id:"sat",t:"Memnuniyet %65+",chk:()=>sat>=65,prog:()=>`%${Math.round(sat)} / %65`}
  ]},
 {id:"tram_city",ic:"🚊",title:"Tramvaylarla Tarihi Merkez",sub:"Tramvay ağıyla Heykel ve Uludağ Teleferik hattını canlandır.",days:40,startBudget:165,unlockTram:true,ownedInit:[],tramInit:4,
  reqs:[
   {id:"trmn",t:"En az 2 Tramvay hattı aç",chk:()=>(lines.filter(l=>l.type==="tram").length+Object.values(owned).filter(o=>o.type==="tram").length)>=2,prog:()=>`${lines.filter(l=>l.type==="tram").length+Object.values(owned).filter(o=>o.type==="tram").length} / 2`},
   {id:"heykel",t:"Heykel / Tarihi Çarşı'yı bağla",chk:()=>!!(POIS.find(p=>p.id==="heykel")||{}).active},
   {id:"tel",t:"Uludağ Teleferik'i bağla",chk:()=>!!(POIS.find(p=>p.id==="teleferik")||{}).active},
   {id:"cov",t:"Kapsama %28+ & kârda ol",chk:()=>cityCov()>=28&&lastNet>0,prog:()=>`%${cityCov().toFixed(1)} / %28`}
  ]},
 {id:"ind_corridor",ic:"🏭",title:"Sanayi Çelik Koridoru",sub:"Üç büyük OSB bölgesini Bursaray ağına entegre edip yüksek kâr yakala.",days:45,startBudget:260,unlockTram:false,ownedInit:["B1","B2"],tramInit:0,
  reqs:[
   {id:"dosab",t:"DOSAB - Demirtaş OSB'yi bağla",chk:()=>!!(POIS.find(p=>p.id==="dosab")||{}).active},
   {id:"kayapa",t:"Kayapa / Hasanağa OSB'yi bağla",chk:()=>!!(POIS.find(p=>p.id==="kayapa")||{}).active},
   {id:"barak",t:"Kestel / Barakfakih OSB'yi bağla",chk:()=>!!(POIS.find(p=>p.id==="barakfakih")||{}).active},
   {id:"net",t:"Günlük Net ₺6.50M+",chk:()=>lastNet>=6.5,prog:()=>`${MM(lastNet)} / ₺6.50M`}
  ]},
 {id:"bursa_metro_master",ic:"🌟",title:"Büyük Bursa Metropolü",sub:"Dört yeni hat kur, şehrin büyük bölümünü kapsa ve günlük ₺10M+ net kâra ulaş.",days:60,startBudget:320,unlockTram:true,ownedInit:["B1"],tramInit:2,
  reqs:[
   {id:"ul4",t:"En az 4 kendi hattını aç",chk:()=>lines.length>=4,prog:()=>`${lines.length} / 4`},
   {id:"cov46",t:"Kapsama %46+",chk:()=>cityCov()>=46,prog:()=>`%${cityCov().toFixed(1)} / %46`},
   {id:"poi5",t:"5+ Çekim Merkezi bağla",chk:()=>POIS.filter(p=>p.active).length>=5,prog:()=>`${POIS.filter(p=>p.active).length} / 5`},
   {id:"net10",t:"Günlük Net ₺10.0M+",chk:()=>lastNet>=10,prog:()=>`${MM(lastNet)} / ₺10.0M`}
  ]}
];
function getScnWins(){try{return JSON.parse(localStorage.getItem(SK_SCN))||{}}catch(e){return{}}}
function saveScnWin(id,d){try{const m=getScnWins(),prev=m[id];m[id]={bestDay:prev?Math.min(prev.bestDay,d):d,at:Date.now()};localStorage.setItem(SK_SCN,JSON.stringify(m))}catch(e){}}
const hasMoney=c=>isSandbox()||budget>=c;
const negMax=()=>isSandbox()?999:(diff==="hard"?20:diff==="normal"?25:30);
const satMax=()=>isSandbox()?999:(diff==="hard"?10:diff==="normal"?12:15);
const upgPrice=u=>Math.round(u.price*diffMult());
const atcPrice=lv=>Math.round(ATC[lv]*diffMult());
const stCostOf=(type,mode)=>Math.round((type==="tram"?6:(mode==="tunnel"?24:16))*diffMult());
function segInfo(a,b,type,mode){const dKm=km(a,b),tp=type==="tram"?"tram":"metro",md=tp==="tram"?"surface":(mode==="tunnel"?"tunnel":"surface"),
 rate=tp==="tram"?2.0:(md==="tunnel"?7.2:4.5),riv=crossesRiver(a,b),slope=(a.la<40.174||b.la<40.174),
 mlo=(a.lo+b.lo)/2,mla=(a.la+b.la)/2,center=md!=="tunnel"&&mlo>29.042&&mlo<29.085&&mla>40.172&&mla<40.198,
 mult=(slope?1.22:1)*(center?1.15:1),rivAdd=riv?(tp==="tram"?3:(md==="tunnel"?4:7)):0;
 return{dKm,riv,slope,center,cost:Math.max(1,Math.round((dKm*rate*mult+rivAdd)*diffMult()))}}
const cityCov=()=>{const tot=D.mah.reduce((a,h)=>a+h.cur,0);return tot?Math.round(D.mah.reduce((a,h)=>a+(h.cov>0?h.cur:0),0)/tot*1000)/10:0};
const HQIMG=(()=>{const i=new Image();i.src=HQI;i.onload=()=>{dirty=true};return i})(),GF='"Lilita One","Baloo 2","Trebuchet MS",system-ui,sans-serif',VT={
 yerli:{cat:"metro",setSize:4,n:"Yerli Üretim",ic:"🇹🇷",p:9,cap:1,up:.018,br:.00045,unlockDay:1,d:"Dengeli ve güvenilir. Yedek parçası yakın, arıza nadir."},
 cin:{cat:"metro",setSize:4,n:"Çin Malı",ic:"🇨🇳",p:5.5,cap:.85,up:.018,br:.0022,unlockDay:1,d:"Ucuz ve bakımı da ucuz; ancak diğerlerine göre biraz daha sık bakım ister."},
 alman:{cat:"metro",setSize:4,n:"Alman Malı",ic:"🇩🇪",p:14.5,cap:1.2,up:.015,br:.0002,unlockDay:45,d:"Pahalı; en yüksek kapasite, en düşük bakım gideri, çok az arıza. 45. günde açılır."},
 kore:{cat:"metro",setSize:4,n:"Güney Kore Malı",ic:"🇰🇷",p:11.5,cap:1.1,up:.016,br:.0007,unlockDay:90,d:"Dengeli seçenek: Yerli'den büyük kapasite, Alman'dan ucuz. 90. günde açılır."},
 tyerli:{cat:"tram",setSize:1,n:"Yerli Tramvay",ic:"🇹🇷",p:12,cap:.42,up:.028,br:.0005,unlockDay:50,d:"Çift yan aynalı kırmızı gövde. Dengeli, düşük bakım, yerli parça. 50. günde açılır."},
 tcin:{cat:"tram",setSize:1,n:"Çin Malı Tramvay",ic:"🇨🇳",p:8,cap:.36,up:.024,br:.0020,unlockDay:50,d:"Yeşil şehir tramvayı. En ekonomik set fiyatı, biraz daha sık bakım ister. 50. günde açılır."},
 talman:{cat:"tram",setSize:1,n:"Alman Malı Tramvay",ic:"🇩🇪",p:17,cap:.50,up:.022,br:.00025,unlockDay:90,d:"Sarı-turkuaz Dresden tarzı tramvay. En yüksek kapasite ve düşük arıza. 90. günde açılır."},
 tkore:{cat:"tram",setSize:1,n:"Güney Kore Tramvayı",ic:"🇰🇷",p:14.5,cap:.46,up:.024,br:.00065,unlockDay:120,d:"Keskin hatlı kırmızı-lacivert Rotem tramvay. Modern ve dayanıklı. 120. günde açılır."}
},HQP={lo:29.00192,la:40.21009},WC=2200,IDLE=.008,$=id=>document.getElementById(id),X=lo=>(lo-L0)*KX,Y=la=>-(la-A0),msg=t=>$("msg").textContent=t,fmt=n=>n.toLocaleString("tr-TR"),MM=n=>"₺"+n.toFixed(2)+"M",rnd=n=>Math.floor(Math.random()*n);
document.querySelector(".logoi").src=UI_ASSETS.logo;
document.querySelectorAll(".pill .hi").forEach((img,i)=>{if(UI_ASSETS.pills[i])img.src=UI_ASSETS.pills[i]});
for(const[id,src]of Object.entries(UI_ASSETS.btns)){const b=$(id);if(b){const i=b.querySelector(".bi");if(i)i.src=src}}
const svgData=s=>"data:image/svg+xml,"+encodeURIComponent(s).replace(/'/g,"%27");
const FALLBACK_SVGS={
 kore:svgData("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 112 64'><rect x='6' y='14' width='100' height='34' rx='12' fill='#16a34a'/><rect x='14' y='20' width='84' height='13' rx='4' fill='#dcfce7'/><circle cx='30' cy='52' r='6' fill='#334155'/><circle cx='82' cy='52' r='6' fill='#334155'/></svg>"),
 tyerli:svgData("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 112 64'><rect x='10' y='16' width='92' height='30' rx='10' fill='#dc2626'/><rect x='16' y='21' width='76' height='12' rx='3' fill='#1e293b'/><path d='M12 20L4 12M96 20l10-8' stroke='#1e293b' stroke-width='3' stroke-linecap='round'/><circle cx='32' cy='50' r='5' fill='#334155'/><circle cx='80' cy='50' r='5' fill='#334155'/></svg>"),
 tcin:svgData("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 112 64'><rect x='10' y='16' width='92' height='30' rx='10' fill='#84cc16'/><rect x='16' y='21' width='76' height='12' rx='3' fill='#1e293b'/><circle cx='32' cy='50' r='5' fill='#334155'/><circle cx='80' cy='50' r='5' fill='#334155'/></svg>"),
 talman:svgData("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 112 64'><rect x='10' y='16' width='92' height='30' rx='10' fill='#facc15'/><rect x='46' y='20' width='46' height='22' rx='3' fill='#06b6d4'/><rect x='14' y='21' width='28' height='12' rx='3' fill='#1e293b'/><circle cx='32' cy='50' r='5' fill='#334155'/><circle cx='80' cy='50' r='5' fill='#334155'/></svg>"),
 tkore:svgData("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 112 64'><polygon points='10,46 18,16 102,16 102,46' fill='#dc2626'/><rect x='14' y='20' width='22' height='24' rx='3' fill='#1e293b'/><rect x='40' y='21' width='56' height='11' rx='2' fill='#1e293b'/><circle cx='32' cy='50' r='5' fill='#334155'/><circle cx='80' cy='50' r='5' fill='#334155'/></svg>")
};
const VIMG={
 ...IMG,
 kore:"/assets/aistudio/Gemini_Generated_Image_xkyilmxkyilmxkyi_35c77028.jpg",
 tyerli:"/assets/aistudio/Gemini_Generated_Image_o5typxo5typxo5ty_66b4368c.jpg",
 tcin:"/assets/aistudio/Gemini_Generated_Image_tskagltskagltska_63aae8f8.jpg",
 talman:"/assets/aistudio/Gemini_Generated_Image_aj4w1paj4w1paj4w_a814711b.jpg",
 tkore:"/assets/aistudio/Gemini_Generated_Image_raag67raag67raag_211f72f2.jpg"
};
const ZOOM_IMG=new Set(["kore","tyerli","tcin","talman","tkore"]);
const vImgHtml=(k,small)=>`<div class="vimg-wrap${small?" s":""}"><img class="vimg${ZOOM_IMG.has(k)?" zoomed":""}" src="${VIMG[k]}" referrerPolicy="no-referrer"${FALLBACK_SVGS[k]?` onerror="this.onerror=null;this.src='${FALLBACK_SVGS[k]}'"`:""} alt="${VT[k].n}"></div>`;
let loan={p:0,plan:null},negD=0,over=false,alUnlocked=false,nk=false,tramUnlocked=false,talUnlocked=false,tkUnlocked=false,mktCat="metro",atl=0,svt=0,lvx=0,lvy=0,lvt=0,lvs=0,lzt=0,lck=0;
let mk={yerli:1,cin:1,alman:1,kore:1,tyerli:1,tcin:1,talman:1,tkore:1},us={yerli:2,cin:3,alman:1,kore:2,tyerli:2,tcin:3,talman:1,tkore:1},fa={yerli:0,cin:0,alman:0,kore:0,tyerli:0,tcin:0,talman:0,tkore:0};
const SK="bursametro.save.v1",SK_CAR="bursametro.saves.career.v1",SK_SBX="bursametro.saves.sandbox.v1",MAX_SAVES=3,ATC=[45,75,115],DN=["Pzt","Sal","Çar","Per","Cum","Cmt","Paz"];
const ALL_VK=cat=>Object.keys(VT).filter(k=>!cat||VT[k].cat===cat),
 isUnlocked=k=>isSandbox()||(k==="alman"?alUnlocked:k==="kore"?nk:k==="tyerli"||k==="tcin"?tramUnlocked:k==="talman"?talUnlocked:k==="tkore"?tkUnlocked:true),
 VK=cat=>ALL_VK(cat).filter(isUnlocked),
 depN=cat=>Object.keys(VT).filter(k=>!cat||VT[k].cat===cat).reduce((a,k)=>a+(dep[k]||0),0),
 vp=k=>Math.round(VT[k].p*mk[k]*diffMult()*10)/10,br2=t=>VT[t].br*(1+fa[t]/500)*(1-.2*atl)*opMult(),lr=()=>(.0028+loan.p*8e-6)*opMult(),fe=o=>Math.pow(o.fare||1,-.6)*(o.lo||1),
 totalOf=k=>(dep[k]||0)+allL().reduce((a,x)=>a+VT[k].setSize*(x[1].tr[k]||0),0),
 trainsOf=o=>o.trains!=null?o.trains:Object.entries(o.tr||{}).reduce((a,[,n])=>a+(n||0),0),
 rc=k=>Math.round(totalOf(k)*vp(k)*(VT[k].cat==="tram"?1:4))/10,lim=()=>Math.min(450,180+45*allL().length);
const loT=o=>{const f=o.fare||1,t=f>1.3?Math.max(.6,1-(f-1.3)*.5):f<1?Math.min(1.12,1+(1-f)*.25):1;o.lo=(o.lo||1)+(t-(o.lo||1))*.08};
const TARIFFS={
 std:{n:"Standart",d:"Dengeli tarife",dm:1,rv:1,st:0},
 eco:{n:"Öğrenci Dostu",d:"Yolcu +%14 · Gelir −%12 · +6 😊",dm:1.14,rv:.88,st:6},
 peak:{n:"Pik Zammı",d:"Gelir +%16 · Yolcu −%3 · −5 😊",dm:.97,rv:1.16,st:-5}
};
const SCHEDULES={
 std:{id:"std",ic:"⚖️",n:"Dengeli",tag:"Standart",d:"Gün boyu sabit sefer · normal maliyet",pkCap:1.00,offCap:1.00,costM:1.00,demM:1.00,sat:0,bars:[68,68,68,68]},
 peak:{id:"peak",ic:"🚦",n:"Pik Odaklı",tag:"Pik Saat",d:"07–09 & 17–19 sık · pik +%28 kap., gider −%6",pkCap:1.28,offCap:0.86,costM:0.94,demM:1.02,sat:1,bars:[100,56,100,45]},
 econ:{id:"econ",ic:"🌿",n:"Ekonomik",tag:"Ekonomik",d:"Sakin saatlerde seyrek · gider −%22, kap. biraz düşer",pkCap:0.90,offCap:0.72,costM:0.78,demM:0.96,sat:-1,bars:[75,40,75,30]},
 full:{id:"full",ic:"🔥",n:"Tam Frekans",tag:"Tam Güç",d:"Tüm gün tam kapasite · talep +%6, gider +%18",pkCap:1.12,offCap:1.15,costM:1.18,demM:1.06,sat:2,bars:[100,92,100,82]}
};
const schedOf=o=>(o&&SCHEDULES[o.sched])||SCHEDULES.std;
function clk(){const h=acc/DAYSEC*24,hh=Math.floor(h),wd=(day-1)%7,r=wd<5&&((hh>=7&&hh<9)||(hh>=17&&hh<19)),di=hh>=5&&hh<8?"🌅":hh>=8&&hh<17?"☀️":hh>=17&&hh<20?"🌇":"🌙";$("d").innerHTML=day+'<small style="display:inline;font-size:10px;letter-spacing:0;text-transform:none;margin-left:5px;opacity:.85">'+di+" "+DN[wd]+" "+String(hh).padStart(2,"0")+":"+(Math.floor(h%1*6)*10+"").padStart(2,"0")+(r?" 🚦":"")+"</small>"}
function mkT(){const K=VK();K.forEach(k=>{mk[k]=Math.min(1.45,Math.max(.7,mk[k]+(1-mk[k])*.06+(Math.random()-.5)*.07));if(Math.random()<.12&&us[k]<6)us[k]++;fa[k]+=1-.25*atl});
 if(!alUnlocked&&day>=45){alUnlocked=true;SFX.unlock();toast("🇩🇪 Yeni üretici açıldı! Alman Malı yüksek kapasiteli metro vagonları Vagon Piyasası'nda.")}
 if(!tramUnlocked&&day>=50){tramUnlocked=true;SFX.unlock();toast("🚊 Tramvay Çağı Başladı! Artık Tramvay hatları kurabilir, 🇹🇷 Yerli ve 🇨🇳 Çin tramvayları alabilir, Hatlarım'dan T1 ve T2 hatlarını satın alabilirsin.")}
 if(!nk&&day>=90){nk=true;SFX.unlock();toast("🇰🇷 Güney Kore Malı modern metrolar Vagon Piyasası'nda açıldı!")}
 if(!talUnlocked&&day>=90){talUnlocked=true;if(nk)setTimeout(()=>toast("🇩🇪 Alman Malı (sarı-turkuaz) Tramvay da Vagon Piyasası'nda açıldı!"),1800);else{SFX.unlock();toast("🇩🇪 Alman Malı Tramvay Vagon Piyasası'nda açıldı!")}}
 if(!tkUnlocked&&day>=120){tkUnlocked=true;SFX.unlock();toast("🇰🇷 Güney Kore Tramvayı (keskin hatlı Rotem) Vagon Piyasası'nda açıldı!")}
 if(K.length&&Math.random()<.06){const k=K[rnd(K.length)],d=Math.random()<.5;mk[k]=Math.min(1.45,Math.max(.7,mk[k]*(d?.85:1.2)));toast((d?"📉 ":"📈 ")+VT[k].n+" fiyatları "+(d?"düştü":"yükseldi")+" (×"+mk[k].toFixed(2)+")")}}
function buyW(t){const k=t.dataset.t,n=+t.dataset.n,u=!!t.dataset.u,v=VT[k],c=Math.round(vp(k)*n*(u?.55:1)*10)/10;if(!isUnlocked(k)){SFX.lock();toast("🔒 "+v.n+" henüz kilitli! "+v.unlockDay+". günde açılacak.");return}if(u&&us[k]<n)return;if(!hasMoney(c)){SFX.err();toast("Yetersiz bütçe.");return}const N=totalOf(k);fa[k]=(fa[k]*N+(u?500:0)*n)/(N+n);pay("vagon",c);dep[k]=(dep[k]||0)+n;if(u)us[k]-=n;v.cat==="tram"?SFX.tram():SFX.train(true);toast(v.ic+" "+n+" "+v.n+(u?" (ikinci el)":"")+(v.cat==="tram"?" set":" vagon")+" depoya eklendi");ui();render2()}
function wsHtml(){const ap=atl<3?atcPrice(atl):0,oldKeys=ALL_VK().filter(k=>totalOf(k)>0&&fa[k]>=250),allRenewCost=oldKeys.reduce((a,k)=>a+rc(k),0);
 return '<p style="margin:12px 0 0"><b>🛠 Atölye &amp; Filo Yaşı</b></p>'+`<div class="dpc"><div><b>🏭 Bakım Atölyesi · Seviye ${atl}/3</b><small>${atl<3?"Sonraki seviye: arıza oranı −%20, filo daha yavaş yaşlanır.":"Maksimum seviye"}</small></div>${atl<3?`<button class="pri" data-a="atl" ${!hasMoney(ap)?"disabled":""}>₺${ap}M</button>`:"<b>✔</b>"}</div>`+
 `<div class="auto-bar"><div><b>🤖 Otomatik Filo Yenileme</b><small style="color:var(--mut);display:block">Yaşı 550 günü geçen araçları bütçe uygunken otomatik yeniler</small></div><div style="display:flex;gap:6px;flex:none">${oldKeys.length>1?`<button data-a="renewAll" ${!hasMoney(allRenewCost)?"disabled":""}>🔄 Tümünü Yenile ₺${allRenewCost.toFixed(1)}M</button>`:""}<button class="${autoRenew?"on":""}" data-a="autoRenew">${autoRenew?"AÇIK":"KAPALI"}</button></div></div>`+
 ALL_VK().map(k=>{const n=totalOf(k),un=isUnlocked(k),v=VT[k];return n||(un&&k!=="kore"&&v.cat==="metro")?`<div class="dpc"><div><b>${v.ic} ${v.n}</b><small>${n?`${n} ${v.cat==="tram"?"set":"vagon"} · ort. yaş ${Math.round(fa[k])} gün${fa[k]>550?" · ⚠ yenileme zamanı":""}`:"Henüz filoda yok"}</small></div>${n?`<button data-a="renew" data-t="${k}" ${!hasMoney(rc(k))?"disabled":""}>Yenile ₺${rc(k)}M</button>`:""}</div>`:""}).join("")}
const LOAN_SVGS={
 bank:'<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10h18M4 10l8-6 8 6M6 10v8M10 10v8M14 10v8M18 10v8M3 20h18"/></svg>',
 debt:'<svg viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="18" height="12" rx="3" fill="#f59e0b" fill-opacity=".18" stroke="#d97706" stroke-width="2"/><circle cx="12" cy="12" r="2.8" fill="#fbbf24" stroke="#b45309" stroke-width="1.6"/><path d="M6.5 9.5h.01M17.5 14.5h.01" stroke="#b45309" stroke-width="2.2"/></svg>',
 rate:'<svg viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9" fill="#8b5cf6" fill-opacity=".16" stroke="#7c3aed" stroke-width="2"/><path d="M9 15l6-6" stroke="#7c3aed" stroke-width="2.2"/><circle cx="9.5" cy="9.5" r="1.2" fill="#7c3aed"/><circle cx="14.5" cy="14.5" r="1.2" fill="#7c3aed"/></svg>',
 cal:'<svg viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="5" width="16" height="15" rx="3" fill="#ef4444" fill-opacity=".14" stroke="#dc2626" stroke-width="2"/><path d="M8 3v4M16 3v4M4 10h16" stroke="#dc2626" stroke-width="2"/><path d="M12 13v3.5" stroke="#dc2626" stroke-width="2.2"/></svg>',
 coinPlus:'<svg viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="10.5" cy="12.5" r="7" fill="#fbbf24" fill-opacity=".28" stroke="#f59e0b" stroke-width="2"/><path d="M10.5 9.5v6M7.5 12.5h6" stroke="#fff" stroke-width="2"/><circle cx="17.5" cy="7.5" r="4" fill="#22c55e" fill-opacity=".3" stroke="#22c55e" stroke-width="1.8"/></svg>',
 pay:'<svg viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="18" height="12" rx="3" fill="#22c55e" fill-opacity=".2" stroke="#16a34a" stroke-width="2"/><path d="M9 12l2 2 4-4" stroke="#16a34a" stroke-width="2.2"/></svg>'
};
const LOAN_PLANS=[
 {days:15,rate:0.04,n:"Hızlı Vade",d:"Kısa sürede kapat · en az ekstra faiz"},
 {days:30,rate:0.08,n:"Dengeli Vade",d:"Günlük nakit akışını zorlamaz"},
 {days:45,rate:0.14,n:"Uzun Vade",d:"En düşük günlük taksit · rahat nefes"}
];
function loanHtml(){
 if(isSandbox())return gh("purp","🏦 Kredi &amp; Borç","Sandbox modunda bütçe sınırsızdır")+`<div class="loan-hero"><div class="loan-hero-ic">${LOAN_SVGS.bank}</div><div><b style="display:block;font-size:15px">Sandbox Hazinesi</b><small style="color:var(--mut)">Sınırsız bütçe aktif; kredi çekmeye veya taksitlendirmeye gerek yok.</small></div></div><div class="tl2"><div class="tile"><span class="loan-ic">${LOAN_SVGS.coinPlus}</span><b>∞ Sınırsız</b><small>Sandbox Kasası</small></div><div class="tile"><span class="loan-ic">${LOAN_SVGS.debt}</span><b>₺0M</b><small>Borç</small></div></div>`;
 const L=lim(),r=lr(),nm=negMax(),pl=loan.plan,hasDebt=loan.p>=1,showR=!!pv.restruct&&hasDebt;
 const debtFmt=loan.p>0?"₺"+loan.p.toFixed(1).replace(/\.0$/,"")+"M":"₺0M";
 let h=gh("purp","🏦 Kredi &amp; Borç","Günlük faiz %"+(r*100).toFixed(2)+" · limit ₺"+L+"M");
 h+=`<div class="loan-hero"><div class="loan-hero-ic">${LOAN_SVGS.bank}</div><div style="flex:1;min-width:0"><b style="display:block;font-size:15px">Bursa Ulaşım Bankası</b><small style="color:var(--mut)">Kredi limiti: <b>₺${L}M</b> (hat sayısı arttıkça büyür) · Kalan limit: <b>₺${Math.max(0,Math.round((L-loan.p)*10)/10)}M</b></small></div></div>`;
 h+=`<div class="tl2">
  <div class="tile debt-tile${hasDebt?" act":""}" ${hasDebt?'data-a="restructToggle" title="Borcunu taksitlere böl / yapılandır"':""}><span class="loan-ic">${LOAN_SVGS.debt}</span><b>${debtFmt}</b><small>Toplam Borç</small>${hasDebt?`<span class="debt-cta">🔄 ${showR?"Gizle ▲":"Yapılandır ▾"}</span>`:""}</div>
  <div class="tile"><span class="loan-ic">${LOAN_SVGS.rate}</span><b>${pl?"Sabit":("₺"+(loan.p*r).toFixed(2)+"M")}</b><small>${pl?`Taksit ₺${pl.daily.toFixed(2)}M/g`:"Günlük Faiz"}</small></div>
  <div class="tile"><span class="loan-ic">${LOAN_SVGS.cal}</span><b>${negD}/${nm}</b><small>Eksi Bakiye Günü</small></div>
 </div>`;
 if(pl){
  const done=Math.max(0,pl.daysTotal-pl.left),pct=Math.min(100,Math.round(done/Math.max(1,pl.daysTotal)*100));
  h+=`<div class="plan-active"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:13px"><b>📅 Aktif Yapılandırma Planı (${pl.daysTotal} gün)</b><span class="mg-badge ok">Kalan ${pl.left} gün</span></div><div class="plan-bar"><i style="width:${pct}%"></i></div><small style="color:var(--mut);display:block">Her gün otomatik <b>₺${pl.daily.toFixed(2)}M</b> taksit düşer (ekstra günlük değişken faiz işlemez). İstersen erken ödeme yapabilir veya borç kartına tıklayıp yeni vade seçebilirsin.</small></div>`;
 }
 if(showR){
  h+=`<div class="restruct-box"><div class="restruct-hd"><b>🔄 Borç Yapılandırma · 3 Taksit Seçeneği</b><button data-a="restructToggle" style="padding:3px 9px;font-size:12px">Kapat ✕</button></div><small style="color:var(--mut);display:block;line-height:1.4">Mevcut <b>${debtFmt}</b> borcunu sabit günlük taksitlere böl. Vade uzadıkça toplam faiz oranı hafifçe artar ancak yapılandırma süresince değişken faiz durur.</small><div class="plan-grid">`+
  LOAN_PLANS.map(op=>{
   const tot=Math.round(loan.p*(1+op.rate)*100)/100,fee=Math.round((tot-loan.p)*100)/100,daily=Math.round((tot/op.days)*100)/100,isCur=pl&&pl.daysTotal===op.days;
   return `<button class="plan-btn${isCur?" on":""}" data-a="pickPlan" data-d="${op.days}"><div style="display:flex;justify-content:space-between;align-items:center;width:100%"><b>${op.days} Gün</b><span class="plan-rate">+%${Math.round(op.rate*100)} faiz</span></div><b style="color:#6d28d9;font-size:15px">₺${daily.toFixed(2)}M/gün</b><small>${op.n} · Toplam ₺${tot.toFixed(1)}M (+₺${fee.toFixed(1)}M)<br>${op.d}</small></button>`;
  }).join("")+`</div></div>`;
 }
 h+=`<p style="font-size:12.5px;color:var(--mut)">Bakiye ${nm} gün eksi kalırsa belediye işletmeye el koyar.${hasDebt&&!showR?' <b style="color:#8b5cf6">İpucu: Yukarıdaki Borç kartına tıklayarak borcunu 15, 30 veya 45 taksite bölebilirsin.</b>':""}</p>`;
 h+=`<p><b>💳 Kredi Çek</b></p><div class="qa">${[25,50,100].map(n=>`<button data-a="loan" data-n="${n}" ${loan.p+n>L?"disabled":""}><span class="qa-btn-ic"><span class="qa-ic">${LOAN_SVGS.coinPlus}</span>+₺${n}M</span></button>`).join("")}</div>`;
 h+=`<p><b>💸 Borç Öde</b></p><div class="qa">${[25,50].map(n=>`<button data-a="repay" data-n="${n}" ${loan.p<0.5||!hasMoney(Math.min(n,loan.p))?"disabled":""}><span class="qa-btn-ic"><span class="qa-ic">${LOAN_SVGS.pay}</span>₺${n}M</span></button>`).join("")}<button data-a="repay" data-n="${loan.p}" ${loan.p<0.1||!hasMoney(loan.p)?"disabled":""}><span class="qa-btn-ic"><span class="qa-ic">${LOAN_SVGS.pay}</span>Tümünü öde</span></button></div>`;
 return h;
}
function debtTick(){if(isSandbox()){negD=0;return}const nm=negMax();if(budget<0){negD++;stat.maxNeg=Math.max(stat.maxNeg,negD);if(negD===1){SFX.warn();toast("⚠ Bakiye eksiye düştü! "+nm+" gün içinde pozitife dönmezsen belediye müdahale eder. İşletme Merkezi'nden 🏦 kredi alabilirsin.")}else if(negD===Math.floor(nm/2)||negD===nm-5){SFX.warn();toast("🚨 Belediye uyarısı: "+(nm-negD)+" gün kaldı!")}if(negD>=nm)gameOver("neg")}else if(negD>0)negD=Math.max(0,negD-3)}
const satMult=()=>.85+(sat/100)*.27;
const satEmoji=()=>sat>=80?"😄":sat>=60?"😊":sat>=40?"😐":sat>=25?"😟":"😡";
function satTick(){
 const ls=allL();if(!ls.length)return;const dm=opMult();
 const cov=cityCov(),avgPk=ls.reduce((a,x)=>a+(x[1].pk||0),0)/ls.length,avgS=ls.reduce((a,x)=>a+(x[1].s||1),0)/ls.length,avgF=ls.reduce((a,x)=>a+(x[1].fare||1),0)/ls.length,nCnt=ls.filter(x=>x[1].night).length,qLines=lines.filter(l=>l.type==="tram"||l.mode==="tunnel").length,tCfg=TARIFFS[tariff]||TARIFFS.std,avgSchedSat=ls.reduce((a,x)=>a+(schedOf(x[1]).sat||0),0)/ls.length;
 let tgt=(58-(dm-1)*7)+Math.min(18,cov*.38)+Math.min(10,POIS.filter(p=>p.active).length*2)+avgS*12+Math.min(6,nCnt*1.8)+Math.min(4,qLines*1.5)+(tCfg.st||0)+avgSchedSat;
 if(avgPk>.92)tgt-=Math.min(34,(avgPk-.92)*42*dm);
 if(avgF>1.05)tgt-=Math.min(28,(avgF-1.05)*26*dm);
 else if(avgF<.95)tgt+=Math.min(8,(1-avgF)*20/Math.sqrt(dm));
 if(crisis&&crisis.state==="active")tgt-=8*dm;
 tgt=Math.max(8,Math.min(99,tgt));
 sat=Math.round((sat+(tgt-sat)*.16)*10)/10;
 if(sat>=80){const sub=Math.round(((.18+(sat-80)*.018+ls.length*.04)/Math.sqrt(dm))*100)/100;dly.tesvik=sub;if(!isSandbox())budget+=sub;LG("tesvik",sub);lastNet+=sub}else dly.tesvik=0;
 if(isSandbox()){lowSatDays=0;return}
 const sm=satMax();
 if(sat<25){lowSatDays++;if(lowSatDays===1||lowSatDays===sm-5){SFX.warn();toast("😡 Halk memnuniyeti %"+Math.round(sat)+" seviyesine düştü! "+(sm-lowSatDays)+" gün içinde toparlanmazsa belediye el koyar.")}if(lowSatDays>=sm)gameOver("sat")}
 else if(lowSatDays>0)lowSatDays=Math.max(0,lowSatDays-2);
}
const ctVal=c=>{if(!c)return 0;if(c.tp==="poi"){const p=POIS.find(x=>x.id===c.pid);return p&&p.active?1:0}if(c.tp==="cov")return cityCov();if(c.tp==="pax")return lastPax;if(c.tp==="comf")return c.st||0;if(c.tp==="sat")return c.st||0;if(c.tp==="ln")return lines.length;return 0};
const ctProg=c=>Math.max(0,Math.min(1,c.tp==="poi"?ctVal(c):(ctVal(c)/(c.tgt||1))));
function mkCtPool(){
 const pool=[];
 const unPoi=POIS.filter(p=>!p.active).sort((a,b)=>b.base-a.base);
 unPoi.slice(0,2).forEach(p=>pool.push({tp:"poi",pid:p.id,ic:"📍",t:p.name+" Bağlantısı",d:p.name+" (1 km yakınına aktif durak kur)",tgt:1,dur:12+rnd(6),rw:Math.round((32+p.base/450)*1),stBon:4}));
 const cov=cityCov();
 if(cov<85){const tCov=Math.min(92,Math.round((cov+8+rnd(7))*2)/2);pool.push({tp:"cov",ic:"🏙️",t:"Şehir Kapsama Hedefi",d:"Şehir kapsama oranını %"+tCov.toFixed(1).replace(".",",")+" seviyesine çıkar",tgt:tCov,dur:14+rnd(6),rw:Math.round(30+lines.length*6),stBon:4})}
 const tPax=Math.max(45000,Math.round((lastPax*(1.22+Math.random()*.14))/2500)*2500);
 pool.push({tp:"pax",ic:"👥",t:"Günlük Yolcu Rekoru",d:"Günlük yolcu sayısını "+fmt(tPax)+" seviyesine taşı",tgt:tPax,dur:13+rnd(6),rw:Math.round(28+tPax/4500),stBon:4});
 pool.push({tp:"comf",ic:"🚆",t:"Konforlu Taşımacılık",d:"Tüm hatlarda tepe doluluk %90 altında kalsın (4 gün)",tgt:4,dur:10+rnd(4),rw:Math.round(28+allL().length*5),stBon:5,st:0});
 pool.push({tp:"sat",ic:"😊",t:"Halk Memnuniyeti Zirvesi",d:"Memnuniyeti 5 gün boyunca %78 üstünde tut",tgt:5,dur:11+rnd(5),rw:Math.round(34+allL().length*5),stBon:5,st:0});
 pool.push({tp:"ln",ic:"🛤",t:"Yeni Metro Koridoru",d:"Yeni bir metro hattı daha hizmete aç",tgt:lines.length+1,dur:14+rnd(6),rw:Math.round(40+lines.length*7),stBon:5});
 return pool;
}
function spawnCtOffers(){
 const p=mkCtPool(),res=[];
 while(p.length&&res.length<2){const idx=rnd(p.length),it=p.splice(idx,1)[0];it.id="ct"+day+"_"+res.length;res.push(it)}
 ctOffers=res;SFX.ctNew();toast("📜 Yeni belediye ihale teklifleri geldi! İhaleler düğmesinden seçebilirsin.");
}
function acceptCt(id){
 const o=ctOffers.find(x=>x.id===id);if(!o||ct)return;
 ct={...o,startDay:day,left:o.dur,st:0};ctOffers=[];SFX.coin();
 toast("📜 İhale alındı: "+ct.t+" ("+ct.left+" gün, ödül ₺"+ct.rw+"M)");
 ui();render2();
}
function contractTick(){
 const dm=diffMult();
 if(ct){
  if(ct.tp==="comf"){const ls=allL(),ok=ls.length&&ls.every(x=>(x[1].pk||0)<=.90);ct.st=ok?(ct.st||0)+1:0}
  else if(ct.tp==="sat"){ct.st=sat>=78?(ct.st||0)+1:0}
  if(ctVal(ct)>=ct.tgt){
   const rw=ct.rw,bn=ct.stBon||4;
   if(!isSandbox())budget+=rw;LG("odul",rw);sat=Math.min(100,sat+bn);ctWon++;
   SFX.ctWin();toast("🏆 İhale tamamlandı: "+ct.t+" · +₺"+rw+"M & +%"+bn+" Memnuniyet!");
   ct=null;ctCd=Math.round((6+rnd(4))*dm);return;
  }
  ct.left--;
  if(ct.left<=0){
   const pen=Math.round(4*dm);
   sat=Math.max(10,sat-pen);SFX.ctFail();
   toast("⌛ İhale süresi doldu: "+ct.t+" (−%"+pen+" Memnuniyet)");
   ct=null;ctCd=Math.round((6+rnd(4))*dm);
  }
  return;
 }
 if(!ctOffers.length){ctCd--;if(ctCd<=0&&day>=4)spawnCtOffers()}
}
function updMgDot(){
 const dot=$("mgdot");if(!dot)return;
 const nr=GL.filter(gready).length,hasOffer=ctOffers.length>0,urgCt=ct&&ct.left<=3;
 if(nr>0||hasOffer||urgCt){dot.hidden=false;dot.textContent=nr?String(nr):(hasOffer?String(ctOffers.length):"!");dot.style.background=nr?"#22c55e":(urgCt?"#e63946":"#f59e0b")}
 else dot.hidden=true;
}
function cbadge(){
 const ic=$("cbIc"),bg=$("cbBg");
 if(ic&&!ic.innerHTML)ic.innerHTML=IC.scroll;
 if(bg){
  if(ct){bg.hidden=false;bg.textContent=ct.left+"g";bg.className="mg-badge"+(ct.left<=3?"":" warn")}
  else if(ctOffers.length){bg.hidden=false;bg.textContent=ctOffers.length+" yeni";bg.className="mg-badge"}
  else bg.hidden=true;
 }
 updMgDot();
}
function ctHudUpd(){
 const el=$("cthud"),selSc=$("scnhud"),busy=!!(cur||sel);
 wrap.classList.toggle("busy-btm",busy);
 if(selSc){
  if(!started||!isScenario()||!activeScn){selSc.hidden=true}
  else{
   const sc=SCENARIOS.find(x=>x.id===activeScn);
   if(!sc){selSc.hidden=true}
   else{
    selSc.hidden=false;
    const rem=Math.max(0,sc.days-day+1),doneCnt=sc.reqs.filter(r=>r.chk()).length;
    selSc.innerHTML=`<div class="cth-top"><span class="cth-t">${sc.ic} ${sc.title}</span><span class="cth-d${rem<=5?" urg":""}">${rem} gün kaldı</span></div>`+
     `<div class="scnh-list">`+sc.reqs.map(r=>{const ok=r.chk();return `<div class="scnh-it${ok?" ok":""}"><span>${ok?"✅":"⬜"} ${r.t}</span><span>${r.prog?r.prog():(ok?"Tamam":"Bekliyor")}</span></div>`}).join("")+`</div>`+
     `<div class="cth-bar"><i style="width:${Math.round(doneCnt/sc.reqs.length*100)}%"></i></div>`;
   }
  }
 }
 if(!started||isScenario()||(!ct&&!ctOffers.length)){el.hidden=true;return}
 el.hidden=false;
 if(ct){
  const v=ctVal(ct),p=Math.round(ctProg(ct)*100),vt=ct.tp==="poi"?(v?"1/1":"0/1"):ct.tp==="cov"?"%"+v.toFixed(1)+" / %"+ct.tgt.toFixed(1):fmt(Math.round(v))+" / "+fmt(ct.tgt);
  el.innerHTML=`<div class="cth-top"><span class="cth-t">${ct.ic} ${ct.t}</span><span class="cth-d${ct.left<=3?" urg":""}">${ct.left} gün</span></div><div class="cth-sub"><span>${vt}</span><b>+₺${ct.rw}M</b></div><div class="cth-bar"><i style="width:${p}%"></i></div>`;
 }else{
  el.innerHTML=`<div class="cth-top"><span class="cth-t">📜 ${ctOffers.length} Yeni İhale Teklifi</span><span class="cth-d">Seç</span></div><div class="cth-sub"><span>Süreli belediye görevi seç</span><b>₺${ctOffers[0].rw}M+</b></div>`;
 }
}
$("cthud").onclick=()=>{if(!started)return;SFX.open();pv={m:"ct",tab:"info"};$("ov2").hidden=false;render2()};
function contractsHtml(){
 const sCol=sat>=75?"#22c55e":sat>=50?"#f59e0b":"#e63946",sMsg=isSandbox()?"Sandbox modunda belediye el koyması kapalıdır.":sat>=80?"Harika! Belediye yüksek kalite teşviki ödüyor.":sat>=60?"Halk memnun, seferler dengeli.":sat>=40?"Kalabalık veya pahalı hatlar memnuniyeti düşürüyor.":"Dikkat! Memnuniyet %25 altında "+satMax()+" gün kalırsa belediye el koyar.";
 let h=gh("tealg","📜 Belediye İhaleleri","Süreli görevleri tamamla, hibe ve memnuniyet kazan")+`<div class="sat-box"><span style="font-size:32px">${satEmoji()}</span><div style="flex:1"><small style="color:var(--mut);font-size:11px;display:block">HALK MEMNUNİYETİ · Tamamlanan ihale: ${ctWon}</small><b style="color:${sCol}">%${Math.round(sat)}</b> <small style="color:var(--mut);font-size:12px">· Yolcu çarpanı ×${satMult().toFixed(2)}</small><div class="cth-bar" style="margin-top:5px"><i style="width:${Math.round(sat)}%;background:${sCol}"></i></div><small style="color:var(--mut);font-size:11px;display:block;margin-top:4px">${sMsg}</small></div></div>`;
 if(ct){
  const v=ctVal(ct),p=Math.round(ctProg(ct)*100),vt=ct.tp==="poi"?(v?"Bağlandı":"Bağlanmadı"):ct.tp==="cov"?"%"+v.toFixed(1)+" / %"+ct.tgt.toFixed(1):fmt(Math.round(v))+" / "+fmt(ct.tgt);
  h+=`<div class="ct-card act"><div class="ct-head"><h3>${ct.ic} ${ct.t}</h3><span class="ct-rw">+₺${ct.rw}M · +%${ct.stBon||4} 😊</span></div><div class="ct-meta">${ct.d} · Kalan süre: <b>${ct.left} gün</b></div><div class="ct-prog"><i style="width:${p}%"></i><span>${vt} (%${p})</span></div></div>`;
 }else if(ctOffers.length){
  h+=`<p style="margin:10px 0 4px;font-size:13px"><b>Bir belediye ihalesi seç:</b> <small style="color:var(--mut)">(Aynı anda 1 aktif ihale yürütülür)</small></p>`+ctOffers.map(o=>`<div class="ct-card"><div class="ct-head"><h3>${o.ic} ${o.t}</h3><span class="ct-rw">+₺${o.rw}M · +%${o.stBon||4} 😊</span></div><div class="ct-meta">${o.d}<br>Süre: <b>${o.dur} gün</b></div><button class="pri" data-a="accCt" data-id="${o.id}">✔ İhaleyi Al</button></div>`).join("");
 }else{
  h+=`<div class="ct-card" style="text-align:center;border-style:dashed"><p style="margin:4px 0"><b>Yeni ihale bekleniyor</b></p><small style="color:var(--mut)">Bursa Büyükşehir Belediyesi yaklaşık ${Math.max(1,ctCd)} gün içinde yeni ihale teklifleri sunacak.</small></div>`;
 }
 return h;
}
const saveKeyFor=m=>m==="sandbox"?SK_SBX:SK_CAR;
function getSaves(m){try{const a=JSON.parse(localStorage.getItem(saveKeyFor(m)));return Array.isArray(a)?a.slice(0,MAX_SAVES):[]}catch(e){return[]}}
function setSaves(m,arr){try{localStorage.setItem(saveKeyFor(m),JSON.stringify(arr.slice(0,MAX_SAVES)))}catch(e){}}
function migrateLegacySave(){
 try{
  const raw=localStorage.getItem(SK);if(!raw)return;
  const s=JSON.parse(raw);if(!s||s.v!==1)return;
  const curCar=getSaves("career");
  if(curCar.length<MAX_SAVES){
   curCar.unshift({...s,v:2,slotId:"c_legacy_"+Date.now(),mode:"career",diff:"easy",updatedAt:Date.now(),guideDone:true,guideStep:3,reportsShown:[]});
   setSaves("career",curCar);
  }
  localStorage.removeItem(SK);
 }catch(e){}
}
migrateLegacySave();
function delSave(m,id){const arr=getSaves(m).filter(x=>x.slotId!==id);setSaves(m,arr)}
function resetWorld(m,d,name){
 gameMode=m==="sandbox"?"sandbox":m==="scenario"?"scenario":"career";
 diff=(gameMode==="sandbox"||gameMode==="scenario")?"easy":(DIFFS[d]?d:"easy");
 activeSlotId=(gameMode==="career"||gameMode==="sandbox")?((isSandbox()?"s_":"c_")+Date.now()+"_"+rnd(1000)):null;
 activeScn=null;autoRenew=false;councilCd=20;councilChoice=null;councilUsed=[];listFilter="all";listSort="def";camAnim=null;
 budget=isSandbox()?999999:DIFFS[diff].startBudget;
 st=[];lines=[];cur=null;sel=null;buildSt=false;moveSt=null;bendDrag=null;uid=1;lid=1;day=1;acc=0;spd=1;started=false;owned={};lastPax=0;lastNet=0;T=0;dem=false;evs=[];crisis=null;cdn=12;nextEv=5;
 paused=false;fx=[];fxText=[];led={};hist=[];histP=[];histS=[];opp=[];tips=[];actv=[];poiLoad={};ST_ANAL.clear();
 corp=name||(isSandbox()?"Bursa Sandbox":isScenario()?"Bursa Senaryo":"Bursaray");
 dep=isSandbox()?{yerli:12,cin:0,alman:4,kore:4,tyerli:4,tcin:0,talman:2,tkore:2}:{yerli:8,cin:0,alman:0,kore:0,tyerli:0,tcin:0,talman:0,tkore:0};
 dly={bilet:0,ticari:0,bakim:0,filo:0,personel:0,ray:0,bosta:0,tesvik:0};
 sat=74;lowSatDays=0;ct=null;ctOffers=[];ctCd=4;ctWon=0;follow=null;tariff="std";demMode="pop";
 loan={p:0,plan:null};negD=0;over=false;
 const unAll=isSandbox();
 alUnlocked=unAll;nk=unAll;tramUnlocked=unAll;talUnlocked=unAll;tkUnlocked=unAll;
 mk={yerli:1,cin:1,alman:1,kore:1,tyerli:1,tcin:1,talman:1,tkore:1};
 us={yerli:2,cin:3,alman:1,kore:2,tyerli:2,tcin:3,talman:1,tkore:1};
 fa={yerli:0,cin:0,alman:0,kore:0,tyerli:0,tcin:0,talman:0,tkore:0};
 atl=0;gp={};ach={};stat={maxNeg:0,loanTaken:0,councilCount:0};gnPrev=0;
 guideStep=0;guideDone=false;reportsShown=[];
 D.mah.forEach(h=>{h.cur=h.pop;h.cov=0;h.c2=0});
 POIS.forEach(p=>{p.active=false;p.lines=[];p.bonus=false;p.near=[];p.curPax=0});
 BS.forEach(s=>s.q=0);
 hover=null;hoverTarget=null;
 $("ov2").hidden=true;$("ov3").hidden=true;if($("mvbar"))$("mvbar").hidden=true;
 updSp();updFollowBar();home();
}
function startScenario(scId){
 const sc=SCENARIOS.find(x=>x.id===scId);if(!sc)return;
 resetWorld("scenario","easy",sc.title);
 activeScn=sc.id;budget=sc.startBudget;
 if(sc.unlockTram)tramUnlocked=true;
 if(sc.tramInit)dep.tyerli=(dep.tyerli||0)+sc.tramInit;
 (sc.ownedInit||[]).forEach(id=>{const c=CFG[id],l=D.bl.find(x=>x.id===id);if(c&&l){const isT=c.type==="tram";owned[id]={day0:1,earn:0,type:isT?"tram":"metro",ring:!!(l.ring||c.ring),oneWay:!!c.oneWay,tr:isT?{tyerli:c.wag}:{yerli:c.wag/4},rr:1,feed:0,km:l.km,sched:"std"}}});
 started=true;guideDone=true;$("ov").hidden=true;refresh();ui();
 toast(`${sc.ic} Senaryo başladı: ${sc.title} (${sc.days} gün)`);
 msg("Senaryo hedeflerini sağ alt panelden takip edebilirsin.");
}
function scenarioTick(){
 if(!isScenario()||!activeScn||over)return;
 const sc=SCENARIOS.find(x=>x.id===activeScn);if(!sc)return;
 if(sc.reqs.every(r=>r.chk())){
  over=true;saveScnWin(sc.id,day);SFX.ctWin();
  $("cd3").innerHTML=`<div class="kr" style="background:linear-gradient(90deg,#16a34a,#0d9488)">🏆 SENARYO TAMAMLANDI</div><h2>${sc.ic} ${sc.title}</h2><p>Tüm hedefler <b>${day}. günde</b> başarıyla tamamlandı! (Süre sınırı: ${sc.days} gün)</p><p>Yolcu: <b>${fmt(lastPax)}/gün</b> · Net: <b>${MM(lastNet)}/gün</b> · Kapsama: <b>%${cityCov().toFixed(1).replace(".",",")}</b></p><div class="da" style="flex-wrap:wrap;justify-content:center"><button class="pri" id="scCont">Serbest Devam Et</button><button id="scMenu">Ana Menüye Dön</button></div>`;
  $("ov2").hidden=true;$("ov3").hidden=false;
  $("scCont").onclick=()=>{over=false;gameMode="career";activeScn=null;activeSlotId="c_"+Date.now()+"_"+rnd(1000);$("ov3").hidden=true;ui();save();toast("🚇 Kariyer modunda devam ediliyor!")};
  $("scMenu").onclick=()=>{over=false;$("ov3").hidden=true;$("ov").hidden=false;intro()};
  return;
 }
 if(day>sc.days){
  over=true;SFX.over();
  const rem=sc.reqs.filter(r=>!r.chk()).map(r=>r.t).join(", ");
  $("cd3").innerHTML=`<div class="kr">⌛ SENARYO SÜRESİ DOLDU</div><h2>${sc.ic} ${sc.title}</h2><p>${sc.days} günlük süre içinde tüm hedefler tamamlanamadı.</p><p style="font-size:13px;color:var(--mut)">Eksik kalan: ${rem}</p><div class="da" style="flex-wrap:wrap;justify-content:center"><button class="pri" id="scRetry">🔄 Tekrar Dene</button><button id="scMenu">Ana Menüye Dön</button></div>`;
  $("ov2").hidden=true;$("ov3").hidden=false;
  $("scRetry").onclick=()=>{$("ov3").hidden=true;startScenario(sc.id)};
  $("scMenu").onclick=()=>{over=false;$("ov3").hidden=true;$("ov").hidden=false;intro()};
 }
}
function gameOver(why){if(isSandbox())return;over=true;crisis=null;follow=null;updFollowBar();SFX.over();if(activeSlotId)delSave(gameMode,activeSlotId);
 const txt=why==="sat"?`Halk memnuniyeti ${satMax()} gün boyunca %25'in altında kaldı. Büyükşehir Belediyesi ${corp} işletmesinin lisansını iptal etti.`:`${negMax()} gün boyunca bakiye eksi kaldı. Büyükşehir Belediyesi ${corp} işletmesinin lisansını iptal etti.`;
 $("cd3").innerHTML=`<div class="kr">🏛 BELEDİYE MÜDAHALESİ</div><h2>İşletmene el konuldu</h2><p>${txt}</p><p>Gün: <b>${day}</b> · Hat: <b>${allL().length}</b> · Tamamlanan ihale: <b>${ctWon}</b></p><button class="pri big" id="rs">Ana Menüye Dön</button>`;$("ov2").hidden=true;$("ov3").hidden=false;$("rs").onclick=()=>{over=false;$("ov3").hidden=true;$("ov").hidden=false;intro()}}
const sv=()=>{clearTimeout(svt);svt=setTimeout(save,900)};
function save(){if(!started||over||!activeSlotId||isScenario())return;try{const cs=cur?(cur.bend?0:(cur.extend?cur.extOps.reduce((a,o)=>a+o.cost,0):(cur.insert?cur.insOps.reduce((a,o)=>a+o.cost,0):cur.segs.reduce((a,b)=>a+b,0)))):0;
 const payload={v:2,slotId:activeSlotId,mode:gameMode,diff,updatedAt:Date.now(),budget:isSandbox()?999999:budget+cs,st,lines,uid,lid,day,acc,spd,owned,corp,dep,led,hist,histP,histS,evs,crisis,nextEv,cdn,T,loan,negD,mk,us,fa,atl,autoRenew,alUnlocked,nk,tramUnlocked,talUnlocked,tkUnlocked,tariff,gp,ach,stat,sat,lowSatDays,ct,ctOffers,ctCd,ctWon,councilCd,councilUsed,guideStep,guideDone,reportsShown,lineCount:allL().length,pax:lastPax,cov:cityCov(),mah:D.mah.map(h=>Math.round(h.cur))};
 const arr=getSaves(gameMode).filter(x=>x.slotId!==activeSlotId);
 arr.unshift(payload);
 setSaves(gameMode,arr);
}catch(e){}}
function loadSlot(m,slotId){const s=getSaves(m).find(x=>x.slotId===slotId);if(!s)return;
 SFX.open();gameMode=s.mode==="sandbox"?"sandbox":"career";diff=gameMode==="sandbox"?"easy":(DIFFS[s.diff]?s.diff:"easy");activeSlotId=s.slotId;activeScn=null;autoRenew=!!s.autoRenew;
 budget=isSandbox()?999999:s.budget;st=s.st||[];lines=s.lines||[];uid=s.uid||1;lid=s.lid||1;day=s.day||1;acc=s.acc||0;spd=s.spd||1;owned=s.owned||{};corp=s.corp||"Bursaray";
 dep=Object.assign({yerli:0,cin:0,alman:0,kore:0,tyerli:0,tcin:0,talman:0,tkore:0},s.dep||{});led=s.led||{};hist=s.hist||[];histP=s.histP||[];histS=s.histS||[];evs=s.evs||[];crisis=s.crisis||null;nextEv=s.nextEv||5;cdn=s.cdn!=null?s.cdn:12;T=s.T||0;loan={p:+(s.loan&&s.loan.p||0),plan:(s.loan&&s.loan.plan)||null};negD=s.negD||0;
 mk=Object.assign({yerli:1,cin:1,alman:1,kore:1,tyerli:1,tcin:1,talman:1,tkore:1},s.mk||{});
 us=Object.assign({yerli:2,cin:3,alman:1,kore:2,tyerli:2,tcin:3,talman:1,tkore:1},s.us||{});
 fa=Object.assign({yerli:0,cin:0,alman:0,kore:0,tyerli:0,tcin:0,talman:0,tkore:0},s.fa||{});
 atl=s.atl||0;
 const unAll=isSandbox();
 alUnlocked=unAll||(s.alUnlocked!=null?!!s.alUnlocked:(day>=45||totalOf("alman")>0));
 nk=unAll||(s.nk!=null?!!s.nk:(day>=90||totalOf("kore")>0));
 tramUnlocked=unAll||(s.tramUnlocked!=null?!!s.tramUnlocked:(day>=50||totalOf("tyerli")>0||totalOf("tcin")>0||lines.some(l=>l.type==="tram")));
 talUnlocked=unAll||(s.talUnlocked!=null?!!s.talUnlocked:(day>=90||totalOf("talman")>0));
 tkUnlocked=unAll||(s.tkUnlocked!=null?!!s.tkUnlocked:(day>=120||totalOf("tkore")>0));
 tariff=s.tariff||"std";gp=s.gp||{};ach=s.ach||{};stat=Object.assign({maxNeg:0,loanTaken:0,councilCount:0},s.stat||{});
 sat=s.sat!=null?s.sat:74;lowSatDays=s.lowSatDays||0;ct=s.ct||null;ctOffers=s.ctOffers||[];ctCd=s.ctCd!=null?s.ctCd:4;ctWon=s.ctWon||0;
 councilCd=s.councilCd!=null?s.councilCd:20;councilUsed=Array.isArray(s.councilUsed)?s.councilUsed:[];councilChoice=null;camAnim=null;
 guideStep=s.guideStep||0;guideDone=!!s.guideDone;reportsShown=Array.isArray(s.reportsShown)?s.reportsShown:[];
 cur=null;sel=null;buildSt=false;moveSt=null;bendDrag=null;follow=null;over=false;paused=false;ST_ANAL.clear();
 st.forEach(x=>{delete x.born;x.q=x.q||0;x.lvl=x.lvl||1});
 for(const id in owned){const c=CFG[id],l=D.bl.find(x=>x.id===id);owned[id].sched=owned[id].sched||"std";owned[id].type=c?.type||owned[id].type||"metro";owned[id].ring=!!(l?.ring||c?.ring);owned[id].oneWay=!!c?.oneWay}
 lines.forEach(l=>{delete l.born;l.type=l.type||"metro";l.mode=l.mode||"surface";l.ring=!!l.ring;l.wps=l.wps||{};l.sched=l.sched||"std";l.km=lineKm(l.ids,l.ring,l.wps)});
 D.mah.forEach((h,i)=>{h.cur=(s.mah&&s.mah[i]>0)?s.mah[i]:h.pop;h.cov=0});
 started=true;$("ov").hidden=true;$("ov2").hidden=true;$("ov3").hidden=true;updSp();refresh();if(crisis&&crisis.state==="choose"){render3();$("ov3").hidden=false}ui();renderGuide();msg("");toast("💾 "+corp+" kaydı yüklendi")}
addEventListener("visibilitychange",()=>{if(document.hidden)save()});addEventListener("pagehide",save);
let gp={},ach={},stat={maxNeg:0,loanTaken:0},gnPrev=0;
const HWL=[2,3,4,5,6,8,10,12,15,20,30];
function fq(o,len){const L=len||o.km||18,fl=o.sinyal?2:3,em=(o.exp?.78:1)*(o.mode==="tunnel"?.9:1),trCnt=trainsOf(o),spdK=o.type==="tram"?3.1:2.4,hm=trCnt?((spdK*L+3)*em)/trCnt:99,hE=Math.max(o.hw||0,hm,fl);o.km=L;o.hm=hm;o.fl=fl;o.hE=hE;return o.s=Math.min(1,hm/hE)}
const freqRow=o=>{const auto=!o.hw,fl=o.fl||3,hm=o.hm||99,hE=o.hE||hm,over=!auto&&o.hw<hm-.5,sig=hm<fl-.2,pct=Math.round((o.s||1)*100);
 return `<div class="fq"><div class="fq-h"><b>⏱ Sefer sıklığı</b><span class="fq-b ${over||sig?"w":""}">${auto?"Otomatik":"Hedef "+o.hw+" dk"} · fiili ${Math.round(hE)} dk</span></div><div class="fq-bar"><i style="width:${Math.min(100,pct)}%"></i></div><div class="fq-c"><button data-a="hw" data-d="1" title="Daha seyrek">−</button><b>⏱ ${Math.round(hE)} dk</b><button class="pri" data-a="hw" data-d="-1" title="Daha sık">+</button><button data-a="hwauto" ${auto?"disabled":""}>Oto</button></div>${over?`<div class="fq-w">⚠ Aktif filo sayısı bu sıklığı kaldırmaz: filo en fazla ~${Math.round(hm)} dk'da sefer yapabilir. ${o.type==="tram"?"Tramvay seti":"Tren"} ekle ya da aralığı aç.</div>`:""}${sig?`<div class="fq-w">🚦 Sinyal sınırı: bu hatta en sık ${fl} dk'da sefer olur, fazla araçlar boşa bekliyor.</div>`:""}<small>Kapasite %${pct} · sık sefer kapasiteyi artırır ama enerji ve personel giderini yükseltir. En sık ${fl} dk${fl>2?" (Sinyalizasyon ile 2 dk)":""}.</small></div>`};
const earnT=()=>allL().reduce((a,x)=>a+x[1].earn,0),wagT=()=>allL().reduce((a,x)=>a+(x[1].type==="tram"?2*trainsOf(x[1]):x[1].wag),0)+depN("metro")+2*depN("tram");
const GL=[
{id:"pax",ic:"👥",t:"Yolcu Avcısı",d:"Günlük yolcu sayısı",v:()=>lastPax,T:[[10000,10],[25000,20],[50000,40],[100000,80],[200000,150]]},
{id:"lin",ic:"🛤",t:"Ağ Mimarı",d:"Kendi hatlarını çiz",v:()=>lines.length,T:[[1,10],[2,15],[3,25],[5,40],[8,70]]},
{id:"sta",ic:"🚉",t:"Durak Kralı",d:"Aktif istasyon sayısı",v:()=>actv.length,T:[[20,10],[40,20],[70,35],[100,60]]},
{id:"net",ic:"💰",t:"Kâr Makinesi",d:"Günlük net kazanç (₺M)",v:()=>lastNet,f:1,T:[[2,15],[4,30],[8,60],[15,100]]},
{id:"flt",ic:"🚆",t:"Filo Kaptanı",d:"Toplam vagon sayısı",v:wagT,T:[[12,10],[24,20],[48,40],[96,80]]},
{id:"ern",ic:"🏆",t:"Servet",d:"Toplam kazanç (₺M)",v:earnT,f:1,T:[[50,15],[200,30],[500,60],[1000,100]]},
{id:"day",ic:"📅",t:"Uzun Soluklu",d:"İşletme günü",v:()=>day,T:[[30,10],[100,25],[200,50],[365,100]]}];
const AC=[
{id:"a1",ic:"🎫",t:"İşletmeci",d:"İlk Bursaray hattını satın al",c:()=>ownedN()>=1},
{id:"a2",ic:"🛤",t:"İlk Hat",d:"Kendi ilk hattını aç",c:()=>lines.length>=1},
{id:"a3",ic:"🕸",t:"Ağ Ustası",d:"5 hat çiz",c:()=>lines.length>=5},
{id:"a4",ic:"👥",t:"Kalabalık Şehir",d:"Günde 100.000 yolcu taşı",c:()=>lastPax>=1e5},
{id:"a5",ic:"💎",t:"Altın Hat",d:"Günlük net ₺10M'a ulaş",c:()=>lastNet>=10},
{id:"a6",ic:"🏦",t:"Borç Kapandı",d:"Aldığın tüm kredileri öde",c:()=>stat.loanTaken&&loan.p<=0},
{id:"a7",ic:"😅",t:"Kıl Payı",d:"15+ gün eksiye düşüp toparlan",c:()=>stat.maxNeg>=15&&negD===0&&budget>=0},
{id:"a8",ic:"💸",t:"Fiyat Ustası",d:"Bilet ×1,3+ iken hattı kârda tut",c:()=>allL().some(x=>(x[1].fare||1)>=1.3&&x[1].total>0&&(x[1].lo||1)>=.95)},
{id:"a9",ic:"⏱",t:"Sık Sefer",d:"Bir hatta 4 dk veya daha sık sefer sağla",c:()=>allL().some(x=>x[1].wag&&x[1].hE<=4)},
{id:"a10",ic:"🏭",t:"Bakım Ustası",d:"Atölyeyi 3. seviyeye çıkar",c:()=>atl>=3},
{id:"a11",ic:"🌍",t:"Karma Filo",d:"3 farklı üreticiden vagon bulundur",c:()=>VK().filter(k=>totalOf(k)>0).length>=3},
{id:"a12",ic:"🚆",t:"Filo Komutanı",d:"48 vagonluk filoya ulaş",c:()=>wagT()>=48},
{id:"a13",ic:"📅",t:"Bir Yıl",d:"365 gün hayatta kal",c:()=>day>=365},
{id:"a14",ic:"🔁",t:"Aktarma Merkezi",d:"Bursaray'a bağlanan bir hat aç",c:()=>lines.some(l=>l.netInfo?l.netInfo.bur:l.bonus>1.3)},
{id:"a15",ic:"🚊",t:"Tramvay Şefi",d:"3 ayrı tramvay hattı işlet",c:()=>(lines.filter(l=>l.type==="tram").length+Object.values(owned).filter(o=>o.type==="tram").length)>=3},
{id:"a16",ic:"🏛",t:"Konsey Stratejisti",d:"3 Ulaşım Konseyi kararı al",c:()=>(stat.councilCount||0)>=3},
{id:"a17",ic:"🔄",t:"Çember Mimarı",d:"Bir çember (ring) hat aç",c:()=>lines.some(l=>!!l.ring)}];
const gi=g=>gp[g.id]||0,gdone=g=>gi(g)>=g.T.length,gready=g=>!gdone(g)&&g.v()>=g.T[gi(g)][0];
function gbadge(){const n=GL.filter(gready).length,ic=$("gbIc"),bg=$("gbBg");if(ic&&!ic.innerHTML)ic.innerHTML=IC.target;if(bg){if(n){bg.hidden=false;bg.textContent=n+" ödül"}else bg.hidden=true}updMgDot()}
function chk(){if(!started)return;let na=0;if(!isSandbox()){AC.forEach(a=>{if(!ach[a.id]&&a.c()){ach[a.id]=day;na++;setTimeout(()=>{SFX.ach();toast("🏅 Başarım açıldı: "+a.ic+" "+a.t)},1200)}})}const n=GL.filter(gready).length;if(n>gnPrev)setTimeout(()=>{if(!na)SFX.coin();toast("🎯 Hedef tamamlandı! Ödülünü almak için Yönetim → Hedefler düğmesine dokun.")},2600);gnPrev=n;gbadge()}
const LOCK_SVG='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2.5" fill="currentColor" fill-opacity=".14"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/><circle cx="12" cy="16" r="1.2" fill="currentColor" stroke="none"/></svg>';
function goalsHtml(){const tab=pv.tab==="a"?"a":"g",na=AC.filter(a=>ach[a.id]).length,nr=GL.filter(gready).length,tot=GL.reduce((a,g)=>a+gi(g),0),mx=GL.reduce((a,g)=>a+g.T.length,0);
 let h=`<div class="gh2"><div class="gh2-t"><div><h2>🎯 Hedefler &amp; Başarımlar</h2><small>Görevleri tamamla, ödülleri topla</small></div><button data-a="close">✕</button></div><div class="gh2-s"><div><b>${tot}/${mx}</b><small>Hedef kademesi</small></div><div><b>${na}/${AC.length}</b><small>Başarım</small></div><div><b>${nr}</b><small>Alınacak ödül</small></div></div></div><div class="nav"><button class="${tab==="g"?"on":""}" data-a="gtab" data-t="g">🎯 Hedefler${nr?` <i class="dot">${nr}</i>`:""}</button><button class="${tab==="a"?"on":""}" data-a="gtab" data-t="a">🏅 Başarımlar</button></div>`;
 if(tab==="g")h+=GL.map(g=>{const i=gi(g),dn=gdone(g),T=g.T[Math.min(i,g.T.length-1)],v=g.v(),p=dn?1:Math.max(0,Math.min(1,v/T[0])),rd=gready(g),vs=g.f?v.toFixed(1):fmt(Math.round(v));
  return `<div class="gl${rd?" rdy":""}${dn?" dn":""}"><div class="gl-i">${g.ic}</div><div class="gl-b"><div class="gl-t"><b>${g.t}</b><span class="gl-pips">${g.T.map((x,j)=>`<i class="${j<i?"on":j===i&&rd?"rd":""}"></i>`).join("")}</span></div><small>${dn?"Tüm kademeler tamamlandı 🏆":g.d+" · hedef "+fmt(T[0])}</small><div class="gl-bar"><i style="width:${Math.round(p*100)}%"></i><span>${dn?"✔":vs+" / "+fmt(T[0])}</span></div></div><div class="gl-r">${dn?"":rd?`<button class="pri" data-a="claim" data-g="${g.id}">🎁 +₺${T[1]}M</button>`:`<span class="gl-rw">₺${T[1]}M</span>`}</div></div>`}).join("");
 else h+=`<div class="ag">`+AC.map(a=>{const u=ach[a.id];return `<div class="ac${u?" u":""}"><div class="ac-medal">${u?a.ic+'<span class="ac-rib"><i></i><i></i></span>':LOCK_SVG}</div><b>${a.t}</b><small>${a.d}</small><span class="ac-tag">${u?`Gün ${u}`:"Kilitli"}</span></div>`}).join("")+`</div>`;
 return h}
function autoBalanceLine(lk,silent){
 const o=owned[lk]||lines.find(l=>l.key===lk);if(!o)return{added:0,removed:0};
 const isB=isPre(lk),cat=o.type==="tram"?"tram":"metro",runC=()=>{fs(o);fq(o,o.km);if(isB)calcB(lk,1);else calcU(o,1)};
 let added=0,removed=0,guard=0;
 runC();
 while((o.pk||0)<0.30&&trainsOf(o)>1&&guard<6){
  guard++;
  const ks=ALL_VK(cat).filter(k=>(o.tr[k]||0)>0).sort((a,b)=>VT[a].cap-VT[b].cap);
  if(!ks.length)break;
  const k=ks[0];
  o.tr[k]--;dep[k]=(dep[k]||0)+VT[k].setSize;removed++;
  runC();
 }
 guard=0;
 const depKeys=()=>VK(cat).filter(k=>(dep[k]||0)>=VT[k].setSize).sort((a,b)=>VT[b].cap-VT[a].cap);
 while((o.pk||0)>0.92&&guard<6){
  guard++;
  const ks=depKeys();if(!ks.length)break;
  const k=ks[0];
  dep[k]-=VT[k].setSize;o.tr[k]=(o.tr[k]||0)+1;added++;
  runC();
  if((o.pk||0)<=0.88)break;
 }
 if(!silent&&(added||removed)){refresh();ui()}
 return{added,removed};
}
function autoBalanceAll(){
 let added=0,removed=0;
 allL().forEach(([,,,k])=>{const r=autoBalanceLine(k,true);added+=r.added;removed+=r.removed});
 if(added+removed>0){
  refresh();SFX.up();
  toast(`⚡ Filo dengelendi: ${added} araç eklendi, ${removed} atıl araç depoya çekildi.`);
  ui();render2();
 }else if(allL().some(([,o])=>(o.pk||0)>0.92)){
  SFX.warn();toast("⚠ Yoğun hatlar için depoda uygun boş araç yok. Vagon Piyasası'ndan satın alabilirsin.");
 }else{
  SFX.click();toast("✅ Tüm hatların filosu zaten dengeli görünüyor.");
 }
}
function listHtml(hd){const ls=allL(),tp=ls.reduce((a,x)=>a+x[1].pax,0),tn=ls.reduce((a,x)=>a+x[1].total,0),tw=ls.reduce((a,x)=>a+trainsOf(x[1]),0);
 const card=(n,o,c,k,bur)=>{const pk=Math.round(Math.min(1.5,o.pk||0)*100),sv=o.total<0?["bad","📉 Zararda"]:pk>100?["warn","🔥 Yoğun"]:["ok","✅ Kârda"],col=pk<70?"#2a9d8f":pk<90?"#f4a261":"#e63946",R=26,C=2*Math.PI*R,trm=o.type==="tram",tCnt=trainsOf(o),sc=schedOf(o);
  return `<div class="gc" style="--c:${c}"><div class="gc-h"><span class="gc-i">${trm?"🚊":"🚇"}</span><b>${n}${o.ring?" ↻":""}</b><span class="gc-b ${sv[0]}">${sv[1]}</span></div><div class="gc-m"><svg viewBox="0 0 64 64" width="64" height="64"><circle cx="32" cy="32" r="${R}" fill="none" stroke="var(--bd)" stroke-width="7"/><circle cx="32" cy="32" r="${R}" fill="none" stroke="${col}" stroke-width="7" stroke-linecap="round" stroke-dasharray="${(Math.min(1,pk/100)*C).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 32 32)"/><text x="32" y="36" text-anchor="middle" font-size="14" font-weight="800" fill="currentColor">%${pk}</text></svg><div class="gc-s"><div><small>Yolcu/gün</small><b>${fmt(o.pax)}</b></div><div><small>Net/gün</small><b style="color:${o.total<0?"#e63946":"#2a9d8f"}">${o.total>=0?"+":""}${MM(o.total)}</b></div></div></div><div class="gc-f"><span>${trm?"🚊 "+tCnt+" set":"🚆 "+tCnt+" tren"}</span><span>⏱ ${hwOf(o)} dk</span><span>🎟 ×${(o.fare||1).toFixed(1)}</span>${sc.id!=="std"?`<span class="gc-sched">${sc.ic} ${sc.tag}</span>`:""}${upIcons(o)}<button class="pri" data-a="open" data-id="${k}">Yönet ▸</button></div></div>`};
 const ownedItems=[
  ...D.bl.filter(l=>owned[l.id]).map(l=>{const o=owned[l.id];return{type:CFG[l.id].type==="tram"?"tram":"metro",o,pk:o.pk||0,pax:o.pax||0,net:o.total||0,html:card(l.title,o,CFG[l.id].color,l.id,1)}}),
  ...lines.map(l=>({type:l.type==="tram"?"tram":"metro",o:l,pk:l.pk||0,pax:l.pax||0,net:l.total||0,html:card(l.name,l,l.color,l.key,0)}))
 ];
 const fItems=ownedItems.filter(it=>{
  if(listFilter==="metro")return it.type==="metro";
  if(listFilter==="tram")return it.type==="tram";
  if(listFilter==="warn")return it.pk>0.92||it.net<0;
  return true;
 });
 if(listSort==="net")fItems.sort((a,b)=>b.net-a.net);
 else if(listSort==="pax")fItems.sort((a,b)=>b.pax-a.pax);
 else if(listSort==="pk")fItems.sort((a,b)=>b.pk-a.pk);
 const lockedBur=(listFilter==="warn")?"":D.bl.filter(l=>!owned[l.id]&&(listFilter==="all"||(listFilter==="tram"?CFG[l.id].type==="tram":CFG[l.id].type!=="tram"))).map(l=>{const c=CFG[l.id],bp=burPrice(l.id),bn=burEstNet(l.id),un=isBlUnlocked(l.id),rem=Math.max(1,50-day);return `<div class="gc lock" style="--c:${c.color}"><div class="gc-h"><span class="gc-i">${un?(c.type==="tram"?"🚊":"🚇"):"🔒"}</span><b>${l.title}${c.ring?" ↻":""}</b></div><div class="gc-lk"><span>${l.sts.length} durak · ${l.km} km${c.type==="tram"?" · Tramvay":""}</span><span>${un?`~₺${bn}M/gün · geri ödeme ~${bp?Math.round(bp/bn):0} gün`:`🔒 Tramvay Çağı ile açılır (50. Gün · kalan ${rem}g)`}</span></div><div class="gc-f"><span class="gc-p">${bp?"₺"+bp+"M":"Ücretsiz"}</span><button class="${un?"pri":""}" data-b="${l.id}">${un?(bp?"Satın al":"Hattı Aç"):`🔒 50. Günde Açılır`}</button></div></div>`}).join("");
 const warnCnt=ownedItems.filter(it=>it.pk>0.92||it.net<0).length;
 const fltBar=`<div class="lflt"><div class="lflt-g"><button class="${listFilter==="all"?"on":""}" data-a="lflt" data-f="all">Tümü (${ownedItems.length})</button><button class="${listFilter==="metro"?"on":""}" data-a="lflt" data-f="metro">🚇 Metro</button><button class="${listFilter==="tram"?"on":""}" data-a="lflt" data-f="tram">🚊 Tramvay</button><button class="${listFilter==="warn"?"on":""}" data-a="lflt" data-f="warn">⚠ Uyarı (${warnCnt})</button></div><div class="lflt-r"><select id="lsrt" class="lsel" aria-label="Sırala"><option value="def"${listSort==="def"?" selected":""}>Varsayılan</option><option value="net"${listSort==="net"?" selected":""}>💰 En Kârlı</option><option value="pax"${listSort==="pax"?" selected":""}>👥 En Yoğun Yolcu</option><option value="pk"${listSort==="pk"?" selected":""}>📦 Tepe Doluluk</option></select><button class="pri" data-a="autoBalanceAll" ${ls.length?"":"disabled"} title="Depodaki araçları yoğun hatlara aktar, atıl araçları geri çek">⚡ Filoyu Dengele</button></div></div>`;
 return hd("🚇 Hatlarım")+`<div class="gsum"><div><b>${ls.length}</b><small>Hat</small></div><div><b>${fmt(tp)}</b><small>Yolcu/gün</small></div><div><b style="color:${tn<0?"#e63946":"#2a9d8f"}">${MM(tn)}</b><small>Net/gün</small></div><div><b>${tw}</b><small>Aktif Araç</small></div></div>`+fltBar+`<div class="gcs">`
 +fItems.map(x=>x.html).join("")+lockedBur+(!fItems.length&&!lockedBur?'<div class="gc empty">Seçilen filtreye uygun aktif hat bulunamadı.</div>':(!lines.length&&listFilter==="all"?'<div class="gc empty">Henüz kendi hattın yok. Haritada istasyon kur, 🚇 Hat Çiz ile bağla!</div>':""))+"</div>"
 +(evs.length?`<p style="margin:12px 0 0;font-size:12px;color:var(--mut)"><b>Aktif etkiler:</b> ${evs.map(e=>`<span class="chp">${[...e.x][0]} ${e.left} gün</span>`).join("")}</p>`:"")}
const upIcons=o=>UPG.filter(u=>o[u.k]).map(u=>`<img class="upm" src="${UIC[u.k]}" alt="" title="${u.name}">`).join("");
const fareCard=o=>{const f=o.fare||1;return `<div class="fq"><div class="fq-h"><b>🎟 Bilet fiyatı</b><span class="fq-b ${(o.lo||1)<.95?"w":""}">Sadakat %${Math.round((o.lo||1)*100)}</span></div><div class="fq-c"><button data-a="fare" data-d="-1">−</button><b>×${f.toFixed(1)}</b><button class="pri" data-a="fare" data-d="1">+</button></div><small>Yüksek fiyat daha çok gelir getirir ama yolcu ve sadakati düşürür; ×1,3 üstü uzun vadede risklidir.</small></div>`};
function stationTransfers(id,selfKey){const tr=[];
 lines.forEach(l=>{if(l.key!==selfKey&&l.ids.includes(id))tr.push({name:l.name,color:l.color,active:true})});
 if(typeof id==="string"&&BSM[id])BSM[id].ln.forEach(bk=>{if(bk!==selfKey)tr.push({name:bk,color:CFG[bk].color,active:!!owned[bk]})});
 return tr}
function lineStationStats(lineKey){
 const isB=isPre(lineKey),o=isB?owned[lineKey]:lines.find(l=>l.key===lineKey);
 const sts=isB?(D.bl.find(x=>x.id===lineKey)?.sts.map(a=>BSM["b:"+a[0]]).filter(Boolean)||[]):(o?o.ids.map(S).filter(Boolean):[]);
 if(!o||!sts.length)return[];
 const rows=sts.map((s,idx)=>{
  const an=ST_ANAL.get(s.id),bl=an&&an.byLine.get(lineKey);
  const mah=bl?bl.mah:0,poi=bl?bl.poi:0,tr=stationTransfers(s.id,lineKey);
  const trMul=tr.length?1.22:1,raw=(mah+poi)*trMul;
  return{idx,id:s.id,s,isBS:typeof s.id==="string",lvl:s.lvl||1,mah,poi,tr,raw,qNow:Math.floor(s.q||0),qMax:s.qMax||12};
 });
 const rawSum=rows.reduce((a,r)=>a+r.raw,0)||1,totPax=o.pax||0;
 rows.forEach(r=>{
  r.pax=Math.round(totPax*(r.raw/rawSum));
  r.pct=totPax?Math.round((r.pax/totPax)*100):0;
  const qp=r.qMax?r.qNow/r.qMax:0;
  r.bottleneck=qp>=0.75||(r.pct>=26&&(o.pk||0)>0.92);
  r.weak=rows.length>=3&&r.pct<=5&&r.raw<250;
 });
 return rows;
}
function routeStripHtml(selfKey,I){const preObj=I.bur?D.bl.find(x=>x.id===selfKey):null,sts=I.bur?preObj.sts.map(a=>BSM["b:"+a[0]]).filter(Boolean):I.o.ids.map(S).filter(Boolean),isRing=!!((I.o&&I.o.ring)||(preObj&&preObj.ring));
 if(!sts.length)return"";
 const stats=lineStationStats(selfKey),statMap=new Map(stats.map(r=>[r.id,r]));
 const scored=sts.map(s=>{const tr=stationTransfers(s.id,selfKey),st=statMap.get(s.id);let sc=st?st.pax:0;
  if(!st){for(const h of D.mah){const d=Math.hypot((h[1]-s.lo)*KX,h[2]-s.la)*111.32;if(d<1.2)sc+=h.cur*(1-d/1.2)*.22}
   for(const p of POIS){const d=km(p,s);if(d<1)sc+=p.base*(1-d)*.45}
   if(tr.length)sc*=1.28}return{s,tr,sc,st}});
 const topN=sts.length>=10?3:2,topSet=new Set([...scored].sort((a,b)=>b.sc-a.sc).slice(0,topN).filter(x=>x.sc>0).map(x=>x.s.id));
 return `<div class="rstrip-wrap"><div class="rstrip-hd"><b>🛤 Canlı Güzergâh Şeridi${isRing?' <span class="ring-tag">↻ Çember Ring</span>':""}</b><small>${sts.length} durak · ${I.o.km?I.o.km.toFixed(1)+" km · ":""}★ yoğun</small></div><div class="rstrip" style="--lc:${I.color}"><div class="rstrip-track"><div class="rstrip-line"></div>`+
  scored.map(({s,tr,st})=>{const top=topSet.has(s.id),hub=tr.length>0,
   paxLbl=st&&st.pax>0?(st.pax>=1000?(st.pax/1000).toFixed(1).replace(/\.0$/,"")+"k":st.pax):"",
   tit=s.name+(st?` · ${fmt(st.pax)} yolcu/gün (%${st.pct})`:"")+(hub?" · Aktarma: "+tr.map(t=>t.name).join(", "):"")+(top?" · Yüksek yolcu talebi":"");
   return `<div class="rst${top?" is-top":""}" title="${tit}"><div class="rst-x">${tr.map(t=>`<i style="background:${t.color};opacity:${t.active?1:.45}"></i>`).join("")}</div><span class="rst-dot${hub?" hub":""}${top?" top":""}"></span><span class="rst-nm">${s.name}${top?'<span class="rst-star">★</span>':""}</span>${paxLbl?`<span class="rst-pax">${paxLbl}</span>`:""}</div>`}).join("")+
  (isRing?`<div class="rst" title="Çember hat: ${sts[0].name} durağına bağlanır"><div class="rst-x"></div><span class="rst-dot" style="border-style:dashed"></span><span class="rst-nm">↻ ${sts[0].name}</span></div>`:"")+
 `</div></div></div>`}
function schedCardHtml(o){
 const sc=schedOf(o),slots=[["06-09",sc.bars[0],1],["09-17",sc.bars[1],0],["17-20",sc.bars[2],1],["20-24",sc.bars[3],0]];
 return `<div class="sched-box"><div class="sched-hd"><b>🕒 Vardiya &amp; Zaman Çizelgesi</b><span class="fq-b">${sc.ic} ${sc.n}</span></div>`+
  `<div class="sched-24h">${slots.map(([lbl,val,pk])=>`<div class="sched-slot${pk?" pk":""}"><div class="sched-slot-bar"><i style="height:${val}%"></i></div><small>${lbl}</small></div>`).join("")}</div>`+
  `<div class="sched-grid">${Object.values(SCHEDULES).map(v=>`<button class="sched-btn${sc.id===v.id?" on":""}" data-a="sched" data-sc="${v.id}"><b>${v.ic} ${v.n}</b><small>${v.d}</small></button>`).join("")}</div></div>`;
}
function stationAnalHtml(lineKey,I){
 const rows=lineStationStats(lineKey);if(!rows.length)return"";
 const sortTop=pv.stSort==="top",mxPax=Math.max(1,...rows.map(r=>r.pax)),sorted=sortTop?[...rows].sort((a,b)=>b.pax-a.pax):rows;
 const topRow=[...rows].sort((a,b)=>b.pax-a.pax)[0],botCnt=rows.filter(r=>r.bottleneck).length,weakCnt=rows.filter(r=>r.weak).length;
 return `<div class="stan-wrap"><div class="stan-hd"><b>📊 Durak Bazlı Yolcu Analizi</b><button class="stan-sort" data-a="stSort">${sortTop?"🔥 En Yoğundan Sakin'e ▾":"🛤 Güzergâh Sırası ▾"}</button></div>`+
  `<div class="stan-sum">${topRow?`<span class="stan-pill top">★ Zirve: <b>${topRow.s.name}</b> (%${topRow.pct})</span>`:""}${botCnt?`<span class="stan-pill warn">⚠ ${botCnt} darboğaz durağı</span>`:""}${weakCnt?`<span class="stan-pill">📉 ${weakCnt} düşük talep</span>`:""}</div>`+
  `<div class="stan-list">`+sorted.map(r=>{
   const w=Math.max(3,Math.round(r.pax/mxPax*100)),totSrc=Math.max(1,r.mah+r.poi),mPct=Math.round(r.mah/totSrc*100),pPct=100-mPct;
   const nxCost=!r.isBS?(r.lvl===1?Math.round(12*diffMult()):r.lvl===2?Math.round(22*diffMult()):0):0;
   const barCol=r.bottleneck?"#ef4444":I.color;
   return `<div class="stan-row${r.bottleneck?" bot":""}"><div class="stan-top"><span class="stan-nm"><span class="stan-idx">${r.idx+1}</span>${r.s.name}${r.lvl>1?" "+"★".repeat(r.lvl-1):""}${r.tr.length?" 🔀":""}</span><span class="stan-val">${fmt(r.pax)} <small style="font-family:system-ui;color:var(--mut);font-weight:600">(%${r.pct})</small></span></div>`+
    `<div class="stan-bar"><i style="width:${w}%;background:${barCol}"></i></div>`+
    `<div class="stan-meta"><span class="stan-srcs"><span class="stan-tag">🏘 Mah. %${mPct}</span>${pPct>0?`<span class="stan-tag">📍 Çekim %${pPct}</span>`:""}${r.qNow>0?`<span class="stan-tag">⏳ ${r.qNow}/${r.qMax}</span>`:""}${r.bottleneck?`<span class="stan-tag bot">⚠ Darboğaz</span>`:""}${r.weak?`<span class="stan-tag weak">Zayıf</span>`:""}</span>`+
    `<span class="stan-acts"><button data-a="jumpSt" data-id="${r.id}" title="Haritada gör">📍</button>${nxCost?`<button class="pri" data-a="upstLine" data-id="${r.id}" ${!hasMoney(nxCost)?"disabled":""} title="Durağı Sv.${r.lvl+1}'e yükselt">⬆ ₺${nxCost}M</button>`:""}</span></div></div>`;
  }).join("")+`</div></div>`;
}
function lineHtml(hd){const I=info(pv.id),o=I.o,bur=I.bur,tab=pv.tab==="dev"?"dev":"info",pk=Math.round(Math.min(1.5,o.pk||0)*100),col=pk<70?"#2a9d8f":pk<90?"#f4a261":"#e63946",cr=crisis&&crisis.line===pv.id&&crisis.state==="active",
 sv=cr?["warn","⚠ Kriz"]:o.total<0?["bad","📉 Zararda"]:pk>100?["warn","🔥 Yoğun"]:["ok","✅ Kârda"],R=42,C=2*Math.PI*R,trm=o.type==="tram",tun=!bur&&!trm&&o.mode==="tunnel",tCnt=trainsOf(o);
 const subTag=(bur?(trm?"🚊 BURTRAM HATTI":"🚇 BURSARAY HATTI"):(trm?"🚊 TRAMVAY HATTI":(tun?"🕳 YERALTI TÜNEL METRO":"🚇 YERÜSTÜ METRO")))+(o.ring?" · 🔄 RİNG":"");
 let h=`<div class="lh" style="--c:${I.color}"><button data-a="back">←</button><div class="lh-t"><small>${subTag}</small><h2>${I.title}</h2></div><span class="gc-b ${sv[0]}">${sv[1]}</span><button data-a="close">✕</button></div><div class="nav"><button class="${tab==="info"?"on":""}" data-a="tab" data-t="info">📊 Genel</button><button class="${tab==="dev"?"on":""}" data-a="tab" data-t="dev">🔧 Geliştirme</button></div>`;
 if(tab==="dev")return h+`<div class="dvh"><span>💰 Kasa</span><b>${isSandbox()?"∞ Sınırsız":"₺"+Math.round(budget*10)/10+"M"}</b></div>`+UPG.map(u=>{const up=upgPrice(u),g=u.k==="bufe"?o.pax*4/1e6:u.k==="otomat"?o.pax*2/1e6:0,
  ef=g?`+₺${g.toFixed(2)}M/gün · geri ödeme ~${Math.round(up/Math.max(.001,g))} gün`:"Yolcu +%8 · Kapasite +%15 · en sık sefer 2 dk";
  return `<div class="up${o[u.k]?" own":""}"><div class="upi"><img src="${UIC[u.k]}" alt=""></div><div class="upb"><b>${u.name}</b><small>${u.desc}</small>${o[u.k]?"":`<span class="upe">${ef}</span>`}</div><div class="upr">${o[u.k]?'<span class="own-b">✔ Kurulu</span>':`<button class="pri" data-a="up" data-k="${u.k}" ${!hasMoney(up)?"disabled":""}>₺${up}M</button>`}</div></div>`}).join("");
 const msg=cr?"Kriz nedeniyle kapasite düşük!":pk>100?"Tepe saatlerde kapasite yetmiyor. "+(trm?"Tramvay seti":"Tren")+" ekle ya da Pik Odaklı çizelge seç.":pk>=85?"Tepe saatte hat dolmak üzere.":pk<50?"Hat seyrek kullanılıyor (Ekonomik çizelge maliyet düşürür).":"Doluluk dengeli.";
 const cat=trm?"tram":"metro",avDep=VK(cat).find(k=>(dep[k]||0)>=VT[k].setSize),qBuyK=trm?(isUnlocked("talman")?"talman":"tyerli"):(isUnlocked("alman")?"alman":"yerli"),qCost=Math.round(vp(qBuyK)*VT[qBuyK].setSize*10)/10;
 const qBtn=avDep?`<button class="pri" data-a="qadd" data-id="${pv.id}" data-t="${avDep}">➕ Depodan ${VT[avDep].ic} Ekle</button>`:`<button class="pri" data-a="qbuyadd" data-id="${pv.id}" data-t="${qBuyK}" ${!hasMoney(qCost)?"disabled":""}>🛒 ${VT[qBuyK].ic} Al &amp; Ekle ₺${qCost}M</button>`;
 if(!bur)h+=`<div class="lcustom"><div class="lcustom-r"><small style="color:var(--mut);font-weight:700">✏️ Hat Adı &amp; Rengi</small><input id="lname" class="lcustom-in" maxlength="24" value="${I.title.replace(/"/g,"&quot;")}" aria-label="Hat adı"></div><div class="sws">${L_COLS.map(c=>`<button class="sw${I.color.toLowerCase()===c?" on":""}" style="background:${c}" data-a="lcol" data-c="${c}" title="Renk seç"></button>`).join("")}<input type="color" id="lcolp" class="sw-pick" value="${I.color}" title="Özel renk seç"></div></div>`;
 const canBal=(pk>92&&!!avDep)||(pk<30&&tCnt>1),balBtn=canBal?`<button class="${pk>92?"pri":""}" data-a="autoBalLine" data-id="${pv.id}" title="Bu hattın filosunu otomatik dengele">⚡ Dengele</button>`:"";
 h+=routeStripHtml(pv.id,I)+`<div class="hero"><div class="ring"><svg viewBox="0 0 100 100" width="104" height="104"><circle cx="50" cy="50" r="${R}" fill="none" stroke="var(--bd)" stroke-width="10"/><circle cx="50" cy="50" r="${R}" fill="none" stroke="${col}" stroke-width="10" stroke-linecap="round" stroke-dasharray="${(Math.min(1,pk/100)*C).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 50 50)"/><text x="50" y="57" text-anchor="middle" font-size="22" font-weight="800" fill="currentColor">%${pk}</text></svg><small>Tepe doluluk</small></div><div class="hs"><div><small>👥 Yolcu / gün</small><b>${fmt(o.pax)}</b></div><div><small>💰 Net / gün</small><b style="color:${o.total<0?"#e63946":"#2a9d8f"}">${o.total>=0?"+":""}${MM(o.total)}</b></div><div><small>📦 Kapasite / gün</small><b>${fmt(Math.round(o.cap))}</b></div></div></div><p class="hmsg">${msg}</p>
 <div class="fl"><span>${trm?"🚊":"🚆"} <b>${tCnt}</b> ${trm?"tramvay seti":"tren"}</span>${trm?"":`<span>🚃 <b>${o.wag}</b> vagon</span>`}<span>⏱ <b>${hwOf(o)}</b> dk</span>${qBtn}${balBtn}<button data-a="focusLine" data-id="${pv.id}" title="Kamerayı bu hatta odakla">📍 Gör</button><button data-a="follow" ${tCnt<1?"disabled":""} title="Haritada bu hattın aracını takip et">🎥 Takip</button><button data-a="hq" data-f="1">🏢 Filo</button></div><div class="lops"><button class="lop${o.exp?" on":""}" data-a="lexp"><div><strong>⚡ Ekspres Hat</strong><small>Hız +%38 · Sefer süresi −%22 · Enerji +%15</small></div><span class="lop-st">${o.exp?"AÇIK":"KAPALI"}</span></button><button class="lop${o.night?" on":""}" data-a="lnight"><div><strong>🦉 Gece Seferi</strong><small>Talep +%12 · +😊 Memnuniyet · Gider +%18</small></div><span class="lop-st">${o.night?"AÇIK":"KAPALI"}</span></button></div>${schedCardHtml(o)}${!bur&&o.netInfo&&o.netInfo.pct>0?`<p class="hmsg" style="margin-top:0">🔁 <b>Ağ aktarma bonusu: +%${o.netInfo.pct}</b> · ${o.netInfo.netLines} hatlı ağ${o.netInfo.uDirect?` (${o.netInfo.uDirect} hat kesişimi)`:""}${o.netInfo.reachBur?" · Bursaray bağlantılı":""}</p>`:""}${freqRow(o)}${fareCard(o)}${stationAnalHtml(pv.id,I)}`;
 if(upIcons(o))h+=`<div class="fl"><small style="color:var(--mut)">Kurulu geliştirmeler</small>${upIcons(o)}</div>`;
 if(!bur)h+=`<div class="da" style="margin-top:10px;flex-wrap:wrap">${!cur&&!o.ring?`<button class="pri" data-a="ext">➕ Hattı Uzat</button>`:""}${!cur?`<button data-a="ins">📍 Ara Durak Ekle</button>`:""}${!cur?`<button data-a="bend">〰️ Güzergâhı Bük</button>`:""}<button class="danger" data-a="del">🗑 Hattı sil · ₺${Math.round(o.segs.reduce((x,y)=>x+y,0)/2)}M iade</button></div>`;
 return h}
function toast(t){const e=$("toast");e.textContent=t;e.classList.add("show");clearTimeout(tt);tt=setTimeout(()=>e.classList.remove("show"),6500)}
function resize(){const r=wrap.getBoundingClientRect();dpr=Math.min(1.5,window.devicePixelRatio||1);W=Math.max(0,r.width||0);H=Math.max(0,r.height||0);if(W>0&&H>0){cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);cvRect=cv.getBoundingClientRect();if(!Number.isFinite(view.s)||view.s<=0||!Number.isFinite(view.x)||!Number.isFinite(view.y))home()}dirty=true}
function smoothCam(lo,la,minSpan){if(!(W>0)||!(H>0))return;const s0=minSpan?Math.max(view.s,W/minSpan):view.s,s1=Math.min(Math.max(s0,W/1.6),W/0.004),x1=X(lo)-W/2/s1,y1=Y(la)-H/2/s1;if(!started||!Number.isFinite(view.s)||view.s<=1){view.s=s1;view.x=x1;view.y=y1;camAnim=null;dirty=true;return}camAnim={sx:view.x,sy:view.y,ss:view.s,tx:x1,ty:y1,ts:s1,p:0,dur:0.35};dirty=true}
function home(){if(!(W>0)||!(H>0))return;if(!started||!Number.isFinite(view.s)||view.s<=1){view.s=W/0.34;view.x=X(L0)-W/2/view.s;view.y=Y(A0)-H/2/view.s;camAnim=null;dirty=true;return}camAnim={sx:view.x,sy:view.y,ss:view.s,tx:X(L0)-W/2/(W/0.34),ty:Y(A0)-H/2/(W/0.34),ts:W/0.34,p:0,dur:0.35};dirty=true}
new ResizeObserver(()=>{const f=W===0;resize();if(f&&W>0)home()}).observe(wrap);
const SX=lo=>(X(lo)-view.x)*view.s,SY=la=>(Y(la)-view.y)*view.s;
function path(a,close){for(let i=0;i<a.length;i+=2){const x=SX(a[i]),y=SY(a[i+1]);i?g.lineTo(x,y):g.moveTo(x,y)}if(close)g.closePath()}
function fastPath(a,close){const n=a.length;if(n<2)return;let lx=SX(a[0]),ly=SY(a[1]);g.moveTo(lx,ly);for(let i=2;i<n;i+=2){const x=SX(a[i]),y=SY(a[i+1]);if(i<n-2&&Math.abs(x-lx)<1.2&&Math.abs(y-ly)<1.2)continue;g.lineTo(x,y);lx=x;ly=y}if(close)g.closePath()}
function fastPathW(w,close){const n=w.length;if(n<2)return;const vx=view.x,vy=view.y,vs=view.s;let lx=(w[0]-vx)*vs,ly=(w[1]-vy)*vs;g.moveTo(lx,ly);for(let i=2;i<n;i+=2){const x=(w[i]-vx)*vs,y=(w[i+1]-vy)*vs;if(i<n-2&&Math.abs(x-lx)<1.2&&Math.abs(y-ly)<1.2)continue;g.lineTo(x,y);lx=x;ly=y}if(close)g.closePath()}
function zoomAt(px,py,f){
 if(!(W>0)||!(H>0)||!Number.isFinite(f)||f<=0)return;
 if(!Number.isFinite(view.s)||view.s<=0||!Number.isFinite(view.x)||!Number.isFinite(view.y))home();
 const qx=Number.isFinite(px)?px:W/2,qy=Number.isFinite(py)?py:H/2;
 const wx=view.x+qx/view.s,wy=view.y+qy/view.s;
 view.s=Math.min(Math.max(view.s*f,W/1.6),W/0.004);
 view.x=wx-qx/view.s;view.y=wy-qy/view.s;dirty=true;
}
function bboxArr(a){let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(let i=0;i<a.length;i+=2){const lo=a[i],la=a[i+1];if(lo<x0)x0=lo;if(lo>x1)x1=lo;if(la<y0)y0=la;if(la>y1)y1=la}return[x0,y0,x1,y1]}
const toWorldF32=a=>{const f=new Float32Array(a.length);for(let i=0;i<a.length;i+=2){f[i]=X(a[i]);f[i+1]=Y(a[i+1])}return f};
const toWorldBB=b=>[X(b[0]),Y(b[3]),X(b[2]),Y(b[1])];
D.dist.forEach(d=>{let b=[1e9,1e9,-1e9,-1e9];d.rings.forEach(r=>{const rb=bboxArr(r);if(rb[0]<b[0])b[0]=rb[0];if(rb[1]<b[1])b[1]=rb[1];if(rb[2]>b[2])b[2]=rb[2];if(rb[3]>b[3])b[3]=rb[3]});d._bb=b;d._wbb=toWorldBB(b);d._wRings=d.rings.map(toWorldF32)});
const RIV_BB=D.riv.map(bboxArr),RIV_W=D.riv.map(toWorldF32),RIV_WBB=RIV_BB.map(toWorldBB),ROAD_BB=D.road.map(r=>bboxArr(r[1])),ROAD_W=D.road.map(r=>toWorldF32(r[1])),ROAD_WBB=ROAD_BB.map(toWorldBB),ROADS_BY_C=[[],[],[],[],[]];
for(let ri=0;ri<D.road.length;ri++){const r=D.road[ri];if(ROADS_BY_C[r[0]])ROADS_BY_C[r[0]].push(ri)}
const OC=D.lab.find(l=>l[0]==="Osmangazi")||[0,L0,A0];
const DP={Osmangazi:885e3,"Nilüfer":565e3,"Yıldırım":640e3,Gürsu:94e3,Kestel:77e3},dsum={},LBL={};D.lab.forEach(l=>LBL[l[0]]=l);
function inRings(rs,x,y){let c=false;for(const r of rs)for(let i=0,j=r.length-2;i<r.length;j=i,i+=2){const xi=r[i],yi=r[i+1],xj=r[j],yj=r[j+1];if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)c=!c}return c}
D.mah.forEach(h=>{let hs=0;for(const ch of h[0])hs=(hs*31+ch.charCodeAt(0))%101;const dd=D.dist.find(d=>inRings(d.rings,h[1],h[2]));let dn=dd&&dd.n;if(!dn){let m=1e9;D.lab.forEach(l=>{const q=Math.hypot((l[1]-h[1])*KX,l[2]-h[2]);if(q<m){m=q;dn=l[0]}})}
 const dk=(p)=>Math.hypot((h[1]-p[1])*KX,h[2]-p[2])*111.32,d=Math.min(dk(OC),dk(LBL[dn]||OC));h.dn=dn;h.w=(.5+hs/101)*(.3+Math.exp(-d/5));dsum[dn]=(dsum[dn]||0)+h.w});
D.mah.forEach(h=>{h.pop=Math.round(DP[h.dn]*h.w/dsum[h.dn]/100)*100;h.cur=h.pop;h.cov=0});
const CITY_BLOCKS=[];
D.mah.forEach((h,mi)=>{let seed=0x9e3779b9^(mi*2654435761);
 for(let j=0;j<h[0].length;j++)seed=(Math.imul(seed^h[0].charCodeAt(j),1597334677))>>>0;
 const nxt=()=>{seed=(seed+0x6d2b79f5)>>>0;let t=Math.imul(seed^(seed>>>15),1|seed);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296};
 const dens=Math.max(0,Math.min(1,(h.pop-2500)/14500)),cnt=Math.min(14,Math.max(3,Math.round(3+dens*11))),cx=X(h[1]),cy=Y(h[2]),baseAng=(nxt()-.5)*.45;
 for(let k=0;k<cnt;k++){const a=nxt()*Math.PI*2,rad=(0.001+Math.sqrt(nxt())*0.0052)*(0.75+0.4*dens),bw=0.0004+nxt()*0.0005,bh=0.0004+nxt()*0.0005,ang=baseAng+(nxt()-.5)*.14;
  CITY_BLOCKS.push({x:cx+Math.cos(a)*rad,y:cy+Math.sin(a)*rad,w:bw,h:bh,c:Math.cos(ang),s:Math.sin(ang)})}});
function nearMah(lo,la){let b=null,m=1e9;for(const h of D.mah){const d=Math.hypot((h[1]-lo)*KX,h[2]-la);if(d<m){m=d;b=h[0]}}return m<0.06?b:null}
function km(a,b){return Math.hypot((a.lo-b.lo)*KX,a.la-b.la)*111.32}
const stTramOnly=s=>{if(!s)return false;if(typeof s.id==="string"){const ls=lines.filter(l=>l.ids.includes(s.id));return s.ln.every(k=>CFG[k]?.type==="tram")&&ls.every(l=>l.type==="tram")}const ls=lines.filter(l=>l.ids.includes(s.id));return ls.length>0&&ls.every(l=>l.type==="tram")};
function stRad(s){const trm=stTramOnly(s);return s&&s.lvl===3?(trm?1.25:1.7):s&&s.lvl===2?(trm?1.05:1.45):(trm?.85:1.2)}
function stBon(s){return 1+((s&&s.lvl||1)-1)*.15}
function pot(sts){let t=0;D.mah.forEach(h=>{let mx=0;for(const s of sts){const R=stRad(s),d=Math.hypot((h[1]-s.lo)*KX,h[2]-s.la)*111.32;if(d<R){const w=(1-d/R)*stBon(s);if(w>mx)mx=w}}if(mx>0)t+=h.cur*.22*mx});return Math.round(t)}
function projDist(w,cum,wx,wy){let bestD=0,bestR=1e9;for(let i=1;i<w.length;i++){const ax=w[i-1][0],ay=w[i-1][1],bx=w[i][0],by=w[i][1],dx=bx-ax,dy=by-ay,l2=dx*dx+dy*dy,t=l2?Math.max(0,Math.min(1,((wx-ax)*dx+(wy-ay)*dy)/l2)):0,r=Math.hypot(wx-(ax+t*dx),wy-(ay+t*dy));if(r<bestR){bestR=r;bestD=cum[i-1]+t*(cum[i]-cum[i-1])}}return bestD}
const BS=[];D.bl.forEach(l=>{l.w=[];l.cum=[0];for(let i=0;i<l.path.length;i+=2){const p=[X(l.path[i]),Y(l.path[i+1])];if(l.w.length){const q=l.w[l.w.length-1];l.cum.push(l.cum[l.cum.length-1]+Math.hypot(p[0]-q[0],p[1]-q[1]))}l.w.push(p)}
 l.stDists=l.sts.map((a,idx)=>{if(idx===0)return 0;if(!l.ring&&idx===l.sts.length-1)return l.cum[l.cum.length-1];return projDist(l.w,l.cum,X(a[1]),Y(a[2]))});
 for(let i=1;i<l.stDists.length;i++)if(l.stDists[i]<l.stDists[i-1])l.stDists[i]=l.stDists[i-1];
 if(l.ring&&l.stDists.length>=3)l.stDists.push(l.cum[l.cum.length-1]);
 l.sts.forEach(a=>{let b=BS.find(x=>x.name===a[0]);if(!b)BS.push(b={id:"b:"+a[0],name:a[0],lo:a[1],la:a[2],ln:[]});b.ln.push(l.id)})});
const BSM={};BS.forEach(b=>BSM[b.id]=b);
for(const id in CFG){const it=BS.filter(b=>b.ln.includes(id)).map(s=>({s,ks:new Set([id])}));loads(it);base[id]=it.reduce((a,b)=>a+b.load,0)}
let _stArr=null,_stLen=-1;const ST_MAP=new Map();
const S=id=>{if(typeof id==="string")return BSM[id];if(st!==_stArr||st.length!==_stLen){ST_MAP.clear();for(let i=0;i<st.length;i++)ST_MAP.set(st[i].id,st[i]);_stArr=st;_stLen=st.length}return ST_MAP.get(id)};
const ownedN=()=>Object.keys(owned).length;
const TEXT_W_CACHE=new Map();
function measureTxt(font,tx){const k=font+"|"+tx,v=TEXT_W_CACHE.get(k);if(v!==undefined)return v;g.font=font;const w=g.measureText(tx).width;if(TEXT_W_CACHE.size>1600)TEXT_W_CACHE.clear();TEXT_W_CACHE.set(k,w);return w}
function pillRect(x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.lineTo(x+w-r,y);g.arcTo(x+w,y,x+w,y+r,r);g.lineTo(x+w,y+h-r);g.arcTo(x+w,y+h,x+w-r,y+h,r);g.lineTo(x+r,y+h);g.arcTo(x,y+h,x,y+h-r,r);g.lineTo(x,y+r);g.arcTo(x,y,x+r,y,r);g.closePath()}
function pillBox(tx,x,y,opts){const o=opts||{},px=o.px!=null?o.px:4.5,ph=o.h||15,f=o.font||"600 10.5px system-ui",tw=measureTxt(f,tx);o._tw=tw;return[x-px,y-ph*.72,tw+px*2,ph]}
function fitsBox(boxes,b,pad){const p=pad==null?3:pad,b0=b[0]-p,b1=b[1]-p,b2=b[0]+b[2]+p,b3=b[1]+b[3]+p;for(let i=0;i<boxes.length;i++){const o=boxes[i];if(b0<o[0]+o[2]&&b2>o[0]&&b1<o[1]+o[3]&&b3>o[1])return false}return true}
function pillTxt(tx,x,y,opts){const o=opts||{},dk=isDark(),px=o.px!=null?o.px:4.5,ph=o.h||15,r=o.r||6,f=o.font||"600 10.5px system-ui",tw=o._tw!=null?o._tw:measureTxt(f,tx),rx=x-px,ry=y-ph*.72;g.save();if(o.alpha!=null)g.globalAlpha*=o.alpha;pillRect(rx,ry,tw+px*2,ph,r);g.fillStyle=o.bg||(dk?"rgba(17,24,39,.86)":"rgba(255,255,255,.88)");g.fill();g.lineWidth=o.hi?1.6:1;g.strokeStyle=o.bd||(dk?"rgba(255,255,255,.15)":"rgba(15,23,42,.13)");g.stroke();g.font=f;g.fillStyle=o.col||(dk?"#f1f5f9":"#0f172a");g.textAlign="left";g.fillText(tx,x,y);g.restore()}
function hubColors(id){const cols=[];if(typeof id==="string"){const b=BSM[id];if(b)b.ln.forEach(k=>{if(owned[k])cols.push(CFG[k].color)})}lines.forEach(l=>{if(l.ids.includes(id))cols.push(l.color)});return cols}
function ln(a,color,solid,key,opts){if(a.length<4)return;const o=opts||{},trm=o.type==="tram",tun=o.mode==="tunnel",ld=o.lod||1,foc=o.focus||0,dim=foc===-1?(o.dimAlpha||0.26):1,wMul=ld*(foc===1?1.16:1);
 g.save();
 if(solid&&foc===1){g.beginPath();path(a);g.strokeStyle=color;g.lineWidth=(trm?14:18)*ld;g.globalAlpha=.26;g.stroke()}
 if(solid&&isDark()){g.beginPath();path(a);g.strokeStyle=color;g.lineWidth=(trm?10.5:14)*wMul;g.globalAlpha=.2*dim;g.stroke()}
 if(solid){g.beginPath();path(a);g.strokeStyle=tun?"#1e293b":V("--card");g.lineWidth=(trm?(schem?9:7.5):(schem?12:10))*wMul;g.globalAlpha=(schem?.95:.86)*dim;g.stroke()}
 g.beginPath();path(a);g.strokeStyle=color;g.lineWidth=solid?((trm?(schem?5.2:4.2):(schem?8:6.5))*wMul):Math.max(1.8,2.6*ld);g.globalAlpha=(solid?1:(schem?.26:.5))*dim;
 g.setLineDash(solid?(tun?[11*ld,5*ld]:[]):[6*ld,6*ld]);g.stroke();g.setLineDash([]);
 if(solid&&trm){g.beginPath();path(a);g.strokeStyle="#fff";g.lineWidth=Math.max(.8,1.1*wMul);g.globalAlpha=.55*dim;g.setLineDash([4*ld,7*ld]);g.stroke();g.setLineDash([])}
 if(solid&&crisis&&crisis.line===key){g.globalAlpha=Math.max(.5,dim);g.beginPath();path(a);g.strokeStyle="#ff3b30";g.lineWidth=Math.max(2,2.8*ld);g.setLineDash([8,8]);g.lineDashOffset=-T*20;g.stroke();g.setLineDash([]);g.lineDashOffset=0}
 g.restore()}
function sampleWorldPt(w,cum,d,ring){const L=cum[cum.length-1],dd=ring?(((d%L)+L)%L):Math.max(0,Math.min(L,d));let i=1;while(i<cum.length-1&&cum[i]<dd)i++;const seg=(cum[i]-cum[i-1])||1,t=(dd-cum[i-1])/seg,a=w[i-1],b=w[i];return{wx:a[0]+(b[0]-a[0])*t,wy:a[1]+(b[1]-a[1])*t,ang:Math.atan2(b[1]-a[1],b[0]-a[0])}}
function samplePt(w,cum,d,ring){const p=sampleWorldPt(w,cum,d,ring);return{x:(p.wx-view.x)*view.s,y:(p.wy-view.y)*view.s,ang:p.ang}}
function nightK(){const h=acc/DAYSEC*24;if(h>=20.5||h<5.2)return 1;if(h>=17.5)return (h-17.5)/3;if(h>=5.2&&h<7.2)return 1-(h-5.2)/2;return 0}
function duskK(){const h=acc/DAYSEC*24;if(h>=17&&h<20.5)return Math.sin(((h-17)/3.5)*Math.PI);if(h>=5.2&&h<8)return Math.sin(((h-5.2)/2.8)*Math.PI)*.7;return 0}
function fleetList(o){
 let kStr=o.type+"|"+trainsOf(o)+"|";const tr=o.tr||{};for(const k in tr)if(tr[k]>0)kStr+=k+":"+tr[k]+",";
 if(o._flK===kStr&&o._fl)return o._fl;
 const entries=Object.entries(tr).filter(([,n])=>n>0);
 let res;
 if(!entries.length){const cnt=Math.min(18,Math.max(0,trainsOf(o))),def=o.type==="tram"?"tyerli":"yerli";res=Array.from({length:cnt},()=>def)}
 else{
  const raw=[],rem=Object.fromEntries(entries),tot=entries.reduce((a,[,n])=>a+n,0);
  for(let i=0;i<tot;i++){let best=entries[0][0],bs=-1;for(const[k,n]of entries){if(rem[k]<=0)continue;const sc=rem[k]/n;if(sc>bs){bs=sc;best=k}}rem[best]--;raw.push(best)}
  res=raw.length<=18?raw:Array.from({length:18},(_,i)=>raw[Math.floor(i*raw.length/18)]);
 }
 o._flK=kStr;o._fl=res;return res;
}
const LINE_GEOM_CACHE=new Map();
function lineGeom(l){
 const pts=l.ids.map(S).filter(Boolean);
 let key=(l.ring?"1:":"0:")+pts.length+":";
 for(let i=0;i<pts.length;i++){const s=pts[i];key+=s.id+":"+s.lo+","+s.la+"|"}
 if(l.wps){
  for(let i=1;i<pts.length;i++){const wp=l.wps[segKey(pts[i-1].id,pts[i].id)];if(wp&&wp.length)key+=i+":"+wp.map(p=>p[0].toFixed(5)+","+p[1].toFixed(5)).join(";")+";"}
  if(l.ring&&pts.length>=3){const wp=l.wps[segKey(pts[pts.length-1].id,pts[0].id)];if(wp&&wp.length)key+="R:"+wp.map(p=>p[0].toFixed(5)+","+p[1].toFixed(5)).join(";")}
 }
 const cached=LINE_GEOM_CACHE.get(l.key);
 if(cached&&cached.key===key)return cached.val;
 const w=[],cm=[0],sd=[];
 if(pts.length){
  w.push([X(pts[0].lo),Y(pts[0].la)]);sd.push(0);
  const pushSeg=(aId,bPt)=>{
   const wp=l.wps&&l.wps[segKey(aId,bPt.id)];
   if(wp)for(let j=0;j<wp.length;j++){const p=[X(wp[j][0]),Y(wp[j][1])],q=w[w.length-1];cm.push(cm[cm.length-1]+Math.hypot(p[0]-q[0],p[1]-q[1]));w.push(p)}
   const p=[X(bPt.lo),Y(bPt.la)],q=w[w.length-1],d=cm[cm.length-1]+Math.hypot(p[0]-q[0],p[1]-q[1]);
   cm.push(d);w.push(p);sd.push(d);
  };
  for(let i=1;i<pts.length;i++)pushSeg(pts[i-1].id,pts[i]);
  if(l.ring&&pts.length>=3)pushSeg(pts[pts.length-1].id,pts[0]);
 }
 const val={w,cm,sd};
 if(LINE_GEOM_CACHE.size>64)LINE_GEOM_CACHE.clear();
 LINE_GEOM_CACHE.set(l.key,{key,val});
 return val;
}
const HEADLIGHT_SPR=(()=>{const c=document.createElement("canvas");c.width=64;c.height=32;const x=c.getContext("2d"),gr=x.createLinearGradient(0,16,64,16);gr.addColorStop(0,"rgba(255,244,175,1)");gr.addColorStop(1,"rgba(255,244,175,0)");x.beginPath();x.moveTo(0,11);x.lineTo(64,0);x.lineTo(64,32);x.lineTo(0,21);x.closePath();x.fillStyle=gr;x.fill();return c})();
const NIGHT_GLOW_SPR=(()=>{const c=document.createElement("canvas");c.width=64;c.height=64;const x=c.getContext("2d"),gr=x.createRadialGradient(32,32,2,32,32,32);gr.addColorStop(0,"rgba(253,224,71,.28)");gr.addColorStop(1,"rgba(253,224,71,0)");x.fillStyle=gr;x.fillRect(0,0,64,64);return c})();
function drawCar(x,y,ang,len,wid,lineCol,lead,fll,nk0,exp,vt){
 const isTram=vt&&VT[vt]&&VT[vt].cat==="tram";
 g.save();g.translate(x,y);g.rotate(ang);
 if(fll){g.beginPath();pillRect(-len/2-2.6,-wid/2-2.6,len+5.2,wid+5.2,wid*.5);g.lineWidth=2;g.strokeStyle="#fff";g.stroke()}
 if(lead){const bLen=len*(2.3+nk0*2.1),bWid=wid*(1.35+nk0*.7);g.globalAlpha=.46+nk0*.42;g.drawImage(HEADLIGHT_SPR,len*.4,-bWid,bLen-len*.4,bWid*2);g.globalAlpha=1}
 let body="#f8fafc",trim=lineCol,cab="#1e293b",noseCol=null,edge="#0f172a";
 if(vt==="yerli"){body="#f8fafc";noseCol="#dc2626"}
 else if(vt==="cin"){body="#e2e8f0";noseCol="#0369a1"}
 else if(vt==="alman"){body="#f1f5f9";noseCol="#1d4ed8"}
 else if(vt==="kore"){body="#e2e8f0";noseCol="#16a34a"}
 else if(vt==="tyerli"){body="#dc2626";cab="#111827";edge="#7f1d1d"}
 else if(vt==="tcin"){body="#84cc16";cab="#1e293b";edge="#3f6212"}
 else if(vt==="talman"){body="#facc15";cab="#0f172a";edge="#854d0e"}
 else if(vt==="tkore"){body="#dc2626";noseCol="#1e293b";cab="#0f172a";edge="#1e293b"}
 if(vt==="alman"&&lead){
  g.beginPath();g.moveTo(-len/2,-wid/2);g.lineTo(len*.25,-wid/2);g.lineTo(len/2+1.2,-wid*.22);g.lineTo(len/2+1.2,wid*.22);g.lineTo(len*.25,wid/2);g.lineTo(-len/2,wid/2);g.closePath();
  g.fillStyle=body;g.fill();g.lineWidth=1.1;g.strokeStyle=exp?"#f59e0b":edge;g.stroke();
 }else if(vt==="tkore"&&lead){
  g.beginPath();g.moveTo(-len/2,-wid/2);g.lineTo(len*.32,-wid/2);g.lineTo(len/2+1,-wid*.28);g.lineTo(len/2+1,wid*.28);g.lineTo(len*.32,wid/2);g.lineTo(-len/2,wid/2);g.closePath();
  g.fillStyle=body;g.fill();g.lineWidth=1.1;g.strokeStyle=exp?"#f59e0b":edge;g.stroke();
 }else{
  pillRect(-len/2,-wid/2,len,wid,isTram?wid*.34:wid*.42);g.fillStyle=body;g.fill();g.lineWidth=1.15;g.strokeStyle=exp?"#f59e0b":edge;g.stroke();
 }
 if(vt==="talman"){g.fillStyle="#06b6d4";g.fillRect(-len*.34,-wid*.42,len*.52,wid*.84)}
 if(noseCol&&lead){g.fillStyle=noseCol;g.fillRect(len*.18,-wid*.42,len*.28,wid*.84)}
 if(vt==="cin"){g.fillStyle="#facc15";g.fillRect(-len*.42,wid*.22,len*.72,wid*.16)}
 // Line-color roof/identity band so routes remain crystal clear
 pillRect(-len*.42,-wid*.44,len*.84,wid*.30,1);g.fillStyle=trim;g.fill();
 // Windows
 g.fillStyle=cab;g.fillRect(-len*.30,-wid*.04,len*.58,wid*.28);
 if(vt==="kore"&&lead){g.fillStyle="#fb923c";g.fillRect(len*.30,-wid*.18,len*.11,wid*.36)}
 if(vt==="tcin"&&lead){g.fillStyle="#dc2626";g.fillRect(len*.34,-wid*.12,len*.09,wid*.24)}
 if(vt==="tyerli"&&lead){
  g.strokeStyle="#0f172a";g.lineWidth=1.2;
  g.beginPath();g.moveTo(len*.32,-wid*.45);g.lineTo(len*.48,-wid*.88);g.moveTo(len*.32,wid*.45);g.lineTo(len*.48,wid*.88);g.stroke();
  g.fillStyle="#1e293b";g.fillRect(len*.42,-wid*.96,len*.12,wid*.20);g.fillRect(len*.42,wid*.76,len*.12,wid*.20);
 }
 if(isTram&&!lead){
  g.strokeStyle="#334155";g.lineWidth=0.9;
  g.beginPath();g.moveTo(-len*.18,-wid*.26);g.lineTo(len*.18,wid*.26);g.moveTo(-len*.18,wid*.26);g.lineTo(len*.18,-wid*.26);g.stroke();
 }
 if(exp){g.fillStyle="#fbbf24";g.fillRect(-len*.42,-wid*.47,len*.84,wid*.13)}
 if(lead){g.beginPath();g.arc(len*.42,0,wid*(.17+nk0*.08),0,7);g.fillStyle=nk0>.3?"#fef9c3":"#fef08a";g.fill()}
 g.restore()}
const SCHED_CACHE=new Map();
function buildLegs(stDists,ring,dir,vBase){
 const r=ring?1:0,d0Dir=(dir||1)>0?1:-1,V0=vBase||0.015;
 const cacheKey=`${r}:${d0Dir}:${V0}:${stDists.map(x=>Math.round(x*1e6)).join(",")}`;
 const hit=SCHED_CACHE.get(cacheKey);
 if(hit)return hit;
 const legs=[],TD=0.3,nStops=ring?Math.max(1,stDists.length-1):stDists.length;let t=0;
 const add=(a,b,d,si)=>{const tm=Math.max(0.08,Math.abs(b-a)/V0),d0=t+TD,t1=d0+tm;legs.push({t0:t,d0,t1,tm,a,b,dir:d,si});t=t1};
 if(ring){
  if(d0Dir>0){for(let i=0;i<nStops;i++)add(stDists[i],stDists[i+1],1,i)}
  else{for(let i=nStops;i>0;i--)add(stDists[i],stDists[i-1],-1,i%nStops)}
 }else{
  for(let i=0;i<stDists.length-1;i++)add(stDists[i],stDists[i+1],1,i);
  for(let i=stDists.length-1;i>0;i--)add(stDists[i],stDists[i-1],-1,i);
 }
 const res={legs,C:t||1};
 if(SCHED_CACHE.size>120)SCHED_CACHE.clear();
 SCHED_CACHE.set(cacheKey,res);
 return res;
}
function evalTrainPos(sched,T,k,cnt){const C=sched.C,tau=((T+k*(C/cnt))%C+C)%C;
 for(const lg of sched.legs){if(tau<=lg.t1){if(tau<lg.d0)return{p:lg.a,dir:lg.dir,dwell:true,si:lg.si,spdQ:0,remT:0};
  const q=(tau-lg.d0)/lg.tm,e=0.5-0.5*Math.cos(Math.PI*q),spdQ=Math.sin(Math.PI*q);
  return{p:lg.a+(lg.b-lg.a)*e,dir:lg.dir,dwell:false,si:lg.si,spdQ,remT:Math.max(0,lg.t1-tau)}}}
 const last=sched.legs[sched.legs.length-1];return{p:last.b,dir:last.dir,dwell:true,si:last.dir>0?last.si+1:last.si-1,spdQ:0,remT:0}}
function activeFleetFrac(o){
 const sc=schedOf(o);
 if(sc.id==="std"||sc.id==="full")return 1;
 const h=acc/DAYSEC*24,hh=Math.floor(h),wd=(day-1)%7,rush=wd<5&&((hh>=7&&hh<9)||(hh>=17&&hh<19)),night=hh>=21||hh<6;
 if(sc.id==="peak")return rush?1:(night?0.55:0.72);
 if(sc.id==="econ")return rush?0.85:(night?0.45:0.62);
 return 1;
}
function trn(w,cum,color,fleet,stDists,lineKey,spMul,isExp,isRing,isTram,oObj,oneWay){
 const list=Array.isArray(fleet)?fleet:Array.from({length:Math.min(18,Math.max(0,fleet||0))},()=>isTram?"tyerli":"yerli");
 const cnt=list.length,L=cum[cum.length-1];if(!cnt||!(L>0))return;
 const visCnt=Math.max(1,Math.round(cnt*activeFleetFrac(oObj)));
 const sd=stDists&&stDists.length>=2?stDists:[0,L],vBase=isTram?0.0115:0.015;
 const twoWayRing=!!isRing&&!oneWay;
 const schedF=buildLegs(sd,!!isRing,1,vBase),schedR=twoWayRing?buildLegs(sd,true,-1,vBase):null;
 const trLod=0.72+0.28*Math.max(0.55,Math.min(1,0.24/Math.max(0.08,W/view.s)));
 const cars=isTram?2:(view.s>1800?3:2);
 const carLen=(isTram?Math.max(6,Math.min(9.5,view.s*.0028)):Math.max(6.5,Math.min(10.5,view.s*.0032)))*trLod;
 const carWid=Math.max(isTram?2.8:3.1,Math.min(isTram?4.6:5.2,carLen*(isTram?.48:.52)));
 const stepW=Math.min((carLen*(isTram?1.08:1.22))/view.s,L/(cars+0.4)),span=(cars-1)*stepW,nk0=nightK(),Te=T*(spMul||1);
 const cwCnt=twoWayRing?Math.ceil(cnt/2):cnt,ccwCnt=twoWayRing?Math.floor(cnt/2):0;
 for(let k=0;k<cnt;k++){
  const isF=follow&&follow.key===lineKey&&follow.k===k;
  if(k>=visCnt&&!isF)continue;
  const ccw=twoWayRing&&(k%2===1),slot=twoWayRing?Math.floor(k/2):k,grp=twoWayRing?(ccw?ccwCnt:cwCnt):cnt;
  const tr=evalTrainPos(ccw?schedR:schedF,Te,slot,grp),mid=isRing?tr.p:Math.max(span/2,Math.min(L-span/2,tr.p));
  const vt=list[k];
  for(let c=cars-1;c>=0;c--){const d=mid+tr.dir*((cars-1)/2-c)*stepW,pt=samplePt(w,cum,d,isRing),ang=pt.ang+(tr.dir<0?Math.PI:0);
   drawCar(pt.x,pt.y,ang,carLen,carWid,color,c===0,isF,nk0,isExp,vt);
   if(c===0&&lineKey)TRAIN_HITS.push({key:lineKey,k,x:pt.x,y:pt.y,color,vt})}}
}
function getFollowPt(){if(!follow)return null;
 let w,cum,sd,o,sts=[],isRing=false,oneWay=false;
 if(isPre(follow.key)){const b=D.bl.find(x=>x.id===follow.key),c=CFG[follow.key];o=owned[follow.key];if(!b||!o)return null;w=b.w;cum=b.cum;sd=b.stDists;sts=b.sts.map(a=>BSM["b:"+a[0]]);isRing=!!(b.ring||c?.ring);oneWay=!!c?.oneWay}
 else{const l=lines.find(x=>x.key===follow.key);if(!l||rvp(l)<1)return null;o=l;isRing=!!l.ring;const gm=lineGeom(l);w=gm.w;cum=gm.cm;sd=gm.sd;sts=l.ids.map(S)}
 const fl=fleetList(o),cnt=fl.length;if(!cnt||follow.k>=cnt)return null;
 const isTram=o.type==="tram",spMul=(o.exp?1.38:1)*(o.mode==="tunnel"?1.12:1),vBase=isTram?0.0115:0.015;
 const twoWayRing=isRing&&!oneWay;
 const ccw=twoWayRing&&(follow.k%2===1),slot=twoWayRing?Math.floor(follow.k/2):follow.k,grp=twoWayRing?(ccw?Math.floor(cnt/2):Math.ceil(cnt/2)):cnt;
 const sched=buildLegs(sd,isRing,ccw?-1:1,vBase),tr=evalTrainPos(sched,T*spMul,slot,grp),pt=sampleWorldPt(w,cum,tr.p,isRing);
 const nSt=sts.length||1,curStop=sts[tr.si%nSt],nxtIdx=(tr.si+(tr.dir>0?1:-1)+nSt)%nSt,nextStop=sts[nxtIdx]||curStop;
 const maxKmh=isTram?(o.exp?56:44):(o.exp?98:74)*(o.mode==="tunnel"?1.08:1),speedKmh=tr.dwell?0:Math.round(maxKmh*Math.max(.12,tr.spdQ||0));
 const etaSec=tr.dwell?0:(tr.remT||0)/(spMul*Math.max(0.5,spd));
 return{wx:pt.wx,wy:pt.wy,cnt,vt:fl[follow.k],dwell:tr.dwell,curStop,nextStop,speedKmh,etaSec,occPct:Math.round(Math.min(1.5,o.pk||o.occ||0)*100),isTram,isExp:!!o.exp}}
let lfb=0;
function updFollowBar(fp){const fb=$("fbar");if(!fb)return;if(!follow){fb.hidden=true;return}
 const col=isPre(follow.key)?CFG[follow.key].color:(lines.find(l=>l.key===follow.key)||{color:"#e63946"}).color;
 $("fdot").style.background=col;$("fdot").style.color=col;
 const info=fp||getFollowPt();
 if(info){
  const v=VT[info.vt]||{ic:"🚇",n:"Metro"},etaTxt=info.etaSec>0?` (~${Math.max(1,Math.round(info.etaSec))} sn)`:"",stTxt=info.dwell&&info.curStop?`🚉 ${info.curStop.name} durağında`:(info.nextStop?`➔ ${info.nextStop.name}${etaTxt}`:"Seferde");
  $("fttl").textContent=`${lineName(follow.key)} · #${follow.k+1}/${info.cnt} · ${v.ic} ${v.n}`;
  $("fsub").textContent=`${stTxt} · ${info.speedKmh} km/s · Doluluk %${info.occPct}`;
 }else{
  $("fttl").textContent="Takip: "+lineName(follow.key)+" · Tren #"+(follow.k+1);
  $("fsub").textContent="Canlı telemetri yükleniyor…";
 }
 fb.hidden=false}
$("fext").onclick=()=>{follow=null;updFollowBar();SFX.toggle(false);dirty=true};
$("fline").onclick=()=>{if(!follow)return;SFX.open();openLines(follow.key)};
$("fprv").onclick=()=>{if(!follow)return;const fp=getFollowPt();const cnt=(fp&&fp.cnt)||1;follow.k=(follow.k-1+cnt)%cnt;SFX.step(-1);updFollowBar();dirty=true};
$("fnxt").onclick=()=>{if(!follow)return;const fp=getFollowPt();const cnt=(fp&&fp.cnt)||1;follow.k=(follow.k+1)%cnt;SFX.step(1);updFollowBar();dirty=true};
const mkL=()=>{const c=document.createElement("canvas");return{c,x:c.getContext("2d"),ok:0,t:0,vx:0,vy:0,vw:0,vh:0,s:0,ldpr:1}},LA=mkL(),LB=mkL(),LC=mkL(),LD=mkL(),LBLK=mkL();
function invalidateLayers(){LA.ok=LB.ok=LC.ok=LD.ok=LBLK.ok=0}
function useL(L,key,fn,alpha){
 const now=performance.now(),OV=1.75,sr=L.s?view.s/L.s:1;
 const vwNow=W/view.s,vhNow=H/view.s;
 const outOfBounds=!L.ok||view.x<L.vx||view.y<L.vy||(view.x+vwNow)>(L.vx+L.vw)||(view.y+vhNow)>(L.vy+L.vh);
 const needFull=!L.ok||L.w!==W||L.h!==H||L.dpr!==dpr||L.k!==key;
 const needZoom=sr>1.5||sr<0.62||(Math.abs(sr-1)>0.16&&now-lzt>160);
 if(needFull||outOfBounds||needZoom){
  if(L.t){clearTimeout(L.t);L.t=0}
  const ldpr=Math.min(dpr,3072/Math.max(1,W*OV,H*OV));
  const pw=Math.max(1,Math.round(W*OV*ldpr)),ph=Math.max(1,Math.round(H*OV*ldpr));
  if(L.c.width!==pw||L.c.height!==ph){L.c.width=pw;L.c.height=ph}
  const vw=vwNow*OV,vh=vhNow*OV,vx=view.x-(vw-vwNow)*0.5,vy=view.y-(vh-vhNow)*0.5;
  const offX=(view.x-vx)*view.s,offY=(view.y-vy)*view.s;
  const wb=[vx-vw*0.02-0.001,vy-vh*0.02-0.001,vx+vw*1.02+0.001,vy+vh*1.02+0.001];
  const inW=b=>b[2]>=wb[0]&&b[0]<=wb[2]&&b[3]>=wb[1]&&b[1]<=wb[3];
  const og=g;g=L.x;
  try{
   g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,pw,ph);
   g.setTransform(ldpr,0,0,ldpr,offX*ldpr,offY*ldpr);
   g.lineJoin="round";g.lineCap="round";
   fn(inW,wb);
  }finally{g=og}
  Object.assign(L,{ok:1,s:view.s,w:W,h:H,dpr,ldpr,k:key,vx,vy,vw,vh});
 }
 const scNow=L.s?view.s/L.s:1;
 const dx2=(L.vx-view.x)*view.s*dpr,dy2=(L.vy-view.y)*view.s*dpr,dw2=L.vw*view.s*dpr,dh2=L.vh*view.s*dpr;
 g.save();g.setTransform(1,0,0,1,0,0);
 if(alpha!=null&&alpha<1)g.globalAlpha*=alpha;
 if(Math.abs(scNow-1)<0.0005&&L.ldpr===dpr)g.drawImage(L.c,Math.round(dx2),Math.round(dy2));
 else g.drawImage(L.c,dx2,dy2,dw2,dh2);
 g.restore();
 if(Math.abs(scNow-1)>0.16&&!L.t)L.t=setTimeout(()=>{L.t=0;dirty=true},170);
}
function simQueues(dtSim){
 if(!actv.length||dtSim<=0)return;
 const h=acc/DAYSEC*24,hh=Math.floor(h),wd=(day-1)%7,rush=wd<5&&((hh>=7&&hh<9)||(hh>=17&&hh<19));
 const dwellIds=new Set();
 for(const id in owned){
  const o=owned[id],b=D.bl.find(x=>x.id===id),c=CFG[id];if(!b||!o||!trainsOf(o))continue;
  const cnt=Math.min(18,Math.max(0,trainsOf(o)));if(!cnt)continue;
  const visCnt=Math.max(1,Math.round(cnt*activeFleetFrac(o)));
  const isRing=!!(b.ring||c?.ring),vBase=c?.type==="tram"?0.0115:0.015;
  const sched=buildLegs(b.stDists,isRing,1,vBase),Te=T*(o.exp?1.38:1);
  for(let k=0;k<visCnt;k++){const tr=evalTrainPos(sched,Te,k,cnt);if(tr.dwell){const stObj=b.sts[tr.si%b.sts.length];if(stObj)dwellIds.add("b:"+stObj[0])}}
 }
 lines.forEach(l=>{
  const cnt=Math.min(18,Math.max(0,trainsOf(l)));if(!cnt||rvp(l)<1||l.ids.length<2)return;
  const visCnt=Math.max(1,Math.round(cnt*activeFleetFrac(l)));
  const gm=lineGeom(l),vBase=l.type==="tram"?0.0115:0.015,spMul=(l.exp?1.38:1)*(l.mode==="tunnel"?1.12:1),Te=T*spMul;
  const schedF=buildLegs(gm.sd,!!l.ring,1,vBase),schedR=l.ring?buildLegs(gm.sd,true,-1,vBase):null;
  const cwCnt=l.ring?Math.ceil(cnt/2):cnt,ccwCnt=l.ring?Math.floor(cnt/2):0;
  for(let k=0;k<visCnt;k++){
   const ccw=!!l.ring&&(k%2===1),slot=l.ring?Math.floor(k/2):k,grp=l.ring?(ccw?ccwCnt:cwCnt):cnt;
   const tr=evalTrainPos(ccw?schedR:schedF,Te,slot,grp);if(tr.dwell&&l.ids[tr.si%l.ids.length]!=null)dwellIds.add(l.ids[tr.si%l.ids.length])
  }
 });
 actv.forEach(s=>{
  const mx=s.qMax||12,rt=(s.qRate||.55)*(rush?1.65:1);
  if(dwellIds.has(s.id)){
   if((s.q||0)>.15){s.q=Math.max(0,(s.q||0)-dtSim*(5.5+mx*.35));s.bf=RT}
   else s.q=0;
  }else{
   s.q=Math.min(mx,(s.q||0)+dtSim*rt);
  }
 });
}
function queueDraw(wd){
 if(wd>=0.22)return;
 const dk=isDark(),qAl=Math.min(1,(0.22-wd)/0.07),qSc=Math.max(0.68,Math.min(1,0.14/Math.max(0.06,wd)));
 const dotR=1.75*qSc,step=4.2*qSc,offX=10.5*qSc,offY=2.4*qSc;
 g.save();
 actv.forEach(s=>{
  const n=Math.min(16,Math.floor(s.q||0)),flash=s.bf!==undefined&&RT-s.bf<0.35;
  if(!n&&!flash)return;
  const x=SX(s.lo),y=SY(s.la);
  if(x<-40||y<-40||x>W+40||y>H+40)return;
  if(flash){const p=(RT-s.bf)/0.35;g.beginPath();g.arc(x,y,(8+p*10)*qSc,0,7);g.lineWidth=1.6*qSc;g.strokeStyle="rgba(34,197,94,"+((1-p)*.75*qAl)+")";g.stroke()}
  if(!n)return;
  g.globalAlpha=qAl;
  const col=n>=10?"#ef4444":n>=6?"#f59e0b":(dk?"#38bdf8":"#0284c7");
  for(let i=0;i<n;i++){
   const c=i%4,row=Math.floor(i/4);
   const dx=x-offX-c*step,dy=y-offY+row*step;
   g.beginPath();g.arc(dx,dy,dotR,0,7);g.fillStyle=col;g.fill();
  }
 });
 g.restore();
}
function atmoDraw(){const nk0=nightK(),dk0=duskK(),sc=schem?.35:1;
 if(dk0>.02){g.save();g.fillStyle=`rgba(251,146,60,${(.1*dk0*sc).toFixed(3)})`;g.fillRect(0,0,W,H);g.restore()}
 if(nk0>.02){g.save();g.fillStyle=`rgba(7,15,38,${((isDark()?.22:.30)*nk0*sc).toFixed(3)})`;g.fillRect(0,0,W,H);g.restore()}}
function draw(){
 if(!(W>0)||!(H>0))return;
 if(!Number.isFinite(view.s)||view.s<=0||!Number.isFinite(view.x)||!Number.isFinite(view.y))home();
 g=g0;TRAIN_HITS.length=0;const wd=W/view.s,TK=(DARK_NOW?1:0)+":"+(schem?1:0),nk0=nightK();
 const nowP=performance.now();
 if(view.x!==lvx||view.y!==lvy){lvx=view.x;lvy=view.y;lvt=nowP}
 if(view.s!==lvs){lvs=view.s;lzt=nowP}
 g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,W,H);g.lineJoin="round";g.lineCap="round";
 const lod=Math.max(0.55,Math.min(1,0.24/Math.max(0.08,wd)));
 useL(LA,TK,inW=>{g.save();if(schem)g.globalAlpha=.38;g.fillStyle=V("--dist");g.strokeStyle=V("--dline");g.lineWidth=1.2;
 D.dist.forEach(d=>{if(d._wbb&&!inW(d._wbb))return;g.beginPath();d._wRings.forEach(r=>fastPathW(r,true));g.fill("evenodd");g.stroke()});g.restore()});
 if(wd<0.14){const blkFade=Math.min(1,(0.14-wd)/0.06),blkAl=(schem?0.4:1)*blkFade;if(blkAl>0.01)useL(LBLK,TK,(_inW,wb)=>{g.save();g.fillStyle=V("--ink");g.globalAlpha=0.075;g.beginPath();
  for(let i=0;i<CITY_BLOCKS.length;i++){const b=CITY_BLOCKS[i];if(b.x<wb[0]||b.x>wb[2]||b.y<wb[1]||b.y>wb[3])continue;
   const sx=(b.x-view.x)*view.s,sy=(b.y-view.y)*view.s,hw=b.w*view.s*0.5,hh=b.h*view.s*0.5,dx1=hw*b.c-hh*b.s,dy1=hw*b.s+hh*b.c,dx2=-hw*b.c-hh*b.s,dy2=-hw*b.s+hh*b.c;
   g.moveTo(sx+dx1,sy+dy1);g.lineTo(sx+dx2,sy+dy2);g.lineTo(sx-dx1,sy-dy1);g.lineTo(sx-dx2,sy-dy2);g.closePath()}
  g.fill();g.restore()},blkAl)}
 if(dem)heat();
 useL(LB,TK,inW=>{g.save();g.strokeStyle=V("--water");g.lineWidth=Math.max(2,view.s/9000);g.globalAlpha=schem?.15:1;
 g.beginPath();for(let ri=0;ri<RIV_W.length;ri++){if(inW(RIV_WBB[ri]))fastPathW(RIV_W[ri])}g.stroke();
 [2,1,0].forEach(c=>{g.globalAlpha=schem?.12:1;g.strokeStyle=V("--road"+Math.min(c,2));g.lineWidth=[3.2,2.4,1.2][c];g.beginPath();const idxs=ROADS_BY_C[c];for(let ii=0;ii<idxs.length;ii++){const ri=idxs[ii];if(inW(ROAD_WBB[ri]))fastPathW(ROAD_W[ri])}g.stroke()});g.globalAlpha=1;g.restore()});
 if(wd<0.32){const a3=Math.min(1,(0.32-wd)/0.08)*(schem?.12:1);if(a3>0.01)useL(LC,TK,inW=>{g.save();g.strokeStyle=V("--road2");g.lineWidth=1.4;g.beginPath();const idxs=ROADS_BY_C[3];for(let ii=0;ii<idxs.length;ii++){const ri=idxs[ii];if(inW(ROAD_WBB[ri]))fastPathW(ROAD_W[ri])}g.stroke();g.restore()},a3)}
 if(wd<0.14){const a4=Math.min(1,(0.14-wd)/0.04)*(schem?.12:0.6);if(a4>0.01)useL(LD,TK,inW=>{g.save();g.strokeStyle=V("--road2");g.lineWidth=0.9;g.beginPath();const idxs=ROADS_BY_C[4];for(let ii=0;ii<idxs.length;ii++){const ri=idxs[ii];if(inW(ROAD_WBB[ri]))fastPathW(ROAD_W[ri])}g.stroke();g.restore()},a4)}
 atmoDraw();
 if(nk0>.15&&actv.length){g.save();g.globalAlpha=nk0;for(let i=0;i<actv.length;i++){const s=actv[i],x=SX(s.lo),y=SY(s.la);if(x<-30||y<-30||x>W+30||y>H+30)continue;const r=s.lvl>=2?24:18;g.drawImage(NIGHT_GLOW_SPR,x-r,y-r,r*2,r*2)}g.restore()}
 const stCols=new Map(),stTrm=new Map(),stPk=new Map(),addMeta=(id,col,isTrm,pkVal)=>{
  let arr=stCols.get(id);if(!arr){arr=[];stCols.set(id,arr)}arr.push(col);
  if(isTrm){if(!stTrm.has(id))stTrm.set(id,true)}else stTrm.set(id,false);
  if(pkVal>(stPk.get(id)||0))stPk.set(id,pkVal);
 };
 for(let i=0;i<BS.length;i++){const b=BS[i];for(let j=0;j<b.ln.length;j++){const k=b.ln[j],o=owned[k];if(o)addMeta(b.id,CFG[k].color,CFG[k].type==="tram",o.pk||0)}}
 for(let i=0;i<lines.length;i++){const l=lines[i],isT=l.type==="tram",pk=l.pk||0;for(let j=0;j<l.ids.length;j++)addMeta(l.ids[j],l.color,isT,pk)}
 const ht=hoverTarget,focusLine=(!cur&&moveSt==null&&ht&&ht.tp==="line")?ht.id:null;
 let spotLines=null,spotDimAlpha=.26;
 if(focusLine){spotLines=new Set([focusLine]);spotDimAlpha=.24}
 else if(!cur&&moveSt==null&&ht&&(ht.tp==="bs"||ht.tp==="st")){
  const sl=new Set();lines.forEach(l=>{if(l.ids.includes(ht.id))sl.add(l.key)});
  if(ht.tp==="bs"&&BSM[ht.id])BSM[ht.id].ln.forEach(k=>{if(owned[k])sl.add(k)});
  if(sl.size){spotLines=sl;spotDimAlpha=.46}
 }
 const lineLayerCol=(o,baseCol)=>dem?(demMode==="load"?((o.pk||0)>1?"#ef4444":(o.pk||0)>.75?"#f59e0b":"#22c55e"):demMode==="profit"?(o.total>=1.5?"#16a34a":o.total>=0?"#f59e0b":"#ef4444"):baseCol):baseCol;
 const drawBLine=l=>{const c=CFG[l.id],o=owned[l.id];if(!o&&!isBlUnlocked(l.id))return;const isTrm=c.type==="tram",lc=o?lineLayerCol(o,c.color):c.color,foc=spotLines?(spotLines.has(l.id)?1:-1):0;ln(l.path,lc,!!o,l.id,{type:c.type,lod,focus:foc,dimAlpha:spotDimAlpha});if(o)trn(l.w,l.cum,c.color,fleetList(o),l.stDists,l.id,o.exp?1.38:1,!!o.exp,!!(l.ring||c.ring),isTrm,o,!!c.oneWay)};
 const drawULine=l=>{if(cur&&(cur.extend===l.key||cur.insert===l.key||cur.bend===l.key))return;const a=lineFullCoords(l.ids,l.ring,l.wps);const lc=lineLayerCol(l,l.color),foc=spotLines?(spotLines.has(l.key)?1:-1):0;ln(rev(a,l),lc,true,l.key,{type:l.type,mode:l.mode,lod,focus:foc,dimAlpha:spotDimAlpha});const gm=lineGeom(l),spMul=(l.exp?1.38:1)*(l.mode==="tunnel"?1.12:1);if(rvp(l)>=1)trn(gm.w,gm.cm,l.color,fleetList(l),gm.sd,l.key,spMul,!!l.exp,!!l.ring,l.type==="tram",l)};
 if(spotLines){
  D.bl.forEach(l=>{if(!spotLines.has(l.id))drawBLine(l)});
  lines.forEach(l=>{if(!spotLines.has(l.key))drawULine(l)});
  D.bl.forEach(l=>{if(spotLines.has(l.id))drawBLine(l)});
  lines.forEach(l=>{if(spotLines.has(l.key))drawULine(l)});
 }else{
  D.bl.forEach(drawBLine);
  lines.forEach(drawULine);
 }
 if(cur){const ca=lineFullCoords(cur.ids,cur.ring,cur.wps);ln(ca,cur.color,true,"",{type:cur.type,mode:cur.mode,lod});if(cur.bend){const ol=lines.find(x=>x.key===cur.bend);if(ol&&rvp(ol)>=1){const gm=lineGeom(cur),spMul=(ol.exp?1.38:1)*(ol.mode==="tunnel"?1.12:1);trn(gm.w,gm.cm,cur.color,fleetList(ol),gm.sd,ol.key,spMul,!!ol.exp,!!cur.ring,ol.type==="tram",ol)}}if(typeof bendHandlesDraw==="function")bendHandlesDraw()}
 const hoverPv=hover&&P.size===0&&cur&&!cur.bend&&cur.ids.length?previewTarget(hover.px,hover.py):null;
 previewLineDraw(hoverPv);
 if(moveSt!=null&&typeof movePreviewDraw==="function")movePreviewDraw();

 g.save();if(schem)g.globalAlpha=.24;g.fillStyle=V("--mut");g.textAlign="center";g.font="600 12px system-ui";D.lab.forEach(l=>g.fillText(l[0].toUpperCase(),SX(l[1]),SY(l[2])));g.restore();
 g.textAlign="left";
 const pulse=.5+.5*Math.sin(RT*5),dk=isDark(),stLod=0.60+0.40*lod;
 const curTip=cur&&!cur.insert&&cur.ids.length?(cur.end==="head"?cur.ids[0]:cur.ids[cur.ids.length-1]):null;
 const focusIds=new Set();
 if(focusLine){if(isPre(focusLine)){const b=D.bl.find(x=>x.id===focusLine);if(b)b.sts.forEach(a=>focusIds.add("b:"+a[0]))}else{const l=lines.find(x=>x.key===focusLine);if(l)l.ids.forEach(id=>focusIds.add(id))}}
 const termIds=new Set();
 lines.forEach(l=>{if(l.ids.length&&!l.ring){termIds.add(l.ids[0]);termIds.add(l.ids[l.ids.length-1])}});
 D.bl.forEach(b=>{if(owned[b.id]&&b.sts.length&&!(b.ring||CFG[b.id]?.ring)){termIds.add("b:"+b.sts[0][0]);termIds.add("b:"+b.sts[b.sts.length-1][0])}});
 const boxes=[],lblQ=[],spotLbls=[];
 BS.forEach(s=>{if(!s.ln.some(k=>owned[k]||isBlUnlocked(k))&&!lines.some(l=>l.ids.includes(s.id)))return;const x=SX(s.lo),y=SY(s.la);if(x<-40||y<-40||x>W+40||y>H+40)return;
  const hc=stCols.get(s.id)||[],hub=hc.length>=2,o=hc.length>0,trmBS=stTrm.get(s.id)===true||(!o&&s.ln.every(k=>CFG[k]?.type==="tram")),isSel=sel===s.id,isHov=ht&&ht.tp==="bs"&&ht.id===s.id,isFoc=focusIds.has(s.id),scSt=(isSel||isHov)?1.08:stLod,
   r=(hub?8.2:(s.ln.length>1?6.0:5.0))*scSt,
   pk=stPk.get(s.id)||0;
  if(pk>0.9){g.beginPath();g.arc(x,y,r+3.8*scSt+2.2*pulse,0,7);g.lineWidth=2.2*scSt;g.strokeStyle=pk>1?"#e63946":"#f59e0b";g.stroke()}
  if(isSel){g.beginPath();g.arc(x,y,r+5.2,0,7);g.lineWidth=2.2;g.strokeStyle="#ff7a1a";g.stroke()}
  else if(isHov){g.beginPath();g.arc(x,y,r+5.2,0,7);g.lineWidth=2.2;g.strokeStyle="#38bdf8";g.stroke()}
  if(hub){g.beginPath();g.arc(x,y,r+1.8*scSt,0,7);g.fillStyle=dk?"#0f172a":"#fff";g.fill();g.lineWidth=2.2*scSt;g.strokeStyle=dk?"#e2e8f0":"#1e293b";g.stroke();
   g.beginPath();g.arc(x,y,Math.max(1.5,r-2.2*scSt),0,7);g.fillStyle="#fff";g.fill();g.lineWidth=2.2*scSt;g.strokeStyle=hc[0];g.stroke();
   g.beginPath();g.arc(x,y,2*scSt,0,7);g.fillStyle=hc[1];g.fill()}
  else if(trmBS){pillRect(x-r*.88,y-r*.88,r*1.76,r*1.76,r*.42);g.fillStyle=o?"#fff":V("--dist");g.fill();g.lineWidth=2.2*scSt;g.strokeStyle=o?hc[0]:V("--mut");g.stroke()}
  else{g.beginPath();g.arc(x,y,r,0,7);g.fillStyle=o?"#fff":V("--dist");g.fill();g.lineWidth=2.2*scSt;g.strokeStyle=o?hc[0]:V("--mut");g.stroke()}
  const ox=x+r+6,oy=y+3.5,opts={font:hub||isSel||isHov?"700 11px system-ui":"600 10.5px system-ui",bd:isSel?"#ff7a1a":(isHov?"#38bdf8":(hub?hc[0]:null)),hi:isSel||isHov,h:hub||isSel||isHov?16:15};
  if(isSel||isHov)spotLbls.push({tx:s.name,x:ox,y:oy,opts});
  else if(isFoc&&wd<0.45)lblQ.push({pr:1,tx:s.name,x:ox,y:oy,opts});
  else if(hub&&(wd<0.42||schem))lblQ.push({pr:2,tx:s.name,x:ox,y:oy,opts});
  else if(termIds.has(s.id)&&wd<0.38)lblQ.push({pr:4,tx:s.name,x:ox,y:oy,opts});
  else if(wd<0.23)lblQ.push({pr:5,tx:s.name,x:ox,y:oy,opts});
 });
 st.forEach(s=>{const x=SX(s.lo),y=SY(s.la);if(x<-40||y<-40||x>W+40||y>H+40)return;
  const hc=stCols.get(s.id)||[],hub=hc.length>=2,last=curTip===s.id,lvl=s.lvl||1,trmOnly=!!stTrm.get(s.id),isSel=sel===s.id,isHov=ht&&ht.tp==="st"&&ht.id===s.id,isFoc=focusIds.has(s.id),
   baseR=(last?9.5:(hub?8.6:7.2))+(lvl-1)*1.1,
   pk=stPk.get(s.id)||0;
  let sc=1;if(s.born!==undefined){const a=RT-s.born;if(a>=0&&a<0.5){const t=a/0.5;if(t<0.55){const p=t/0.55;sc=0.2+1.15*(1-(1-p)*(1-p))}else{const p=(t-0.55)/0.45;sc=1.35-0.35*(p*p*(3-2*p))}}else if(a>=0.5)delete s.born}
  const scSt=(isSel||isHov||last)?1.05:stLod,r=baseR*sc*scSt;
  if(lvl>=2){g.beginPath();g.arc(x,y,r+3.5*sc*scSt,0,7);g.lineWidth=(lvl===3?2:1.5)*scSt;g.strokeStyle=lvl===3?"#f59e0b":"#10b981";g.stroke()}
  if(pk>0.9){g.beginPath();g.arc(x,y,r+4*scSt+2.2*pulse,0,7);g.lineWidth=2.2*scSt;g.strokeStyle=pk>1?"#e63946":"#f59e0b";g.stroke()}
  if(hub){g.beginPath();g.arc(x,y,r+1.8*sc*scSt,0,7);g.fillStyle=dk?"#0f172a":"#fff";g.fill();g.lineWidth=2.4*sc*scSt;g.strokeStyle=cur&&cur.ids.includes(s.id)?cur.color:(dk?"#e2e8f0":"#1e293b");g.stroke();
   g.beginPath();g.arc(x,y,Math.max(1.5,r-2.5*sc*scSt),0,7);g.fillStyle="#fff";g.fill();g.lineWidth=2.2*sc*scSt;g.strokeStyle=hc[0];g.stroke();
   g.beginPath();g.arc(x,y,2*sc*scSt,0,7);g.fillStyle=hc[1];g.fill()}
  else if(trmOnly){pillRect(x-r*.88,y-r*.88,r*1.76,r*1.76,r*.42);g.fillStyle="#fff";g.fill();g.lineWidth=2.8*sc*scSt;g.strokeStyle=cur&&cur.ids.includes(s.id)?cur.color:(hc[0]||V("--ink"));g.stroke()}
  else{g.beginPath();g.arc(x,y,r,0,7);g.fillStyle="#fff";g.fill();g.lineWidth=3.1*sc*scSt;g.strokeStyle=cur&&cur.ids.includes(s.id)?cur.color:(hc[0]||V("--ink"));g.stroke()}
  if(isSel){g.beginPath();g.arc(x,y,r+5.2,0,7);g.lineWidth=2;g.strokeStyle="#ff7a1a";g.stroke()}
  else if(isHov){g.beginPath();g.arc(x,y,r+5.2,0,7);g.lineWidth=2;g.strokeStyle="#38bdf8";g.stroke()}
  const lb=lvl>1?s.name+" "+"★".repeat(lvl-1):s.name,ox=x+r+6,oy=y+3.5,
   opts={font:hub||lvl>1||isSel||isHov?"700 11px system-ui":"600 10.5px system-ui",bd:isSel?"#ff7a1a":(isHov?"#38bdf8":(lvl===3?"#f59e0b":(hub?hc[0]:null))),hi:isSel||isHov,h:hub||lvl>1||isSel||isHov?16:15};
  if(isSel||isHov||last)spotLbls.push({tx:lb,x:ox,y:oy,opts,st:s});
  else if(isFoc&&wd<0.45)lblQ.push({pr:1,tx:lb,x:ox,y:oy,opts,st:s});
  else if((hub||lvl>=2)&&(wd<0.42||schem))lblQ.push({pr:2,tx:lb,x:ox,y:oy,opts,st:s});
  else if(termIds.has(s.id)&&wd<0.38)lblQ.push({pr:4,tx:lb,x:ox,y:oy,opts,st:s});
  else if(wd<0.23)lblQ.push({pr:5,tx:lb,x:ox,y:oy,opts,st:s});
 });
 queueDraw(wd);
 const poiLbls=poiDraw(wd,lod,boxes,ht);
 const hqLbl=hqDraw(wd,lod,boxes,ht);
 spotLbls.forEach(it=>{const b=pillBox(it.tx,it.x,it.y,it.opts);boxes.push(b);if(it.st)it.st.box=b});
 if(hqLbl&&hqLbl.spot)boxes.push(hqLbl.box);
 poiLbls.forEach(it=>{if(it.spot)boxes.push(it.box)});
 lblQ.sort((a,b)=>a.pr-b.pr);
 if(hqLbl&&!hqLbl.spot&&wd<0.42&&fitsBox(boxes,hqLbl.box,3)){boxes.push(hqLbl.box);hqLbl.draw()}
 for(let i=0;i<lblQ.length;i++){const it=lblQ[i];if(it.pr>2)continue;const b=pillBox(it.tx,it.x,it.y,it.opts);if(!fitsBox(boxes,b,3))continue;boxes.push(b);if(it.st)it.st.box=b;pillTxt(it.tx,it.x,it.y,it.opts)}
 if(wd<0.36)for(let i=0;i<poiLbls.length;i++){const it=poiLbls[i];if(!it.spot&&fitsBox(boxes,it.box,3)){boxes.push(it.box);it.draw()}}
 for(let i=0;i<lblQ.length;i++){const it=lblQ[i];if(it.pr<=2)continue;const b=pillBox(it.tx,it.x,it.y,it.opts);if(!fitsBox(boxes,b,4))continue;boxes.push(b);if(it.st)it.st.box=b;pillTxt(it.tx,it.x,it.y,it.opts)}
 if(wd<0.20&&(!schem||(dem&&demMode==="pop"))){g.save();if(schem)g.globalAlpha=.26;g.fillStyle=V("--mut");g.textAlign="center";g.font="11px system-ui";for(let i=0;i<D.mah.length;i++){const h=D.mah[i],x=SX(h[1]),y=SY(h[2]);if(x<0||y<0||x>W||y>H)continue;const tx=dem?h[0]+" "+Math.round(h.cur/1000)+"k":h[0],w=measureTxt("11px system-ui",tx),b=[x-w/2,y-7,w,14];if(!fitsBox(boxes,b,3))continue;boxes.push(b);g.fillText(tx,x,y+4)}g.restore()}
 g.textAlign="left";
 for(let i=0;i<poiLbls.length;i++)if(poiLbls[i].spot)poiLbls[i].draw();
 if(hqLbl&&hqLbl.spot)hqLbl.draw();
 for(let i=0;i<spotLbls.length;i++){const it=spotLbls[i];pillTxt(it.tx,it.x,it.y,it.opts)}
 if(ct&&ct.tp==="poi"){const tp0=POIS.find(x=>x.id===ct.pid);if(tp0){const x=SX(tp0.lo),y=SY(tp0.la),p=(RT*1.2)%1;g.save();g.beginPath();g.arc(x,y,16+p*18,0,7);g.strokeStyle=`rgba(245,158,11,${(.9*(1-p)).toFixed(2)})`;g.lineWidth=2.5;g.stroke();g.restore()}}
 if(crisis&&crisis.state==="active"){let mLo=0,mLa=0,okM=false;if(isPre(crisis.line)){const bl=D.bl.find(x=>x.id===crisis.line);if(bl&&bl.sts.length){const s=bl.sts[Math.floor(bl.sts.length/2)];mLo=s[1];mLa=s[2];okM=true}}else{const ul=lines.find(x=>x.key===crisis.line);if(ul&&ul.ids.length){const s=S(ul.ids[Math.floor(ul.ids.length/2)]);if(s){mLo=s.lo;mLa=s.la;okM=true}}}if(okM){const x=SX(mLo),y=SY(mLa)-20,p=.5+.5*Math.sin(RT*6);g.save();g.beginPath();g.arc(x,y,10+p*2.5,0,7);g.fillStyle="#e63946";g.fill();g.lineWidth=2;g.strokeStyle="#fff";g.stroke();g.fillStyle="#fff";g.font="900 12px system-ui";g.textAlign="center";g.fillText("!",x,y+4.5);g.restore()}}
 if(dem&&demMode==="pop")oppDraw();previewBadgeDraw(hoverPv);fxDraw();fxTextDraw(wd);scaleDraw()}
function scaleDraw(){
 if(!started||!(W>0)||!(view.s>0))return;
 const kmPerPx=111.32/view.s,cands=[0.2,0.5,1,2,5,10];
 let dKm=cands.find(c=>c/kmPerPx>=52&&c/kmPerPx<=128)||cands[cands.length-1];
 const px=Math.max(36,Math.min(140,dKm/kmPerPx)),lbl=dKm<1?(Math.round(dKm*1000)+" m"):(dKm+" km");
 const rx=W<=680?(W-14):(W-58),ry=W<=680?152:66,lx=rx-px;
 g.save();
 g.fillStyle=isDark()?"rgba(15,23,42,.58)":"rgba(255,255,255,.72)";
 pillRect(lx-8,ry-18,px+16,26,8);g.fill();
 g.strokeStyle=V("--ink");g.globalAlpha=.72;g.lineWidth=1.8;
 g.beginPath();g.moveTo(lx,ry-4);g.lineTo(lx,ry);g.lineTo(rx,ry);g.lineTo(rx,ry-4);g.stroke();
 g.globalAlpha=.9;g.fillStyle=V("--ink");g.font="700 10px system-ui";g.textAlign="center";
 g.fillText(lbl,(lx+rx)/2,ry-5);
 g.restore();
}
function lineName(k){return isPre(k)?(D.bl.find(x=>x.id===k)?.title||k):(lines.find(l=>l.key===k)||{name:"Hat"}).name}
const evm=k=>evs.reduce((m,e)=>(e.t==="all"||e.t===k||(e.t==="U"&&k[0]==="U"))?m*e.m:m,1);
const crK=k=>crisis&&crisis.state==="active"&&crisis.line===k?crisis.k:1;
function serve(o,dm,cap,k){const sc=schedOf(o),c=cap*k,p=(day-1)%7>=5?.2:.4,pc=c*(4/18)*sc.pkCap,oc=c*(14/18)*sc.offCap,effCap=pc+oc,pax=Math.min(dm*p,pc)+Math.min(dm*(1-p),oc);o.pax=Math.round(pax);o.r=dm?pax/dm:1;o.pk=dm*p/(pc||1);o.occ=Math.min(1,pax/(effCap||1));o.effCap=effCap;return o}
function calcB(id,f){const o=owned[id];fs(o);const sc=schedOf(o),c=CFG[id],B=D.bl.find(x=>x.id===id),sg=o.sinyal?1.08:1,tCfg=TARIFFS[tariff]||TARIFFS.std,opM=(o.exp?1.1:1)*(o.night?1.12:1)*tCfg.dm*sc.demM,m=(o.rr||1)*(1+(o.feed||0))*satMult()*opM,poiDm=(poiLoad[id]||0)*f*sg*evm(id)*fe(o)*satMult()*opM,dm=c.pax*m*f*sg*evm(id)*fe(o)+poiDm,unRef=c.type==="tram"?(c.wag*4*VT.tyerli.cap):c.wag,baseCap=c.cap*(o.un/unRef)*(o.sinyal?1.15:1)*fq(o,B.km);serve(o,dm,baseCap,crK(id));o.cap=o.effCap||baseCap;o.ticket=(c.base*2.1*m*f*sg*evm(id)*o.r*fe(o)*(o.fare||1)+poiDm*o.r*NETPAX*(o.fare||1))*tCfg.rv;o.comm=o.pax*((o.bufe?4:0)+(o.otomat?2:0))/1e6;costs(o,B.sts.length,B.km);o.total=o.ticket+o.comm-o.cs}
function calcU(l,f){fs(l);const sc=schedOf(l),sg=l.sinyal?1.08:1,tCfg=TARIFFS[tariff]||TARIFFS.std,opM=(l.exp?1.1:1)*(l.night?1.12:1)*tCfg.dm*sc.demM*(l.type==="tram"?1.06:1)*(l.mode==="tunnel"?1.06:1),dm=(l.ld*l.bonus+(poiLoad[l.key]||0))*f*sg*evm(l.key)*fe(l)*satMult()*opM,baseCap=l.un*WC*(l.sinyal?1.15:1)*fq(l,l.km);serve(l,dm,baseCap,crK(l.key));l.cap=l.effCap||baseCap;l.ticket=l.pax*NETPAX*(l.fare||1)*tCfg.rv;l.comm=l.pax*((l.bufe?4:0)+(l.otomat?2:0))/1e6;costs(l,l.ids.length,l.km);l.total=l.ticket+l.comm-l.cs}
function sums(){lastPax=0;lastNet=0;dly={bilet:0,ticari:0,bakim:0,filo:0,personel:0,ray:0,bosta:0,tesvik:dly.tesvik||0};const add=o=>{lastPax+=o.pax;lastNet+=o.total;dly.bilet+=o.ticket;dly.ticari+=o.comm;for(const k in o.cx)dly[k]+=o.cx[k]};for(const id in owned)add(owned[id]);lines.forEach(add);dly.bosta=(st.filter(s=>!lines.some(l=>l.ids.includes(s.id))).length*IDLE+(depN())*.005)*opMult();lastNet-=dly.bosta;dly.faiz=isSandbox()?0:(loan.plan?0:loan.p*lr());lastNet-=dly.faiz;lastNet+=dly.tesvik}
function ui(){
 if(isSandbox())$("b").innerHTML="∞ Sınırsız";
 else $("b").innerHTML="₺"+Math.round(budget*10)/10+"M"+(loan.p?'<small style="display:inline;font-size:10px;color:#ff9a9a;text-transform:none;letter-spacing:0"> −₺'+Math.round(loan.p*10)/10+"M borç</small>":"");
 const mt=$("modeTag");
 if(mt){
  if(!started)mt.hidden=true;
  else if(isSandbox()){mt.hidden=false;mt.textContent="🧪 SANDBOX";mt.style.background="rgba(14,165,233,.28)";mt.style.borderColor="rgba(56,189,248,.5)"}
  else if(isScenario()){mt.hidden=false;mt.textContent="🏆 SENARYO";mt.style.background="rgba(245,158,11,.30)";mt.style.borderColor="rgba(251,191,36,.55)"}
  else{const df=DIFFS[diff]||DIFFS.easy;mt.hidden=false;mt.textContent=df.ic+" "+df.name.toUpperCase();mt.style.background=diff==="hard"?"rgba(230,57,70,.32)":diff==="normal"?"rgba(245,158,11,.28)":"rgba(34,197,94,.24)";mt.style.borderColor="rgba(255,255,255,.25)"}
 }
 clk();$("px").textContent=fmt(lastPax);$("nt").textContent=(lastNet>=0?"+":"")+lastNet.toFixed(2)+"M";$("cvg").textContent="%"+cityCov().toFixed(1).replace(".",",");
 const stEl=$("sat"),stIc=$("satIc");if(stEl&&stIc){stEl.textContent="%"+Math.round(sat);stEl.style.color=sat>=75?"#4ade80":sat>=45?"":"#fca5a5";stIc.textContent=satEmoji()}
 $("lb").disabled=!!cur||moveSt!=null;const sbEl=$("sb");if(sbEl){sbEl.disabled=!!cur||moveSt!=null;sbEl.classList.toggle("on",buildSt&&!cur&&moveSt==null)}$("db").classList.toggle("on",dem);
 const mvBar=$("mvbar");if(mvBar){const ms=moveSt!=null?S(moveSt):null;if(moveSt!=null&&!ms)moveSt=null;mvBar.hidden=!ms;if(ms)$("mvtxt").textContent=`📍 "${ms.name}" taşınıyor — haritada yeni konuma tıkla`}
 dock();
 const c=$("cr");if(crisis&&crisis.state==="active"){c.hidden=false;c.textContent="⚠ KRİZ · "+crisis.ty.t+" · "+lineName(crisis.line)+" · kalan "+crisis.left+" gün · kapasite %"+Math.round(crisis.k*100)}else if(!isSandbox()&&negD>0){c.hidden=false;c.textContent="⚠ NEGATİF BAKİYE · belediye müdahalesine "+(negMax()-negD)+" gün kaldı · 🏦 Kredi al"}else if(!isSandbox()&&lowSatDays>0){c.hidden=false;c.textContent="⚠ DÜŞÜK MEMNUNİYET (%"+Math.round(sat)+") · belediye müdahalesine "+(satMax()-lowSatDays)+" gün kaldı"}else c.hidden=true;
 asist();dirty=true;gbadge();cbadge();ctHudUpd();renderHoverTip();updFollowBar();if(typeof renderGuide==="function")renderGuide();sv()}
function dock(){$("dk").hidden=!cur;ctHudUpd();if(!cur)return;$("dc").style.background=cur.color;
 const modeTxt=cur.bend?" (Güzergâh Bükme)":(cur.insert?" (Ara Durak)":(cur.extend?" (Uzatma)":(cur.type==="tram"?" · 🚊 Tramvay":(cur.mode==="tunnel"?" · 🕳 Tünel":" · 🚇 Yerüstü"))));
 $("dn").textContent=cur.name+modeTxt;
 const L=lineKm(cur.ids,cur.ring,cur.wps),addC=cur.bend?Math.max(0,cur.segs.reduce((a,b)=>a+b,0)-cur.origSegs.reduce((a,b)=>a+b,0)):(cur.extend?cur.extOps.reduce((a,o)=>a+o.cost,0):(cur.insert?cur.insOps.reduce((a,o)=>a+o.cost,0):cur.segs.reduce((a,b)=>a+b,0)+(cur.stCosts?Object.values(cur.stCosts).reduce((a,b)=>a+b,0):0)));
 $("ds").textContent=cur.ids.length+" durak · "+L.toFixed(1)+" km"+(cur.ring?" · ↻ Ring":"")+" · "+(cur.bend?(addC?"ek ₺"+addC+"M":"ücretsiz düzenleme"):((cur.extend||cur.insert?"ek ":"")+"₺"+addC+"M"));
 const cfg=$("dkcfg");
 if(cfg){
  cfg.hidden=false;
  if(cur.bend){
   const wpCnt=Object.values(cur.wps||{}).reduce((a,b)=>a+b.length,0);
   cfg.innerHTML=`<span class="hint">〰️ Ray ortasındaki <b>+</b> tutamacıyla bük · noktaya tıklayarak sil${wpCnt?` · <b>${wpCnt}</b> büküm noktası`:""}</span>`;
  }else if(cur.insert){
   cfg.innerHTML=`<span class="hint">📍 Haritada yeni bir nokta veya mevcut bir istasyon seç — en uygun ray aralığına otomatik bağlanır.</span>`;
  }else if(!cur.extend&&!cur.ids.length){
   const trm=cur.type==="tram",tun=cur.mode==="tunnel",stC=stCostOf(cur.type,cur.mode),kmR=((trm?2.0:(tun?7.2:4.5))*diffMult()).toFixed(1).replace(/\.0$/,"");
   cfg.innerHTML=`<div class="dk-seg"><button class="${!trm?"on":""}" data-ct="metro">🚇 Metro</button><button class="${trm?"on":""}${tramUnlocked?"":" lk"}" data-ct="tram">${tramUnlocked?"🚊 Tramvay":"🔒 Tramvay (50g)"}</button></div>`+
    (!trm?`<div class="dk-seg"><button class="${!tun?"on":""}" data-cm="surface">🌉 Yerüstü</button><button class="${tun?"on":""}" data-cm="tunnel">🕳 Tünel</button></div>`:"")+
    `<small style="color:var(--mut);font-size:11px">Durak ₺${stC}M · ₺${kmR}M/km${tun?" · +hız & hava krizi yok":(trm?" · sık durak":"")}</small>`;
  }else{
   const trm=cur.type==="tram",tun=cur.mode==="tunnel",wpCnt=cur.pendingWps?cur.pendingWps.length:0;
   let rcBtn="";
   if(cur.ids.length>=3&&!cur.ring){
    const a=S(cur.end==="head"?cur.ids[0]:cur.ids[cur.ids.length-1]),b=S(cur.end==="head"?cur.ids[cur.ids.length-1]:cur.ids[0]);
    if(a&&b){const si=segInfo(a,b,cur.type,cur.mode);rcBtn=`<button class="pri" data-rc="1" ${!hasMoney(si.cost)?"disabled":""} style="padding:4px 9px;font-size:11.5px">🔄 Ring Kapat · ₺${si.cost}M</button>`}
   }
   const wpBtn=!cur.ring?`<button class="dk-wp-btn${cur.wpMode?" on":""}" data-wp="1" title="Sonraki durağa giderken haritada ara dönüş noktası koy">〰️ ${cur.wpMode?"Büküm Açık":"Ara Büküm"}${wpCnt?` (${wpCnt})`:""}</button>`:"";
   cfg.innerHTML=`<span class="ring-tag">${trm?"🚊 Tramvay":(tun?"🕳 Tünel Metro":"🚇 Yerüstü Metro")}</span>`+wpBtn+(cur.ring?'<span class="ring-tag">↻ Çember Ring Aktif</span>':rcBtn);
  }
 }
 const dx=$("dext");if(cur.extend&&!cur.ring){dx.hidden=false;dx.innerHTML=`<button data-e="head" class="${cur.end==="head"?"pri":""}" style="padding:4px 10px;font-size:12px">◀ Başına (${S(cur.ids[0])?.name||"Durak"})</button><button data-e="tail" class="${cur.end==="tail"?"pri":""}" style="padding:4px 10px;font-size:12px">Sonuna (${S(cur.ids[cur.ids.length-1])?.name||"Durak"}) ▶</button>`}else{dx.hidden=true;dx.innerHTML=""}
 $("dch").innerHTML=cur.ids.map((id,i)=>{const act=cur.extend&&!cur.ring&&((cur.end==="head"&&i===0)||(cur.end==="tail"&&i===cur.ids.length-1)),isIns=cur.insert&&cur.insOps.some(op=>op.id===id);return '<span class="sc" style="'+(act||isIns?"outline:2px solid "+cur.color:"")+'"><i>'+(i+1)+"</i>"+(S(id)?.name||"Durak")+"</span>"}).join("")+(cur.ring&&cur.ids.length>=3?`<span class="sc"><i>↻</i>${S(cur.ids[0])?.name||"Durak"}</span>`:"")||'<span class="hint">İstasyonlara ya da haritada boş bir yere dokun.</span>';
 $("fb").textContent=cur.bend?"✔ Güzergâhı Kaydet":(cur.insert?"✔ Ara Durakları Kaydet":(cur.extend?"✔ Uzatmayı Kaydet":"✔ Hattı bitir"))}
function moveSegDelta(s,lo,la){
 let oldC=0,newC=0;const np={id:s.id,lo,la};
 lines.forEach(l=>{
  const n=l.ids.length;
  for(let i=0;i<n;i++){
   const i2=(i+1)%n;if(i2===0&&(!l.ring||n<3))continue;
   const aId=l.ids[i],bId=l.ids[i2];
   if(aId!==s.id&&bId!==s.id)continue;
   const a=S(aId),b=S(bId);if(!a||!b)continue;
   oldC+=segInfoChain(a,b,l.wps,l.type,l.mode).cost;
   newC+=segInfoChain(aId===s.id?np:a,bId===s.id?np:b,l.wps,l.type,l.mode).cost;
  }
 });
 return Math.max(0,newC-oldC);
}
function moveCost(s,lo,la){
 if(isSandbox())return 0;
 const onLine=lines.some(l=>l.ids.includes(s.id));
 return Math.round((onLine?3:1)*diffMult())+moveSegDelta(s,lo,la);
}
function cancelMoveSt(){
 if(moveSt==null)return;
 const sid=moveSt;moveSt=null;hover=null;setHoverTarget(null);
 cv.style.cursor="";sel=sid;panel();msg("");SFX.close();ui();
}
if($("mvcn"))$("mvcn").onclick=cancelMoveSt;
function panel(){const s=sel&&S(sel);$("pn").hidden=!s||!!cur||moveSt!=null;ctHudUpd();if(s){const isBS=typeof s.id==="string";$("nm").value=s.name;$("nm").disabled=isBS;$("dl").hidden=isBS;
 const mvBtn=$("mvst");
 if(mvBtn){
  mvBtn.hidden=isBS;
  mvBtn.onclick=()=>{
   if(isBS||cur||!started)return;
   moveSt=s.id;buildSt=false;follow=null;updFollowBar();
   hover=null;setHoverTarget(null);cv.style.cursor="crosshair";
   SFX.open();msg("Taşıma modu: haritada durağın yeni konumuna tıkla (İptal: Esc).");
   panel();ui();
  };
 }
 const p=pot([s]),lvl=s.lvl||1,qN=Math.floor(s.q||0),qMx=s.qMax||12,nxCost=lvl===1?Math.round(12*diffMult()):lvl===2?Math.round(22*diffMult()):0;
 const an=ST_ANAL.get(s.id),basePop=fmt(Math.round(p/(.22*stBon(s))/100)*100);
 if(an&&(an.mahTotal>0||an.poiTotal>0)){
  $("pi").textContent=`Çevrede ~${basePop} kişi · mahalle ~${fmt(Math.round(an.mahTotal))}${an.poiTotal>0?" + çekim ~"+fmt(Math.round(an.poiTotal)):""} yolcu/gün`;
 }else{
  $("pi").textContent="Çevrede ~"+basePop+" kişi · tahmini ~"+fmt(p)+" yolcu/gün";
 }
 const pnl=$("pnlines");if(pnl){
  const bChips=isBS?s.ln.map(bk=>`<button class="pn-lchip" data-line="${bk}" data-own="${owned[bk]?1:0}"><i style="background:${CFG[bk].color}"></i>🚇 Bursaray ${bk}${owned[bk]?"":" (Satın al)"}</button>`):[];
  const ls=lines.filter(l=>l.ids.includes(s.id));
  const uChips=ls.map(l=>`<button class="pn-lchip" data-line="${l.key}"><i style="background:${l.color}"></i>${l.type==="tram"?"🚊":"🚇"} ${l.name}</button>`);
  const totL=(isBS?s.ln.length:0)+ls.length;
  pnl.innerHTML=bChips.concat(uChips).join("")+(totL>=2?'<span class="pn-hub">🔀 Aktarma Merkezi</span>':"")+(totL?"":'<small style="color:var(--mut);font-size:11px">Henüz bir hatta bağlı değil</small>');
 }
 const pnq=$("pnq");if(pnq){const act=actv.some(a=>a.id===s.id);if(act){const qp=Math.min(100,Math.round(qN/qMx*100)),qc=qp>=80?"#ef4444":qp>=50?"#f59e0b":"#0ea5e9";pnq.hidden=false;pnq.style.display="block";pnq.innerHTML=`<div style="display:flex;align-items:center;gap:8px;width:100%"><span>⏳ Peron kuyruğu</span><span class="bar"><i style="width:${qp}%;background:${qc}"></i></span><b>${qN}/${qMx}</b></div>`+(qN>=qMx*.75&&lvl<3?`<div class="pn-warn">⚠ Peron doluyor! Durak Seviyesini yükseltmek kuyruk kapasitesini artırır.</div>`:"")}else{pnq.hidden=true;pnq.style.display="none";pnq.innerHTML=""}}
 const upEl=$("stup");if(upEl){if(!isBS){const trm=stTramOnly(s),r2=trm?"1.05":"1.45",r3=trm?"1.25":"1.70";upEl.innerHTML=`<div class="st-up"><div class="st-up-info"><b>${lvl===3?"⭐⭐":""}${lvl===2?"⭐":""} Durak Seviyesi ${lvl}/3</b><small>${lvl===1?`Sonraki: Yarıçap ${r2} km · Talep +%15`:lvl===2?`Sonraki: ${r3} km Bölge Merkezi · Talep +%30`:"Maksimum Bölgesel Aktarma Merkezi 🏆"}</small></div>${nxCost?`<button id="upst" class="pri" ${!hasMoney(nxCost)?"disabled":""}>⬆ ₺${nxCost}M</button>`:""}</div>`;const btn=$("upst");if(btn)btn.onclick=()=>{if(!hasMoney(nxCost)){SFX.err();toast("Yetersiz bütçe.");return}pay("yuk",nxCost);s.lvl=lvl+1;fxTap(s,"#f59e0b");SFX.up();toast("🚉 "+s.name+" Seviye "+s.lvl+" oldu! Çekim alanı ve kapasite arttı.");refresh();ui();panel()}}else{const unOwn=s.ln.find(bk=>!owned[bk]);upEl.innerHTML=`<div class="st-up"><div class="st-up-info"><b>🚇 Bursaray İstasyonu</b><small>${unOwn?`${unOwn} hattı henüz satın alınmadı — hat çizerken aktarma durağı olarak bağlayabilirsin.`:`İşletmen altındaki ana hat durağı · diğer hatlarınla aktarma merkezi kurabilirsin.`}</small></div>${unOwn?`<button id="buyBsLine" class="pri">Hatlarım</button>`:""}</div>`;const bbl=$("buyBsLine");if(bbl)bbl.onclick=()=>{SFX.open();openLines()}}}}renderHoverTip()}
const P=new Map();let t0=0,mv=0,pd=0,hover=null,hoverTarget=null;
function detectHoverTarget(px,py){
 if(!started||P.size>0||moveSt!=null||(cur&&cur.bend))return null;
 if(!cur&&!buildSt&&Math.hypot(SX(HQP.lo)-px,SY(HQP.la)-py)<20)return{tp:"hq",id:"hq"};
 const b0=BS.find(b=>Math.hypot(SX(b.lo)-px,SY(b.la)-py)<13);if(b0)return{tp:"bs",id:b0.id};
 const s0=st.find(s=>Math.hypot(SX(s.lo)-px,SY(s.la)-py)<15);if(s0)return{tp:"st",id:s0.id};
 if(!cur&&!buildSt){const p0=POIS.find(p=>Math.hypot(SX(p.lo)-px,SY(p.la)-py)<16);if(p0)return{tp:"poi",id:p0.id};const lk=hitLine(px,py);if(lk)return{tp:"line",id:lk}}
 return null}
function renderHoverTip(){
 const el=$("htip");if(!el)return;
 if(!started||cur||buildSt||moveSt!=null||sel||!hoverTarget||!$("ov2").hidden){el.hidden=true;return}
 const h=hoverTarget;
 if(h.tp==="hq"){
  el.hidden=false;el.innerHTML=`<div class="ht-t">🏢 ${corp} Genel Merkezi</div><div class="ht-s"><span>İşletme Merkezi ve Filo yönetimi için tıkla</span></div>`;return;
 }
 if(h.tp==="poi"){
  const p=POIS.find(x=>x.id===h.id);if(!p){el.hidden=true;return}
  el.hidden=false;el.innerHTML=`<div class="ht-t">${poiSvg(p,15)} ${p.name}</div><div class="ht-s"><span>${p.active?"✅ Bağlı":"⛔ Bağlı değil"}</span><span>~${fmt(Math.round(p.base))} yolcu/gün</span><span>${p.area}</span></div>`;return;
 }
 if(h.tp==="line"){
  const o=h.id[0]==="B"?owned[h.id]:lines.find(l=>l.key===h.id);if(!o){el.hidden=true;return}
  const col=h.id[0]==="B"?CFG[h.id].color:o.color,pk=Math.round((o.pk||0)*100),sc=schedOf(o);
  el.hidden=false;el.innerHTML=`<div class="ht-t"><span class="ht-dot" style="background:${col}"></span>${lineName(h.id)}</div><div class="ht-s"><span>👥 ${fmt(o.pax)} yolcu</span><span>📦 %${pk} doluluk</span>${sc.id!=="std"?`<span>${sc.ic} ${sc.tag}</span>`:""}<span style="color:${o.total<0?"#ef4444":"#16a34a"}"><b>${o.total>=0?"+":""}${MM(o.total)}/gün</b></span></div>`;return;
 }
 if(h.tp==="bs"||h.tp==="st"){
  const s=S(h.id);if(!s){el.hidden=true;return}
  const isBS=typeof s.id==="string",ls=lines.filter(l=>l.ids.includes(s.id)).map(l=>l.name).concat(isBS?s.ln.filter(k=>owned[k]):[]);
  const p=pot([s]),q=Math.floor(s.q||0);
  el.hidden=false;el.innerHTML=`<div class="ht-t">${isBS?"🚇":"🚉"} ${s.name}${s.lvl>1?" "+"★".repeat(s.lvl-1):""}</div><div class="ht-s"><span>👥 ~${fmt(p)} yolcu/gün</span>${q>0?`<span>⏳ ${q} bekliyor</span>`:""}<span>${ls.length?ls.join(", "):"Hatta bağlı değil"}</span></div>`;return;
 }
 el.hidden=true;
}
function focusOn(lo,la,minSpan){
 if(!(W>0)||!(H>0))return;
 follow=null;updFollowBar();
 smoothCam(lo,la,minSpan);
}
function setHoverTarget(nt){
 const same=(!nt&&!hoverTarget)||(nt&&hoverTarget&&nt.tp===hoverTarget.tp&&nt.id===hoverTarget.id);
 if(same)return;
 hoverTarget=nt;cv.style.cursor=nt?"pointer":((cur||buildSt||moveSt!=null)?"crosshair":"");renderHoverTip();dirty=true}
function bestInsertIdx(ids,ring,lo,la){
 const pt={lo,la},n=ids.length,edges=[];
 for(let i=1;i<n;i++)edges.push({idx:i,a:S(ids[i-1]),b:S(ids[i]),close:false});
 if(ring&&n>=3)edges.push({idx:n,a:S(ids[n-1]),b:S(ids[0]),close:true});
 let best=null,bd=1e9;
 for(const e of edges){if(!e.a||!e.b)continue;const det=km(e.a,pt)+km(pt,e.b)-km(e.a,e.b);if(det<bd){bd=det;best=e}}
 return best;
}
function chainInfo(pts,type,mode){
 let dKm=0,riv=false,slope=false,center=false,cost=0;
 for(let i=1;i<pts.length;i++){const si=segInfo(pts[i-1],pts[i],type,mode);dKm+=si.dKm;if(si.riv)riv=true;if(si.slope)slope=true;if(si.center)center=true;cost+=si.cost}
 return{dKm,riv,slope,center,cost};
}
function previewTarget(px,py){if(!cur||!cur.ids.length||cur.bend)return null;
 if(cur.insert){
  const b0=BS.find(b=>!cur.ids.includes(b.id)&&Math.hypot(SX(b.lo)-px,SY(b.la)-py)<14);
  const s0=b0?null:st.find(s=>!cur.ids.includes(s.id)&&Math.hypot(SX(s.lo)-px,SY(s.la)-py)<16);
  const snap=b0||s0||null,lo=snap?snap.lo:(view.x+px/view.s)/KX+L0,la=snap?snap.la:-(view.y+py/view.s)+A0;
  const ins=bestInsertIdx(cur.ids,cur.ring,lo,la);if(!ins)return null;
  const sA=segInfo(ins.a,{lo,la},cur.type,cur.mode),sB=segInfo({lo,la},ins.b,cur.type,cur.mode),oldS=segInfoChain(ins.a,ins.b,cur.wps,cur.type,cur.mode);
  const segC=Math.max(0,sA.cost+sB.cost-Math.round(oldS.cost*0.8)),stC=snap?0:stCostOf(cur.type,cur.mode),totC=segC+stC,bad=!hasMoney(totC);
  const tags=(sA.riv||sB.riv?" · 🌉":"")+(sA.slope||sB.slope?" · ⛰":"")+(sA.center||sB.center?" · 🏛":"");
  const lbl=snap?`📍 Araya Ekle · ₺${totC}M${tags}`:`📍 Ara Durak · ₺${totC}M (₺${segC}M + ₺${stC}M)${tags}`;
  return{ins,snap,lo,la,segC,stC,totC,bad,lbl};
 }
 if(cur.ring)return null;
 const anc=S(cur.end==="head"?cur.ids[0]:cur.ids[cur.ids.length-1]);if(!anc)return null;
 const oppId=cur.ids.length>=3?(cur.end==="head"?cur.ids[cur.ids.length-1]:cur.ids[0]):null;
 const b0=BS.find(b=>(!cur.ids.includes(b.id)||b.id===oppId)&&Math.hypot(SX(b.lo)-px,SY(b.la)-py)<14);
 const s0=b0?null:st.find(s=>(!cur.ids.includes(s.id)||s.id===oppId)&&Math.hypot(SX(s.lo)-px,SY(s.la)-py)<16);
 const snap=b0||s0||null,isRingClose=!!(snap&&oppId&&snap.id===oppId);
 const lo=snap?snap.lo:(view.x+px/view.s)/KX+L0,la=snap?snap.la:-(view.y+py/view.s)+A0;
 const pWps=(cur.pendingWps||[]).map(p=>({lo:p[0],la:p[1]}));
 const si=chainInfo([anc,...pWps,{lo,la}],cur.type,cur.mode);
 const isWpAdd=!!(cur.wpMode&&!snap);
 const stC=(snap||isWpAdd)?0:stCostOf(cur.type,cur.mode),totC=stC+si.cost,bad=!hasMoney(totC);
 const tags=(si.riv?" · 🌉 Nehir":"")+(si.slope?" · ⛰ Eğim":"")+(si.center?" · 🏛 Merkez":"");
 const lbl=isWpAdd?`〰️ Ara Büküm (${(cur.pendingWps||[]).length+1}/6) · ${si.dKm.toFixed(1)} km`:(isRingClose?`🔄 Ring Kapat · ${si.dKm.toFixed(1)} km · ₺${totC}M${tags}`:(snap?`${si.dKm.toFixed(1)} km · ₺${si.cost}M${tags}`:`${si.dKm.toFixed(1)} km · ₺${totC}M (₺${si.cost}M + ₺${stC}M durak)${tags}`));
 return{anc,snap,isRingClose,isWpAdd,lo,la,dKm:si.dKm,segC:si.cost,stC,totC,bad,lbl}}
function previewImpact(lo,la,isTram){
 const R=isTram?0.85:1.2;let pax=0;
 for(const h of D.mah){const d=Math.hypot((h[1]-lo)*KX,h[2]-la)*111.32;if(d<R)pax+=h.cur*0.22*(1-d/R)}
 const pois=POIS.filter(p=>Math.hypot((p.lo-lo)*KX,p.la-la)*111.32<=1.0);
 return{R,pax:Math.round(pax),pois};
}
function bendHandlesDraw(){
 if(!cur||!cur.bend)return;
 const hPx=hover&&P.size===0?hover:null,dk=isDark();
 g.save();
 const drawEdge=(a,b)=>{
  if(!a||!b)return;
  const sk=segKey(a.id,b.id),pts=segPoints(a,b,cur.wps),list=(cur.wps&&cur.wps[sk])||[];
  for(let j=0;j<pts.length-1;j++){
   const x1=SX(pts[j].lo),y1=SY(pts[j].la),x2=SX(pts[j+1].lo),y2=SY(pts[j+1].la);
   if(Math.hypot(x2-x1,y2-y1)<22)continue;
   const mx=(x1+x2)/2,my=(y1+y2)/2;
   if(mx<-30||my<-30||mx>W+30||my>H+30)continue;
   const hov=hPx&&Math.hypot(hPx.px-mx,hPx.py-my)<14;
   g.beginPath();g.arc(mx,my,hov?9.5:8,0,7);g.fillStyle=hov?"#0ea5e9":(dk?"rgba(15,23,42,.92)":"rgba(255,255,255,.94)");g.fill();
   g.lineWidth=1.8;g.strokeStyle=hov?"#fff":cur.color;g.stroke();
   g.beginPath();g.moveTo(mx-3.2,my);g.lineTo(mx+3.2,my);g.moveTo(mx,my-3.2);g.lineTo(mx,my+3.2);
   g.lineWidth=1.8;g.strokeStyle=hov?"#fff":(dk?"#f8fafc":"#0f172a");g.stroke();
  }
  for(let wi=0;wi<list.length;wi++){
   const wx=SX(list[wi][0]),wy=SY(list[wi][1]);
   const isDrg=bendDrag&&bendDrag.sk===sk&&bendDrag.idx===wi;
   const hov=hPx&&Math.hypot(hPx.px-wx,hPx.py-wy)<15;
   g.beginPath();g.arc(wx,wy,isDrg?9.5:(hov?8.5:6.5),0,7);
   g.fillStyle=isDrg?"#f59e0b":(hov?"#fb923c":"#fff");g.fill();
   g.lineWidth=2.4;g.strokeStyle=cur.color;g.stroke();
  }
 };
 for(let i=1;i<cur.ids.length;i++)drawEdge(S(cur.ids[i-1]),S(cur.ids[i]));
 if(cur.ring&&cur.ids.length>=3)drawEdge(S(cur.ids[cur.ids.length-1]),S(cur.ids[0]));
 if(bendDrag&&cur.wps[bendDrag.sk]&&cur.wps[bendDrag.sk][bendDrag.idx]){
  const wp=cur.wps[bendDrag.sk][bendDrag.idx],wx=SX(wp[0]),wy=SY(wp[1]);
  const delta=Math.max(0,cur.segs.reduce((a,b)=>a+b,0)-cur.origSegs.reduce((a,b)=>a+b,0));
  const L=lineKm(cur.ids,cur.ring,cur.wps);
  const lbl=`${L.toFixed(1)} km · ${delta?"ek ₺"+delta+"M":"ücretsiz"}`,fnt="700 11.5px system-ui";
  const tw=measureTxt(fnt,lbl),pxp=8,ph=22,bw=tw+pxp*2,bx=Math.max(8,Math.min(W-bw-8,wx+14)),by=Math.max(8,Math.min(H-ph-8,wy-ph-12));
  pillRect(bx,by,bw,ph,11);g.fillStyle=dk?"rgba(15,23,42,.92)":"rgba(255,255,255,.94)";g.fill();
  g.lineWidth=1.8;g.strokeStyle=hasMoney(delta)?cur.color:"#ef4444";g.stroke();
  g.font=fnt;g.fillStyle=hasMoney(delta)?(dk?"#f8fafc":"#0f172a"):"#ef4444";g.textAlign="left";g.fillText(lbl,bx+pxp,by+15);
 }
 g.restore();
}
function movePreviewDraw(){
 const s=moveSt!=null?S(moveSt):null;if(!s||cur)return;
 const ox=SX(s.lo),oy=SY(s.la),dk=isDark();
 g.save();
 g.beginPath();g.arc(ox,oy,13,0,7);g.strokeStyle="#0ea5e9";g.lineWidth=2;g.setLineDash([4,4]);g.stroke();g.setLineDash([]);
 if(hover&&P.size===0){
  const lo=(view.x+hover.px/view.s)/KX+L0,la=-(view.y+hover.py/view.s)+A0,tx=SX(lo),ty=SY(la);
  const cost=moveCost(s,lo,la),bad=!hasMoney(cost),col=bad?"#ef4444":"#0ea5e9";
  const R=stRad(s),rPx=R/111.32*view.s;
  g.beginPath();g.arc(tx,ty,rPx,0,7);g.fillStyle=bad?"rgba(239,68,68,.08)":"rgba(14,165,233,.10)";g.fill();
  g.lineWidth=1.6;g.strokeStyle=col;g.globalAlpha=.7;g.setLineDash([5,5]);g.stroke();g.setLineDash([]);g.globalAlpha=1;
  POIS.forEach(p=>{if(Math.hypot((p.lo-lo)*KX,p.la-la)*111.32<=1.0){const px0=SX(p.lo),py0=SY(p.la);g.beginPath();g.moveTo(tx,ty);g.lineTo(px0,py0);g.strokeStyle="#22c55e";g.lineWidth=1.5;g.setLineDash([3,4]);g.stroke();g.setLineDash([]);g.beginPath();g.arc(px0,py0,18,0,7);g.lineWidth=2;g.strokeStyle="#22c55e";g.stroke()}});
  lines.forEach(l=>{
   const n=l.ids.length;if(n<2||!l.ids.includes(s.id))return;
   for(let i=0;i<n;i++){
    const i2=(i+1)%n;if(i2===0&&(!l.ring||n<3))continue;
    const aId=l.ids[i],bId=l.ids[i2];if(aId!==s.id&&bId!==s.id)continue;
    const a=S(aId),b=S(bId);if(!a||!b)continue;
    const pts=segPoints(aId===s.id?{id:s.id,lo,la}:a,bId===s.id?{id:s.id,lo,la}:b,l.wps);
    g.beginPath();pts.forEach((pt,pi)=>{const px0=SX(pt.lo),py0=SY(pt.la);pi?g.lineTo(px0,py0):g.moveTo(px0,py0)});
    g.strokeStyle=l.color;g.lineWidth=l.type==="tram"?3.5:4.5;g.globalAlpha=.8;g.setLineDash([8,6]);g.lineDashOffset=-RT*24;g.stroke();
   }
  });
  g.setLineDash([]);g.lineDashOffset=0;g.globalAlpha=1;
  g.beginPath();g.arc(tx,ty,6.5,0,7);g.fillStyle=col;g.fill();g.lineWidth=2;g.strokeStyle="#fff";g.stroke();
  const oldP=pot([s]),newP=pot([{...s,lo,la}]),dP=newP-oldP,imp=previewImpact(lo,la,stTramOnly(s));
  const dTxt=dP>=0?`+${fmt(dP)}`:`${fmt(dP)}`;
  const poiTxt=imp.pois.length?` · 📍 ${imp.pois[0].name.split(" ")[0]}`:"";
  const lbl=`📍 Taşı · ₺${cost}M · ${dTxt} yolcu${poiTxt}`;
  const fnt="700 11.5px system-ui",tw=measureTxt(fnt,lbl),pxp=9,ph=22,bw=tw+pxp*2,bx=Math.max(8,Math.min(W-bw-8,tx+14)),by=Math.max(8,Math.min(H-ph-8,ty-ph-12));
  pillRect(bx,by,bw,ph,11);g.fillStyle=dk?"rgba(15,23,42,.92)":"rgba(255,255,255,.94)";g.fill();
  g.lineWidth=1.8;g.strokeStyle=col;g.stroke();
  g.font=fnt;g.fillStyle=bad?"#ef4444":(dk?"#f8fafc":"#0f172a");g.textAlign="left";g.fillText(lbl,bx+pxp,by+15);
 }
 g.restore();
}
function previewLineDraw(pv0){
 if(!hover||P.size>0||moveSt!=null)return;
 if(buildSt&&!cur){
  const b0=BS.find(b=>Math.hypot(SX(b.lo)-hover.px,SY(b.la)-hover.py)<14),s0=b0?null:st.find(s=>Math.hypot(SX(s.lo)-hover.px,SY(s.la)-hover.py)<16);
  if(b0||s0)return;
  const lo=(view.x+hover.px/view.s)/KX+L0,la=-(view.y+hover.py/view.s)+A0,tx=SX(lo),ty=SY(la),rPx=1.2/111.32*view.s,col=hasMoney(stCostOf("metro","surface"))?"#0ea5e9":"#e63946";
  g.save();g.beginPath();g.arc(tx,ty,rPx,0,7);g.fillStyle=col==="#e63946"?"rgba(230,57,70,.08)":"rgba(14,165,233,.10)";g.fill();
  g.lineWidth=1.6;g.strokeStyle=col;g.globalAlpha=.7;g.setLineDash([5,5]);g.stroke();g.setLineDash([]);
  POIS.forEach(p=>{if(Math.hypot((p.lo-lo)*KX,p.la-la)*111.32<=1.0){const px0=SX(p.lo),py0=SY(p.la);g.beginPath();g.moveTo(tx,ty);g.lineTo(px0,py0);g.strokeStyle="#22c55e";g.lineWidth=1.5;g.setLineDash([3,4]);g.stroke();g.setLineDash([]);g.beginPath();g.arc(px0,py0,18,0,7);g.lineWidth=2;g.strokeStyle="#22c55e";g.stroke()}});
  g.restore();return;
 }
 if(!cur||cur.bend||!cur.ids.length||!pv0)return;
 const tx=SX(pv0.lo),ty=SY(pv0.la),col=pv0.bad?"#e63946":cur.color;
 g.save();
 if(!pv0.snap&&!pv0.isWpAdd){const R=cur.type==="tram"?0.85:1.2,rPx=R/111.32*view.s;g.beginPath();g.arc(tx,ty,rPx,0,7);g.fillStyle=pv0.bad?"rgba(230,57,70,.08)":"rgba(42,157,143,.09)";g.fill();g.lineWidth=1.4;g.strokeStyle=col;g.globalAlpha=.55;g.setLineDash([5,5]);g.stroke();g.setLineDash([]);
  POIS.forEach(p=>{if(Math.hypot((p.lo-pv0.lo)*KX,p.la-pv0.la)*111.32<=1.0){const px0=SX(p.lo),py0=SY(p.la);g.beginPath();g.moveTo(tx,ty);g.lineTo(px0,py0);g.strokeStyle="#22c55e";g.lineWidth=1.5;g.setLineDash([3,4]);g.stroke();g.setLineDash([]);g.beginPath();g.arc(px0,py0,18,0,7);g.lineWidth=2;g.strokeStyle="#22c55e";g.stroke()}})}
 if(pv0.ins){
  const ax=SX(pv0.ins.a.lo),ay=SY(pv0.ins.a.la),bx=SX(pv0.ins.b.lo),by=SY(pv0.ins.b.la);
  g.beginPath();g.moveTo(ax,ay);g.lineTo(bx,by);g.strokeStyle="#94a3b8";g.lineWidth=3;g.globalAlpha=.4;g.setLineDash([4,6]);g.stroke();
  g.beginPath();g.moveTo(ax,ay);g.lineTo(tx,ty);g.lineTo(bx,by);
  g.strokeStyle=col;g.lineWidth=4.5;g.globalAlpha=.85;g.setLineDash([9,6]);g.lineDashOffset=-RT*26;g.stroke();
 }else{
  const ax=SX(pv0.anc.lo),ay=SY(pv0.anc.la),pWps=cur.pendingWps||[];
  if(!pv0.snap&&!pWps.length&&Math.hypot(tx-ax,ty-ay)<6){g.restore();return}
  g.beginPath();g.moveTo(ax,ay);
  for(let i=0;i<pWps.length;i++)g.lineTo(SX(pWps[i][0]),SY(pWps[i][1]));
  g.lineTo(tx,ty);
  g.strokeStyle=col;g.lineWidth=cur.type==="tram"?3.5:4.5;g.globalAlpha=.78;g.setLineDash([9,6]);g.lineDashOffset=-RT*26;g.stroke();
  g.setLineDash([]);g.lineDashOffset=0;
  for(let i=0;i<pWps.length;i++){const wx=SX(pWps[i][0]),wy=SY(pWps[i][1]);g.beginPath();g.arc(wx,wy,4.5,0,7);g.fillStyle="#fff";g.fill();g.lineWidth=2;g.strokeStyle=col;g.stroke()}
 }
 g.setLineDash([]);g.lineDashOffset=0;g.restore()}
function previewBadgeDraw(pv0){
 if(!hover||P.size>0||moveSt!=null)return;
 const dk=isDark();
 if(buildSt&&!cur){
  const b0=BS.find(b=>Math.hypot(SX(b.lo)-hover.px,SY(b.la)-hover.py)<14),s0=b0?null:st.find(s=>Math.hypot(SX(s.lo)-hover.px,SY(s.la)-hover.py)<16);
  if(b0||s0)return;
  const lo=(view.x+hover.px/view.s)/KX+L0,la=-(view.y+hover.py/view.s)+A0,tx=SX(lo),ty=SY(la),stC=stCostOf("metro","surface"),bad=!hasMoney(stC),imp=previewImpact(lo,la,false),col=bad?"#e63946":"#0ea5e9";
  const poiTxt=imp.pois.length?` · 📍 ${imp.pois[0].name}`:"",paxTxt=imp.pax>=100?` · ~+${(imp.pax/1000).toFixed(1).replace(".0","")}k yolcu`:"";
  const lbl=`📍 İstasyon Kur · ₺${stC}M${paxTxt}${poiTxt}`;
  g.save();g.beginPath();g.arc(tx,ty,6,0,7);g.fillStyle=col;g.fill();g.lineWidth=2;g.strokeStyle="#fff";g.stroke();
  const fnt="700 11.5px system-ui",tw=measureTxt(fnt,lbl),pxp=9,ph=22,bw=tw+pxp*2,bx=Math.max(8,Math.min(W-bw-8,tx+14)),by=Math.max(8,Math.min(H-ph-8,ty-ph-12));
  pillRect(bx,by,bw,ph,11);g.fillStyle=dk?"rgba(15,23,42,.92)":"rgba(255,255,255,.94)";g.fill();g.lineWidth=1.8;g.strokeStyle=col;g.stroke();
  g.font=fnt;g.fillStyle=bad?"#ef4444":(dk?"#f8fafc":"#0f172a");g.textAlign="left";g.fillText(lbl,bx+pxp,by+15);g.restore();return;
 }
 if(!cur||cur.bend||!cur.ids.length||!pv0)return;
 const tx=SX(pv0.lo),ty=SY(pv0.la);
 if(pv0.anc&&!pv0.snap&&!(cur.pendingWps&&cur.pendingWps.length)&&Math.hypot(tx-SX(pv0.anc.lo),ty-SY(pv0.anc.la))<6)return;
 const col=pv0.bad?"#e63946":cur.color;
 const imp=!pv0.snap&&!pv0.isWpAdd?previewImpact(pv0.lo,pv0.la,cur.type==="tram"):null;
 const impTxt=imp?(imp.pax>=100?` · +${(imp.pax/1000).toFixed(1).replace(".0","")}k`:"")+(imp.pois.length?` · 📍 ${imp.pois[0].name.split(" ")[0]}`:""):"";
 const lbl=pv0.lbl+impTxt;
 g.save();
 if(pv0.snap){const pulse=.5+.5*Math.sin(RT*7);
  g.beginPath();g.arc(tx,ty,16+3*pulse,0,7);g.globalAlpha=.28;g.lineWidth=5;g.strokeStyle=col;g.stroke();
  g.beginPath();g.arc(tx,ty,13+1.5*pulse,0,7);g.globalAlpha=.95;g.lineWidth=2.5;g.strokeStyle=col;g.stroke()}
 else{g.beginPath();g.arc(tx,ty,5.5,0,7);g.globalAlpha=.8;g.fillStyle=col;g.fill();g.lineWidth=2;g.strokeStyle="#fff";g.stroke()}
 g.globalAlpha=1;const fnt="700 11.5px system-ui",tw=measureTxt(fnt,lbl),pxp=9,ph=22,bw=tw+pxp*2;
 const bx=Math.max(8,Math.min(W-bw-8,tx+14)),by=Math.max(8,Math.min(H-ph-8,ty-ph-12));
 pillRect(bx,by,bw,ph,11);g.fillStyle=dk?"rgba(15,23,42,.92)":"rgba(255,255,255,.94)";g.fill();
 g.lineWidth=1.8;g.strokeStyle=col;g.stroke();
 g.font=fnt;g.fillStyle=pv0.bad?"#ef4444":(dk?"#f8fafc":"#0f172a");g.textAlign="left";g.fillText(lbl,bx+pxp,by+15);
 g.restore()}
const clearPtrs=()=>{if(P.size){P.clear();pd=0;bendDrag=null}};
let lastHoverChk=0;
function hitBendHandle(px,py){
 if(!cur||!cur.bend)return null;
 const edges=[];
 for(let i=1;i<cur.ids.length;i++)edges.push([S(cur.ids[i-1]),S(cur.ids[i])]);
 if(cur.ring&&cur.ids.length>=3)edges.push([S(cur.ids[cur.ids.length-1]),S(cur.ids[0])]);
 for(const[a,b]of edges){
  if(!a||!b)continue;
  const sk=segKey(a.id,b.id),list=(cur.wps&&cur.wps[sk])||[];
  for(let i=0;i<list.length;i++){
   if(Math.hypot(SX(list[i][0])-px,SY(list[i][1])-py)<15)return{type:"wp",sk,idx:i,lo:list[i][0],la:list[i][1]};
  }
 }
 for(const[a,b]of edges){
  if(!a||!b)continue;
  const sk=segKey(a.id,b.id),pts=segPoints(a,b,cur.wps);
  for(let j=0;j<pts.length-1;j++){
   const x1=SX(pts[j].lo),y1=SY(pts[j].la),x2=SX(pts[j+1].lo),y2=SY(pts[j+1].la);
   if(Math.hypot(x2-x1,y2-y1)<22)continue;
   const mx=(x1+x2)/2,my=(y1+y2)/2;
   if(Math.hypot(mx-px,my-py)<14)return{type:"mid",sk,idx:j,lo:(pts[j].lo+pts[j+1].lo)/2,la:(pts[j].la+pts[j+1].la)/2};
  }
 }
 return null;
}
cv.addEventListener("pointerdown",e=>{
 if(e.pointerType==="mouse"&&e.button!==0)return;
 if(e.pointerType==="mouse"&&P.size>0)clearPtrs();
 camAnim=null;hover=null;setHoverTarget(null);
 if(cur&&cur.bend&&P.size===0){
  const r=cvRect||cv.getBoundingClientRect(),px=e.clientX-r.left,py=e.clientY-r.top;
  const hb=hitBendHandle(px,py);
  if(hb){
   try{cv.setPointerCapture(e.pointerId)}catch(err){}
   P.set(e.pointerId,[e.clientX,e.clientY]);mv=0;t0=Date.now();
   if(hb.type==="mid"){
    if(!cur.wps[hb.sk])cur.wps[hb.sk]=[];
    if(cur.wps[hb.sk].length<6){
     cur.wps[hb.sk].splice(hb.idx,0,[hb.lo,hb.la]);
     bendDrag={sk:hb.sk,idx:hb.idx,wasNew:true};
    }
   }else{
    bendDrag={sk:hb.sk,idx:hb.idx,wasNew:false};
   }
   cv.style.cursor="grabbing";
   LINE_GEOM_CACHE.delete(cur.bend);dirty=true;return;
  }
 }
 try{cv.setPointerCapture(e.pointerId)}catch(err){}
 P.set(e.pointerId,[e.clientX,e.clientY]);
 if(P.size===1){mv=0;t0=Date.now()}else mv=99;
 if(P.size===2){const a=[...P.values()];pd=Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1])}
});
cv.addEventListener("pointermove",e=>{
 if(e.pointerType==="mouse"&&(e.buttons&1)===0&&P.size>0)clearPtrs();
 if(!P.has(e.pointerId)){
  if(P.size===0&&e.pointerType!=="touch"){
   const r=cvRect||cv.getBoundingClientRect(),px=e.clientX-r.left,py=e.clientY-r.top,now=performance.now();
   if(now-lastHoverChk>=32){lastHoverChk=now;setHoverTarget(detectHoverTarget(px,py))}
   if(cur&&cur.bend){const hb=hitBendHandle(px,py);cv.style.cursor=hb?"grab":""}
   if((cur&&cur.ids.length)||buildSt||moveSt!=null){hover={px,py};dirty=true}else if(hover){hover=null;dirty=true}
  }else if(hover||hoverTarget){hover=null;setHoverTarget(null);dirty=true}
  return}
 hover=null;setHoverTarget(null);const o=P.get(e.pointerId),n=[e.clientX,e.clientY];
 if(bendDrag&&P.size===1){
  const r=cvRect||cv.getBoundingClientRect(),px=e.clientX-r.left,py=e.clientY-r.top;
  const lo=(view.x+px/view.s)/KX+L0,la=-(view.y+py/view.s)+A0;
  mv+=Math.abs(n[0]-o[0])+Math.abs(n[1]-o[1]);P.set(e.pointerId,n);
  if(cur&&cur.wps[bendDrag.sk]){
   cur.wps[bendDrag.sk][bendDrag.idx]=[lo,la];
   cur.segs=rebuildSegs(cur.ids,cur.ring,cur.type,cur.mode,cur.wps);
   LINE_GEOM_CACHE.delete(cur.bend);dock();dirty=true;
  }
  return;
 }
 if(P.size===1){
  if(!Number.isFinite(view.s)||view.s<=0)home();
  const dx=n[0]-o[0],dy=n[1]-o[1];view.x-=dx/view.s;view.y-=dy/view.s;
  mv+=Math.abs(dx)+Math.abs(dy);if(mv>7&&follow){follow=null;updFollowBar()}
  dirty=true;P.set(e.pointerId,n);
 }else if(P.size===2){
  P.set(e.pointerId,n);const a=[...P.values()],d=Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1]),r=cv.getBoundingClientRect();
  if(pd>1&&d>1)zoomAt((a[0][0]+a[1][0])/2-r.left,(a[0][1]+a[1][1])/2-r.top,d/pd);
  pd=d;
 }else{clearPtrs()}
});
function up(e){
 if(!P.has(e.pointerId))return;
 P.delete(e.pointerId);if(P.size<2)pd=0;
 if(bendDrag){
  const bd=bendDrag;bendDrag=null;cv.style.cursor="";
  if(e.type==="pointerup"&&!bd.wasNew&&mv<6&&Date.now()-t0<400&&cur&&cur.wps[bd.sk]){
   cur.wps[bd.sk].splice(bd.idx,1);
   if(!cur.wps[bd.sk].length)delete cur.wps[bd.sk];
   cur.segs=rebuildSegs(cur.ids,cur.ring,cur.type,cur.mode,cur.wps);
   SFX.undo();
  }else if(e.type==="pointerup"){SFX.connect(stConCnt++)}
  if(cur)LINE_GEOM_CACHE.delete(cur.bend);
  dock();dirty=true;return;
 }
 if(e.type==="pointerup"&&mv<8&&Date.now()-t0<500&&P.size===0)tap(e)
}
cv.addEventListener("pointerup",up);
cv.addEventListener("pointercancel",e=>{hover=null;setHoverTarget(null);clearPtrs()});
cv.addEventListener("lostpointercapture",e=>{if(P.has(e.pointerId)){P.delete(e.pointerId);if(P.size<2)pd=0;bendDrag=null}});
cv.addEventListener("pointerleave",()=>{if(hover||hoverTarget){hover=null;setHoverTarget(null);dirty=true}});
addEventListener("blur",clearPtrs);
document.addEventListener("visibilitychange",()=>{if(document.hidden)clearPtrs()});
cv.addEventListener("wheel",e=>{
 e.preventDefault();
 camAnim=null;
 const r=cv.getBoundingClientRect();
 let dy=e.deltaY;
 if(e.deltaMode===1)dy*=16;else if(e.deltaMode===2)dy*=Math.max(200,H||600);
 if(!Number.isFinite(dy)||!dy)return;
 const f=Math.exp(-Math.max(-600,Math.min(600,dy))*(e.ctrlKey?0.0045:0.0015));
 zoomAt(e.clientX-r.left,e.clientY-r.top,f);
},{passive:false});
function segDist(px,py,x1,y1,x2,y2){const dx=x2-x1,dy=y2-y1,l2=dx*dx+dy*dy;if(!l2)return Math.hypot(px-x1,py-y1);const t=Math.max(0,Math.min(1,((px-x1)*dx+(py-y1)*dy)/l2));return Math.hypot(px-(x1+t*dx),py-(y1+t*dy))}
function hitLine(px,py){let best=null,bd=11;
 for(let i=lines.length-1;i>=0;i--){const l=lines[i],fc=lineFullCoords(l.ids,l.ring,l.wps);for(let j=2;j<fc.length;j+=2){const d=segDist(px,py,SX(fc[j-2]),SY(fc[j-1]),SX(fc[j]),SY(fc[j+1]));if(d<bd){bd=d;best=l.key}}}
 for(let i=D.bl.length-1;i>=0;i--){const l=D.bl[i];if(!owned[l.id])continue;const p=l.path;for(let j=2;j<p.length;j+=2){const d=segDist(px,py,SX(p[j-2]),SY(p[j-1]),SX(p[j]),SY(p[j+1]));if(d<bd){bd=d;best=l.id}}}
 return best}
function rebuildSegs(ids,ring,type,mode,wps){const sg=[];for(let i=1;i<ids.length;i++){const a=S(ids[i-1]),b=S(ids[i]);sg.push(a&&b?segInfoChain(a,b,wps,type,mode).cost:0)}if(ring&&ids.length>=3){const a=S(ids[ids.length-1]),b=S(ids[0]);sg.push(a&&b?segInfoChain(a,b,wps,type,mode).cost:0)}return sg}
function addToLine(s,isNew,stPaid){
 if(cur.insert){
  const ins=bestInsertIdx(cur.ids,cur.ring,s.lo,s.la);if(!ins)return false;
  const sA=segInfo(ins.a,s,cur.type,cur.mode),sB=segInfo(s,ins.b,cur.type,cur.mode),oldS=segInfoChain(ins.a,ins.b,cur.wps,cur.type,cur.mode);
  const segC=Math.max(0,sA.cost+sB.cost-Math.round(oldS.cost*0.8));
  if(!hasMoney(segC)){SFX.err();msg("Yetersiz bütçe: ara bağlantı ₺"+segC+"M.");return false}
  if(segC)pay("insaat",segC);
  const oldSk=segKey(ins.a.id,ins.b.id),oldWp=cur.wps&&cur.wps[oldSk]?cur.wps[oldSk].map(p=>[p[0],p[1]]):null;
  if(oldWp)delete cur.wps[oldSk];
  cur.ids.splice(ins.idx,0,s.id);
  cur.segs=rebuildSegs(cur.ids,cur.ring,cur.type,cur.mode,cur.wps);
  cur.insOps.push({idx:ins.idx,id:s.id,cost:segC+(stPaid||0),segCost:segC,stCost:stPaid||0,isNew:!!isNew,oldSk,oldWp});
  if(!isNew){fxTap(s,cur.color);SFX.connect(stConCnt++)}
  msg(s.name+" araya eklendi ("+ins.a.name+" ↔ "+ins.b.name+").");return true;
 }
 if(cur.ring){SFX.err();msg("Çember hat kapalı. Bitirebilir veya Geri al yapabilirsin.");return false}
 let c=0,wpSk=null;
 const pWps=cur.pendingWps||[];
 if(cur.ids.length){
  const anc=S(cur.end==="head"?cur.ids[0]:cur.ids[cur.ids.length-1]);
  const wPts=pWps.map(p=>({lo:p[0],la:p[1]}));
  const si=chainInfo([anc,...wPts,s],cur.type,cur.mode);c=si.cost;
  if(!hasMoney(c)){SFX.err();msg("Yetersiz bütçe: bu hat parçası ₺"+c+"M.");return false}
  pay("insaat",c);
  if(pWps.length){
   if(!cur.wps)cur.wps={};
   wpSk=cur.end==="head"?segKey(s.id,anc.id):segKey(anc.id,s.id);
   cur.wps[wpSk]=cur.end==="head"?pWps.map(p=>[p[0],p[1]]).reverse():pWps.map(p=>[p[0],p[1]]);
  }
  if(cur.end==="head")cur.segs.unshift(c);else cur.segs.push(c);
 }
 cur.pendingWps=[];cur.wpMode=false;
 if(cur.end==="head")cur.ids.unshift(s.id);else cur.ids.push(s.id);
 if(cur.extend)cur.extOps.push({end:cur.end,id:s.id,cost:c,stCost:stPaid||0,isNew:!!isNew,wpSk});
 if(!isNew){fxTap(s,cur.color);SFX.connect(stConCnt++)}
 msg(s.name+" hatta eklendi. Sıradaki durağa dokun.");return true}
function closeRing(){
 if(!cur||cur.insert||cur.bend||cur.ring||cur.ids.length<3)return;
 const a=S(cur.end==="head"?cur.ids[0]:cur.ids[cur.ids.length-1]),b=S(cur.end==="head"?cur.ids[cur.ids.length-1]:cur.ids[0]);
 if(!a||!b)return;
 const pWps=cur.pendingWps||[],wPts=pWps.map(p=>({lo:p[0],la:p[1]}));
 const si=chainInfo([a,...wPts,b],cur.type,cur.mode);
 if(!hasMoney(si.cost)){SFX.err();msg("Yetersiz bütçe: ring kapatma ₺"+si.cost+"M.");return}
 pay("insaat",si.cost);
 const wpSk=segKey(cur.ids[cur.ids.length-1],cur.ids[0]);
 if(pWps.length){if(!cur.wps)cur.wps={};cur.wps[wpSk]=cur.end==="head"?pWps.map(p=>[p[0],p[1]]).reverse():pWps.map(p=>[p[0],p[1]])}
 cur.pendingWps=[];cur.wpMode=false;
 cur.segs.push(si.cost);cur.ring=true;
 if(cur.extend)cur.extOps.push({isRingClose:true,cost:si.cost,wpSk:pWps.length?wpSk:null});
 fxTap(b,cur.color);SFX.connect(stConCnt++);
 msg("🔄 Çember Ring kapatıldı! Trenler çift yönlü ring dönecek.");ui();
}
function tap(e){const r=cv.getBoundingClientRect(),px=e.clientX-r.left,py=e.clientY-r.top;
 if(cur&&cur.bend)return;
 if(moveSt!=null){
  const s=S(moveSt);if(!s){cancelMoveSt();return}
  const hitB=BS.find(b=>Math.hypot(SX(b.lo)-px,SY(b.la)-py)<13);
  const hitS=st.find(x=>x.id!==s.id&&Math.hypot(SX(x.lo)-px,SY(x.la)-py)<13);
  if(hitB||hitS){SFX.err();msg("Başka bir istasyonun üstüne taşınamaz.");return}
  const lo=(view.x+px/view.s)/KX+L0,la=-(view.y+py/view.s)+A0;
  const cost=moveCost(s,lo,la);
  if(!hasMoney(cost)){SFX.err();msg("Yetersiz bütçe: taşıma ₺"+cost+"M.");return}
  if(cost)pay("insaat",cost);
  s.lo=lo;s.la=la;s.born=RT;
  if(!s.customName){let nm=nearMah(lo,la)||"İstasyon";const base=nm;let k=2;while(st.some(x=>x.id!==s.id&&x.name===nm))nm=base+" "+k++;s.name=nm}
  lines.forEach(l=>{if(l.ids.includes(s.id)){l.segs=rebuildSegs(l.ids,l.ring,l.type,l.mode,l.wps);l.km=lineKm(l.ids,l.ring,l.wps);LINE_GEOM_CACHE.delete(l.key)}});
  moveSt=null;hover=null;setHoverTarget(null);cv.style.cursor="";sel=s.id;
  fxTap(s,"#0ea5e9");SFX.place();refresh();panel();
  toast(`📍 ${s.name} yeni konumuna taşındı`+(cost?` (−₺${cost}M)`:""));msg("");ui();return;
 }
 if(!cur&&!buildSt&&started){const hb=[[HQP,"hq"]].find(([p])=>Math.hypot(SX(p.lo)-px,SY(p.la)-py)<22);if(hb){SFX.open();pv={m:hb[1],tab:"info",pg:0};$("ov2").hidden=false;render2();return}}
 const oppId=cur&&!cur.insert&&!cur.ring&&cur.ids.length>=3?(cur.end==="head"?cur.ids[cur.ids.length-1]:cur.ids[0]):null;
 const b0=BS.find(b=>Math.hypot(SX(b.lo)-px,SY(b.la)-py)<14);
 if(b0){if(cur){if(b0.id===oppId){closeRing();return}if(cur.ids.includes(b0.id)){SFX.err();msg("Bu istasyon zaten hatta.")}else addToLine(b0,false,0)}else{SFX.click();sel=b0.id;panel();msg(b0.name+" · Bursaray "+b0.ln.join(" + ")+(b0.ln.some(i=>owned[i])?" (işletmen)":" (henüz satın alınmadı)"))}ui();return}
 const s0=st.find(s=>Math.hypot(SX(s.lo)-px,SY(s.la)-py)<16);
 if(s0){if(cur){if(s0.id===oppId){closeRing();return}if(cur.ids.includes(s0.id)){SFX.err();msg("Bu istasyon zaten hatta.")}else addToLine(s0,false,0)}else{SFX.click();sel=s0.id;panel();msg("")}ui();return}
 if(!cur&&!buildSt&&started){let hitTr=null,hd=18;for(const th of TRAIN_HITS){const d=Math.hypot(th.x-px,th.y-py);if(d<hd){hd=d;hitTr=th}}if(hitTr){camAnim=null;follow={key:hitTr.key,k:hitTr.k};updFollowBar();SFX.toggle(true);dirty=true;return}}
 if(!cur&&!buildSt&&started){const p0=POIS.find(p=>Math.hypot(SX(p.lo)-px,SY(p.la)-py)<18);if(p0){SFX.open();sel=null;panel();pv={m:"poi",id:p0.id,tab:"info"};$("ov2").hidden=false;render2();return}}
 if(!cur&&!buildSt&&started){const lk=hitLine(px,py);if(lk){SFX.open();sel=null;panel();openLines(lk);return}}
 if(!cur&&!buildSt){if(sel){sel=null;panel();dirty=true}msg("Haritada geziniyorsun · İstasyon kurmak için üstteki 📍 Durak Kur veya Yeni hat düğmesini kullan.");return}
 const lo=(view.x+px/view.s)/KX+L0,la=-(view.y+py/view.s)+A0;
 if(cur&&cur.wpMode&&!cur.insert&&!cur.ring&&cur.ids.length>=1){
  if(!cur.pendingWps)cur.pendingWps=[];
  if(cur.pendingWps.length>=6){SFX.err();msg("Bir aralıkta en fazla 6 büküm noktası konabilir.");return}
  cur.pendingWps.push([lo,la]);SFX.connect(stConCnt++);
  msg(`〰️ Ara büküm noktası eklendi (${cur.pendingWps.length}/6). Şimdi sıradaki durağa dokun.`);dock();dirty=true;return;
 }
 const stC=cur?stCostOf(cur.type,cur.mode):stCostOf("metro","surface");
 let segC=0;
 if(cur&&cur.insert){
  const ins=bestInsertIdx(cur.ids,cur.ring,lo,la);if(!ins){SFX.err();return}
  const sA=segInfo(ins.a,{lo,la},cur.type,cur.mode),sB=segInfo({lo,la},ins.b,cur.type,cur.mode),oldS=segInfoChain(ins.a,ins.b,cur.wps,cur.type,cur.mode);
  segC=Math.max(0,sA.cost+sB.cost-Math.round(oldS.cost*0.8));
 }else if(cur&&cur.ids.length){
  if(cur.ring){SFX.err();msg("Çember hat kapalı. Bitirebilir veya Geri al yapabilirsin.");return}
  const anc=S(cur.end==="head"?cur.ids[0]:cur.ids[cur.ids.length-1]),pWps=(cur.pendingWps||[]).map(p=>({lo:p[0],la:p[1]}));
  segC=anc?chainInfo([anc,...pWps,{lo,la}],cur.type,cur.mode).cost:0;
 }
 if(!hasMoney(stC+segC)){SFX.err();msg(segC?"Yetersiz bütçe: istasyon (₺"+stC+"M) ve hat parçası (₺"+segC+"M) için ₺"+(stC+segC)+"M gerekiyor.":"Yetersiz bütçe: istasyon ₺"+stC+"M.");return}
 let nm=nearMah(lo,la)||"İstasyon";const base=nm;let k=2;while(st.some(s=>s.name===nm))nm=base+" "+k++;
 const s={id:uid++,lo,la,name:nm,born:RT,q:0,lvl:1,cost:stC};st.push(s);pay("insaat",stC);fxTap(s,cur?cur.color:"#2a9d8f");cur&&cur.type==="tram"?SFX.tram():SFX.place();
 if(cur){stConCnt++;cur.newIds.push(s.id);if(!cur.stCosts)cur.stCosts={};cur.stCosts[s.id]=stC;addToLine(s,true,stC)}else{sel=s.id;panel();msg(nm+" istasyonu kuruldu (−₺"+stC+"M). Adını aşağıdan değiştirebilirsin.")}ui()}
$("pnlines").onclick=e=>{const b=e.target.closest("[data-line]");if(!b)return;SFX.open();if(b.dataset.own==="0")openLines();else openLines(b.dataset.line)};
$("dkcfg").onclick=e=>{if(!cur||cur.insert||cur.bend)return;
 if(e.target.closest("[data-wp]")){cur.wpMode=!cur.wpMode;SFX.toggle(cur.wpMode);msg(cur.wpMode?"Ara büküm açık: boş yere dokunarak dönüş noktası koy, sonra durağı seç.":"Ara büküm kapatıldı.");dock();dirty=true;return}
 if(e.target.closest("[data-rc]")){closeRing();return}
 if(cur.extend||cur.ids.length)return;
 const ct=e.target.closest("[data-ct]");if(ct){if(ct.dataset.ct==="tram"&&!tramUnlocked){SFX.lock();toast("🔒 Tramvay sistemi 50. günde açılır! (Kalan: "+Math.max(1,50-day)+" gün)");return}cur.type=ct.dataset.ct;if(cur.type==="tram")cur.mode="surface";SFX.tab();dock();dirty=true;return}
 const cm=e.target.closest("[data-cm]");if(cm&&cur.type!=="tram"){cur.mode=cm.dataset.cm;SFX.tab();dock();dirty=true}};
$("dext").onclick=e=>{const b=e.target.closest("[data-e]");if(!b||!cur||!cur.extend)return;cur.end=b.dataset.e;SFX.tab();dock();dirty=true};
$("sb").onclick=()=>{if(!started||cur||moveSt!=null)return;buildSt=!buildSt;if(buildSt){sel=null;panel();msg("Durak kurma modu açık: haritada istediğin noktaya tıkla (çıkmak için Esc veya tekrar 📍 Durak Kur).")}else{hover=null;msg("")}cv.style.cursor=buildSt?"crosshair":"";SFX.toggle(buildSt);ui()};
$("lb").onclick=()=>{if(!started||cur||moveSt!=null)return;buildSt=false;follow=null;updFollowBar();stConCnt=0;SFX.open();cur={id:lid,key:"U"+lid,name:"Hat "+lid,color:COL[(lid-1)%COL.length],type:"metro",mode:"surface",ring:false,ids:[],segs:[],wps:{},pendingWps:[],wpMode:false,newIds:[],stCosts:{},end:"tail"};hover=null;setHoverTarget(null);sel=null;panel();msg("Hat başladı: tip seç (Metro/Tramvay, Yerüstü/Tünel) ve duraklara dokun.");ui()};
$("fb").onclick=()=>{if(!cur)return;if(cur.ids.length<2){SFX.err();msg("En az 2 durak gerekiyor.");return}
 hover=null;setHoverTarget(null);
 if(cur.bend){
  const l=lines.find(x=>x.key===cur.bend);if(!l){cur=null;bendDrag=null;ui();return}
  const delta=Math.max(0,cur.segs.reduce((a,b)=>a+b,0)-cur.origSegs.reduce((a,b)=>a+b,0));
  if(!hasMoney(delta)){SFX.err();msg("Yetersiz bütçe: güzergâh farkı ₺"+delta+"M.");return}
  if(delta)pay("insaat",delta);
  l.wps=cloneWps(cur.wps);l.segs=[...cur.segs];l.km=lineKm(l.ids,l.ring,l.wps);
  LINE_GEOM_CACHE.delete(l.key);cur=null;bendDrag=null;cv.style.cursor="";recalc();refresh();fxLine(l);SFX.launch();
  toast(`〰️ ${l.name} güzergâhı güncellendi (${l.km.toFixed(1)} km)`+(delta?` (−₺${delta}M)`:"")+"!");msg("");ui();return;
 }
 if(cur.insert){const l=lines.find(x=>x.key===cur.insert);if(!l){cur=null;ui();return}l.ids=[...cur.ids];l.segs=[...cur.segs];l.wps=cloneWps(cur.wps);l.km=lineKm(l.ids,l.ring,l.wps);LINE_GEOM_CACHE.delete(l.key);cur=null;recalc();refresh();fxLine(l);SFX.launch();toast("📍 "+l.name+" güncellendi ("+l.ids.length+" durak · "+l.km.toFixed(1)+" km)!");msg("");ui();return}
 if(cur.extend){const l=lines.find(x=>x.key===cur.extend);if(!l){cur=null;ui();return}l.ids=[...cur.ids];l.segs=[...cur.segs];l.ring=!!cur.ring;l.wps=cloneWps(cur.wps);l.km=lineKm(l.ids,l.ring,l.wps);LINE_GEOM_CACHE.delete(l.key);cur=null;recalc();refresh();fxLine(l);SFX.launch();toast("🛤 "+l.name+" güncellendi ("+l.ids.length+" durak · "+l.km.toFixed(1)+" km)!");msg("");ui();return}
 const l=cur;delete l.newIds;delete l.end;delete l.stCosts;delete l.pendingWps;delete l.wpMode;
 l.wps=cloneWps(l.wps);l.sched=l.sched||"std";l.km=lineKm(l.ids,l.ring,l.wps);l.day0=day;l.earn=0;l.tr={};lines.push(l);lid++;cur=null;recalc();autoTr(l);refresh();fxLine(l);l.type==="tram"?SFX.tram():SFX.launch();
 toast((l.type==="tram"?"🚊 ":"🚉 ")+l.name+" açıldı! Tahmini günlük yolcu: "+fmt(l.pax)+(l.netInfo&&l.netInfo.pct>0?" (+"+l.netInfo.pct+"% aktarma bonusu)":""));msg("");checkGuideAuto();ui()};
$("cn").onclick=()=>{if(!cur)return;hover=null;setHoverTarget(null);SFX.undo();
 if(cur.bend){LINE_GEOM_CACHE.delete(cur.bend);cur=null;bendDrag=null;cv.style.cursor="";msg("Güzergâh bükme iptal edildi.");ui();return}
 if(cur.insert){let tot=0;cur.insOps.forEach(o=>{tot+=o.cost;if(o.isNew&&typeof o.id==="number"&&!lines.some(l=>l.ids.includes(o.id)))st=st.filter(s=>s.id!==o.id)});if(tot)pay("insaat",-tot);cur=null;msg("Ara durak ekleme iptal edildi, harcamalar iade edildi.");ui();return}
 if(cur.extend){let sr=0,stR=0;cur.extOps.forEach(o=>{sr+=o.cost;if(o.isNew&&typeof o.id==="number"&&!lines.some(l=>l.ids.includes(o.id))){st=st.filter(s=>s.id!==o.id);stR+=(o.stCost||stCostOf(cur.type,cur.mode))}});if(sr+stR)pay("insaat",-(sr+stR));cur=null;msg("Hat uzatma iptal edildi, harcamalar iade edildi.");ui();return}
 pay("insaat",-cur.segs.reduce((a,b)=>a+b,0));cur=null;msg("Hat iptal edildi, hat parçası ücretleri iade edildi (istasyonlar kaldı).");ui()};
$("ub").onclick=()=>{if(!cur||!cur.ids.length){SFX.err();return}
 SFX.undo();
 if(cur.bend){cur.wps=cloneWps(cur.origWps);cur.segs=[...cur.origSegs];LINE_GEOM_CACHE.delete(cur.bend);msg("Büküm değişiklikleri sıfırlandı.");ui();return}
 if(!cur.insert&&!cur.ring&&cur.pendingWps&&cur.pendingWps.length){cur.pendingWps.pop();msg("Son ara büküm noktası geri alındı.");ui();return}
 if(cur.insert){if(!cur.insOps.length){msg("Geri alınacak ara durak yok.");return}const op=cur.insOps.pop();cur.ids.splice(op.idx,1);if(op.oldWp)cur.wps[op.oldSk]=op.oldWp;cur.segs=rebuildSegs(cur.ids,cur.ring,cur.type,cur.mode,cur.wps);if(op.segCost)pay("insaat",-op.segCost);
  if(op.isNew&&typeof op.id==="number"){cur.newIds=cur.newIds.filter(x=>x!==op.id);if(!lines.some(l=>l.ids.includes(op.id))&&!cur.ids.includes(op.id)){st=st.filter(s=>s.id!==op.id);pay("insaat",-(op.stCost||stCostOf(cur.type,cur.mode)));msg("Son ara durak geri alındı (+₺"+op.cost+"M).");ui();return}}
  msg("Son ara durak bağlantısı geri alındı"+(op.segCost?" (+₺"+op.segCost+"M)":"")+".");ui();return}
 if(cur.extend){if(!cur.extOps.length){msg("Geri alınacak yeni ekleme yok.");return}const op=cur.extOps.pop();if(op.wpSk&&cur.wps)delete cur.wps[op.wpSk];if(op.isRingClose){cur.ring=false;cur.segs.pop();if(op.cost)pay("insaat",-op.cost);msg("Ring kapatma geri alındı (+₺"+op.cost+"M).");ui();return}if(op.end==="head"){cur.ids.shift();cur.segs.shift()}else{cur.ids.pop();cur.segs.pop()}if(op.cost)pay("insaat",-op.cost);
  if(op.isNew&&typeof op.id==="number"){cur.newIds=cur.newIds.filter(x=>x!==op.id);if(!lines.some(l=>l.ids.includes(op.id))&&!cur.ids.includes(op.id)){st=st.filter(s=>s.id!==op.id);const sc=op.stCost||stCostOf(cur.type,cur.mode);pay("insaat",-sc);msg("Son eklenen durak ve yeni istasyon geri alındı (+₺"+(sc+op.cost)+"M).");ui();return}}
  msg("Son uzatma parçası geri alındı"+(op.cost?" (+₺"+op.cost+"M)":"")+".");ui();return}
 if(cur.ring){if(cur.wps&&cur.ids.length>=3)delete cur.wps[segKey(cur.ids[cur.ids.length-1],cur.ids[0])];cur.ring=false;const rr=cur.segs.pop()||0;if(rr)pay("insaat",-rr);msg("Ring kapatma geri alındı (+₺"+rr+"M).");ui();return}
 const lastId=cur.ids.pop(),prevId=cur.ids[cur.ids.length-1];if(prevId!=null&&cur.wps)delete cur.wps[segKey(prevId,lastId)];const segRefund=cur.segs.pop()||0;if(segRefund)pay("insaat",-segRefund);
 if(cur.newIds&&cur.newIds.includes(lastId)&&typeof lastId==="number"){cur.newIds=cur.newIds.filter(x=>x!==lastId);if(!lines.some(l=>l.ids.includes(lastId))&&!cur.ids.includes(lastId)){st=st.filter(s=>s.id!==lastId);const sc=(cur.stCosts&&cur.stCosts[lastId])||stCostOf(cur.type,cur.mode);pay("insaat",-sc);msg("Son durak ve yeni kurulan istasyon geri alındı (+₺"+(sc+segRefund)+"M).");ui();return}}
 msg("Son hat parçası geri alındı"+(segRefund?" (+₺"+segRefund+"M)":"")+".");ui()};
$("nm").oninput=e=>{const s=S(sel);if(s){s.name=e.target.value||"İstasyon";s.customName=true;dirty=true;sv()}};
$("cl").onclick=()=>{SFX.close();sel=null;panel();dirty=true};
$("dl").onclick=()=>{const s=S(sel);if(!s)return;if(lines.some(l=>l.ids.includes(s.id))){SFX.err();msg("Bu istasyon bir hatta bağlı. Önce hattı sil.");return}SFX.del();const sc=s.cost||stCostOf("metro","surface");st=st.filter(x=>x!==s);pay("insaat",-sc);sel=null;panel();msg("İstasyon silindi (+₺"+sc+"M).");ui()};
function smoothZoomStep(f){
 if(!(W>0)||!(H>0)||!Number.isFinite(f)||f<=0)return;
 if(!Number.isFinite(view.s)||view.s<=0)home();
 const s0=camAnim?camAnim.ts:view.s,x0=camAnim?camAnim.tx:view.x,y0=camAnim?camAnim.ty:view.y;
 const cx=x0+W/2/s0,cy=y0+H/2/s0,ts=Math.min(Math.max(s0*f,W/1.6),W/0.004);
 camAnim={sx:view.x,sy:view.y,ss:view.s,tx:cx-W/2/ts,ty:cy-H/2/ts,ts,p:0,dur:0.18};
 dirty=true;
}
$("zi").onclick=()=>{SFX.zoom(true);smoothZoomStep(1.5)};$("zo").onclick=()=>{SFX.zoom(false);smoothZoomStep(1/1.5)};$("hm").onclick=()=>{SFX.click();follow=null;updFollowBar();home()};
const updDb=()=>{$("db").innerHTML=IC.flame+"<span>Talep</span>"};
const updSp=()=>{$("sp").innerHTML=IC.ff+`<span>×${spd}</span>`};
const updSm=()=>{$("sm").innerHTML=(schem?IC.map:IC.schema)+`<span>${schem?"Harita":"Şema"}</span>`;$("sm").classList.toggle("on",schem)};
const updTh=()=>{const dk=isDark();$("th").innerHTML=dk?IC.sun:IC.moon;$("th").title=dk?"Aydınlık temaya geç":"Karanlık temaya geç"};
function syncMutePrefs(){try{localStorage.setItem("bursametro.sfxMute",sfxMuted?"1":"0");localStorage.setItem("bursametro.ambMute",ambMuted?"1":"0")}catch(e){}SFX.syncG()}
function updAu(){const allOff=sfxMuted&&ambMuted;$("au").innerHTML=allOff?IC.soundOff:IC.soundOn;$("au").classList.toggle("on",!allOff);$("au").title=allOff?"Sesler kapalı · Açmak için tıkla":"Ses Efektleri & Ambiyans";const bs=$("auSfx"),ba=$("auAmb");if(bs){bs.textContent=sfxMuted?"Kapalı":"Açık";bs.classList.toggle("on",!sfxMuted)}if(ba){ba.textContent=ambMuted?"Kapalı":"Açık";ba.classList.toggle("on",!ambMuted)}}
const setTheme=t=>{document.documentElement.dataset.theme=t;try{localStorage.setItem("bursametro.theme",t)}catch(e){}refreshTheme();updTh();invalidateLayers();dirty=true};
try{const st0=localStorage.getItem("bursametro.theme");if(st0==="light"||st0==="dark"){document.documentElement.dataset.theme=st0;refreshTheme()}}catch(e){}
updDb();updSp();updSm();updTh();updAu();cbadge();gbadge();
$("db").onclick=()=>{dem=!dem;SFX.toggle(dem);msg(dem?"Talep haritası açık: katmanlardan Nüfus, Darboğaz veya Kuyruk görünümünü seçebilirsin.":"");checkGuideAuto();ui()};
$("sp").onclick=()=>{spd=spd===1?2:spd===2?4:1;SFX.speed(spd);updSp()};
$("sm").onclick=()=>{schem=!schem;SFX.toggle(schem);updSm();invalidateLayers();dirty=true};
$("au").onclick=e=>{e.stopPropagation();$("mgm").hidden=true;$("aum").hidden=!$("aum").hidden;SFX.init();SFX.click()};
$("auSfx").onclick=()=>{sfxMuted=!sfxMuted;syncMutePrefs();updAu();if(!sfxMuted){SFX.init();SFX.toggle(true)}};
$("auAmb").onclick=()=>{ambMuted=!ambMuted;syncMutePrefs();updAu();if(!ambMuted){SFX.init();SFX.toggle(true)}else SFX.toggle(false)};
$("th").onclick=()=>{SFX.toggle(!isDark());setTheme(isDark()?"light":"dark")};
/* olaylar ve krizler */
const EVS=[{t:"B2",x:"🎓 Üniversite dönemi başladı! Kestel–Üniversite hattında yolcu artıyor.",m:1.15,d:10},{t:"all",x:"🎉 Hafta sonu festivali! Tüm hatlarda yolcu arttı.",m:1.08,d:4},{t:"all",x:"🌧️ Yağmurlu günler: insanlar toplu taşımaya yöneldi.",m:1.06,d:5},{t:"B1",x:"⚽ Maç günü! Emek hattında yoğunluk var.",m:1.12,d:2},{t:"all",x:"🏖️ Okullar tatile girdi, yolcu sayısı düştü.",m:.92,d:12},{t:"all",x:"🛍️ Bayram alışverişi başladı, hatlar hareketli.",m:1.1,d:5},{t:"U",x:"🏗️ Yeni konut projeleri açıldı: kendi hatlarında yolcu artıyor.",m:1.12,d:8}];
const CRISIS_SVGS={
 tree:'<svg viewBox="0 0 48 48" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M6 39h36M10 34h28" stroke="#64748b" stroke-width="2.5"/><path d="M14 34v5M24 34v5M34 34v5" stroke="#64748b" stroke-width="2"/><path d="M12 31l16-14" stroke="#92400e" stroke-width="3.5"/><circle cx="31" cy="17" r="7.5" fill="#16a34a" fill-opacity=".24" stroke="#16a34a" stroke-width="2.4"/><circle cx="24" cy="14" r="5" fill="#22c55e" fill-opacity=".22" stroke="#16a34a" stroke-width="2"/><circle cx="37" cy="13" r="4" fill="#ef4444"/><path d="M37 11v2.2M37 15.1h.01" stroke="#fff" stroke-width="1.6"/></svg>',
 rock:'<svg viewBox="0 0 48 48" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M6 39h36M10 34h28" stroke="#64748b" stroke-width="2.5"/><path d="M14 34v5M24 34v5M34 34v5" stroke="#64748b" stroke-width="2"/><polygon points="15,34 19,20 29,18 35,28 33,34" fill="#94a3b8" fill-opacity=".35" stroke="#475569" stroke-width="2.4"/><polygon points="24,34 28,25 36,27 37,34" fill="#cbd5e1" fill-opacity=".45" stroke="#475569" stroke-width="2"/><path d="M22 10l4 5-4 1" stroke="#ef4444" stroke-width="2.2"/></svg>',
 rain:'<svg viewBox="0 0 48 48" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M14 23h21a6 6 0 0 0 .8-11.9A8.5 8.5 0 0 0 19 9.5a6.5 6.5 0 0 0-5 13.5Z" fill="#38bdf8" fill-opacity=".22" stroke="#0284c7" stroke-width="2.4"/><path d="M16 28l-2 5M24 28l-2 5M32 28l-2 5" stroke="#0ea5e9" stroke-width="2.4"/><path d="M7 39c3-2.5 6-2.5 9 0s6 2.5 9 0 6-2.5 9 0 5 2 7 0" stroke="#0284c7" stroke-width="2.4"/></svg>',
 power:'<svg viewBox="0 0 48 48" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="24" cy="24" r="16" fill="#f59e0b" fill-opacity=".14" stroke="#ef4444" stroke-width="2.4" stroke-dasharray="5 3"/><polygon points="26,10 16,25 23,25 21,38 32,22 25,22" fill="#f59e0b" fill-opacity=".35" stroke="#d97706" stroke-width="2.2"/><path d="M12 12l24 24" stroke="#ef4444" stroke-width="2.6"/></svg>',
 signal:'<svg viewBox="0 0 48 48" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="17" y="7" width="14" height="26" rx="7" fill="#1e293b" fill-opacity=".18" stroke="#475569" stroke-width="2.4"/><path d="M24 33v9M16 42h16" stroke="#475569" stroke-width="2.6"/><circle cx="24" cy="14.5" r="3.5" fill="#ef4444"/><circle cx="24" cy="25" r="3.5" fill="#f59e0b" fill-opacity=".4" stroke="#d97706" stroke-width="1.8"/><path d="M35 12l4-2M35 17h5" stroke="#ef4444" stroke-width="2"/></svg>',
 heat:'<svg viewBox="0 0 48 48" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="24" cy="18" r="6.5" fill="#f97316" fill-opacity=".28" stroke="#ea580c" stroke-width="2.4"/><path d="M24 6v3M24 27v3M12 18h3M33 18h3M15.5 9.5l2.2 2.2M30.3 24.3l2.2 2.2M32.5 9.5l-2.2 2.2M17.7 24.3l-2.2 2.2" stroke="#ea580c" stroke-width="2"/><path d="M8 36c4-3 7 3 11 0s7 3 11 0 7 3 10 0" stroke="#dc2626" stroke-width="2.6"/><path d="M8 41c4-3 7 3 11 0s7 3 11 0 7 3 10 0" stroke="#94a3b8" stroke-width="2"/></svg>',
 wheel:'<svg viewBox="0 0 48 48" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="15" cy="28" r="8" fill="#64748b" fill-opacity=".2" stroke="#475569" stroke-width="2.5"/><circle cx="33" cy="28" r="8" fill="#64748b" fill-opacity=".2" stroke="#475569" stroke-width="2.5"/><circle cx="15" cy="28" r="2.5" fill="#475569"/><circle cx="33" cy="28" r="2.5" fill="#475569"/><path d="M15 28h18M7 39h34" stroke="#64748b" stroke-width="2.4"/><path d="M24 9l6 10H18l6-10Z" fill="#ef4444" fill-opacity=".2" stroke="#ef4444" stroke-width="2.2"/><path d="M24 13v3" stroke="#ef4444" stroke-width="2"/></svg>',
 motor:'<svg viewBox="0 0 48 48" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="22" cy="25" r="8.5" fill="#64748b" fill-opacity=".18" stroke="#475569" stroke-width="2.4"/><circle cx="22" cy="25" r="3" fill="#475569"/><path d="M22 13v3M22 34v3M10 25h3M31 25h3M13.5 16.5l2.2 2.2M28.3 31.3l2.2 2.2M30.5 16.5l-2.2 2.2M15.7 31.3l-2.2 2.2" stroke="#475569" stroke-width="2.4"/><polygon points="35,9 29,18 34,18 32,26 39,16 34,16" fill="#f59e0b" stroke="#d97706" stroke-width="1.5"/></svg>',
 door:'<svg viewBox="0 0 48 48" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="10" y="9" width="28" height="30" rx="4" fill="#64748b" fill-opacity=".14" stroke="#475569" stroke-width="2.4"/><path d="M24 9v30" stroke="#ef4444" stroke-width="2" stroke-dasharray="3 3"/><rect x="13" y="13" width="8" height="14" rx="1.5" fill="#38bdf8" fill-opacity=".25" stroke="#0284c7" stroke-width="1.8"/><rect x="27" y="13" width="8" height="14" rx="1.5" fill="#38bdf8" fill-opacity=".25" stroke="#0284c7" stroke-width="1.8"/><path d="M16 33h-4m0 0l2-2m-2 2l2 2M32 33h4m0 0l-2-2m2 2l-2 2" stroke="#ef4444" stroke-width="2"/></svg>',
 brake:'<svg viewBox="0 0 48 48" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="23" cy="25" r="13" fill="#64748b" fill-opacity=".16" stroke="#475569" stroke-width="2.4"/><circle cx="23" cy="25" r="5" fill="#cbd5e1" fill-opacity=".3" stroke="#475569" stroke-width="2"/><path d="M31 13c5 3 8 8 7 15l-4-1c.5-4.5-1.5-8.5-5-10.5L31 13Z" fill="#ef4444" fill-opacity=".35" stroke="#dc2626" stroke-width="2.2"/><path d="M14 14l4 4M11 21l4 1" stroke="#f97316" stroke-width="2.2"/></svg>',
 panel:'<svg viewBox="0 0 48 48" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="11" y="9" width="26" height="30" rx="4" fill="#475569" fill-opacity=".18" stroke="#475569" stroke-width="2.4"/><path d="M17 16h14M17 22h8" stroke="#64748b" stroke-width="2.2"/><polygon points="27,19 20,28 25,28 23,35 31,26 26,26" fill="#f59e0b" stroke="#d97706" stroke-width="1.6"/><circle cx="31" cy="16" r="2.2" fill="#ef4444"/></svg>'
};
const CRT=[{k:"tree",t:"Raylara ağaç devrildi",d:"Şiddetli rüzgâr bir ağacı hat üzerine devirdi. Raylar kısmen kapandı.",ic:"🌳"},{k:"rock",t:"Raylara cisim düştü",d:"Hat üzerine bir cisim düştü, seferler yavaşlatıldı.",ic:"🪨"},{k:"rain",t:"Sağanak yağış",d:"Sel suyu hat güzergâhında birikti, güvenlik için seferler kısıtlandı.",ic:"🌧️"},{k:"power",t:"Elektrik kesintisi",d:"Bölgedeki enerji kesintisi tren seferlerini aksatıyor.",ic:"⚡"},{k:"signal",t:"Sinyalizasyon arızası",d:"Sinyal sistemi arızalandı, trenler manuel kontrolle ilerliyor.",ic:"🚦"},{k:"heat",t:"Aşırı sıcak",d:"Yüksek sıcaklık rayları genleştirdi, hız sınırlaması getirildi.",ic:"☀️"}];
const WCT=[{k:"wheel",t:"Tekerlek aşınması",d:"Bir vagonun tekerlek takımında aşınma tespit edildi; sefere devam etmek güvenli değil.",ic:"🛞"},{k:"motor",t:"Çekiş motoru arızası",d:"Bir vagonun çekiş motoru devre dışı kaldı, tren eksik güçle ilerliyor.",ic:"⚙️"},{k:"door",t:"Kapı mekanizması arızası",d:"Vagon kapıları kapanmıyor, durak süreleri uzadı.",ic:"🚪"},{k:"brake",t:"Fren sistemi uyarısı",d:"Fren sistemi uyarı verdi, vagonun servis dışı alınması gerekiyor.",ic:"🛑"},{k:"panel",t:"Elektrik panosu arızası",d:"Vagon içi elektrik sistemi çöktü, yolcular tahliye ediliyor.",ic:"🔌"}];
const OPT=[{id:"cheap",ic:"🔧",n:"Ekonomik onarım",cost:8,days:8,k:.55,t:"Ucuz ama geç: yaklaşık 8 gün sürer."},{id:"fast",ic:"🚨",n:"Acil müdahale",cost:35,days:2,k:.55,t:"Pahalı ama hızlı: yaklaşık 2 gün sürer."},{id:"ignore",ic:"🙈",n:"Önemseme",cost:0,days:22,k:.35,t:"Ücretsiz. Kriz kendiliğinden geçer ama yaklaşık 22 gün sürer."}];
function fire(){
 const pool=EVS.filter(e=>e.t!=="U"||lines.length),raw=pool[rnd(pool.length)],dm=diffMult();
 let m=raw.m;
 if(m<1)m=Math.max(.55,1-(1-m)*dm);
 else if(dm>1)m=1+(m-1)/(1+(dm-1)*.35);
 const e={...raw,m:+m.toFixed(3),left:raw.d};
 evs.push(e);const p=Math.round((e.m-1)*100);SFX.ev(e.m>=1);toast(e.x+" ("+(p>0?"+":"")+p+"% yolcu, "+e.d+" gün)");
}
function mkOpts(){
 const dm=diffMult(),sv=.7+Math.random()*.9,r=(a,b)=>a+Math.random()*(b-a),j=()=>(Math.random()-.5)*.12;
 return OPT.map(o=>{
  const d=o.id==="cheap"?r(5,12):o.id==="fast"?r(1,4):r(16,30),c=o.id==="cheap"?r(6,13):o.id==="fast"?r(26,48):0;
  const days=Math.max(1,Math.round(d*sv*(o.id==="fast"?1:Math.pow(dm,.45)))),cost=Math.round(c*(.85+.3*sv)*dm),k=+Math.min(.8,Math.max(.2,(o.k+j())/(1+(dm-1)*.22))).toFixed(2);
  return{...o,days,cost,k,t:o.id==="cheap"?`Ucuz ama geç: yaklaşık ${days} gün sürer.`:o.id==="fast"?`Pahalı ama hızlı: yaklaşık ${days} gün sürer.`:`Ücretsiz. Kriz kendiliğinden geçer ama yaklaşık ${days} gün sürebilir.`}
 });
}
function startCrisis(w){const keys=[...Object.keys(owned),...lines.map(l=>l.key)];if(!keys.length)return;let line=keys[rnd(keys.length)],vt=null;
 const ul0=lines.find(l=>l.key===line),crPool=(!w&&ul0&&ul0.mode==="tunnel")?CRT.filter(x=>x.k==="power"||x.k==="signal"):CRT;
 let ty=crPool[rnd(crPool.length)];
 if(w){const wt=o=>ALL_VK().map(t=>[t,(o.tr[t]||0)*br2(t)]).filter(y=>y[1]>0),ws=allL().map(x=>[x[3],wt(x[1]).reduce((a,y)=>a+y[1],0)]),tot=ws.reduce((a,x)=>a+x[1],0);if(!tot)return;let r=Math.random()*tot;for(const x of ws){r-=x[1];if(r<=0){line=x[0];break}}
  const o=(owned[line]||lines.find(l=>l.key===line)),ts=wt(o),tt=ts.reduce((a,y)=>a+y[1],0);if(!tt)return;r=Math.random()*tt;vt=ts[0][0];for(const y of ts){r-=y[1];if(r<=0){vt=y[0];break}}ty=WCT[rnd(WCT.length)]}
 crisis={ty,line,vt,w:!!w,state:"choose",opts:mkOpts()};SFX.crisis();render3();$("ov3").hidden=false}
function render3(){const c=crisis,v=c.w?VT[c.vt]:null,cat=v?v.cat:"metro",sp=depN(cat),unit=cat==="tram"?"tramvay seti":"vagon",svg=CRISIS_SVGS[c.ty.k]||CRISIS_SVGS.signal;
 let h=`<div class="kr">⚠ ${c.w?(cat==="tram"?"TRAMVAY ARIZASI":"VAGON ARIZASI"):"KRİZ"}</div><div class="cr-hero"><div class="cr-badge">${svg}</div><div><h2>${c.ty.t}</h2><p>${c.ty.d}</p></div></div><p>Etkilenen hat: <b>${lineName(c.line)}</b>${c.w?` · Arızalanan: <b>${v.ic} ${v.n}</b>`:""}</p>`;
 if(c.w&&sp)h+=`<button class="op" data-c="spare"><b>🔄 Yedek ${unit}ni devreye al · Ücretsiz</b><span>Depoda ${sp} yedek ${unit} var. Arızalı araç onarılırken yedek hizmete girer, hat aksamadan devam eder.</span></button>`;
 else{if(c.w)h+=`<p style="color:var(--mut);font-size:13px">💡 Depoda yedek ${unit}n olsaydı bu arıza ücretsiz çözülürdü.</p>`;h+=c.opts.map(o=>`<button class="op" data-c="${o.id}" ${!hasMoney(o.cost)?"disabled":""}><b>${o.ic} ${o.n} · ${o.cost?"₺"+o.cost+"M":"Ücretsiz"}</b><span>${o.t}</span><small>Süre boyunca hattın yolcu taşıma kapasitesi %${Math.round(o.k*100)} seviyesine düşer.</small></button>`).join("")}
 $("cd3").innerHTML=h}
const COUNCIL_DECISIONS=[
 {id:"derby",ic:"⚽",t:"Timsah Arena Derbi Günü",d:"Bursaspor derbisi öncesi Büyükşehir Belediyesi stadyum çevresi için ek ulaşım planı istiyor.",
  a:{t:"Ücretsiz Ekspres Ring Desteği",d:"Taraftar akınını raylı sisteme çek, memnuniyeti yükselt.",eff:"₺8M gider · +7 😊 · 3 gün +%14 yolcu",fn:()=>{pay("bakim",8);sat=Math.min(99,sat+7);evs.push({t:"all",x:"⚽ Derbi coşkusu! Tüm ağda yolcu arttı.",m:1.14,d:3});toast("⚽ Derbi ekspres planı devrede: +7 😊 memnuniyet & +%14 yolcu!")}},
  b:{t:"Standart Tarife ile İşlet",d:"Ek bütçe harcanmaz, yoğunluk mevcut seferlere biner.",eff:"₺0 gider · −3 😊 · 3 gün +%10 yolcu",fn:()=>{sat=Math.max(8,sat-3);evs.push({t:"all",x:"⚽ Derbi yoğunluğu seferleri zorladı.",m:1.10,d:3});toast("⚽ Normal tarife korundu, stadyum çevresi yoğunlaştı.")}}},
 {id:"acemler",ic:"🛣",t:"Acemler Kavşağı Trafik Kilitlenmesi",d:"Ana arterde dev trafik sıkışıklığı var. Belediye sürücüleri raylı sisteme çekecek ortak kampanya öneriyor.",
  a:{t:"Raylı Sistem Aktarma Kampanyası",d:"Kısa süreli tanıtım ve otopark aktarımı ile yoğunluğu metroya al.",eff:"₺10M gider · +5 😊 · 6 gün +%16 yolcu",fn:()=>{pay("insaat",10);sat=Math.min(99,sat+5);evs.push({t:"all",x:"🚗 Acemler sürücüleri metroya geçti!",m:1.16,d:6});toast("🚗 Aktarma kampanyası başladı: 6 gün +%16 yolcu!")}},
  b:{t:"Karayolu Akışına Bırak",d:"Bütçe korunur, sadece doğal trafik sıkışıklığı talebi oluşur.",eff:"₺0 gider · −1 😊 · 4 gün +%6 yolcu",fn:()=>{sat=Math.max(8,sat-1);evs.push({t:"all",x:"🚗 Trafik yoğunluğu metro talebini hafif artırdı.",m:1.06,d:4});toast("🚗 Karayolu sıkışıklığı hafif ek yolcu getirdi.")}}},
 {id:"uludag",ic:"⛷️",t:"Uludağ Kış & Teleferik Festivali",d:"Turizm haftası için Teleferik ve Tarihi Çarşı koridoruna ek sefer ve ortak bilet talebi geldi.",
  a:{t:"Turizm Ortak Bilet Paketi",d:"Belediye sponsorluğu ve entegre biletle yolcu gelirlerini artır.",eff:"+₺6M net hibe · +4 😊 · 5 gün +%15 yolcu",fn:()=>{pay("insaat",12);budget+=18;LG("odul",18);sat=Math.min(99,sat+4);evs.push({t:"all",x:"⛷️ Uludağ Kış Festivali yolcu akını yarattı!",m:1.15,d:5});toast("⛷️ Turizm paketi onaylandı (+₺6M net hibe & 5g +%15 yolcu)!")}},
  b:{t:"Olağan İşletmede Kal",d:"Ek festival koordinasyonu yapılmaz, hatlar sakin seyreder.",eff:"₺0 gider · +1 😊 · Sakin operasyon",fn:()=>{sat=Math.min(99,sat+1);toast("🏛 Festival paketi pas geçildi, hatlar olağan düzende.")}}},
 {id:"gorukle",ic:"🎓",t:"UÜ & Görükle Bahar Şenliği",d:"Binlerce üniversite öğrencisi şenlik haftasında gece raylı sistem desteği bekliyor.",
  a:{t:"Öğrenci Ulaşım Sübvansiyonu",d:"Belediye öğrenci kartı desteği ile hem memnuniyet hem talep kazan.",eff:"+₺10M katkı · +6 😊 · 5 gün +%12 yolcu",fn:()=>{budget+=10;LG("odul",10);sat=Math.min(99,sat+6);evs.push({t:"all",x:"🎓 Bahar Şenliği hatları canlandırdı!",m:1.12,d:5});toast("🎓 Öğrenci ulaşım desteği onaylandı (+₺10M & +6 😊)!")}},
  b:{t:"Normal Saatlerle Devam Et",d:"Ek sefer planlanmaz ama öğrencilerden şikayet gelir.",eff:"₺0 · −4 😊",fn:()=>{sat=Math.max(8,sat-4);toast("🎓 Ek gece desteği verilmedi (−4 😊).")}}},
 {id:"osb",ic:"🏭",t:"OSB Vardiya Saatleri Düzenlemesi",d:"Sanayi bölgeleri vardiya değişimlerini raylı sisteme göre kaydırmak istiyor.",
  a:{t:"Sanayi Entegre Sefer Anlaşması",d:"Peron ve sinyal uyumuyla sanayi yolcusunu güçlü biçimde topla.",eff:"₺14M yatırım · +6 😊 · 8 gün +%14 yolcu",fn:()=>{pay("yuk",14);sat=Math.min(99,sat+6);evs.push({t:"all",x:"🏭 OSB vardiya entegrasyonu devrede!",m:1.14,d:8});toast("🏭 OSB anlaşması imzalandı: 8 gün +%14 yolcu!")}},
  b:{t:"Mevcut Düzeni Koru",d:"Yatırım yapılmaz, sadece planlama danışmanlık geliri alınır.",eff:"+₺4M katkı · ₺0 yatırım",fn:()=>{budget+=4;LG("odul",4);toast("🏭 Mevcut vardiya düzeni korundu (+₺4M danışmanlık).")}}}
];
function councilTick(){
 if(isSandbox()||isScenario()||crisis||councilChoice||!allL().length)return;
 councilCd--;if(councilCd>0)return;
 let pool=COUNCIL_DECISIONS.filter(d=>!councilUsed.includes(d.id));
 if(!pool.length){councilUsed=[];pool=COUNCIL_DECISIONS}
 councilChoice=pool[rnd(pool.length)];
 councilCd=22+rnd(10);
 renderCouncil();
}
function renderCouncil(){
 const d=councilChoice;if(!d)return;
 $("cd3").innerHTML=`<div class="cn-hdr">🏛 BURSA BÜYÜKŞEHİR ULAŞIM KONSEYİ</div><h2>${d.ic} ${d.t}</h2><p>${d.d}</p><div class="cn-opts"><button class="cn-opt" data-cn="a"><b>✅ ${d.a.t}</b><small>${d.a.d}</small><span class="cn-eff">${d.a.eff}</span></button><button class="cn-opt" data-cn="b"><b>⚖️ ${d.b.t}</b><small>${d.b.d}</small><span class="cn-eff">${d.b.eff}</span></button></div>`;
 $("ov3").hidden=false;SFX.ctNew();
}
$("cd3").onclick=e=>{
 const cn=e.target.closest("[data-cn]");
 if(cn&&councilChoice){
  const opt=cn.dataset.cn==="b"?councilChoice.b:councilChoice.a;
  opt.fn();stat.councilCount=(stat.councilCount||0)+1;councilUsed.push(councilChoice.id);
  councilChoice=null;$("ov3").hidden=true;SFX.up();ui();chk();save();return;
 }
 const b=e.target.closest("[data-c]");if(!b||!crisis)return;if(b.dataset.c==="spare"){const u=crisis.vt&&VT[crisis.vt].cat==="tram"?"tramvay seti":"vagon";crisis=null;cdn=Math.max(18,Math.round(38/Math.sqrt(diffMult())));$("ov3").hidden=true;SFX.fixed();toast("🔄 Yedek "+u+" devreye alındı, aksama olmadı ✅");return}const o=crisis.opts.find(x=>x.id===b.dataset.c);if(!hasMoney(o.cost)){SFX.err();return}pay("kriz",o.cost);crisis.state="active";crisis.left=Math.max(1,o.days+Math.floor(Math.random()*4)-1);crisis.k=o.k;$("ov3").hidden=true;SFX.up();toast(o.ic+" "+o.n+" başladı. Kriz yaklaşık "+o.days+" gün sürecek.");ui()};
const isReportDay=d=>d===60||d===120||d===180||(d>=365&&d%365===0);
function tick(){if(over)return;day++;const f=((day-1)%7>=5?.8:1)*(.94+Math.random()*.12);
 for(const id in owned)loT(owned[id]);lines.forEach(loT);mkT();grow();recalc();
 let fxi=0;for(const id in owned){calcB(id,f);const o=owned[id];book(o);if(o.total>0){const sts=BS.filter(b=>b.ln.includes(id));if(sts.length){const s=sts[(day+fxi)%sts.length];fxText.push({lo:s.lo,la:s.la,txt:"+"+MM(o.total),c:CFG[id].color,t:RT+fxi*.13,ox:(fxi%2?14:-14)});fxi++}}}
 lines.forEach(l=>{calcU(l,f);book(l);if(l.total>0&&l.ids.length){const s=S(l.ids[(day+l.id)%l.ids.length]);if(s){fxText.push({lo:s.lo,la:s.la,txt:"+"+MM(l.total),c:l.color,t:RT+fxi*.13,ox:(fxi%2?14:-14)});fxi++}}});
 dly.tesvik=0;sums();LG("bakim",dly.bosta);if(!isSandbox())budget-=dly.bosta;
 if(!isSandbox()&&loan.plan&&loan.p>0){
  const inst=Math.min(loan.p,loan.plan.daily),intRatio=loan.plan.rate/(1+loan.plan.rate),intPart=Math.round(inst*intRatio*100)/100;
  budget-=inst;loan.p=Math.max(0,Math.round((loan.p-inst)*100)/100);loan.plan.left--;
  dly.faiz=intPart;LG("faiz",intPart);
  if(loan.p<=0.05||loan.plan.left<=0){if(loan.p>0){budget-=loan.p;loan.p=0}loan.plan=null;SFX.coin();toast("🎉 Yapılandırılmış borcun tamamı ödendi!")}
 }else if(dly.faiz&&!isSandbox())pay("faiz",dly.faiz);
 satTick();debtTick();
 hist.push(lastNet);if(hist.length>40)hist.shift();
 histP.push(lastPax);if(histP.length>40)histP.shift();
 histS.push(Math.round(sat));if(histS.length>40)histS.shift();
 evs.forEach(e=>e.left--);evs=evs.filter(e=>e.left>0);if(!isScenario())contractTick();
 if(day%30===0){const mNet=hist.slice(-30).reduce((a,b)=>a+b,0);setTimeout(()=>{SFX.ach();toast("📆 "+Math.round(day/30)+". Ay Özeti: Kasa "+(isSandbox()?"∞ Sınırsız":"₺"+Math.round(budget)+"M")+" · Son 30g net "+(mNet>=0?"+":"")+MM(mNet)+" · Memnuniyet %"+Math.round(sat))},900)}
 if(crisis&&crisis.state==="active"){crisis.left--;if(crisis.left<=0){SFX.fixed();toast("✅ Kriz sona erdi, hat normale döndü.");crisis=null;cdn=Math.max(18,Math.round(38/Math.sqrt(diffMult())))}}
 else if(!crisis){cdn--;if(day>=nextEv){fire();nextEv=day+14+rnd(10)}if(!isSandbox()&&day>12&&cdn<=0){const sq=Math.sqrt(diffMult());if(Math.random()<.018*sq)startCrisis();else if(Math.random()<wRisk()*sq)startCrisis(true)}}
 if(autoRenew&&!isSandbox()){ALL_VK().forEach(k=>{if(totalOf(k)>0&&fa[k]>=550&&hasMoney(rc(k))){const c=rc(k);pay("vagon",c);fa[k]=0;toast(`🤖 ${VT[k].ic} ${VT[k].n} filosu otomatik yenilendi (−₺${c}M)`)}})}
 if(!over&&!isSandbox()&&!isScenario())councilTick();
 sums();SFX.day(lastNet);ui();chk();if(isScenario())scenarioTick();
 if(!over&&!isScenario()&&isReportDay(day)&&!reportsShown.includes(day)){reportsShown.push(day);save();openReport(day,true)}
 else if(!over){if(!$("ov2").hidden)render2();save()}}
/* satın alma ve paneller */
function buy(id){const c=CFG[id],bp=burPrice(id),l=D.bl.find(x=>x.id===id);if(!hasMoney(bp)){SFX.err();msg("Yetersiz bütçe: "+l.title+" ₺"+bp+"M.");return}pay("satin",bp);owned[id]={day0:day,earn:0,tr:{yerli:c.wag/4},rr:1,feed:0,km:l.km,sched:"std"};refresh();fxBur(id);SFX.launch();if(!started){started=true;$("ov").hidden=true}toast("🎉 "+l.title+" artık senin!");msg("Haritada gez, 📍 Durak Kur veya Yeni hat ile ağını büyüt.");ui();if(!$("ov2").hidden)render2()}
const UPG=[{k:"bufe",name:"İstasyonlara Büfe Ekleme",price:22,desc:"Her yolcudan ek ₺4 ticari gelir."},{k:"otomat",name:"İstasyonlara Yiyecek Otomatı Ekleme",price:11,desc:"Her yolcudan ek ₺2 ticari gelir."},{k:"sinyal",name:"Sinyalizasyon Geliştirme",price:32,desc:"Seferler daha güvenilir olur: yolcu sayısı +%8, hat kapasitesi +%15."}];
let pv={m:"list",id:null,tab:"info"};
function info(k){if(k[0]==="B"){const l=D.bl.find(x=>x.id===k);return{title:l.title,color:CFG[k].color,o:owned[k],names:l.sts.map(a=>a[0]),wag:CFG[k].wag,hw:CFG[k].hw,bur:true}}const l=lines.find(x=>x.key===k);return{title:l.name,color:l.color,o:l,names:l.ids.map(i=>S(i).name),wag:12,hw:8,bur:false}}
function openLines(id){if(!started)return;pv=id?{m:"line",id,tab:"info"}:{m:"list",id:null,tab:"info"};$("ov2").hidden=false;render2()}
function poiHtml(){const p=POIS.find(x=>x.id===pv.id);if(!p)return"";const wd=(day-1)%7,todayEst=Math.round(p.base*poiMult(p,wd)*(p.bonus?1.2:1)),wkdy=Math.round(p.base*poiMult(p,0)),wknd=Math.round(p.base*poiMult(p,5));
 return gh(p.active?"tealg":"purp",`${poiSvg(p,20)} ${p.name}`,p.area)+`<div class="tl2"><div class="tile"><b>${p.active?"✅ Bağlı":"⛔ Bağlı değil"}</b><small>Durum</small></div><div class="tile"><b>~${fmt(todayEst)}</b><small>Bugün tahmini yolcu</small></div><div class="tile"><b>${p.bonus?"+%20 Aktif":p.active?"Standart":"Bekleniyor"}</b><small>Bağlantı bonusu</small></div></div><p style="font-size:13px;color:var(--mut);margin:8px 0"><b>Talep profili:</b> ${poiTypeLabel(p)}<br>Hafta içi ~${fmt(wkdy)} · Hafta sonu ~${fmt(wknd)} yolcu/gün</p>`+(p.active?`<div class="lcard" style="border-left-color:#22c55e"><b>🚇 Hizmet veren hatlar</b><br><small>${p.lines.map(k=>lineName(k)).join(", ")}</small><br><small>1 km içindeki duraklar: ${p.near.map(n=>`${n.name} (${Math.round(n.d*1000)} m)`).join(", ")}</small></div>`:`<p style="font-size:13px;color:var(--mut)">💡 Bu çekim merkezinin <b>1 km</b> yakınına aktif bir metro istasyonu kurarak yolcularını toplayabilirsin.</p>`)+`<div class="da" style="justify-content:space-between;align-items:center;margin-top:8px"><small style="color:var(--mut);font-size:11.5px">🎁 2+ mahalleye veya Bursaray'a bağlanırsa +%20 bonus.</small><button class="pri" data-a="focusPoi" data-id="${p.id}">📍 Haritada Gör</button></div>`}
function openReport(dRef,isAuto){
 if(!started)return;
 pv={m:"report",day:dRef||day,auto:!!isAuto};
 $("ov2").hidden=false;
 if(isAuto)SFX.ach();else SFX.open();
 render2();
}
function calcReportData(dRef){
 const cov=cityCov(),poiC=POIS.filter(p=>p.active).length,poiPct=POIS.length?poiC/POIS.length:0,ls=allL(),totSt=actv.length;
 let sc=cov*.42+sat*.28+poiPct*18+Math.min(14,ls.length*2.4)+Math.min(10,ctWon*2)+(lastNet>0?Math.min(8,lastNet*1.1):Math.max(-10,lastNet));
 sc=Math.max(0,Math.min(100,Math.round(sc)));
 const grade=sc>=92?["S+","#7c3aed,#db2777","Efsanevi Metropol Ağı"]:sc>=84?["S","#0f766e,#1d6fd1","Örnek Raylı Sistem"]:sc>=72?["A","#16a34a,#0d9488","Başarılı Şehir İşletmesi"]:sc>=58?["B","#f59e0b,#d97706","Gelişen Ulaşım Ağı"]:sc>=44?["C","#ea580c,#c2410c","Kırılgan İşletme"]:["D","#dc2626,#991b1b","Acil Reform Gerekli"];
 const mNote=sc>=84?`${corp}, Bursa'nın dört bir yanını raylarla buluşturdu. Büyükşehir Belediyesi performansından son derece memnun.`:sc>=65?`Ağ büyüyor ve yolcu memnuniyeti dengeli. Çekim merkezlerine bağlanarak ${grade[0]} seviyesinin üzerine çıkabilirsin.`:`Bursa'da kapsama alanı veya hat kapasitesi henüz yeterli değil. Yeni hatlar açıp sefer sıklığını artırman öneriliyor.`;
 return{d:dRef||day,sc,grade,cov,poiC,lsCount:ls.length,totSt,mNote};
}
function drawReportMiniMap(cvEl){
 if(!cvEl)return;
 const ctx=cvEl.getContext("2d"),w=cvEl.width,h=cvEl.height,dk=isDark();
 ctx.clearRect(0,0,w,h);
 ctx.fillStyle=dk?"#111827":"#f1ede2";ctx.fillRect(0,0,w,h);
 let minLo=28.86,maxLo=29.26,minLa=40.145,maxLa=40.275;
 actv.forEach(s=>{minLo=Math.min(minLo,s.lo-.02);maxLo=Math.max(maxLo,s.lo+.02);minLa=Math.min(minLa,s.la-.012);maxLa=Math.max(maxLa,s.la+.012)});
 const pad=18,sx=lo=>pad+((lo-minLo)/(maxLo-minLo||1))*(w-pad*2),sy=la=>h-pad-((la-minLa)/(maxLa-minLa||1))*(h-pad*2);
 ctx.strokeStyle=dk?"rgba(148,163,184,.16)":"rgba(100,116,139,.18)";ctx.lineWidth=1;
 D.dist.forEach(d=>d.rings.forEach(r=>{ctx.beginPath();for(let i=0;i<r.length;i+=2){const x=sx(r[i]),y=sy(r[i+1]);i?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.closePath();ctx.stroke()}));
 ctx.strokeStyle=dk?"rgba(56,189,248,.28)":"rgba(14,165,233,.32)";ctx.lineWidth=2;
 D.riv.forEach(r=>{ctx.beginPath();for(let i=0;i<r.length;i+=2){const x=sx(r[i]),y=sy(r[i+1]);i?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.stroke()});
 ctx.lineCap="round";ctx.lineJoin="round";
 D.bl.forEach(l=>{const o=owned[l.id];ctx.beginPath();for(let i=0;i<l.path.length;i+=2){const x=sx(l.path[i]),y=sy(l.path[i+1]);i?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.strokeStyle=CFG[l.id].color;ctx.globalAlpha=o?.95:.22;ctx.lineWidth=o?4:2;ctx.stroke()});
 ctx.globalAlpha=1;
 lines.forEach(l=>{const fc=lineFullCoords(l.ids,l.ring,l.wps);if(fc.length<4)return;ctx.beginPath();for(let i=0;i<fc.length;i+=2){const x=sx(fc[i]),y=sy(fc[i+1]);i?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.strokeStyle=l.color;ctx.lineWidth=l.type==="tram"?3:4;ctx.stroke()});
 actv.forEach(s=>{ctx.beginPath();ctx.arc(sx(s.lo),sy(s.la),3,0,Math.PI*2);ctx.fillStyle="#fff";ctx.fill();ctx.lineWidth=1.5;ctx.strokeStyle="#0f172a";ctx.stroke()});
}
function downloadReportPng(dRef){
 const rp=calcReportData(dRef),cvO=document.createElement("canvas");cvO.width=920;cvO.height=620;
 const c=cvO.getContext("2d");
 c.fillStyle="#0f172a";c.fillRect(0,0,920,620);
 const gr=c.createLinearGradient(0,0,920,120);gr.addColorStop(0,"#1e3a8a");gr.addColorStop(1,"#0f766e");
 c.fillStyle=gr;c.fillRect(0,0,920,112);
 c.fillStyle="#fff";c.font="900 30px system-ui";c.fillText("BURSA ULAŞIM KARNESİ",32,48);
 c.font="600 16px system-ui";c.fillStyle="rgba(255,255,255,.85)";
 const modTxt=isSandbox()?"Sandbox Modu":(DIFFS[diff].name+" Zorluk");
 c.fillText(`${corp} · ${rp.d}. Gün (${modTxt})`,32,82);
 c.fillStyle="#f59e0b";c.beginPath();c.roundRect?c.roundRect(760,20,128,72,16):c.rect(760,20,128,72);c.fill();
 c.fillStyle="#1e293b";c.font="900 40px system-ui";c.textAlign="center";c.fillText(rp.grade[0],824,66);
 c.font="700 12px system-ui";c.fillText("PUAN "+rp.sc+"/100",824,84);c.textAlign="left";
 const mapC=document.createElement("canvas");mapC.width=856;mapC.height=240;drawReportMiniMap(mapC);
 c.drawImage(mapC,32,130);
 const boxes=[["🏙️ Kapsama","%"+rp.cov.toFixed(1).replace(".",",")],["👥 Günlük Yolcu",fmt(lastPax)],["💰 Günlük Net",(lastNet>=0?"+":"")+MM(lastNet)],["😊 Memnuniyet","%"+Math.round(sat)],["🚇 Hat / Durak",`${rp.lsCount} hat · ${rp.totSt} durak`],["📍 Merkez / İhale",`${rp.poiC}/${POIS.length} · ${ctWon} ihale`]];
 boxes.forEach(([k,v],i)=>{const x=32+(i%3)*292,y=390+Math.floor(i/3)*92;c.fillStyle="#1e293b";c.fillRect(x,y,272,76);c.fillStyle="#94a3b8";c.font="600 13px system-ui";c.fillText(k,x+16,y+28);c.fillStyle="#f8fafc";c.font="800 22px system-ui";c.fillText(v,x+16,y+58)});
 c.fillStyle="#94a3b8";c.font="500 13px system-ui";c.fillText(rp.mNote.slice(0,115),32,598);
 const a=document.createElement("a");a.download=`bursa-ulasim-karnesi-gun-${rp.d}.png`;a.href=cvO.toDataURL("image/png");document.body.appendChild(a);a.click();a.remove();
 SFX.coin();toast("📸 Ulaşım Karnesi PNG olarak indirildi!");
}
function reportHtml(){
 const rp=calcReportData(pv.day||day),yr=rp.d>=365?` · ${Math.floor(rp.d/365)}. Yıl Karnesi`:"";
 const modTxt=isSandbox()?"🧪 Sandbox":(DIFFS[diff].ic+" "+DIFFS[diff].name+" Zorluk");
 return gh("tealg","📜 Bursa Ulaşım Karnesi",`${corp} · ${rp.d}. Gün${yr} · ${modTxt}`)+
  `<div class="rep-top"><div class="rep-grade" style="background:linear-gradient(135deg,${rp.grade[1]})"><b>${rp.grade[0]}</b><small>${rp.sc}/100</small></div><div style="flex:1;min-width:0"><h3 style="margin:0 0 4px;font-size:17px">${rp.grade[2]}</h3><small style="color:var(--mut);display:block;line-height:1.4">Sonraki otomatik karne günleri: 60, 120, 180, 365 ve her yeni yıl. İşletme Merkezi’nden istediğin an görüntüleyebilirsin.</small></div></div>`+
  `<div class="tl2"><div class="tile"><b>%${rp.cov.toFixed(1).replace(".",",")}</b><small>🏙️ Kapsama</small></div><div class="tile"><b>${fmt(lastPax)}</b><small>👥 Günlük Yolcu</small></div><div class="tile"><b style="color:${lastNet<0?"#e63946":"#2a9d8f"}">${lastNet>=0?"+":""}${MM(lastNet)}</b><small>💰 Günlük Net</small></div><div class="tile"><b>%${Math.round(sat)} ${satEmoji()}</b><small>😊 Memnuniyet</small></div><div class="tile"><b>${rp.lsCount} / ${rp.totSt}</b><small>🚇 Hat / İstasyon</small></div><div class="tile"><b>${rp.poiC}/${POIS.length} · ${ctWon}</b><small>📍 Merkez / İhale</small></div></div>`+
  `<div class="rep-map-box"><small><span>🗺 Bursa Ağ Haritası Özeti</span><span>${rp.lsCount} aktif hat</span></small><canvas id="repMap" width="620" height="190"></canvas></div>`+
  `<div class="rep-note">🏛 <b>Büyükşehir Belediyesi Değerlendirmesi:</b> ${rp.mNote}</div>`+
  `<div class="da" style="margin-top:10px;justify-content:space-between;flex-wrap:wrap"><button id="dlRep" class="pri">📸 PNG İndir</button><button data-a="close">✔ Haritaya Dön</button></div>`;
}
function helpHtml(){
 const df=isSandbox()?"🧪 Sandbox (Sınırsız Bütçe & Açık Araçlar)":(DIFFS[diff].ic+" "+DIFFS[diff].name+" Zorluk (×"+diffMult().toFixed(2)+")");
 return gh("purp","🧭 Rehber &amp; Kısayollar",df)+
  `<div class="kv"><span><b>Boşluk (Space)</b></span><span>Oyunu Duraklat / Devam Et</span></div>`+
  `<div class="kv"><span><b>1 / 2 / 3</b></span><span>Oyun Hızı (×1 / ×2 / ×4)</span></div>`+
  `<div class="kv"><span><b>H</b></span><span>Haritayı Bursa Merkezine Odakla</span></div>`+
  `<div class="kv"><span><b>M</b></span><span>Tüm Sesleri Aç / Kapat</span></div>`+
  `<div class="kv"><span><b>Esc</b></span><span>Açık Paneli Kapat veya Çizimi İptal Et</span></div>`+
  `<p style="font-size:13px;color:var(--mut);margin:12px 0">💡 Haritada hareket halindeki tren veya tramvaylara tıklayarak <b>Takip Modu</b>na geçebilir ve ray seslerini dinleyebilirsin. İhaleler ve çekim merkezleri kârını hızla artırır.</p>`+
  `<div class="da" style="margin-top:12px"><button data-a="reopenGuide" class="pri">🧭 Başlangıç Rehberini Göster</button><button data-a="close">Kapat</button></div>`;
}
function render2(){const ov2=$("ov2"),cd2=$("cd2"),nk=`${pv.m}:${pv.id||""}:${pv.tab||""}`,same=cd2.dataset.vk===nk;
 if(same&&typeof document!=="undefined"&&document.activeElement&&document.activeElement.id==="lname")return;
 const ovTop=ov2.scrollTop,secTops=same?[...cd2.querySelectorAll(".pgin>section")].map(s=>s.scrollTop):[],rsLeft=same?(cd2.querySelector(".rstrip")||{}).scrollLeft||0:0;
 let h="";const hd=t=>`<div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><h2 style="margin:0">${t}</h2><button data-a="close">✕</button></div>`;
 if(pv.m==="fin")h=finHtml(hd);else if(pv.m==="list")h=listHtml(hd);else if(pv.m==="goals")h=goalsHtml();else if(pv.m==="line")h=lineHtml(hd);else if(pv.m==="hq")h=hqHtml();else if(pv.m==="mkt")h=mktHtml();else if(pv.m==="loan")h=loanHtml();else if(pv.m==="poi")h=poiHtml();else if(pv.m==="ct")h=contractsHtml();else if(pv.m==="report")h=reportHtml();else if(pv.m==="help")h=helpHtml();
 cd2.innerHTML=h;cd2.dataset.vk=nk;
 if(pv.m==="report"){drawReportMiniMap($("repMap"));const dl=$("dlRep");if(dl)dl.onclick=()=>downloadReportPng(pv.day||day)}
 checkGuideAuto();if(typeof renderGuide==="function")renderGuide();
 const lnm=$("lname");if(lnm)lnm.oninput=e=>{const l=lines.find(x=>x.key===pv.id);if(!l)return;l.name=e.target.value.trim()||"Hat";const h2=cd2.querySelector(".lh h2");if(h2)h2.textContent=l.name;if(follow&&follow.key===l.key)updFollowBar();sv()};
 const lcp=$("lcolp");if(lcp)lcp.oninput=e=>{const l=lines.find(x=>x.key===pv.id);if(!l)return;l.color=e.target.value;const lh=cd2.querySelector(".lh"),rs=cd2.querySelector(".rstrip");if(lh)lh.style.setProperty("--c",l.color);if(rs)rs.style.setProperty("--lc",l.color);if(follow&&follow.key===l.key)updFollowBar();dirty=true;sv()};
 if(same){ov2.scrollTop=ovTop;[...cd2.querySelectorAll(".pgin>section")].forEach((s,i)=>{if(secTops[i])s.scrollTop=secTops[i]});const rs=cd2.querySelector(".rstrip");if(rs&&rsLeft)rs.scrollLeft=rsLeft}else ov2.scrollTop=0;renderHoverTip()}
$("cd2").onclick=e=>{const t=e.target.closest("[data-a],[data-b]");if(!t)return;if(t.dataset.b){buy(t.dataset.b);render2();return}const a=t.dataset.a;
 if(a==="close"){SFX.close();$("ov2").hidden=true;renderHoverTip()}else if(a==="back"){SFX.click();pv={m:"list",id:null,tab:"info"};render2()}else if(a==="open"){SFX.open();pv={m:"line",id:t.dataset.id,tab:"info"};render2()}else if(a==="tab"){SFX.tab();pv.tab=t.dataset.t;render2()}
 else if(a==="hq"){SFX.open();pv={m:"hq",tab:t.dataset.f?"fleet":"info",pg:0};render2()}
 else if(a==="mkt"){SFX.open();mktCat="metro";pv={m:"mkt",tab:"info",pg:0};render2()}
 else if(a==="fin"){SFX.open();pv={m:"fin",tab:"info",pg:0};render2()}
 else if(a==="report"){openReport(day,false)}
 else if(a==="reopenGuide"){guideStep=0;guideDone=false;$("ov2").hidden=true;SFX.open();renderGuide();sv()}
 else if(a==="pg"){SFX.tab();pv.pg=+t.dataset.p;fpg()}
 else if(a==="goals"){SFX.open();pv={m:"goals",tab:"g"};render2()}
 else if(a==="gtab"){SFX.tab();pv.tab=t.dataset.t;render2()}
 else if(a==="accCt"){acceptCt(t.dataset.id)}
 else if(a==="lflt"){listFilter=t.dataset.f||"all";SFX.tab();render2()}
 else if(a==="autoBalanceAll"){autoBalanceAll()}
 else if(a==="autoBalLine"){const r=autoBalanceLine(t.dataset.id,false);if(r.added+r.removed>0){SFX.up();toast(`⚡ ${lineName(t.dataset.id)} dengelendi (${r.added} eklendi, ${r.removed} çekildi)`);render2()}else{SFX.warn();toast("Depoda uygun araç yok veya hat zaten dengede.")}}
 else if(a==="lcol"){const l=lines.find(x=>x.key===pv.id);if(!l)return;l.color=t.dataset.c;SFX.step(1);if(follow&&follow.key===l.key)updFollowBar();ui();render2()}
 else if(a==="follow"){const o=owned[pv.id]||lines.find(l=>l.key===pv.id);if(!o||trainsOf(o)<1){SFX.err();return}camAnim=null;follow={key:pv.id,k:0};updFollowBar();$("ov2").hidden=true;SFX.toggle(true);dirty=true}
 else if(a==="claim"){const g=GL.find(x=>x.id===t.dataset.g);if(!g||!gready(g)){SFX.err();return}const r=g.T[gi(g)][1];if(!isSandbox())budget+=r;LG("odul",r);gp[g.id]=gi(g)+1;SFX.coin();toast("🎁 "+g.t+" ödülü: +₺"+r+"M");ui();render2()}
 else if(a==="hw"){const o=owned[pv.id]||lines.find(l=>l.key===pv.id);if(!o)return;const fl=o.fl||3;let i=o.hw?HWL.indexOf(o.hw):HWL.findIndex(x=>x>=Math.round(o.hE||10));if(i<0)i=HWL.length-1;i=Math.min(HWL.length-1,Math.max(0,i+(+t.dataset.d)));while(HWL[i]<fl)i++;o.hw=HWL[i];SFX.step(-(+t.dataset.d));refresh();ui();if(o.hw<(o.hm||99)-.5)toast("⚠ Aktif filo bu sıklığı kaldırmayacak: en fazla ~"+Math.round(o.hm)+" dk'da sefer yapabilir.");render2()}
 else if(a==="hwauto"){const o=owned[pv.id]||lines.find(l=>l.key===pv.id);if(!o)return;o.hw=0;SFX.click();refresh();ui();render2()}
 else if(a==="fare"){const o=owned[pv.id]||lines.find(l=>l.key===pv.id);if(!o)return;o.fare=Math.min(2,Math.max(.5,Math.round(((o.fare||1)+.1*(+t.dataset.d))*10)/10));SFX.step(+t.dataset.d);refresh();ui();render2()}
 else if(a==="loanp"){SFX.open();pv={m:"loan",tab:"info",pg:0,restruct:false};render2()}
 else if(a==="restructToggle"){if(isSandbox()||loan.p<1)return;SFX.tab();pv.restruct=!pv.restruct;render2()}
 else if(a==="pickPlan"){
  if(isSandbox()||loan.p<1)return;
  const op=LOAN_PLANS.find(x=>x.days===+t.dataset.d);if(!op)return;
  const tot=Math.round(loan.p*(1+op.rate)*100)/100,daily=Math.round((tot/op.days)*100)/100;
  loan.p=tot;loan.plan={daysTotal:op.days,left:op.days,daily,rate:op.rate};
  pv.restruct=false;SFX.coin();toast(`🔄 Borç ${op.days} günlük takside bölündü: günde ₺${daily.toFixed(2)}M`);ui();render2()
 }
 else if(a==="loan"){if(isSandbox())return;const n=+t.dataset.n;if(loan.p+n>lim()){SFX.err();toast("Kredi limiti aşıldı.");return}const hadPlan=!!loan.plan;loan.p=Math.round((loan.p+n)*100)/100;loan.plan=null;budget+=n;LG("kredi",n);stat.loanTaken=1;SFX.coin();toast(hadPlan?"🏦 +₺"+n+"M kredi alındı (taksit planı sıfırlandı)":"🏦 ₺"+n+"M kredi alındı");ui();render2()}
 else if(a==="repay"){if(isSandbox())return;const n=Math.min(+t.dataset.n,loan.p);if(n<=0||!hasMoney(n)){SFX.err();toast("Yetersiz bütçe.");return}loan.p=Math.max(0,Math.round((loan.p-n)*100)/100);budget-=n;if(loan.p<=0.05){loan.p=0;loan.plan=null}else if(loan.plan){loan.plan.daily=Math.round((loan.p/Math.max(1,loan.plan.left))*100)/100}SFX.coin();ui();render2()}
 else if(a==="atl"){const ap=atcPrice(atl);if(atl>=3||!hasMoney(ap)){SFX.err();return}pay("yuk",ap);atl++;SFX.up();toast("🏭 Bakım atölyesi seviye "+atl);ui();render2()}
 else if(a==="autoRenew"){autoRenew=!autoRenew;SFX.toggle(autoRenew);toast(autoRenew?"🤖 Otomatik filo yenileme açıldı":"🤖 Otomatik filo yenileme kapatıldı");ui();render2()}
 else if(a==="renewAll"){const ks=ALL_VK().filter(k=>totalOf(k)>0&&fa[k]>=250),cost=ks.reduce((a,k)=>a+rc(k),0);if(!ks.length||!hasMoney(cost)){SFX.err();toast("Yetersiz bütçe.");return}pay("vagon",cost);ks.forEach(k=>fa[k]=0);SFX.up();toast(`🔄 ${ks.length} filo grubunun tamamı yenilendi (−₺${cost.toFixed(1)}M)`);ui();render2()}
 else if(a==="renew"){const k=t.dataset.t,c=rc(k);if(!hasMoney(c)){SFX.err();return}pay("vagon",c);fa[k]=0;SFX.up();toast(VT[k].ic+" "+VT[k].n+" filosu yenilendi");ui();render2()}
 else if(a==="focusLine"){const lk=t.dataset.id;let lo=L0,la=A0;if(lk[0]==="B"){const b=D.bl.find(x=>x.id===lk);if(b&&b.sts.length){const s=b.sts[Math.floor(b.sts.length/2)];lo=s[1];la=s[2]}}else{const ul=lines.find(x=>x.key===lk);if(ul&&ul.ids.length){const s=S(ul.ids[Math.floor(ul.ids.length/2)]);if(s){lo=s.lo;la=s.la}}}$("ov2").hidden=true;focusOn(lo,la,0.20);SFX.click()}
 else if(a==="focusPoi"){const p=POIS.find(x=>x.id===t.dataset.id);if(!p)return;$("ov2").hidden=true;focusOn(p.lo,p.la,0.12);SFX.click()}
 else if(a==="jumpSt"){const rawId=t.dataset.id,sid=rawId.startsWith("b:")?rawId:+rawId,s=S(sid);if(!s)return;$("ov2").hidden=true;sel=s.id;panel();focusOn(s.lo,s.la,0.10);SFX.click();ui()}
 else if(a==="qadd"){const lk=t.dataset.id,k=t.dataset.t,o=owned[lk]||lines.find(l=>l.key===lk),v=VT[k];if(!o||!v||dep[k]<v.setSize){SFX.err();return}dep[k]-=v.setSize;o.tr[k]=(o.tr[k]||0)+1;v.cat==="tram"?SFX.tram():SFX.train(true);refresh();toast(`➕ ${lineName(lk)} hattına ${v.ic} ${v.n} eklendi!`);ui();render2()}
 else if(a==="qbuyadd"){const lk=t.dataset.id,k=t.dataset.t,o=owned[lk]||lines.find(l=>l.key===lk),v=VT[k];if(!o||!v||!isUnlocked(k)){SFX.err();return}const cst=Math.round(vp(k)*v.setSize*10)/10;if(!hasMoney(cst)){SFX.err();toast("Yetersiz bütçe.");return}const N=totalOf(k);fa[k]=(fa[k]*N)/(N+v.setSize);pay("vagon",cst);o.tr[k]=(o.tr[k]||0)+1;v.cat==="tram"?SFX.tram():SFX.train(true);refresh();toast(`🛒 ${lineName(lk)} hattına yeni ${v.ic} ${v.n} alındı & eklendi (−₺${cst}M)`);ui();render2()}
 else if(a==="newg"){save();SFX.close();started=false;follow=null;updFollowBar();$("ov2").hidden=true;$("ov").hidden=false;intro();ui()}
 else if(a==="lexp"){const o=owned[pv.id]||lines.find(l=>l.key===pv.id);if(!o)return;o.exp=!o.exp;SFX.toggle(!!o.exp);refresh();ui();toast(o.exp?"⚡ "+lineName(pv.id)+": Ekspres hat modu açıldı!":"Ekspres hat modu kapatıldı.");render2()}
 else if(a==="lnight"){const o=owned[pv.id]||lines.find(l=>l.key===pv.id);if(!o)return;o.night=!o.night;SFX.toggle(!!o.night);refresh();ui();toast(o.night?"🦉 "+lineName(pv.id)+": Gece seferleri başlatıldı!":"Gece seferleri kapatıldı.");render2()}
 else if(a==="sched"){const o=owned[pv.id]||lines.find(l=>l.key===pv.id);if(!o||!SCHEDULES[t.dataset.sc])return;o.sched=t.dataset.sc;SFX.tab();refresh();ui();toast(`🕒 ${lineName(pv.id)}: ${SCHEDULES[o.sched].n} çizelgesi seçildi`);render2()}
 else if(a==="stSort"){pv.stSort=pv.stSort==="top"?"route":"top";SFX.tab();render2()}
 else if(a==="upstLine"){const sid=+t.dataset.id,s=S(sid);if(!s||typeof s.id!=="number")return;const lvl=s.lvl||1,nxCost=lvl===1?Math.round(12*diffMult()):lvl===2?Math.round(22*diffMult()):0;if(!nxCost||!hasMoney(nxCost)){SFX.err();toast("Yetersiz bütçe.");return}pay("yuk",nxCost);s.lvl=lvl+1;fxTap(s,"#f59e0b");SFX.up();toast(`🚉 ${s.name} Seviye ${s.lvl} oldu!`);refresh();ui();render2()}
 else if(a==="tariff"){const tf=t.dataset.tf;if(!TARIFFS[tf]||tariff===tf)return;tariff=tf;SFX.tab();refresh();ui();toast("🎟 Şehir tarifesi güncellendi: "+TARIFFS[tf].n);render2()}
 else if(a==="mcat"){const nextCat=t.dataset.c==="tram"?"tram":"metro";if(mktCat!==nextCat){mktCat=nextCat;pv.pg=mktCat==="tram"?1:0;SFX.tab();mpg()}}
 else if(a==="vlock"){const k=t.dataset.t,v=VT[k];if(!v)return;SFX.lock();toast("🔒 "+v.ic+" "+v.n+" henüz kilitli · "+v.unlockDay+". günde açılır (Kalan: "+Math.max(1,v.unlockDay-day)+" gün)");}
 else if(a==="buyv"){buyW(t);return}else if(a==="buyv0"){const k=t.dataset.t,n=+t.dataset.n;if(!isUnlocked(k)){SFX.lock();toast("🔒 "+VT[k].n+" kilitli ("+VT[k].unlockDay+". günde açılır).");return}const cst=vp(k)*n;if(!hasMoney(cst)){SFX.err();toast("Yetersiz bütçe.");return}pay("vagon",cst);dep[k]+=n;VT[k].cat==="tram"?SFX.tram():SFX.train(true);toast(VT[k].ic+" "+n+" "+VT[k].n+" depoya eklendi");ui();render2()}
 else if(a==="sellv"){const k=t.dataset.t;if(dep[k]<1){SFX.err();return}dep[k]--;pay("vagon",-vp(k)/2);SFX.coin();ui();render2()}
 else if(a==="tr"){const o=owned[t.dataset.k]||lines.find(l=>l.key===t.dataset.k),k=t.dataset.t;if(!o||!VT[k])return;const cat=o.type==="tram"?"tram":"metro";if(VT[k].cat!==cat){SFX.err();toast(cat==="tram"?"Tramvay hattına sadece tramvay seti atanabilir.":"Metro hattına sadece metro vagonu atanabilir.");return}const need=VT[k].setSize;if(+t.dataset.d>0){if(dep[k]<need){SFX.err();toast("Depoda "+need+" "+VT[k].n+(VT[k].cat==="tram"?" seti":" vagon")+" yok. Piyasadan satın al.");return}dep[k]-=need;o.tr[k]=(o.tr[k]||0)+1;VT[k].cat==="tram"?SFX.tram():SFX.train(true)}else{if(!(o.tr[k]>0)){SFX.err();return}o.tr[k]--;dep[k]+=need;SFX.train(false)}refresh();ui();render2()}
 else if(a==="up"){const u=UPG.find(x=>x.k===t.dataset.k),o=owned[pv.id]||lines.find(l=>l.key===pv.id);if(!o||o[u.k])return;const up=upgPrice(u);if(!hasMoney(up)){SFX.err();return}pay("yuk",up);o[u.k]=true;if(owned[pv.id])calcB(pv.id,1);else calcU(o,1);sums();SFX.up();toast(u.name+" tamamlandı (−₺"+up+"M).");ui();render2()}
 else if(a==="ext"){const l=lines.find(x=>x.key===pv.id);if(!l||cur||moveSt!=null)return;buildSt=false;follow=null;updFollowBar();SFX.open();cur={extend:l.key,end:"tail",name:l.name,color:l.color,type:l.type||"metro",mode:l.mode||"surface",ring:!!l.ring,ids:[...l.ids],segs:[...l.segs],wps:cloneWps(l.wps),pendingWps:[],wpMode:false,newIds:[],extOps:[]};$("ov2").hidden=true;sel=null;panel();msg("Uzatma başladı: Başına veya Sonuna durak ekleyebilirsin.");ui()}
 else if(a==="ins"){const l=lines.find(x=>x.key===pv.id);if(!l||cur||moveSt!=null)return;buildSt=false;follow=null;updFollowBar();SFX.open();cur={insert:l.key,name:l.name,color:l.color,type:l.type||"metro",mode:l.mode||"surface",ring:!!l.ring,ids:[...l.ids],segs:[...l.segs],wps:cloneWps(l.wps),newIds:[],insOps:[]};$("ov2").hidden=true;sel=null;panel();msg("Ara durak ekleme başladı: haritada bir nokta veya mevcut bir istasyon seç.");ui()}
 else if(a==="bend"){const l=lines.find(x=>x.key===pv.id);if(!l||cur||moveSt!=null)return;buildSt=false;follow=null;updFollowBar();SFX.open();cur={bend:l.key,name:l.name,color:l.color,type:l.type||"metro",mode:l.mode||"surface",ring:!!l.ring,ids:[...l.ids],segs:[...l.segs],origSegs:[...l.segs],wps:cloneWps(l.wps),origWps:cloneWps(l.wps)};$("ov2").hidden=true;sel=null;panel();msg("Güzergâh bükme: ray ortasındaki '+' simgesini sürükle, noktaya tıklayarak sil.");ui()}
 else if(a==="del"){const l=lines.find(x=>x.key===pv.id);if(l){SFX.del();if(follow&&follow.key===l.key){follow=null;updFollowBar()}pay("insaat",-Math.round(l.segs.reduce((x,y)=>x+y,0)/2));for(const t in l.tr)if(VT[t])dep[t]+=VT[t].setSize*l.tr[t];lines=lines.filter(x=>x!==l);if(crisis&&crisis.line===l.key)crisis=null;refresh();pv={m:"list",id:null,tab:"info"};ui();render2()}}};
$("cd2").onchange=e=>{if(e.target&&e.target.id==="lsrt"){listSort=e.target.value||"def";SFX.tab();render2()}};
$("ov2").onclick=e=>{if(e.target.id==="ov2"){SFX.close();$("ov2").hidden=true;renderHoverTip()}};
$("hb").onclick=()=>{SFX.open();openLines()};
const LG=(k,a)=>led[k]=(led[k]||0)+a,pay=(k,a)=>{if(!isSandbox())budget-=a;LG(k,a)},hwOf=o=>trainsOf(o)?Math.round(o.hE||(((o.type==="tram"?3.1:2.4)*(o.km||18)+3)/trainsOf(o))):"–";
function book(o){o.earn+=o.total;if(!isSandbox())budget+=o.total;LG("bilet",o.ticket);LG("ticari",o.comm);for(const k in o.cx)LG(k,o.cx[k])}
function costs(o,n,k){const dm=opMult(),em=o.exp?1.15:1,nm=o.night?1.18:1,sm=schedOf(o).costM,trm=o.type==="tram",bk=(trm?.012*n:.025*n)*dm,pr=(trm?.006*n:.01*n)*dm,rk=(trm?.004*k:.01*k)*dm,x=o.cx={bakim:bk,filo:o.fu*(.4+.6*(o.s||1))*em*nm*dm*sm,personel:(pr+.008*o.wag*(.4+.6*(o.s||1)))*nm*dm*sm,ray:rk};o.cs=x.bakim+x.filo+x.personel+x.ray}
/* talep: mahalle nüfusu en yakın istasyonlara paylaştırılır; hat açılıp kapanınca ve şehir büyüdükçe güncellenir */
function loads(it){it.forEach(a=>a.load=0);D.mah.forEach(h=>{h.c2=0;let tot=0,mx=0,mxCov=0;const ws=[];for(const a of it){const R=stRad(a.s),d=Math.hypot((h[1]-a.s.lo)*KX,h[2]-a.s.la)*111.32;if(d<R){const cov=1-d/R,w=cov*stBon(a.s);ws.push([a,w]);tot+=w;if(w>mx)mx=w;if(cov>mxCov)mxCov=cov}}if(!ws.length)return;h.c2=mxCov;const gen=h.cur*.22*mx;for(const [a,w] of ws)a.load+=gen*w/tot})}
function grow(){D.mah.forEach(h=>{const t=h.pop*(1+.4*h.cov)*(1+day/365*.03);h.cur+=(t-h.cur)*.015})}
function nearSt(h){let m=1e9,b=null;actv.forEach(s=>{const d=Math.hypot((h[1]-s.lo)*KX,h[2]-s.la)*111.32;if(d<m){m=d;b=s}});return[b,m]}
function recalc(){const M=new Map(),add=(s,k)=>{if(!s)return;let a=M.get(s.id);if(!a)M.set(s.id,a={s,ks:new Set(),load:0});a.ks.add(k)};
 for(const id in owned)BS.forEach(b=>b.ln.includes(id)&&add(b,id));lines.forEach(l=>l.ids.forEach(i=>add(S(i),l.key)));
 const A=[...M.values()],actSet=new Set(A.map(a=>a.s.id));actv=A.map(a=>a.s);loads(A);D.mah.forEach(h=>h.cov=h.c2);
 BS.forEach(s=>{if(!actSet.has(s.id))s.q=0});st.forEach(s=>{if(!actSet.has(s.id))s.q=0});
 A.forEach(a=>{const lv=(a.s.lvl||1)-1;a.s.qRate=Math.min(1.65,.22+(a.load||0)/4200);a.s.qMax=Math.min(24,Math.max(8,Math.round(8+(a.load||0)/1100)+lv*4));if(a.s.q==null)a.s.q=0});
 const LL={};ST_ANAL.clear();
 A.forEach(a=>{const hasB=[...a.ks].some(k=>k[0]==="B"),uCnt=[...a.ks].filter(k=>k[0]!=="B").length,div=(hasB?1:0)+uCnt||1;const byLine=new Map();a.ks.forEach(k=>{LL[k]=(LL[k]||0)+a.load/div;byLine.set(k,{mah:a.load/div,poi:0})});ST_ANAL.set(a.s.id,{mahTotal:a.load,poiTotal:0,byLine})});
 for(const id in owned){const o=owned[id];o.rr=base[id]?(LL[id]||0)/base[id]:1;o.feed=Math.min(.2,.04*lines.filter(l=>l.ids.some(i=>typeof i==="string"&&S(i).ln.includes(id))).length)}
 const adj=new Map();A.forEach(a=>{for(const x of a.ks){if(!adj.has(x))adj.set(x,new Set());for(const y of a.ks)if(x!==y)adj.get(x).add(y)}});
 lines.forEach(l=>{l.ld=LL[l.key]||0;
  const vis=new Set([l.key]),q=[l.key];while(q.length){const u=q.shift();(adj.get(u)||[]).forEach(v=>{if(!vis.has(v)){vis.add(v);q.push(v)}})}
  const direct=adj.get(l.key)||new Set(),uDirect=[...direct].filter(x=>x[0]!=="B").length,
   burDirect=l.ids.some(i=>typeof i==="string"&&S(i).ln.some(x=>owned[x])),burUnowned=l.ids.some(i=>typeof i==="string"),
   reachBur=[...vis].some(x=>x[0]==="B"),netLines=vis.size,
   burPart=burDirect?.35:reachBur?.22:burUnowned?.1:0,uPart=.12*Math.min(3,uDirect),
   netPart=.05*Math.min(5,Math.max(0,netLines-1-uDirect-(burDirect?1:0))),
   transMult=1+burPart+uPart+netPart;
  l.bonus=(1+.03*(l.ids.length-2))*transMult;
  l.netInfo={bur:burDirect,reachBur,uDirect,netLines,pct:Math.round((transMult-1)*100)}});
 const wd=(day-1)%7,linePoiBonus={};
 const lineSts=k=>k[0]==="B"?BS.filter(b=>b.ln.includes(k)):((lines.find(l=>l.key===k)||{}).ids||[]).map(S);
 [...Object.keys(owned),...lines.map(l=>l.key)].forEach(k=>{
  const sts=lineSts(k),ul=k[0]==="B"?null:lines.find(l=>l.key===k);
  let mahCnt=0;for(const h of D.mah){if(sts.some(s=>Math.hypot((h[1]-s.lo)*KX,h[2]-s.la)*111.32<1.2)){mahCnt++;if(mahCnt>=2)break}}
  linePoiBonus[k]=k[0]==="B"||!!(ul&&ul.netInfo&&ul.netInfo.reachBur)||mahCnt>=2});
 poiLoad={};
 POIS.forEach(p=>{
  const near=[];let totW=0;
  A.forEach(a=>{const d=km(p,a.s);if(d<=1.0){const w=Math.max(.15,1-d/1.0);near.push({a,d,w});totW+=w}});
  if(!near.length){p.active=false;p.lines=[];p.bonus=false;p.near=[];p.curPax=0;return}
  const sh=new Map();
  near.forEach(({a,w})=>{const hasB=[...a.ks].some(k=>k[0]==="B"),uCnt=[...a.ks].filter(k=>k[0]!=="B").length,div=(hasB?1:0)+uCnt||1;a.ks.forEach(k=>sh.set(k,(sh.get(k)||0)+(w/totW)/div))});
  const mDay=poiMult(p,wd);let anyB=false;
  near.forEach(({a,w})=>{const hasB=[...a.ks].some(k=>k[0]==="B"),uCnt=[...a.ks].filter(k=>k[0]!=="B").length,div=(hasB?1:0)+uCnt||1,an=ST_ANAL.get(a.s.id);a.ks.forEach(k=>{const b=!!linePoiBonus[k],stPoi=(w/totW)/div*p.base*mDay*(b?1.2:1);if(an){an.poiTotal+=stPoi;const bl=an.byLine.get(k);if(bl)bl.poi+=stPoi}})});
  sh.forEach((s,k)=>{const b=!!linePoiBonus[k];if(b)anyB=true;poiLoad[k]=(poiLoad[k]||0)+s*p.base*mDay*(b?1.2:1)});
  p.active=true;p.lines=[...sh.keys()];p.bonus=anyB;p.curPax=Math.round(p.base*mDay*(anyB?1.2:1));
  p.near=near.map(x=>({name:x.a.s.name,d:x.d})).sort((a,b)=>a.d-b.d)});
 opp=D.mah.map(h=>({h,u:h.cur*.22*(1-h.cov)})).sort((a,b)=>b.u-a.u).slice(0,5);tips=[];
 const fl=[...Object.keys(owned).map(i=>[lineName(i),owned[i]]),...lines.map(l=>[l.name,l])];
 for(const [n,o] of fl){if(o.total<0){tips.push({n:"⚠",t:`<b>${n}</b> günde ₺${(-o.total).toFixed(2)}M zarar ediyor: araç sayısını düşür ya da hattı yoğun mahallelere bağla.`});break}if(o.pk>1.05){tips.push({n:"🚆",t:`<b>${n}</b> tepe saat doluluğu %${Math.round(o.pk*100)}: ${o.type==="tram"?"tramvay seti":"vagon/tren"} ekle, yoksa yolcu kaybedersin.`});break}}
 POIS.filter(p=>!p.active).sort((a,b)=>b.base-a.base).slice(0,2).forEach(p=>tips.push({poi:p,n:poiSvg(p,13),t:`<b>${p.name}</b> bağlı değil: ~${fmt(Math.round(p.base*poiMult(p,wd)/100)*100)} yolcu/gün`}));
 opp.slice(0,2).forEach(({h,u},i)=>{const [b,d]=nearSt(h);tips.push({h,n:i+1,t:`<b>${h[0]}</b>: günde ~${fmt(Math.round(u/100)*100)} yolcu karşılanmıyor`+(b?` · en yakın istasyon ${b.name} (${d.toFixed(1)} km)`:"")})});
 pr:for(let i=0;i<opp.length;i++)for(let j=i+1;j<opp.length;j++){const a=opp[i],b=opp[j];if(Math.hypot((a.h[1]-b.h[1])*KX,a.h[2]-b.h[2])*111.32<3.5){tips.push({n:"↔",t:`<b>${a.h[0]}</b> ile <b>${b.h[0]}</b> yakın: tek hatla bağlarsan ~${fmt(Math.round((a.u+b.u)/100)*100)} yolcu/gün kazanırsın.`});break pr}}}
function refresh(){recalc();for(const i in owned)calcB(i,1);lines.forEach(l=>calcU(l,1));sums()}
function asist(){const e=$("as");e.hidden=!dem;if(!dem)return;
 const dm=`<div class="dmodes"><button class="${demMode==="pop"?"on":""}" data-dm="pop">🔥 Nüfus</button><button class="${demMode==="load"?"on":""}" data-dm="load">📊 Darboğaz</button><button class="${demMode==="queue"?"on":""}" data-dm="queue">⏳ Kuyruk</button><button class="${demMode==="profit"?"on":""}" data-dm="profit">💰 Kâr</button></div>`;
 const lg=demMode==="load"?'<div class="lg"><i style="color:#22c55e">●</i> rahat · <i style="color:#f59e0b">●</i> yoğun · <i style="color:#ef4444">●</i> darboğaz</div>':demMode==="queue"?'<div class="lg"><i style="color:#38bdf8">●</i> az · <i style="color:#f59e0b">●</i> kalabalık · <i style="color:#ef4444">●</i> yoğun kuyruk</div>':demMode==="profit"?'<div class="lg"><i style="color:#16a34a">●</i> kârlı (+₺1.5M+) · <i style="color:#f59e0b">●</i> başa baş · <i style="color:#ef4444">●</i> zararda</div>':'<div class="lg"><span></span>az → çok nüfus <u></u>yürüme alanı</div>';
 e.innerHTML='<b class="t">🧭 PLANLAMA ASİSTANI</b>'+dm+(tips.length?tips.slice(0,4).map((p,i)=>`<div class="tp"${p.h||p.poi?` data-i="${i}"`:""}><i>${p.n}</i><span>${p.t}</span></div>`).join(""):'<div class="tp">Henüz öneri yok.</div>')+lg}
$("as").onclick=e=>{const dm=e.target.closest("[data-dm]");if(dm){demMode=dm.dataset.dm;SFX.tab();asist();dirty=true;return}const t=e.target.closest("[data-i]");if(!t)return;const item=tips[+t.dataset.i],lo=item.h?item.h[1]:item.poi.lo,la=item.h?item.h[2]:item.poi.la;focusOn(lo,la);SFX.click()};
/* hat açılış efekti */
const rvp=l=>l.born===undefined?1:Math.min(1,(RT-l.born)/(l.ids.length*.25+.2));
function rev(a,l){const p=rvp(l);if(p>=1)return a;const n=a.length/2-1,q=p*n,k=Math.floor(q),o=a.slice(0,2*k+2);if(k<n){const t=q-k;o.push(a[2*k]+(a[2*k+2]-a[2*k])*t,a[2*k+1]+(a[2*k+3]-a[2*k+1])*t)}return o}
function fxLine(l){l.born=RT;const n=l.ids.length,Dd=n*.25+.2;l.ids.forEach((i,k)=>{const s=S(i);fx.push({lo:s.lo,la:s.la,t:RT+k/(n-1)*Dd,c:l.color})});const s=S(l.ids[n-1]);fx.push({lo:s.lo,la:s.la,t:RT+Dd,c:"#fff"})}
function fxBur(id){BS.filter(b=>b.ln.includes(id)).forEach((s,k)=>fx.push({lo:s.lo,la:s.la,t:RT+k*.07,c:CFG[id].color}))}
function fxTap(s,c){fx.push({lo:s.lo,la:s.la,t:RT,c:c||"#2a9d8f",dur:.6,r0:8,dr:34,lw:2.2})}
function fxDraw(){fx=fx.filter(e=>RT-e.t<(e.dur||1.6));for(const e of fx){const d=e.dur||1.6,a=RT-e.t;if(a<0)continue;const p=a/d;g.beginPath();g.arc(SX(e.lo),SY(e.la),(e.r0||8)+p*(e.dr||76.8),0,7);g.globalAlpha=Math.max(0,1-p);g.lineWidth=(e.lw||3.5)*(e.dur?1-p*.45:1);g.strokeStyle=e.c;g.stroke()}g.globalAlpha=1}
function fxTextDraw(wd){fxText=fxText.filter(e=>RT-e.t<2.0);if(!fxText.length||wd>=0.30)return;
 const zFade=Math.min(1,(0.30-wd)/0.08),drawn=[];
 g.save();g.font="700 10.5px system-ui";g.textAlign="center";
 for(const e of fxText){const a=RT-e.t;if(a<0)continue;const p=a/2.0,al=Math.min(1,p*5)*(1-Math.max(0,(p-.55)/.45))*.84*zFade,x=SX(e.lo)+(e.ox||0),y=SY(e.la)-14-(1-Math.pow(1-p,2))*28,tw=measureTxt("700 10.5px system-ui",e.txt)+10;
  if(x<-60||y<-60||x>W+60||y>H+60)continue;
  const b=[x-tw/2,y-11.5,tw,15];if(!fitsBox(drawn,b,2))continue;drawn.push(b);
  g.globalAlpha=Math.max(0,al);pillRect(b[0],b[1],tw,15,7.5);g.fillStyle=isDark()?"rgba(15,23,42,.86)":"rgba(255,255,255,.9)";g.fill();g.lineWidth=1.2;g.strokeStyle=e.c;g.stroke();g.font="700 10.5px system-ui";g.fillStyle="#16a34a";g.fillText(e.txt,x,y)}
 g.restore()}
/* talep haritası */
const HC=[[255,224,102],[255,170,40],[245,98,30],[214,40,57],[150,20,90]],SPR=[];
function spr(b){if(SPR[b])return SPR[b];const p=b/11*4,i=Math.min(3,Math.floor(p)),f=p-i,k=HC[i].map((v,j)=>Math.round(v+(HC[i+1][j]-v)*f)),c=document.createElement("canvas");c.width=c.height=64;const x=c.getContext("2d"),r=x.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,`rgba(${k},.62)`);r.addColorStop(.55,`rgba(${k},.3)`);r.addColorStop(1,`rgba(${k},0)`);x.fillStyle=r;x.fillRect(0,0,64,64);return SPR[b]=c}
function heat(){g.fillStyle=V("--bg");g.globalAlpha=demMode==="pop"?.4:.3;g.fillRect(0,0,W,H);g.globalAlpha=1;
 if(demMode==="pop"){
  for(const h of D.mah){const x=SX(h[1]),y=SY(h[2]),r=(.45+Math.sqrt(h.cur)/230)/111.32*view.s;if(x<-r||y<-r||x>W+r||y>H+r)continue;g.drawImage(spr(Math.round(Math.min(1,h.cur/26000)*11)),x-r,y-r,2*r,2*r)}
  for(const s of actv){const x=SX(s.lo),y=SY(s.la),r=stRad(s)/111.32*view.s;g.beginPath();g.arc(x,y,r,0,7);g.fillStyle="rgba(42,157,143,.13)";g.fill();g.lineWidth=1.5;g.strokeStyle="rgba(42,157,143,.75)";g.setLineDash([4,5]);g.stroke();g.setLineDash([])}
 }else if(demMode==="queue"){
  const p=.5+.5*Math.sin(RT*4.5);
  for(const s of actv){const q=s.q||0;if(q<2)continue;const x=SX(s.lo),y=SY(s.la);if(x<-50||y<-50||x>W+50||y>H+50)continue;
   const col=q>=10?"239,68,68":q>=6?"245,158,11":"56,189,248",rad=14+Math.min(20,q*1.3)+p*4;
   g.beginPath();g.arc(x,y,rad,0,7);g.fillStyle=`rgba(${col},.2)`;g.fill();g.lineWidth=2;g.strokeStyle=`rgba(${col},.88)`;g.stroke()}
 }else{
  for(const s of actv){const x=SX(s.lo),y=SY(s.la),r=stRad(s)/111.32*view.s;g.beginPath();g.arc(x,y,r,0,7);g.strokeStyle="rgba(148,163,184,.35)";g.lineWidth=1;g.setLineDash([4,6]);g.stroke();g.setLineDash([])}
 }}
function oppDraw(){g.textAlign="center";opp.forEach(({h,u},i)=>{const x=SX(h[1]),y=SY(h[2]);if(x<-40||y<-40||x>W+40||y>H+40)return;const p=(RT*.7+i*.17)%1;g.beginPath();g.arc(x,y,11+p*22,0,7);g.strokeStyle="rgba(230,57,70,"+.8*(1-p)+")";g.lineWidth=2.5;g.stroke();g.beginPath();g.arc(x,y,11,0,7);g.fillStyle="#e63946";g.fill();g.lineWidth=2;g.strokeStyle="#fff";g.stroke();g.fillStyle="#fff";g.font="700 12px system-ui";g.fillText(i+1,x,y+4.5);g.font="700 11px system-ui";const tx=h[0]+" · +"+Math.round(u/100)/10+"k";g.lineWidth=3;g.strokeStyle=V("--dist");g.strokeText(tx,x,y+27);g.fillStyle=V("--ink");g.fillText(tx,x,y+27)});g.textAlign="left"}
/* filo */
const wRisk=()=>Math.min(.032,allL().reduce((a,x)=>a+ALL_VK().reduce((b,t)=>b+(x[1].tr[t]||0)*br2(t),0),0));
function fs(o){let w=0,u=0,f=0;for(const t in VT){const cnt=o.tr[t]||0;if(!cnt)continue;const v=VT[t];w+=v.setSize===1?2*cnt:4*cnt;u+=4*cnt*v.cap;f+=cnt*(v.cat==="tram"?v.up:4*v.up)*(1+fa[t]/1500)}o.wag=w;o.un=u;o.fu=f}
function autoTr(l){const isT=l.type==="tram",cat=isT?"tram":"metro",cpu=isT?(4*.42*WC):(4*WC);let need=Math.max(1,Math.ceil((l.ld||0)*(l.bonus||1)*1.5/cpu)),got=0;for(const t of VK(cat)){const req=VT[t].setSize;while(need>0&&dep[t]>=req){dep[t]-=req;l.tr[t]=(l.tr[t]||0)+1;need--;got++}}if(!got)setTimeout(()=>toast("⚠ Depoda boş "+(isT?"tramvay seti":"tren")+" yok! Vagon Piyasası'ndan satın al, hatta araç ata."),2800)}
function allL(){return[...Object.keys(owned).map(i=>[lineName(i),owned[i],CFG[i].color,i]),...lines.map(l=>[l.name,l,l.color,l.key])]}
function poiDraw(wd,lod,boxes,ht){const dk=isDark(),pSc=0.68+0.32*(lod||1),lbls=[];POIS.forEach(p=>{const x=SX(p.lo),y=SY(p.la);if(x<-60||y<-60||x>W+60||y>H+60)return;
 const isHov=ht&&ht.tp==="poi"&&ht.id===p.id,pr=(isHov?13.5:12)*pSc;
 if((dem&&!p.active)||isHov){const cr=1.0/111.32*view.s;g.beginPath();g.arc(x,y,cr,0,7);g.strokeStyle=isHov?(p.active?"rgba(34,197,94,.6)":"rgba(56,189,248,.65)"):"rgba(245,158,11,.55)";g.lineWidth=1.6;g.setLineDash([5,5]);g.stroke();g.setLineDash([])}
 g.save();if(!p.active&&!isHov)g.globalAlpha=.76;
 if(isHov){g.beginPath();g.arc(x,y,pr+4.5,0,7);g.lineWidth=2.2;g.strokeStyle="#38bdf8";g.stroke()}
 g.beginPath();g.arc(x,y,pr,0,7);g.fillStyle=dk?"rgba(15,23,42,.92)":"rgba(255,255,255,.94)";g.fill();
 if(p.active){g.lineWidth=2.4*pSc;g.strokeStyle="#22c55e";g.stroke();if(p.bonus){g.beginPath();g.arc(x,y,pr+3.2*pSc,0,7);g.lineWidth=1.3*pSc;g.strokeStyle="rgba(34,197,94,.45)";g.stroke()}}
 else{g.lineWidth=1.8*pSc;g.strokeStyle=isHov?"#38bdf8":"#64748b";g.setLineDash([3.5,2.5]);g.stroke();g.setLineDash([])}
 const im=POI_IMGS[p.icKey],iz=pr*1.36;
 if(im&&im.complete&&im.naturalWidth){g.drawImage(im,x-iz/2,y-iz/2,iz,iz)}
 else{g.strokeStyle=p.active?"#16a34a":"#64748b";g.lineWidth=2;g.beginPath();g.arc(x,y,3.5*pSc,0,7);g.stroke()}
 g.restore();
 if(boxes)boxes.push([x-pr,y-pr,pr*2,pr*2]);
 if(isHov||wd<0.36){const fnt=isHov?"700 11px system-ui":"700 10px system-ui";const tw=measureTxt(fnt,p.name),ly=y+pr+13.5,bx=[x-tw/2-3,ly-9.5,tw+6,12];
  lbls.push({spot:isHov,box:bx,draw:()=>{g.save();g.font=fnt;g.textAlign="center";g.lineWidth=3.2;g.strokeStyle=V("--dist");g.strokeText(p.name,x,ly);g.fillStyle=p.active?(dk?"#4ade80":"#15803d"):(isHov?(dk?"#7dd3fc":"#0369a1"):V("--mut"));g.fillText(p.name,x,ly);g.restore()}})}
});return lbls}
function hqDraw(wd,lod,boxes,ht){if(!started)return null;const x=SX(HQP.lo),y=SY(HQP.la);if(x<-80||y<-60||x>W+80||y>H+60)return null;
 const isHov=ht&&ht.tp==="hq",r=Math.sqrt(view.s/(W/.34)),z=Math.max(13,Math.min(28,(isHov?25:22)*r)),fs=Math.max(9.5,Math.min(13,(isHov?12.5:11.5)*r));
 if(isHov){g.save();g.beginPath();g.arc(x,y,z*.72,0,7);g.fillStyle="rgba(109,40,217,.16)";g.fill();g.lineWidth=2;g.strokeStyle="#a78bfa";g.stroke();g.restore()}
 if(HQIMG.complete&&HQIMG.naturalWidth)g.drawImage(HQIMG,x-z/2,y-z/2,z,z);else{g.beginPath();g.rect(x-z/3,y-z/3,z*.66,z*.66);g.fillStyle="#6d28d9";g.fill()}
 if(boxes)boxes.push([x-z/2,y-z/2,z,z]);
 const fnt=fs+"px "+GF;const tw=measureTxt(fnt,corp),ly=y+z/2+fs+3,bx=[x-tw/2-3,ly-fs*.8,tw+6,fs+1];
 return{spot:isHov,box:bx,draw:()=>{g.save();g.textAlign="center";g.font=fnt;g.lineWidth=3.5;g.strokeStyle=V("--dist");g.strokeText(corp,x,ly);g.fillStyle=V("--ink");g.fillText(corp,x,ly);g.restore()}}}
const gh=(c,t,sb)=>`<div class="gh ${c}"><div><h2>${t}</h2><small>${sb}</small></div><button data-a="close">✕</button></div>`;
const LV=[[0,"Yerel İşletme"],[40,"Bölgesel İşletme"],[120,"Şehir İşletmesi"],[300,"Büyükşehir Operatörü"],[700,"Metropol Ağı"],[1500,"Efsane Metro"]];
function hqHtml(){const ls=allL(),tw=depN("metro"),ts=depN("tram"),as=ls.reduce((a,x)=>a+x[1].wag,0),te=ls.reduce((a,x)=>a+x[1].earn,0),tab=pv.tab==="fleet"?"fleet":"info";let lv=0;LV.forEach((x,i)=>{if(te>=x[0])lv=i});const nx=LV[lv+1],pc=nx?Math.min(1,(te-LV[lv][0])/(nx[0]-LV[lv][0])):1,S=(c,ic,b,sm)=>`<div class="st2"><i style="background:${c}33">${ic}</i><div><b>${b}</b><small>${sm}</small></div></div>`;
 let h=`<div class="hqh"><div class="lg2"><img src="${HQI}" alt=""></div><div style="flex:1;min-width:0"><span class="lv">SEVİYE ${lv+1} · ${LV[lv][1].toUpperCase()}</span><h2>${corp}</h2><small>İşletme Merkezi · Acemler</small><div class="xp"><i style="width:${Math.round(pc*100)}%"></i></div><small>${nx?"Sonraki seviye: ₺"+nx[0]+"M toplam kazanç ("+MM(te)+")":"Maksimum seviye 🏆"}</small></div><button data-a="close" style="background:rgba(255,255,255,.2);color:#fff;border:0;align-self:flex-start">✕</button></div><div class="nav"><button class="${tab==="info"?"on":""}" data-a="tab" data-t="info">📋 Genel</button><button class="${tab==="fleet"?"on":""}" data-a="tab" data-t="fleet">🚆 Filo &amp; Depo</button></div>`;
const totKm=ls.reduce((a,x)=>a+(x[1].km||0),0),avgHw=ls.length?Math.round(ls.reduce((a,x)=>a+(x[1].hE||8),0)/ls.length):0;
 const topSts=[...actv].map(s=>({s,p:pot([s])})).sort((a,b)=>b.p-a.p).slice(0,5);
 const topHtml=topSts.length?`<p style="margin:14px 0 0"><b>🏆 En Yoğun 5 İstasyon</b></p><div class="top-sts">`+topSts.map((x,i)=>`<div class="top-st"><div><b>${i+1}. ${x.s.name}</b><small>~${fmt(x.p)} yolcu/gün${x.s.lvl>1?" · "+"★".repeat(x.s.lvl-1):""}</small></div><button data-a="jumpSt" data-id="${x.s.id}">📍 Gör</button></div>`).join("")+`</div>`:"";
 if(tab==="info")return h+`<div class="sg">${S("#f59e0b","💰",isSandbox()?"∞ Sınırsız":"₺"+Math.round(budget*10)/10+"M","Kasa")}${S("#3b82f6","📅",day,"İşletme günü")}${S("#8b5cf6","🚇",ls.length,"Hat")}${S("#14b8a6","🚉",actv.length,"Aktif istasyon")}${S("#0ea5e9","🏙️","%"+cityCov().toFixed(1).replace(".",","),"Şehir kapsama")}${S("#22c55e","👥",fmt(lastPax),"Günlük yolcu")}${S(lastNet<0?"#e63946":"#2a9d8f","📈",(lastNet>=0?"+":"")+lastNet.toFixed(2)+"M","Günlük net")}${S("#ec4899","🚆",tw+as+ts*2,"Filo eşdeğeri")}${S("#fbbf24","🛤",totKm.toFixed(1)+" km",avgHw?`Ort. ${avgHw} dk sefer`:"Toplam ağ")}${S("#f97316","🏆",MM(te),"Toplam kazanç")}</div><div class="qa"><button style="background:linear-gradient(135deg,#0f766e,#1d6fd1)" data-a="fin">💰 Maliye</button><button style="background:linear-gradient(135deg,#f59e0b,#c2410c)" data-a="mkt">🛒 Vagon Piyasası</button><button style="background:linear-gradient(135deg,#6d28d9,#db2777)" data-a="hq" data-f="1">🚆 Filo &amp; Depo</button><button style="background:linear-gradient(135deg,#0284c7,#0f766e)" data-a="report">📜 Ulaşım Karnesi</button><button style="background:linear-gradient(135deg,#7c3aed,#db2777)" data-a="goals">🎯 Hedefler</button><button style="background:linear-gradient(135deg,#334155,#0f172a)" data-a="loanp">🏦 Kredi</button><button data-a="newg" style="background:linear-gradient(135deg,#475569,#334155)">🏠 Ana Menü</button></div>`+topHtml;
 const tot=tw+ts*2+as;
 return h+`<div class="fbar"><i style="width:${tot?as/tot*100:0}%;background:#6d28d9"></i><i style="width:${tot?(tw+ts*2)/tot*100:0}%;background:#fbbf24"></i></div><small style="color:var(--mut)">🟣 Hatlarda ${as} eşdeğer araç · 🟡 Depoda ${tw} metro vagonu, ${ts} tramvay seti</small><p style="margin:12px 0 0"><b>🏚 Depo</b></p>`+VK().map(k=>{const v=VT[k],uNm=v.cat==="tram"?"set":"vagon";return `<div class="dpc">${vImgHtml(k,false)}<div><b>${v.ic} ${v.n}</b><small>Depoda ${dep[k]} ${uNm} (${v.cat==="tram"?"🚊 Tramvay":"🚇 Metro"})</small></div><button data-a="sellv" data-t="${k}" ${dep[k]?"":"disabled"}>Sat +₺${(vp(k)/2).toFixed(1).replace(/\.0$/,"")}M</button></div>`}).join("")+`<p style="margin:12px 0 0"><b>🚆 Hatlardaki araçlar</b></p>`+ls.map(([n,o,c,k])=>{const cat=o.type==="tram"?"tram":"metro",tCnt=trainsOf(o),uTxt=cat==="tram"?`🚊 ${tCnt} tramvay seti`:`🚇 ${tCnt} tren (${o.wag} vagon)`;return `<div class="lcard" style="border-left-color:${c}"><b>${n}</b> <small>· ${uTxt} · ${fmt(Math.round(o.cap))} yolcu/gün</small><br>${VK(cat).map(t=>`<span class="stp" title="${VT[t].n}">${vImgHtml(t,true)}<b>${o.tr[t]||0}</b><button data-a="tr" data-k="${k}" data-t="${t}" data-d="-1">−</button><button class="pri" data-a="tr" data-k="${k}" data-t="${t}" data-d="1">+</button></span>`).join("")}</div>`}).join("")+`<p style="color:var(--mut);font-size:13px;margin:10px 0 4px">🚇 1 Metro treni = 4 vagon · 🚊 1 Tramvay = 1 set gerekir.</p><p style="color:var(--mut);font-size:13px;margin:4px 0 10px">💡 Depoda aynı kategoriden yedek araç varsa arızalar ücretsiz çözülür.</p>${wsHtml()}<button data-a="mkt">🛒 Vagon Piyasası</button>`}
function mpg(){const pg=mktCat==="tram"?1:0,pgin=$("mpgin");if(pgin)pgin.style.transform=`translateX(-${pg*100}%)`;
 const sub=$("mktsub"),b0=$("mbtn0"),b1=$("mbtn1"),d0=$("mdt0"),d1=$("mdt1"),prev=$("mpbPrev"),next=$("mpbNext");
 if(sub)sub.textContent=`Sayfa ${pg+1}/2 · ${pg===0?"Metro Vagonları":"Tramvay Setleri"} · satışta %50 iade`;
 if(b0)b0.classList.toggle("on",pg===0);
 if(b1)b1.classList.toggle("on",pg===1);
 if(d0)d0.classList.toggle("on",pg===0);
 if(d1)d1.classList.toggle("on",pg===1);
 if(prev)prev.hidden=pg===0;
 if(next)next.hidden=pg===1}
function mktHtml(){const rk={yerli:["Düşük","#f59e0b"],cin:["Yüksek","#e63946"],alman:["Çok düşük","#2a9d8f"],kore:["Orta","#f59e0b"],tyerli:["Düşük","#f59e0b"],tcin:["Yüksek","#e63946"],talman:["Çok düşük","#2a9d8f"],tkore:["Orta","#f59e0b"]},pg=mktCat==="tram"?1:0;
 const card=k=>{const v={...VT[k],p:vp(k)},[r,rc]=rk[k]||["Orta","#f59e0b"],un=isUnlocked(k),rem=Math.max(1,v.unlockDay-day),isT=v.cat==="tram",unit=isT?"set":"vagon",paxDay=Math.round(WC*v.cap*(isT?4:1)),bulkN=isT?2:4,bulkCost=Math.round(v.p*bulkN*10)/10,usedCost=Math.round(v.p*5.5)/10;
  return `<div class="vc${un?"":" locked"}"><div class="vt">${vImgHtml(k,false)}<div><b>${v.ic} ${v.n}${isT?"":" Vagon"}</b>${un?"":` <span class="vlock-tag">🔒 Kilitli · ${v.unlockDay}. Günde Açılır (Kalan: ${rem} gün)</span>`}<small>${v.d}</small><span class="tg">👥 ${fmt(paxDay)} yolcu/${unit}</span><span class="tg">🔧 ₺${v.up}M/${unit}</span><span class="tg" style="color:${rc};border-color:${rc}">🛠 Arıza riski: ${r}</span>${un?`<span class="tg">Depoda: ${dep[k]} ${unit}</span><span class="tg">${mk[k]>1.05?"📈":mk[k]<.95?"📉":"➖"} Fiyat ×${mk[k].toFixed(2)}</span><span class="tg">⏳ Yaş ${Math.round(fa[k])}g</span>`:`<span class="tg">📅 Açılış: ${v.unlockDay}. Gün</span>`}</div></div><div class="pb"><span class="pr">₺${v.p}M</span><span>${un?`<button class="pri" data-a="buyv" data-t="${k}" data-n="1" ${!hasMoney(v.p)?"disabled":""}>Satın al${isT?" (1 Set)":""}</button> <button data-a="buyv" data-t="${k}" data-n="${bulkN}" ${!hasMoney(bulkCost)?"disabled":""}>×${bulkN} · ₺${bulkCost}M</button> <button data-a="buyv" data-t="${k}" data-n="1" data-u="1" ${us[k]<1||!hasMoney(usedCost)?"disabled":""}>♻ İkinci el ₺${usedCost.toFixed(1)}M (${us[k]})</button>`:`<button data-a="vlock" data-t="${k}">🔒 ${v.unlockDay}. Günde Açılır (${rem}g)</button>`}</span></div></div>`};
 const catNav=`<div class="mkt-nav"><button id="mbtn0" class="${pg===0?"on":""}" data-a="mcat" data-c="metro">🚇 Vagonlar</button><button id="mbtn1" class="${pg===1?"on":""}" data-a="mcat" data-c="tram">🚊 Tramvaylar</button></div>`;
 const p1=`<div class="mkt-sec" style="margin-top:2px"><b>🚇 Metro Vagonları</b><small>1 tren = 4 vagon</small></div>`+ALL_VK("metro").map(card).join("")+`<p style="text-align:center;color:var(--mut);font-size:13px;margin:10px 0 4px">🚇 Her metro treni için 4 vagon gerekir.</p>`;
 const p2=`<div class="mkt-sec" style="margin-top:2px"><b>🚊 Tramvay Setleri</b><small>50. günde açılır · 1 set = 1 tramvay</small></div>`+ALL_VK("tram").map(card).join("")+`<p style="text-align:center;color:var(--mut);font-size:13px;margin:10px 0 4px">🚊 Tramvay hatları için 1 set yeterlidir.</p>`;
 return `<div class="gh gold"><div><h2>🛒 Vagon Piyasası</h2><small id="mktsub">Sayfa ${pg+1}/2 · ${pg===0?"Metro Vagonları":"Tramvay Setleri"} · satışta %50 iade</small></div><button data-a="close">✕</button></div>${catNav}<div class="pgw"><div class="pgin" id="mpgin" style="transform:translateX(-${pg*100}%)"><section>${p1}</section><section>${p2}</section></div></div><div class="pgr"><span class="dots"><i id="mdt0" data-a="mcat" data-c="metro" class="${pg===0?"on":""}"></i><i id="mdt1" data-a="mcat" data-c="tram" class="${pg===1?"on":""}"></i></span><span><button id="mpbPrev" data-a="mcat" data-c="metro" ${pg===0?"hidden":""}>◂ Vagonlar</button> <button data-a="hq" data-f="1">🏢 İşletme Merkezi</button> <button id="mpbNext" data-a="mcat" data-c="tram" class="pri" ${pg===1?"hidden":""}>Tramvaylar ▸</button></span></div>`}
/* maliye (3 sayfa) */
const FIN_SUBS=["Günlük özet & tarife","Hat bazında performans","Ağ analizi & trendler"];
function fpg(){const pg=pv.pg||0;$("pgin").style.transform=`translateX(-${pg*100}%)`;
 const prev=$("pbPrev"),next=$("pbNext"),sub=$("finsub");
 if(sub)sub.textContent=`Sayfa ${pg+1}/3 · ${FIN_SUBS[pg]} · ${day}. gün`;
 if(prev){prev.hidden=pg===0;prev.dataset.p=String(Math.max(0,pg-1));prev.textContent=pg===2?"◂ Hat Bazında":"◂ Günlük Özet"}
 if(next){next.hidden=pg===2;next.dataset.p=String(Math.min(2,pg+1));next.textContent=pg===0?"Sayfa 2 · Hat Bazında ▸":"Sayfa 3 · Ağ Analizi ▸"}
 [0,1,2].forEach(i=>{const d=$("dt"+i);if(d)d.classList.toggle("on",pg===i)})}
function finSpark(arr,col,mn0,mx0){
 if(!arr.length)return '<small style="color:var(--mut)">Veri için en az 1 gün ilerleyin.</small>';
 const W0=240,H0=48,lo=mn0!=null?mn0:Math.min(...arr),hi=mx0!=null?mx0:Math.max(...arr),sp=hi-lo;
 const pts=arr.map((v,i)=>`${arr.length===1?W0/2:(i/(arr.length-1))*W0},${sp<=.001?H0/2:H0-4-((v-lo)/sp)*(H0-8)}`);
 const area=`0,${H0} ${pts.join(" ")} ${W0},${H0}`;
 return `<svg viewBox="0 0 ${W0} ${H0}" style="width:100%;height:50px;display:block"><polygon points="${area}" fill="${col}" fill-opacity=".16"/><polyline points="${pts.join(" ")}" fill="none" stroke="${col}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`}
function finHtml(){const pg=pv.pg||0,d=dly,inc=d.bilet+d.ticari+(d.tesvik||0),ex=d.bakim+d.filo+d.personel+d.ray+d.bosta+(d.faiz||0),net=inc-ex,mxb=Math.max(.01,inc,ex),mx=Math.max(.1,...hist.map(Math.abs)),T$=k=>MM(led[k]||0),
 R=(ic,n,v,c,m)=>`<div class="row"><span class="ic">${ic}</span><span class="lb">${n}</span><span class="bar"><i style="width:${Math.round(v/m*100)}%;background:${c}"></i></span><b>${MM(v)}</b></div>`,
 pc=inc>0?Math.min(1,ex/inc):1,ls=allL().sort((a,b)=>b[1].total-a[1].total),mg=Math.max(.01,...ls.map(x=>Math.max(x[1].ticket+x[1].comm,x[1].cs))),
 ti=(led.bilet||0)+(led.ticari||0)+(led.tesvik||0),to=(led.bakim||0)+(led.filo||0)+(led.personel||0)+(led.ray||0)+(led.faiz||0),Tl=(b,sm)=>`<div class="tile"><b>${b}</b><small>${sm}</small></div>`;
 const tfHtml=`<p style="margin:12px 0 0"><b>🎟 Şehir Tarife Politikası</b></p><div class="tariffs">${Object.entries(TARIFFS).map(([tk,tv])=>`<button class="trf${tariff===tk?" on":""}" data-a="tariff" data-tf="${tk}"><b>${tk==="eco"?"🎓 ":tk==="peak"?"⚡ ":"⚖️ "}${tv.n}</b><small>${tv.d}</small></button>`).join("")}</div>`;
 const p1=`<div class="tl2">${Tl(isSandbox()?"∞ Sınırsız":"₺"+Math.round(budget*10)/10+"M","💰 Kasa")}${Tl(`<span style="color:${net<0?"#e63946":"#2a9d8f"}">${net>=0?"▲ +":"▼ "}${MM(net)}</span>`,"Günlük net")}${Tl(day,"📅 Gün")}</div>
<p style="margin:10px 0 0"><b>📈 Gelirler</b></p>${R("🎟","Bilet",d.bilet,"#2a9d8f",mxb)}${R("🍔","Büfe &amp; otomat",d.ticari,"#84cc16",mxb)}${d.tesvik?R("🎁","Kalite teşviki",d.tesvik,"#0ea5e9",mxb):""}
<p style="margin:10px 0 0"><b>📉 Giderler</b></p>${R("🚉","İstasyon bakımı",d.bakim,"#f4a261",mxb)}${R("🚆","Vagon &amp; enerji",d.filo,"#e76f51",mxb)}${R("👷","Personel",d.personel,"#e63946",mxb)}${R("🛤","Ray &amp; işletme",d.ray,"#b5179e",mxb)}${R("🏚","Boşta istasyon &amp; depo",d.bosta,"#8d99ae",mxb)}${R("🏦","Kredi faizi",d.faiz||0,"#6d28d9",mxb)}${tfHtml}
<div style="text-align:center;margin:14px 0 6px"><span class="stk" style="background:${net>=0?"#2a9d8f":"#e63946"}">${net>=0?"KÂRDASIN 🎉":"ZARARDASIN ⚠"}</span></div>
<div style="display:flex;gap:12px;align-items:center;background:var(--bg);border:1px solid var(--bd);border-radius:14px;padding:10px"><svg viewBox="0 0 80 80" width="84" height="84"><circle cx="40" cy="40" r="30" fill="none" stroke="#2a9d8f" stroke-width="10"/><circle cx="40" cy="40" r="30" fill="none" stroke="#e63946" stroke-width="10" stroke-dasharray="${(pc*188.5).toFixed(1)} 188.5" transform="rotate(-90 40 40)"/><text x="40" y="45" text-anchor="middle" font-size="15" font-weight="800" fill="currentColor">%${Math.round(pc*100)}</text></svg><div style="flex:1"><small style="color:var(--mut)">Son ${hist.length} gün net kazanç</small><svg viewBox="0 0 200 40" style="width:100%;height:50px"><line x1="0" x2="200" y1="20" y2="20" stroke="var(--bd)"/>${hist.map((v,i)=>`<rect x="${i*5}" width="4" y="${v>=0?20-v/mx*19:20}" height="${Math.abs(v)/mx*19}" rx="1" fill="${v>=0?"#2a9d8f":"#e63946"}"/>`).join("")}</svg></div></div>`;
 const p2=ls.map(([n,o,c],i)=>`<div class="lcard" style="border-left-color:${c}"><div style="display:flex;justify-content:space-between;gap:8px"><b>${ls.length>1&&i===0?"🥇 ":""}${n}</b><b style="color:${o.total<0?"#e63946":"#2a9d8f"}">${o.total>=0?"+":""}${MM(o.total)}/gün</b></div>${R("🎟","Gelir",o.ticket+o.comm,"#2a9d8f",mg)}${R("🧾","Gider",o.cs,"#e63946",mg)}<small>👥 ${fmt(o.pax)} yolcu · ${o.type==="tram"?"🚊 "+trainsOf(o)+" set":"🚆 "+trainsOf(o)+" tren"} · doluluk %${Math.round(o.occ*100)}</small></div>`).join("")+`<p style="margin:14px 0 0"><b>🏁 Başlangıçtan beri</b></p><div class="tl2">${Tl(MM(ti),"Toplam gelir")}${Tl(MM(to),"İşletme gideri")}${Tl(T$("insaat"),"İnşaat")}${Tl(T$("satin"),"Hat satın alma")}${Tl(MM((led.vagon||0)+(led.yuk||0)),"Vagon &amp; yükseltme")}${Tl(T$("kriz"),"Kriz")}</div>`;
 const totW=Math.max(1,ALL_VK().reduce((a,k)=>a+totalOf(k),0)),avgH=(hist.length?hist.reduce((a,b)=>a+b,0)/hist.length:lastNet),pkP=histP.length?Math.max(...histP,lastPax):lastPax;
 const p3=`<div class="tl2">${Tl(fmt(pkP),"👥 Yolcu Zirvesi")}${Tl((avgH>=0?"+":"")+MM(avgH),"📊 Ort. Net/gün")}${Tl("%"+cityCov().toFixed(1).replace(".",","),"🏙️ Kapsama")}</div>
<div class="an-box"><div class="an-hd"><b>👥 Günlük Yolcu Trendi</b><span>Son ${histP.length||1} gün · Bugün ${fmt(lastPax)}</span></div>${finSpark(histP.length?histP:[lastPax],"#0ea5e9",0,null)}</div>
<div class="an-box"><div class="an-hd"><b>😊 Halk Memnuniyeti Trendi</b><span>%0–100 · Bugün %${Math.round(sat)}</span></div>${finSpark(histS.length?histS:[Math.round(sat)],"#22c55e",0,100)}</div>
<div class="an-box"><div class="an-hd"><b>💰 Günlük Net Kazanç Eğrisi</b><span>Son ${hist.length||1} gün</span></div>${finSpark(hist.length?hist:[lastNet],"#f59e0b",null,null)}</div>
<p style="margin:10px 0 4px"><b>🚆 Üretici Bazlı Filo Dağılımı</b></p>`+ALL_VK().map(k=>{const cnt=totalOf(k),u=VT[k].cat==="tram"?" set":" vagon",col=k.includes("yerli")?"#e63946":k.includes("cin")?"#84cc16":k.includes("alman")?"#1d6fd1":"#22c55e",un=isUnlocked(k);return R(VT[k].ic,VT[k].n+(un?"":` (🔒${VT[k].unlockDay}g)`),cnt,col,totW).replace(MM(cnt),cnt+u)}).join("");
 return `<div class="gh tealg"><div><h2>💰 Maliye</h2><small id="finsub">Sayfa ${pg+1}/3 · ${FIN_SUBS[pg]} · ${day}. gün</small></div><button data-a="close">✕</button></div><div class="pgw"><div class="pgin" id="pgin" style="transform:translateX(-${pg*100}%)"><section>${p1}</section><section>${p2}</section><section>${p3}</section></div></div><div class="pgr"><span class="dots"><i id="dt0" data-a="pg" data-p="0" class="${pg===0?"on":""}"></i><i id="dt1" data-a="pg" data-p="1" class="${pg===1?"on":""}"></i><i id="dt2" data-a="pg" data-p="2" class="${pg===2?"on":""}"></i></span><span><button id="pbPrev" data-a="pg" data-p="${Math.max(0,pg-1)}" ${pg===0?"hidden":""}>${pg===2?"◂ Hat Bazında":"◂ Günlük Özet"}</button> <button id="pbNext" data-a="pg" data-p="${Math.min(2,pg+1)}" class="pri" ${pg===2?"hidden":""}>${pg===0?"Sayfa 2 · Hat Bazında ▸":"Sayfa 3 · Ağ Analizi ▸"}</button></span></div>`}
$("mgb").onclick=e=>{e.stopPropagation();$("aum").hidden=true;$("mgm").hidden=!$("mgm").hidden;SFX.click()};
$("mgm").onclick=e=>{
 const b=e.target.closest("[data-mg]");if(!b)return;
 $("mgm").hidden=true;if(!started)return;
 const act=b.dataset.mg;
 if(act==="fin"){SFX.open();pv={m:"fin",id:null,tab:"info",pg:0};$("ov2").hidden=false;render2()}
 else if(act==="mkt"){SFX.open();mktCat="metro";pv={m:"mkt",tab:"info",pg:0};$("ov2").hidden=false;render2()}
 else if(act==="ct"){SFX.open();pv={m:"ct",tab:"info"};$("ov2").hidden=false;render2()}
 else if(act==="goals"){SFX.open();pv={m:"goals",tab:"g"};$("ov2").hidden=false;render2()}
 else if(act==="hq"){SFX.open();pv={m:"hq",tab:"info",pg:0};$("ov2").hidden=false;render2()}
 else if(act==="report"){openReport(day,false)}
 else if(act==="help"){SFX.open();pv={m:"help",tab:"info"};$("ov2").hidden=false;render2()}
 else if(act==="menu"){save();SFX.close();started=false;follow=null;updFollowBar();$("ov2").hidden=true;$("ov").hidden=false;intro();ui()}
};
document.addEventListener("click",e=>{
 if(!e.target.closest(".mg-wrap"))$("mgm").hidden=true;
 if(!e.target.closest(".au-wrap"))$("aum").hidden=true;
});
/* rehber */
const GUIDE_STEPS=[
 {ttl:"1. Adım: İlk Hattını Kur",txt:"Sol üstteki Yeni hat butonuna bas, haritadan duraklara dokunarak hattını çiz ve Hattı bitir de."},
 {ttl:"2. Adım: Talep Haritasını İncele",txt:"Talep butonunu açarak Bursa mahallelerindeki yolcu yoğunluğunu ve fırsatları haritada gör."},
 {ttl:"3. Adım: İşletmeyi Yönet",txt:"Yönetim ▾ menüsünden Maliye, Vagon Piyasası, İhaleler veya İşletme Merkezi panellerinden birini aç."}
];
function checkGuideAuto(){
 if(!started||guideDone)return;
 if(guideStep===0&&lines.length>=1){guideStep=1;SFX.coin();toast("✅ Rehber 1/3 tamamlandı: İlk hattın açıldı!");sv()}
 if(guideStep===1&&dem){guideStep=2;SFX.coin();toast("✅ Rehber 2/3 tamamlandı: Talep haritası incelendi!");sv()}
 if(guideStep===2&&!$("ov2").hidden&&["fin","mkt","ct","hq","goals","report"].includes(pv.m)){guideStep=3;guideDone=true;SFX.ach();toast("🎉 İlk-oyun rehberi tamamlandı! İyi işletmeler.");sv()}
}
function renderGuide(){
 const el=$("guide");if(!el)return;
 if(!started||guideDone||guideStep>2||!$("ov").hidden){el.hidden=true;return}
 const stp=GUIDE_STEPS[guideStep]||GUIDE_STEPS[0];
 el.hidden=false;
 el.innerHTML=`<div class="gd-top"><span class="gd-step">REHBER · ${guideStep+1}/3</span><button id="gdClose" class="gd-x" title="Rehberi kapat">✕</button></div><div class="gd-ttl">${stp.ttl}</div><p class="gd-txt">${stp.txt}</p><div class="gd-ft"><span class="gd-dots">${[0,1,2].map(i=>`<i class="${i<guideStep?"dn":i===guideStep?"on":""}"></i>`).join("")}</span><button id="gdSkip" class="gd-skip">${guideStep<2?"Adımı Geç ▸":"Tamamla ✔"}</button></div>`;
 $("gdClose").onclick=()=>{guideDone=true;SFX.close();renderGuide();sv()};
 $("gdSkip").onclick=()=>{if(guideStep<2){guideStep++;SFX.step(1)}else{guideStep=3;guideDone=true;SFX.ach();toast("🎉 Rehber tamamlandı!")}renderGuide();sv()};
}
/* duraklatma */
function pause(v){paused=v===undefined?!paused:v;$("pz").innerHTML=paused?IC.play+"<span>Devam</span>":IC.pause;$("pz").classList.toggle("on",paused);SFX.toggle(!paused);if(paused)toast("⏸ Oyun duraklatıldı · Boşluk tuşu veya Devam ile devam et");dirty=true}
$("pz").innerHTML=IC.pause;
$("pz").onclick=()=>pause();
addEventListener("keydown",e=>{
 if(/INPUT|TEXTAREA/.test(e.target.tagName))return;
 if(e.code==="Space"){e.preventDefault();if(e.target.tagName==="BUTTON")e.target.blur();if(started)pause()}
 else if(e.code==="Digit1"&&started){spd=1;SFX.speed(1);updSp()}
 else if(e.code==="Digit2"&&started){spd=2;SFX.speed(2);updSp()}
 else if(e.code==="Digit3"&&started){spd=4;SFX.speed(4);updSp()}
 else if(e.code==="KeyH"&&started){SFX.click();follow=null;updFollowBar();home()}
 else if(e.code==="KeyM"){const off=!(sfxMuted&&ambMuted);sfxMuted=off;ambMuted=off;syncMutePrefs();updAu();if(!off){SFX.init();SFX.toggle(true)}}
 else if(e.code==="Escape"){
  if(!$("ov2").hidden){SFX.close();$("ov2").hidden=true;renderHoverTip()}
  else if(moveSt!=null){cancelMoveSt()}
  else if(cur){$("cn").click()}
  else if(buildSt){buildSt=false;hover=null;cv.style.cursor="";SFX.close();msg("");ui()}
  else if(follow){follow=null;updFollowBar();SFX.toggle(false);dirty=true}
  else if(sel){SFX.close();sel=null;panel();dirty=true}
 }
});
try{document.fonts.load('16px "Lilita One"').then(()=>{dirty=true})}catch(e){}
const bgc=$("bgc"),bgx=bgc.getContext("2d");
const BG_LINES=[
 {c:"#e63946",spd:.045,pts:[[.06,.66],[.26,.54],[.48,.48],[.66,.40],[.88,.24]]},
 {c:"#1d6fd1",spd:.038,pts:[[.08,.36],[.28,.44],[.48,.48],[.70,.60],[.92,.66]]},
 {c:"#2a9d8f",spd:.032,pts:[[.24,.10],[.34,.28],[.48,.48],[.54,.72],[.62,.92]]},
 {c:"#f4a261",spd:.028,pts:[[.14,.86],[.34,.66],[.66,.40],[.78,.14]]}
];
function drawIntroBg(){
 const w=innerWidth||1200,h=innerHeight||800;
 if(bgc.width!==w||bgc.height!==h){bgc.width=w;bgc.height=h}
 bgx.clearRect(0,0,w,h);
 bgx.save();bgx.lineCap="round";bgx.lineJoin="round";
 bgx.strokeStyle="rgba(148,163,184,.06)";bgx.lineWidth=1;
 for(let x=0;x<w;x+=48){bgx.beginPath();bgx.moveTo(x,0);bgx.lineTo(x,h);bgx.stroke()}
 for(let y=0;y<h;y+=48){bgx.beginPath();bgx.moveTo(0,y);bgx.lineTo(w,y);bgx.stroke()}
 BG_LINES.forEach((ln,li)=>{
  const pts=ln.pts.map(p=>[p[0]*w,p[1]*h]);
  bgx.beginPath();pts.forEach(([x,y],i)=>i?bgx.lineTo(x,y):bgx.moveTo(x,y));
  bgx.strokeStyle=ln.c;bgx.globalAlpha=.24;bgx.lineWidth=6;bgx.stroke();
  bgx.globalAlpha=.5;bgx.lineWidth=2.5;bgx.stroke();
  pts.forEach(([x,y],i)=>{const hub=(li<2&&i===2)||(li===0&&i===3);bgx.beginPath();bgx.arc(x,y,hub?7:4,0,7);bgx.fillStyle="#0b1426";bgx.globalAlpha=.85;bgx.fill();bgx.lineWidth=hub?2.5:2;bgx.strokeStyle=hub?"#fff":ln.c;bgx.stroke()});
  const cum=[0];for(let i=1;i<pts.length;i++)cum.push(cum[i-1]+Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]));
  const L=cum[cum.length-1]||1;
  for(let k=0;k<2;k++){
   const raw=(RT*ln.spd*L+k*L)%(2*L),dir=raw<=L?1:-1,d=raw<=L?raw:2*L-raw;
   let i=1;while(i<cum.length-1&&cum[i]<d)i++;
   const t=(d-cum[i-1])/((cum[i]-cum[i-1])||1),ax=pts[i-1][0],ay=pts[i-1][1],bx=pts[i][0],by=pts[i][1],x=ax+(bx-ax)*t,y=ay+(by-ay)*t,ang=Math.atan2(by-ay,bx-ax)+(dir<0?Math.PI:0);
   bgx.save();bgx.translate(x,y);bgx.rotate(ang);bgx.globalAlpha=.45;
   bgx.drawImage(HEADLIGHT_SPR,6,-9,28,18);
   bgx.globalAlpha=.9;bgx.fillStyle="#f8fafc";bgx.strokeStyle=ln.c;bgx.lineWidth=1.8;bgx.beginPath();bgx.rect(-11,-3.5,22,7);bgx.fill();bgx.stroke();
   bgx.restore()
  }
 });
 bgx.restore()
}
let lt=performance.now(),qAcc=0,modalDrawT=0;
(function loop(now){
 try{
  const dt=Math.min(.1,Math.max(0,(now-lt)/1000));lt=now;RT+=dt;
  if(RT-lck>.4){lck=RT;clk()}
  const introOpen=!$("ov").hidden,modalOpen=!$("ov2").hidden||!$("ov3").hidden;
  if(introOpen)drawIntroBg();
  if(started&&!paused&&!(crisis&&crisis.state==="choose")&&!councilChoice){const dts=dt*spd;T+=dts;acc+=dts;qAcc+=dts;if(qAcc>=0.08){simQueues(qAcc);qAcc=0}if(acc>=DAYSEC){acc-=DAYSEC;tick()}}
  if(camAnim){camAnim.p=Math.min(1,camAnim.p+dt/(camAnim.dur||0.35));const e=1-Math.pow(1-camAnim.p,3);view.x=camAnim.sx+(camAnim.tx-camAnim.sx)*e;view.y=camAnim.sy+(camAnim.ty-camAnim.sy)*e;view.s=camAnim.ss+(camAnim.ts-camAnim.ss)*e;if(camAnim.p>=1)camAnim=null;dirty=true}
  if(follow){const fp=getFollowPt();if(fp){const tx=fp.wx-W/2/view.s,ty=fp.wy-H/2/view.s,al=Math.min(1,dt*8);view.x+=(tx-view.x)*al;view.y+=(ty-view.y)*al;if(RT-lfb>.16){lfb=RT;updFollowBar(fp)}dirty=true}else{follow=null;updFollowBar()}}
  if(!introOpen&&(ownedN()||lines.length||dem||fx.length||fxText.length||(hover&&((cur&&cur.ids.length)||buildSt||moveSt!=null))||st.some(s=>s.born!==undefined&&RT-s.born<.55)))dirty=true;
  if(dirty&&W&&!introOpen&&(!modalOpen||now-modalDrawT>=100)){dirty=false;modalDrawT=now;draw()}
 }catch(err){console.error(err)}
 finally{requestAnimationFrame(loop)}
})(lt);
function intro(){
 const cd=$("cd");cd.className="intro";cd.onclick=null;
 const cN=getSaves("career").length,sN=getSaves("sandbox").length,scWins=Object.keys(getScnWins()).length;
 cd.innerHTML='<div style="font-size:46px">🚇</div><h1>BURSA METRO</h1><p>Şehrin raylı sistem ağı senin ellerinde.</p><div class="trk"><i></i><i></i></div>'+
  '<div class="modes">'+
  `<button class="mode-btn car" id="goCar"><span class="mode-ic">🚇</span><b>Kariyer Modu</b><small>Bütçe yönetimi, 3 zorluk seviyesi, krizler, krediler ve belediye ihaleleri.</small><span class="mode-cnt">💾 ${cN}/${MAX_SAVES} Kayıtlı Oyun</span></button>`+
  `<button class="mode-btn sbx" id="goSbx"><span class="mode-ic">🧪</span><b>Sandbox Modu</b><small>Sınırsız bütçe, tüm metro ve tramvay araçları ilk günden açık, özgür ağ kurulumu.</small><span class="mode-cnt">💾 ${sN}/${MAX_SAVES} Kayıtlı Oyun</span></button>`+
  `<button class="mode-btn scn" id="goScn"><span class="mode-ic">🏆</span><b>Senaryolar</b><small>Bursa'ya özel süreli görev haritaları: Hastane Ekspresi, Tramvay Ağı &amp; OSB Koridoru.</small><span class="mode-cnt">🏅 ${scWins}/${SCENARIOS.length} Tamamlandı</span></button>`+
  '</div>'+
  '<div class="ft"><div><b>🗺️</b>Gerçek Bursa haritasında gez</div><div><b>🚉</b>İstasyon kur, hat çiz</div><div><b>📜</b>Dönemsel Ulaşım Karnesi</div></div>';
 $("goCar").onclick=()=>{SFX.open();openModeScreen("career")};
 $("goSbx").onclick=()=>{SFX.open();openModeScreen("sandbox")};
 $("goScn").onclick=()=>{SFX.open();openScenarioScreen()};
}
function openScenarioScreen(){
 const cd=$("cd"),wins=getScnWins();
 cd.className="card";
 cd.innerHTML=`<div class="mscreen-hd"><h2>🏆 Özel Bursa Senaryoları</h2><button class="mback" id="sBack">← Ana Menü</button></div>`+
  `<p style="margin:0 0 8px;font-size:13px;color:var(--mut)">Belirlenen gün sınırı dolmadan tüm görevleri tamamla ve rozetleri topla.</p>`+
  `<div class="scn-grid">`+SCENARIOS.map(sc=>{
   const w=wins[sc.id];
   return `<div class="scn-card${w?" won":""}"><div class="scn-hd"><div><h3>${sc.ic} ${sc.title}</h3><small style="color:var(--mut)">${sc.sub}</small></div><span class="scn-badge${w?" won":""}">${w?`🏅 ${w.bestDay}. Günde Bitti`:`⏱ ${sc.days} Gün · ₺${sc.startBudget}M`}</span></div>`+
    `<div class="scn-reqs">`+sc.reqs.map(r=>`<span class="scn-req">${r.t}</span>`).join("")+`</div>`+
    `<div class="da"><button class="pri" data-scn="${sc.id}">▶ Senaryoyu Başlat</button></div></div>`;
  }).join("")+`</div>`;
 $("sBack").onclick=()=>{SFX.close();intro()};
 cd.onclick=e=>{const b=e.target.closest("[data-scn]");if(b){SFX.launch();startScenario(b.dataset.scn)}};
}
function openModeScreen(mode,selDiff){
 const cd=$("cd"),isSbx=mode==="sandbox";
 let curD=selDiff||"easy",delArmed=null;
 cd.className="card";
 const renderMode=()=>{
  const curSaves=getSaves(mode),full=curSaves.length>=MAX_SAVES;
  const slotsHtml=curSaves.length?`<div class="slots">`+curSaves.map(s=>{
   const df=s.mode==="sandbox"?{ic:"🧪",name:"Sandbox",cls:"sbx"}:{...(DIFFS[s.diff]||DIFFS.easy),cls:(s.diff||"easy")};
   const dt=s.updatedAt?new Date(s.updatedAt).toLocaleDateString("tr-TR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"}):"";
   const bTxt=s.mode==="sandbox"?"∞ Sınırsız":("₺"+Math.round(s.budget||0)+"M");
   const armed=delArmed===s.slotId;
   return `<div class="slot"><div class="slot-info"><b>${s.corp||"Bursaray"} <span class="dbadge ${df.cls}">${df.ic} ${df.name}</span></b><small>Gün ${s.day||1} · ${s.lineCount||0} hat · Kapsama %${(s.cov||0).toFixed(1).replace(".",",")} · ${bTxt}${dt?" · "+dt:""}</small></div><div class="slot-acts"><button class="pri" data-load="${s.slotId}">▶ Devam</button><button class="danger" data-del="${s.slotId}">${armed?"Emin misin?":"🗑"}</button></div></div>`;
  }).join("")+`</div>`:`<div class="slot-empty">Henüz kayıtlı ${isSbx?"Sandbox":"Kariyer"} oyunu yok. Aşağıdan yeni oyun başlatabilirsin.</div>`;
  const diffHtml=isSbx?`<p style="font-size:13px;color:var(--mut);margin:6px 0 12px">🧪 Sınırsız bütçe · Tüm metro vagonları ve tramvay setleri 1. günden açık · İflas veya belediye el koyması yok.</p>`:
   `<div class="diffs">`+Object.values(DIFFS).map(d=>`<button class="diff-btn${curD===d.id?" on":""}" data-df="${d.id}"><b>${d.ic} ${d.name}</b><small>${d.desc}</small></button>`).join("")+`</div>`;
  cd.innerHTML=`<div class="mscreen-hd"><h2>${isSbx?"🧪 Sandbox Modu":"🚇 Kariyer Modu"}</h2><button class="mback" id="mBack">← Ana Menü</button></div>`+
   `<p style="margin:0 0 8px;font-size:13px;color:var(--mut)"><b>Kayıtlı Oyunlar (${curSaves.length}/${MAX_SAVES})</b></p>`+slotsHtml+
   `<div class="newbox"><h3>✨ Yeni ${isSbx?"Sandbox":"Kariyer"} Oyunu</h3>`+
   (full?`<p style="color:#e63946;font-size:13px;margin:4px 0">En fazla ${MAX_SAVES} kayıtlı oyun saklanabilir. Yeni oyun başlatmak için yukarıdan bir kaydı sil.</p>`:
   `<input id="corpn" maxlength="18" placeholder="${isSbx?"Örn. Bursa Sandbox":"Örn. Bursaray"}" style="font-size:16px;padding:9px 12px;border-radius:12px;border:1.5px solid var(--bd);background:var(--card);color:var(--ink);width:100%;margin-bottom:4px">${diffHtml}<button class="pri" id="startNew" style="width:100%;padding:11px;font-weight:800">Yeni Oyuna Başla →</button>`)+`</div>`;
  $("mBack").onclick=()=>{SFX.close();intro()};
  const sn=$("startNew");
  if(sn)sn.onclick=()=>{
   const v=$("corpn").value.trim().slice(0,18);
   if(!v){SFX.err();$("corpn").style.borderColor="#e63946";$("corpn").focus();return}
   SFX.open();resetWorld(mode,curD,v);choose();
  };
 };
 cd.onclick=e=>{
  const ld=e.target.closest("[data-load]");if(ld){loadSlot(mode,ld.dataset.load);return}
  const dl=e.target.closest("[data-del]");if(dl){const sid=dl.dataset.del;if(delArmed===sid){delSave(mode,sid);delArmed=null;SFX.del();renderMode()}else{delArmed=sid;SFX.click();renderMode()}return}
  const dfb=e.target.closest("[data-df]");if(dfb){curD=dfb.dataset.df;SFX.tab();renderMode()}
 };
 renderMode();
}
function choose(){
 const cd=$("cd");cd.className="card";
 const modInfo=isSandbox()?"Sınırsız bütçe · Tüm metro & tramvaylar açık":`${DIFFS[diff].ic} ${DIFFS[diff].name} Zorluk · Başlangıç bütçen <b>₺${budget}M</b>`;
 cd.innerHTML=`<div class="mscreen-hd"><h2>İlk hattını seç</h2><button class="mback" id="cBack">← Geri</button></div><p>${modInfo}. Fiyatlar ve kazançlar seçtiğin zorluğa göre hesaplanır.</p><div class="lcs">`+
  D.bl.map(l=>{const c=CFG[l.id],bp=burPrice(l.id),bn=burEstNet(l.id);return '<div class="lc" style="border-color:'+c.color+'"><b>'+l.title+'</b><small>'+l.from+' ↔ '+l.to+'</small><div>'+l.sts.length+' istasyon · '+l.km+' km</div><div>Fiyat: <b>'+(isSandbox()?"Ücretsiz (Sandbox)":"₺"+bp+"M")+'</b></div><div>Günlük ort. yolcu: <b>'+fmt(c.pax)+'</b></div><div>Tahmini net gelir: <b>₺'+bn+'M/gün</b></div><div>Geri ödeme: ~'+(bp?Math.round(bp/bn):0)+' gün</div><button class="pri" data-b="'+l.id+'">'+(isSandbox()?"Hattı Aç":"Satın al")+'</button></div>'}).join("")+
  `</div><button id="sbxEmpty" style="width:100%;margin-top:12px;padding:12px;font-weight:800;border-radius:14px">🗺️ Bursaray Hattı Almadan Sıfırdan Başla</button>`;
 $("cBack").onclick=()=>{SFX.close();openModeScreen(gameMode,diff)};
 const se=$("sbxEmpty");if(se)se.onclick=()=>{started=true;$("ov").hidden=true;SFX.launch();toast(isSandbox()?"🧪 Sandbox modu başladı! Sınırsız bütçe ve tüm araçlar açık.":"🚇 Sıfırdan kariyer başladı! Bütçen: ₺"+budget+"M");msg("Önce 📍 Durak Kur veya Yeni hat butonunu kullanarak kendi hattını çiz.");ui();save()};
 cd.onclick=e=>{const b=e.target.closest("[data-b]");if(b&&b.dataset.b)buy(b.dataset.b)};
}
msg("Sürükleyerek gez, tekerlek veya iki parmakla yakınlaştır.");intro();ui();
