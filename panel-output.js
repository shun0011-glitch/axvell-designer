// Review a frozen design snapshot before saving individual fairing artwork.
(() => {
  const settingsKey = "axvellPanelPrintSizesV1";
  let sizes = {};
  try { const raw = JSON.parse(localStorage.getItem(settingsKey) || "{}"); if (raw && typeof raw === "object" && !Array.isArray(raw)) sizes = raw; } catch {}
  const dialog = document.createElement("dialog");
  dialog.className = "panel-output-dialog";
  dialog.innerHTML = `<div class="output-heading"><div><h2 id="outputTitle">カウル別の出力確認</h2><p id="outputView"></p></div><button type="button" id="outputClose" aria-label="出力確認を閉じる">閉じる</button></div>
    <p class="output-note">写真と境界線を含まない、背景透明のデザインです。印刷幅を入力すると縦横比を保って拡大します。未入力なら元のピクセルサイズで保存します。</p>
    <div class="output-toolbar"><button type="button" id="outputAll">すべて選択</button><button type="button" id="outputNone">選択解除</button><label>PNG解像度 <select id="outputDpi"><option value="300">300 dpi</option><option value="150">150 dpi</option></select></label><span id="outputCount"></span></div>
    <div class="output-grid" id="outputGrid"></div>
    <p class="output-note">印刷幅は実測して入力してください。写真上の形を拡大する方式のため、曲面を平面へ展開した型紙にはなりません。SVGの文字は制作前にIllustratorでアウトライン化してください。</p>
    <div class="output-footer"><button type="button" id="outputZipPng">選択分のPNGをZIPにまとめる</button><button type="button" id="outputZipSvg">選択分のSVGをZIPにまとめる</button><div id="outputResult" aria-live="polite"></div></div>`;
  dialog.setAttribute("aria-labelledby", "outputTitle"); document.body.appendChild(dialog);
  const css = document.createElement("style");
  css.textContent = `.panel-output-dialog{width:min(1100px,calc(100vw - 32px));max-width:none;max-height:calc(100dvh - 32px);box-sizing:border-box;padding:24px;border:1px solid #46525b;border-radius:16px;color:#eef3f6;background:#11171b;overflow:auto}.panel-output-dialog::backdrop{background:#000b}.output-heading{display:flex;align-items:flex-start;justify-content:space-between;gap:16px}.output-heading h2{margin:0;font-size:22px}.output-heading p{color:#94a5ae;margin:6px 0}.output-note{font-size:13px;line-height:1.65;color:#afbdc5}.output-toolbar,.output-footer{display:flex;align-items:center;flex-wrap:wrap;gap:10px;margin:18px 0}.output-toolbar label{display:flex;gap:8px;align-items:center}.output-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(235px,1fr));gap:14px}.output-card{padding:14px;background:#1a2329;border:1px solid #35424a;border-radius:12px;min-width:0}.output-card>label{display:flex;align-items:center;gap:8px;font-weight:600}.output-card input[type=checkbox]{width:18px;height:18px;accent-color:#76ff00}.output-thumb{display:flex;align-items:center;justify-content:center;height:160px;margin:12px 0;background-color:#d8dde0;background-image:linear-gradient(45deg,#adb7be 25%,transparent 25%),linear-gradient(-45deg,#adb7be 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#adb7be 75%),linear-gradient(-45deg,transparent 75%,#adb7be 75%);background-size:20px 20px;background-position:0 0,0 10px,10px -10px,-10px 0;border-radius:6px;overflow:hidden}.output-thumb img{width:100%;height:100%;object-fit:contain;padding:8px;box-sizing:border-box}.output-card .output-width{display:flex;align-items:center;gap:8px;font-size:13px}.output-width input{width:95px;padding:8px;background:#10171b;color:#fff;border:1px solid #596a75;border-radius:4px}.output-size{font-size:12px;color:#b8c8d0;min-height:34px;margin:9px 0;line-height:1.5}.output-card-actions{display:flex;gap:8px;flex-wrap:wrap}.output-card-status{font-size:12px;margin-top:8px;overflow-wrap:anywhere}.panel-output-dialog button,.panel-output-dialog select{font:inherit;font-size:13px;padding:9px 12px;color:#eef3f6;background:#25313a;border:1px solid #566873;border-radius:6px;cursor:pointer}.panel-output-dialog button:disabled{opacity:.5;cursor:wait}.panel-output-dialog a{color:#98ff60;font-size:13px;display:inline-block;padding:8px}.panel-output-dialog :focus-visible{outline:2px solid #76ff00;outline-offset:3px}.output-footer{border-top:1px solid #35424a;padding-top:16px}.output-card[aria-invalid=true]{border-color:#ff7979}.output-error{color:#ff9999}@media(max-width:600px){.panel-output-dialog{padding:16px}.output-grid{grid-template-columns:1fr}.output-heading h2{font-size:19px}}`;
  document.head.appendChild(css);
  const q = selector => dialog.querySelector(selector);
  let session = null, urls = [], generation = 0, busy = false;
  const review = document.createElement("button"); review.type = "button"; review.textContent = "分割プレビュー・印刷サイズ";
  $("#panelExport").before(review);
  // The review dialog replaces the older bare download-link controls.
  $("#panelExport").hidden = true; svgButton.hidden = true; svgNote.hidden = true; $("#panelDownloads").hidden = true;
  function trackUrl(blob) { const url = URL.createObjectURL(blob); urls.push(url); return url; }
  function release() { for (const url of urls) URL.revokeObjectURL(url); urls = []; }
  function key(p) { return `${session.view}:${p.id}`; }
  function dimensions(entry) { return PanelOutput.dimensions(panelBounds(entry.panel), entry.width.value, Number(q("#outputDpi").value)); }
  function count() { q("#outputCount").textContent = `${session?.entries.filter(e => e.checkbox.checked).length || 0}カウル選択`; }
  function update(entry) {
    entry.card.removeAttribute("aria-invalid"); entry.info.classList.remove("output-error");
    try {
      const d = dimensions(entry);
      entry.info.textContent = d.widthMm ? `${d.widthMm.toFixed(1)} × ${d.heightMm.toFixed(1)} mm / ${d.pixelW} × ${d.pixelH} px` : `${d.pixelW} × ${d.pixelH} px（印刷幅未指定）`;
    } catch (error) { entry.card.setAttribute("aria-invalid", "true"); entry.info.classList.add("output-error"); entry.info.textContent = error.message; }
  }
  function rootFor(entry, printSize) {
    const root = panelExportSvg(entry.panel, session.nodes, session.view);
    if (printSize.widthMm) { root.setAttribute("width", `${printSize.widthMm}mm`); root.setAttribute("height", `${printSize.heightMm}mm`); }
    return root;
  }
  function resultLink(target, blob, name, label) {
    const link = document.createElement("a"); link.href = trackUrl(blob); link.download = name; link.textContent = label; target.replaceChildren(link);
  }
  async function output(entry, format) {
    const d = dimensions(entry), root = rootFor(entry, d);
    const source = new XMLSerializer().serializeToString(root);
    if (format === "svg") return new Blob([source], { type: "image/svg+xml" });
    const image = new Image(), url = URL.createObjectURL(new Blob([source], { type: "image/svg+xml" }));
    try {
      image.src = url; await image.decode();
      const canvas = document.createElement("canvas"); canvas.width = d.pixelW; canvas.height = d.pixelH;
      const context = canvas.getContext("2d"); if (!context) throw Error("画像を作成できませんでした");
      context.drawImage(image, 0, 0, d.pixelW, d.pixelH);
      const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/png"));
      canvas.width = canvas.height = 1;
      if (!blob) throw Error("PNGを作成できませんでした");
      return new Blob([PanelOutput.pngResolution(new Uint8Array(await blob.arrayBuffer()), d.dpi)], { type: "image/png" });
    } finally { URL.revokeObjectURL(url); }
  }
  function setBusy(value) {
    busy = value;
    for (const control of dialog.querySelectorAll("button:not(#outputClose),input,select")) control.disabled = value;
  }
  async function saveOne(entry, format) {
    if (busy) return;
    const token = generation, view = session.view; setBusy(true); entry.status.textContent = "作成中…";
    try { const blob = await output(entry, format); if (token === generation) resultLink(entry.status, blob, PanelOutput.filename(view, entry.panel, format), `${format.toUpperCase()}を保存`); }
    catch (error) { if (token === generation) entry.status.textContent = error.message; }
    finally { if (token === generation) setBusy(false); }
  }
  async function saveZip(format) {
    if (busy || !session) return;
    const entries = session.entries.filter(e => e.checkbox.checked), target = q("#outputResult");
    if (!entries.length) { target.textContent = "出力するカウルを選択してください"; return; }
    try { for (const entry of entries) dimensions(entry); } catch (error) { target.textContent = error.message; return; }
    const token = generation, view = session.view; setBusy(true);
    try {
      const files = [];
      for (const [i, entry] of entries.entries()) {
        if (token !== generation) return;
        target.textContent = `${i + 1} / ${entries.length} 作成中…`;
        const blob = await output(entry, format);
        files.push({ name: PanelOutput.filename(view, entry.panel, format), bytes: new Uint8Array(await blob.arrayBuffer()) });
      }
      if (token === generation) resultLink(target, new Blob([PanelOutput.zip(files)], { type: "application/zip" }), `AXVELL_${view}_${format}.zip`, `ZIPを保存（${files.length}カウル）`);
    } catch (error) { if (token === generation) target.textContent = error.message; }
    finally { if (token === generation) setBusy(false); }
  }
  function open() {
    if (!currentPanels().length || !currentObjects().length) { toast("カウル区分とデザインを設定してください"); return; }
    if (panelDrawing) { toast("輪郭を確定してから出力してください"); return; }
    generation++; release(); setBusy(false);
    session = { view: state.view, nodes: [...objectsLayer.children].map(n => n.cloneNode(true)), entries: [] };
    q("#outputView").textContent = state.view === "sideA" ? "SIDE A" : state.view === "sideB" ? "SIDE B" : state.view.toUpperCase();
    q("#outputGrid").replaceChildren(); q("#outputResult").replaceChildren();
    for (const p of clone(currentPanels())) {
      const card = document.createElement("article"); card.className = "output-card";
      const label = document.createElement("label"), checkbox = document.createElement("input"); checkbox.type = "checkbox"; checkbox.checked = true;
      label.append(checkbox, document.createTextNode(p.name)); card.appendChild(label);
      const thumbnail = document.createElement("div"); thumbnail.className = "output-thumb";
      const img = document.createElement("img"); img.alt = `${p.name}の分割デザイン`; thumbnail.appendChild(img); card.appendChild(thumbnail);
      const widthLabel = document.createElement("label"); widthLabel.className = "output-width"; widthLabel.appendChild(document.createTextNode("印刷幅"));
      const width = document.createElement("input"); width.type = "number"; width.min = ".1"; width.max = "1000"; width.step = ".1"; width.placeholder = "未指定"; width.setAttribute("aria-label", `${p.name}の印刷幅（mm）`);
      const setting = Number(sizes[key(p)]); width.value = Number.isFinite(setting) && setting > 0 && setting <= 1000 ? setting : "";
      widthLabel.append(width, document.createTextNode("mm")); card.appendChild(widthLabel);
      const info = document.createElement("p"); info.className = "output-size"; card.appendChild(info);
      const actions = document.createElement("div"); actions.className = "output-card-actions"; card.appendChild(actions);
      const status = document.createElement("div"); status.className = "output-card-status"; status.setAttribute("aria-live", "polite"); card.appendChild(status);
      const entry = { panel: p, card, checkbox, width, info, status }; session.entries.push(entry);
      img.src = trackUrl(new Blob([new XMLSerializer().serializeToString(panelExportSvg(p, session.nodes, session.view))], { type: "image/svg+xml" }));
      for (const format of ["png", "svg"]) { const button = document.createElement("button"); button.type = "button"; button.textContent = `${format.toUpperCase()}を作成`; button.addEventListener("click", () => saveOne(entry, format)); actions.appendChild(button); }
      checkbox.addEventListener("change", count);
      width.addEventListener("input", () => { update(entry); entry.status.replaceChildren(); q("#outputResult").replaceChildren(); });
      width.addEventListener("change", () => { try { dimensions(entry); if (width.value) sizes[key(p)] = Number(width.value); else delete sizes[key(p)]; localStorage.setItem(settingsKey, JSON.stringify(sizes)); } catch {} });
      update(entry); q("#outputGrid").appendChild(card);
    }
    count(); dialog.showModal(); q("#outputClose").focus();
  }
  review.addEventListener("click", open);
  q("#outputClose").addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", () => { generation++; setBusy(false); release(); session = null; q("#outputGrid").replaceChildren(); q("#outputResult").replaceChildren(); });
  q("#outputAll").addEventListener("click", () => { session.entries.forEach(e => e.checkbox.checked = true); count(); });
  q("#outputNone").addEventListener("click", () => { session.entries.forEach(e => e.checkbox.checked = false); count(); });
  q("#outputDpi").addEventListener("change", () => { session.entries.forEach(e => { update(e); e.status.replaceChildren(); }); q("#outputResult").replaceChildren(); });
  q("#outputZipPng").addEventListener("click", () => saveZip("png")); q("#outputZipSvg").addEventListener("click", () => saveZip("svg"));
})();
