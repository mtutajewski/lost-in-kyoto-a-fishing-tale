/* Lost in Kyoto · Game data (fish, rarities, rods, bait, trades) and the save state. */
'use strict';
// ====================================================================
//  DATA
// ====================================================================
const RAR=[
 {n:'Common',jp:'ふつう',c:'#8d9a8a'},{n:'Uncommon',jp:'めずらしい',c:'#4f9a5c'},{n:'Rare',jp:'レア',c:'#3f7fd0'},
 {n:'Epic',jp:'すごいレア',c:'#a24fd0'},{n:'Legendary',jp:'でんせつ',c:'#e8a820'}];
const FISH=[
 {id:'ayu',name:'Ayu',jp:'アユ',kj:'鮎',title:'Sweetfish',r:0,base:10,size:[12,26],wk:1.25e-5,weight:52,
  diff:{spd:.55,freq:.8,dart:.08},col:'#b8c4b0',
  desc:'Smells faintly of melon and summer. The river\'s small silver messenger.',hint:'Common in the shallows. Any bait will do.'},
 {id:'yamame',name:'Yamame',jp:'ヤマメ',kj:'山女魚',title:'Cherry Salmon',r:1,base:24,size:[18,34],wk:1.3e-5,weight:26,
  diff:{spd:.8,freq:1.0,dart:.16},col:'#d8a8b0',
  desc:'Pale pink, with ink-thumb marks along its side. Hides where the current folds.',hint:'Loves the dawn, and shrimp bait.'},
 {id:'koi',name:'Nishikigoi',jp:'ニシキゴイ',kj:'錦鯉',title:'Brocade Carp',r:2,base:55,size:[30,62],wk:1.65e-5,weight:14,
  diff:{spd:1.0,freq:1.2,dart:.22},col:'#e05a3a',
  desc:'A living kimono. The temple monks say each one remembers a name.',hint:'Cast far. Shrimp bait helps.'},
 {id:'fugu',name:'Fugu',jp:'フグ',kj:'河豚',title:'Pufferfish',r:3,base:110,size:[14,32],wk:3.8e-5,weight:6,
  diff:{spd:1.25,freq:1.6,dart:.35},col:'#d8c870',
  desc:'A sea traveller, lost upriver like you. Puffs up when nervous. Handle with great respect.',hint:'Lured by glow-worm bait.'},
 {id:'kinryu',name:'Kinryū-goi',jp:'キンリュウゴイ',kj:'金龍鯉',title:'Golden Dragon Carp',r:4,base:480,size:[60,120],wk:1.37e-5,weight:1.2,
  diff:{spd:1.4,freq:1.8,dart:.4},col:'#ffc830',
  desc:'A carp that climbs the waterfall becomes a dragon. This one is already halfway there.',hint:'Rises only at night, to glowing bait. Or ask Jirō.'},
];
const FI={};FISH.forEach((f,i)=>{FI[f.id]=f;f.idx=i;});
const RODS=[
 {name:'Takezao',jp:'たけざお',zone:31,price:0,desc:'Your borrowed bamboo rod. Humble but honest.'},
 {name:'Urushi-zao',jp:'うるしざお',zone:38,price:150,desc:'Red-lacquered rod. Bigger catch zone (+25%).'},
 {name:'Meijin-zao',jp:'めいじんざお',zone:46,price:520,desc:'The master\'s rod. Huge catch zone (+55%), calmer fish.'}];
const BAITS={rice:{name:'Onigiri',jp:'おにぎり'},shrimp:{name:'Ebi shrimp',jp:'えび'},glow:{name:'Hotaru worm',jp:'ほたる'}};
const TRADES=[
 {give:{ayu:3},get:'yamame'},
 {give:{yamame:2},get:'koi'},
 {give:{koi:2,ayu:2},get:'fugu'},
 {give:{ayu:1,yamame:1,koi:1,fugu:1},get:'kinryu'}];

// ====================================================================
//  SAVE STATE
// ====================================================================
const KEY='lostInKyoto_v1';
const DEF={coins:20,basket:[],cap:12,zukan:{},rod:0,charm:false,bait:{shrimp:0,glow:0},baitSel:'rice',blessing:0,done:false,time:0.18,casts:0,started:false};
let S=JSON.parse(JSON.stringify(DEF));
function save(){try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}}
function hasSave(){try{const d=JSON.parse(localStorage.getItem(KEY)||'null');return d&&d.started;}catch(e){return false;}}
function load(){try{const d=JSON.parse(localStorage.getItem(KEY)||'null');if(d)S=Object.assign(JSON.parse(JSON.stringify(DEF)),d);}catch(e){}}
