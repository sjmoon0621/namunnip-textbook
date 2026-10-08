/* 카드: 공 4개에서 2개를 뽑는 방법은 몇 가지일까? — 복원·비복원추출의 표본 표(4×4)와 표본평균의 확률분포 */
(() => {
  const root = document.getElementById("card-stat-draw-replace");
  if (!root) return;
  const { C, F, fit, axes } = NM;
  const S = NMStat;
  const $ = (s) => root.querySelector(s), cv = $("canvas"), chips = [...root.querySelectorAll(".presets .chip")];
  const V = [1, 2, 3, 4], N = 4, MEANS = [1, 1.5, 2, 2.5, 3, 3.5, 4];
  let rep = true, sel = null, tally = new Array(7).fill(0), total = 0, r = S.rng(5), geo = null;
  const { ctx, size } = fit(cv, () => draw());
  const valid = (i, j) => rep || i !== j;
  const cells = () => { const a = []; for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) if (valid(i, j)) a.push([i, j]); return a; };
  const idx = (i, j) => V[i] + V[j] - 2; // 평균 (V[i]+V[j])/2 의 MEANS 번호
  const dist = () => { const c = cells(), p = new Array(7).fill(0); c.forEach(([i, j]) => { p[idx(i, j)] += 1 / c.length; }); return p; };
  const lab = (v) => (Number.isInteger(v) ? String(v) : v.toFixed(1));

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const gx = 24, gy = 20, g = Math.min(h - gy - 6, w * 0.5 - gx), cs = g / N;
    geo = { gx, gy, cs };
    ctx.font = `600 11px ${F.mono}`; ctx.fillStyle = C.ink2; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    for (let k = 0; k < N; k++) { ctx.fillText(V[k], gx + (k + 0.5) * cs, gy - 9); ctx.fillText(V[k], gx - 11, gy + (k + 0.5) * cs); }
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
      const x = gx + j * cs, y = gy + i * cs, ok = valid(i, j), on = sel && sel[0] === i && sel[1] === j;
      ctx.fillStyle = !ok ? C.rule : on ? C.sprout : C.card; ctx.fillRect(x, y, cs, cs);
      ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, y + 0.5, cs - 1, cs - 1);
      if (!ok) {
        ctx.beginPath(); ctx.moveTo(x + 6, y + 6); ctx.lineTo(x + cs - 6, y + cs - 6); ctx.moveTo(x + cs - 6, y + 6); ctx.lineTo(x + 6, y + cs - 6); ctx.stroke();
        continue;
      }
      ctx.fillStyle = on ? C.forest : C.ink; ctx.font = `${on ? 700 : 500} ${Math.min(13, cs * 0.3)}px ${F.mono}`;
      ctx.fillText(lab((V[i] + V[j]) / 2), x + cs / 2, y + cs / 2);
    }
    if (sel) { ctx.strokeStyle = C.warn; ctx.lineWidth = 2.5; ctx.strokeRect(gx + sel[1] * cs + 1.5, gy + sel[0] * cs + 1.5, cs - 3, cs - 3); }

    /* 오른쪽: X̄의 확률분포 */
    const p = dist(), x0 = gx + g + 40, y0 = 14, gw = w - x0 - 10, gh = h - y0 - 24, YM = 0.4;
    const X = (k) => x0 + (k + 0.5) / 7 * gw, Y = (v) => y0 + (YM - v) / YM * gh;
    axes(ctx, { x0, y0, w: gw, h: gh, X, Y, xt: [0, 2, 4, 6].map((k) => [k, lab(MEANS[k])]), yt: [0, 0.1, 0.2, 0.3, 0.4].map((v) => [v, S.short(v, 1)]) });
    const bw = gw / 7 * 0.7;
    p.forEach((v, k) => {
      if (!v) return;
      ctx.fillStyle = sel && idx(sel[0], sel[1]) === k ? C.leaf : C.sprout;
      ctx.fillRect(X(k) - bw / 2, Y(v), bw, Y(0) - Y(v));
    });
    if (total) {
      ctx.fillStyle = C.warn;
      tally.forEach((c, k) => { if (c || p[k]) { ctx.beginPath(); ctx.arc(X(k), Y(c / total), 3.2, 0, 7); ctx.fill(); } });
    }
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "right"; ctx.textBaseline = "alphabetic";
    ctx.fillText("x̄", x0 + gw, y0 + gh + 26);
  }

  function update() {
    const c = cells(), p = dist();
    const e = p.reduce((s, v, k) => s + v * MEANS[k], 0), va = p.reduce((s, v, k) => s + v * (MEANS[k] - e) ** 2, 0);
    $(".n-k").textContent = `${c.length}가지`;
    $(".n-sel").textContent = sel ? `(${V[sel[0]]}, ${V[sel[1]]}) → ${lab((V[sel[0]] + V[sel[1]]) / 2)}` : "—";
    $(".n-e").textContent = S.short(e, 3);
    $(".n-v").textContent = S.fmt(va, 3);
    draw();
  }
  const drawOne = () => { const c = cells(), [i, j] = c[Math.floor(r() * c.length)]; sel = [i, j]; tally[idx(i, j)]++; total++; };
  const reset = () => { tally = new Array(7).fill(0); total = 0; sel = null; };
  chips.forEach((b) => b.addEventListener("click", () => {
    rep = b.dataset.r === "1"; reset();
    chips.forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    update();
  }));
  $(".go-one").addEventListener("click", () => { drawOne(); update(); });
  $(".go-100").addEventListener("click", () => { for (let k = 0; k < 100; k++) drawOne(); update(); });
  $(".go-reset").addEventListener("click", () => { reset(); update(); });
  cv.addEventListener("click", (ev) => {
    if (!geo) return;
    const b = cv.getBoundingClientRect(), x = ev.clientX - b.left, y = ev.clientY - b.top;
    const j = Math.floor((x - geo.gx) / geo.cs), i = Math.floor((y - geo.gy) / geo.cs);
    if (i < 0 || i >= N || j < 0 || j >= N || !valid(i, j)) return;
    sel = [i, j]; update();
  });
  update();
})();
