const NS="http://www.w3.org/2000/svg";
const W=1448,H=1086;
const AX_POLYS=[[[0,36],[33.8,2],[45.4,2],[70,27.6],[61.4,36],[44.4,36],[53.4,27],[40.4,13.4],[17.8,36]],[[50.6,2],[65,2],[98.2,36],[82.8,36]],[[83.6,0],[100,0],[83.6,16.2],[74.6,8.2]]];
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const stage=$("#stage"), svg=$("#designSvg"), objectsLayer=$("#objectsLayer"), selectionLayer=$("#selectionLayer");
let state={body:"black",side:"A",tool:"select",zoom:1,objects:[],selected:null};
let history=[],future=[],drag=null,drawing=null,seq=1;

function uid(){return "o"+Date.now().toString(36)+(seq++).toString(36)}
function clone(v){return JSON.parse(JSON.stringify(v))}
function serializable(){return {body:state.body,side:state.side,objects:state.objects.map(o=>{const n=clone(o);delete n._base;return n})}}
function snapshot(){history.push(JSON.stringify(serializable()));if(history.length>50)history.shift();future=[];updateHistory()}
function updateHistory(){$("#undoBtn").disabled=!history.length;$("#redoBtn").disabled=!future.length}
function toast(m){const t=$("#toast");t.textContent=m;t.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>t.hidden=true,1700)}
function el(tag,attrs={}){const e=document.createElementNS(NS,tag);for(const[k,v]of Object.entries(attrs))e.setAttribute(k,v);return e}
function selectedObj(){return state.objects.find(o=>o.id===state.selected)||null}

function bbox(o){
  if(["rect","stripe","circle","image"].includes(o.type))return{x:o.x-o.w/2,y:o.y-o.h/2,w:o.w,h:o.h};
  if(o.type==="text"){const w=Math.max(o.size*.8,(o.text||"AXVELL").length*o.size*.58);return{x:o.x-w/2,y:o.y-o.size*.6,w,h:o.size*1.2}}
  if(o.type==="ax")return{x:o.x-o.size/2,y:o.y-o.size*.2,w:o.size,h:o.size*.4};
  if(o.type==="draw"&&o.points.length){const xs=o.points.map(p=>p.x),ys=o.points.map(p=>p.y),x=Math.min(...xs),y=Math.min(...ys);return{x,y,w:Math.max(...xs)-x,h:Math.max(...ys)-y}}
  return{x:0,y:0,w:0,h:0}
}

function makeObjectElement(o){
  let e;
  if(o.type==="rect"||o.type==="stripe"){
    e=el("rect",{x:-o.w/2,y:-o.h/2,width:o.w,height:o.h,fill:o.color,opacity:o.opacity,transform:`translate(${o.x} ${o.y}) rotate(${o.rot})`});
  }else if(o.type==="circle"){
    e=el("ellipse",{cx:0,cy:0,rx:o.w/2,ry:o.h/2,fill:o.color,opacity:o.opacity,transform:`translate(${o.x} ${o.y}) rotate(${o.rot})`});
  }else if(o.type==="text"){
    e=el("text",{x:o.x,y:o.y,fill:o.color,opacity:o.opacity,"font-size":o.size,"font-family":"Arial,sans-serif","font-weight":"800","text-anchor":"middle","dominant-baseline":"middle",transform:`rotate(${o.rot} ${o.x} ${o.y})`});
    e.textContent=o.text||"AXVELL";
  }else if(o.type==="ax"){
    e=el("g",{opacity:o.opacity,transform:`translate(${o.x-o.size/2} ${o.y-o.size*.18}) rotate(${o.rot} ${o.size/2} ${o.size*.18}) scale(${o.size/100})`});
    AX_POLYS.forEach(poly=>e.appendChild(el("polygon",{points:poly.map(p=>p.join(",")).join(" "),fill:o.color})));
  }else if(o.type==="draw"){
    e=el("polyline",{points:o.points.map(p=>`${p.x},${p.y}`).join(" "),fill:"none",stroke:o.color,"stroke-width":o.width,"stroke-linecap":"round","stroke-linejoin":"round",opacity:o.opacity});
  }else if(o.type==="image"){
    e=el("image",{x:-o.w/2,y:-o.h/2,width:o.w,height:o.h,href:o.data,opacity:o.opacity,preserveAspectRatio:"xMidYMid meet",transform:`translate(${o.x} ${o.y}) rotate(${o.rot})`});
  }
  if(!e)return null;
  e.dataset.id=o.id;e.classList.add("design-object");e.addEventListener("pointerdown",objectPointerDown);
  return e
}

function render(){
  $("#bikeImg").src=`assets/zx4r-${state.body}.jpg`;
  stage.style.transform=state.side==="B"?"scaleX(-1)":"";
  objectsLayer.replaceChildren();
  state.objects.forEach(o=>{const e=makeObjectElement(o);if(e)objectsLayer.appendChild(e)});
  selectionLayer.replaceChildren();
  const o=selectedObj();
  if(o){
    const b=bbox(o);selectionLayer.appendChild(el("rect",{x:b.x,y:b.y,width:b.w,height:b.h,class:"sel-box"}));
  }
  $("#selectedType").textContent=o?o.type.toUpperCase():"NONE";
  $("#textRow").hidden=o?.type!=="text";
  $("#modeText").textContent=state.tool.toUpperCase()+" MODE";
  updateControls();
}

function updateControls(){
  const o=selectedObj();if(!o)return;
  $("#colorInput").value=o.color||"#76ff00";
  $("#sizeInput").value=100;$("#sizeValue").textContent="100%";
  $("#rotateInput").value=o.rot||0;$("#rotateValue").textContent=(o.rot||0)+"°";
  $("#opacityInput").value=Math.round((o.opacity??1)*100);$("#opacityValue").textContent=$("#opacityInput").value+"%";
  if(o.type==="text")$("#textInput").value=o.text||"";
}

function svgPoint(evt){
  const pt=svg.createSVGPoint();pt.x=evt.clientX;pt.y=evt.clientY;
  const p=pt.matrixTransform(svg.getScreenCTM().inverse());
  return state.side==="B"?{x:W-p.x,y:p.y}:{x:p.x,y:p.y}
}

function setTool(t){
  state.tool=t;$$("[data-tool]").forEach(b=>b.classList.toggle("active",b.dataset.tool===t));render()
}

function add(type,p){
  snapshot();
  let o={id:uid(),type,x:p.x,y:p.y,color:$("#colorInput").value,opacity:1,rot:0};
  if(type==="stripe")Object.assign(o,{w:430,h:65,rot:-15});
  if(type==="rect")Object.assign(o,{w:300,h:180});
  if(type==="circle")Object.assign(o,{w:200,h:200});
  if(type==="text")Object.assign(o,{size:95,text:"AXVELL"});
  if(type==="ax")Object.assign(o,{size:240});
  state.objects.push(o);state.selected=o.id;setTool("select");render()
}

function objectPointerDown(e){
  if(state.tool!=="select")return;
  e.stopPropagation();e.preventDefault();
  state.selected=e.currentTarget.dataset.id;
  const o=selectedObj(),p=svgPoint(e);snapshot();
  drag={id:o.id,start:p,orig:{x:o.x,y:o.y},points:o.type==="draw"?clone(o.points):null};
  e.currentTarget.setPointerCapture?.(e.pointerId);render()
}

svg.addEventListener("pointerdown",e=>{
  e.preventDefault();const p=svgPoint(e);
  if(state.tool==="draw"){
    snapshot();const o={id:uid(),type:"draw",color:$("#colorInput").value,opacity:1,width:18,points:[p]};state.objects.push(o);state.selected=o.id;drawing=o;render();return
  }
  if(state.tool==="stripe"){add("stripe",p);return}
  if(state.tool==="block"){add("rect",p);return}
  if(state.tool==="circle"){add("circle",p);return}
  if(state.tool==="text"){add("text",p);return}
  if(state.tool==="ax"){add("ax",p);return}
  if(e.target===svg){state.selected=null;render()}
});
svg.addEventListener("pointermove",e=>{
  e.preventDefault();const p=svgPoint(e);
  if(drawing){drawing.points.push(p);render();return}
  if(drag){
    const o=state.objects.find(x=>x.id===drag.id);if(!o)return;
    const dx=p.x-drag.start.x,dy=p.y-drag.start.y;
    if(o.type==="draw")o.points=drag.points.map(q=>({x:q.x+dx,y:q.y+dy}));
    else{o.x=drag.orig.x+dx;o.y=drag.orig.y+dy}
    render()
  }
});
svg.addEventListener("pointerup",()=>{drag=null;drawing=null});
svg.addEventListener("pointercancel",()=>{drag=null;drawing=null});

$$("[data-tool]").forEach(b=>b.addEventListener("click",()=>setTool(b.dataset.tool)));
$$("[data-body]").forEach(b=>b.addEventListener("click",()=>{state.body=b.dataset.body;$$("[data-body]").forEach(x=>x.classList.toggle("active",x===b));render()}));
$$("[data-side]").forEach(b=>b.addEventListener("click",()=>{state.side=b.dataset.side;$$("[data-side]").forEach(x=>x.classList.toggle("active",x===b));render()}));
$$("[data-zoom]").forEach(b=>b.addEventListener("click",()=>{state.zoom=+b.dataset.zoom;stage.style.width=(state.zoom*100)+"%";$$("[data-zoom]").forEach(x=>x.classList.toggle("active",x===b))}));

$("#colorInput").addEventListener("input",e=>{const o=selectedObj();if(o){o.color=e.target.value;render()}});
$$("[data-color]").forEach(b=>b.addEventListener("click",()=>{const c=b.dataset.color;$("#colorInput").value=c;const o=selectedObj();if(o){o.color=c;render()}}));
$("#textInput").addEventListener("input",e=>{const o=selectedObj();if(o?.type==="text"){o.text=e.target.value;render()}});
$("#rotateInput").addEventListener("input",e=>{const o=selectedObj();if(o&&o.type!=="draw"){o.rot=+e.target.value;$("#rotateValue").textContent=e.target.value+"°";render()}});
$("#opacityInput").addEventListener("input",e=>{const o=selectedObj();if(o){o.opacity=+e.target.value/100;$("#opacityValue").textContent=e.target.value+"%";render()}});
$("#sizeInput").addEventListener("input",e=>{
  const o=selectedObj();if(!o)return;const f=+e.target.value/100;$("#sizeValue").textContent=e.target.value+"%";
  if(!o._base)o._base=clone(o);
  if(["rect","stripe","circle","image"].includes(o.type)){o.w=o._base.w*f;o.h=o._base.h*f}
  else if(o.type==="text"||o.type==="ax")o.size=o._base.size*f;
  else if(o.type==="draw")o.width=Math.max(2,o._base.width*f);
  render()
});

$("#duplicateBtn").addEventListener("click",()=>{const o=selectedObj();if(!o)return;snapshot();const n=clone(o);delete n._base;n.id=uid();if(n.type==="draw")n.points=n.points.map(p=>({x:p.x+30,y:p.y+30}));else{n.x+=30;n.y+=30}state.objects.push(n);state.selected=n.id;render()});
$("#deleteBtn").addEventListener("click",()=>{if(!state.selected)return;snapshot();state.objects=state.objects.filter(o=>o.id!==state.selected);state.selected=null;render()});
$("#imageBtn").addEventListener("click",()=>$("#imageInput").click());
$("#imageInput").addEventListener("change",e=>{
  const f=e.target.files?.[0];if(!f)return;const r=new FileReader();
  r.onload=()=>{const im=new Image();im.onload=()=>{snapshot();const o={id:uid(),type:"image",x:1000,y:500,w:320,h:320*im.height/im.width,rot:0,opacity:1,data:r.result};state.objects.push(o);state.selected=o.id;render()};im.src=r.result};
  r.readAsDataURL(f);e.target.value=""
});

$("#undoBtn").addEventListener("click",()=>{if(!history.length)return;future.push(JSON.stringify(serializable()));const s=JSON.parse(history.pop());state={...state,...s,selected:null};render();updateHistory()});
$("#redoBtn").addEventListener("click",()=>{if(!future.length)return;history.push(JSON.stringify(serializable()));const s=JSON.parse(future.pop());state={...state,...s,selected:null};render();updateHistory()});
$("#saveBtn").addEventListener("click",()=>{localStorage.setItem("axvellDirectDesignerV4",JSON.stringify(serializable()));toast("保存しました")});

$("#exportBtn").addEventListener("click",async()=>{
  state.selected=null;render();
  const canvas=document.createElement("canvas");canvas.width=W;canvas.height=H;const ctx=canvas.getContext("2d");
  const img=new Image();img.src=$("#bikeImg").src;await img.decode();
  if(state.side==="B"){ctx.translate(W,0);ctx.scale(-1,1)}
  ctx.drawImage(img,0,0,W,H);
  const svgText=new XMLSerializer().serializeToString(svg);
  const blob=new Blob([svgText],{type:"image/svg+xml"}),url=URL.createObjectURL(blob),ov=new Image();ov.src=url;await ov.decode();ctx.drawImage(ov,0,0,W,H);URL.revokeObjectURL(url);
  const a=document.createElement("a");a.href=canvas.toDataURL("image/png");a.download="AXVELL_ZX4R_DESIGN.png";a.click();toast("PNGを書き出しました")
});

const saved=localStorage.getItem("axvellDirectDesignerV4");
if(saved){try{const s=JSON.parse(saved);state={...state,...s,selected:null};$$("[data-body]").forEach(b=>b.classList.toggle("active",b.dataset.body===state.body));$$("[data-side]").forEach(b=>b.classList.toggle("active",b.dataset.side===state.side))}catch{}}
updateHistory();render();