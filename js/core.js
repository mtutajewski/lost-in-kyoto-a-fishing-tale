/* Lost in Kyoto · Core: canvas setup, math/colour helpers and pixel drawing primitives. */
'use strict';
// ====================================================================
//  CORE
// ====================================================================
const W=320,H=180, SURF=120, DECK=112, PIER_END=151;
const cv=document.getElementById('game'), g=cv.getContext('2d');
g.imageSmoothingEnabled=false;
const $=id=>document.getElementById(id);
const rnd=(a,b)=>a+Math.random()*(b-a);
const ri=(a,b)=>Math.floor(rnd(a,b+1));
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const lerp=(a,b,t)=>a+(b-a)*t;
const R=Math.round;
function mk(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.imageSmoothingEnabled=false;return [c,x];}
function hex(h){if(h.startsWith('rgb')){return h.slice(h.indexOf('(')+1,-1).split(',').map(Number);}h=h.replace('#','');if(h.length===3)h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];return [parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)];}
function rgb(a){return 'rgb('+R(a[0])+','+R(a[1])+','+R(a[2])+')';}
function mix(a,b,t){return [lerp(a[0],b[0],t),lerp(a[1],b[1],t),lerp(a[2],b[2],t)];}
function shade(c,f){const a=typeof c==='string'?hex(c):c;return rgb([a[0]*f,a[1]*f,a[2]*f]);}
function lighten(c,f){const a=typeof c==='string'?hex(c):c;return rgb(mix(a,[255,255,255],f));}
function hash(x,y,s){let n=(Math.imul(x|0,374761393)+Math.imul(y|0,668265263)+Math.imul(s|0,1442695041))|0;n=Math.imul(n^(n>>>13),1274126177);n^=n>>>16;return (n>>>0)/4294967296;}
function vnoise(x,y,s){const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,sm=t=>t*t*(3-2*t);
  const a=hash(xi,yi,s),b=hash(xi+1,yi,s),c=hash(xi,yi+1,s),d=hash(xi+1,yi+1,s),u=sm(xf),v=sm(yf);
  return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v;}
function P(ctx,c,x,y,w=1,h=1){ctx.fillStyle=c;ctx.fillRect(Math.floor(x),Math.floor(y),w,h);}
function line(ctx,c,x0,y0,x1,y1){x0=R(x0);y0=R(y0);x1=R(x1);y1=R(y1);const dx=Math.abs(x1-x0),dy=-Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1;let e=dx+dy;ctx.fillStyle=c;
  for(let i=0;i<500;i++){ctx.fillRect(x0,y0,1,1);if(x0===x1&&y0===y1)break;const e2=2*e;if(e2>=dy){e+=dy;x0+=sx;}if(e2<=dx){e+=dx;y0+=sy;}}}
function disc(ctx,c,cx,cy,r){ctx.fillStyle=c;for(let y=-r;y<=r;y++){const w=Math.floor(Math.sqrt(r*r-y*y+r*0.8));ctx.fillRect(Math.floor(cx-w),Math.floor(cy+y),w*2+1,1);}}
// outer outline pass on a small canvas
function outline(c,col){const x=c.getContext('2d'),w=c.width,h=c.height,d=x.getImageData(0,0,w,h),s=d.data,o=new Uint8ClampedArray(s);const oc=hex(col);
  for(let y=0;y<h;y++)for(let i=0;i<w;i++){const k=(y*w+i)*4;if(s[k+3]>0)continue;
    const n=(i>0&&s[k-1]>0)||(i<w-1&&s[k+7]>0)||(y>0&&s[k-w*4+3]>0)||(y<h-1&&s[k+w*4+3]>0);
    if(n){o[k]=oc[0];o[k+1]=oc[1];o[k+2]=oc[2];o[k+3]=255;}}
  d.data.set(o);x.putImageData(d,0,0);return c;}
