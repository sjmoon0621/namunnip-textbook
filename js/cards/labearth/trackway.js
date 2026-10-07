/* 카드: 공룡 발자국 화석으로 그 공룡이 얼마나 빨리 걸었는지 알 수 있을까? — 보행렬 측정, Alexander(1976) 경험식, 고환경 */
(() => {
  const root = document.getElementById("card-labearth-trackway");
  if (!root) return;
  const { C, F, fit } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const G = 9.8;

  /* 가상 보행렬: FL 발 길이(m), SL 활보(m), span 화면 가로 길이(m) */
  const TR = {
    orn: { name: "A", kind: "조각류", FL: 0.30, SL: 1.5, span: 7, n: 10 },
    thr: { name: "B", kind: "수각류", FL: 0.25, SL: 3.8, span: 8.6, n: 5 },
    sau: { name: "C", kind: "용각류", FL: 0.70, SL: 2.6, span: 9.5, n: 7 },
  };
  const speed = (SL, h) => 0.25 * Math.sqrt(G) * SL ** 1.67 * h ** -1.17;
  const gait = (r) => (r < 2 ? "걷기" : r < 2.9 ? "빠른 걸음" : "달리기");
  let cur = "orn", idx = 0, hi = null;
  const rng = (seed) => () => { seed |= 0; seed = seed + 0x6d2b79f5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };

  /* 발자국 위치 만들기 (같은 보행렬은 늘 같게) */
  const prints = {};
  function makePrints(k) {
    const t = TR[k], R = rng(k.length * 31 + 7), out = [];
    let x = 0.4;
    for (let i = 0; i < t.n; i++) {
      const fl = t.FL * (1 + 0.03 * (R() * 2 - 1));
      const side = i % 2 ? 1 : -1;
      out.push({ x, y: side * t.FL * (k === "sau" ? 0.75 : 0.45) + 0.15 * Math.sin(x / 3), fl, side, rot: (R() - 0.5) * 0.15 + side * -0.12 });
      x += t.SL / 2 * (1 + 0.04 * (R() * 2 - 1));
    }
    return out;
  }
  Object.keys(TR).forEach((k) => { prints[k] = makePrints(k); });

  /* ── 층리면 그림 ── */
  const cv = fit($(".tw-cv"), () => draw());
  function draw() {
    const { ctx } = cv, { w, h } = cv.size; if (!w) return;
    const t = TR[cur], P = prints[cur], s = (w - 20) / t.span, cy = h * 0.5;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#b9a98d"; ctx.fillRect(0, 0, w, h);
    const R = rng(5);
    /* 물결 자국 */
    ctx.strokeStyle = "rgba(90,75,55,.28)"; ctx.lineWidth = 1.2;
    for (let x0 = -20; x0 < w + 20; x0 += 13) { ctx.beginPath(); for (let y = 0; y <= h * 0.36; y += 3) { const x = x0 + 3 * Math.sin(y / 11); y ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); }
    /* 건열 (다각형 갈라짐) */
    ctx.strokeStyle = "rgba(70,55,40,.5)"; ctx.lineWidth = 1.3;
    for (let gy = h * 0.66; gy < h + 20; gy += 26) for (let gx = 0; gx < w + 30; gx += 30) {
      const ox = gx + (R() - 0.5) * 12, oy = gy + (R() - 0.5) * 8;
      ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox + 28 + (R() - 0.5) * 8, oy + (R() - 0.5) * 8); ctx.moveTo(ox, oy); ctx.lineTo(ox + (R() - 0.5) * 8, oy + 25); ctx.stroke();
    }
    /* 빗방울 자국 */
    ctx.fillStyle = "rgba(80,65,45,.35)";
    for (let i = 0; i < 40; i++) { ctx.beginPath(); ctx.arc(R() * w, h * 0.42 + R() * h * 0.24, 1.2 + R(), 0, Math.PI * 2); ctx.fill(); }
    /* 발자국 */
    const X = (m) => 10 + m * s, Y = (m) => cy - m * s;
    P.forEach((p, i) => {
      ctx.save(); ctx.translate(X(p.x), Y(p.y)); ctx.rotate(p.rot);
      const f = p.fl * s * ($(".collapse").checked ? 1.15 : 1);
      ctx.fillStyle = "rgba(70,55,38,.75)"; ctx.strokeStyle = "rgba(40,30,20,.9)"; ctx.lineWidth = 1;
      if (cur === "sau") {
        ctx.beginPath(); ctx.ellipse(0, 0, f * 0.5, f * 0.4, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(f * 0.75, 0, f * 0.14, f * 0.28, 0, -1.2, 1.2); ctx.lineTo(f * 0.7, 0); ctx.closePath(); ctx.fill();
      } else {
        const sharp = cur === "thr";
        ctx.beginPath(); ctx.ellipse(-f * 0.22, 0, f * 0.24, f * (sharp ? 0.16 : 0.24), 0, 0, Math.PI * 2); ctx.fill();
        [-0.5, 0, 0.5].forEach((a) => {
          const L2 = f * (a ? 0.62 : 0.74), wd = f * (sharp ? 0.07 : 0.14);
          ctx.save(); ctx.rotate(a * (sharp ? 0.75 : 0.6)); ctx.beginPath();
          ctx.moveTo(-f * 0.1, -wd); ctx.lineTo(L2 * (sharp ? 0.85 : 0.92), -wd);
          sharp ? ctx.lineTo(L2, 0) : ctx.arc(L2 * 0.92, 0, wd, -Math.PI / 2, Math.PI / 2);
          ctx.lineTo(-f * 0.1, wd); ctx.closePath(); ctx.fill(); ctx.restore();
        });
      }
      ctx.restore();
      if (hi && (i === hi.a || i === hi.b)) { ctx.strokeStyle = C.amber; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(X(p.x), Y(p.y), p.fl * s * 0.75 + 4, 0, Math.PI * 2); ctx.stroke(); }
    });
    if (hi) {
      const a = P[hi.a], b = P[hi.b];
      ctx.strokeStyle = C.warn; ctx.lineWidth = 1.6; ctx.setLineDash([5, 3]);
      ctx.beginPath(); ctx.moveTo(X(a.x - a.fl / 2), Y(a.y) - 0); ctx.lineTo(X(b.x - b.fl / 2), Y(b.y)); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = "rgba(251,251,248,.88)"; ctx.font = `10.5px ${F.mono}`; const tx = `활보 ${hi.SL.toFixed(2)} m`; const tw = ctx.measureText(tx).width + 8;
      const mx = (X(a.x) + X(b.x)) / 2; ctx.fillRect(mx - tw / 2, Y(a.y) + 18, tw, 15); ctx.fillStyle = C.ink; ctx.textAlign = "center"; ctx.fillText(tx, mx, Y(a.y) + 29);
    }
    /* 축척, 방향 */
    ctx.fillStyle = C.ink; ctx.fillRect(10, h - 14, s, 3);
    ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "left"; ctx.fillText("1 m", 14 + s, h - 9);
    ctx.fillStyle = "rgba(251,251,248,.85)"; ctx.fillRect(6, 5, 132, 16); ctx.fillStyle = C.ink;
    ctx.fillText(`보행렬 ${t.name} · 진행 방향 →`, 10, 17);
  }

  /* ── 기록 ── */
  const tbl = L.table($(".tbl-host"), [
    { key: "t", label: "보행렬" }, { key: "fl", label: "FL (cm)", res: 1 }, { key: "sl", label: "SL (cm)", res: 1 },
    { key: "h", label: "h = 4FL (m)", res: 0.01 }, { key: "r", label: "SL/h", res: 0.01 }, { key: "v", label: "v (m/s)", res: 0.1 }, { key: "g", label: "걸음새" },
  ], () => { drawPlot(); nums(); });
  function measure() {
    const P = prints[cur], t = TR[cur];
    const a = idx % (P.length - 2), b = a + 2;
    const trueFL = P[a].fl * ($(".collapse").checked ? 1.15 : 1), trueSL = P[b].x - P[a].x;
    const fl = L.measure(trueFL * 100, { sd: 1, res: 1 }), sl = L.measure(trueSL * 100, { sd: 1, res: 1 });
    const hgt = 4 * fl / 100, r = sl / 100 / hgt, v = speed(sl / 100, hgt);
    hi = { a, b, SL: sl / 100 };
    tbl.add({ t: t.name, fl, sl, h: hgt, r, v, g: gait(r), _k: cur });
    idx++; draw();
  }
  function nums() {
    const rows = tbl.rows.filter((r) => r._k === cur);
    const sv = L.stats(rows.map((r) => r.v)), sr = L.stats(rows.map((r) => r.r));
    $(".n-v").textContent = sv.n ? `${sv.mean.toFixed(1)} m/s (${(sv.mean * 3.6).toFixed(0)} km/h)` : "—";
    $(".n-r").textContent = sr.n ? sr.mean.toFixed(2) : "—";
    $(".n-g").textContent = sr.n ? `${TR[cur].name}: ${gait(sr.mean)}` : "—";
  }
  const pv = fit($(".tw-plot"), () => drawPlot());
  function drawPlot() {
    const { ctx } = pv, { w, h } = pv.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const b = { x0: 44, y0: 22, w: w - 58, h: h - 56 };
    const r = L.plot(ctx, b, { pts: tbl.rows.map((x) => ({ x: x.r, y: x.v })), xr: [0, 4.5], yr: [0, 10], xlabel: "상대 활보 SL/h", ylabel: "추정 속도 v (m/s)", model: (x) => 0.25 * Math.sqrt(G) * x ** 1.67 * 1.2 ** 0.5 });
    ctx.strokeStyle = C.ink3; ctx.setLineDash([2, 3]); ctx.lineWidth = 1;
    [2, 2.9].forEach((x) => { ctx.beginPath(); ctx.moveTo(r.X(x), b.y0); ctx.lineTo(r.X(x), b.y0 + b.h); ctx.stroke(); });
    ctx.setLineDash([]);
    ctx.font = `10.5px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.textAlign = "center";
    ctx.fillText("걷기", r.X(1), b.y0 + 12); ctx.fillText("빠른 걸음", r.X(2.45), b.y0 + 12); ctx.fillText("달리기", r.X(3.7), b.y0 + 12);
    ctx.textAlign = "left"; ctx.font = `10px ${F.mono}`;
    const seen = new Set();
    tbl.rows.forEach((x) => { if (seen.has(x.t)) return; seen.add(x.t); ctx.fillStyle = C.ink; ctx.fillText(x.t, r.X(x.r) + 6, r.Y(x.v) - 5); });
    ctx.fillStyle = C.ink3; ctx.fillText("점선: h = 1.2 m일 때 v", b.x0 + 6, b.y0 + 30);
  }
  const verdict = (t, ok) => { const v = $(".tw-v"); v.textContent = t; v.className = "verdict tw-v" + (ok == null ? "" : ok ? " good" : " bad"); };

  /* ── 조작 ── */
  $(".tw-tr").addEventListener("click", (e) => {
    const b = e.target.closest("[data-t]"); if (!b) return;
    cur = b.dataset.t; idx = 0; hi = null;
    root.querySelectorAll(".tw-tr [data-t]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    draw(); nums();
  });
  $(".collapse").addEventListener("change", draw);
  $(".meas").addEventListener("click", measure);
  $(".clear").addEventListener("click", () => { tbl.clear(); hi = null; draw(); });
  $(".tw-env").addEventListener("click", (e) => {
    const b = e.target.closest("[data-e]"); if (!b) return;
    const msg = {
      lake: ["맞습니다. 물결 자국은 얕은 물이 출렁인 흔적, 건열은 진흙이 물 밖으로 드러나 마른 흔적, 빗방울 자국은 공기 중에 드러난 증거입니다. 발자국이 선명하게 찍히려면 젖은 진흙이어야 하므로 물이 들고 나던 호숫가였습니다. 고성·해남의 백악기 지층은 이런 호수 퇴적층입니다.", true],
      sea: ["건열과 빗방울 자국은 퇴적물이 공기 중에 드러나야 생깁니다. 깊은 바다 밑에서는 생길 수 없고, 공룡이 걸어 다닐 수도 없습니다.", false],
      dune: ["사막 모래 언덕은 마른 모래라 발자국이 무너지고, 물결 자국 대신 큰 사층리가 나타납니다. 건열은 진흙이 젖었다 말라야 생깁니다.", false],
    }[b.dataset.e];
    verdict(msg[0], msg[1]);
  });

  draw(); nums();
  if (L.demo) {
    ["sau", "thr", "orn"].forEach((k) => { cur = k; idx = 0; for (let i = 0; i < 4; i++) measure(); });
    cur = "thr"; idx = 1; measure();
    root.querySelectorAll(".tw-tr [data-t]").forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.t === cur)));
    draw(); nums();
  }
})();
