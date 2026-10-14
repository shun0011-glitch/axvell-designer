const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),ctx={state:{body:'black',view:'frontA'},PAIR_MAP:{sideA:'sideB',sideB:'sideA',frontA:'frontB',frontB:'frontA'},VIEW_W:1448,VIEW_H:1086,clone:v=>JSON.parse(JSON.stringify(v))};vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root,'cowl-presets.js'),'utf8'),ctx);
vm.runInContext(fs.readFileSync(path.join(root,'cowl-paths.js'),'utf8'),ctx);
const source=fs.readFileSync(path.join(root,'panels.js'),'utf8');vm.runInContext(source.slice(0,source.indexOf('let savedCowlState')),ctx);
const all=vm.runInContext('loadBodyPanels()',ctx);
for(const body of ['black','white','green'])for(const view of Object.keys(ctx.PAIR_MAP)){
 const parts=all[body][view];assert.equal(parts.length,7);assert.equal(new Set(parts.map(p=>p.id)).size,7);
 assert(parts.some(p=>p.id==='tail'));assert(!parts.some(p=>p.id==='seat'||p.id==='middle'));assert(parts.some(p=>p.id==='fender'));
 for(const p of parts){assert(p.surfacePath.length>0);for(const point of p.points){assert(Number.isFinite(point.x)&&point.x>=0&&point.x<=1448);assert(Number.isFinite(point.y)&&point.y>=0&&point.y<=1086)}}
 assert(vm.runInContext(`fairingMask('${view}','${body}')`,ctx).includes(' C'));for(const p of parts){assert(p.surfacePath.includes(' C'));ctx.currentPath=p.surfacePath;const rings=vm.runInContext('cowlRings(currentPath)',ctx);assert(rings.length>0);assert(rings.flat().every(q=>Number.isFinite(q.x)&&Number.isFinite(q.y)&&q.x>=0&&q.x<=1448&&q.y>=0&&q.y<=1086))}
}
ctx.saved=JSON.parse(JSON.stringify({body:'white',panelsByBody:all,cowlPresetVersion:5}));const restored=vm.runInContext('loadBodyPanels(saved)',ctx);assert.equal(JSON.stringify(restored),JSON.stringify(all));
ctx.legacy=vm.runInContext('({body:"black",panels:legacyDefaultPanels()})',ctx);ctx.legacy.panels.sideA[0].points[0].x+=5;const migrated=vm.runInContext('loadBodyPanels(legacy)',ctx);assert.equal(migrated.black.sideA.length,7);const rear=migrated.black.sideA.find(p=>p.id==='tail');assert.equal(rear.components[0].points[0].x,ctx.legacy.panels.sideA[0].points[0].x);assert(!rear.surfacePath);assert(migrated.black.sideA.find(p=>p.id==='tank').surfacePath);
console.log('PASS: 12 independent presets, 84 nonempty physical cowls, smooth cubic paths, exact contour persistence, legacy defaults and custom edit migration');

const hardware={sideA:[[908,311],[1158,260],[1177,575],[1195,620],[880,500],[1185,522],[600,650],[1228,384],[860,624]],sideB:[[492,292],[584,371],[615,490],[267,573],[248,615],[721,755],[252,519],[284,264]],frontA:[[782,274],[1073,242],[1090,576],[1113,627],[1115,514],[786,460],[760,500],[735,545],[630,584],[753,621],[1025,476],[920,330]],frontB:[[643,267],[348,572],[331,621],[331,512],[685,475],[803,768],[678,178],[832,464],[370,239],[455,476]]};
function inside(point,rings){let hit=false;for(const ring of rings)for(let i=0,j=ring.length-1;i<ring.length;j=i++){const a=ring[i],b=ring[j];if((a.y>point.y)!==(b.y>point.y)&&point.x<(b.x-a.x)*(point.y-a.y)/(b.y-a.y)+a.x)hit=!hit}return hit}
for(const body of ['green','white','black'])for(const [view,points] of Object.entries(hardware)){ctx.mask=vm.runInContext(`fairingMask('${view}','${body}')`,ctx);const rings=vm.runInContext('cowlRings(mask)',ctx);for(const [x,y] of points)assert(!inside({x,y},rings),`${body} ${view}: hardware at ${x},${y} must stay outside`)}
console.log('PASS: controls, mirrors, bolts, mechanical parts, lights and actual openings excluded in all twelve masks');
const paint={sideA:[[909,500],[880,550],[1192,590]],sideB:[[545,500],[570,540],[220,515]],frontA:[[805,480],[785,515],[755,560],[714,595],[660,635],[1090,558],[1110,606]],frontB:[[659,475],[670,505],[281,505]]};
for(const body of ['green','white','black'])for(const [view,points] of Object.entries(paint)){ctx.mask=vm.runInContext(`fairingMask('${view}','${body}')`,ctx);const rings=vm.runInContext('cowlRings(mask)',ctx);for(const [x,y] of points)assert(inside({x,y},rings),`${body} ${view}: actual paint at ${x},${y} must remain covered`)}
console.log('PASS: restored main-cowl edges and paint around the corrected fender openings remain covered across all colors');

function winding(point,rings){let count=0;for(const ring of rings)for(let i=0;i<ring.length;i++){const a=ring[i],b=ring[(i+1)%ring.length],side=(b.x-a.x)*(point.y-a.y)-(point.x-a.x)*(b.y-a.y);if(a.y<=point.y&&b.y>point.y&&side>0)count++;else if(a.y>point.y&&b.y<=point.y&&side<0)count--}return count}
for(const body of ['green','white','black'])for(const view of Object.keys(ctx.PAIR_MAP))for(const part of all[body][view]){
 ctx.path=part.surfacePath;
 const before=vm.runInContext('cowlRings(path)',ctx),after=vm.runInContext('cowlRings(cowlNonzeroPath(path))',ctx);
 for(let y=150;y<850;y+=29)for(let x=150;x<1320;x+=31)assert.equal(winding({x,y},after)!==0,inside({x,y},before),`${body}/${view}/${part.id}: nonzero clips must retain holes`);
}
ctx.rectA='M0,0 L70,0 L70,70 L0,70 Z';ctx.rectB='M30,10 L30,80 L100,80 L100,10 Z';
const components=vm.runInContext('[cowlRings(cowlNonzeroPath(rectA)),cowlRings(cowlNonzeroPath(rectB))]',ctx);
assert.equal(winding({x:50,y:40},components.flat())!==0,true);
console.log('PASS: canonical SVG winding retains every stock opening and prevents holes in overlapping edited pieces');
