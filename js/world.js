/* Lost in Kyoto · Time of day (palette keyframes) and the static background and foreground layers. */
'use strict';
// ====================================================================
//  TIME OF DAY
// ====================================================================
const DAY=300; // seconds per full day
const KF=[
 {t:0.00,top:'#2c2c5e',bot:'#f0a0a0',far:'#76648e',near:'#4c3e6c',wf:'#c08aa8',wt:'#3e5a8a',wd:'#162246',cl:'#ffc8c8',tint:[110,90,150,.30],night:.35},
 {t:0.10,top:'#5aa6e6',bot:'#ffe6be',far:'#8ea6cc',near:'#5c7ca8',wf:'#8ccbe2',wt:'#2f78a4',wd:'#103a62',cl:'#ffffff',tint:[255,255,255,0],night:0},
 {t:0.46,top:'#4a98e0',bot:'#c4e8f6',far:'#90b2d2',near:'#5a86aa',wf:'#80c2de',wt:'#2c74a2',wd:'#0f3860',cl:'#ffffff',tint:[255,255,255,0],night:0},
 {t:0.58,top:'#47387a',bot:'#ff9858',far:'#9c5a7c',near:'#5a3a64',wf:'#ee9e72',wt:'#45507e',wd:'#1a1c46',cl:'#ffb4a0',tint:[200,110,120,.18],night:.25},
 {t:0.68,top:'#10163a',bot:'#363870',far:'#2c2c50',near:'#1c1c38',wf:'#36487a',wt:'#1c2c58',wd:'#070e26',cl:'#40446e',tint:[40,50,120,.50],night:1},
 {t:0.93,top:'#0c1030',bot:'#2c2c5c',far:'#262848',near:'#181834',wf:'#30426e',wt:'#1a2a54',wd:'#060c22',cl:'#383c66',tint:[40,50,120,.50],night:1},
 {t:1.00,top:'#2c2c5e',bot:'#f0a0a0',far:'#76648e',near:'#4c3e6c',wf:'#c08aa8',wt:'#3e5a8a',wd:'#162246',cl:'#ffc8c8',tint:[110,90,150,.30],night:.35},
];
function env(t){let i=0;while(i<KF.length-2&&KF[i+1].t<=t)i++;const a=KF[i],b=KF[i+1],f=clamp((t-a.t)/(b.t-a.t),0,1),e={};
 for(const k of ['top','bot','far','near','wf','wt','wd','cl'])e[k]=mix(hex(a[k]),hex(b[k]),f);
 e.tint=a.tint.map((v,j)=>lerp(v,b.tint[j],f));e.night=lerp(a.night,b.night,f);return e;}
function phase(t){return t<0.07?['あさ','Dawn']:t<0.55?['ひる','Day']:t<0.66?['ゆうがた','Dusk']:t<0.97?['よる','Night']:['あさ','Dawn'];}
const isNight=()=>S.time>=0.65&&S.time<0.97;

// ====================================================================
//  STATIC LAYERS
// ====================================================================
const BAYER=[[0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5]];
function dither(ctx,y0,y1,c0,c1,levels){const w=W,h=y1-y0,img=ctx.createImageData(w,h),d=img.data;const cols=[];for(let i=0;i<levels;i++)cols.push(mix(c0,c1,i/(levels-1)));
 for(let y=0;y<h;y++){const f=y/(h-1)*(levels-1),b=Math.floor(f),fr=f-b;for(let x=0;x<w;x++){const idx=Math.min(levels-1,b+(fr*16>BAYER[y&3][x&3]+.5?1:0)),c=cols[idx],k=(y*w+x)*4;d[k]=c[0];d[k+1]=c[1];d[k+2]=c[2];d[k+3]=255;}}
 ctx.putImageData(img,0,y0);}
const MT1=[],MT2=[];for(let x=0;x<W;x++){MT1.push(62+Math.sin(x*.021)*9+Math.sin(x*.057+1)*5+vnoise(x*.09,1,2)*6);MT2.push(80+Math.sin(x*.03+2)*6+Math.sin(x*.081)*3+vnoise(x*.15,3,4)*4);}
const STARS=[];for(let i=0;i<70;i++)STARS.push([ri(0,W-1),ri(0,78),Math.random()]);
const HOUSES=[[96,8,5],[108,10,6],[126,7,5],[140,9,6],[154,6,4],[272,8,5],[285,11,6],[300,8,5],[312,7,4]];
const [bgC,bgX]=mk(W,H);let bgT=-1;
function drawBG(e){
 const x=bgX;
 dither(x,0,104,e.top,e.bot,7);
 // stars
 if(e.night>0.05)for(const s of STARS){x.globalAlpha=e.night*(.35+s[2]*.65);P(x,s[2]>.85?'#fff6d0':'#cfd8ff',s[0],s[1]);}
 x.globalAlpha=1;
 // sun / moon
 const t=S.time;
 if(t>0.0&&t<0.67){const p=(t-0.0)/0.67;const sx=20+p*280,sy=88-Math.sin(p*Math.PI)*70;const dusk=t>0.5?(t-0.5)/0.17:t<0.08?1-t/0.08:0;
   x.globalAlpha=.25;disc(x,rgb(mix([255,240,180],[255,140,90],dusk)),sx,sy,10);x.globalAlpha=1;
   disc(x,rgb(mix([255,248,210],[255,170,110],dusk)),sx,sy,6);disc(x,rgb(mix([255,255,240],[255,210,160],dusk)),sx-1,sy-1,3);}
 if(t>0.62||t<0.05){const tt=t>0.62?t-0.62:t+0.38;const p=tt/0.43;const mx=40+p*250,my=80-Math.sin(p*Math.PI)*62;
   x.globalAlpha=.18;disc(x,'#dfe6ff',mx,my,9);x.globalAlpha=1;disc(x,'#f6f0d6',mx,my,5);disc(x,rgb(e.top),mx+3,my-2,4);P(x,'#e0d8b8',mx-2,my+1);P(x,'#e0d8b8',mx-3,my-2);}
 // mountains
 const far=rgb(e.far),near=rgb(e.near);
 for(let i=0;i<W;i++){x.fillStyle=far;x.fillRect(i,Math.floor(MT1[i]),1,104-Math.floor(MT1[i]));}
 // mist band
 x.globalAlpha=.25;x.fillStyle=rgb(e.bot);x.fillRect(0,88,W,16);x.globalAlpha=1;
 for(let i=0;i<W;i++){x.fillStyle=near;x.fillRect(i,Math.floor(MT2[i]),1,104-Math.floor(MT2[i]));}
 // temple compound on the far shore: pagoda + hall, framed by trees
 drawPagoda(x,196,99,e);
 const shore=shade(e.near,.55);
 // main hall (hondo) left of pagoda
 P(x,shade(e.near,.5),160,93,20,6);P(x,shade(e.near,.36),157,90,26,3);P(x,shade(e.near,.36),159,88,22,2);P(x,shade(e.near,.3),156,89,2,1);P(x,shade(e.near,.3),182,89,2,1);
 if(e.night>.2){x.globalAlpha=e.night;P(x,'#ffcf7a',164,95,3,2);P(x,'#ffcf7a',173,95,3,2);x.globalAlpha=1;}
 // trees hugging the compound
 [[176,96,5],[184,97,4],[208,97,4],[215,95,6],[223,97,4],[153,96,4],[146,97,4]].forEach(([tx,ty,tr])=>{disc(x,shade(e.near,.42),tx,ty,tr);disc(x,shade(e.near,.5),tx-1,ty-1,Math.max(1,tr-2));});
 for(let i=0;i<W;i++){const th=Math.floor(2+vnoise(i*.25,9,1)*5);x.fillStyle=shore;x.fillRect(i,100-th,1,th+4);}
 for(const [hx,hw,hh] of HOUSES){P(x,shade(e.near,.4),hx,100-hh,hw,hh);P(x,shade(e.near,.3),hx-1,100-hh-1,hw+2,1);P(x,shade(e.near,.3),hx,100-hh-2,hw,1);
   if(e.night>.2){x.globalAlpha=e.night;P(x,'#ffd27a',hx+2,100-hh+2,2,2);if(hw>7)P(x,'#ffb85a',hx+hw-3,100-hh+2,1,2);x.globalAlpha=1;}}
 // far water
 x.fillStyle=rgb(e.wf);x.fillRect(0,104,W,SURF-104);
 x.globalAlpha=.35;x.fillStyle=rgb(e.bot);x.fillRect(0,104,W,2);x.globalAlpha=1;
 // torii
 drawTorii(x,232,114,e);
 // underwater
 dither(x,SURF,H,e.wt,e.wd,6);
 // bottom pebbles
 for(let i=0;i<W;i++){const bh=Math.floor(3+vnoise(i*.2,5,8)*4);x.fillStyle=shade(e.wd,1.5);x.fillRect(i,H-bh,1,bh);}
 for(let i=0;i<40;i++){const px=Math.floor(hash(i,1,2)*W),py=H-2-Math.floor(hash(i,2,3)*4);P(x,shade(e.wd,2.1+hash(i,3,4)),px,py,2+Math.floor(hash(i,4,5)*3),2);}
}
function drawPagoda(x,cx,base,e){
 // Japanese five-storey pagoda (gojū-no-tō), like Tō-ji in Kyoto
 const wall=shade(e.near,.62),roof=shade(e.near,.38),edge=shade(e.near,.3),stone=shade(e.far,.85),night=e.night;
 P(x,stone,cx-11,base-3,22,3);P(x,lighten(stone,.15),cx-11,base-3,22,1);       // stone platform (kidan)
 let y=base-3;
 const tiers=[[28,8],[25,7],[22,7],[19,7],[16,6]];
 for(let i=0;i<tiers.length;i++){const [rw,th]=tiers[i],bw=Math.floor(rw*.55);
   P(x,wall,cx-Math.floor(bw/2),y-th+2,bw,th-2);                               // storey body
   P(x,shade(e.near,.5),cx-Math.floor(bw/2),y-th+2,1,th-2);
   if(night>.2&&i<4){x.globalAlpha=night*.9;P(x,'#ffcc70',cx-1,y-th+3,2,2);x.globalAlpha=1;}
   y-=th;
   P(x,roof,cx-Math.floor(rw/2),y,rw,2);P(x,roof,cx-Math.floor(rw/2)+2,y-1,rw-4,1);  // roof
   P(x,edge,cx-Math.floor(rw/2)-1,y-1,2,1);P(x,edge,cx+Math.floor(rw/2)-1,y-1,2,1);  // upturned eaves
   P(x,edge,cx-Math.floor(rw/2),y+1,rw,1);
 }
 P(x,edge,cx,y-12,1,12);for(let i=0;i<5;i++)P(x,edge,cx-1,y-3-i*2,3,1);          // sorin spire
 P(x,edge,cx-1,y-13,3,1);
}
function drawTorii(x,tx,base,e){
 const red='#d4432a',dk='#9a2a18',blk='#24161c';
 const dim=1-e.night*.45;const r=shade(red,dim),d=shade(dk,dim);
 P(x,r,tx,base-28,2,28);P(x,d,tx+1,base-28,1,28);
 P(x,r,tx+16,base-28,2,28);P(x,d,tx+17,base-28,1,28);
 P(x,r,tx-3,base-23,24,2);P(x,d,tx-3,base-22,24,1);
 P(x,r,tx+8,base-27,2,4);
 P(x,r,tx-4,base-29,26,2);
 P(x,blk,tx-5,base-31,28,2);P(x,blk,tx-6,base-32,2,1);P(x,blk,tx+20,base-32,2,1);
 P(x,shade(e.wf,.7),tx-1,base,4,1);P(x,shade(e.wf,.7),tx+15,base,4,1);
}
// Foreground static (bank, tree, pier, lanterns)
const [fgC,fgX]=mk(W,H);
function buildFG(){
 const x=fgX;
 // bank cross-section
 for(let i=0;i<64;i++){const top=i<44?106:106+Math.floor((i-44)*(i-44)*.18+(i-44)*.6);if(top>=H)continue;
   for(let y=top;y<H;y++){const deep=y>SURF;let c=deep?'#3a2c32':'#5c3e2c';const n=hash(i,y,9);if(n<.08)c=deep?'#4a3c42':'#6e4c34';if(n>.96)c='#2a1e22';x.fillStyle=c;x.fillRect(i,y,1,1);}
   // grass
   x.fillStyle='#5a9a4a';x.fillRect(i,top,1,2);if(hash(i,1,1)<.4)P(x,'#7aba5a',i,top-1);if(hash(i,2,1)<.15)P(x,'#4a8a3a',i,top-2);P(x,'#3a6a34',i,top+2);}
 // stones in bank
 [[8,128,6,4],[22,140,8,5],[4,152,7,5],[30,160,9,6],[14,170,6,4],[40,146,6,4]].forEach(([sx,sy,sw,sh])=>{P(x,'#6a6470',sx,sy,sw,sh);P(x,'#8a8490',sx+1,sy,sw-2,1);P(x,'#4a4450',sx,sy+sh-1,sw,1);});
 // cherry tree trunk
 const tr='#4a2c2a',tr2='#6a3e34';
 for(let y=60;y<107;y++){const w=y>98?6:4;const ox=Math.round(Math.sin(y*.12)*1.5);P(x,tr,16+ox,y,w,1);P(x,tr2,16+ox+1,y,1,1);}
 line(x,tr,18,72,36,54);line(x,tr,19,72,37,54);line(x,tr,17,66,4,50);line(x,tr,18,80,44,66);line(x,tr,19,80,45,66);line(x,tr,18,62,22,40);
 // canopy
 const clusters=[];for(let i=0;i<26;i++){clusters.push([6+hash(i,1,77)*52,30+hash(i,2,77)*34+Math.abs(hash(i,1,77)-.4)*14,4+hash(i,3,77)*5]);}
 clusters.push([60,62,5],[64,58,4],[2,44,6]);
 for(const [cx,cy,r] of clusters)disc(x,'#c46a8e',cx+1,cy+1,Math.round(r));
 for(const [cx,cy,r] of clusters)disc(x,'#f2a2c0',cx,cy,Math.round(r));
 for(const [cx,cy,r] of clusters)disc(x,'#ffd0e0',cx-1,cy-1,Math.max(1,Math.round(r*.45)));
 for(let i=0;i<120;i++){const px=hash(i,5,6)*66,py=24+hash(i,6,6)*46;P(x,hash(i,7,6)<.5?'#fff0f6':'#d77a9e',px,py);}
 // stone lantern (toro)
 const st='#8a8a90',st2='#a6a6ac',st3='#5c5c64';
 P(x,st3,31,103,12,3);P(x,st,32,103,10,1);P(x,st,35,95,4,8);P(x,st2,35,95,1,8);P(x,st,33,93,8,2);
 P(x,st,33,87,8,6);P(x,'#2a2228',35,88,4,4);P(x,st3,40,87,1,6);
 P(x,st,30,85,14,2);P(x,st2,30,85,14,1);P(x,st3,29,86,1,1);P(x,st3,44,86,1,1);P(x,st,33,83,8,2);P(x,st,35,81,4,2);P(x,st2,36,79,2,2);
 // pier posts
 for(const px of [58,96,134,148]){for(let y=DECK+3;y<H;y++){const deep=y>SURF;P(x,deep?'#3e2a26':'#5a3a28',px,y,3,1);P(x,deep?'#2c1e1e':'#3e2618',px+2,y,1,1);}
   P(x,'#2c1e1e',px-1,SURF+1,5,1);}
 line(x,'#4a3020',58,116,96,130);line(x,'#4a3020',96,116,134,130);
 // deck
 for(let i=44;i<PIER_END;i++){P(x,'#a87a50',i,DECK,1,1);P(x,'#8a5c3a',i,DECK+1,1,2);P(x,'#5a3824',i,DECK+3,1,1);if((i-44)%7===0){P(x,'#5a3824',i,DECK,1,3);}if(hash(i,3,3)<.1)P(x,'#c0956a',i,DECK);}
 P(x,'#5a3824',PIER_END-1,DECK,1,4);
 // lantern pole + chochin
 P(x,'#4a2c1c',48,82,2,30);P(x,'#4a2c1c',48,82,8,1);P(x,'#2a1a14',54,83,1,3);
 P(x,'#24161a',52,86,5,1);P(x,'#d8402a',51,87,7,8);P(x,'#f0705a',52,87,2,7);P(x,'#9a2a18',51,90,7,1);P(x,'#9a2a18',51,93,7,1);P(x,'#24161a',52,95,5,1);P(x,'#24161a',54,96,1,2);
}
buildFG();
