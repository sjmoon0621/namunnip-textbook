/* 카드: 습곡과 단층은 어떤 힘이 만들까? — 힘의 방향과 암석의 상태에 따른 변형 (모식 단면) */
(() => {
  const root = document.getElementById("card-earth-deform");
  if (!root) return;
  const { C, F, fit, clamp } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sA = $(".amt"), oA = $(".amt-out");
  const nName = $(".nname"), nLen = $(".nlen"), nHw = $(".nhw");
  let force = "comp", state = "brittle";

  const LAY = [ // 위에서 아래로: [아래 경계 y, 색]
    [2.6, [226, 203, 150]], [3.7, [160, 166, 150]], [4.9, [200, 207, 212]], [6.2, [214, 178, 128]], [7.4, [226, 203, 150]], [99, [160, 166, 150]],
  ];
  const TOP = 1.4; // 원래 지표
  const FA = { x1: 6.4, y1: 0, x2: 9.6, y2: 9 }; // 단층면 (기울기 약 70°)
  const FL = Math.hypot(FA.x2 - FA.x1, FA.y2 - FA.y1), FD = [(FA.x2 - FA.x1) / FL, (FA.y2 - FA.y1) / FL];
  const hanging = (x, y) => { const cr = (px, py) => (FA.x2 - FA.x1) * (py - FA.y1) - (FA.y2 - FA.y1) * (px - FA.x1); return Math.sign(cr(x, y)) === Math.sign(cr(8, 3.5)); };

  function params() {
    const a = +sA.value;
    if (state === "brittle") return { kind: force === "tens" ? "normal" : "reverse", s: (force === "tens" ? 1 : -1) * 2.0 * a };
    if (force === "comp") {
      const A = 1.5 * a, k = 2 * Math.PI / 8;
      // 층의 길이를 보존하도록 수평으로 줄어드는 비율 (사인 곡선의 호 길이)
      let arc = 0; for (let i = 0; i < 400; i++) { const x = i / 400 * 8; arc += Math.sqrt(1 + (A * k * Math.sin(k * x)) ** 2) * 8 / 400; }
      return { kind: "fold", A, k, r: arc / 8 };
    }
    return { kind: "thin", f: 1 + 0.7 * a };
  }
  // 현재 화면의 점 → 변형 전 위치
  function back(x, y, P) {
    if (P.kind === "normal" || P.kind === "reverse") {
      if (hanging(x, y)) { x -= P.s * FD[0]; y -= P.s * FD[1]; }
      return [x, y, Math.abs((x - FA.x1) * FD[1] - (y - FA.y1) * FD[0])];
    }
    if (P.kind === "fold") return [8 + (x - 8) * P.r, y + P.A * Math.cos(P.k * (x - 8)), 9];
    return [8 + (x - 8) / P.f, 4.6 + (y - 4.6) * P.f - (P.f - 1) * 0.0, 9];
  }
  const hash = (i, j) => { const s = Math.sin(i * 127.1 + j * 311.7) * 43758.5453; return s - Math.floor(s); };

  const { ctx, size } = fit(cv, () => { render(); draw(); });
  const off = document.createElement("canvas");
  function render() {
    const { w, h } = size; if (!w) return;
    const dpr = Math.min(devicePixelRatio || 1, 2), bw = Math.round(w * dpr), bh = Math.round(h * dpr);
    off.width = bw; off.height = bh;
    const oc = off.getContext("2d"), img = oc.createImageData(bw, bh), d = img.data, sc = 16 / bw, P = params();
    const brittle = P.kind === "normal" || P.kind === "reverse";
    // 변형 후 지표: 단층이면 층과 같이 움직이고, 습곡·늘어남이면 지표도 같이 휜다
    for (let py = 0; py < bh; py++) for (let px = 0; px < bw; px++) {
      const X = (px + .5) * sc, Y = (py + .5) * sc, o = (py * bw + px) * 4;
      const [x, y, fd] = back(X, Y, P);
      let col;
      if (y < TOP) col = [243, 244, 239];
      else if (brittle && Math.abs(P.s) > 0.01 && Math.abs((X - FA.x1) * FD[1] - (Y - FA.y1) * FD[0]) < 0.045) col = [50, 50, 54];
      else {
        const L = LAY.find((l) => y < l[0]), base = L[1];
        const edge = LAY.some((l) => Math.abs(y - l[0]) < 0.03);
        const i = Math.floor(x / 0.3), j = Math.floor(y / 0.3);
        const dot = Math.hypot(x - (i + .5) * 0.3, y - (j + .5) * 0.3) < 0.03 && hash(i, j) < 0.5;
        const f = edge ? 0.45 : dot ? 0.8 : 1;
        col = [base[0] * f, base[1] * f, base[2] * f];
      }
      d[o] = col[0]; d[o + 1] = col[1]; d[o + 2] = col[2]; d[o + 3] = 255;
    }
    oc.putImageData(img, 0, 0);
  }

  function arrow(x0, y0, x1, y1, col, lw = 2) {
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = lw;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    const a = Math.atan2(y1 - y0, x1 - x0);
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - 8 * Math.cos(a - .45), y1 - 8 * Math.sin(a - .45)); ctx.lineTo(x1 - 8 * Math.cos(a + .45), y1 - 8 * Math.sin(a + .45)); ctx.closePath(); ctx.fill();
  }
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(off, 0, 0, w, h);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.strokeRect(.5, .5, w - 1, h - 1);
    const k = w / 16, P = params(), a = +sA.value;
    // 힘 화살표 (양옆)
    const ay = h * 0.62, L = 16 + 18 * a;
    if (force === "comp") { arrow(4, ay, 4 + L, ay, C.warn, 3); arrow(w - 4, ay, w - 4 - L, ay, C.warn, 3); }
    else { arrow(4 + L, ay, 4, ay, C.warn, 3); arrow(w - 4 - L, ay, w - 4, ay, C.warn, 3); }
    ctx.font = `600 11px ${F.sans}`; ctx.fillStyle = C.warn;
    ctx.fillStyle = "rgba(251,251,248,.85)"; ctx.fillRect(4, ay - 24, 44, 16); ctx.fillStyle = C.warn; ctx.fillText(force === "comp" ? "압축력" : "장력", 7, ay - 12);
    ctx.font = `600 12px ${F.sans}`; ctx.fillStyle = C.ink;
    if (P.kind === "normal" || P.kind === "reverse") {
      // 상반·하반 표시와 상대 운동
      const mx = (FA.x1 + FA.x2) / 2 * k, my = h * 0.55;
      ctx.textAlign = "center";
      ctx.fillText("상반", mx + 60, h - 14); ctx.fillText("하반", mx - 70, h - 14);
      if (Math.abs(P.s) > 0.05) {
        const nx = -FD[1], ny = FD[0], sg = Math.sign(P.s);
        const fx = mx + FD[0] * 0, fy = my;
        arrow(fx - nx * 10 - FD[0] * 14 * sg, fy - ny * 10 - FD[1] * 14 * sg, fx - nx * 10 + FD[0] * 14 * sg, fy - ny * 10 + FD[1] * 14 * sg, C.ink, 1.6);
        arrow(fx + nx * 10 + FD[0] * 14 * sg, fy + ny * 10 + FD[1] * 14 * sg, fx + nx * 10 - FD[0] * 14 * sg, fy + ny * 10 - FD[1] * 14 * sg, C.ink, 1.6);
      }
      ctx.textAlign = "left";
    } else if (P.kind === "fold" && a > 0.15) {
      ctx.textAlign = "center";
      const yTop = (x) => (TOP - P.A * Math.cos(P.k * (x - 8))) * k;
      ctx.fillText("배사", 8 * k, Math.max(14, yTop(8) - 8));
      ctx.fillText("향사", 4 * k, yTop(4) - 8); ctx.fillText("향사", 12 * k, yTop(12) - 8);
      ctx.textAlign = "left";
    }
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3;
    ctx.fillText(state === "brittle" ? "얕은 곳 · 차가운 암석 (모식)" : "깊은 곳 · 뜨거운 암석 (모식)", 6, 14);
  }

  function update() {
    const P = params(), a = +sA.value;
    oA.textContent = `${Math.round(a * 100)}%`;
    let name, len, hw;
    if (P.kind === "normal") { name = "정단층"; len = P.s * FD[0] / 16; hw = a > 0 ? "아래로" : "—"; }
    else if (P.kind === "reverse") { name = "역단층"; len = P.s * FD[0] / 16; hw = a > 0 ? "위로" : "—"; }
    else if (P.kind === "fold") { name = "습곡"; len = 1 / P.r - 1; hw = "해당 없음"; }
    else { name = "늘어나며 얇아짐"; len = P.f - 1; hw = "해당 없음"; }
    if (a === 0) name = "변형 없음";
    nName.textContent = name;
    nLen.textContent = `${len >= 0 ? "+" : "−"}${Math.abs(len * 100).toFixed(1)}%`;
    nHw.textContent = hw;
    render(); draw();
  }
  root.querySelectorAll("[data-force]").forEach((b) => b.addEventListener("click", () => {
    force = b.dataset.force; root.querySelectorAll("[data-force]").forEach((q) => q.setAttribute("aria-pressed", q === b ? "true" : "false")); update();
  }));
  root.querySelectorAll("[data-state]").forEach((b) => b.addEventListener("click", () => {
    state = b.dataset.state; root.querySelectorAll("[data-state]").forEach((q) => q.setAttribute("aria-pressed", q === b ? "true" : "false")); update();
  }));
  sA.addEventListener("input", update);
  update();
})();
