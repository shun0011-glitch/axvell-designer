const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),ctx={state:{body:'black',view:'frontA'},PAIR_MAP:{sideA:'sideB',sideB:'sideA',frontA:'frontB',frontB:'frontA'},VIEW_W:1448,VIEW_H:1086,clone:v=>JSON.parse(JSON.stringify(v))};vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root,'cowl-presets.js'),'utf8'),ctx);
vm.runInContext(fs.readFileSync(path.join(root,'cowl-paths.js'),'utf8'),ctx);
const source=fs.readFileSync(path.join(root,'panels.js'),'utf8');vm.runInContext(source.slice(0,source.indexOf('let savedCowlState')),ctx);
const all=vm.runInContext('loadBodyPanels()',ctx);
for(const body of ['black','white','green'])for(const view of Object.keys(ctx.PAIR_MAP)){
 const parts=all[body][view];assert.equal(parts.length,9);assert.equal(new Set(parts.map(p=>p.id)).size,9);
 assert(parts.some(p=>p.id==='tail'));assert(parts.some(p=>p.id==='seat'));assert(parts.some(p=>p.id==='fender'));
 for(const p of parts){assert(p.surfacePath.length>0);for(const point of p.points){assert(Number.isFinite(point.x)&&point.x>=0&&point.x<=1448);assert(Number.isFinite(point.y)&&point.y>=0&&point.y<=1086)}}
 assert(vm.runInContext(`fairingMask('${view}','${body}')`,ctx).includes(' C'));for(const p of parts){assert(p.surfacePath.includes(' C'));ctx.currentPath=p.surfacePath;const rings=vm.runInContext('cowlRings(currentPath)',ctx);assert(rings.length>0);assert(rings.flat().every(q=>Number.isFinite(q.x)&&Number.isFinite(q.y)&&q.x>=0&&q.x<=1448&&q.y>=0&&q.y<=1086))}
}
ctx.saved=JSON.parse(JSON.stringify({body:'white',panelsByBody:all,cowlPresetVersion:3}));const restored=vm.runInContext('loadBodyPanels(saved)',ctx);assert.equal(JSON.stringify(restored),JSON.stringify(all));
ctx.legacy=vm.runInContext('({body:"black",panels:legacyDefaultPanels()})',ctx);ctx.legacy.panels.sideA[0].points[0].x+=5;const migrated=vm.runInContext('loadBodyPanels(legacy)',ctx);assert.equal(migrated.black.sideA.length,9);assert.equal(migrated.black.sideA[0].points[0].x,ctx.legacy.panels.sideA[0].points[0].x);assert(!migrated.black.sideA[0].surfacePath);assert(migrated.black.sideA.find(p=>p.id==='tank').surfacePath);
console.log('PASS: 12 independent presets, 108 nonempty partitions, smooth cubic paths, exact contour persistence, legacy defaults and custom edit migration');

const hardware={sideA:[[908,311],[1158,260],[1177,575],[600,650],[1228,384],[860,624]],sideB:[[492,292],[584,371],[615,490],[258,570],[284,264]],frontA:[[782,274],[1073,242],[1113,627],[630,584],[753,621],[1025,476]],frontB:[[643,267],[348,572],[803,768],[678,178],[832,464],[370,239],[455,476]]};
function inside(point,rings){let hit=false;for(const ring of rings)for(let i=0,j=ring.length-1;i<ring.length;j=i++){const a=ring[i],b=ring[j];if((a.y>point.y)!==(b.y>point.y)&&point.x<(b.x-a.x)*(point.y-a.y)/(b.y-a.y)+a.x)hit=!hit}return hit}
for(const body of ['green','white','black'])for(const [view,points] of Object.entries(hardware)){ctx.mask=vm.runInContext(`fairingMask('${view}','${body}')`,ctx);const rings=vm.runInContext('cowlRings(mask)',ctx);for(const [x,y] of points)assert(!inside({x,y},rings),`${body} ${view}: hardware at ${x},${y} must stay outside`)}
console.log('PASS: controls, mirrors, bolts, mechanical parts, lights and actual openings excluded in all twelve masks');
