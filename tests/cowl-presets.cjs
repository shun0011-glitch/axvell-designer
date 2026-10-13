const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),ctx={state:{body:'black',view:'frontA'},PAIR_MAP:{sideA:'sideB',sideB:'sideA',frontA:'frontB',frontB:'frontA'},VIEW_W:1448,VIEW_H:1086,clone:v=>JSON.parse(JSON.stringify(v))};vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root,'cowl-presets.js'),'utf8'),ctx);
const source=fs.readFileSync(path.join(root,'panels.js'),'utf8');vm.runInContext(source.slice(0,source.indexOf('let savedCowlState')),ctx);
const all=vm.runInContext('loadBodyPanels()',ctx);
for(const body of ['black','white','green'])for(const view of Object.keys(ctx.PAIR_MAP)){
 const parts=all[body][view];assert.equal(parts.length,9);assert.equal(new Set(parts.map(p=>p.id)).size,9);
 assert(parts.some(p=>p.id==='tail'));assert(parts.some(p=>p.id==='seat'));assert(parts.some(p=>p.id==='fender'));
 for(const p of parts){assert(p.surfacePath.length>0);for(const point of p.points){assert(Number.isFinite(point.x)&&point.x>=0&&point.x<=1448);assert(Number.isFinite(point.y)&&point.y>=0&&point.y<=1086)}}
 assert.equal(vm.runInContext(`fairingMask('${view}','${body}')`,ctx),parts.map(p=>p.surfacePath).join(' '));
}
ctx.saved=JSON.parse(JSON.stringify({body:'white',panelsByBody:all,cowlPresetVersion:1}));const restored=vm.runInContext('loadBodyPanels(saved)',ctx);assert.equal(JSON.stringify(restored),JSON.stringify(all));
ctx.legacy=vm.runInContext('({body:"black",panels:legacyDefaultPanels()})',ctx);ctx.legacy.panels.sideA[0].points[0].x+=5;const migrated=vm.runInContext('loadBodyPanels(legacy)',ctx);assert.equal(migrated.black.sideA.length,9);assert.equal(migrated.black.sideA[0].points[0].x,ctx.legacy.panels.sideA[0].points[0].x);assert(!migrated.black.sideA[0].surfacePath);assert(migrated.black.sideA.find(p=>p.id==='tank').surfacePath);
console.log('PASS: 12 independent presets, 108 nonempty partitions, matching mask unions, exact contour persistence, legacy defaults and custom edit migration');
