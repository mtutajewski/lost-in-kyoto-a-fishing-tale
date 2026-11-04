/* Lost in Kyoto · Synthesized audio: koto-style music in the Japanese 'In' scale and all sound effects (Web Audio API). */
'use strict';
// ====================================================================
//  AUDIO (synthesized)
// ====================================================================
const A={ctx:null,muted:false,
 init(){if(this.ctx){if(this.ctx.state==='suspended')this.ctx.resume();return;}
  const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
  try{const c=this.ctx=new AC();
  this.out=c.createGain();this.out.gain.value=this.muted?0:.7;const comp=c.createDynamicsCompressor();this.out.connect(comp);comp.connect(c.destination);
  this.fx=c.createGain();this.fx.gain.value=.3;const d=c.createDelay();d.delayTime.value=.31;const fb=c.createGain();fb.gain.value=.38;const lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=2000;
  this.fx.connect(d);d.connect(lp);lp.connect(fb);fb.connect(d);lp.connect(this.out);
  this.mus=c.createGain();this.mus.gain.value=.55;this.mus.connect(this.out);this.mus.connect(this.fx);
  this.sfx=c.createGain();this.sfx.gain.value=.8;this.sfx.connect(this.out);this.sfx.connect(this.fx);
  const len=c.sampleRate*2,b=c.createBuffer(1,len,c.sampleRate),dd=b.getChannelData(0);for(let i=0;i<len;i++)dd[i]=Math.random()*2-1;this.nb=b;
  const n=c.createBufferSource();n.buffer=b;n.loop=true;const f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=380;const gn=c.createGain();gn.gain.value=.05;n.connect(f);f.connect(gn);gn.connect(this.out);n.start();
  const lfo=c.createOscillator();lfo.frequency.value=.11;const lg=c.createGain();lg.gain.value=.025;lfo.connect(lg);lg.connect(gn.gain);lfo.start();
  this.next=c.currentTime+.4;this.step=0;this.mi=4;setInterval(()=>this.sched(),100);}catch(e){this.ctx=null;}},
 setMute(m){this.muted=m;if(this.out)this.out.gain.setTargetAtTime(m?0:.7,this.ctx.currentTime,.05);},
 pluck(f,t,v,dur=1.6,dest){const c=this.ctx;if(!c)return;const o=c.createOscillator(),o2=c.createOscillator(),gg=c.createGain(),g2=c.createGain();
  o.type='triangle';o2.type='sine';o.frequency.setValueAtTime(f*1.012,t);o.frequency.exponentialRampToValueAtTime(f,t+.06);o2.frequency.value=f*2.01;g2.gain.value=.35;
  gg.gain.setValueAtTime(.0001,t);gg.gain.exponentialRampToValueAtTime(v,t+.006);gg.gain.exponentialRampToValueAtTime(.0001,t+dur);
  o.connect(gg);o2.connect(g2);g2.connect(gg);gg.connect(dest||this.sfx);o.start(t);o2.start(t);o.stop(t+dur+.05);o2.stop(t+dur+.05);},
 tone(f,dur,type='sine',v=.2,slide=0,delay=0){const c=this.ctx;if(!c)return;const t=c.currentTime+delay,o=c.createOscillator(),gg=c.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(20,f+slide),t+dur);
  gg.gain.setValueAtTime(.0001,t);gg.gain.exponentialRampToValueAtTime(v,t+.01);gg.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(gg);gg.connect(this.sfx);o.start(t);o.stop(t+dur+.05);},
 noise(dur,f0,f1,v=.3,q=1,delay=0){const c=this.ctx;if(!c)return;const t=c.currentTime+delay,s=c.createBufferSource();s.buffer=this.nb;const bp=c.createBiquadFilter();bp.type='bandpass';bp.Q.value=q;bp.frequency.setValueAtTime(f0,t);bp.frequency.exponentialRampToValueAtTime(f1,t+dur);
  const gg=c.createGain();gg.gain.setValueAtTime(.0001,t);gg.gain.exponentialRampToValueAtTime(v,t+.02);gg.gain.exponentialRampToValueAtTime(.0001,t+dur);s.connect(bp);bp.connect(gg);gg.connect(this.sfx);s.start(t,Math.random());s.stop(t+dur+.05);},
 // In-scale (miyako-bushi) on D
 SC:[-5,-4,0,1,5,7,8,12,13,17,19],
 nf(i){return 293.66*Math.pow(2,this.SC[i]/12);},
 sched(){const c=this.ctx;if(!c)return;while(this.next<c.currentTime+.4){const t=this.next;const night=isNight();const stepDur=night?.62:.48;
   if(!this.muted){if(this.step%16===0)this.pluck(146.83/(this.step%32===0?1:1.335),t,.12,3.2,this.mus);
     if(Math.random()>(night?.5:.38)){this.mi=clamp(this.mi+[-2,-1,-1,1,1,2][ri(0,5)],0,this.SC.length-1);this.pluck(this.nf(this.mi),t,night?.07:.09,1.8,this.mus);
       if(Math.random()<.18)this.pluck(this.nf(Math.max(0,this.mi-3)),t+.02,.05,1.8,this.mus);}
     if(this.step%8===7&&Math.random()<.5){this.pluck(this.nf(clamp(this.mi+1,0,10)),t+stepDur*.5,.05,1.2,this.mus);}}
   this.step++;this.next+=stepDur;}},
 cast(){this.noise(.35,400,2400,.25,1.2);},
 plop(){this.tone(620,.16,'sine',.3,-460);this.noise(.2,1400,500,.15,2,.02);},
 nibble(){this.tone(900,.05,'sine',.12,-300);},
 bite(){this.tone(880,.1,'square',.12);this.tone(1320,.14,'square',.12,0,.1);this.noise(.25,1800,600,.25,1.5);},
 click(){this.tone(2200,.025,'square',.04);},
 splash(){this.noise(.5,2500,400,.4,.8);},
 escape(){this.tone(440,.25,'triangle',.18,-200);this.tone(330,.35,'triangle',.15,-150,.18);},
 catch(r){const c=this.ctx;if(!c)return;const t=c.currentTime;const seq=[2,4,5,7,9];seq.forEach((n,i)=>this.pluck(this.nf(n),t+i*.08,.18,1.4));
   if(r>=2)[7,9,10].forEach((n,i)=>this.pluck(this.nf(n),t+.45+i*.1,.16,2));
   if(r>=3){this.tone(73.4,2.5,'sine',.35);}
   if(r>=4){for(let i=0;i<10;i++)this.tone(2000+i*180,.3,'sine',.05,0,.6+i*.06);}},
 coin(){this.tone(1568,.07,'square',.07);this.tone(2093,.16,'square',.07,0,.07);},
 ui(){this.tone(660,.05,'triangle',.1);},
 boom(){this.noise(1.2,300,60,.5,.6);this.tone(90,.8,'sine',.3,-50);},
 crackle(){for(let i=0;i<6;i++)this.noise(.06,4000,3000,.08,3,.3+i*.05);},
};
