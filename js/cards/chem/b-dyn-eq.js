/* 카드: 반응이 멈춘 것처럼 보일 때, 실제로는 무슨 일이 일어날까? — A ⇌ B 입자 시뮬레이션 (모식) */
(() => {
  const root = document.getElementById("card-chem-dyn-eq");
  if (!root) return;
  const { C, F, clamp, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const sF = $(".kf"), sR = $(".kr"), oF = $(".kf-out"), oR = $(".kr-out"), tag = $(".tag-one");
  const dA = $(".n-a"), dB = $(".n-b"), dFw = $(".r-f"), dRv = $(".r-r");
  const CA = "#3d6fb6", CB = C.amber;

  const N = 120, R = 4.2;
  let P = [], t = 0, hist = [], events = [], sampleT = 0, flips = 0;

  function reset(mode) {
    P = [];
    for (let i = 0; i < N; i++) {
      const a = Math.random() * Math.PI * 2, sp = 0.10 + Math.random() * 0.12;
      const isB = mode === "B" ? true : mode === "A" ? false : i % 2 === 1;
      P.push({ x: Math.random(), y: Math.random(), vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, b: isB, flash: 0 });
    }
    t = 0; hist = []; events = []; sampleT = 0; flips = 0;
    record();
  }
  const count = () => P.reduce((s, p) => s + (p.b ? 1 : 0), 0);
  function record() {
    const nb = count(), win = 3;
    const f = events.filter((e) => e.t > t - win && e.d > 0).length / Math.min(win, Math.max(t, 0.5));
    const r = events.filter((e) => e.t > t - win && e.d < 0).length / Math.min(win, Math.max(t, 0.5));
    hist.push({ t, a: N - nb, b: nb, f: t > 0.4 ? f : null, r: t > 0.4 ? r : null });
    if (hist.length > 700) hist.shift();
  }

  function step(dt) {
    const k1 = +sF.value, k2 = +sR.value;
    for (const p of P) {
      p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.x < 0) { p.x = -p.x; p.vx = Math.abs(p.vx); } if (p.x > 1) { p.x = 2 - p.x; p.vx = -Math.abs(p.vx); }
      if (p.y < 0) { p.y = -p.y; p.vy = Math.abs(p.vy); } if (p.y > 1) { p.y = 2 - p.y; p.vy = -Math.abs(p.vy); }
      // 1차 반응: 입자 하나가 dt 동안 바뀔 확률 = k·dt
      const k = p.b ? k2 : k1;
      if (Math.random() < k * dt) {
        p.b = !p.b; p.flash = 0.5;
        events.push({ t, d: p.b ? 1 : -1 });
        if (p === P[0]) flips++;
      }
      p.flash = Math.max(0, p.flash - dt);
    }
    events = events.filter((e) => e.t > t - 4);
    t += dt; sampleT += dt;
    if (sampleT >= 0.1) { sampleT = 0; record(); }
  }

  const { ctx, size } = fit(cv, () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const narrow = w < 520;
    const split = Math.round(w * (narrow ? 0.44 : 0.42));
    // ── 반응 용기
    const bx = 8, by = 22, bw = split - 18, bh = h - 50;
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2; ctx.strokeRect(bx + .5, by + .5, bw, bh);
    const rr = narrow ? 3.2 : R;
    for (const p of P) {
      const x = bx + rr + p.x * (bw - 2 * rr), y = by + rr + p.y * (bh - 2 * rr);
      if (p.flash > 0) {
        ctx.beginPath(); ctx.arc(x, y, rr + 5 * p.flash / 0.5 + 1, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(35,35,38,.35)"; ctx.lineWidth = 1; ctx.stroke();
      }
      ctx.beginPath();
      if (p.b) ctx.arc(x, y, rr, 0, Math.PI * 2); else ctx.rect(x - rr, y - rr, 2 * rr, 2 * rr);
      ctx.fillStyle = p.b ? CB : CA; ctx.fill();
    }
    if (tag.checked) {
      const p = P[0], x = bx + rr + p.x * (bw - 2 * rr), y = by + rr + p.y * (bh - 2 * rr);
      ctx.beginPath(); ctx.arc(x, y, rr + 6, 0, Math.PI * 2); ctx.strokeStyle = C.apple; ctx.lineWidth = 2; ctx.stroke();
    }
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink2; ctx.textAlign = "left";
    ctx.fillText(`t = ${t.toFixed(1)} s`, bx, by - 8);
    if (tag.checked) { ctx.fillStyle = C.apple; ctx.textAlign = "right"; ctx.fillText(`표시한 입자: ${flips}번 바뀜`, bx + bw, by - 8); }
    ctx.textAlign = "left"; ctx.fillStyle = C.ink3;
    ctx.fillText("■ A   ● B   (입자 120개, 모식)", bx, by + bh + 16);

    // ── 오른쪽: 위 = 입자 수, 아래 = 1초당 바뀌는 횟수
    const x0 = split + 34, pw = w - x0 - 10;
    const gap = 40, top1 = 20, ph1 = (h - top1 - gap - 30) * 0.55, top2 = top1 + ph1 + gap, ph2 = h - top2 - 30;
    const tNow = Math.max(t, 30), tMin = tNow - 30;
    const X = (tt) => x0 + (tt - tMin) / 30 * pw;
    const Y1 = (n) => top1 + (1 - n / N) * ph1;
    const k1 = +sF.value, k2 = +sR.value;
    const rMax = Math.max(12, N * Math.max(k1, k2) * 1.05);
    const Y2 = (r) => top2 + (1 - r / rMax) * ph2;
    const xt = [];
    for (let s = Math.ceil(tMin / 10) * 10; s <= tNow; s += 10) xt.push([s, `${s}`]);
    NM.axes(ctx, { x0, y0: top1, w: pw, h: ph1, X, Y: Y1, xt: [], yt: [[0, "0"], [60, "60"], [120, "120"]], ylabel: "입자 수" });
    NM.axes(ctx, { x0, y0: top2, w: pw, h: ph2, X, Y: Y2, xt, yt: niceTicks(rMax).map((v) => [v, `${v}`]), ylabel: "1초 동안 바뀌는 횟수", xlabel: "시간 (s)" });
    // 이론 평형선
    const nbEq = N * k1 / (k1 + k2);
    ctx.setLineDash([3, 4]); ctx.lineWidth = 1;
    ctx.strokeStyle = CB; ctx.beginPath(); ctx.moveTo(x0, Y1(nbEq)); ctx.lineTo(x0 + pw, Y1(nbEq)); ctx.stroke();
    ctx.strokeStyle = CA; ctx.beginPath(); ctx.moveTo(x0, Y1(N - nbEq)); ctx.lineTo(x0 + pw, Y1(N - nbEq)); ctx.stroke();
    ctx.setLineDash([]);
    const line = (key, Y, col) => {
      ctx.beginPath(); let started = false;
      for (const s of hist) { if (s.t < tMin || s[key] == null) continue; const x = X(s.t), y = Y(s[key]); started ? ctx.lineTo(x, y) : ctx.moveTo(x, y); started = true; }
      ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.stroke();
    };
    line("a", Y1, CA); line("b", Y1, CB);
    line("f", Y2, C.forest); line("r", Y2, C.warn);
    ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "right";
    ctx.fillStyle = C.forest; ctx.fillText("A→B (정반응)", x0 + pw, top2 + 12);
    ctx.fillStyle = C.warn; ctx.fillText("B→A (역반응)", x0 + pw, top2 + 26);
    ctx.fillStyle = C.ink3; ctx.fillText("점선: 평형에서 기대되는 수", x0 + pw, top1 + 12);
  }
  function niceTicks(m) {
    const s = m / 3, p = 10 ** Math.floor(Math.log10(s)), st = [1, 2, 5, 10].map((k) => k * p).find((k) => k >= s);
    const out = []; for (let v = 0; v <= m; v += st) out.push(v); return out;
  }

  function readout() {
    const last = hist[hist.length - 1];
    dA.textContent = last.a; dB.textContent = last.b;
    dFw.textContent = last.f == null ? "—" : last.f.toFixed(0);
    dRv.textContent = last.r == null ? "—" : last.r.toFixed(0);
  }
  const sync = () => { oF.textContent = (+sF.value).toFixed(2); oR.textContent = (+sR.value).toFixed(2); };
  [sF, sR].forEach((el) => el.addEventListener("input", () => { sync(); draw(); }));
  tag.addEventListener("change", () => { flips = 0; draw(); });
  root.querySelectorAll("[data-start]").forEach((b) => b.addEventListener("click", () => {
    root.querySelectorAll("[data-start]").forEach((x) => x.setAttribute("aria-pressed", x === b));
    reset(b.dataset.start); draw(); readout();
  }));
  sync(); reset("A");
  let acc = 0;
  loop(cv, (dt) => {
    const sub = 4; for (let i = 0; i < sub; i++) step(dt / sub);
    draw();
    acc += dt; if (acc > 0.25) { acc = 0; readout(); }
  });
  readout();
})();
