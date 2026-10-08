const NS="http://www.w3.org/2000/svg";
const VIEW_W=1448,VIEW_H=1086;
const ASSET_VERSION="20261009-1";
const IMAGE_MAP={black:{sideA:"assets/side-a-black.webp",sideB:"assets/side-b-black.webp",frontA:"assets/front-a-black.webp",frontB:"assets/front-b-black.webp"},white:{sideA:"assets/side-a-white.webp",sideB:"assets/side-b-white.webp",frontA:"assets/front-a-white.webp",frontB:"assets/front-b-white.webp"},green:{sideA:"assets/side-a-green.webp",sideB:"assets/side-b-green.webp",frontA:"assets/front-a-green.webp",frontB:"assets/front-b-green.webp"}};
const PAIR_MAP={sideA:"sideB",sideB:"sideA",frontA:"frontB",frontB:"frontA"};
const VIEW_LABELS={sideA:"SIDE A",sideB:"SIDE B",frontA:"FRONT A",frontB:"FRONT B"};
const AX_POLYS=[[[0,36],[33.8,2],[45.4,2],[70,27.6],[61.4,36],[44.4,36],[53.4,27],[40.4,13.4],[17.8,36]],[[50.6,2],[65,2],[98.2,36],[82.8,36]],[[83.6,0],[100,0],[83.6,16.2],[74.6,8.2]]];
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const stage=$("#stage"),stageScroll=$("#stageScroll"),bikeImg=$("#bikeImg"),svg=$("#designSvg"),objectsLayer=$("#objectsLayer"),selectionLayer=$("#selectionLayer"),imageMissing=$("#imageMissing"),missingFile=$("#missingFile"),imageStatus=$("#imageStatus");
let state={body:"black",view:"frontA",tool:"select",zoom:1,selected:null,objects:{sideA:[],sideB:[],frontA:[],frontB:[]}};
let history=[],future=[],drag=null,drawing=null,seq=1;
let importedBases={};
try{importedBases=JSON.parse(localStorage.getItem("axvellBaseImagesV6")||"{}")}catch{importedBases={}}
function baseKey(body=state.body,view=state.view){return body+":"+view}
function expectedFilename(body=state.body,view=state.view){
  const m=view.match(/^(side|front)(A|B)$/);
  return m?`${m[1]}-${m[2].toLowerCase()}-${body}.webp`:"";
}
function updateBaseSlotLabel(){
  const el=$("#baseSlotLabel");
  if(!el)return;
  const imported=Boolean(importedBases[baseKey()]);
  el.textContent=`${state.body.toUpperCase()} / ${VIEW_LABELS[state.view]} · ${imported?"LOCAL":"WEB"}`;
}
function persistImportedBases(){
  try{localStorage.setItem("axvellBaseImagesV6",JSON.stringify(importedBases));return true}
  catch(e){console.warn(e);toast("画像保存容量を超えました");return false}
}
function readFileDataURL(file){
  return new Promise((resolve,reject)=>{
    const r=new FileReader();
    r.onload=()=>resolve(r.result);
    r.onerror=reject;
    r.readAsDataURL(file);
  });
}
function uid(){return"o"+Date.now().toString(36)+(seq++).toString(36)}
function clone(v){return JSON.parse(JSON.stringify(v))}
function currentObjects(){return state.objects[state.view]}
function setCurrentObjects(n){state.objects[state.view]=n}
function selectedObj(){return currentObjects().find(o=>o.id===state.selected)||null}
function serializableState(){return{body:state.body,view:state.view,zoom:state.zoom,objects:clone(state.objects)}}
function snapshot(){history.push(JSON.stringify(serializableState()));if(history.length>60)history.shift();future=[];updateHistoryButtons()}
function restore(raw){const p=JSON.parse(raw);state.body=p.body||"black";state.view=p.view||"frontA";state.zoom=p.zoom||1;state.objects=p.objects||{sideA:[],sideB:[],frontA:[],frontB:[]};for(const k of Object.keys(PAIR_MAP))if(!state.objects[k])state.objects[k]=[];state.selected=null;syncBodyButtons();syncViewButtons();syncZoomButtons();loadBikeImage();render()}
function updateHistoryButtons(){$("#undoBtn").disabled=history.length===0;$("#redoBtn").disabled=future.length===0}
function toast(m){const t=$("#toast");t.textContent=m;t.hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.hidden=true,1800)}
function svgEl(tag,attrs={}){const e=document.createElementNS(NS,tag);for(const[k,v]of Object.entries(attrs))e.setAttribute(k,v);return e}
function bbox(o){if(["rect","stripe","circle","image"].includes(o.type))return{x:o.x-o.w/2,y:o.y-o.h/2,w:o.w,h:o.h};if(o.type==="text"){const w=Math.max(o.size*.8,(o.text||"AXVELL").length*o.size*.58);return{x:o.x-w/2,y:o.y-o.size*.6,w,h:o.size*1.2}}if(o.type==="ax")return{x:o.x-o.size/2,y:o.y-o.size*.2,w:o.size,h:o.size*.4};if(o.type==="draw"&&o.points.length){const xs=o.points.map(p=>p.x),ys=o.points.map(p=>p.y),x=Math.min(...xs),y=Math.min(...ys);return{x,y,w:Math.max(...xs)-x,h:Math.max(...ys)-y}}return{x:0,y:0,w:0,h:0}}
function createObjectElement(o){let e=null;if(o.type==="rect"||o.type==="stripe")e=svgEl("rect",{x:-o.w/2,y:-o.h/2,width:o.w,height:o.h,fill:o.color,opacity:o.opacity,transform:`translate(${o.x} ${o.y}) rotate(${o.rot})`});else if(o.type==="circle")e=svgEl("ellipse",{cx:0,cy:0,rx:o.w/2,ry:o.h/2,fill:o.color,opacity:o.opacity,transform:`translate(${o.x} ${o.y}) rotate(${o.rot})`});else if(o.type==="text"){e=svgEl("text",{x:o.x,y:o.y,fill:o.color,opacity:o.opacity,"font-size":o.size,"font-family":"Arial,sans-serif","font-weight":"800","text-anchor":"middle","dominant-baseline":"middle",transform:`rotate(${o.rot} ${o.x} ${o.y})`});e.textContent=o.text||"AXVELL"}else if(o.type==="ax"){e=svgEl("g",{opacity:o.opacity,transform:`translate(${o.x-o.size/2} ${o.y-o.size*.18}) rotate(${o.rot} ${o.size/2} ${o.size*.18}) scale(${o.size/100})`});AX_POLYS.forEach(poly=>e.appendChild(svgEl("polygon",{points:poly.map(p=>p.join(",")).join(" "),fill:o.color})))}else if(o.type==="draw")e=svgEl("polyline",{points:o.points.map(p=>`${p.x},${p.y}`).join(" "),fill:"none",stroke:o.color,"stroke-width":o.width,"stroke-linecap":"round","stroke-linejoin":"round",opacity:o.opacity});else if(o.type==="image")e=svgEl("image",{x:-o.w/2,y:-o.h/2,width:o.w,height:o.h,href:o.data,opacity:o.opacity,preserveAspectRatio:"xMidYMid meet",transform:`translate(${o.x} ${o.y}) rotate(${o.rot})`});if(!e)return null;e.dataset.id=o.id;e.classList.add("design-object");e.addEventListener("pointerdown",objectPointerDown);return e}
function render(){objectsLayer.replaceChildren();currentObjects().forEach(o=>{const e=createObjectElement(o);if(e)objectsLayer.appendChild(e)});selectionLayer.replaceChildren();const o=selectedObj();if(o){const b=bbox(o);selectionLayer.appendChild(svgEl("rect",{x:b.x,y:b.y,width:b.w,height:b.h,class:"sel-box"}))}$("#selectedType").textContent=o?o.type.toUpperCase():"NONE";$("#textRow").hidden=o?.type!=="text";$("#modeText").textContent=state.tool.toUpperCase()+" MODE";$("#viewLabel").textContent=`${state.body.toUpperCase()} / ${VIEW_LABELS[state.view]}`;updateBaseSlotLabel();updateControls()}
function updateControls(){const o=selectedObj();if(!o)return;$("#colorInput").value=o.color||"#76ff00";$("#rotateInput").value=o.rot||0;$("#rotateValue").textContent=(o.rot||0)+"°";$("#opacityInput").value=Math.round((o.opacity??1)*100);$("#opacityValue").textContent=$("#opacityInput").value+"%";$("#sizeInput").value=100;$("#sizeValue").textContent="100%";if(o.type==="text")$("#textInput").value=o.text||""}
function setImageStatus(text,type=""){imageStatus.textContent=text;imageStatus.className="status-dot "+type}
function loadBikeImage(){
  const webSrc=IMAGE_MAP[state.body][state.view];
  const localSrc=importedBases[baseKey()];
  const src=localSrc||`${webSrc}?v=${ASSET_VERSION}`;
  imageMissing.hidden=true;
  setImageStatus(localSrc?"IMAGE: LOCAL":"IMAGE: LOADING",localSrc?"ok":"");
  bikeImg.onload=()=>{imageMissing.hidden=true;setImageStatus(localSrc?"IMAGE: LOCAL":"IMAGE: OK","ok");updateBaseSlotLabel()};
  bikeImg.onerror=()=>{imageMissing.hidden=false;missingFile.textContent=webSrc;setImageStatus("IMAGE: MISSING","warn");updateBaseSlotLabel()};
  bikeImg.src=src;
}
function svgPoint(evt){const pt=svg.createSVGPoint();pt.x=evt.clientX;pt.y=evt.clientY;const m=svg.getScreenCTM();if(!m)return{x:0,y:0};return pt.matrixTransform(m.inverse())}
function setTool(t){state.tool=t;$$("[data-tool]").forEach(b=>b.classList.toggle("active",b.dataset.tool===t));render()}
function addObject(type,p){snapshot();let o={id:uid(),type,x:p.x,y:p.y,color:$("#colorInput").value,opacity:1,rot:0};if(type==="stripe")Object.assign(o,{w:430,h:65,rot:-15});if(type==="rect")Object.assign(o,{w:300,h:180});if(type==="circle")Object.assign(o,{w:200,h:200});if(type==="text")Object.assign(o,{size:95,text:"AXVELL"});if(type==="ax")Object.assign(o,{size:240});currentObjects().push(o);state.selected=o.id;setTool("select");render()}
function objectPointerDown(e){if(state.tool!=="select")return;e.preventDefault();e.stopPropagation();state.selected=e.currentTarget.dataset.id;const o=selectedObj();if(!o)return;snapshot();const p=svgPoint(e);drag={id:o.id,start:p,origX:o.x,origY:o.y,points:o.type==="draw"?clone(o.points):null};e.currentTarget.setPointerCapture?.(e.pointerId);render()}
svg.addEventListener("pointerdown",e=>{e.preventDefault();const p=svgPoint(e);if(state.tool==="draw"){snapshot();const o={id:uid(),type:"draw",color:$("#colorInput").value,opacity:1,width:18,points:[p]};currentObjects().push(o);state.selected=o.id;drawing=o;render();return}if(state.tool==="stripe")return addObject("stripe",p);if(state.tool==="block")return addObject("rect",p);if(state.tool==="circle")return addObject("circle",p);if(state.tool==="text")return addObject("text",p);if(state.tool==="ax")return addObject("ax",p);if(e.target===svg){state.selected=null;render()}});
svg.addEventListener("pointermove",e=>{e.preventDefault();const p=svgPoint(e);if(drawing){drawing.points.push(p);render();return}if(!drag)return;const o=currentObjects().find(x=>x.id===drag.id);if(!o)return;const dx=p.x-drag.start.x,dy=p.y-drag.start.y;if(o.type==="draw")o.points=drag.points.map(q=>({x:q.x+dx,y:q.y+dy}));else{o.x=drag.origX+dx;o.y=drag.origY+dy}render()});
function endPointer(){drag=null;drawing=null}svg.addEventListener("pointerup",endPointer);svg.addEventListener("pointercancel",endPointer);
$$("[data-tool]").forEach(b=>b.addEventListener("click",()=>setTool(b.dataset.tool)));
$$("[data-body]").forEach(b=>b.addEventListener("click",()=>{state.body=b.dataset.body;syncBodyButtons();loadBikeImage();render()}));
$$("[data-view]").forEach(b=>b.addEventListener("click",()=>{state.view=b.dataset.view;state.selected=null;syncViewButtons();loadBikeImage();render()}));
$$("[data-zoom]").forEach(b=>b.addEventListener("click",()=>{state.zoom=Number(b.dataset.zoom);syncZoomButtons()}));
function syncBodyButtons(){$$("[data-body]").forEach(b=>b.classList.toggle("active",b.dataset.body===state.body))}
function syncViewButtons(){$$("[data-view]").forEach(b=>b.classList.toggle("active",b.dataset.view===state.view))}
function syncZoomButtons(){stage.style.width=(state.zoom*100)+"%";$$("[data-zoom]").forEach(b=>b.classList.toggle("active",Number(b.dataset.zoom)===state.zoom));if(state.zoom===1)stageScroll.scrollLeft=0}
$("#colorInput").addEventListener("input",e=>{const o=selectedObj();if(o){o.color=e.target.value;render()}});
$$("[data-color]").forEach(b=>b.addEventListener("click",()=>{const c=b.dataset.color;$("#colorInput").value=c;const o=selectedObj();if(o){o.color=c;render()}}));
$("#textInput").addEventListener("input",e=>{const o=selectedObj();if(o?.type==="text"){o.text=e.target.value;render()}});
$("#rotateInput").addEventListener("input",e=>{const o=selectedObj();if(o&&o.type!=="draw"){o.rot=Number(e.target.value);$("#rotateValue").textContent=e.target.value+"°";render()}});
$("#opacityInput").addEventListener("input",e=>{const o=selectedObj();if(o){o.opacity=Number(e.target.value)/100;$("#opacityValue").textContent=e.target.value+"%";render()}});
$("#sizeInput").addEventListener("pointerdown",()=>{const o=selectedObj();if(o)o._scaleBase=clone(o)});
$("#sizeInput").addEventListener("input",e=>{const o=selectedObj();if(!o)return;const base=o._scaleBase||clone(o),f=Number(e.target.value)/100;$("#sizeValue").textContent=e.target.value+"%";if(["rect","stripe","circle","image"].includes(o.type)){o.w=base.w*f;o.h=base.h*f}else if(o.type==="text"||o.type==="ax")o.size=base.size*f;else if(o.type==="draw")o.width=Math.max(2,base.width*f);render()});
$("#sizeInput").addEventListener("change",()=>{const o=selectedObj();if(o)delete o._scaleBase;$("#sizeInput").value=100;$("#sizeValue").textContent="100%"});
$("#duplicateBtn").addEventListener("click",()=>{const o=selectedObj();if(!o)return;snapshot();const n=clone(o);delete n._scaleBase;n.id=uid();if(n.type==="draw")n.points=n.points.map(p=>({x:p.x+30,y:p.y+30}));else{n.x+=30;n.y+=30}currentObjects().push(n);state.selected=n.id;render()});
$("#mirrorPairBtn").addEventListener("click",()=>{if(!currentObjects().length){toast("コピーするデザインがありません");return}snapshot();const target=PAIR_MAP[state.view];state.objects[target]=currentObjects().map(o=>{const n=clone(o);n.id=uid();delete n._scaleBase;if(n.type==="draw")n.points=n.points.map(p=>({x:VIEW_W-p.x,y:p.y}));else{n.x=VIEW_W-n.x;if(typeof n.rot==="number")n.rot=-n.rot}return n});toast(`${VIEW_LABELS[target]}へ反転コピーしました`)});
$("#deleteBtn").addEventListener("click",()=>{if(!state.selected)return;snapshot();setCurrentObjects(currentObjects().filter(o=>o.id!==state.selected));state.selected=null;render()});
$("#imageBtn").addEventListener("click",()=>$("#imageInput").click());
$("#imageInput").addEventListener("change",e=>{const file=e.target.files?.[0];if(!file)return;const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{snapshot();const o={id:uid(),type:"image",x:980,y:500,w:320,h:320*im.height/im.width,rot:0,opacity:1,data:r.result};currentObjects().push(o);state.selected=o.id;render()};im.src=r.result};r.readAsDataURL(file);e.target.value=""});
$("#setCurrentBaseBtn").addEventListener("click",()=>$("#currentBaseInput").click());
$("#currentBaseInput").addEventListener("change",async e=>{
  const file=e.target.files?.[0];if(!file)return;
  try{
    importedBases[baseKey()]=await readFileDataURL(file);
    if(persistImportedBases()){loadBikeImage();render();toast("現在のベース画像を設定しました")}
  }catch(err){console.error(err);toast("画像の読み込みに失敗しました")}
  e.target.value="";
});
$("#importBasesBtn").addEventListener("click",()=>$("#baseImagesInput").click());
$("#baseImagesInput").addEventListener("change",async e=>{
  const files=[...(e.target.files||[])];
  if(!files.length)return;
  let count=0,skipped=0;
  for(const file of files){
    const m=file.name.toLowerCase().match(/^(side|front)-([ab])-(black|white|green)\.(webp|png|jpe?g)$/);
    if(!m){skipped++;continue}
    const view=m[1]+m[2].toUpperCase();
    const body=m[3];
    try{importedBases[body+":"+view]=await readFileDataURL(file);count++}catch{skipped++}
  }
  if(count&&persistImportedBases()){loadBikeImage();render();toast(`${count}枚のベース画像を読み込みました`)}
  else if(!count)toast("対応するファイル名が見つかりません");
  if(skipped)console.warn("Skipped base images:",skipped);
  e.target.value="";
});
$("#clearBasesBtn").addEventListener("click",()=>{
  importedBases={};
  localStorage.removeItem("axvellBaseImagesV6");
  loadBikeImage();render();toast("ローカル画像をリセットしました");
});
$("#undoBtn").addEventListener("click",()=>{if(!history.length)return;future.push(JSON.stringify(serializableState()));restore(history.pop());updateHistoryButtons()});
$("#redoBtn").addEventListener("click",()=>{if(!future.length)return;history.push(JSON.stringify(serializableState()));restore(future.pop());updateHistoryButtons()});
$("#saveBtn").addEventListener("click",()=>{localStorage.setItem("axvellDirectDesignerV6",JSON.stringify(serializableState()));toast("保存しました")});
$("#exportBtn").addEventListener("click",async()=>{if(!bikeImg.complete||!bikeImg.naturalWidth){toast("車体画像を読み込めません");return}state.selected=null;render();try{const canvas=document.createElement("canvas");canvas.width=VIEW_W;canvas.height=VIEW_H;const ctx=canvas.getContext("2d");ctx.drawImage(bikeImg,0,0,VIEW_W,VIEW_H);const exportSvg=svg.cloneNode(true);exportSvg.querySelector("#selectionLayer")?.remove();const blob=new Blob([new XMLSerializer().serializeToString(exportSvg)],{type:"image/svg+xml"});const url=URL.createObjectURL(blob);const overlay=new Image();overlay.src=url;await overlay.decode();ctx.drawImage(overlay,0,0,VIEW_W,VIEW_H);URL.revokeObjectURL(url);const a=document.createElement("a");a.href=canvas.toDataURL("image/png",1);a.download=`AXVELL_ZX4R_${state.body}_${state.view}.png`;a.click();toast("PNGを書き出しました")}catch(err){console.error(err);toast("PNG書き出しに失敗しました")}});
const saved=localStorage.getItem("axvellDirectDesignerV6");if(saved){try{const p=JSON.parse(saved);state.body=p.body||state.body;state.view=p.view||state.view;state.zoom=p.zoom||1;state.objects=p.objects||state.objects;for(const k of Object.keys(PAIR_MAP))if(!state.objects[k])state.objects[k]=[]}catch(e){console.warn(e)}}syncBodyButtons();syncViewButtons();syncZoomButtons();updateHistoryButtons();loadBikeImage();render();