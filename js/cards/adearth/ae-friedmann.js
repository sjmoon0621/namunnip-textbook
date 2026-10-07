/* 카드: 우주의 팽창은 느려져야 하는데, 왜 빨라지고 있을까? — 프리드만 방정식 수치 적분, 초신성 거리 지수, 평탄성 */
(() => {
  const root = document.getElementById("card-adearth-friedmann");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const sM = $(".m"), oM = $(".m-out"), sL = $(".l"), oL = $(".l-out");
  const nK = $(".n-k"), nQ = $(".n-q"), nAge = $(".n-age"), nFate = $(".n-fate");
  const H0 = 67.4 / 977.8, OR = 9e-5; /* H0: 1/(10억 년) */
  let view = "sn";
  const sup = (e) => String(e).replace(/-/g, "⁻").replace(/\d/g, (d) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[d]);

  /* a(t): ä = −(H0²/2)(2Ωr a⁻³ + Ωm a⁻²) + H0² ΩΛ a, 지금 t = 0에서 a = 1, ȧ = H0 */
  function evolve(om, ol) {
    const acc = (a) => -0.5 * H0 * H0 * (2 * OR / a ** 3 + om / (a * a)) + H0 * H0 * ol * a;
    const run = (dir) => {
      const pts = [[0, 1]]; let t = 0, a = 1, v = H0, end = null;
      for (let i = 0; i < 20000; i++) {
        const dt = dir * Math.min(0.05, 0.02 * a / Math.max(Math.abs(v), 1e-6));
        /* RK4 */
        const k1a = v, k1v = acc(a);
        const k2a = v + k1v * dt / 2, k2v = acc(Math.max(a + k1a * dt / 2, 1e-6));
        const k3a = v + k2v * dt / 2, k3v = acc(Math.max(a + k2a * dt / 2, 1e-6));
        const k4a = v + k3v * dt, k4v = acc(Math.max(a + k3a * dt, 1e-6));
        a += (k1a + 2 * k2a + 2 * k3a + k4a) * dt / 6; v += (k1v + 2 * k2v + 2 * k3v + k4v) * dt / 6; t += dt;
        if (a < 0.01) { const rest = (2 / 3) * a / Math.abs(v); t += dir * rest; pts.push([t, 0]); end = "zero"; break; }
        pts.push([t, a]);
        if (Math.abs(t) > 60 || a > 6) break;
      }
      return { pts, end, t, v, a };
    };
    const back = run(-1), fwd = run(1);
    return { back, fwd, age: back.end === "zero" ? -back.t : null, crunch: fwd.end === "zero", accel: acc(fwd.a) > 0 };
  }
  const E2 = (z, om, ol) => { const ok = 1 - om - ol - OR, x = 1 + z; return OR * x ** 4 + om * x ** 3 + ok * x * x + ol; };
  /* 광도 거리 (c/H0 단위) */
  function dL(z, om, ol) {
    const n = 120, h = z / n; let s = 0;
    for (let i = 0; i <= n; i++) { const e = E2(i * h, om, ol); if (e <= 0) return NaN; s += (i === 0 || i === n ? 1 : i % 2 ? 4 : 2) / Math.sqrt(e); }
    const x = s * h / 3, ok = 1 - om - ol - OR, r = Math.sqrt(Math.abs(ok));
    const dm = Math.abs(ok) < 1e-6 ? x : ok > 0 ? Math.sinh(r * x) / r : Math.sin(r * x) / r;
    return (1 + z) * dm;
  }
  const dmu = (z, om, ol) => 5 * Math.log10(dL(z, om, ol) / (z * (1 + z / 2)));
  const REF = { lcdm: evolve(0.315, 0.685), eds: evolve(1, 0), empty: evolve(0, 0) };
  const band = (() => { const b = dmu(0.5, 0.2, 0); return [b + 5 * Math.log10(1.10), b + 5 * Math.log10(1.15)]; })();

  const A = fit($(".cv-a"), () => drawA());
  const Bc = fit($(".cv-b"), () => drawB());
  let cur = null;
  function drawA() {
    const { ctx, size: { w, h } } = A; if (!w || !cur) return;
    ctx.clearRect(0, 0, w, h);
    const x0 = 36, y0 = 16, gw = w - x0 - 12, gh = h - y0 - 32, T0 = -20, T1 = 30;
    const X = (t) => x0 + (t - T0) / (T1 - T0) * gw, Y = (a) => y0 + gh - a / 3 * gh;
    NM.axes(ctx, { x0, y0, w: gw, h: gh, X, Y, xt: [-20, -10, 0, 10, 20, 30].map((t) => [t, t === 0 ? "지금" : `${t > 0 ? "+" : ""}${t}`]), yt: [0, 1, 2, 3].map((a) => [a, String(a)]), xlabel: "지금으로부터의 시간 (10억 년)", ylabel: "우주의 크기 a (지금 = 1)" });
    ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, gw, gh); ctx.clip();
    const line = (m, col, lw, dash) => {
      ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.setLineDash(dash || []); ctx.beginPath();
      const pts = [...m.back.pts].reverse().concat(m.fwd.pts.slice(1));
      pts.forEach(([t, a], i) => (i ? ctx.lineTo(X(t), Y(a)) : ctx.moveTo(X(t), Y(a))));
      ctx.stroke(); ctx.setLineDash([]);
    };
    line(REF.empty, "rgba(141,141,146,.7)", 1.2, [2, 3]);
    line(REF.eds, "rgba(63,111,163,.7)", 1.2, [5, 3]);
    line(REF.lcdm, "rgba(116,171,102,.8)", 1.2, [5, 3]);
    line(cur, C.apple, 2.4);
    ctx.restore();
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(X(0), Y(1), 3.5, 0, Math.PI * 2); ctx.fill();
    ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left";
    const lg = [["선택한 모형", C.apple], ["ΛCDM", "#5a9a4a"], ["평탄, Λ 없음", "#3f6fa3"], ["빈 우주", C.ink3]];
    lg.forEach(([s, c], i) => { ctx.fillStyle = c; ctx.fillText(`— ${s}`, x0 + 6, y0 + 12 + i * 14); });
  }
  function drawB() {
    const { ctx, size: { w, h } } = Bc; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const om = +sM.value, ol = +sL.value, ok = 1 - om - ol - OR;
    const x0 = 44, y0 = 16, gw = w - x0 - 12, gh = h - y0 - 32;
    ctx.font = `10.5px ${F.sans}`;
    if (view === "sn") {
      const X = (z) => x0 + z / 1.5 * gw, Y = (d) => y0 + gh / 2 - d / 0.5 * gh / 2;
      NM.axes(ctx, { x0, y0, w: gw, h: gh, X, Y, xt: [0, 0.25, 0.5, 0.75, 1, 1.25, 1.5].map((z) => [z, String(z)]), yt: [-0.5, -0.25, 0, 0.25, 0.5].map((d) => [d, d > 0 ? `+${d}` : String(d)]), xlabel: "적색 편이 z", ylabel: "빈 우주보다 어둡게 보이는 정도 Δμ (등급)" });
      ctx.fillStyle = "rgba(35,35,38,.18)"; ctx.fillRect(X(0.4), Y(band[1]), X(0.6) - X(0.4), Y(band[0]) - Y(band[1]));
      ctx.fillStyle = C.ink3; ctx.textAlign = "center"; ctx.fillText("Riess 외 1998", X(0.5), Y(band[1]) - 5);
      ctx.strokeStyle = C.ink2; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, Y(0) + .5); ctx.lineTo(x0 + gw, Y(0) + .5); ctx.stroke();
      ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, gw, gh); ctx.clip();
      const curve = (m, l, col, lw, dash) => {
        ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.setLineDash(dash || []); ctx.beginPath(); let on = false;
        for (let i = 1; i <= 120; i++) { const z = i / 120 * 1.5, d = dmu(z, m, l); if (!isFinite(d)) { on = false; continue; } on ? ctx.lineTo(X(z), Y(d)) : ctx.moveTo(X(z), Y(d)); on = true; }
        ctx.stroke(); ctx.setLineDash([]);
      };
      curve(1, 0, "rgba(63,111,163,.7)", 1.2, [5, 3]);
      curve(0.315, 0.685, "rgba(116,171,102,.85)", 1.2, [5, 3]);
      curve(om, ol, C.apple, 2.4);
      ctx.restore();
      ctx.fillStyle = C.ink2; ctx.textAlign = "left"; ctx.fillText("위쪽 = 더 어두움(더 멂) → 가속 팽창 쪽", x0 + 6, y0 + 12);
      ctx.fillText("아래쪽 = 더 밝음(더 가까움) → 감속 팽창 쪽", x0 + 6, y0 + gh - 6);
    } else {
      const X = (la) => x0 + (la + 10) / 10 * gw, Y = (lv) => y0 + (2 - lv) / 22 * gh;
      NM.axes(ctx, { x0, y0, w: gw, h: gh, X, Y, xt: [-10, -8, -6, -4, -2, 0].map((v) => [v, v === 0 ? "1" : `10${sup(v)}`]), yt: [0, -5, -10, -15, -20].map((v) => [v, v === 0 ? "1" : `10${sup(v)}`]), xlabel: "우주의 크기 a (지금 = 1)", ylabel: "|Ω − 1|  (Ω: 그때의 전체 밀도 / 임계 밀도)" });
      for (const [la, lab] of [[Math.log10(1 / 1091), "재결합"], [Math.log10(2.725 / 1e9), "핵합성"]]) {
        ctx.strokeStyle = C.ink3; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(X(la), y0); ctx.lineTo(X(la), y0 + gh); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = C.ink3; ctx.textAlign = "left"; ctx.fillText(lab, X(la) + 4, y0 + gh - 6);
      }
      if (Math.abs(ok) < 1e-5) { ctx.fillStyle = C.apple; ctx.textAlign = "center"; ctx.fillText("Ω_k = 0: 언제나 정확히 Ω = 1 (그래프 아래 끝 밖)", x0 + gw / 2, y0 + gh / 2); }
      else {
        const f = (la) => { const a = 10 ** la, z = 1 / a - 1, e = E2(z, om, ol); return e > 0 ? Math.log10(Math.abs(ok) * (1 + z) ** 2 / e) : NaN; };
        ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, gw, gh); ctx.clip();
        ctx.strokeStyle = C.apple; ctx.lineWidth = 2.4; ctx.beginPath(); let on = false;
        for (let i = 0; i <= 200; i++) { const la = -10 + i / 20, v = f(la); if (!isFinite(v)) { on = false; continue; } on ? ctx.lineTo(X(la), Y(v)) : ctx.moveTo(X(la), Y(v)); on = true; }
        ctx.stroke(); ctx.restore();
        const vb = f(Math.log10(2.725 / 1e9)), vn = f(0);
        ctx.fillStyle = C.apple; ctx.textAlign = "left";
        if (isFinite(vb)) ctx.fillText(`핵합성 무렵 |Ω − 1| ≈ ${(10 ** (vb - Math.floor(vb))).toFixed(1)}×10${sup(Math.floor(vb))}`, x0 + 6, y0 + 12);
        if (isFinite(vn)) ctx.fillText(`지금 |Ω − 1| = ${Math.abs(ok).toPrecision(2)}`, x0 + 6, y0 + 26);
      }
    }
  }
  function update() {
    const om = +sM.value, ol = +sL.value, ok = 1 - om - ol - OR;
    oM.textContent = om.toFixed(3); oL.textContent = ol.toFixed(3);
    root.querySelectorAll("[data-m]").forEach((b) => b.setAttribute("aria-pressed", String(Math.abs(+b.dataset.m - om) < 1e-6 && Math.abs(+b.dataset.l - ol) < 1e-6)));
    cur = evolve(om, ol);
    nK.textContent = (Math.abs(ok) < 5e-4 ? 0 : ok).toFixed(3) + (Math.abs(ok) < 5e-4 ? " (평탄)" : ok > 0 ? " (열림)" : " (닫힘)");
    const q = om / 2 + OR - ol; nQ.textContent = q.toFixed(2) + (q < 0 ? " 가속" : " 감속");
    nAge.textContent = cur.age === null ? "대폭발 없음" : `${Math.round(cur.age * 10)}억 년`;
    nFate.textContent = cur.crunch ? "재수축" : cur.accel ? "가속 팽창" : "감속하며 팽창";
    drawA(); drawB();
  }
  root.querySelectorAll("[data-m]").forEach((b) => b.addEventListener("click", () => { sM.value = b.dataset.m; sL.value = b.dataset.l; update(); }));
  root.querySelectorAll("[data-v]").forEach((b) => b.addEventListener("click", () => { view = b.dataset.v; root.querySelectorAll("[data-v]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); drawB(); }));
  sM.addEventListener("input", update); sL.addEventListener("input", update);
  if (/[?&]demo/.test(location.search)) { sM.value = 0.3; sL.value = 0.69; view = "flat"; root.querySelectorAll("[data-v]").forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.v === "flat"))); }
  update();
})();
