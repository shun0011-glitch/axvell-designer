const NS="http://www.w3.org/2000/svg";
const VIEW_W=1448,VIEW_H=1086;
const ASSET_VERSION="20261009-4";
const IMAGE_MAP={black:{sideA:"assets/side-a-black.webp",sideB:"assets/side-b-black.webp",frontA:"assets/front-a-black.webp",frontB:"assets/front-b-black.webp"},white:{sideA:"assets/side-a-white.webp",sideB:"assets/side-b-white.webp",frontA:"assets/front-a-white.webp",frontB:"assets/front-b-white.webp"},green:{sideA:"assets/side-a-green.webp",sideB:"assets/side-b-green.webp",frontA:"assets/front-a-green.webp",frontB:"assets/front-b-green.webp"}};
const PAIR_MAP={sideA:"sideB",sideB:"sideA",frontA:"frontB",frontB:"frontA"};
const VIEW_LABELS={sideA:"SIDE A",sideB:"SIDE B",frontA:"FRONT A",frontB:"FRONT B"};
const FAIRING_MASKS={"sideA":"M736,232 718,240 688,260 624,311 601,334 588,358 586,367 600,375 604,383 640,400 657,397 674,387 690,387 691,403 795,427 837,444 838,464 802,552 802,556 807,556 827,547 853,506 867,504 867,484 897,434 905,428 905,414 897,409 897,393 903,390 948,385 967,374 967,370 949,362 944,362 943,377 917,377 915,375 896,373 895,356 918,355 941,358 942,342 973,335 973,331 954,330 954,314 957,312 957,307 950,297 941,300 926,316 914,320 913,323 897,323 896,306 900,305 908,294 915,291 916,287 925,284 925,280 888,264 822,242 749,232 Z M132,221 132,225 179,263 216,281 216,298 208,302 208,306 231,313 255,324 371,409 414,434 440,433 470,443 513,450 550,451 562,447 597,447 595,442 524,414 515,408 478,408 417,385 392,357 386,345 353,299 304,271 163,232 157,222 Z M1046,174 1039,174 1039,178 1045,184 1052,200 1088,212 1103,227 1113,229 1126,245 1131,261 1131,278 1127,282 1127,295 1107,296 1089,311 1089,316 1093,316 1151,365 1156,372 1156,389 1072,389 1011,395 943,434 927,452 890,512 884,513 884,521 844,580 800,603 711,665 698,679 698,685 704,693 740,711 754,714 755,717 775,727 779,727 821,755 834,761 898,814 922,824 951,827 976,825 969,733 966,730 851,688 845,688 845,670 966,591 997,581 1008,580 1018,575 1034,575 1035,592 1033,598 1037,598 1065,571 1066,565 1073,565 1075,563 1092,563 1104,579 1103,601 1120,601 1124,608 1134,611 1134,603 1131,603 1128,597 1119,593 1113,581 1109,561 1102,546 1102,529 1118,516 1134,516 1159,573 1159,590 1148,591 1148,598 1152,599 1160,614 1162,623 1165,624 1166,632 1170,633 1172,644 1189,644 1203,678 1210,680 1220,654 1215,611 1213,557 1234,537 1253,523 1302,521 1301,516 1246,498 1209,492 1181,492 1180,475 1214,461 1243,454 1266,454 1288,459 1304,456 1305,450 1294,434 1294,417 1307,400 1314,395 1314,390 1307,379 1291,365 1290,360 1251,325 1251,311 1241,298 1220,298 1214,291 1208,289 1206,278 1200,271 1188,270 1185,271 1184,277 1167,277 1147,269 1144,266 1143,235 1140,228 1125,220 1114,220 1112,208 1101,208 1097,204 1089,203 1086,194 Z M827,640 827,624 849,604 869,604 891,609 891,626 884,635 861,648 845,648 Z M1147,467 1147,483 1137,489 1098,519 1079,519 1081,491 1088,483 1116,465 Z M1190,346 1207,345 1215,347 1216,349 1273,369 1275,372 1291,378 1299,385 1299,401 1288,413 1259,411 1255,412 1254,416 1234,416 1233,408 1221,404 1221,399 1208,386 1190,362 Z","sideB":"M134,389 134,395 148,407 154,418 154,434 144,448 143,455 151,458 160,458 179,454 205,454 246,465 270,476 269,493 225,494 195,500 148,516 148,520 195,523 234,557 232,614 227,656 236,680 243,678 260,637 267,627 277,598 286,597 288,571 299,545 303,541 303,536 312,516 329,516 345,529 345,547 335,573 334,581 328,594 318,600 316,609 323,608 327,601 343,601 342,579 356,561 383,562 384,572 407,596 411,596 412,575 430,575 479,590 603,671 602,688 596,688 528,712 479,732 471,823 473,825 515,825 528,823 558,807 614,760 647,742 668,726 687,719 692,714 707,711 720,703 740,695 749,686 747,675 727,658 658,610 632,595 611,586 602,579 556,511 523,456 508,437 439,396 397,391 291,390 290,373 294,367 357,314 357,310 341,297 320,297 319,282 314,278 314,272 310,272 306,268 301,268 279,278 260,278 258,273 245,275 244,291 233,293 228,298 227,308 210,308 209,301 205,301 198,310 198,325 162,356 155,367 144,375 Z M555,608 576,604 598,604 620,624 620,640 603,648 585,648 563,635 555,625 Z M299,467 302,465 331,465 358,482 364,488 368,498 369,520 351,521 300,484 Z M257,346 257,362 252,372 228,399 227,405 216,408 216,414 213,417 208,417 207,425 191,425 190,413 187,411 158,413 149,405 147,400 147,384 153,379 195,360 234,346 Z M712,233 702,232 618,244 528,278 526,283 532,283 533,290 540,294 551,306 551,322 534,323 518,313 502,297 498,297 490,307 490,311 496,315 496,331 483,332 483,336 507,340 507,358 524,355 551,355 553,357 553,373 524,379 508,379 497,375 497,365 481,370 481,374 501,385 554,392 554,408 544,413 544,429 547,429 588,498 618,544 641,556 645,556 644,549 608,462 608,445 610,443 665,423 755,402 756,386 772,386 799,399 805,399 842,383 849,373 860,366 859,359 847,336 820,309 758,260 731,242 Z M594,336 614,335 663,344 664,361 631,376 613,376 594,353 Z M1312,222 1290,223 1284,232 1276,236 1145,271 1112,288 1091,303 1048,367 1048,372 1042,373 1034,383 970,408 932,408 924,414 853,442 853,446 888,447 900,451 927,450 976,442 1009,432 1033,433 1050,425 1095,396 1186,327 1210,315 1237,307 1237,302 1229,298 1229,282 1269,261 1308,231 1312,226 Z","frontA":"M1269,503 1242,488 1204,475 1189,473 1188,476 1168,476 1167,461 1163,461 1156,466 1156,476 1153,478 1110,480 1084,485 1073,492 1063,492 1054,496 1054,510 1058,531 1073,569 1073,585 1066,586 1068,597 1088,646 1089,653 1103,654 1108,662 1110,671 1124,690 1129,690 1133,680 1139,674 1139,669 1144,662 1145,655 1152,654 1153,628 1142,627 1143,599 1160,598 1159,590 1141,589 1141,547 1166,525 1190,509 1204,507 1270,508 Z M911,271 905,260 900,259 896,262 888,262 871,268 860,274 844,274 829,268 824,259 818,259 777,277 755,290 750,290 743,294 727,294 726,277 729,274 745,267 748,263 758,261 811,237 812,228 818,219 833,211 853,211 852,199 803,184 790,184 739,174 713,176 665,197 628,232 597,267 576,296 562,320 562,337 565,345 576,358 579,358 590,367 595,367 684,313 701,313 712,317 735,317 781,310 797,310 798,327 803,327 806,325 806,316 810,312 850,307 875,301 879,298 911,292 Z M191,167 191,173 237,221 238,239 234,242 234,247 261,267 342,351 378,384 414,392 462,407 497,413 548,409 548,405 482,370 479,364 444,362 376,333 371,328 365,307 365,290 345,243 329,227 308,214 228,184 222,180 221,166 Z M960,121 951,121 946,128 946,135 952,146 960,146 997,168 1016,176 1034,197 1034,213 1025,214 1022,235 1015,248 964,263 945,280 945,284 948,287 951,287 975,307 1018,347 1018,363 957,363 882,373 880,376 875,376 853,389 820,412 755,512 749,527 727,564 712,578 707,579 703,585 692,591 677,606 661,616 643,633 640,633 636,639 627,644 609,662 609,674 615,682 641,698 658,698 659,708 675,721 743,756 875,842 918,846 918,842 867,734 732,685 721,685 720,688 708,691 707,693 691,693 690,676 704,670 711,670 712,666 731,659 756,645 816,600 852,576 882,567 944,555 952,545 955,545 968,530 977,524 1016,487 1044,467 1068,455 1097,446 1128,441 1165,441 1166,457 1170,457 1187,446 1208,446 1239,451 1277,447 1278,439 1264,417 1264,401 1284,381 1276,341 1235,287 1220,274 1215,256 1207,253 1207,248 1200,240 1193,238 1193,242 1205,256 1207,279 1190,280 1178,276 1177,271 1163,257 1156,254 1149,245 1087,194 1061,176 1057,176 1047,169 1041,169 1038,164 977,131 967,130 966,126 Z M1018,451 1018,467 1009,471 991,485 984,486 982,492 975,493 973,502 963,507 945,506 944,471 976,447 998,447 Z M1066,319 1083,318 1148,333 1196,347 1229,360 1230,367 1250,367 1254,371 1254,387 1250,391 1243,391 1243,397 1235,404 1216,404 1192,397 1159,402 1142,402 1127,397 1125,389 1112,386 1066,335 Z","frontB":"M778,727 761,717 760,714 744,708 722,694 712,694 572,739 564,749 552,777 518,842 518,846 520,848 562,846 704,762 708,762 721,753 778,731 Z M170,507 168,514 198,513 215,510 252,512 279,530 300,549 301,569 299,582 292,584 292,591 289,596 278,596 278,600 281,601 281,617 296,618 295,661 309,691 315,691 324,675 328,672 330,662 338,649 349,649 375,589 375,584 369,583 369,566 385,531 388,500 376,492 328,481 304,479 303,471 292,462 288,462 287,476 267,477 266,474 258,474 234,479 197,492 Z M534,268 535,293 558,294 565,296 567,299 629,316 643,323 685,355 703,356 703,352 683,336 648,316 648,298 669,298 752,311 780,325 844,364 853,363 878,343 880,331 878,312 851,269 814,225 783,194 771,186 754,178 723,168 680,168 626,180 596,192 590,192 588,205 607,205 620,208 631,218 632,232 635,235 689,263 697,265 700,269 718,279 717,298 700,298 690,292 683,292 679,287 626,258 620,258 609,270 593,270 565,257 543,254 539,256 Z M1275,154 1272,154 1269,150 1245,151 1245,168 1243,170 1163,202 1150,205 1109,235 1098,263 1085,287 1085,299 1082,303 1082,312 1076,321 1076,327 1067,334 1006,361 965,363 963,368 944,379 891,405 891,409 925,409 947,414 997,405 1033,393 1041,393 1068,385 1081,375 1187,267 1225,242 1225,238 1220,234 1220,218 1252,188 1275,159 Z M167,337 164,365 158,375 158,379 181,398 181,415 168,437 168,445 199,451 246,445 264,445 287,458 291,458 292,444 312,444 356,455 382,466 409,483 496,559 503,559 523,567 544,569 546,572 574,576 576,579 590,582 689,653 736,678 796,705 802,705 822,690 832,679 833,672 831,668 819,656 781,624 775,616 714,568 694,530 690,517 687,515 649,445 632,417 623,409 565,373 492,365 422,364 422,348 460,312 494,286 497,282 497,277 481,265 463,257 423,254 422,240 419,232 419,211 403,211 403,234 390,243 371,243 370,213 379,208 406,208 406,194 432,168 471,141 495,141 497,129 494,128 491,121 481,121 479,127 469,128 412,161 409,168 401,169 388,176 350,204 297,250 296,257 286,258 284,264 276,266 270,274 259,278 241,278 240,261 243,258 244,251 235,252 231,260 230,274 223,275 Z M420,455 460,452 490,474 491,510 489,512 472,512 460,505 450,492 444,490 439,486 439,483 432,481 429,476 424,475 420,471 Z M376,320 375,339 362,350 329,386 318,387 315,391 314,400 284,402 265,397 251,396 241,397 230,402 212,402 202,395 202,386 191,386 189,384 190,367 207,367 208,378 214,378 214,360 223,355 268,340 295,333 305,333 315,328 326,328 328,325 355,319 Z"};
const AX_POLYS=[[[0,36],[33.8,2],[45.4,2],[70,27.6],[61.4,36],[44.4,36],[53.4,27],[40.4,13.4],[17.8,36]],[[50.6,2],[65,2],[98.2,36],[82.8,36]],[[83.6,0],[100,0],[83.6,16.2],[74.6,8.2]]];
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const stage=$("#stage"),stageScroll=$("#stageScroll"),bikeImg=$("#bikeImg"),svg=$("#designSvg"),objectsLayer=$("#objectsLayer"),selectionLayer=$("#selectionLayer"),imageMissing=$("#imageMissing"),missingFile=$("#missingFile"),imageStatus=$("#imageStatus");
let state={body:"black",view:"frontA",tool:"select",zoom:1,maskEnabled:true,selected:null,objects:{sideA:[],sideB:[],frontA:[],frontB:[]}};
let history=[],future=[],drag=null,drawing=null,seq=1;
let controlEdit=null;
function beginControlEdit(id){const o=selectedObj();if(!o)return;if(controlEdit?.id===id&&controlEdit.objectId===o.id)return;if(controlEdit)finishControlEdit();snapshot();controlEdit={id,objectId:o.id,base:clone(o)}}
function finishControlEdit(){controlEdit=null;const input=$("#sizeInput");if(input){input.value=100;$("#sizeValue").textContent="100%"}}

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
function serializableState(){return{body:state.body,view:state.view,zoom:state.zoom,maskEnabled:state.maskEnabled,objects:clone(state.objects)}}
function snapshot(){history.push(JSON.stringify(serializableState()));if(history.length>60)history.shift();future=[];updateHistoryButtons()}
function restore(raw){finishControlEdit();const p=JSON.parse(raw);state.body=p.body||"black";state.view=p.view||"frontA";state.zoom=p.zoom||1;state.maskEnabled=p.maskEnabled!==false;state.objects=p.objects||{sideA:[],sideB:[],frontA:[],frontB:[]};for(const k of Object.keys(PAIR_MAP))if(!state.objects[k])state.objects[k]=[];state.selected=null;syncBodyButtons();syncViewButtons();syncZoomButtons();loadBikeImage();render()}
function updateHistoryButtons(){$("#undoBtn").disabled=history.length===0;$("#redoBtn").disabled=future.length===0}
function toast(m){const t=$("#toast");t.textContent=m;t.hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.hidden=true,1800)}
function svgEl(tag,attrs={}){const e=document.createElementNS(NS,tag);for(const[k,v]of Object.entries(attrs))e.setAttribute(k,v);return e}
function bbox(o){if(["rect","stripe","circle","image"].includes(o.type))return{x:o.x-o.w/2,y:o.y-o.h/2,w:o.w,h:o.h};if(o.type==="text"){const w=Math.max(o.size*.8,(o.text||"AXVELL").length*o.size*.58);return{x:o.x-w/2,y:o.y-o.size*.6,w,h:o.size*1.2}}if(o.type==="ax")return{x:o.x-o.size/2,y:o.y-o.size*.2,w:o.size,h:o.size*.4};if(o.type==="draw"&&o.points.length){const xs=o.points.map(p=>p.x),ys=o.points.map(p=>p.y),x=Math.min(...xs),y=Math.min(...ys);return{x,y,w:Math.max(...xs)-x,h:Math.max(...ys)-y}}return{x:0,y:0,w:0,h:0}}
function createObjectElement(o){let e=null;if(o.type==="rect"||o.type==="stripe")e=svgEl("rect",{x:-o.w/2,y:-o.h/2,width:o.w,height:o.h,fill:o.color,opacity:o.opacity,transform:`translate(${o.x} ${o.y}) rotate(${o.rot})`});else if(o.type==="circle")e=svgEl("ellipse",{cx:0,cy:0,rx:o.w/2,ry:o.h/2,fill:o.color,opacity:o.opacity,transform:`translate(${o.x} ${o.y}) rotate(${o.rot})`});else if(o.type==="text"){e=svgEl("text",{x:o.x,y:o.y,fill:o.color,opacity:o.opacity,"font-size":o.size,"font-family":"Arial,sans-serif","font-weight":"800","text-anchor":"middle","dominant-baseline":"middle",transform:`rotate(${o.rot} ${o.x} ${o.y})`});e.textContent=o.text||"AXVELL"}else if(o.type==="ax"){e=svgEl("g",{opacity:o.opacity,transform:`translate(${o.x-o.size/2} ${o.y-o.size*.18}) rotate(${o.rot} ${o.size/2} ${o.size*.18}) scale(${o.size/100})`});AX_POLYS.forEach(poly=>e.appendChild(svgEl("polygon",{points:poly.map(p=>p.join(",")).join(" "),fill:o.color})))}else if(o.type==="draw")e=svgEl("polyline",{points:o.points.map(p=>`${p.x},${p.y}`).join(" "),fill:"none",stroke:o.color,"stroke-width":o.width,"stroke-linecap":"round","stroke-linejoin":"round",opacity:o.opacity});else if(o.type==="image")e=svgEl("image",{x:-o.w/2,y:-o.h/2,width:o.w,height:o.h,href:o.data,opacity:o.opacity,preserveAspectRatio:"xMidYMid meet",transform:`translate(${o.x} ${o.y}) rotate(${o.rot})`});if(!e)return null;e.dataset.id=o.id;e.classList.add("design-object");e.addEventListener("pointerdown",objectPointerDown);return e}
function render(){objectsLayer.replaceChildren();currentObjects().forEach(o=>{const e=createObjectElement(o);if(e)objectsLayer.appendChild(e)});applyFairingMask();selectionLayer.replaceChildren();const o=selectedObj();if(o){const b=bbox(o);selectionLayer.appendChild(svgEl("rect",{x:b.x,y:b.y,width:b.w,height:b.h,class:"sel-box"}))}$("#selectedType").textContent=o?o.type.toUpperCase():"NONE";$("#textRow").hidden=o?.type!=="text";$("#modeText").textContent=state.tool.toUpperCase()+" MODE";$("#viewLabel").textContent=`${state.body.toUpperCase()} / ${VIEW_LABELS[state.view]}`;updateBaseSlotLabel();updateControls()}
function syncLayerControls(){
  const o=selectedObj();
  const disabled=!o;
  ["#sendBackBtn","#bringFrontBtn","#lockBtn"].forEach(sel=>{const b=$(sel);if(b)b.disabled=disabled});
  const lb=$("#lockBtn");
  if(lb){lb.classList.toggle("active",Boolean(o?.locked));lb.textContent=o?.locked?"UNLOCK":"LOCK";lb.setAttribute("aria-pressed",o?.locked?"true":"false")}
}
function updateControls(){const o=selectedObj();syncLayerControls();if(!o)return;$("#colorInput").value=o.color||"#76ff00";$("#rotateInput").value=o.rot||0;$("#rotateValue").textContent=(o.rot||0)+"°";$("#opacityInput").value=Math.round((o.opacity??1)*100);$("#opacityValue").textContent=$("#opacityInput").value+"%";if(controlEdit?.id!=="sizeInput"){$("#sizeInput").value=100;$("#sizeValue").textContent="100%"};if(o.type==="text")$("#textInput").value=o.text||""}
function setImageStatus(text,type=""){imageStatus.textContent=text;imageStatus.className="status-dot "+type}
function syncMaskButton(){
  const b=$("#maskBtn");if(!b)return;
  b.textContent=state.maskEnabled?"MASK ON":"MASK OFF";
  b.classList.toggle("mask-on",state.maskEnabled);
  b.classList.toggle("mask-off",!state.maskEnabled);
  b.setAttribute("aria-pressed",state.maskEnabled?"true":"false");
}
function applyFairingMask(){
  let defs=$("#fairingMaskDefs",svg);
  if(!defs){defs=svgEl("defs",{id:"fairingMaskDefs"});svg.insertBefore(defs,objectsLayer)}
  defs.replaceChildren();
  const clip=svgEl("clipPath",{id:"fairingClip",clipPathUnits:"userSpaceOnUse"});
  const path=svgEl("path",{d:FAIRING_MASKS[state.view]||"",fill:"#fff","fill-rule":"evenodd","clip-rule":"evenodd"});
  clip.appendChild(path);defs.appendChild(clip);
  if(state.maskEnabled)objectsLayer.setAttribute("clip-path","url(#fairingClip)");
  else objectsLayer.removeAttribute("clip-path");
  syncMaskButton();
}
function loadBikeImage(){
  const webSrc=IMAGE_MAP[state.body][state.view];
  const localSrc=importedBases[baseKey()];
  const src=localSrc||`${webSrc}?v=${ASSET_VERSION}`;
  imageMissing.hidden=true;
  setImageStatus(localSrc?"IMAGE: LOCAL":"IMAGE: LOADING",localSrc?"ok":"");
  bikeImg.onload=()=>{imageMissing.hidden=true;imageMissing.style.display="none";bikeImg.style.display="block";setImageStatus(localSrc?"IMAGE: LOCAL":"IMAGE: OK","ok");updateBaseSlotLabel()};
  bikeImg.onerror=()=>{imageMissing.hidden=false;imageMissing.style.display="flex";bikeImg.style.display="none";missingFile.textContent=webSrc;setImageStatus("IMAGE: MISSING","warn");updateBaseSlotLabel()};
  bikeImg.src=src;
}
function svgPoint(evt){const pt=svg.createSVGPoint();pt.x=evt.clientX;pt.y=evt.clientY;const m=svg.getScreenCTM();if(!m)return{x:0,y:0};return pt.matrixTransform(m.inverse())}
function setTool(t){finishControlEdit();state.tool=t;$$("[data-tool]").forEach(b=>b.classList.toggle("active",b.dataset.tool===t));render()}
function addObject(type,p){snapshot();let o={id:uid(),type,x:p.x,y:p.y,color:$("#colorInput").value,opacity:1,rot:0};if(type==="stripe")Object.assign(o,{w:430,h:65,rot:-15});if(type==="rect")Object.assign(o,{w:300,h:180});if(type==="circle")Object.assign(o,{w:200,h:200});if(type==="text")Object.assign(o,{size:95,text:"AXVELL"});if(type==="ax")Object.assign(o,{size:240});currentObjects().push(o);state.selected=o.id;setTool("select");render()}
function objectPointerDown(e){if(state.tool!=="select")return;e.preventDefault();e.stopPropagation();finishControlEdit();state.selected=e.currentTarget.dataset.id;const o=selectedObj();if(!o)return;if(o.locked){render();toast("LOCKED");return}snapshot();const p=svgPoint(e);drag={id:o.id,start:p,origX:o.x,origY:o.y,points:o.type==="draw"?clone(o.points):null};e.currentTarget.setPointerCapture?.(e.pointerId);render()}
svg.addEventListener("pointerdown",e=>{e.preventDefault();const p=svgPoint(e);if(state.tool==="draw"){snapshot();const o={id:uid(),type:"draw",color:$("#colorInput").value,opacity:1,width:18,points:[p]};currentObjects().push(o);state.selected=o.id;drawing=o;render();return}if(state.tool==="stripe")return addObject("stripe",p);if(state.tool==="block")return addObject("rect",p);if(state.tool==="circle")return addObject("circle",p);if(state.tool==="text")return addObject("text",p);if(state.tool==="ax")return addObject("ax",p);if(e.target===svg){state.selected=null;render()}});
svg.addEventListener("pointermove",e=>{e.preventDefault();const p=svgPoint(e);if(drawing){drawing.points.push(p);render();return}if(!drag)return;const o=currentObjects().find(x=>x.id===drag.id);if(!o)return;const dx=p.x-drag.start.x,dy=p.y-drag.start.y;if(o.type==="draw")o.points=drag.points.map(q=>({x:q.x+dx,y:q.y+dy}));else{o.x=drag.origX+dx;o.y=drag.origY+dy}render()});
function endPointer(){drag=null;drawing=null}svg.addEventListener("pointerup",endPointer);svg.addEventListener("pointercancel",endPointer);
$$("[data-tool]").forEach(b=>b.addEventListener("click",()=>setTool(b.dataset.tool)));
$$("[data-body]").forEach(b=>b.addEventListener("click",()=>{state.body=b.dataset.body;syncBodyButtons();loadBikeImage();render()}));
$$("[data-view]").forEach(b=>b.addEventListener("click",()=>{finishControlEdit();state.view=b.dataset.view;state.selected=null;syncViewButtons();loadBikeImage();render()}));
$$("[data-zoom]").forEach(b=>b.addEventListener("click",()=>{state.zoom=Number(b.dataset.zoom);syncZoomButtons()}));
function syncBodyButtons(){$$("[data-body]").forEach(b=>b.classList.toggle("active",b.dataset.body===state.body))}
function syncViewButtons(){$$("[data-view]").forEach(b=>b.classList.toggle("active",b.dataset.view===state.view))}
function syncZoomButtons(){stage.style.width=(state.zoom*100)+"%";$$("[data-zoom]").forEach(b=>b.classList.toggle("active",Number(b.dataset.zoom)===state.zoom));if(state.zoom===1)stageScroll.scrollLeft=0}
$("#colorInput").addEventListener("input",e=>{const o=selectedObj();if(o){beginControlEdit("colorInput");o.color=e.target.value;render()}});
$$("[data-color]").forEach(b=>b.addEventListener("click",()=>{const c=b.dataset.color;$("#colorInput").value=c;const o=selectedObj();if(o){snapshot();o.color=c;render()}}));
$("#textInput").addEventListener("input",e=>{const o=selectedObj();if(o?.type==="text"){beginControlEdit("textInput");o.text=e.target.value;render()}});
$("#rotateInput").addEventListener("input",e=>{const o=selectedObj();if(o&&o.type!=="draw"){beginControlEdit("rotateInput");o.rot=Number(e.target.value);$("#rotateValue").textContent=e.target.value+"°";render()}});
$("#opacityInput").addEventListener("input",e=>{const o=selectedObj();if(o){beginControlEdit("opacityInput");o.opacity=Number(e.target.value)/100;$("#opacityValue").textContent=e.target.value+"%";render()}});
$("#sizeInput").addEventListener("input",e=>{const o=selectedObj();if(!o)return;beginControlEdit("sizeInput");const base=controlEdit.base,f=Number(e.target.value)/100;if(["rect","stripe","circle","image"].includes(o.type)){o.w=base.w*f;o.h=base.h*f}else if(o.type==="text"||o.type==="ax")o.size=base.size*f;else if(o.type==="draw")o.width=Math.max(2,base.width*f);render();$("#sizeValue").textContent=e.target.value+"%"});
["colorInput","textInput","rotateInput","opacityInput","sizeInput"].forEach(id=>{const input=$("#"+id);input.addEventListener("change",finishControlEdit);input.addEventListener("blur",finishControlEdit)});
$("#sendBackBtn").addEventListener("click",()=>{
  const o=selectedObj();if(!o)return;snapshot();
  const arr=currentObjects(),i=arr.findIndex(x=>x.id===o.id);if(i>0){arr.splice(i,1);arr.unshift(o)}render()
});
$("#bringFrontBtn").addEventListener("click",()=>{
  const o=selectedObj();if(!o)return;snapshot();
  const arr=currentObjects(),i=arr.findIndex(x=>x.id===o.id);if(i>=0&&i<arr.length-1){arr.splice(i,1);arr.push(o)}render()
});
$("#lockBtn").addEventListener("click",()=>{
  const o=selectedObj();if(!o)return;snapshot();o.locked=!o.locked;render();toast(o.locked?"位置をロックしました":"ロック解除しました")
});
$("#duplicateBtn").addEventListener("click",()=>{const o=selectedObj();if(!o)return;snapshot();const n=clone(o);delete n._scaleBase;n.locked=false;n.id=uid();if(n.type==="draw")n.points=n.points.map(p=>({x:p.x+30,y:p.y+30}));else{n.x+=30;n.y+=30}currentObjects().push(n);state.selected=n.id;render()});
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
$("#maskBtn").addEventListener("click",()=>{state.maskEnabled=!state.maskEnabled;render();toast(state.maskEnabled?"カウルマスク ON":"カウルマスク OFF")});
$("#clearBasesBtn").addEventListener("click",()=>{
  importedBases={};
  localStorage.removeItem("axvellBaseImagesV6");
  loadBikeImage();render();toast("ローカル画像をリセットしました");
});
$("#undoBtn").addEventListener("click",()=>{if(!history.length)return;future.push(JSON.stringify(serializableState()));restore(history.pop());updateHistoryButtons()});
$("#redoBtn").addEventListener("click",()=>{if(!future.length)return;history.push(JSON.stringify(serializableState()));restore(future.pop());updateHistoryButtons()});
$("#saveBtn").addEventListener("click",()=>{try{localStorage.setItem("axvellDirectDesignerV6",JSON.stringify(serializableState()));toast("保存しました")}catch(err){console.warn(err);toast("保存容量を超えました。画像を減らして再保存してください")}});
$("#exportBtn").addEventListener("click",async()=>{if(!bikeImg.complete||!bikeImg.naturalWidth){toast("車体画像を読み込めません");return}state.selected=null;render();try{const canvas=document.createElement("canvas");canvas.width=VIEW_W;canvas.height=VIEW_H;const ctx=canvas.getContext("2d");ctx.drawImage(bikeImg,0,0,VIEW_W,VIEW_H);const exportSvg=svg.cloneNode(true);exportSvg.querySelector("#selectionLayer")?.remove();const blob=new Blob([new XMLSerializer().serializeToString(exportSvg)],{type:"image/svg+xml"});const url=URL.createObjectURL(blob);const overlay=new Image();overlay.src=url;await overlay.decode();ctx.drawImage(overlay,0,0,VIEW_W,VIEW_H);URL.revokeObjectURL(url);const a=document.createElement("a");a.href=canvas.toDataURL("image/png",1);a.download=`AXVELL_ZX4R_${state.body}_${state.view}.png`;a.click();toast("PNGを書き出しました")}catch(err){console.error(err);toast("PNG書き出しに失敗しました")}});
const saved=localStorage.getItem("axvellDirectDesignerV6");if(saved){try{const p=JSON.parse(saved);state.body=p.body||state.body;state.view=p.view||state.view;state.zoom=p.zoom||1;state.maskEnabled=p.maskEnabled!==false;state.objects=p.objects||state.objects;for(const k of Object.keys(PAIR_MAP))if(!state.objects[k])state.objects[k]=[]}catch(e){console.warn(e)}}syncBodyButtons();syncViewButtons();syncZoomButtons();updateHistoryButtons();loadBikeImage();render();