/* Lost in Kyoto · Per-frame rendering of the scene, the character, the fishing line and the in-world UI. */
'use strict';
// ====================================================================
//  RENDER
// ====================================================================
function render(){
 const e=env(S.time);
 if(Math.abs(S.time-bgT)>0.0016||bgT<0){drawBG(e);bgT=S.time;}
 g.save();
 if(G.shake>0)g.translate(R(rnd(-G.shake,G.shake)),R(rnd(-G.shake,G.shake)));
 g.drawImage(bgC,0,0);
 // clouds
 for(const c of G.clouds){g.globalAlpha=.85-e.night*.4;const col=rgb(e.cl),sh=shade(e.cl,.85),cx=R(c.x),cy=R(c.y),s=c.s;
   P(g,sh,cx-12*s,cy+2,24*s,3);P(g,col,cx-10*s,cy-1,20*s,3);P(g,col,cx-5*s,cy-4,10*s,3);P(g,col,cx+2*s,cy-6,6*s,2);}
 g.globalAlpha=1;
 // far water shimmer
 const wf=e.wf;
 for(let i=0;i<22;i++){const y=105+(i*7)%14,x=((i*53+G.t*(4+i%3))%(W+20))-10,w=3+(i%4)*2;g.globalAlpha=.45;P(g,lighten(wf,.45),x,y,w,1);}
 g.globalAlpha=.5;for(let y=115;y<120;y++){if((y+Math.floor(G.t*3))%2)P(g,'#c03a28',232+Math.sin(G.t*3+y)*1.2,y,2,1);if((y+Math.floor(G.t*3))%2==0)P(g,'#c03a28',248+Math.sin(G.t*3+y+1)*1.2,y,2,1);}
 g.globalAlpha=1;
 // underwater light rays
 const day=1-e.night;
 if(day>.05){g.globalAlpha=.07*day;g.fillStyle='#ffffff';for(let i=0;i<4;i++){const bx=80+i*62+Math.sin(G.t*.3+i)*10;g.beginPath();g.moveTo(bx,SURF);g.lineTo(bx+12,SURF);g.lineTo(bx+40,H);g.lineTo(bx+18,H);g.fill();}g.globalAlpha=1;}
 // seaweed
 const SW=[[72,16],[80,22],[178,14],[188,24],[214,12],[262,20],[284,26],[304,16]];
 SW.forEach(([sx,len],j)=>{for(let i=0;i<len;i++){const ox=Math.sin(G.t*1.4+i*.35+j)*(i/len)*2.6;P(g,i%3===0?'#2a5a3e':'#3e7a50',sx+ox,H-4-i,2,1);}});
 // ambient fish
 for(const f of G.fish){g.save();g.globalAlpha=.35;const sp=SIL[f.id];g.translate(R(f.x),R(f.y+Math.sin(f.p*2)*1.5));if(f.dir>0)g.scale(-1,1);const sc=f.id==='koi'?.6:.5;g.drawImage(sp,R(-sp.width*sc/2),R(-sp.height*sc/2),R(sp.width*sc),R(sp.height*sc));g.restore();}
 // target fish shadow
 if(G.shadow&&(G.state==='waiting'||G.state==='bite'||G.state==='reeling')){const sp=SIL[G.species],sh=G.shadow;g.save();g.globalAlpha=.55;g.translate(R(sh.x),R(sh.y));if(sh.dir>0)g.scale(-1,1);
   const sc=G.species==='kinryu'?.75:.6;g.drawImage(sp,R(-sp.width*sc/2),R(-sp.height*sc/2),R(sp.width*sc),R(sp.height*sc));g.restore();}
 // underwater line + hook
 if(['waiting','bite','reeling'].includes(G.state)){g.globalAlpha=.5;const hy=G.state==='reeling'?G.shadow.y:148;line(g,'#d8e8f0',G.bob.x,SURF+2,G.bob.x-3,hy);g.globalAlpha=1;P(g,'#c8c8d0',G.bob.x-4,hy,1,2);P(g,'#c8c8d0',G.bob.x-3,hy+2,1,1);
   if(G.baitUsed==='glow'){g.globalAlpha=.5+Math.sin(G.t*6)*.3;P(g,'#b8ff70',G.bob.x-5,hy-1,3,3);g.globalAlpha=1;}}
 // surface line
 const wt=e.wt;for(let x=0;x<W;x+=1){const yy=SURF+R(Math.sin(x*.18+G.t*2.2)*.6);P(g,lighten(wt,.55),x,yy,1,1);}
 g.globalAlpha=.25;P(g,lighten(wt,.3),0,SURF+1,W,1);g.globalAlpha=1;
 // ripples
 for(const r of G.ripples){g.globalAlpha=clamp(r.life,0,1)*.8;const w=R(r.r);P(g,'#ffffff',r.x-w-2,SURF,3,1);P(g,'#ffffff',r.x+w,SURF,3,1);}
 g.globalAlpha=1;
 // foreground static
 g.drawImage(fgC,0,0);
 // cat
 const cf=G.catJump>0?2:(Math.floor(G.t*1.2)%3===0?1:0);const cj=G.catJump>0?R(Math.sin((.5-G.catJump)/.5*Math.PI)*6):0;
 g.drawImage(cat(cf),118,DECK-12-cj);
 // fisherman
 const b=(G.state==='idle'||G.state==='waiting'||G.state==='title')?(Math.floor(G.t*1.1)%2):0;const leg=Math.floor(G.t*.9)%2;
 const pose=poseName();g.drawImage(fisher(pose,b,leg),FX-18,DECK-36);
 // rod
 const r=rodGeom();
 for(let i=0;i<=24;i++){const t=i/24,[x,y]=qpt(r.h,r.ctl,r.tip,t);P(g,i<5?'#5a3a20':(i%5===0?'#8a6a2a':'#d8b058'),x,y,1,1);}
 // fishing line
 if(G.state==='casting'||G.state==='waiting'||G.state==='bite'||G.state==='reeling'){
   const bx=G.bob.x,by=G.bob.y-2;const tight=G.state==='reeling'||G.state==='bite';const mid=[(r.tip[0]+bx)/2,(r.tip[1]+by)/2+(tight?2:10)];
   g.globalAlpha=.85;const n=Math.ceil(Math.hypot(bx-r.tip[0],by-r.tip[1]));for(let i=0;i<=n;i++){const [x,y]=qpt(r.tip,mid,[bx,by],i/n);P(g,'#f2ecdc',x,y);}g.globalAlpha=1;
   // bobber
   const yy=R(G.bob.y);P(g,'#1e1426',bx-1,yy-6,3,7);P(g,'#e8302a',bx,yy-5,1,3);P(g,'#ffffff',bx,yy-2,1,2);P(g,'#1e1426',bx,yy-8,1,2);
 } else if(G.state==='idle'||G.state==='charging'||G.state==='title'||G.state==='escaped'||G.state==='inspect'){
   g.globalAlpha=.8;line(g,'#f2ecdc',r.tip[0],r.tip[1],r.tip[0],r.tip[1]+8);g.globalAlpha=1;P(g,'#e8302a',r.tip[0],r.tip[1]+8,1,2);}
 // petals
 for(const p of G.petals){P(g,p.c,p.x,p.y,Math.sin(p.p)>0?2:1,1);}
 // particles
 for(const p of G.parts){g.globalAlpha=clamp(p.life*2,0,1);P(g,p.c,p.x,p.y,p.s,p.s);if(p.star&&p.s>1){P(g,p.c,p.x-1,p.y+.5,1,1);}}
 g.globalAlpha=1;
 // leaping fish
 if(G.leap&&G.state==='leaping'){const L=G.leap,t=L.t,x=lerp(L.x0,L.x1,t),y=lerp(L.y0,L.y1,t)-Math.sin(t*Math.PI)*45;const sp=SPR[L.id];
   g.save();g.translate(R(x),R(y));g.rotate(t*Math.PI*2.5);const sc=L.id==='kinryu'?.8:.7;g.drawImage(sp,R(-sp.width*sc/2),R(-sp.height*sc/2),R(sp.width*sc),R(sp.height*sc));g.restore();}
 // night tint
 const [tr,tg,tb,ta]=e.tint;if(ta>0.01){g.globalCompositeOperation='multiply';g.fillStyle='rgba('+R(tr)+','+R(tg)+','+R(tb)+','+ta+')';g.fillRect(-4,-4,W+8,H+8);g.globalCompositeOperation='source-over';}
 // glows
 if(e.night>.05){g.globalCompositeOperation='lighter';const n=e.night;
   glow(37,90,14,'255,190,90',.22*n);glow(54,91,16,'255,90,60',.28*n*(.9+Math.sin(G.t*3)*.1));
   if(G.baitUsed==='glow'&&['waiting','bite','reeling'].includes(G.state))glow(G.bob.x-4,148,10,'160,255,120',.25);
   for(const f of G.flies){const a=(Math.sin(f.p*2.3)+1)/2;if(a>.3){g.globalAlpha=a*n;P(g,'#e8ff90',f.x,f.y);g.globalAlpha=a*n*.3;P(g,'#e8ff90',f.x-1,f.y-1,3,3);}}
   g.globalAlpha=1;g.globalCompositeOperation='source-over';
   P(g,'#ffd27a',36,89,2,2);}
 // fireworks
 if(G.works.length){g.globalCompositeOperation='lighter';for(const w of G.works){if(w.phase===0){P(g,'#ffe0a0',w.x,w.y,1,2);}else{const a=clamp(1-(w.t-w.fuse)/2.2,0,1);g.globalAlpha=a;for(const p of w.sp)P(g,p.c,p.x,p.y);}}g.globalAlpha=1;g.globalCompositeOperation='source-over';}
 // UI in world
 if(G.state==='charging')drawPower();
 if(G.state==='bite')drawBang();
 if(G.state==='reeling')drawReel();
 g.restore();
 if(G.flash>0){g.globalAlpha=G.flash*.8;g.fillStyle='#fff';g.fillRect(0,0,W,H);g.globalAlpha=1;}
}
function glow(x,y,r,c,a){for(let i=3;i>=1;i--){g.fillStyle='rgba('+c+','+(a/i*1.2)+')';disc(g,g.fillStyle,x,y,R(r*i/3));}}
function drawPower(){const x=FX-14,y=DECK-46,w=30;P(g,'#1e1426',x-1,y-1,w+2,6);P(g,'#3a2a3a',x,y,w,4);const p=G.power;
 const col=p<.4?'#6ad06a':p<.75?'#f0d040':'#f05a3a';P(g,col,x,y,R(w*p),4);P(g,'rgba(255,255,255,.4)',x,y,R(w*p),1);
 P(g,'#f4e7c6',x+R(w*.72),y-2,1,8);}
function drawBang(){const x=FX-3,y=DECK-50+R(Math.sin(G.t*20)*1.5);
 P(g,'#1e1426',x-1,y-1,11,13);P(g,'#ffffff',x,y,9,11);P(g,'#1e1426',x+2,y+12,3,2);P(g,'#ffffff',x+3,y+11,1,1);
 P(g,'#e8302a',x+3,y+2,3,5);P(g,'#e8302a',x+3,y+8,3,2);}
function drawReel(){const M=G.M,X=78,Y=14,BAR=80,f=FI[G.species];
 P(g,'#1e1426',X-1,Y-1,30,BAR+14);P(g,'#6e3f28',X,Y,28,BAR+12);P(g,'#8f5a3a',X,Y,28,1);P(g,'#4a2718',X,Y+BAR+11,28,1);
 P(g,'#c63a2b',X+2,Y-3,24,3);P(g,'#1e1426',X+2,Y-4,24,1);
 const ix=X+3,iy=Y+6;P(g,'#0e1a34',ix,iy,16,BAR);
 for(let i=0;i<BAR;i+=6)P(g,'#162650',ix,iy+i,16,1);
 const zy=iy+BAR-M.zy-M.Z;g.globalAlpha=M.over?.75:.5;P(g,M.over?'#6adf7a':'#5aa060',ix+1,zy,14,M.Z);g.globalAlpha=1;P(g,'#c8ffd0',ix+1,zy,14,1);P(g,'#c8ffd0',ix+1,zy+M.Z-1,14,1);
 // fish icon
 const fy=R(iy+BAR-M.fy-6),fx=ix+3;const c=f.col;
 P(g,'#1e1426',fx-1,fy,12,6);P(g,c,fx,fy+1,7,4);P(g,c,fx+7,fy,3,2);P(g,c,fx+7,fy+4,3,2);P(g,c,fx+8,fy+2,2,2);P(g,'#1e1426',fx+1,fy+2,1,1);P(g,lighten(c,.5),fx+1,fy+1,5,1);
 // progress
 const px=X+21,py=Y+6;P(g,'#1e1426',px,py,5,BAR);const ph=R(BAR*clamp(M.prog,0,1));const pc=M.prog<.33?'#f05a3a':M.prog<.66?'#f0d040':'#6ad06a';P(g,pc,px+1,py+BAR-ph,3,ph);}
