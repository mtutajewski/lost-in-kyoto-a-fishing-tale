/* Lost in Kyoto · Game state machine: casting, bites, the reeling minigame, catches and the per-frame update. */
'use strict';
// ====================================================================
//  GAME RUNTIME STATE
// ====================================================================
const FX=143; // fisherman seat x
const G={state:'title',t:0,power:0,pdir:1,holding:false,
 bob:{x:0,y:SURF,vy:0,dip:0,from:null,to:null,ct:0},
 wait:0,waitTot:0,nib:0,biteT:0,species:null,shadow:null,
 M:null,leap:null,flash:0,shake:0,catJump:0,catCD:0,escapeT:0,baitUsed:'rice',
 parts:[],ripples:[],petals:[],flies:[],fish:[],clouds:[],works:[],fwT:0};
for(let i=0;i<4;i++)G.clouds.push({x:rnd(0,W),y:rnd(10,50),s:rnd(.6,1.2),v:rnd(1.5,3.5)});
for(let i=0;i<5;i++)G.fish.push(newAmbient(true));
for(let i=0;i<14;i++)G.flies.push({x:rnd(0,W),y:rnd(50,118),p:rnd(0,6),vx:rnd(-4,4),vy:rnd(-2,2)});
function newAmbient(init){const id=Math.random()<.7?'ayu':(Math.random()<.6?'yamame':'koi');const dir=Math.random()<.5?-1:1;
 return {id,x:init?rnd(70,W):(dir<0?W+30:40),y:rnd(132,166),dir,v:rnd(5,13),p:rnd(0,6)};}

// ====================================================================
//  HELPERS: rod / hand
// ====================================================================
function poseName(){const s=G.state;if(s==='charging')return 'up';if(s==='casting'&&G.bob.ct<.25)return 'fwd';
 if(s==='reeling')return (Math.floor(G.t*8)%2)?'reel0':'reel1';if(s==='leaping')return 'cheer';return 'rest';}
function handPos(){const [hx,hy]=HANDS[poseName()];return [FX+hx,DECK+hy];}
function rodGeom(){const [hx,hy]=handPos();let a=-1.0,bend=0;const s=G.state;
 if(s==='idle'||s==='title'){a=-1.05+Math.sin(G.t*1.3)*.04;}
 else if(s==='charging'){a=-1.3-G.power*1.1;}
 else if(s==='casting'){a=G.bob.ct<.25?lerp(-2.3,-.45,G.bob.ct/.25):-.55;}
 else if(s==='waiting'){a=-.7-G.nib*.08;}
 else if(s==='bite'){a=-.55+Math.sin(G.t*40)*.05;bend=.25;}
 else if(s==='reeling'){const o=G.M&&G.M.over;a=-.95+Math.sin(G.t*20)*.03;bend=o?.55:.3;}
 else if(s==='leaping'){a=-1.5;}
 else if(s==='escaped'){a=-.8;}
 else a=-.9;
 const L=30;const tip=[hx+Math.cos(a+bend)*L,hy+Math.sin(a+bend)*L];const ctl=[hx+Math.cos(a)*L*.55,hy+Math.sin(a)*L*.55];
 return {h:[hx,hy],tip,ctl};}
function qpt(p0,p1,p2,t){const u=1-t;return [u*u*p0[0]+2*u*t*p1[0]+t*t*p2[0],u*u*p0[1]+2*u*t*p1[1]+t*t*p2[1]];}

// ====================================================================
//  GAME FLOW
// ====================================================================
function press(){
 A.init();
 if(anyOverlay())return;
 G.holding=true;
 switch(G.state){
  case 'idle':G.state='charging';G.power=0;G.pdir=1;break;
  case 'waiting':G.state='escaped';G.escapeT=0;toast('Too early… you reeled in.','red');A.click();break;
  case 'bite':startReel();break;
 }
}
function release(){
 G.holding=false;
 if(G.state==='charging')doCast();
}
function doCast(){
 G.state='casting';const p=G.power;G.castPower=p;
 const r=rodGeom();
 G.bob.from=[r.tip[0],r.tip[1]];G.bob.to=[168+p*134,SURF];G.bob.ct=0;
 // bait
 G.baitUsed='rice';
 if(S.baitSel!=='rice'){if(S.bait[S.baitSel]>0){S.bait[S.baitSel]--;G.baitUsed=S.baitSel;}if(S.bait[S.baitSel]<=0&&S.baitSel!=='rice'){S.baitSel='rice';}}
 S.casts++;updHUD();A.cast();
}
function rollSpecies(){const w=FISH.map(f=>f.weight);const night=isNight();const p=G.castPower||0;
 if(p>.72){w[2]*=1.4;w[3]*=1.4;w[4]*=1.5;}
 if(p<.25){w[0]*=1.5;}
 if(G.baitUsed==='shrimp'){w[1]*=2.2;w[2]*=1.8;w[3]*=1.2;}
 if(G.baitUsed==='glow'){w[0]*=.4;w[3]*=3;w[4]*=night?6:1.5;}
 if(night){w[4]*=2.2;w[3]*=1.3;}else{w[4]*=.35;}
 if(S.time<.08||S.time>.97)w[1]*=1.8;
 if(S.blessing>0){w[2]*=1.6;w[3]*=1.6;w[4]*=2;S.blessing--;}
 const tot=w.reduce((a,b)=>a+b,0);let r=Math.random()*tot;for(let i=0;i<w.length;i++){r-=w[i];if(r<=0)return FISH[i].id;}return 'ayu';}
function landBobber(){
 G.state='waiting';G.bob.x=G.bob.to[0];G.bob.y=SURF;G.bob.dip=0;
 splash(G.bob.x,SURF,8,'#dff4ff');ripple(G.bob.x);A.plop();
 G.species=rollSpecies();
 G.waitTot=rnd(2.6,7.2)*(S.charm?.62:1)*(G.baitUsed!=='rice'?.85:1);G.wait=0;G.nib=0;G.nextNib=G.waitTot*rnd(.35,.55);
 const dir=Math.random()<.5?-1:1;G.shadow={x:G.bob.x+dir*90,y:rnd(150,165),dir:-dir};
}
function bite(){G.state='bite';G.biteT=1.3+(S.charm?.4:0)+S.rod*.1;G.bob.dip=4;A.bite();splash(G.bob.x,SURF,6,'#ffffff');G.shake=2;}
function startReel(){
 const f=FI[G.species];const Z=RODS[S.rod].zone;
 G.state='reeling';G.M={Z,zy:20,zv:0,fy:30,ft:40,fv:0,mt:.6,prog:.4,over:false,ck:0,d:f.diff};
 A.tone(500,.08,'square',.1);
}
function updReel(dt){const M=G.M,BAR=80;
 if(G.holding)M.zv+=200*dt;else M.zv-=150*dt;M.zv*=1-dt*1.5;M.zv=clamp(M.zv,-100,100);M.zy+=M.zv*dt;
 if(M.zy<0){M.zy=0;M.zv=-M.zv*.35;}if(M.zy>BAR-M.Z){M.zy=BAR-M.Z;M.zv=0;}
 M.mt-=dt;if(M.mt<=0){const d=M.d;M.mt=rnd(.7,1.8)/d.freq;M.ft=Math.random()<d.dart*.75?(M.fy<BAR/2?rnd(BAR*.65,BAR-6):rnd(0,BAR*.35)):clamp(M.fy+rnd(-20,20),0,BAR-6);}
 const sp=M.d.spd*.66*(S.rod===2?.85:1);M.fv=lerp(M.fv,(M.ft-M.fy)*2.6*sp,clamp(dt*4,0,1));M.fy=clamp(M.fy+M.fv*dt,0,BAR-6);
 M.over=(M.fy+3>=M.zy-3&&M.fy+3<=M.zy+M.Z+3);
 const r=FI[G.species].r;
 M.prog+=M.over?(.44-r*.022)*dt:-(.11+r*.045)*dt;
 M.ck-=dt;if(M.over&&M.ck<=0){A.click();M.ck=.09;}
 G.bob.dip=2+Math.sin(G.t*25)*1.5;
 if(Math.random()<dt*6)splash(G.bob.x+rnd(-3,3),SURF,1,'#cfe8ff');
 if(M.prog>=1){caught();}else if(M.prog<=0){G.state='escaped';G.escapeT=0;toast('It got away…','red');A.escape();splash(G.bob.x,SURF,8,'#dff4ff');}
}
function caught(){
 G.state='leaping';const f=FI[G.species];
 G.leap={t:0,x0:G.bob.x,y0:SURF,x1:FX+2,y1:62,id:f.id};
 splash(G.bob.x,SURF,18,'#e8f8ff');ripple(G.bob.x);A.splash();G.shake=3;
 G.inst=makeInst(f.id);
}
function makeInst(id){const f=FI[id];let r=Math.pow(Math.random(),1.5);if(Math.random()<.06)r=.85+Math.random()*.15;
 const len=+(f.size[0]+(f.size[1]-f.size[0])*r).toFixed(1);const wt=+(f.wk*Math.pow(len,3)).toFixed(2);
 return {id,len,wt,val:Math.round(f.base*(.75+.6*r)),ts:Date.now()};}
function registerZukan(inst){const z=S.zukan[inst.id]||(S.zukan[inst.id]={n:0,best:0});const isNew=z.n===0;const best=inst.len>z.best&&!isNew;z.n++;if(inst.len>z.best)z.best=inst.len;return {isNew,best};}

// particles
function splash(x,y,n,col){for(let i=0;i<n;i++)G.parts.push({x:x+rnd(-2,2),y,vx:rnd(-30,30),vy:rnd(-60,-20),g:180,life:rnd(.4,.8),c:Math.random()<.5?col:'#9ccbe8',s:1});}
function sparkle(x,y,n,col){for(let i=0;i<n;i++){const a=rnd(0,6.28),v=rnd(20,70);G.parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,g:20,life:rnd(.5,1.1),c:col||'#fff3a0',s:Math.random()<.3?2:1,star:1});}}
function ripple(x){G.ripples.push({x,r:1,life:1.2});}

// ====================================================================
//  UPDATE
// ====================================================================
function update(dt){
 G.t+=dt;S.time=(S.time+dt/DAY)%1;
 const s=G.state;
 if(s==='charging'){G.power+=G.pdir*dt*1.15;if(G.power>=1){G.power=1;G.pdir=-1;}if(G.power<=0){G.power=0;G.pdir=1;}}
 if(s==='casting'){G.bob.ct+=dt/.6;const t=Math.min(1,G.bob.ct);const [x0,y0]=G.bob.from,[x1,y1]=G.bob.to;G.bob.x=lerp(x0,x1,t);G.bob.y=lerp(y0,y1,t)-Math.sin(t*Math.PI)*36;if(G.bob.ct>=1)landBobber();}
 if(s==='waiting'){G.wait+=dt;
   const sh=G.shadow,prog=clamp(G.wait/G.waitTot,0,1);const tx=G.bob.x+sh.dir*-6;sh.x=lerp(sh.x,tx,dt*.9*(.3+prog));sh.y=lerp(sh.y,148,dt*.6);
   if(G.wait>G.nextNib&&G.wait<G.waitTot){G.bob.dip=1.5;A.nibble();G.nib=1;G.nextNib=G.wait+rnd(.45,1.1);ripple(G.bob.x);}
   if(G.wait>=G.waitTot)bite();}
 if(s==='bite'){G.biteT-=dt;if(G.biteT<=0){G.state='escaped';G.escapeT=0;toast('Too slow… it stole the bait.','red');A.escape();}}
 if(s==='reeling')updReel(dt);
 if(s==='leaping'){const L=G.leap;L.t+=dt/1.05;if(Math.random()<dt*30)sparkle(lerp(L.x0,L.x1,L.t),lerp(L.y0,L.y1,L.t)-Math.sin(L.t*Math.PI)*45,1,RAR[FI[L.id].r].c);
   if(L.t>=1){G.flash=1;sparkle(L.x1,L.y1,30,'#fff8c0');G.catJump=.5;openInspect(G.inst,true);G.state='inspect';}}
 if(s==='escaped'){G.escapeT+=dt;if(G.escapeT>.7)G.state='idle';}
 // bobber physics
 if(s==='waiting'||s==='bite'||s==='reeling'){G.bob.dip=lerp(G.bob.dip,s==='bite'?3.5:0,dt*(s==='bite'?20:6));G.bob.y=SURF-1+Math.sin(G.t*2.4)*.6+G.bob.dip;G.nib=Math.max(0,G.nib-dt*4);}
 if(s==='reeling'&&G.shadow){G.shadow.x=G.bob.x-2+Math.sin(G.t*9)*6;G.shadow.y=140+Math.sin(G.t*5)*5;}
 // ambient
 for(const f of G.fish){f.x+=f.dir*f.v*dt;f.p+=dt;if(f.x<-50||f.x>W+50)Object.assign(f,newAmbient(false));}
 for(const c of G.clouds){c.x+=c.v*dt;if(c.x>W+40){c.x=-40;c.y=rnd(8,50);}}
 for(const p of G.parts){p.vy+=p.g*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;}
 G.parts=G.parts.filter(p=>p.life>0&&(p.star||p.y<=SURF+2||p.vy<0));
 for(const r of G.ripples){r.r+=dt*14;r.life-=dt;}G.ripples=G.ripples.filter(r=>r.life>0);
 if(G.petals.length<26&&Math.random()<dt*3)G.petals.push({x:rnd(0,60),y:rnd(28,66),vx:rnd(6,16),vy:rnd(5,12),p:rnd(0,6),c:Math.random()<.5?'#ffc4d8':'#ff9ec0',on:false,life:rnd(8,14)});
 for(const p of G.petals){p.p+=dt*2;if(!p.on){p.x+=(p.vx+Math.sin(p.p)*8)*dt;p.y+=p.vy*dt;if(p.y>=SURF-1&&p.x>60){p.on=true;p.y=SURF-1;}if(p.y>DECK&&p.x>44&&p.x<PIER_END&&p.y<DECK+2){p.y=DECK-1;p.on=true;p.vx=0;}}else{p.x+=p.vx*.15*dt;}p.life-=dt;}
 G.petals=G.petals.filter(p=>p.life>0&&p.x<W+4);
 for(const f of G.flies){f.p+=dt;f.x+=(f.vx+Math.sin(f.p*.7)*5)*dt;f.y+=(f.vy+Math.cos(f.p*.9)*4)*dt;if(f.x<0)f.x=W;if(f.x>W)f.x=0;if(f.y<50||f.y>118)f.vy*=-1;}
 G.flash=Math.max(0,G.flash-dt*2.5);G.shake=Math.max(0,G.shake-dt*8);G.catJump=Math.max(0,G.catJump-dt);
 G.catCD-=dt;if(G.catCD<0){G.catCD=rnd(3,7);}
 // fireworks once complete
 if(S.done&&(isNight()||G.endFw>0)){G.fwT-=dt;if(G.fwT<=0){G.fwT=rnd(.6,1.8);firework();}}
 if(G.endFw>0)G.endFw-=dt;
 for(const w of G.works){w.t+=dt;if(w.phase===0){w.y+=w.vy*dt;if(w.t>w.fuse){w.phase=1;A.boom();const cols=[['#ff6a8a','#ffd0e0'],['#ffd24a','#fff0b0'],['#6ad0ff','#e0f6ff'],['#b07aff','#efe0ff'],['#7aff9a','#e0ffe8']][ri(0,4)];
     for(let i=0;i<46;i++){const a=i/46*6.283,v=rnd(28,40);w.sp.push({x:w.x,y:w.y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,c:Math.random()<.3?cols[1]:cols[0]});}setTimeout(()=>A.crackle(),200);}}
   else{for(const p of w.sp){p.vx*=1-dt*1.2;p.vy=p.vy*(1-dt*1.2)+18*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;}}}
 G.works=G.works.filter(w=>w.t<w.fuse+2.2);
 if(Math.floor(G.t)%5===0&&Math.floor(G.t-dt)%5!==0)save();
}
function firework(){G.works.push({x:rnd(80,300),y:110,vy:-rnd(70,95),t:0,fuse:rnd(.7,1.0),phase:0,sp:[]});}
