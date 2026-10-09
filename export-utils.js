// Browser-only output helpers. No image upload or external conversion service.
const PanelOutput = (() => {
  const encoder = new TextEncoder();
  const crcTable = Uint32Array.from({ length: 256 }, (_, n) => {
    for (let i = 0; i < 8; i++) n = (n & 1) ? 0xedb88320 ^ (n >>> 1) : n >>> 1;
    return n >>> 0;
  });
  function crc32(bytes) {
    let crc = 0xffffffff;
    for (const byte of bytes) crc = crcTable[(crc ^ byte) & 255] ^ (crc >>> 8);
    return (crc ^ 0xffffffff) >>> 0;
  }
  function concat(parts) {
    const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
    let offset = 0;
    for (const part of parts) { out.set(part, offset); offset += part.length; }
    return out;
  }
  function dimensions(bounds, widthMm, dpi = 300) {
    const width = Number(widthMm);
    if (!Number.isFinite(bounds.w) || !Number.isFinite(bounds.h) || bounds.w <= 0 || bounds.h <= 0) throw Error("輪郭のサイズを確認してください");
    if (widthMm !== "" && widthMm != null && (!Number.isFinite(width) || width <= 0 || width > 1000)) throw Error("印刷幅は0より大きく、1000mm以下で入力してください");
    if (![150, 300].includes(Number(dpi))) throw Error("解像度を確認してください");
    const heightMm = width > 0 ? width * bounds.h / bounds.w : null;
    const pixelW = width > 0 ? Math.max(1, Math.round(width / 25.4 * dpi)) : bounds.w;
    const pixelH = width > 0 ? Math.max(1, Math.round(heightMm / 25.4 * dpi)) : bounds.h;
    if (pixelW > 12000 || pixelH > 12000 || pixelW * pixelH > 40000000) throw Error("出力が大きすぎます。印刷幅を小さくするか150dpiを選んでください");
    return { widthMm: width > 0 ? width : null, heightMm, pixelW, pixelH, dpi: width > 0 ? Number(dpi) : 96 };
  }
  function pngResolution(bytes, dpi) {
    if (bytes.length < 8 || bytes[0] !== 137 || bytes[1] !== 80 || bytes[2] !== 78 || bytes[3] !== 71) throw Error("PNGを読み込めませんでした");
    const payload = new Uint8Array(9), pv = new DataView(payload.buffer);
    const ppm = Math.round(dpi / .0254);
    pv.setUint32(0, ppm); pv.setUint32(4, ppm); payload[8] = 1;
    const type = encoder.encode("pHYs"), chunk = new Uint8Array(21), cv = new DataView(chunk.buffer);
    cv.setUint32(0, 9); chunk.set(type, 4); chunk.set(payload, 8); cv.setUint32(17, crc32(chunk.subarray(4, 17)));
    const parts = [bytes.subarray(0, 8)]; let offset = 8, inserted = false;
    while (offset < bytes.length) {
      if (offset + 12 > bytes.length) throw Error("PNGデータが不完全です");
      const length = new DataView(bytes.buffer, bytes.byteOffset + offset, 4).getUint32(0);
      const end = offset + length + 12;
      if (end > bytes.length) throw Error("PNGデータが不完全です");
      const name = String.fromCharCode(...bytes.subarray(offset + 4, offset + 8));
      if (name === "IDAT" && !inserted) { parts.push(chunk); inserted = true; }
      if (name !== "pHYs") parts.push(bytes.subarray(offset, end));
      offset = end;
    }
    if (!inserted) throw Error("PNG画像データがありません");
    return concat(parts);
  }
  function zip(files) {
    const local = [], directory = []; let offset = 0, directorySize = 0;
    for (const { name, bytes } of files) {
      const filename = encoder.encode(name), crc = crc32(bytes);
      if (filename.length > 65535 || bytes.length > 0xffffffff) throw Error("ファイルが大きすぎます");
      const header = new Uint8Array(30 + filename.length), h = new DataView(header.buffer);
      h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x800, true); h.setUint16(12, 33, true);
      h.setUint32(14, crc, true); h.setUint32(18, bytes.length, true); h.setUint32(22, bytes.length, true); h.setUint16(26, filename.length, true); header.set(filename, 30);
      local.push(header, bytes);
      const entry = new Uint8Array(46 + filename.length), e = new DataView(entry.buffer);
      e.setUint32(0, 0x02014b50, true); e.setUint16(4, 20, true); e.setUint16(6, 20, true); e.setUint16(8, 0x800, true); e.setUint16(14, 33, true);
      e.setUint32(16, crc, true); e.setUint32(20, bytes.length, true); e.setUint32(24, bytes.length, true); e.setUint16(28, filename.length, true); e.setUint32(42, offset, true); entry.set(filename, 46);
      directory.push(entry); directorySize += entry.length; offset += header.length + bytes.length;
    }
    if (files.length > 65535 || offset + directorySize > 0xffffffff) throw Error("まとめ保存の容量を超えました");
    const end = new Uint8Array(22), e = new DataView(end.buffer);
    e.setUint32(0, 0x06054b50, true); e.setUint16(8, files.length, true); e.setUint16(10, files.length, true); e.setUint32(12, directorySize, true); e.setUint32(16, offset, true);
    return concat([...local, ...directory, end]);
  }
  function filename(view, panel, extension) {
    const clean = value => String(value).replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 80);
    return `AXVELL_${clean(view)}_${clean(panel.id)}.${extension}`;
  }
  return { dimensions, pngResolution, zip, filename, crc32 };
})();
