/* Lost in Kyoto · Pixel-art generators: the five fish, the fisherman and the cat. No image files are used. */
'use strict';
// ====================================================================
//  FISH SPRITE GENERATOR
// ====================================================================
const SHAPES={
 ayu:{w:40,h:16,cy:8,head:2,ts:30,tl:8,bh:5.2,tb:1,bb:.9,peak:.3,nose:.8,neck:.4,taper:1.2,tailH:6,fork:.5,round:0,
   dorsal:[.36,.52,4],anal:[.66,.78,2],pect:.3,gill:.24,eye:[.1,-.25],
   top:'#56683a',mid:'#b9c6b4',belly:'#eef1e6',fin:'#c9ba70',fin2:'#a4934a',
   pat(u,ny,x,y){ if(u>.24&&u<.32&&ny>-.25&&ny<.12) return '#f2d040'; if(ny<-.45&&hash(x,y,3)<.12) return '#3e4e2a'; return null;}},
 yamame:{w:42,h:18,cy:9,head:2,ts:32,tl:8,bh:6,tb:1,bb:.95,peak:.3,nose:.75,neck:.38,taper:1.2,tailH:5.5,fork:.4,round:0,
   dorsal:[.34,.5,4],anal:[.66,.8,3],pect:.3,gill:.24,eye:[.1,-.22],
   top:'#4b5a6e',mid:'#c9bcc4',belly:'#f6eeea',fin:'#c9a0a8',fin2:'#a07880',
   pat(u,ny,x,y){ for(let k=0;k<7;k++){const cu=.22+k*.105;const du=(u-cu)/.035, dv=(ny+.05)/.36; if(du*du+dv*dv<1) return '#4a4a6e';}
     if(ny>-.05&&ny<.22) return '#e898a8'; if(ny<-.35&&hash(x,y,7)<.1) return '#22222e'; return null;}},
 koi:{w:46,h:20,cy:10,head:2,ts:35,tl:9,bh:7,tb:1.05,bb:.95,peak:.35,nose:.65,neck:.45,taper:1.4,tailH:6,fork:.15,round:.45,
   dorsal:[.3,.78,3],anal:[.7,.82,3],pect:.3,gill:.22,eye:[.11,-.25],whisk:3,
   top:'#f6f3ea',mid:'#efede4',belly:'#ddd8cc',fin:'#ece8de',fin2:'#cfc8bc',
   pat(u,ny,x,y){ if(ny>.5) return null; const n=vnoise(x*.2,y*.28,11); if(u<.17&&ny<.05&&ny>-.8) return '#d8402a';
     if(n>.5&&u>.22) return ny<-.3?'#b82a18':'#d8402a'; return null;}},
 fugu:{w:36,h:28,cy:14,head:2,ts:28,tl:6,bh:11,tb:1,bb:1,peak:.45,nose:.55,neck:.25,taper:.9,tailH:4,fork:0,round:.45,
   dorsal:[.66,.8,3],anal:[.66,.8,3],pect:.36,gill:.3,eye:[.17,-.3],big:1,spines:1,
   top:'#8a7a38',mid:'#dccc74',belly:'#f6f2e2',fin:'#e4d488',fin2:'#b8a650',
   pat(u,ny,x,y){ if(u>.3&&u<.42&&ny>.05&&ny<.4) return '#2e2614'; if(ny<-.05&&vnoise(x*.6,y*.6,5)>.62) return '#4a3c18'; return null;}},
 kinryu:{w:58,h:24,cy:11,head:2,ts:40,tl:16,bh:7.5,tb:1.05,bb:1,peak:.33,nose:.7,neck:.4,taper:1.3,tailH:9,fork:.45,round:0,wave:1,
   dorsal:[.22,.82,4],anal:[.5,.7,4],pect:.28,gill:.2,eye:[.1,-.25],whisk:6,eyeC:'#c01818',
   top:'#c8761a',mid:'#f2b82e',belly:'#ffe48a',fin:'#ffd458',fin2:'#e8962a',
   pat(u,ny,x,y){ if(ny<-.6&&u>.2) return '#e04a1a'; if(y%2===0&&(x+(y%4?2:0))%4===0&&ny>-.55&&ny<.55) return '#fff3b0'; return null;}},
};
function genFish(f){
 const s=SHAPES[f.id],w=s.w,h=s.h;const [c,x]=mk(w,h);const img=x.createImageData(w,h),D=img.data;
 const part=new Uint8Array(w*h),NY=new Float32Array(w*h),U=new Float32Array(w*h);
 const bx0=s.head,bx1=s.ts;
 const prof=u=>u<s.peak?Math.pow(Math.max(0,1-Math.pow((s.peak-u)/s.peak,2)),s.nose):1-(1-s.neck)*Math.pow((u-s.peak)/(1-s.peak),s.taper);
 const topAt=xx=>{const u=(xx-bx0)/(bx1-bx0);return s.cy-s.bh*prof(u)*s.tb;};
 const botAt=xx=>{const u=(xx-bx0)/(bx1-bx0);return s.cy+s.bh*prof(u)*s.bb;};
 for(let y=0;y<h;y++)for(let xx=0;xx<w;xx++){
   const k=y*w+xx, yc=y+.5, xc=xx+.5;
   if(xc>=bx0&&xc<=bx1){const u=(xc-bx0)/(bx1-bx0),hh=s.bh*prof(u),dy=yc-s.cy;
     if(dy>=-hh*s.tb&&dy<=hh*s.bb){part[k]=1;NY[k]=dy<0?dy/(hh*s.tb):dy/(hh*s.bb);U[k]=u;continue;}
     // dorsal
     const [d0,d1,dh]=s.dorsal;if(u>=d0&&u<=d1){const t=(u-d0)/(d1-d0);const fh=dh*Math.pow(1-t,.6)+.5;const top=s.cy-hh*s.tb;if(yc<top&&yc>=top-fh){part[k]=2;continue;}}
     const [a0,a1,ah]=s.anal;if(u>=a0&&u<=a1){const t=(u-a0)/(a1-a0);const fh=ah*Math.pow(1-t,.7)+.5;const bot=s.cy+hh*s.bb;if(yc>bot&&yc<=bot+fh){part[k]=2;continue;}}
   } else if(xc>bx1&&xc<=bx1+s.tl){
     const t=(xc-bx1)/s.tl;let dy=yc-s.cy;if(s.wave)dy-=Math.sin(t*Math.PI*1.3)*1.6*t;
     const spread=s.neck*s.bh+t*s.tailH, e=Math.abs(dy)/(spread+.01);
     if(e<=1){let lim=1;if(s.fork)lim-=s.fork*(1-e);if(s.round)lim-=s.round*e*e; if(t<=lim){part[k]=3;U[k]=t;NY[k]=dy/spread;}}
   }
 }
 // pectoral fin overlay
 const pu=s.pect, px0=Math.round(bx0+pu*(bx1-bx0));
 for(let i=0;i<Math.round(4+s.bh*.3);i++)for(let j=0;j<=Math.min(i,3);j++){const xx=px0+i,yy=Math.round(s.cy+1+j+i*.35);if(xx<w&&yy<h&&part[yy*w+xx]===1)part[yy*w+xx]=4;}
 const set=(xx,yy,col)=>{if(xx<0||yy<0||xx>=w||yy>=h)return;const k=(yy*w+xx)*4,a=hex(col);D[k]=a[0];D[k+1]=a[1];D[k+2]=a[2];D[k+3]=255;};
 const colAt=new Array(w*h);
 for(let y=0;y<h;y++)for(let xx=0;xx<w;xx++){const k=y*w+xx,p=part[k];if(!p)continue;let col;
   if(p===1){const ny=NY[k],u=U[k];
     const b1=-.35,b2=.3;let band=ny<b1?0:ny<b2?1:2;
     if(Math.abs(ny-b1)<.12||Math.abs(ny-b2)<.12){if((xx+y)%2===0)band=ny<(b1+b2)/2?(ny<b1?1:0):(ny<b2?2:1);}
     col=[s.top,s.mid,s.belly][band];
     const pc=s.pat(u,ny,xx,y);if(pc)col=pc;
     if(ny>-.62&&ny<-.44&&u>.16&&u<.62&&!pc)col=lighten(col,.3);
   } else if(p===4){col=(xx+y)%2?s.fin:s.fin2;}
   else {col=((xx+(y>>1))%3===0)?s.fin2:s.fin; if(p===3&&U[k]>.85)col=shade(col,.92);}
   colAt[k]=col;}
 // gill arc
 const gx=Math.round(bx0+s.gill*(bx1-bx0));
 for(let y=0;y<h;y++){const k=y*w+gx;if(part[k]===1&&Math.abs(NY[k])<.6){const xo=Math.round(Math.pow(NY[k],2)*-1.5);const kk=y*w+gx+xo;if(part[kk]===1)colAt[kk]=shade(colAt[kk],.72);}}
 // fill + inner selective outline
 for(let y=0;y<h;y++)for(let xx=0;xx<w;xx++){const k=y*w+xx;if(!part[k])continue;
   const edge=(xx===0||!part[k-1])||(xx===w-1||!part[k+1])||(y===0||!part[k-w])||(y===h-1||!part[k+w]);
   set(xx,y,edge?shade(colAt[k],.42):colAt[k]);}
 // spines
 if(s.spines){for(let xx=bx0+3;xx<bx1-2;xx+=3){const t=Math.floor(topAt(xx+.5)),b=Math.ceil(botAt(xx+.5));set(xx,t-1,'#5a4a22');set(xx,b,'#5a4a22');}}
 // whiskers
 if(s.whisk){const my=Math.round(s.cy+s.bh*.25);for(let i=0;i<s.whisk;i++){set(bx0-1+Math.floor(i*.35),my+1+i,i%2?shade(s.fin2,.7):s.fin2);} }
 // mouth & eye
 set(bx0,s.cy+1,shade(s.top,.4));
 const ex=Math.round(bx0+s.eye[0]*(bx1-bx0)),ey=Math.round(s.cy+s.eye[1]*s.bh);
 const ec=s.eyeC||'#160e1c';
 if(s.big){set(ex-1,ey-1,'#fff');set(ex,ey-1,'#fff');set(ex+1,ey-1,'#fff');set(ex-1,ey,'#fff');set(ex,ey,ec);set(ex+1,ey,ec);set(ex-1,ey+1,'#fff');set(ex,ey+1,ec);set(ex+1,ey+1,ec);set(ex,ey,'#fff');}
 else{set(ex,ey,ec);set(ex+1,ey,ec);set(ex,ey+1,ec);set(ex+1,ey+1,ec);set(ex,ey,'#ffffff');}
 x.putImageData(img,0,0);
 return c;
}
function silhouette(src,col){const [c,x]=mk(src.width,src.height);x.drawImage(src,0,0);x.globalCompositeOperation='source-in';x.fillStyle=col;x.fillRect(0,0,c.width,c.height);return c;}
const SPR={},SIL={},FURL={},SILURL={};
FISH.forEach(f=>{SPR[f.id]=genFish(f);SIL[f.id]=silhouette(SPR[f.id],'#0b1a2c');FURL[f.id]=SPR[f.id].toDataURL();SILURL[f.id]=silhouette(SPR[f.id],'#3a2c30').toDataURL();});

// ====================================================================
//  CHARACTER SPRITES
// ====================================================================
const CH={};
const HANDS={rest:[6,-9],up:[1,-17],fwd:[8,-12],reel0:[6,-8],reel1:[5,-10],cheer:[4,-19]};
function fisher(pose,b,leg){const key=pose+b+leg+(Math.floor(G.t*3)%2);if(CH[key])return CH[key];
 const [c,x]=mk(40,46);const O=[18,36];const p=(col,dx,dy,w=1,h=1)=>P(x,col,O[0]+dx,O[1]+dy,w,h);
 const ki='#3f5f96',ks='#2c4472',sk='#f0c49a',ss='#d8a07a',hk='#3d3552',hs='#2c2640';
 // legs
 p(hk,-3,-4,9,4);p(hs,-3,-1,9,1);
 p(hk,5,-2,3,4);p(hk,5+leg,2,3,4);p(hs,5+leg,5,3,1);
 p(sk,5+leg,6,3,1);p('#8a6a3a',5+leg,7,4,1);
 // torso — indigo happi coat
 p(ki,-4,-14+b,7,10-b);p(ks,-4,-14+b,1,10-b);p(ks,-3,-14+b,1,1);
 p('#f2ece0',1,-13+b,2,6-b);p('#f2ece0',0,-13+b,1,1);   // white eri (collar band)
 p('#c63a2b',1,-11+b,1,1);                              // red crest on collar
 p('#f2ece0',-3,-11+b,1,1);p('#f2ece0',-2,-10+b,1,1);  // white mon pattern on back
 p('#24345a',-4,-7,7,2);p('#3a4c78',-4,-7,7,1);        // dark kaku-obi belt
 for(let i=-4;i<3;i+=2)p('#f2ece0',i,-5,1,1);           // white hem stripe
 // head
 p(sk,-3,-19+b,6,5);p(ss,-3,-19+b,1,5);p(sk,3,-17+b,1,1);
 p('#1a1020',1,-17+b,1,1);p('#e8968a',1,-15+b,1,1);
 // black hair
 p('#1c1822',-3,-22+b,6,3);p('#1c1822',-4,-21+b,2,5);p('#1c1822',-2,-23+b,2,1);p('#1c1822',1,-23+b,1,1);p('#2e2838',0,-22+b,2,1);
 // white hachimaki headband with tails flowing back
 p('#f4f0e8',-4,-20+b,8,1);p('#d8d0c4',-4,-20+b,1,1);
 const tw=Math.floor(G.t*3)%2;
 p('#f4f0e8',-5,-20+b,1,1);p('#f4f0e8',-6,-19+b+tw,1,1);p('#f4f0e8',-7,-19+b,1,1);p('#f4f0e8',-6,-21+b,1,1);p('#f4f0e8',-7,-22+b+tw,1,1);
 // arm
 const [hx,hy2]=HANDS[pose];const sx=0,sy=-12+b;
 line(x,ki,O[0]+sx,O[1]+sy,O[0]+hx-1,O[1]+hy2);line(x,ki,O[0]+sx,O[1]+sy+1,O[0]+hx-1,O[1]+hy2+1);line(x,ks,O[0]+sx-1,O[1]+sy+1,O[0]+hx-2,O[1]+hy2+1);
 p(sk,hx-1,hy2,2,2);
 outline(c,'#1e1426');CH[key]=c;return c;}
const CAT={};
function cat(f,sit){const key=f+'_'+sit;if(CAT[key])return CAT[key];const [c,x]=mk(16,14);const O=[5,12];const p=(col,dx,dy,w=1,h=1)=>P(x,col,O[0]+dx,O[1]+dy,w,h);
 const wh='#f4f0ea',sh='#d8d0c8',or='#e8904a',bk='#2a2228';
 p(wh,-1,-4,6,4);p(sh,-1,-1,6,1);p(wh,0,-5,5,1);
 p(wh,1,-9,5,4);p(or,1,-9,2,2);p(wh,1,-10,1,1);p(or,5,-10,1,1);p(wh,5,-10,1,1);p(or,1,-10,1,1);
 p(bk,4,-8,1,1);p('#e88a9a',6,-7,1,1);p(sh,1,-6,4,1);
 p('#c63a2b',2,-5,3,1);p('#e8b84a',3,-4,1,1);p(bk,-1,-3,2,1);
 p(wh,4,-1,2,1);
 const tails=[[[-2,-2],[-3,-3],[-3,-4],[-3,-5],[-2,-6]],[[-2,-2],[-3,-3],[-4,-4],[-4,-5],[-3,-6]],[[-2,-2],[-3,-2],[-4,-3],[-4,-4],[-4,-5]]];
 tails[f].forEach(([tx,ty])=>p(f===2?or:wh,tx,ty));p(or,tails[f][4][0],tails[f][4][1]);
 outline(c,'#1e1426');CAT[key]=c;return c;}
