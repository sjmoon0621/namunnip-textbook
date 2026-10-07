/* 카드: 노두의 경계면만 보고 그 사이에 무슨 일이 있었는지 알 수 있을까? — 정합·부정합·관입·단층 판정과 지사 해석 (모식 노두) */
(() => {
  const root = document.getElementById("card-labearth-section");
  if (!root) return;
  const { C, F, fit, axes } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const D2R = Math.PI / 180;

  /* ── 모식 노두 (x: 0~100 m, z: 0~56 m) ── */
  const T35 = Math.tan(35 * D2R), T5 = Math.tan(5 * D2R), THROW = 4;
  const topo = (x) => 52 + 1.6 * Math.sin(x / 9) + 0.8 * Math.sin(x / 3.3);
  const u2 = (x) => 30 - T5 * (x - 50) + 0.4 * Math.sin(x / 4);
  const u3 = (x) => 42 - T5 * (x - 50) + 0.9 * Math.sin(x / 2.6) + 0.5 * Math.sin(x / 1.3);
  const faultX = (z) => 78 + z * 10 / 56;
  const UNIT = {
    air: null, G: { c: "#a39892", n: "편마암" }, S1: { c: "#77736b", n: "S1 셰일" }, S2: { c: "#d9c48f", n: "S2 사암" }, S3: { c: "#bfc2b8", n: "S3 석회암" },
    K: { c: "#b59a74", n: "기저 역암" }, S4: { c: "#cfb889", n: "S4 사암" }, S5: { c: "#8d8274", n: "S5 셰일" }, K2: { c: "#a58f70", n: "기저 역암" }, S6: { c: "#cdcfc6", n: "S6 석회암" },
    D: { c: "#3f3b3a", n: "암맥" }, H: { c: "#57524c", n: "구워진 띠" },
  };
  function orig(x, z) {
    if (z >= u3(x)) return z < u3(x) + 1.2 ? "K2" : "S6";
    if (x >= 60 && x <= 64) return "D";
    if (z >= u2(x)) { const d = (z - u2(x)) * Math.cos(5 * D2R); return d < 1.5 ? "K" : d < 7 ? "S4" : "S5"; }
    const c = z + T35 * x;
    const u = c < 40 + 0.6 * Math.sin(x / 2) ? "G" : c < 50 ? "S1" : c < 60 ? "S2" : "S3";
    if (u !== "G" && Math.abs(x - 62) < 3.3) return "H";
    return u;
  }
  function unit(x, z) {
    if (z > topo(x)) return "air";
    if (Math.abs(x - faultX(z)) < 0.5) return "Fz";
    return x > faultX(z) ? orig(x, z + THROW) : orig(x, z);
  }

  /* 경계면: 위치(모식 좌표), 참 경사(아래, 위), 판정, 증거 */
  const CT = [
    { k: "가", x: 40, z: 22, t: "conf", dip: [35, 35], ev: "층리면이 서로 나란하고, 셰일에서 사암으로 알갱이가 점점 굵어집니다. 깎인 흔적이나 자갈층은 없습니다." },
    { k: "나", x: 25, z: 22.5, t: "non", dip: [70, 35], ev: "아래는 엽리가 발달한 편마암이고, 경계 바로 위에 편마암 조각이 든 자갈층이 있습니다. 편마암 윗부분은 풍화되어 푸석합니다. 아래 경사는 엽리면을 잰 값입니다." },
    { k: "다", x: 30, z: 31.7, t: "ang", dip: [35, 5], ev: "아래 지층들이 경계면에서 비스듬히 잘려 있고, 경계 위 자갈층에 아래 석회암·사암 조각이 들어 있습니다." },
    { k: "라", x: 20, z: 44.5, t: "para", dip: [5, 5], ev: "경계면이 울퉁불퉁하게 파여 있고, 위 자갈층에 아래 셰일 조각과 검은 암맥 조각이 섞여 있습니다. 위아래 층리는 나란해 보입니다." },
    { k: "마", x: 60, z: 22, t: "intr", dip: [35, 90], ev: "암맥 가장자리 1~2 cm는 알갱이가 아주 작고(급랭대) 가운데로 갈수록 굵어집니다. 옆의 셰일은 단단하고 검게 구워졌고, 암맥 속에 셰일 조각(포획암)이 있습니다. 위 경사는 암맥 벽면을 잰 값입니다." },
    { k: "바", x: 82.5, z: 25, t: "fault", dip: [5, 80], ev: "부서진 각진 조각과 점토가 띠를 이루고, 면에 긁힌 줄(단층 조선)이 있습니다. 양쪽 지층이 약 4 m 어긋나 있으며 S6까지 잘렸습니다. 아래 경사는 옆 지층, 위 경사는 단층면을 잰 값입니다." },
  ];
  const TN = { conf: "정합", para: "평행 부정합", ang: "경사 부정합", non: "난정합", intr: "관입", fault: "단층" };
  const RIGHT = ["G", "A", "T", "B", "D", "E", "C", "F"];
  const EN = { G: "편마암 형성", A: "S1~S3 퇴적", T: "기울어짐·융기·침식", B: "S4·S5 퇴적", D: "암맥 관입", E: "융기·침식", C: "S6 퇴적", F: "단층" };
  let sel = 0, seq = [];

  /* ── 단면 ── */
  const cv = fit($(".sc-cv"), () => draw());
  let offc = null, offKey = "";
  const geo = () => { const { w, h } = cv.size; const s = Math.min((w - 20) / 100, (h - 22) / 56); return { s, ox: (w - 100 * s) / 2, oy: h - 6 }; };
  function draw() {
    const { ctx } = cv, { w, h } = cv.size; if (!w) return;
    const { s, ox, oy } = geo(), P = (x, z) => [ox + x * s, oy - z * s];
    const key = `${w}x${h}`;
    if (offKey !== key) {
      offc = document.createElement("canvas"); const dpr = Math.min(devicePixelRatio || 1, 2);
      offc.width = Math.round(w * dpr); offc.height = Math.round(h * dpr);
      const o = offc.getContext("2d"); o.scale(dpr, dpr);
      const cell = 1.5;
      for (let py = 0; py < h; py += cell) for (let px = 0; px < w; px += cell) {
        const x = (px - ox) / s, z = (oy - py) / s;
        if (x < 0 || x > 100 || z < 0) continue;
        const u = unit(x, z);
        if (u === "air") continue;
        let col = u === "Fz" ? "#5a4e46" : UNIT[u].c;
        o.fillStyle = col; o.fillRect(px, py, cell + 0.3, cell + 0.3);
        /* 결 무늬 */
        const xi = Math.floor(px / cell), zi = Math.floor(py / cell);
        if ((u === "K" || u === "K2") && (xi * 7 + zi * 13) % 11 === 0) { o.fillStyle = "rgba(60,50,40,.55)"; o.fillRect(px, py, cell * 1.6, cell * 1.3); }
        if ((u === "S2" || u === "S4") && (xi * 5 + zi * 3) % 9 === 0) { o.fillStyle = "rgba(90,70,40,.35)"; o.fillRect(px, py, 1, 1); }
        if (u === "D" && (xi * 3 + zi * 7) % 6 === 0) { o.fillStyle = "rgba(255,255,255,.12)"; o.fillRect(px, py, 1, 1); }
      }
      /* 층리선 */
      o.strokeStyle = "rgba(0,0,0,.18)"; o.lineWidth = 0.7;
      const bed = (f, x0, x1, test) => { o.beginPath(); let on = false; for (let x = x0; x <= x1; x += 0.5) { const z = f(x), ok = test(x, z); const [a, b] = P(x, z); if (ok) { on ? o.lineTo(a, b) : o.moveTo(a, b); on = true; } else on = false; } o.stroke(); };
      for (let c = 42; c < 140; c += 2.5) bed((x) => c - T35 * x, 0, 100, (x, z) => z > 0 && z < u2(x) && !(x >= 58.7 && x <= 65.3) && x < faultX(z) && c > 40.6);
      for (let d = 2.5; d < 30; d += 2) bed((x) => u2(x) + d, 0, 100, (x, z) => z < u3(x) && z < topo(x) && x < faultX(z) && !(x >= 60 && x <= 64));
      for (let d = 2.5; d < 14; d += 2) bed((x) => u3(x) + d, 0, 100, (x, z) => z < topo(x) && x < faultX(z));
      o.strokeStyle = "rgba(0,0,0,.45)"; o.lineWidth = 1.2;
      [u2, u3].forEach((f) => bed(f, 0, 100, (x, z) => x < faultX(z) && z < topo(x)));
    }
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(offc, 0, 0, w, h);
    /* 단층선 */
    ctx.strokeStyle = C.warn; ctx.lineWidth = 1.6; ctx.setLineDash([6, 3]);
    ctx.beginPath(); ctx.moveTo(...P(faultX(0), 0)); ctx.lineTo(...P(faultX(topo(88)), topo(88))); ctx.stroke(); ctx.setLineDash([]);
    /* 지층 이름 */
    ctx.font = `600 10.5px ${F.mono}`; ctx.textAlign = "center";
    [["편마암", 12, 8], ["S1", 40, 15], ["S2", 69, 8], ["S3", 71, 23], ["S4", 40, 33.5], ["S5", 45, 39], ["S6", 40, 48], ["암맥", 62, 8]].forEach(([t, x, z]) => {
      const [a, b] = P(x, z); ctx.fillStyle = "rgba(251,251,248,.82)"; const tw = ctx.measureText(t).width + 6; ctx.fillRect(a - tw / 2, b - 9, tw, 13); ctx.fillStyle = C.ink; ctx.fillText(t, a, b + 1);
    });
    /* 경계면 기호 */
    CT.forEach((c, i) => {
      const [a, b] = P(c.x, c.z);
      ctx.fillStyle = i === sel ? C.amber : C.card; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.arc(a, b, 9, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = C.ink; ctx.font = `600 11px ${F.sans}`; ctx.fillText(c.k, a, b + 4);
    });
    /* 축척 */
    ctx.fillStyle = C.ink; ctx.fillRect(w - 10 - 10 * s, 8, 10 * s, 3);
    ctx.font = `10px ${F.mono}`; ctx.textAlign = "right"; ctx.fillText("10 m", w - 12 - 10 * s, 13);
    ctx.textAlign = "left"; ctx.fillStyle = C.ink2; ctx.fillText("서 ←", 4, 13); ctx.fillText("→ 동", 34, 13);
  }

  /* ── 가까이 본 모습 ── */
  const zv = fit($(".sc-zoom"), () => drawZoom());
  function drawZoom() {
    const { ctx } = zv, { w, h } = zv.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const t = CT[sel].t, mid = h * 0.5;
    const R = ((s) => () => (s = (s * 16807) % 2147483647) / 2147483647)(sel * 97 + 11);
    const beds = (y0, y1, dip, cols, step, clipFn) => {
      ctx.save(); ctx.beginPath(); clipFn(); ctx.clip();
      const tn = Math.tan(dip * D2R);
      for (let k = -40; k < 60; k++) {
        ctx.fillStyle = cols[((k % cols.length) + cols.length) % cols.length];
        ctx.beginPath(); const c0 = k * step;
        ctx.moveTo(0, y1 - c0); ctx.lineTo(w, y1 - c0 - tn * w); ctx.lineTo(w, y1 - c0 - step - tn * w); ctx.lineTo(0, y1 - c0 - step); ctx.closePath(); ctx.fill();
      }
      ctx.restore();
    };
    const pebbles = (yf, n, cols) => { for (let i = 0; i < n; i++) { const x = R() * w, y = yf(x) - 2 - R() * 10, r = 2 + R() * 5; ctx.fillStyle = cols[Math.floor(R() * cols.length)]; ctx.strokeStyle = "rgba(0,0,0,.35)"; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.ellipse(x, y, r * 1.3, r, R() * 3, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); } };
    const surf = (amp, f) => (x) => mid + amp * Math.sin(x / f) + amp * 0.5 * Math.sin(x / (f * 0.37));
    const below = (yf) => () => { ctx.moveTo(0, h); for (let x = 0; x <= w; x += 3) ctx.lineTo(x, yf(x)); ctx.lineTo(w, h); ctx.closePath(); };
    const above = (yf) => () => { ctx.moveTo(0, 0); for (let x = 0; x <= w; x += 3) ctx.lineTo(x, yf(x)); ctx.lineTo(w, 0); ctx.closePath(); };
    const line = (yf, col, lw) => { ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath(); for (let x = 0; x <= w; x += 3) x ? ctx.lineTo(x, yf(x)) : ctx.moveTo(x, yf(x)); ctx.stroke(); };
    if (t === "conf") {
      const yf = (x) => mid + 0.7 * (x - w / 2) * 0;
      beds(0, h, 0, ["#77736b", "#6f6b63"], 7, below(yf));
      const g = ctx.createLinearGradient(0, mid, 0, mid - 28); g.addColorStop(0, "#77736b"); g.addColorStop(1, "#d9c48f");
      ctx.fillStyle = g; ctx.fillRect(0, mid - 28, w, 28);
      beds(0, mid - 28, 0, ["#d9c48f", "#d2bc86"], 9, () => ctx.rect(0, 0, w, mid - 28));
    } else if (t === "non") {
      const yf = surf(5, 30);
      ctx.save(); ctx.beginPath(); below(yf)(); ctx.clip();
      ctx.fillStyle = "#a39892"; ctx.fillRect(0, 0, w, h);
      for (let k = -20; k < 40; k++) { ctx.strokeStyle = k % 3 ? "rgba(60,50,50,.45)" : "rgba(240,235,225,.6)"; ctx.lineWidth = k % 3 ? 2 : 3; ctx.beginPath(); for (let y = mid - 10; y <= h; y += 3) { const x = k * 14 + (h - y) * 0.36 + 3 * Math.sin(y / 6 + k); y === mid - 10 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke(); }
      ctx.fillStyle = "rgba(200,170,120,.35)"; ctx.fillRect(0, 0, w, h * 0.62);
      ctx.restore();
      beds(0, mid, 0, ["#b59a74", "#77736b", "#6f6b63"], 9, above(yf));
      pebbles(yf, 26, ["#a39892", "#ddd5cc", "#6c605a"]);
    } else if (t === "ang") {
      const yf = surf(2, 40);
      beds(0, h, 28, ["#d9c48f", "#bfc2b8", "#77736b"], 12, below(yf));
      beds(0, yf(0), 2, ["#b59a74", "#cfb889", "#c8b07f"], 9, above(yf));
      pebbles(yf, 22, ["#bfc2b8", "#d9c48f", "#77736b"]);
    } else if (t === "para") {
      const yf = surf(7, 18);
      beds(0, h, 2, ["#8d8274", "#83786a"], 8, below(yf));
      beds(0, mid, 2, ["#a58f70", "#cdcfc6", "#c3c5bc"], 10, above(yf));
      pebbles(yf, 24, ["#8d8274", "#3f3b3a", "#3f3b3a", "#a59a8a"]);
    } else if (t === "intr") {
      const x0 = w * 0.42, x1 = w * 0.62;
      beds(0, h, 28, ["#77736b", "#6f6b63"], 8, () => ctx.rect(0, 0, w, h));
      const g1 = ctx.createLinearGradient(x0 - 40, 0, x0, 0); g1.addColorStop(0, "rgba(40,36,34,0)"); g1.addColorStop(1, "rgba(40,36,34,.75)");
      ctx.fillStyle = g1; ctx.fillRect(x0 - 40, 0, 40, h);
      const g2 = ctx.createLinearGradient(x1, 0, x1 + 40, 0); g2.addColorStop(0, "rgba(40,36,34,.75)"); g2.addColorStop(1, "rgba(40,36,34,0)");
      ctx.fillStyle = g2; ctx.fillRect(x1, 0, 40, h);
      ctx.fillStyle = "#3f3b3a"; ctx.fillRect(x0, 0, x1 - x0, h);
      for (let i = 0; i < 260; i++) { const x = x0 + R() * (x1 - x0), y = R() * h, edge = Math.min(x - x0, x1 - x) / (x1 - x0); const r = 0.5 + edge * 4; ctx.fillStyle = R() < 0.5 ? "rgba(230,230,220,.35)" : "rgba(10,10,10,.5)"; ctx.fillRect(x, y, r, r); }
      ctx.fillStyle = "#1f1c1b"; ctx.fillRect(x0, 0, 4, h); ctx.fillRect(x1 - 4, 0, 4, h);
      ctx.fillStyle = "#77736b"; ctx.strokeStyle = "#2a2624"; [[0.5, 0.3], [0.54, 0.72]].forEach(([u, v]) => { ctx.beginPath(); ctx.moveTo(w * u - 9, h * v - 5); ctx.lineTo(w * u + 8, h * v - 8); ctx.lineTo(w * u + 10, h * v + 6); ctx.lineTo(w * u - 7, h * v + 7); ctx.closePath(); ctx.fill(); ctx.stroke(); });
    } else {
      const fx = (y) => w * 0.48 + (h - y) * 0.18;
      beds(0, h, 3, ["#cdcfc6", "#8d8274", "#cfb889"], 13, () => { ctx.moveTo(0, 0); ctx.lineTo(fx(0), 0); ctx.lineTo(fx(h), h); ctx.lineTo(0, h); });
      beds(0, h + 22, 3, ["#cdcfc6", "#8d8274", "#cfb889"], 13, () => { ctx.moveTo(w, 0); ctx.lineTo(fx(0), 0); ctx.lineTo(fx(h), h); ctx.lineTo(w, h); });
      ctx.fillStyle = "#5a4e46"; ctx.beginPath(); ctx.moveTo(fx(0) - 6, 0); ctx.lineTo(fx(0) + 6, 0); ctx.lineTo(fx(h) + 6, h); ctx.lineTo(fx(h) - 6, h); ctx.closePath(); ctx.fill();
      for (let i = 0; i < 50; i++) { const y = R() * h, x = fx(y) + (R() - 0.5) * 10; ctx.fillStyle = R() < 0.5 ? "#cdcfc6" : "#8d8274"; ctx.beginPath(); ctx.moveTo(x, y - 3); ctx.lineTo(x + 3, y + 2); ctx.lineTo(x - 2, y + 3); ctx.closePath(); ctx.fill(); }
    }
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = "rgba(251,251,248,.85)"; ctx.fillRect(4, 4, ctx.measureText(`경계면 ${CT[sel].k} · 폭 약 1 m`).width + 10, 16);
    ctx.fillStyle = C.ink; ctx.textAlign = "left"; ctx.fillText(`경계면 ${CT[sel].k} · 폭 약 1 m`, 8, 16);
  }

  /* ── 기록과 그래프 ── */
  const tbl = L.table($(".tbl-host"), [
    { key: "k", label: "경계면" }, { key: "lo", label: "아래 경사 (°)", res: 1 }, { key: "hi", label: "위 경사 (°)", res: 1 }, { key: "dd", label: "차 (°)", res: 1 }, { key: "id", label: "판정" },
  ], () => drawPlot());
  const pv = fit($(".sc-plot"), () => drawPlot());
  function drawPlot() {
    const { ctx } = pv, { w, h } = pv.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const b = { x0: 44, y0: 22, w: w - 60, h: h - 56 };
    const r = L.plot(ctx, b, { pts: tbl.rows.map((x) => ({ x: x.lo, y: x.hi })), xr: [0, 95], yr: [0, 95], xlabel: "아래 지층(또는 면)의 경사 (°)", ylabel: "위 지층(또는 면)의 경사 (°)", model: (x) => x });
    ctx.fillStyle = "rgba(59,124,42,.12)"; ctx.beginPath(); ctx.moveTo(r.X(0), r.Y(4)); ctx.lineTo(r.X(91), r.Y(95)); ctx.lineTo(r.X(95), r.Y(95)); ctx.lineTo(r.X(95), r.Y(91)); ctx.lineTo(r.X(4), r.Y(0)); ctx.lineTo(r.X(0), r.Y(0)); ctx.closePath(); ctx.fill();
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink2; ctx.textAlign = "left";
    ctx.fillText("띠: 위 = 아래 ±4°", r.X(56), r.Y(12));
    ctx.fillText("(측정 오차의 2배)", r.X(56), r.Y(12) + 13);
    ctx.textAlign = "left";
    const done = new Set();
    tbl.rows.forEach((x) => { if (done.has(x.k)) return; done.add(x.k); ctx.fillStyle = C.ink; ctx.fillText(x.k, r.X(x.lo) + 7, r.Y(x.hi) - 5); });
  }
  const verdict = (t, ok) => { const v = $(".sc-v"); v.textContent = t; v.className = "verdict sc-v" + (ok == null ? "" : ok ? " good" : " bad"); };
  function measure() {
    const c = CT[sel];
    const lo = L.measure(c.dip[0], { sd: 2, res: 1 }), hi = L.measure(c.dip[1], { sd: 2, res: 1 });
    tbl.add({ k: c.k, lo, hi, dd: Math.abs(hi - lo), id: "—", _i: sel });
  }
  function selectCT(i) { sel = i; root.querySelector(".sc-ev").textContent = `경계면 ${CT[i].k}: ${CT[i].ev}`; draw(); drawZoom(); }

  $(".sc-cv").addEventListener("click", (e) => {
    const r = e.currentTarget.getBoundingClientRect(), { s, ox, oy } = geo();
    const mx = e.clientX - r.left, my = e.clientY - r.top;
    let best = -1, bd = 400;
    CT.forEach((c, i) => { const d = (ox + c.x * s - mx) ** 2 + (oy - c.z * s - my) ** 2; if (d < bd) { bd = d; best = i; } });
    if (best >= 0) selectCT(best);
  });
  $(".meas").addEventListener("click", measure);
  $(".clear").addEventListener("click", () => { tbl.clear(); verdict(""); });
  $(".sc-type").addEventListener("click", (e) => {
    const b = e.target.closest("[data-t]"); if (!b) return;
    const c = CT[sel], ok = b.dataset.t === c.t;
    tbl.rows.filter((r) => r._i === sel).forEach((r) => { r.id = TN[b.dataset.t] + (ok ? " ✓" : " ✗"); });
    if (tbl.rows.length) tbl.add(tbl.rows.pop());
    verdict(ok ? `맞습니다. 경계면 ${c.k}는 ${TN[c.t]}입니다.` : `경계면 ${c.k}를 다시 보세요. 경사를 여러 번 재어 위아래가 나란한지, 그리고 침식·관입·어긋남의 증거가 있는지 확인하세요.`, ok);
  });
  const showSeq = () => {
    const el = $(".sc-seq");
    if (!seq.length) { el.textContent = "오래된 것부터 차례로 누르세요."; return; }
    const ok = seq.every((e, i) => e === RIGHT[i]);
    el.textContent = seq.map((e) => EN[e]).join(" → ") + (seq.length === RIGHT.length ? (ok ? "   ✓ 맞습니다." : "   ✗ 어딘가 순서가 다릅니다.") : ok ? "" : "   (여기까지 순서가 맞지 않습니다)");
  };
  $(".sc-hist").addEventListener("click", (e) => {
    if (e.target.closest(".sc-reset")) { seq = []; showSeq(); return; }
    const b = e.target.closest("[data-e]"); if (!b || seq.includes(b.dataset.e)) return;
    seq.push(b.dataset.e); showSeq();
  });

  selectCT(0); showSeq();
  if (L.demo) {
    [1, 2, 3, 0, 4].forEach((i) => { sel = i; measure(); measure(); });
    tbl.rows.forEach((r) => { if (r._i !== 4) r.id = TN[CT[r._i].t] + " ✓"; });
    tbl.add(tbl.rows.pop());
    seq = ["G", "A", "T", "B", "D"]; showSeq();
    selectCT(4);
  }
})();
