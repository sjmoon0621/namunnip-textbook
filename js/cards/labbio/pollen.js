/* 카드: 꽃가루관이 가장 잘 자라는 설탕 농도는 얼마일까? — 발아율(이항 표본), 관 길이(접안 마이크로미터), 붕소, 계통 오차 */
(() => {
  const root = document.getElementById("card-labbio-pollen");
  if (!root) return;
  const { C, F, fit } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);

  /* 모식 모형 (교육용 상대값) */
  const T0 = 8, TAU = 12;                     // 발아 지연(분), 발아가 차오르는 시간 상수(분)
  const gmax = (c, b) => (c === 0 ? 10 : 88 * Math.exp(-(((c - 12) / 9) ** 2))) * (b ? 1 : 0.72);   // 최종 발아율 %
  const burst = (c) => (c === 0 ? 0.55 : c === 5 ? 0.12 : 0.02);   // 터지는 꽃가루 비율
  const speed = (c, b) => 6.5 * Math.exp(-(((c - 14) / 11) ** 2)) * (b ? 1 : 0.5);   // µm/분
  const germ = (c, b, t) => (t <= T0 ? 0 : gmax(c, b) * (1 - Math.exp(-(t - T0) / TAU)));
  const GRAIN = 45;                            // 꽃가루 지름(µm, 모식)
  const PX = 0.5;                              // 화면 1 px = 2 µm

  const st = { c: 10, t: 40, b: true };
  let xk = "c", yk = "g";
  const tbl = L.table($(".tbl-host"), [
    { key: "c", label: "설탕 (%)" }, { key: "b", label: "붕산" }, { key: "t", label: "시간 (분)" },
    { key: "g", label: "발아 (개/100)" }, { key: "div", label: "관 평균 (눈금)", res: 0.1 }, { key: "l", label: "관 길이 (µm)", res: 1 },
  ], () => drawPlot());

  /* 시야의 꽃가루 (위치·개성 고정) */
  let s = 11; const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  const grains = [];
  for (let i = 0; i < 46; i++) grains.push({ x: 0.08 + 0.84 * r(), y: 0.08 + 0.84 * r(), u: r(), v: r(), a: r() * 6.28, k: 0.6 + 0.8 * r(), bend: (r() - 0.5) * 0.8 });

  const fv = fit($(".cv-sq"), () => draw());
  const pl = fit($(".cv-plot"), () => drawPlot());

  function draw() {
    const { ctx: c, size } = fv, { w } = size; if (!w) return;
    c.clearRect(0, 0, w, w);
    c.fillStyle = C.night; c.fillRect(0, 0, w, w);
    const R = w / 2 - 4;
    c.save(); c.beginPath(); c.arc(w / 2, w / 2, R, 0, 6.3); c.clip();
    c.fillStyle = "#f4f1e4"; c.fillRect(0, 0, w, w);
    const scale = w / 420;
    const g = germ(st.c, st.b, st.t) / 100, bu = burst(st.c), sp = speed(st.c, st.b);
    const gr = GRAIN * PX * scale / 2;
    for (const p of grains) {
      const x = p.x * w, y = p.y * w;
      const isBurst = st.t > 5 && p.v < bu * Math.min(1, st.t / 20);
      const isG = !isBurst && p.u < g / (1 - bu);
      if (isG) {
        const len = Math.max(GRAIN * 1.1, sp * (st.t - T0 - p.u * TAU) * p.k) * PX * scale;
        c.strokeStyle = "rgba(170,150,90,.9)"; c.lineWidth = 3.2 * scale; c.lineCap = "round"; c.beginPath(); c.moveTo(x, y);
        let px = x, py = y, a = p.a;
        for (let k = 1; k <= 12; k++) { a += p.bend * 0.12; px += Math.cos(a) * len / 12; py += Math.sin(a) * len / 12; c.lineTo(px, py); }
        c.stroke();
        if (!st.b) { c.fillStyle = "rgba(170,150,90,.9)"; c.beginPath(); c.arc(px, py, 3.2 * scale, 0, 6.3); c.fill(); }
      }
      if (isBurst) { c.fillStyle = "rgba(200,170,80,.35)"; c.beginPath(); c.ellipse(x + gr * 0.8, y, gr * 1.6, gr * 1.1, p.a, 0, 6.3); c.fill(); }
      c.fillStyle = isBurst ? "rgba(225,205,140,.8)" : "#d7b04a"; c.strokeStyle = "#8a6a1e"; c.lineWidth = 1;
      c.beginPath(); c.arc(x, y, gr, 0, 6.3); c.fill(); c.stroke();
      c.fillStyle = "rgba(255,255,255,.4)"; c.beginPath(); c.arc(x - gr * 0.3, y - gr * 0.3, gr * 0.35, 0, 6.3); c.fill();
    }
    /* 접안 마이크로미터: 1눈금 = 10 µm */
    const y0 = w * 0.5, x0 = w * 0.2, step = 10 * PX * scale;
    c.strokeStyle = "rgba(20,20,20,.75)"; c.lineWidth = 1;
    c.beginPath(); c.moveTo(x0, y0); c.lineTo(x0 + step * 50, y0); c.stroke();
    for (let k = 0; k <= 50; k++) { const tl = k % 10 === 0 ? 10 : k % 5 === 0 ? 7 : 4; c.beginPath(); c.moveTo(x0 + k * step, y0); c.lineTo(x0 + k * step, y0 - tl); c.stroke(); }
    c.fillStyle = "rgba(20,20,20,.8)"; c.font = `10px ${F.mono}`; c.textAlign = "center";
    for (let k = 0; k <= 50; k += 10) c.fillText(String(k), x0 + k * step, y0 - 13);
    const vg = c.createRadialGradient(w / 2, w / 2, R * 0.6, w / 2, w / 2, R); vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,.25)"); c.fillStyle = vg; c.fillRect(0, 0, w, w);
    c.restore();
    c.fillStyle = "#ddd"; c.font = `11px ${F.mono}`; c.textAlign = "left"; c.fillText("×100", 8, w - 10);
    c.textAlign = "right"; c.fillText(`설탕 ${st.c}% · ${st.b ? "붕산 있음" : "붕산 없음"} · ${st.t}분`, w - 8, w - 10);
  }

  function measure() {
    const p = germ(st.c, st.b, st.t) / 100;
    let n = 0; for (let i = 0; i < 100; i++) if (Math.random() < p) n++;
    let div = NaN, l = NaN;
    if (n >= 3) {
      const mean = Math.max(GRAIN * 1.1, speed(st.c, st.b) * (st.t - T0 - TAU * 0.5));
      let sum = 0; const m = Math.min(10, n);
      for (let i = 0; i < m; i++) sum += L.measure(Math.max(GRAIN * 1.05, mean * (1 + 0.3 * L.gauss())) / 10, { sd: 0.3, res: 1 });
      div = sum / m; l = div * ($(".bias").checked ? 2.5 : 10);
    }
    tbl.add({ c: st.c, b: st.b ? "있음" : "없음", t: st.t, g: n, div, l });
  }

  function drawPlot() {
    const { ctx: c, size } = pl, { w, h } = size; if (!w) return;
    c.clearRect(0, 0, w, h);
    const box = { x0: 46, y0: 20, w: w - 60, h: h - 56 };
    const rows = tbl.rows.filter((rw) => (xk === "c" ? rw.t === st.t : rw.c === st.c));
    const xs = (rw) => (xk === "c" ? rw.c : rw.t), ys = (rw) => (yk === "g" ? rw.g : rw.l);
    const xr = xk === "c" ? [0, 30] : [0, 90];
    const yv = rows.map(ys).filter(Number.isFinite);
    const yr = yk === "g" ? [0, 100] : [0, Math.max(100, ...yv) * 1.1];
    const ser = [{ b: "없음", col: C.amber }, { b: "있음", col: C.forest }];
    ser.forEach((sr) => {
      const pts = rows.filter((rw) => rw.b === sr.b).map((rw) => ({ x: xs(rw), y: ys(rw) }));
      L.plot(c, box, { pts, xr, yr, color: sr.col, xlabel: xk === "c" ? "설탕 농도 (%)" : "배양 시간 (분)", ylabel: yk === "g" ? "발아율 (%)" : "꽃가루관 길이 (µm)" });
    });
    c.font = `11px ${F.sans}`; c.textAlign = "right";
    c.fillStyle = C.forest; c.fillText("● 붕산 있음", w - 14, 14);
    c.fillStyle = C.amber; c.fillText("● 붕산 없음", w - 90, 14);
    c.fillStyle = C.ink3; c.textAlign = "left"; c.fillText(xk === "c" ? `시간 ${st.t}분인 기록만` : `설탕 ${st.c}%인 기록만`, box.x0 + 70, 14);
    if (xk === "t" && yk === "l") {
      const pts = rows.filter((rw) => rw.b === "있음" && rw.c === st.c && Number.isFinite(rw.l) && rw.t >= 20);
      const f = L.linfit(pts.map((p) => p.t), pts.map((p) => p.l));
      if (f) { c.fillStyle = C.ink2; c.textAlign = "left"; c.font = `11px ${F.mono}`; c.fillText(`설탕 ${st.c}%, 붕산 있음, 20분 이후: 기울기 ${f.a.toFixed(1)} µm/분`, box.x0, h - 6); }
    }
  }

  const sync = () => { $(".c-out").textContent = st.c; $(".t-out").textContent = st.t; draw(); };
  $(".c").addEventListener("input", (e) => { st.c = +e.target.value; sync(); drawPlot(); });
  $(".t").addEventListener("input", (e) => { st.t = +e.target.value; sync(); drawPlot(); });
  $(".boron").addEventListener("change", (e) => { st.b = e.target.checked; draw(); });
  $(".lp-meas").addEventListener("click", measure);
  $(".lp-clear").addEventListener("click", () => tbl.clear());
  const chips = (sel, attr, set) => $(sel).addEventListener("click", (e) => {
    const b = e.target.closest(`[${attr}]`); if (!b) return; set(b.getAttribute(attr));
    $(sel).querySelectorAll(`[${attr}]`).forEach((x) => x.setAttribute("aria-pressed", String(x === b))); drawPlot();
  });
  chips(".lp-x", "data-x", (v) => (xk = v));
  chips(".lp-y", "data-y", (v) => (yk = v));

  if (L.demo) {
    st.t = 40;
    for (const b of [true, false]) { st.b = b; for (const cc of [0, 5, 10, 15, 20, 25, 30]) { st.c = cc; measure(); } }
    st.b = true; st.c = 15;
    for (const tt of [20, 30, 50, 60, 70, 80, 90]) { st.t = tt; measure(); }
    st.t = 40; $(".c").value = 15; $(".t").value = 40; $(".boron").checked = true;
    sync(); drawPlot();
  }
})();
