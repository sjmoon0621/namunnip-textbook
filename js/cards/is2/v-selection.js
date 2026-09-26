/* 카드: 자연선택은 어떻게 작동할까? — 나방 집단 시뮬레이션 (모식) */
(() => {
  const root = document.getElementById("card-is2-selection");
  if (!root) return;
  const { C, F, clamp, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const bgS = $(".bg"), bgO = $(".bg-out"), pS = $(".pred"), pO = $(".pred-out");
  const varT = $(".var"), herT = $(".her"), stepB = $(".step"), autoB = $(".auto"), resetB = $(".reset");
  const nGen = $(".gen"), nMean = $(".mean"), nSurv = $(".surv"), msg = $(".msg");

  const N = 120;
  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const gauss = () => { let u = 0, v = 0; while (!u) u = rnd(); v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  const init = () => varT.checked ? clamp(0.2 + 0.12 * gauss(), 0, 1) : 0.2; // 처음 집단: 대부분 밝은 색

  let pop = [], pos = [], eaten = [], gen = 0, hist = [], lastSurv = null, flash = 0, auto = false, acc = 0;
  function reset() {
    seed = 7; gen = 0; lastSurv = null; eaten = []; flash = 0;
    pop = Array.from({ length: N }, init);
    pos = Array.from({ length: N }, () => [rnd(), rnd()]);
    hist = [mean()];
    update();
  }
  const mean = () => pop.reduce((a, b) => a + b, 0) / pop.length;

  function step() {
    const bg = +bgS.value / 100, P = +pS.value / 100;
    const surv = [];
    eaten = [];
    pop.forEach((g, i) => {
      const seen = Math.min(1, Math.abs(g - bg) * 1.6); // 배경과 다를수록 눈에 잘 띈다
      if (rnd() < P * seen) eaten.push(i); else surv.push(g);
    });
    lastSurv = surv.length / N;
    const old = pop.slice();
    if (surv.length === 0) { pop = []; }
    else pop = Array.from({ length: N }, () => {
      const parent = surv[Math.floor(rnd() * surv.length)];
      if (!herT.checked) return init(); // 형질이 유전되지 않으면 부모와 무관
      return varT.checked ? clamp(parent + 0.03 * gauss(), 0, 1) : parent;
    });
    flash = { old, pos: pos, t: NM.reduce ? 0 : 0.8 };
    pos = Array.from({ length: N }, () => [rnd(), rnd()]);
    gen++; hist.push(pop.length ? mean() : NaN);
    if (hist.length > 60) hist.shift();
    update();
  }

  const { ctx, size } = fit(cv, () => draw());
  const lerp = (a, b, t) => a + (b - a) * t;
  const shade = (t, lo, hi) => { const c = [0, 1, 2].map((k) => Math.round(lerp(lo[k], hi[k], t))); return `rgb(${c})`; };
  const barkCol = (t) => shade(t, [214, 208, 192], [58, 55, 50]);
  const mothCol = (t) => shade(t, [242, 238, 226], [34, 32, 30]);

  function moth(x, y, s, col, dead) {
    ctx.fillStyle = col; ctx.strokeStyle = "rgba(0,0,0,.25)"; ctx.lineWidth = .6;
    ctx.beginPath(); ctx.moveTo(x, y - s * .2); ctx.lineTo(x - s, y - s * .55); ctx.lineTo(x - s * .8, y + s * .5); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, y - s * .2); ctx.lineTo(x + s, y - s * .55); ctx.lineTo(x + s * .8, y + s * .5); ctx.closePath(); ctx.fill(); ctx.stroke();
    if (dead) { ctx.strokeStyle = C.warn; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - s, y - s); ctx.lineTo(x + s, y + s); ctx.moveTo(x + s, y - s); ctx.lineTo(x - s, y + s); ctx.stroke(); }
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const narrow = w < 480;
    const sc = narrow ? { x: 0, y: 0, w, h: h * 0.4 } : { x: 0, y: 0, w: w * 0.52, h };
    const bg = +bgS.value / 100;
    // 나무껍질
    ctx.fillStyle = barkCol(bg); ctx.fillRect(sc.x, sc.y, sc.w, sc.h);
    ctx.strokeStyle = shade(bg, [190, 183, 166], [40, 38, 34]); ctx.lineWidth = 2;
    for (let k = 0; k < 9; k++) { const x = sc.x + (k + .5) * sc.w / 9; ctx.beginPath(); ctx.moveTo(x, sc.y); ctx.bezierCurveTo(x + 8, sc.y + sc.h * .3, x - 8, sc.y + sc.h * .6, x + 4, sc.y + sc.h); ctx.stroke(); }
    const s = Math.max(5, Math.min(8, sc.w / 50));
    const place = (p) => [sc.x + 10 + p[0] * (sc.w - 20), sc.y + 10 + p[1] * (sc.h - 20)];
    if (flash && flash.t > 0) {
      const dead = new Set(eaten);
      flash.old.forEach((g, i) => { const [x, y] = place(flash.pos ? flash.pos[i] : pos[i]); moth(x, y, s, mothCol(g), dead.has(i)); });
    } else pop.forEach((g, i) => { const [x, y] = place(pos[i]); moth(x, y, s, mothCol(g), false); });
    ctx.font = `11px ${F.mono}`; ctx.fillStyle = bg > .5 ? "rgba(255,255,255,.8)" : "rgba(0,0,0,.6)"; ctx.textAlign = "left";
    ctx.fillText(flash && flash.t > 0 ? `${gen - 1}세대 · 새에게 잡힘 ×` : `${gen}세대 · ${pop.length}마리`, sc.x + 8, sc.y + sc.h - 8);

    // 오른쪽: 분포와 평균의 변화
    const gx = narrow ? 36 : sc.w + 44, gw = w - gx - 10;
    const top1 = narrow ? sc.h + 24 : 22, hh = narrow ? (h - sc.h) * 0.3 : h * 0.36;
    const bins = 10, cnt = new Array(bins).fill(0);
    pop.forEach((g) => cnt[Math.min(bins - 1, Math.floor(g * bins))]++);
    const cmax = Math.max(N * 0.6, ...cnt);
    const X = (v) => gx + v * gw, Yh = (c) => top1 + hh - c / cmax * hh;
    NM.axes(ctx, { x0: gx, y0: top1, w: gw, h: hh, X, Y: Yh, xt: [], yt: [[0, "0"], [60, "60"]], ylabel: "개체 수" });
    for (let b = 0; b < bins; b++) {
      ctx.fillStyle = mothCol((b + .5) / bins); ctx.strokeStyle = C.ink3; ctx.lineWidth = .8;
      ctx.fillRect(X(b / bins) + 1, Yh(cnt[b]), gw / bins - 2, top1 + hh - Yh(cnt[b])); ctx.strokeRect(X(b / bins) + 1.5, Yh(cnt[b]) + .5, gw / bins - 3, top1 + hh - Yh(cnt[b]));
    }
    // 배경 색 표시
    ctx.fillStyle = C.forest; ctx.beginPath(); ctx.moveTo(X(bg), top1 + hh + 2); ctx.lineTo(X(bg) - 5, top1 + hh + 10); ctx.lineTo(X(bg) + 5, top1 + hh + 10); ctx.fill();
    ctx.font = `10.5px ${F.sans}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left"; ctx.fillText("밝음", gx, top1 + hh + 22);
    ctx.textAlign = "right"; ctx.fillText("어두움", gx + gw, top1 + hh + 22);
    ctx.textAlign = "center"; ctx.fillStyle = C.forest; ctx.fillText("▲ 배경", clamp(X(bg), gx + 30, gx + gw - 40), top1 + hh + 22);

    const top2 = top1 + hh + 48, h2 = h - top2 - 32;
    const G = Math.max(20, hist.length - 1), g0 = gen - (hist.length - 1);
    const X2 = (k) => gx + k / G * gw, Y2 = (v) => top2 + (1 - v) * h2;
    NM.axes(ctx, { x0: gx, y0: top2, w: gw, h: h2, X: X2, Y: Y2, xt: [[0, `${g0}`], [G, `${g0 + G}`]], yt: [[0, "0"], [0.5, "50"], [1, "100"]], ylabel: "평균 어두운 정도", xlabel: "세대" });
    ctx.strokeStyle = C.forest; ctx.setLineDash([3, 3]); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(gx, Y2(bg)); ctx.lineTo(gx + gw, Y2(bg)); ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath();
    hist.forEach((v, k) => { if (isNaN(v)) return; k ? ctx.lineTo(X2(k), Y2(v)) : ctx.moveTo(X2(k), Y2(v)); }); ctx.stroke();
  }

  function update() {
    bgO.textContent = bgS.value; pO.textContent = pS.value;
    nGen.textContent = gen;
    nMean.textContent = pop.length ? Math.round(mean() * 100) : "—";
    nSurv.textContent = lastSurv === null ? "—" : `${Math.round(lastSurv * 100)}%`;
    if (!pop.length) msg.textContent = "모두 잡아먹혀 집단이 사라졌습니다. 포식 압력을 낮추고 처음부터 다시 해 보세요.";
    else if (!varT.checked) msg.textContent = "모든 개체의 색이 같습니다. 누가 잡아먹히든 운이라서, 세대가 지나도 평균이 움직이지 않습니다.";
    else if (!herT.checked) msg.textContent = "살아남은 개체의 색이 자손에게 전해지지 않습니다. 매 세대 처음 분포로 되돌아갑니다.";
    else msg.textContent = "배경과 색이 다른 개체가 더 많이 잡히고, 살아남은 개체의 색이 자손에게 전해집니다.";
    autoB.textContent = auto ? "멈추기" : "자동으로";
    draw();
  }

  stepB.addEventListener("click", () => { if (pop.length) step(); });
  autoB.addEventListener("click", () => { auto = !auto; update(); });
  resetB.addEventListener("click", () => { auto = false; reset(); });
  [varT, herT].forEach((el) => el.addEventListener("change", () => { auto = false; reset(); }));
  [bgS, pS].forEach((el) => el.addEventListener("input", update));
  root.querySelectorAll("[data-bg]").forEach((b) => b.addEventListener("click", () => { bgS.value = b.dataset.bg; update(); }));
  reset();
  loop(cv, (dt) => {
    if (flash && flash.t > 0) { flash.t -= dt; if (flash.t <= 0) draw(); else return draw(); }
    if (!auto || !pop.length) return;
    acc += dt; if (acc > 1.1) { acc = 0; step(); }
  });
})();
