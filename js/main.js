/* Lost in Kyoto · Entry point: input (keyboard, mouse, touch), responsive layout and the main loop. */
'use strict';
// ====================================================================
//  INPUT
// ====================================================================
cv.addEventListener('pointerdown',e=>{e.preventDefault();if(G.state==='title')return;press();});
window.addEventListener('pointerup',()=>{if(G.holding)release();});
window.addEventListener('pointercancel',()=>{if(G.holding)release();});
window.addEventListener('keydown',e=>{
 if(e.code==='Space'){e.preventDefault();if(e.repeat)return;if(G.state==='title')return;press();return;}
 if(e.key==='Escape'){if($('panel').classList.contains('show'))closePanel();else if($('inspect').classList.contains('show')&&!$('ibtns').querySelector('.btn:not(.alt)'))closeInspect();return;}
 if(G.state!=='idle'||anyOverlay())return;
 const m={b:'basket',m:'market',t:'trade',z:'zukan'}[e.key.toLowerCase()];if(m)openPanel(m);if(e.key.toLowerCase()==='e')cycleBait();});
window.addEventListener('keyup',e=>{if(e.code==='Space'){e.preventDefault();release();}});
document.querySelectorAll('.hbtn[data-p]').forEach(b=>b.addEventListener('click',()=>{if(['charging','casting','bite','reeling','leaping'].includes(G.state)){toast('Busy fishing!');return;}openPanel(b.dataset.p);}));
$('px').onclick=closePanel;
$('panel').addEventListener('pointerdown',e=>{if(e.target.id==='panel')closePanel();});
$('snd').onclick=()=>{A.init();A.setMute(!A.muted);$('snd').style.opacity=A.muted?.5:1;toast(A.muted?'Sound off':'Sound on');};
function cycleBait(){A.ui();const order=['rice','shrimp','glow'];let i=order.indexOf(S.baitSel);for(let k=0;k<3;k++){i=(i+1)%3;const b=order[i];if(b==='rice'||S.bait[b]>0){S.baitSel=b;break;}}
 if(S.baitSel==='rice'&&!S.bait.shrimp&&!S.bait.glow)toast('Buy bait at the Market (いちば)');updHUD();}
$('bait').onclick=cycleBait;

// ====================================================================
//  LAYOUT & LOOP
// ====================================================================
function resize(){const s=Math.min(innerWidth/W,innerHeight/H);const w=Math.floor(W*s),h=Math.floor(H*s);const wr=$('wrap');wr.style.width=w+'px';wr.style.height=h+'px';wr.style.setProperty('--u',(w/W).toFixed(3));}
addEventListener('resize',resize);resize();
document.addEventListener('visibilitychange',()=>{if(document.hidden)save();});
let last=performance.now(),hudT=0;
function frame(now){const dt=Math.min(.05,(now-last)/1000);last=now;
 update(dt);
 render();hudT-=dt;if(hudT<=0&&G.state!=='title'){updHUD();hintVis();hudT=.15;}
 requestAnimationFrame(frame);}
load();if(!hasSave())S.time=.56; // start at a pretty dusk on title
showTitle();
requestAnimationFrame(frame);

// Test hook: only exposed when the page is opened with ?test (used by tests/ and run.py screenshots)
if(new URLSearchParams(location.search).has('test')){
 window.LIK={G,get S(){return S;},set:o=>Object.assign(S,o),FISH,RODS,openInspect,makeInst,ending,openPanel,updReel,startReel,
   spriteStats:()=>FISH.map(f=>{const c=SPR[f.id],d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let n=0;for(let i=3;i<d.length;i+=4)if(d[i])n++;return {id:f.id,w:c.width,h:c.height,pixels:n};})};
}
