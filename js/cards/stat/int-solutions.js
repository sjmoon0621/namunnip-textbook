/* 카드: x + y + z = r를 만족하는 정수해는 몇 개일까? — 해 (x, y)를 삼각형 격자점으로, 최솟값 k 조건, 3H(r−3k) */
(() => {
  const root = document.getElementById("card-stat-int-solutions");
  if (!root) return;
  const { C, F, fit, axes } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sr = $(".r"), sk = $(".k");
  const Cn = (n, k) => { if (k < 0 || k > n) return 0; let v = 1; for (let i = 1; i <= k; i++) v = v * (n - k + i) / i; return Math.round(v); };
  let sel = [2, 1], drag = false;
  const { ctx, size } = fit(cv, () => draw());
  const ok = (x, y, r, k) => x >= k && y >= k && r - x - y >= k;
  const geo = () => {
    const { w, h } = size, r = +sr.value, x0 = 34, y0 = 14, s = Math.min((w - x0 - 16) / r, (h - y0 - 34) / r);
    return { r, x0, y0, s, X: (x) => x0 + x * s, Y: (y) => y0 + (r - y) * s };
  };

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const { r, x0, y0, s, X, Y } = geo(), k = +sk.value;
    const step = r > 8 ? 2 : 1, ticks = [];
    for (let v = 0; v <= r; v += step) ticks.push(v);
    axes(ctx, { x0, y0, w: r * s, h: r * s, X, Y, xt: ticks.map((v) => [v, String(v)]), yt: ticks.map((v) => [v, String(v)]) });
    ctx.fillStyle = C.ink3; ctx.font = `11px ${F.sans}`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
    ctx.fillText("x", X(r) + 4, Y(0) + 14); ctx.fillText("y", x0 - 26, y0 - 2);
    ctx.strokeStyle = C.ink3; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(X(0), Y(r)); ctx.lineTo(X(r), Y(0)); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.ink2; ctx.textAlign = "right"; ctx.font = `10.5px ${F.sans}`;
    ctx.fillText("z = 0인 선 (x + y = r)", X(r) - 2, Y(r) + 8);
    ctx.fillStyle = "rgba(116,171,102,.14)"; ctx.fillRect(X(sel[0]) - s / 2, Y(r - sel[0]) - s / 2, s, (r - sel[0] + 1) * s);
    const rad = Math.max(2.5, Math.min(6, s * 0.18));
    for (let x = 0; x <= r; x++) for (let y = 0; x + y <= r; y++) {
      const good = ok(x, y, r, k), on = x === sel[0] && y === sel[1];
      ctx.fillStyle = on ? C.warn : good ? C.forest : C.rule;
      ctx.beginPath(); ctx.arc(X(x), Y(y), on ? rad + 3 : rad, 0, 7); ctx.fill();
    }
    const z = r - sel[0] - sel[1];
    ctx.font = `600 11.5px ${F.mono}`; ctx.textAlign = "left"; ctx.fillStyle = C.warn;
    const label = `(${sel[0]}, ${sel[1]}, ${z})`, tw = ctx.measureText(label).width;
    const lx = X(sel[0]) + 10 + tw > w - 4 ? X(sel[0]) - 10 - tw : X(sel[0]) + 10;
    ctx.fillStyle = C.card; ctx.fillRect(lx - 2, Y(sel[1]) - 18, tw + 4, 14);
    ctx.fillStyle = C.warn; ctx.fillText(label, lx, Y(sel[1]) - 11);
  }

  function update() {
    const r = +sr.value, k = +sk.value, m = r - 3 * k;
    $(".r-out").textContent = r; $(".k-out").textContent = k;
    if (!ok(sel[0], sel[1], r, k)) {
      sel = m >= 0 ? [k + Math.floor(m / 3), k + Math.floor(m / 3)] : [Math.min(sel[0], r), Math.min(sel[1], r - Math.min(sel[0], r))];
    }
    const [x, y] = sel, z = r - x - y, good = ok(x, y, r, k);
    $(".n-sol").textContent = `(${x}, ${y}, ${z})${good ? "" : " — 조건 밖"}`;
    const ys = Math.max(0, r - x - k - k + 1);
    $(".n-col").textContent = x >= k ? `y = ${k}부터 ${r - x - k}까지 ${ys}개` : "0개 (x가 너무 작음)";
    let cnt = 0; for (let a = 0; a <= r; a++) for (let b = 0; a + b <= r; b++) if (ok(a, b, r, k)) cnt++;
    $(".n-cnt").textContent = cnt;
    $(".n-h").innerHTML = m >= 0 ? `<sub>3</sub>H<sub>${m}</sub> = <sub>${m + 2}</sub>C<sub>${m}</sub> = ${Cn(m + 2, m)}` : `r − 3k = ${m} &lt; 0 → 해 없음`;
    draw();
  }
  const pick = (e) => {
    const b = cv.getBoundingClientRect(), { r, s, X, Y } = geo(), k = +sk.value;
    let x = Math.round((e.clientX - b.left - X(0)) / s), y = Math.round((Y(0) - (e.clientY - b.top)) / s);
    x = Math.max(0, Math.min(r, x)); y = Math.max(0, Math.min(r - x, y));
    if (ok(x, y, r, k) && (x !== sel[0] || y !== sel[1])) { sel = [x, y]; update(); }
  };
  cv.addEventListener("pointerdown", (e) => { drag = true; cv.setPointerCapture(e.pointerId); pick(e); });
  cv.addEventListener("pointermove", (e) => { if (drag) pick(e); });
  cv.addEventListener("pointerup", () => { drag = false; });
  [sr, sk].forEach((s) => s.addEventListener("input", update));
  update();
})();
