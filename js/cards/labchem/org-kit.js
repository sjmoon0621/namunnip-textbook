/* 화학 실험 4단원(탄소 화합물) 카드 공용 그림 도구 window.NMOrg — 시험관, 둥근 플라스크, 색 섞기.
   블록 머리 scripts에서 카드 스크립트보다 먼저 적는다. */
window.NMOrg = window.NMOrg || (() => {
  "use strict";
  const hex = (c) => c.replace("#", "").match(/\w\w/g).map((h) => parseInt(h, 16));
  /* 두 색 a, b(#rrggbb)를 t(0~1) 비율로 섞는다 */
  function mix(a, b, t) {
    const A = hex(a), B = hex(b), k = Math.min(1, Math.max(0, t));
    return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, "0")).join("");
  }
  const glass = (ctx, cx, top, bot, r) => {
    ctx.beginPath(); ctx.moveTo(cx - r, top); ctx.lineTo(cx - r, bot - r);
    ctx.arc(cx, bot - r, r, Math.PI, 0, true); ctx.lineTo(cx + r, top);
  };
  /* 시험관. layers: 아래부터 [{f: 관 높이에 대한 비율, col}]
     o: { ppt: 침전 색, pptH: 침전 높이(px), mirror: 은거울, bubbles: 기포 수, t: 시간(s), ink } */
  function tube(ctx, cx, top, bot, w, layers, o = {}) {
    const r = w / 2, H = bot - top;
    ctx.save();
    glass(ctx, cx, top, bot, r); ctx.closePath(); ctx.clip();
    let y = bot, liqTop = bot;
    for (const L of layers) {
      const hh = L.f * H;
      ctx.fillStyle = L.col; ctx.fillRect(cx - r, y - hh, w, hh + (y === bot ? 0 : 0.5));
      y -= hh; liqTop = y;
    }
    if (o.mirror) {
      const g = ctx.createLinearGradient(cx - r, 0, cx + r, 0);
      g.addColorStop(0, "#8e9399"); g.addColorStop(0.25, "#e9edf1"); g.addColorStop(0.5, "#a7adb3"); g.addColorStop(0.8, "#f4f6f8"); g.addColorStop(1, "#7d8288");
      ctx.fillStyle = g; ctx.fillRect(cx - r, liqTop, w, bot - liqTop);
    }
    if (o.ppt) {
      const ph = o.pptH || 10;
      ctx.fillStyle = o.ppt; ctx.fillRect(cx - r, bot - ph, w, ph);
      ctx.fillStyle = "rgba(0,0,0,.12)";
      for (let i = 0; i < 14; i++) { ctx.beginPath(); ctx.arc(cx - r + ((i * 7.3) % w), bot - 2 - ((i * 5.1) % ph), 1.1, 0, Math.PI * 2); ctx.fill(); }
    }
    if (o.bubbles) {
      const t = o.t || 0, span = Math.max(8, bot - liqTop - 6);
      ctx.strokeStyle = "rgba(255,255,255,.95)"; ctx.lineWidth = 1;
      for (let i = 0; i < o.bubbles; i++) {
        const yy = bot - 6 - ((t * 40 + i * 17) % span), xx = cx - r + 5 + ((i * 11) % Math.max(4, w - 10));
        ctx.beginPath(); ctx.arc(xx, yy, 1.6 + (i % 3) * 0.6, 0, Math.PI * 2); ctx.stroke();
      }
    }
    ctx.restore();
    ctx.strokeStyle = o.ink || "#5d5d61"; ctx.lineWidth = 1.5;
    glass(ctx, cx, top, bot, r); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - r - 3, top); ctx.lineTo(cx + r + 3, top); ctx.stroke();
    return { liqTop };
  }
  /* 둥근 바닥 플라스크 (중심 cx, cy, 반지름 R). 내용물 색 col, 채움 비율 f */
  function flask(ctx, cx, cy, R, col, f = 0.55, ink = "#5d5d61") {
    const nw = R * 0.32, nt = cy - R * 1.9;
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.clip();
    const ly = cy + R - 2 * R * f;
    ctx.fillStyle = col; ctx.fillRect(cx - R, ly, 2 * R, cy + R - ly);
    ctx.restore();
    ctx.strokeStyle = ink; ctx.lineWidth = 1.5;
    const a = Math.asin(nw / R);
    ctx.beginPath(); ctx.moveTo(cx - nw, nt); ctx.lineTo(cx - nw, cy - R * Math.cos(a));
    ctx.arc(cx, cy, R, -Math.PI / 2 - a, -Math.PI / 2 + a, true);
    ctx.lineTo(cx + nw, nt); ctx.stroke();
    return { neckTop: nt, nw };
  }
  return { mix, tube, flask };
})();
