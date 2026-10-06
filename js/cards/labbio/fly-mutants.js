/* 카드: 마취한 초파리 열 마리, 암수와 돌연변이 형질을 가려낼 수 있을까? — 가상 해부 현미경, 형질·성별 판정, 몸길이 측정 */
(() => {
  const root = document.getElementById("card-labbio-fly-mutants");
  if (!root) return;
  const { C, F, fit } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);

  const PH = { wt: "야생형", w: "흰 눈 w", B: "막대 눈 B", vg: "흔적 날개 vg", Cy: "말린 날개 Cy", e: "검은 몸 e", y: "노란 몸 y" };
  const KEYS = Object.keys(PH);
  const LEN = { F: [2.6, 0.13], M: [2.2, 0.1] };   // mm, 모식
  const TICK = 0.05;                                  // mm / 눈금
  let flies = [], sel = -1, view = "d", ansX = null, ansP = null, measured = NaN, batch = 0;

  const tbl = L.table($(".tbl-host"), [{ key: "n", label: "개체" }, { key: "l", label: "몸길이 (mm)", res: 0.05 }, { key: "x", label: "판정 성별" }, { key: "p", label: "판정 형질" }, { key: "ok", label: "확인" }], () => drawPlot());
  const cv = fit($(".fm-view"), () => draw());
  const pl = fit($(".cv-plot"), () => drawPlot());

  function newBatch() {
    batch++;
    flies = [];
    const pool = KEYS.slice();
    for (let i = 0; i < 10; i++) {
      const ph = i < pool.length ? pool[i] : pool[Math.floor(Math.random() * pool.length)];
      const sex = Math.random() < 0.5 ? "F" : "M";
      flies.push({ ph, sex, len: LEN[sex][0] + LEN[sex][1] * L.gauss(), rot: (Math.random() - 0.5) * 1.2 });
    }
    for (let i = flies.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [flies[i], flies[j]] = [flies[j], flies[i]]; }
    sel = -1; measured = NaN; resetAns(); $(".fm-msg").textContent = "왼쪽 받침에서 초파리를 한 마리 누르세요.";
    draw();
  }
  function resetAns() { ansX = ansP = null; root.querySelectorAll("[data-x], [data-p]").forEach((b) => b.setAttribute("aria-pressed", "false")); }

  /* 초파리 그리기: (x, y) 몸 중심, s = 몸길이(px), 머리가 위 */
  function drawFly(c, x, y, s, f, side, rot) {
    c.save(); c.translate(x, y); c.rotate(rot || 0);
    const col = f.ph === "e" ? ["#463629", "#1e1611"] : f.ph === "y" ? ["#e2c76f", "#b8913f"] : ["#b9894a", "#5a381c"];
    const male = f.sex === "M";
    const abY = male ? 0.14 * s : 0.17 * s, abR = male ? 0.2 * s : 0.25 * s, abW = 0.15 * s;
    /* 다리 (배 쪽에서만 자세히) */
    if (side === "v") {
      c.strokeStyle = col[1]; c.lineWidth = Math.max(1, s * 0.012);
      [[-0.2, -0.5], [-0.12, 0.05], [-0.06, 0.4]].forEach(([dy, ang], k) => {
        for (const sg of [-1, 1]) {
          c.beginPath(); c.moveTo(sg * 0.05 * s, (dy) * s); c.lineTo(sg * 0.2 * s, (dy + ang * 0.12) * s); c.lineTo(sg * 0.28 * s, (dy + ang * 0.3 + 0.05) * s); c.stroke();
          if (k === 0 && male) { c.fillStyle = "#111"; c.fillRect(sg * 0.2 * s - s * 0.02, (dy + ang * 0.12) * s - s * 0.006, s * 0.04, s * 0.022); }
        }
      });
    }
    /* 배 */
    c.fillStyle = col[0]; c.beginPath();
    if (male) c.ellipse(0, abY, abW, abR, 0, 0, 6.3);
    else { c.moveTo(-abW, abY - abR * 0.6); c.quadraticCurveTo(-abW * 1.05, abY + abR * 0.5, 0, abY + abR); c.quadraticCurveTo(abW * 1.05, abY + abR * 0.5, abW, abY - abR * 0.6); c.quadraticCurveTo(0, abY - abR * 1.2, -abW, abY - abR * 0.6); }
    c.fill();
    if (side === "d") {
      c.save(); c.clip();
      const nb = 5;
      for (let i = 0; i < nb; i++) {
        const y0 = abY - abR * 0.75 + i * abR * 1.6 / nb;
        c.fillStyle = col[1];
        if (male && i >= nb - 2) c.fillRect(-abW * 1.2, y0, abW * 2.4, abR);
        else c.fillRect(-abW * 1.2, y0 + abR * 0.18, abW * 2.4, abR * 0.12);
      }
      c.restore();
    } else {
      c.fillStyle = "rgba(255,255,255,.18)"; for (let i = 0; i < 4; i++) c.fillRect(-abW * 0.35, abY - abR * 0.6 + i * abR * 0.32, abW * 0.7, abR * 0.2);
      c.fillStyle = male ? "#2a1a10" : col[1];
      if (male) { c.beginPath(); c.arc(0, abY + abR * 0.82, abW * 0.38, 0, 6.3); c.fill(); }
      else { c.beginPath(); c.ellipse(0, abY + abR * 0.88, abW * 0.18, abR * 0.12, 0, 0, 6.3); c.fill(); }
    }
    /* 가슴 */
    c.fillStyle = col[0]; c.beginPath(); c.ellipse(0, -0.15 * s, 0.15 * s, 0.16 * s, 0, 0, 6.3); c.fill();
    if (side === "d") { c.strokeStyle = f.ph === "y" ? "#a2712e" : "#1a120c"; c.lineWidth = Math.max(0.7, s * 0.006); for (let i = 0; i < 6; i++) { const bx = (i % 2 ? 1 : -1) * (0.04 + 0.03 * Math.floor(i / 2)) * s, by = (-0.24 + 0.05 * Math.floor(i / 2)) * s; c.beginPath(); c.moveTo(bx, by); c.lineTo(bx * 1.15, by + 0.06 * s); c.stroke(); } }
    /* 날개 */
    if (side === "d") {
      c.fillStyle = "rgba(225,232,240,.55)"; c.strokeStyle = "rgba(110,120,135,.8)"; c.lineWidth = Math.max(0.7, s * 0.006);
      for (const sg of [-1, 1]) {
        c.save(); c.translate(sg * 0.06 * s, -0.1 * s);
        if (f.ph === "vg") { c.rotate(sg * 0.6); c.beginPath(); c.moveTo(0, 0); c.lineTo(sg * 0.05 * s, 0.06 * s); c.lineTo(sg * 0.02 * s, 0.11 * s); c.lineTo(-sg * 0.02 * s, 0.07 * s); c.closePath(); c.fill(); c.stroke(); }
        else if (f.ph === "Cy") { c.rotate(-sg * 0.32); c.beginPath(); c.ellipse(0, 0.2 * s, 0.075 * s, 0.22 * s, 0, 0, 6.3); c.fill(); c.stroke(); c.strokeStyle = "rgba(80,90,105,.9)"; c.lineWidth = Math.max(1, s * 0.012); c.beginPath(); c.arc(sg * 0.03 * s, 0.39 * s, 0.05 * s, -0.4, Math.PI + 0.4, sg > 0); c.stroke(); }
        else { c.rotate(-sg * 0.16); c.beginPath(); c.ellipse(0, 0.3 * s, 0.085 * s, 0.32 * s, 0, 0, 6.3); c.fill(); c.stroke(); c.beginPath(); c.moveTo(0, 0.02 * s); c.lineTo(sg * 0.01 * s, 0.58 * s); c.moveTo(-sg * 0.03 * s, 0.05 * s); c.lineTo(-sg * 0.05 * s, 0.5 * s); c.stroke(); }
        c.restore();
      }
    }
    /* 머리와 눈 */
    c.fillStyle = col[0]; c.beginPath(); c.ellipse(0, -0.38 * s, 0.13 * s, 0.1 * s, 0, 0, 6.3); c.fill();
    const eyeC = f.ph === "w" ? "#f3efe6" : "#b3261b";
    for (const sg of [-1, 1]) {
      c.fillStyle = eyeC; c.strokeStyle = f.ph === "w" ? "#9a958a" : "#6a120c"; c.lineWidth = Math.max(0.6, s * 0.005);
      c.beginPath();
      if (f.ph === "B") c.ellipse(sg * 0.1 * s, -0.385 * s, 0.026 * s, 0.075 * s, sg * 0.25, 0, 6.3);
      else c.ellipse(sg * 0.095 * s, -0.385 * s, 0.065 * s, 0.085 * s, sg * 0.25, 0, 6.3);
      c.fill(); c.stroke();
    }
    c.restore();
  }

  function layout(w, h) {
    const tw = w * 0.4, cols = 2, rows = 5, cw = tw / cols, ch = (h - 10) / rows;
    return flies.map((f, i) => ({ x: 8 + cw * (i % cols) + cw / 2, y: 6 + ch * Math.floor(i / cols) + ch / 2, r: Math.min(cw, ch) * 0.42 }));
  }

  function draw() {
    const { ctx: c, size } = cv, { w, h } = size; if (!w) return;
    c.clearRect(0, 0, w, h);
    const pos = layout(w, h);
    c.fillStyle = "#f4f4ef"; c.fillRect(4, 2, w * 0.4 + 8, h - 4); c.strokeStyle = C.rule; c.strokeRect(4.5, 2.5, w * 0.4 + 7, h - 5);
    flies.forEach((f, i) => {
      const p = pos[i];
      drawFly(c, p.x + 6, p.y, p.r * 1.7 * f.len / 2.6, f, "d", f.rot);
      if (i === sel) { c.strokeStyle = C.amber; c.lineWidth = 2; c.beginPath(); c.arc(p.x + 6, p.y, p.r * 1.05, 0, 6.3); c.stroke(); }
      c.fillStyle = C.ink3; c.font = `10px ${F.mono}`; c.textAlign = "left"; c.fillText(String(i + 1), p.x - p.r - 2, p.y - p.r * 0.55);
    });
    /* 해부 현미경 시야 */
    const cx = w * 0.72, cy = h / 2, R = Math.min(w * 0.27, h / 2 - 6);
    c.fillStyle = C.night; c.beginPath(); c.arc(cx, cy, R + 4, 0, 6.3); c.fill();
    c.save(); c.beginPath(); c.arc(cx, cy, R, 0, 6.3); c.clip();
    c.fillStyle = "#fbfbf6"; c.fillRect(cx - R, cy - R, 2 * R, 2 * R);
    const pxmm = R * 0.62;   // 1 mm의 화면 길이
    if (sel >= 0) {
      const f = flies[sel];
      drawFly(c, cx, cy - R * 0.05, f.len * pxmm, f, view, 0);
      /* 접안 마이크로미터 (세로) */
      const x0 = cx + R * 0.55, y0 = cy - R * 0.05 - 1.35 * pxmm, step = TICK * pxmm, n = 60;
      c.strokeStyle = "rgba(20,20,20,.75)"; c.lineWidth = 1; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x0, y0 + n * step); c.stroke();
      for (let i = 0; i <= n; i++) { const tl = i % 10 === 0 ? 8 : i % 5 === 0 ? 5 : 3; c.beginPath(); c.moveTo(x0, y0 + i * step); c.lineTo(x0 + tl, y0 + i * step); c.stroke(); }
      c.fillStyle = "rgba(20,20,20,.8)"; c.font = `9px ${F.mono}`; c.textAlign = "left";
      for (let i = 0; i <= n; i += 20) c.fillText(String(i), x0 + 10, y0 + i * step + 3);
    } else { c.fillStyle = C.ink3; c.font = `12px ${F.sans}`; c.textAlign = "center"; c.fillText("해부 현미경 시야", cx, cy); }
    c.restore();
    c.fillStyle = C.ink2; c.font = `10px ${F.mono}`; c.textAlign = "right";
    c.fillText(view === "d" ? "등 쪽" : "배 쪽", cx + R, h - 4);
  }

  function drawPlot() {
    const { ctx: c, size } = pl, { w, h } = size; if (!w) return;
    c.clearRect(0, 0, w, h);
    const rows = tbl.rows;
    /* 왼쪽: 판정 성별별 몸길이 */
    const b1 = { x0: 44, y0: 24, w: w * 0.32, h: h - 60 };
    const Y = (v) => b1.y0 + b1.h - (v - 1.8) / (3.0 - 1.8) * b1.h;
    NM.axes(c, { ...b1, X: (v) => v, Y, xt: [], yt: [1.8, 2.2, 2.6, 3.0].map((v) => [v, v.toFixed(1)]), ylabel: "몸길이 (mm)" });
    [["F", "암컷", C.apple], ["M", "수컷", C.forest]].forEach(([k, nm, col], i) => {
      const xs = rows.filter((r) => r.x === nm && Number.isFinite(r.l));
      const x = b1.x0 + b1.w * (0.28 + 0.44 * i);
      c.fillStyle = col; xs.forEach((r, j) => { c.beginPath(); c.arc(x + ((j % 5) - 2) * 4, Y(r.l), 3, 0, 6.3); c.fill(); });
      const st = L.stats(xs.map((r) => r.l));
      if (st.n) { c.strokeStyle = col; c.lineWidth = 2; c.beginPath(); c.moveTo(x - 14, Y(st.mean)); c.lineTo(x + 14, Y(st.mean)); c.stroke(); }
      c.fillStyle = C.ink; c.font = `12px ${F.sans}`; c.textAlign = "center"; c.fillText(nm, x, b1.y0 + b1.h + 15);
      if (st.n) { c.fillStyle = C.ink2; c.font = `10px ${F.mono}`; c.fillText(`${st.mean.toFixed(2)} (n=${st.n})`, x, b1.y0 + b1.h + 28); }
    });
    /* 오른쪽: 판정 형질별 개체 수와 정답률 */
    const b2 = { x0: w * 0.32 + 84, y0: 24, w: w - (w * 0.32 + 84) - 12, h: h - 60 };
    const cnt = KEYS.map((k) => rows.filter((r) => r.p === PH[k]).length), ok = KEYS.map((k) => rows.filter((r) => r.p === PH[k] && r.ok === "맞음").length);
    const top = Math.max(2, ...cnt);
    const Y2 = (v) => b2.y0 + b2.h - v / top * b2.h;
    NM.axes(c, { ...b2, X: (v) => v, Y: Y2, xt: [], yt: L.ticks(0, top, 3).filter((v) => v === Math.round(v)).map((v) => [v, String(v)]), ylabel: "판정한 개체 수 (진한 색 = 맞음)" });
    const bw = b2.w / KEYS.length;
    KEYS.forEach((k, i) => {
      const x = b2.x0 + i * bw + bw * 0.15;
      c.fillStyle = C.sprout; c.fillRect(x, Y2(cnt[i]), bw * 0.7, b2.y0 + b2.h - Y2(cnt[i]));
      c.fillStyle = C.forest; c.fillRect(x, Y2(ok[i]), bw * 0.7, b2.y0 + b2.h - Y2(ok[i]));
      c.fillStyle = C.ink; c.font = `11px ${F.mono}`; c.textAlign = "center"; c.fillText(k === "wt" ? "+" : k, x + bw * 0.35, b2.y0 + b2.h + 15);
    });
  }

  $(".fm-view").addEventListener("click", (e) => {
    const b = e.currentTarget.getBoundingClientRect(), x = e.clientX - b.left, y = e.clientY - b.top;
    const pos = layout(cv.size.w, cv.size.h);
    const i = pos.findIndex((p) => Math.hypot(x - p.x - 6, y - p.y) < p.r * 1.1);
    if (i < 0) return;
    sel = i; measured = NaN; resetAns();
    $(".fm-msg").textContent = `${i + 1}번 초파리: 등 쪽과 배 쪽을 보고 성별과 형질을 고르세요.`;
    draw();
  });
  $(".fm-side").addEventListener("click", (e) => {
    const b = e.target.closest("[data-v]"); if (!b) return; view = b.dataset.v;
    root.querySelectorAll("[data-v]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); draw();
  });
  $(".fm-sex").addEventListener("click", (e) => { const b = e.target.closest("[data-x]"); if (!b) return; ansX = b.dataset.x; root.querySelectorAll("[data-x]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); });
  $(".fm-ph").addEventListener("click", (e) => { const b = e.target.closest("[data-p]"); if (!b) return; ansP = b.dataset.p; root.querySelectorAll("[data-p]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); });
  $(".fm-len").addEventListener("click", () => {
    if (sel < 0) return;
    const d = L.measure(flies[sel].len / TICK, { sd: 0.7, res: 1 });
    measured = d * TICK;
    $(".fm-msg").textContent = `${sel + 1}번 몸길이: ${d}눈금 × ${TICK} mm = ${measured.toFixed(2)} mm`;
  });
  function record() {
    if (sel < 0 || !ansX || !ansP) { $(".fm-msg").textContent = "초파리를 고르고 성별과 형질을 모두 판정하세요."; return; }
    const f = flies[sel], okX = ansX === f.sex, okP = ansP === f.ph;
    tbl.add({ n: `${batch}-${sel + 1}`, l: measured, x: ansX === "F" ? "암컷" : "수컷", p: PH[ansP], ok: okX && okP ? "맞음" : `틀림(${okX ? "" : "성별"}${!okX && !okP ? "·" : ""}${okP ? "" : "형질"})` });
    $(".fm-msg").textContent = okX && okP ? "판정이 맞습니다. 다음 초파리를 고르세요." : `다시 보세요. ${okX ? "" : "배 끝 모양과 앞다리 성즐을 확인하세요. "}${okP ? "" : "눈 색·눈 모양, 날개, 몸 색을 차례로 비교하세요."}`;
  }
  $(".fm-rec").addEventListener("click", record);
  $(".fm-new").addEventListener("click", newBatch);
  $(".fm-clear").addEventListener("click", () => tbl.clear());
  newBatch();

  if (L.demo) {
    flies.forEach((f, i) => {
      sel = i; measured = L.measure(f.len / TICK, { sd: 0.7, res: 1 }) * TICK;
      ansX = i === 4 ? (f.sex === "F" ? "M" : "F") : f.sex; ansP = i === 7 ? (f.ph === "y" ? "wt" : f.ph) : f.ph;
      record();
    });
    sel = flies.findIndex((f) => f.sex === "M"); if (sel < 0) sel = 0;
    view = "v"; root.querySelectorAll("[data-v]").forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.v === "v")));
    resetAns(); $(".fm-msg").textContent = `${sel + 1}번 초파리: 배 쪽에서 앞다리의 성즐과 둥근 배 끝을 확인하세요.`;
    draw(); drawPlot();
  }
})();
