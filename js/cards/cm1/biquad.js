/* 카드: 사차방정식을 이차방정식처럼 풀 수 있을까? — x² = t로 놓고 t의 근과 x의 근을 두 그래프로 비교 */
(() => {
  const root = document.getElementById("card-cm1-biquad");
  if (!root) return;
  const { C, F, fit, axes } = NM;
  const E = NMEq;
  const $ = (s) => root.querySelector(s), btns = [...root.querySelectorAll(".presets .chip")];
  const sp = $(".p"), sq = $(".q");
  const Y0 = -12, Y1 = 12, T0 = -6, T1 = 8, XA = -3, XB = 3;
  const { ctx, size } = fit($("canvas"), () => draw());
  const sgn = (v) => String(v).replace("-", "−");

  function sqrtText(t) {
    if (Math.abs(t) < 1e-9) return "0";
    const neg = t < 0, a = Math.abs(t);
    if (!E.isNice(a)) return `≈ ±${Math.sqrt(a).toFixed(2)}${neg ? "i" : ""}`;
    let d = 1; while (Math.abs(a * d - Math.round(a * d)) > 1e-9) d++;
    const n = Math.round(a * d), { k, m } = E.sqf(n * d), g = E.gcd(k, d), K = k / g, Dd = d / g;
    let core = m === 1 ? String(K) : (K === 1 ? "" : K) + "√" + m;
    if (neg) core = (core === "1" ? "" : core) + "i";
    return "±" + (Dd === 1 ? core : `${core}/${Dd}`);
  }

  function solve() {
    const p = +sp.value, q = +sq.value, R = E.quadRoots(1, p, q);
    const ts = R.kind === "imag" ? [] : R.kind === "double" ? [R.real[0]] : R.real;
    const tt = R.kind === "imag" ? [] : R.kind === "double" ? [R.text[0]] : R.text;
    const xr = new Set();
    ts.forEach((t) => { if (Math.abs(t) < 1e-9) xr.add(0); else if (t > 0) { xr.add(Math.sqrt(t)); xr.add(-Math.sqrt(t)); } });
    return { p, q, R, ts, tt, xr: [...xr].sort((a, b) => a - b) };
  }

  function panel(x0, y0, gw, gh, A, B, ticks, name) {
    const X = (x) => x0 + (x - A) / (B - A) * gw, Y = (y) => y0 + (Y1 - y) / (Y1 - Y0) * gh;
    axes(ctx, { x0, y0, w: gw, h: gh, X, Y, xt: ticks.map((v) => [v, sgn(v)]), yt: [-10, -5, 0, 5, 10].map((v) => [v, sgn(v)]) });
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, Y(0)); ctx.lineTo(x0 + gw, Y(0)); ctx.moveTo(X(0), y0); ctx.lineTo(X(0), y0 + gh); ctx.stroke();
    ctx.font = `600 11.5px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.textAlign = "right"; ctx.textBaseline = "alphabetic";
    ctx.fillText(name, x0 + gw - 2, y0 + gh + 26);
    return { X, Y };
  }
  function plot(f, X, Y, A, B, box, col) {
    ctx.save(); ctx.beginPath(); ctx.rect(box.x, box.y, box.w, box.h); ctx.clip();
    ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.beginPath();
    for (let i = 0; i <= 240; i++) { const x = A + (B - A) * i / 240; i ? ctx.lineTo(X(x), Y(f(x))) : ctx.moveTo(X(x), Y(f(x))); }
    ctx.stroke(); ctx.restore();
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const S = solve(), gap = 34, lw = 28, top = 10, gh = h - top - 34, pw = (w - lw * 2 - gap - 6) / 2;
    const L = { x: lw, y: top, w: pw, h: gh }, Rb = { x: lw * 2 + pw + gap, y: top, w: pw, h: gh };
    const a = panel(L.x, L.y, L.w, L.h, T0, T1, [-4, 0, 4, 8], "t");
    ctx.fillStyle = C.rule; ctx.globalAlpha = 0.45; ctx.fillRect(L.x, L.y, a.X(0) - L.x, L.h); ctx.globalAlpha = 1;
    plot((t) => t * t + S.p * t + S.q, a.X, a.Y, T0, T1, L, C.amber);
    S.ts.forEach((t) => { if (t < T0 || t > T1) return; ctx.fillStyle = t < -1e-9 ? C.warn : C.forest; ctx.beginPath(); ctx.arc(a.X(t), a.Y(0), 5.5, 0, 7); ctx.fill(); });
    const b = panel(Rb.x, Rb.y, Rb.w, Rb.h, XA, XB, [-3, -2, -1, 0, 1, 2, 3], "x");
    plot((x) => x ** 4 + S.p * x * x + S.q, b.X, b.Y, XA, XB, Rb, C.forest);
    S.xr.forEach((x) => { if (x < XA || x > XB) return; ctx.fillStyle = C.forest; ctx.beginPath(); ctx.arc(b.X(x), b.Y(0), 5.5, 0, 7); ctx.fill(); });
    ctx.font = `600 11px ${F.sans}`; ctx.textAlign = "left"; ctx.textBaseline = "top";
    const lab = (t, x, y, col) => { const tw = ctx.measureText(t).width; ctx.fillStyle = C.card; ctx.fillRect(x - 2, y - 1, tw + 4, 15); ctx.fillStyle = col; ctx.fillText(t, x, y); };
    lab("y = t² + pt + q", L.x + 4, L.y + 3, C.amber);
    lab("y = x⁴ + px² + q", Rb.x + 4, Rb.y + 3, C.forest);
  }

  function update() {
    const S = solve();
    $(".p-out").textContent = sgn(S.p); $(".q-out").textContent = sgn(S.q);
    btns.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.pq === `${S.p},${S.q}`)));
    const tp = (S.p === 0 ? "" : ` ${S.p < 0 ? "−" : "+"} ${Math.abs(S.p) === 1 ? "" : Math.abs(S.p)}<i>t</i>`) + (S.q === 0 ? "" : ` ${S.q < 0 ? "−" : "+"} ${Math.abs(S.q)}`);
    $(".eq").innerHTML = `<i>x</i><sup>2</sup> = <i>t</i> → <i>t</i><sup>2</sup>${tp} = 0, 판별식 D = ${sgn(S.R.D)}`;
    if (S.R.kind === "imag") {
      $(".n-t").textContent = `${S.R.text.join(", ")} (허수)`;
      $(".n-x").textContent = "허근 4개";
    } else {
      $(".n-t").textContent = S.tt.join(", ") + (S.R.kind === "double" ? " (중근)" : "");
      $(".n-x").textContent = S.ts.map(sqrtText).join(", ");
    }
    const c = $(".n-c"); c.textContent = `${S.xr.length}개`; c.className = `n-c ${S.xr.length ? "good" : "bad"}`;
    draw();
  }
  sp.addEventListener("input", update); sq.addEventListener("input", update);
  btns.forEach((b) => b.addEventListener("click", () => { const [p, q] = b.dataset.pq.split(","); sp.value = p; sq.value = q; update(); }));
  update();
})();
