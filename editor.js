// Direct manipulation handles and an explicit panel-selection tool.
let transformDrag=null,choosePanel=false;
function transformedPoint(o,x,y){const a=(o.rot||0)*Math.PI/180,c=Math.cos(a),s=Math.sin(a);return{x:o.x+x*c-y*s,y:o.y+x*s+y*c}}
function applyObjectScale(target,base,f){if(["rect","stripe","circle","image"].includes(base.type)){target.w=base.w*f;target.h=base.h*f}else if(["text","ax"].includes(base.type))target.size=base.size*f;else if(base.type==="draw"){const b=bbox(base),cx=b.x+b.w/2,cy=b.y+b.h/2;target.points=base.points.map(q=>({x:cx+(q.x-cx)*f,y:cy+(q.y-cy)*f}));target.width=base.width*f}}
function pointInPanel(point,panel){let inside=false;const a=panel.points;for(let i=0,j=a.length-1;i<a.length;j=i++){const p=a[i],q=a[j];if((p.y>point.y)!==(q.y>point.y)&&point.x<(q.x-p.x)*(point.y-p.y)/(q.y-p.y)+p.x)inside=!inside}return inside}
const chooseButton=document.createElement("button");chooseButton.type="button";chooseButton.id="choosePanelBtn";chooseButton.textContent="カウルを選択";chooseButton.setAttribute("aria-pressed","false");$("#panelSelect").before(chooseButton);
chooseButton.addEventListener("click",()=>{choosePanel=!choosePanel;panelEdit=false;panelDrawing=false;panelDraft=[];setTool("select");chooseButton.setAttribute("aria-pressed",String(choosePanel));chooseButton.textContent=choosePanel?"カウル選択を終了":"カウルを選択";render()});
svg.addEventListener("pointerdown",e=>{if(!choosePanel)return;e.preventDefault();e.stopImmediatePropagation();const point=svgPoint(e),p=[...currentPanels()].reverse().find(p=>pointInPanel(point,p));if(p){panelSelected=p.id;state.selected=null;render();toast(p.name)}},true);
function appendTransformHandles(){
 const o=selectedObj();if(!o||o.locked||choosePanel||panelEdit||panelDrawing)return;
 const b=bbox(o),isDraw=o.type==="draw",center=isDraw?{x:b.x+b.w/2,y:b.y+b.h/2}:{x:o.x,y:o.y};
 const localCorners=[[b.x-center.x,b.y-center.y],[b.x+b.w-center.x,b.y-center.y],[b.x+b.w-center.x,b.y+b.h-center.y],[b.x-center.x,b.y+b.h-center.y]];
 const corners=localCorners.map(([x,y])=>isDraw?{x:center.x+x,y:center.y+y}:transformedPoint(o,x,y));
 selectionLayer.replaceChildren();selectionLayer.appendChild(svgEl("polygon",{points:corners.map(p=>p.x+","+p.y).join(" "),fill:"none",stroke:"#76ff00","stroke-width":2,"vector-effect":"non-scaling-stroke","pointer-events":"none"}));
 function handle(point,kind){const el=svgEl("circle",{cx:point.x,cy:point.y,r:9,fill:kind==="rotate"?"#00a8ff":"#76ff00",stroke:"#080a0b","stroke-width":2,style:"cursor:"+ (kind==="rotate"?"grab":"nwse-resize")});el.dataset.transformHandle=kind;
 el.addEventListener("pointerdown",e=>{e.preventDefault();e.stopPropagation();finishControlEdit();snapshot();drag=null;drawing=null;const start=svgPoint(e);transformDrag={id:o.id,view:state.view,base:clone(o),center,kind,startDistance:Math.max(1,Math.hypot(start.x-center.x,start.y-center.y)),startAngle:Math.atan2(start.y-center.y,start.x-center.x)};svg.setPointerCapture(e.pointerId)});selectionLayer.appendChild(el)}
 corners.forEach(point=>handle(point,"scale"));
 if(!isDraw){const top=transformedPoint(o,0,b.y-center.y-45);handle(top,"rotate")}
}
const renderWithPanels=render;render=function(){renderWithPanels();appendTransformHandles()};
svg.addEventListener("pointermove",e=>{if(!transformDrag)return;e.preventDefault();e.stopImmediatePropagation();const d=transformDrag,o=currentObjects().find(o=>o.id===d.id);if(!o||state.view!==d.view){transformDrag=null;return}const p=svgPoint(e);
 if(d.kind==="scale")applyObjectScale(o,d.base,Math.max(.05,Math.min(20,Math.hypot(p.x-d.center.x,p.y-d.center.y)/d.startDistance)));
 else{const angle=Math.atan2(p.y-d.center.y,p.x-d.center.x);const degrees=(d.base.rot||0)+(angle-d.startAngle)*180/Math.PI;o.rot=Math.round(((degrees+180)%360+360)%360-180)}render()
},true);
["pointerup","pointercancel","lostpointercapture"].forEach(event=>svg.addEventListener(event,()=>transformDrag=null));
$$("[data-view]").forEach(b=>b.addEventListener("click",()=>{transformDrag=null;render()}));
// Editing tools return from panel-picking to object editing.
$$("[data-tool]").forEach(b=>b.addEventListener("click",()=>{choosePanel=false;chooseButton.setAttribute("aria-pressed","false");chooseButton.textContent="カウルを選択";render()}));
// Use the same panel clips for vector preview exports.
const svgButton=document.createElement("button");svgButton.type="button";svgButton.textContent="各カウルのSVGを作成";$("#panelExport").after(svgButton);
svgButton.addEventListener("click",()=>{if(!currentObjects().length||!currentPanels().length){toast("カウル区分とデザインを設定してください");return}clearPanelDownloads();for(const p of currentPanels()){const root=panelExportSvg(p,[...objectsLayer.children]),url=URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(root)],{type:"image/svg+xml"}));panelUrls.push(url);const a=document.createElement("a");a.href=url;a.download="AXVELL_"+state.view+"_"+p.id+".svg";a.textContent=p.name+" SVG保存";a.style.cssText="padding:12px;color:#76ff00";$("#panelDownloads").appendChild(a)}toast("SVG保存リンクを作成しました")});
const svgNote=document.createElement("p");svgNote.className="hint";svgNote.textContent="SVGは編集用です。文字はアウトライン化、クリッピングはパスへの変換が必要です。画像はカット線になりません。原寸設定後に制作データとして確認してください。";$("#panelDownloads").after(svgNote);
// Desktop: vehicle canvas in the center, tools and properties at either side.
const workspace=document.createElement("main");workspace.className="editor-workspace";const left=document.createElement("aside");left.className="editor-left";const right=document.createElement("aside");right.className="editor-right";const center=document.createElement("div");center.className="editor-center";
$(".vehicle-controls").before(workspace);workspace.append(left,center,right);left.append($(".vehicle-controls"),$(".base-tools"),$("#toolstrip"));center.append($(".stage-shell"));right.append(document.querySelector("section.panel:not(:has(#panelSelect))"),panelUI);
const style=document.createElement("style");style.textContent='.editor-workspace{display:grid;grid-template-columns:220px minmax(0,1fr) 310px;gap:16px;max-width:1800px;margin:0 auto;padding:16px}.editor-left,.editor-center,.editor-right{min-width:0}.editor-left .vehicle-controls,.editor-left .base-tools{display:flex;flex-direction:column;align-items:stretch;gap:16px}.editor-left .toolstrip{display:grid;grid-template-columns:repeat(2,1fr)}.editor-left .seg,.editor-left .base-actions{display:flex;flex-wrap:wrap}.editor-right .panel,.editor-center .stage-shell{width:100%;margin:0 0 16px;box-sizing:border-box}.editor-right .base-actions{display:flex;flex-wrap:wrap;gap:8px}.editor-right select{max-width:100%;padding:10px;background:#11161a;color:#fff;border:1px solid #39434b}.intro{padding-bottom:12px}.intro h1{font-size:clamp(24px,3vw,44px)}@media(max-width:1100px){.editor-workspace{grid-template-columns:180px minmax(0,1fr)}.editor-right{grid-column:1/-1;display:grid;grid-template-columns:1fr 1fr;gap:16px}}@media(max-width:700px){.editor-workspace{display:flex;flex-direction:column;padding:8px}.editor-center{order:0}.editor-left{order:1}.editor-right{order:2;display:block}.editor-left .toolstrip{grid-template-columns:repeat(4,1fr)}}';
document.head.appendChild(style);render();
