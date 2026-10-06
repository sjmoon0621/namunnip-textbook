/* 카드: 분광기로 본 몇 줄의 빛에서 에너지 준위를 어떻게 알아낼까? — 불꽃 반응, 방전관, 손 분광기 눈금 보정, 발머 계열 분석 */
(() => {
  const root = document.getElementById("card-labchem-spectrum");
  if (!root) return;
  const { C, F, fit } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const HC = 1239.84;   // eV·nm

  /* 선: [파장 nm, 상대 세기, 띠 너비 nm(0이면 원자선)] */
  const SRC = {
    H: { name: "수소", tube: true, col: "#e27bd0", lines: [[656.3, 1], [486.1, 0.55], [434.0, 0.32], [410.2, 0.2]] },
    He: { name: "헬륨", tube: true, col: "#ffcfa8", lines: [[447.1, 0.4], [471.3, 0.15], [492.2, 0.22], [501.6, 0.4], [587.6, 1], [667.8, 0.5]] },
    Hg: { name: "수은", tube: true, col: "#aac0ff", lines: [[404.7, 0.45], [435.8, 0.85], [546.1, 1], [577.0, 0.5], [579.1, 0.5]] },
    Na: { name: "NaCl", col: "#ffb52e", lines: [[589.0, 1], [589.6, 0.6]] },
    Li: { name: "LiCl", col: "#e0263f", lines: [[670.8, 1], [610.4, 0.2], [460.3, 0.08]] },
    Sr: { name: "SrCl₂", col: "#ff3b2b", lines: [[460.7, 0.35], [606, 0.55, 5], [646, 0.5, 5], [662, 0.7, 5], [682, 0.9, 6]] },
    Cu: { name: "CuCl₂", col: "#3fd6a8", lines: [[435, 0.45, 5], [444, 0.45, 5], [510.6, 0.3], [515.3, 0.35], [521.8, 0.4], [526, 0.55, 7], [538, 0.65, 7], [552, 0.4, 6]] },
  };
  const UNK = ["Li", "Sr", "Na", "Cu", "He"][Math.floor(Math.random() * 5)];
  const BIAS = 4 + Math.random() * 4;   // 보정 안 한 눈금판의 밀림 (nm)
  const BAL = [[3, 656.28], [4, 486.13], [5, 434.05], [6, 410.17]];
  let sk = "H";
  const sCur = $(".cur");
  const src = () => SRC[sk === "X" ? UNK : sk];
  const bias = () => ($(".calib").checked ? 0 : BIAS);

  const app = fit($(".cv-wide"), () => draw());
  const pl = fit($(".cv-plot"), () => drawPlot());
  const tbl = L.table($(".tbl-host"), [
    { key: "sn", label: "광원" }, { key: "lam", label: "λ 읽음 (nm)", res: 0.5 }, { key: "E", label: "E (eV)", res: 0.001 }, { key: "n", label: "n (수소)" },
  ], () => drawPlot());

  function wlColor(l) {
    let r = 0, g = 0, b = 0;
    if (l < 440) { r = (440 - l) / 60; b = 1; } else if (l < 490) { g = (l - 440) / 50; b = 1; } else if (l < 510) { g = 1; b = (510 - l) / 20; }
    else if (l < 580) { r = (l - 510) / 70; g = 1; } else if (l < 645) { r = 1; g = (645 - l) / 65; } else r = 1;
    const f = l < 420 ? 0.35 + 0.65 * (l - 380) / 40 : l > 680 ? 0.35 + 0.65 * (750 - l) / 70 : 1;
    return [255 * r * f, 255 * g * f, 255 * b * f].map(Math.round);
  }

  function draw() {
    const { ctx } = app, { w, h } = app.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const s = src();
    // 광원
    const sx = w * 0.11, base = h * 0.82;
    if (s.tube) {
      ctx.fillStyle = C.ink2; ctx.fillRect(sx - 12, 16, 24, 14); ctx.fillRect(sx - 12, base - 14, 24, 14);
      const gr = ctx.createLinearGradient(sx - 9, 0, sx + 9, 0);
      gr.addColorStop(0, "rgba(255,255,255,0.2)"); gr.addColorStop(0.5, s.col); gr.addColorStop(1, "rgba(255,255,255,0.2)");
      ctx.fillStyle = gr; ctx.fillRect(sx - 5, 30, 10, base - 44);
      ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.strokeRect(sx - 7, 30, 14, base - 44);
      ctx.fillStyle = C.ink3; ctx.font = `11px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("방전관", sx, h - 8);
    } else {
      ctx.fillStyle = C.ink2; ctx.fillRect(sx - 8, base - 40, 16, 40); ctx.fillRect(sx - 20, base - 4, 40, 6);
      ctx.fillStyle = "rgba(90,130,230,0.55)";
      ctx.beginPath(); ctx.moveTo(sx - 8, base - 40); ctx.quadraticCurveTo(sx, base - 75, sx + 8, base - 40); ctx.fill();
      ctx.fillStyle = s.col; ctx.globalAlpha = 0.85;
      ctx.beginPath(); ctx.moveTo(sx - 10, base - 44); ctx.quadraticCurveTo(sx - 16, base - 110, sx, h * 0.12); ctx.quadraticCurveTo(sx + 16, base - 110, sx + 10, base - 44); ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = C.ink3; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(sx + 34, base - 90); ctx.lineTo(sx + 4, base - 70); ctx.stroke();
      ctx.fillStyle = C.ink3; ctx.font = `11px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(sk === "X" ? "미지 시료" : s.name + " 불꽃", sx, h - 8);
    }
    // 분광기 시야
    const x0 = w * 0.25, x1 = w - 14, y0 = 18, y1 = h * 0.56;
    const X = (l) => x0 + (l - 395) / 315 * (x1 - x0);   // 화면 위치는 참 파장 기준
    ctx.fillStyle = "#0d0d10"; ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
    for (const [lam, I, bw] of s.lines) {
      const [r, g, b] = wlColor(lam);
      if (bw) {
        const gr = ctx.createLinearGradient(X(lam - 2 * bw), 0, X(lam + 2 * bw), 0);
        gr.addColorStop(0, `rgba(${r},${g},${b},0)`); gr.addColorStop(0.5, `rgba(${r},${g},${b},${0.75 * I})`); gr.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.fillStyle = gr; ctx.fillRect(X(lam - 2 * bw), y0, X(lam + 2 * bw) - X(lam - 2 * bw), y1 - y0);
      } else {
        ctx.fillStyle = `rgba(${r},${g},${b},${0.35 + 0.65 * I})`;
        const lw = 1.5 + 2 * I; ctx.fillRect(X(lam) - lw / 2, y0, lw, y1 - y0);
      }
    }
    // 눈금판 (밀려 있으면 숫자가 참 파장보다 bias만큼 크게 적혀 있다)
    const sy = y1 + 4, b0 = bias();
    const Xs = (v) => X(v - b0);
    ctx.fillStyle = C.card; ctx.fillRect(x0, sy, x1 - x0, 30); ctx.strokeStyle = C.rule; ctx.strokeRect(x0, sy, x1 - x0, 30);
    ctx.strokeStyle = C.ink; ctx.fillStyle = C.ink; ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "center";
    for (let v = 400; v <= 700; v += 10) {
      const x = Math.round(Xs(v)) + 0.5; if (x < x0 || x > x1) continue;
      const big = v % 50 === 0;
      ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, sy); ctx.lineTo(x, sy + (big ? 11 : 6)); ctx.stroke();
      if (big) ctx.fillText(String(v), x, sy + 24);
    }
    // 십자선
    const cx = Xs(+sCur.value);
    ctx.strokeStyle = "rgba(255,255,255,0.85)"; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(cx, y0); ctx.lineTo(cx, y1); ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = C.warn; ctx.beginPath(); ctx.moveTo(cx, y1); ctx.lineTo(cx, sy + 30); ctx.stroke();
    ctx.fillStyle = C.ink3; ctx.font = `11px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillText("분광기 시야 (모식)", x0, h - 8);
    ctx.textAlign = "right"; ctx.fillStyle = $(".calib").checked ? C.forest : C.warn;
    ctx.fillText($(".calib").checked ? "눈금 보정함" : "눈금 보정 전", x1, h - 8);
  }

  function record(v) {
    const s = src(), lam = v;
    let n = "—";
    if (sk === "H") { const best = BAL.reduce((a, b) => (Math.abs(b[1] - lam) < Math.abs(a[1] - lam) ? b : a)); n = best[0]; }
    tbl.add({ sn: sk === "X" ? "미지" : s.name, src: sk, lam, E: HC / lam, n });
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const rows = tbl.rows.filter((r) => r.src === "H");
    const xs = rows.map((r) => 1 / (r.n * r.n)), ys = rows.map((r) => 1000 / r.lam);
    const f = L.linfit(xs, ys);
    L.plot(ctx, { x0: 46, y0: 20, w: w - 60, h: h - 54 }, { pts: xs.map((x, i) => ({ x, y: ys[i] })), fit: f, model: (x) => 10.968 * (0.25 - x), xr: [0, 0.25], yr: [0, 3], xlabel: "1/n²", ylabel: "1/λ (μm⁻¹)" });
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "left";
    ctx.fillText(rows.length ? "점선: 이론 R_H(1/4 − 1/n²) · 실선: 내 자료" : "수소 방전관의 선을 기록하면 점이 찍힙니다", 50, h - 4);
    const ok = f && rows.length >= 2 && new Set(rows.map((r) => r.n)).size >= 2;
    $(".n-R").textContent = ok ? `${(-f.a).toFixed(2)} μm⁻¹` : "—";
    $(".n-E2").textContent = ok ? `${(-HC * f.b / 1000).toFixed(2)} eV` : "—";
    $(".n-I").textContent = ok ? `${(HC * -f.a / 1000).toFixed(1)} eV` : "—";
  }

  $(".ssel").addEventListener("click", (e) => {
    const b = e.target.closest("[data-s]"); if (!b) return;
    sk = b.dataset.s; root.querySelectorAll("[data-s]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); draw();
  });
  sCur.addEventListener("input", () => { $(".c-out").textContent = (+sCur.value).toFixed(1); draw(); });
  $(".calib").addEventListener("change", draw);
  $(".rec").addEventListener("click", () => record(+sCur.value));
  $(".clear").addEventListener("click", () => tbl.clear());
  $(".cv-wide").addEventListener("click", (e) => {
    const r = e.currentTarget.getBoundingClientRect(), x = e.clientX - r.left, x0 = r.width * 0.25, x1 = r.width - 14;
    if (x < x0) return;
    const v = 395 + (x - x0) / (x1 - x0) * 315 + bias();
    sCur.value = Math.round(NM.clamp(v, 400, 700) * 2) / 2; $(".c-out").textContent = (+sCur.value).toFixed(1); draw();
  });

  draw();
  if (L.demo) {
    const rd = (lam) => L.snap(lam + bias() + 0.8 * L.gauss(), 0.5);
    sk = "Hg"; record(rd(546.1)); $(".calib").checked = true;
    record(rd(546.1)); record(rd(435.8));
    sk = "H"; BAL.forEach(([, l]) => record(rd(l)));
    sk = "X"; src().lines.filter((l) => !l[2] && l[1] >= 0.3).forEach(([l]) => record(rd(l)));
    sk = "H"; sCur.value = 486; $(".c-out").textContent = "486.0";
    root.querySelectorAll("[data-s]").forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.s === "H"))); draw();
  }
})();
