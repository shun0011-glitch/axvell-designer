// Per-view panel outlines. Coordinates are approximate traces of the supplied side photo.
const PANEL_SEEDS=[
 ["nose","フロントカウル",[[155,395],[210,350],[326,300],[354,317],[332,351],[296,395],[209,453],[160,460],[180,422]]],
 ["upper","サイド上部",[[338,375],[338,355],[354,332],[445,335],[520,350],[610,376],[618,400],[566,429],[503,419],[470,407],[392,399],[296,395]]],
 ["side","サイドカウル",[[209,453],[296,395],[392,399],[470,407],[503,419],[492,437],[504,462],[547,511],[590,566],[416,566],[360,524],[290,476]]],
 ["middle","サイド下部",[[416,566],[590,566],[643,607],[690,638],[738,658],[738,665],[697,695],[618,676],[561,670],[530,689],[482,689],[470,637]]],
 ["under","アンダーカウル",[[482,689],[530,689],[561,670],[618,676],[632,695],[679,712],[749,731],[731,776],[703,800],[554,810],[470,813]]],
 ["tank","タンク",[[512,299],[583,267],[650,250],[714,247],[760,269],[807,307],[848,329],[852,378],[824,391],[797,401],[755,385],[685,362],[610,355],[549,321]]],
 ["seat","シート下カバー",[[549,368],[636,368],[713,389],[778,415],[810,452],[740,450],[646,434],[618,451],[607,480],[613,526],[639,554],[654,556],[636,537],[625,508],[626,473],[646,448],[723,448],[754,456],[878,440],[953,418],[1007,391],[1035,380],[1054,357],[1040,409],[1021,433],[951,452],[837,453],[759,456],[754,494],[746,514],[662,506],[655,555],[631,556],[604,529],[577,484],[551,459],[521,437],[503,419]]],
 ["tail","テールカウル",[[1035,380],[1054,357],[1064,314],[1081,285],[1167,257],[1255,232],[1289,232],[1265,264],[1237,287],[1190,318],[1155,344],[1081,384],[1040,409]]]
];
function defaultPanels(){return {sideB:PANEL_SEEDS.map(([id,name,points])=>({id,name,points:points.map(([x,y])=>({x,y}))})),sideA:[],frontA:[],frontB:[]}}
function validPanels(raw){const out=defaultPanels();for(const view of Object.keys(PAIR_MAP)){if(Array.isArray(raw?.[view]))out[view]=raw[view].filter(p=>typeof p.id==="string"&&typeof p.name==="string"&&Array.isArray(p.points)&&p.points.length>=3&&p.points.every(q=>Number.isFinite(q.x)&&Number.isFinite(q.y)&&q.x>=0&&q.x<=VIEW_W&&q.y>=0&&q.y<=VIEW_H)).map(p=>({id:p.id,name:p.name,points:p.points.map(q=>({x:q.x,y:q.y}))}))}return out}
state.panels=defaultPanels();
try{const savedPanels=JSON.parse(localStorage.getItem("axvellDirectDesignerV6")||"{}");if(savedPanels.panels)state.panels=validPanels(savedPanels.panels)}catch{}
let panelEdit=false,panelShown=true,panelSelected=null,panelDraft=[],panelDrawing=false,panelDrag=null,panelUrls=[];
const panelLayer=svgEl("g",{id:"panelLayer"});svg.appendChild(panelLayer);
const panelUI=document.createElement("section");panelUI.className="panel";
panelUI.innerHTML='<div class="panel-head"><span>カウルごとの分割</span><button id="panelShow" type="button" aria-pressed="true">境界 ON</button></div><div class="base-actions"><select id="panelSelect" aria-label="カウル選択"></select><button id="panelEdit" type="button">境界を調整</button><button id="panelAdd" type="button">区分を追加</button><button id="panelFinish" type="button" hidden>輪郭を確定</button><button id="panelCancel" type="button" hidden>キャンセル</button><button id="panelDelete" type="button">区分を削除</button><button id="panelExport" type="button">各カウルのPNGを作成</button></div><p class="hint">SIDE Bに写真を基にした仮の区分を設定。境界を調整→点をドラッグ。追加は輪郭を順にクリックし確定してください。他の角度は個別に設定します。出力は背景透明・写真座標の分割データです。原寸・曲面展開には未対応です。</p><div id="panelDownloads" class="base-actions"></div>';
$(".stage-shell").after(panelUI);
function currentPanels(){return state.panels[state.view]}
function panelPath(p){return "M"+p.points.map(q=>q.x+","+q.y).join(" L")+" Z"}
function panelBounds(p){const xs=p.points.map(q=>q.x),ys=p.points.map(q=>q.y);const x=Math.floor(Math.min(...xs)),y=Math.floor(Math.min(...ys));return{x,y,w:Math.max(1,Math.ceil(Math.max(...xs))-x),h:Math.max(1,Math.ceil(Math.max(...ys))-y)}}
function renderPanels(){
 panelLayer.replaceChildren();const list=currentPanels();if(!list.some(p=>p.id===panelSelected))panelSelected=list[0]?.id||null;
 const select=$("#panelSelect");select.replaceChildren();for(const p of list){const option=document.createElement("option");option.value=p.id;option.textContent=p.name;select.appendChild(option)}select.value=panelSelected||"";
 $("#panelEdit").textContent=panelEdit?"調整を終了":"境界を調整";$("#panelFinish").hidden=$("#panelCancel").hidden=!panelDrawing;$("#panelDelete").disabled=!panelSelected||panelDrawing;$("#panelExport").disabled=!list.length||panelDrawing;objectsLayer.style.pointerEvents=panelEdit||panelDrawing?"none":"";
 if(!panelShown&&!panelEdit&&!panelDrawing)return;
 for(const p of list){const selected=p.id===panelSelected;panelLayer.appendChild(svgEl("path",{d:panelPath(p),fill:panelEdit&&selected?"#00a8ff22":"none",stroke:selected?"#00a8ff":"#ffffff","stroke-width":2,"vector-effect":"non-scaling-stroke","pointer-events":"none"}));
 if(panelEdit&&selected)p.points.forEach((q,i)=>{const handle=svgEl("circle",{cx:q.x,cy:q.y,r:7,fill:"#00a8ff",stroke:"#fff","stroke-width":2});handle.addEventListener("pointerdown",e=>{e.preventDefault();e.stopPropagation();snapshot();panelDrag={id:p.id,index:i,view:state.view};svg.setPointerCapture(e.pointerId)});panelLayer.appendChild(handle)})}
 if(panelDraft.length)panelLayer.appendChild(svgEl("polyline",{points:panelDraft.map(q=>q.x+","+q.y).join(" "),fill:"none",stroke:"#ffcc00","stroke-width":3,"pointer-events":"none"}));
}
const originalSerialize=serializableState;serializableState=function(){return {...originalSerialize(),panels:clone(state.panels)}};
const originalRestore=restore;restore=function(raw){panelDrag=null;panelDraft=[];panelDrawing=false;state.panels=validPanels(JSON.parse(raw).panels);originalRestore(raw)};
const originalRender=render;render=function(){originalRender();renderPanels()};
svg.addEventListener("pointerdown",e=>{if(!panelEdit&&!panelDrawing)return;if(e.target.closest?.("#panelLayer"))return;e.preventDefault();e.stopImmediatePropagation();if(panelDrawing){const p=svgPoint(e);panelDraft.push({x:Math.max(0,Math.min(VIEW_W,p.x)),y:Math.max(0,Math.min(VIEW_H,p.y))});renderPanels()}},true);
svg.addEventListener("pointermove",e=>{if(!panelDrag)return;e.preventDefault();e.stopImmediatePropagation();const p=currentPanels().find(p=>p.id===panelDrag.id);if(p&&state.view===panelDrag.view){const q=svgPoint(e);p.points[panelDrag.index]={x:Math.max(0,Math.min(VIEW_W,q.x)),y:Math.max(0,Math.min(VIEW_H,q.y))};renderPanels()}},true);
["pointerup","pointercancel","lostpointercapture"].forEach(event=>svg.addEventListener(event,()=>panelDrag=null));
$("#panelSelect").addEventListener("change",e=>{panelSelected=e.target.value;renderPanels()});
$("#panelShow").addEventListener("click",e=>{panelShown=!panelShown;e.target.textContent=panelShown?"境界 ON":"境界 OFF";e.target.setAttribute("aria-pressed",String(panelShown));renderPanels()});
$("#panelEdit").addEventListener("click",()=>{panelEdit=!panelEdit;panelDrawing=false;panelDraft=[];setTool("select");renderPanels()});
$("#panelAdd").addEventListener("click",()=>{panelEdit=false;panelDrawing=true;panelDraft=[];setTool("select");renderPanels()});
$("#panelCancel").addEventListener("click",()=>{panelDrawing=false;panelDraft=[];renderPanels()});
$("#panelFinish").addEventListener("click",()=>{if(panelDraft.length<3){toast("3点以上で輪郭を作ってください");return}snapshot();const p={id:uid(),name:"カウル "+(currentPanels().length+1),points:clone(panelDraft)};currentPanels().push(p);panelSelected=p.id;panelDrawing=false;panelDraft=[];panelEdit=true;render()});
$("#panelDelete").addEventListener("click",()=>{if(!panelSelected)return;snapshot();state.panels[state.view]=currentPanels().filter(p=>p.id!==panelSelected);panelSelected=null;render()});
$$("[data-view]").forEach(b=>b.addEventListener("click",()=>{panelDraft=[];panelDrawing=false;panelDrag=null;renderPanels()}));
function panelExportSvg(p,designNodes){const b=panelBounds(p),root=svgEl("svg",{xmlns:NS,width:b.w,height:b.h,viewBox:[b.x,b.y,b.w,b.h].join(" ")});const defs=svgEl("defs"),clip=svgEl("clipPath",{id:"panelClip",clipPathUnits:"userSpaceOnUse"});clip.appendChild(svgEl("path",{d:panelPath(p)}));defs.appendChild(clip);root.appendChild(defs);const group=svgEl("g",{"clip-path":"url(#panelClip)"});for(const node of designNodes)group.appendChild(node.cloneNode(true));root.appendChild(group);return root}
function clearPanelDownloads(){for(const url of panelUrls)URL.revokeObjectURL(url);panelUrls=[];$("#panelDownloads").replaceChildren()}
$("#panelExport").addEventListener("click",async()=>{
 if(!currentObjects().length){toast("デザインを配置してください");return}
 const button=$("#panelExport"),view=state.view,panels=clone(currentPanels()),nodes=[...objectsLayer.children].map(n=>n.cloneNode(true));button.disabled=true;clearPanelDownloads();
 try{for(const p of panels){const b=panelBounds(p),root=panelExportSvg(p,nodes);const svgUrl=URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(root)],{type:"image/svg+xml"}));let blob;
 try{const image=new Image();image.src=svgUrl;await image.decode();const canvas=document.createElement("canvas");canvas.width=b.w;canvas.height=b.h;canvas.getContext("2d").drawImage(image,0,0);blob=await new Promise(resolve=>canvas.toBlob(resolve,"image/png"));if(!blob)throw Error("PNG encoding failed")}finally{URL.revokeObjectURL(svgUrl)}
 const url=URL.createObjectURL(blob);panelUrls.push(url);const a=document.createElement("a");a.href=url;a.download="AXVELL_"+view+"_"+p.id+".png";a.textContent=p.name+" PNG保存";a.style.cssText="padding:12px;color:#76ff00";$("#panelDownloads").appendChild(a)}
 toast("各カウルの保存リンクを作成しました");
 }catch(err){console.error(err);toast("分割出力に失敗しました。再試行してください")}finally{button.disabled=false}
});
// Guide overlays never belong in the composite PNG.
const originalCloneSvg=svg.cloneNode.bind(svg);svg.cloneNode=function(deep){const copy=originalCloneSvg(deep);copy.querySelector("#panelLayer")?.remove();return copy};
renderPanels();
