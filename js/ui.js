/* Lost in Kyoto · HTML interface: HUD, inspection card, Basket / Market / Trade / Zukan panels, title, story and ending. */
'use strict';
// ====================================================================
//  HUD / UI
// ====================================================================
let lastHint='';const TOUCH=matchMedia('(pointer:coarse)').matches;
function hintText(){switch(G.state){
 case 'idle':return TOUCH?'Touch &amp; hold to cast':'Hold <kbd>SPACE</kbd> or press &amp; hold to cast';
 case 'charging':return 'Release to cast! (farther = rarer fish)';
 case 'casting':return '…';
 case 'waiting':return 'Wait for a bite… watch the float';
 case 'bite':return '<b style="color:#ff9a8a">BITE! '+(TOUCH?'Tap':'Press')+' now!</b>';
 case 'reeling':return 'Hold to raise the net. Keep the fish inside!';
 case 'leaping':return '!!!';
 default:return '&nbsp;';}}
function hintVis(){$('hint').style.visibility=(lastHint==='&nbsp;'||anyOverlay())?'hidden':'visible';}
function updHUD(){
 $('coins').textContent=S.coins;const [pj,pe]=phase(S.time);$('tod').textContent=pj+' '+pe;
 const bs=S.baitSel;$('baitName').textContent=BAITS[bs].name+(bs!=='rice'?' ×'+S.bait[bs]:'');
 $('bdot').textContent=S.basket.length;$('bdot').style.display=S.basket.length?'block':'none';
 const zc=FISH.filter(f=>S.zukan[f.id]).length;$('zdot').textContent=zc+'/5';
 const h=hintText();if(h!==lastHint){$('hint').innerHTML=h;$('hint').style.visibility=(h==='&nbsp;'||anyOverlay())?'hidden':'visible';lastHint=h;}
}
function toast(msg,cls){const d=document.createElement('div');d.className='toast '+(cls||'');d.innerHTML=msg;$('toasts').appendChild(d);setTimeout(()=>d.remove(),2700);}
function anyOverlay(){return document.querySelector('.overlay.show')!==null;}
function fishImg(id,h,sil){return '<img class="fimg" src="'+(sil?SILURL[id]:FURL[id])+'" style="height:'+h+'px" alt="">';}
function stars(r){let s='';for(let i=0;i<5;i++)s+=i<=r?'★':'<i>★</i>';return '<span class="stars">'+s+'</span>';}
function coinS(n){return '<span class="coin"></span>'+n;}

// ---------- inspection ----------
let insAnim=null;
function openInspect(inst,fresh){
 const f=FI[inst.id],rar=RAR[f.r];let info={isNew:false,best:false};
 if(fresh){info=registerZukan(inst);A.catch(f.r);if(info.isNew)setTimeout(()=>A.tone(110,2,'sine',.3),300);}
 const card=$('card');card.style.setProperty('--rc',rar.c);
 $('ribbon').innerHTML=stars(f.r)+'<span>'+rar.n.toUpperCase()+' · '+rar.jp+'</span>';
 $('iname').innerHTML='<span class="jp">'+f.jp+'</span><br>'+f.name+' <span style="font-size:16px;color:var(--muted)">'+f.kj+'</span>';
 $('isub').textContent='“'+f.title+'”';
 $('istats').innerHTML='<div>Length<b>'+inst.len+' cm</b></div><div>Weight<b>'+(inst.wt<1?R(inst.wt*1000)+' g':inst.wt+' kg')+'</b></div><div>Value<b>'+coinS(inst.val)+'</b></div>';
 $('idesc').textContent=f.desc;
 $('ibest').textContent=info.best?'★ New personal best size! ★':(fresh&&inst.len>=f.size[0]+(f.size[1]-f.size[0])*.85?'A trophy-sized catch!':'');
 const h=$('hanko');h.style.display=info.isNew?'block':'none';h.style.animation='none';void h.offsetWidth;h.style.animation='';
 const bt=$('ibtns');bt.innerHTML='';
 if(fresh){
   const full=S.basket.length>=S.cap;
   const k=document.createElement('button');k.className='btn';k.textContent=full?'Basket full!':'Keep  かごへ';k.disabled=full;
   k.onclick=()=>{S.basket.push(inst);toast('Added to basket ('+S.basket.length+'/'+S.cap+')');closeInspect();A.ui();};
   const sl=document.createElement('button');sl.className='btn green';sl.innerHTML='Sell now '+coinS(inst.val);
   sl.onclick=()=>{S.coins+=inst.val;toast('+'+coinS(inst.val),'gold');A.coin();closeInspect();};
   const rl=document.createElement('button');rl.className='btn alt';rl.textContent='Release  にがす';
   rl.onclick=()=>{S.blessing=Math.min(3,S.blessing+1);toast('The river is grateful. Luck for your next cast ✿','gold');closeInspect();A.pluck(A.nf(7),A.ctx?A.ctx.currentTime:0,.15,2);};
   bt.append(k,sl,rl);
   if(full)toast('Basket full — sell at the Market (いちば).','red');
 } else {const c=document.createElement('button');c.className='btn alt';c.textContent='Close';c.onclick=()=>{closeInspect();openPanel('basket');};bt.append(c);}
 $('inspect').classList.add('show');
 // stage animation
 const ic=$('insCv'),x=ic.getContext('2d');x.imageSmoothingEnabled=false;const sp=SPR[f.id],sil=SIL[f.id];
 const sc=Math.max(1,Math.floor(Math.min(150/sp.width,74/sp.height)));const st=performance.now();const col=hex(rar.c);
 const sparks=[];for(let i=0;i<24;i++)sparks.push([Math.random()*200,Math.random()*100,Math.random()*6]);
 cancelAnimationFrame(insAnim);
 const loop=now=>{const t=(now-st)/1000;x.fillStyle='#1a1430';x.fillRect(0,0,200,100);
   // rays
   x.save();x.translate(100,50);x.rotate(t*.25);x.fillStyle='rgba('+col.join(',')+','+(0.14+f.r*.03)+')';for(let i=0;i<10;i++){x.rotate(Math.PI/5);x.beginPath();x.moveTo(0,0);x.lineTo(130,-14);x.lineTo(130,14);x.fill();}x.restore();
   // radial
   const gr=x.createRadialGradient(100,50,4,100,50,90);gr.addColorStop(0,'rgba('+col.join(',')+',.35)');gr.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=gr;x.fillRect(0,0,200,100);
   // waves bottom
   x.fillStyle='rgba(120,180,230,.18)';for(let i=0;i<200;i+=2){x.fillRect(i,88+Math.round(Math.sin(i*.1+t*2)*2),2,12);}
   for(const s of sparks){const a=(Math.sin(t*3+s[2])+1)/2;x.globalAlpha=a*(.4+f.r*.12);x.fillStyle='#fff6c8';x.fillRect(Math.round(s[0]),Math.round(s[1]),1,1);if(a>.85){x.fillRect(Math.round(s[0])-1,Math.round(s[1]),3,1);x.fillRect(Math.round(s[0]),Math.round(s[1])-1,1,3);}}
   x.globalAlpha=1;
   const reveal=fresh&&f.r>=2?clamp((t-.5)/.15,0,1):1;const bob=Math.round(Math.sin(t*2.2)*2);
   const dw=sp.width*sc,dh=sp.height*sc,dx=Math.round(100-dw/2),dy=Math.round(50-dh/2)+bob;
   x.globalAlpha=.35;x.fillStyle='#000';x.fillRect(dx+4,dy+dh+4-bob,dw-8,2);x.globalAlpha=1;
   x.drawImage(reveal<1?sil:sp,dx,dy,dw,dh);
   if(fresh&&f.r>=2&&t>.5&&t<.9){x.globalAlpha=1-(t-.5)/.4;x.fillStyle='#fff';x.fillRect(0,0,200,100);x.globalAlpha=1;}
   insAnim=requestAnimationFrame(loop);};
 insAnim=requestAnimationFrame(loop);
 updHUD();save();
 if(fresh&&FISH.every(ff=>S.zukan[ff.id])&&!S.done)setTimeout(()=>{G.pendingEnd=true;},50);
}
function closeInspect(){$('inspect').classList.remove('show');cancelAnimationFrame(insAnim);if(G.state==='inspect')G.state='idle';G.leap=null;updHUD();save();
 if(G.pendingEnd){G.pendingEnd=false;setTimeout(ending,400);}}

// ---------- panels ----------
let curPanel=null,mTab='sell';
function openPanel(name){A.init();A.ui();curPanel=name;renderPanel();$('panel').classList.add('show');}
function closePanel(){$('panel').classList.remove('show');curPanel=null;updHUD();save();}
function cnt(id){return S.basket.filter(f=>f.id===id).length;}
function renderPanel(){const pb=$('pb'),pf=$('pf');pf.innerHTML='';pf.style.display='flex';
 if(curPanel==='basket'){$('pk').textContent='かご';$('pt').textContent='Basket  ('+S.basket.length+'/'+S.cap+')';
   if(!S.basket.length){pb.innerHTML='<div class="empty">Your basket is empty.<br>Go catch something! 🎣</div>';}
   else{pb.innerHTML='<div class="grid">'+S.basket.map((f,i)=>'<button class="tile" data-i="'+i+'">'+fishImg(f.id,36)+'<div>'+FI[f.id].name+'</div><div class="sm">'+f.len+' cm · '+coinS(f.val)+'</div></button>').join('')+'</div>';
     pb.querySelectorAll('.tile').forEach(t=>t.onclick=()=>{closePanel();openInspect(S.basket[+t.dataset.i],false);});}
   const tot=S.basket.reduce((a,f)=>a+f.val,0);pf.innerHTML='<span>Total value: '+coinS(tot)+'</span>';const b=document.createElement('button');b.className='btn';b.textContent='Go to Market';b.onclick=()=>{curPanel='market';mTab='sell';renderPanel();};pf.append(b);}
 else if(curPanel==='market'){$('pk').textContent='いちば';$('pt').textContent='Nishiki Market';
   let h='<div class="tabs"><button class="tab '+(mTab==='sell'?'on':'')+'" data-t="sell">Sell  うる</button><button class="tab '+(mTab==='buy'?'on':'')+'" data-t="buy">Buy  かう</button></div>';
   if(mTab==='sell'){const rows=FISH.filter(f=>cnt(f.id)>0);
     if(!rows.length)h+='<div class="empty">Nothing to sell. The fishmonger taps her counter impatiently.</div>';
     rows.forEach(f=>{const list=S.basket.filter(x=>x.id===f.id),tot=list.reduce((a,x)=>a+x.val,0);
       h+='<div class="row">'+fishImg(f.id,28)+'<div class="grow"><div class="nm">'+f.name+' <span class="sm">'+f.jp+'</span> ×'+list.length+'</div><div class="sm">Worth '+coinS(tot)+' total</div></div><button class="btn alt" data-s1="'+f.id+'">Sell 1</button><button class="btn" data-sa="'+f.id+'">Sell all</button></div>';});
   } else {
     const items=[];
     RODS.forEach((r,i)=>{if(i===0)return;items.push({k:'rod'+i,ic:'さお',name:r.name+'  '+r.jp,desc:r.desc,price:r.price,owned:S.rod>=i,lock:S.rod<i-1,buy:()=>{S.rod=i;}});});
     items.push({k:'cap',ic:'かご',name:'Ōkago  おおかご',desc:'Big basket. Hold 24 fish instead of 12.',price:120,owned:S.cap>=24,buy:()=>{S.cap=24;}});
     items.push({k:'charm',ic:'おまもり',name:'Omamori  おまもり',desc:'Lucky shrine charm. Fish bite 40% faster, longer hook window.',price:260,owned:S.charm,buy:()=>{S.charm=true;}});
     items.push({k:'shrimp',ic:'えび',name:'Ebi shrimp bait ×5',desc:'Attracts Yamame & Koi. (you have '+S.bait.shrimp+')',price:25,owned:false,buy:()=>{S.bait.shrimp+=5;S.baitSel='shrimp';}});
     items.push({k:'glow',ic:'ほたる',name:'Hotaru glow-worm bait ×3',desc:'Lures Fugu… and something golden at night. (you have '+S.bait.glow+')',price:90,owned:false,buy:()=>{S.bait.glow+=3;S.baitSel='glow';}});
     items.forEach((it,i)=>{h+='<div class="row"><span class="phead" style="padding:0;background:none;border:0"><span class="k" style="font-size:13px;white-space:nowrap;min-width:64px;text-align:center">'+it.ic+'</span></span><div class="grow"><div class="nm">'+it.name+'</div><div class="sm">'+it.desc+'</div></div>'+
       (it.owned?'<button class="btn alt" disabled>Owned</button>':'<button class="btn" data-buy="'+i+'" '+(S.coins<it.price||it.lock?'disabled':'')+'>'+(it.lock?'Locked':coinS(it.price))+'</button>')+'</div>';});
     G._items=items;
   }
   pb.innerHTML=h;
   pb.querySelectorAll('.tab').forEach(t=>t.onclick=()=>{mTab=t.dataset.t;A.ui();renderPanel();});
   pb.querySelectorAll('[data-s1]').forEach(b=>b.onclick=()=>sell(b.dataset.s1,1));
   pb.querySelectorAll('[data-sa]').forEach(b=>b.onclick=()=>sell(b.dataset.sa,99));
   pb.querySelectorAll('[data-buy]').forEach(b=>b.onclick=()=>{const it=G._items[+b.dataset.buy];if(S.coins<it.price)return;S.coins-=it.price;it.buy();A.coin();toast('Bought '+it.name+'!','gold');renderPanel();updHUD();});
   pf.innerHTML='<span>Purse: '+coinS(S.coins)+'</span>';
   if(mTab==='sell'&&S.basket.length){const b=document.createElement('button');b.className='btn';b.textContent='Sell everything';b.onclick=()=>{FISH.forEach(f=>sell(f.id,99,true));A.coin();renderPanel();};pf.append(b);}}
 else if(curPanel==='trade'){$('pk').textContent='こうかん';$('pt').textContent='Jirō-san, the Ferryman';
   let h='<div class="npc"><canvas id="npcCv" width="24" height="24"></canvas><div class="bubble">"Yō, otsukare-san! Fish for fish, young traveller. The river doesn\'t care for coins. Bring me what I ask and I\'ll trade you something rarer."</div></div>';
   TRADES.forEach((tr,i)=>{let ok=true;const gives=Object.entries(tr.give).map(([id,n])=>{const have=cnt(id);if(have<n)ok=false;return '<span class="chip '+(have>=n?'ok':'no')+'"><img src="'+FURL[id]+'">'+FI[id].name+' '+have+'/'+n+'</span>';}).join('');
     const gf=FI[tr.get];const known=S.zukan[gf.id];
     h+='<div class="row"><div class="grow"><div class="give">'+gives+'<span class="arrow">➜</span><span class="chip">'+(known?'<img src="'+FURL[gf.id]+'">'+gf.name:'<img src="'+SILURL[gf.id]+'">???')+'</span></div></div><button class="btn" data-tr="'+i+'" '+(ok?'':'disabled')+'>Trade</button></div>';});
   pb.innerHTML=h;drawNPC($('npcCv'));
   pb.querySelectorAll('[data-tr]').forEach(b=>b.onclick=()=>doTrade(+b.dataset.tr));
   pf.innerHTML='<span class="sm" style="color:var(--muted)">Trades take your smallest fish first.</span>';}
 else if(curPanel==='zukan'){$('pk').textContent='ずかん';const n=FISH.filter(f=>S.zukan[f.id]).length;$('pt').textContent='Fish Zukan  '+n+'/5';
   let h='<div class="prog"><b style="width:'+(n/5*100)+'%"></b></div><div class="zk">';
   FISH.forEach((f,i)=>{const z=S.zukan[f.id];
     if(z)h+='<div class="zcard"><span class="no">No.'+(i+1)+'</span>'+fishImg(f.id,44)+'<div class="jp">'+f.jp+'</div><div>'+f.name+'</div>'+stars(f.r)+'<div class="sm">Caught ×'+z.n+' · Best '+z.best+' cm</div></div>';
     else h+='<div class="zcard unk"><span class="no">No.'+(i+1)+'</span>'+fishImg(f.id,44,true)+'<div class="jp">？？？</div><div>Unknown</div>'+stars(f.r)+'<div class="sm">'+f.hint+'</div></div>';});
   h+='</div>';pb.innerHTML=h;
   pf.innerHTML='<span class="sm">'+(S.done?'Complete! Fireworks bloom over Kyoto every night. はなび':'Complete the book and Jirō will row you home.')+'</span>';}
}
function sell(id,n,quiet){const idx=[];S.basket.forEach((f,i)=>{if(f.id===id)idx.push(i);});const take=idx.slice(0,n);let sum=0;
 take.reverse().forEach(i=>{sum+=S.basket[i].val;S.basket.splice(i,1);});if(!sum)return;S.coins+=sum;if(!quiet){A.coin();renderPanel();}toast('+'+coinS(sum),'gold');updHUD();save();}
function doTrade(i){const tr=TRADES[i];for(const [id,n] of Object.entries(tr.give)){if(cnt(id)<n)return;}
 for(const [id,n] of Object.entries(tr.give)){for(let k=0;k<n;k++){let mi=-1;S.basket.forEach((f,j)=>{if(f.id===id&&(mi<0||f.len<S.basket[mi].len))mi=j;});S.basket.splice(mi,1);}}
 const inst=makeInst(tr.get);closePanel();toast('Jirō-san hands you a '+FI[tr.get].name+'!','gold');
 setTimeout(()=>{openInspect(inst,true);},250);}
function drawNPC(c){const x=c.getContext('2d');x.imageSmoothingEnabled=false;x.fillStyle='#3a4a7a';x.fillRect(0,0,24,24);
 x.fillStyle='#2a3460';for(let i=0;i<24;i+=3)x.fillRect(0,i,24,1);
 const p=(col,a,b,w=1,h=1)=>{x.fillStyle=col;x.fillRect(a,b,w,h);};
 p('#3f5f96',4,15,16,9);p('#2c4472',4,15,3,9);p('#f2ece0',10,15,1,9);p('#f2ece0',13,15,1,9);
 p('#f0c49a',7,7,10,8);p('#d8a07a',7,7,2,8);p('#e8e8e8',6,13,12,3);p('#e8e8e8',8,16,8,2);p('#1a1020',9,10,2,1);p('#1a1020',14,10,2,1);
 p('#e8e8e8',8,9,3,1);p('#e8e8e8',13,9,3,1);p('#c08070',11,12,2,1);
 p('#f0c49a',8,4,8,3);p('#e8e8e8',6,8,2,4);p('#e8e8e8',16,8,2,4);p('#2f4f86',6,6,12,2);p('#4a6aa8',6,6,12,1);p('#2f4f86',4,7,2,1);p('#2f4f86',3,8,2,2);}

// ---------- title / story / ending ----------
function showTitle(){const tb=$('tbtns');tb.innerHTML='';
 if(hasSave()){const c=document.createElement('button');c.className='btn';c.textContent='Continue  つづける';c.onclick=()=>{A.init();load();startPlay();};tb.append(c);}
 const n=document.createElement('button');n.className=hasSave()?'btn alt':'btn';n.textContent='New Journey  はじめる';
 n.onclick=()=>{A.init();if(hasSave()&&!confirmNew())return;S=JSON.parse(JSON.stringify(DEF));story();};tb.append(n);}
let confirmArmed=false;
function confirmNew(){if(confirmArmed)return true;confirmArmed=true;toast('Tap again to erase your save and start over.','red');setTimeout(()=>confirmArmed=false,3000);return false;}
function story(){$('title').classList.remove('show');const sb=$('storyBox');
 sb.innerHTML='<h2>終電を逃した… <span style="font-size:15px;color:var(--muted)">Missed the last train</span></h2>'+
 '<p>The last train has gone, your phone is dead, and the streets of Kyoto have folded into lantern-lit silence.</p>'+
 '<p>On a quiet riverbank, under a cherry tree, an old bamboo rod leans against a stone lantern. A white cat looks at you as if it has been waiting.</p>'+
 '<p>An old ferryman, <b>Jirō-san</b>, calls from his boat: <i>"Fill the river\'s fish book, and at dawn I\'ll row you home."</i></p>'+
 '<p class="goal">🎣 <b>Goal:</b> catch all <b>5 fish</b> for your Zukan (fish book). Sell fish at the Market for coins, buy better rods and bait, and trade with Jirō.</p>'+
 '<div style="text-align:right;margin-top:12px"><button class="btn" id="go">Pick up the rod →</button></div>';
 $('storyO').classList.add('show');$('go').onclick=()=>{$('storyO').classList.remove('show');S.started=true;startPlay(true);};}
function startPlay(first){$('title').classList.remove('show');$('hud').style.display='block';G.state='idle';bgT=-1;updHUD();save();
 if(first){setTimeout(()=>toast('Hold SPACE (or press & hold) to cast'),600);setTimeout(()=>toast('When the float dives — press quickly!'),3600);}}
function ending(){S.done=true;save();G.endFw=14;const sb=$('storyBox');
 sb.innerHTML='<h2>ずかん かんせい！ <span style="font-size:15px;color:var(--muted)">The Fish Book is complete</span></h2>'+
 '<p>Jirō turns the pages slowly, nodding at each fish. Then he laughs, unties his boat, and the sky over the Kamo river blooms with <b>hanabi</b>.</p>'+
 '<p><i>"You were never really lost, friend. You were just fishing."</i></p>'+
 '<p class="goal">✿ Thank you for playing <b>Lost in Kyoto</b>. Fireworks now light up every night. Keep fishing for bigger records!</p>'+
 '<div style="text-align:right;margin-top:12px"><button class="btn" id="go">Keep fishing →</button></div>';
 $('storyO').classList.add('show');$('go').onclick=()=>{$('storyO').classList.remove('show');};for(let i=0;i<4;i++)setTimeout(firework,i*350);}
