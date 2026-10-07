/* 카드: 벚꽃은 쌓인 따뜻함을 세고 필까? — 워싱턴 D.C. 만개일(EPA/NPS) + GHCN-Daily 기온, 생장 도일 모형 */
(() => {
  const root = document.getElementById("card-clim-flowering");
  if (!root) return;
  const { C, F, fit, axes } = NM;
  const L = window.NMLab;
  const D = window.NMCherry;
  const $ = (s) => root.querySelector(s);
  const YRS = Object.keys(D).map(Number).sort((a, b) => a - b);
  const START = 32;   // 2월 1일 (1월 1일 = 1)
  let lower = "yr";

  const leap = (y) => y % 4 === 0;
  const dateOf = (y, d) => { const dt = new Date(Date.UTC(y, 0, d)); return `${dt.getUTCMonth() + 1}월 ${dt.getUTCDate()}일`; };
  // 생장 도일이 문턱에 닿는 날 (1월 1일 = 1). 닿지 않으면 null
  function predict(t, base, Fth, add = 0) {
    let s = 0;
    for (let i = START - 1; i < t.length; i++) { s += Math.max(0, t[i] / 10 + add - base); if (s >= Fth) return i + 1; }
    return null;
  }
  const fm = (y) => { const t = D[y].t.slice(31, leap(y) ? 91 : 90); return t.reduce((a, b) => a + b, 0) / t.length / 10; };
  const FM = YRS.map(fm);
  function rms(base, Fth) {
    let se = 0;
    for (const y of YRS) { const p = predict(D[y].t, base, Fth) ?? 125; se += (p - D[y].b) ** 2; }
    return Math.sqrt(se / YRS.length);
  }

  const g1 = fit($(".c2-gdd"), () => draw()), g2 = fit($(".c2-all"), () => draw());

  function drawGdd(y, base, Fth, add) {
    const { ctx, size: { w, h } } = g1; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const t = D[y].t, x0 = 44, y0 = 18, gw = w - x0 - 12, gh = h - y0 - 34;
    const d0 = START, d1 = 120, X = (d) => x0 + (d - d0) / (d1 - d0) * gw, ymax = Math.max(Fth * 1.25, 200), Y = (v) => y0 + gh - v / ymax * gh;
    const mt = [[32, "2월"], [60, "3월"], [91, "4월"]].map(([d, l]) => [d + (leap(y) && d > 32 ? 1 : 0), l]);
    const yst = ymax > 500 ? 200 : 100, yt = []; for (let v = 0; v <= ymax; v += yst) yt.push([v, String(v)]);
    axes(ctx, { x0, y0, w: gw, h: gh, X, Y, xt: mt, yt, ylabel: `${y}년 2월 1일부터 쌓인 생장 도일 (°C·일)` });
    ctx.strokeStyle = C.warn; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(x0, Y(Fth)); ctx.lineTo(x0 + gw, Y(Fth)); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.warn; ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "left"; ctx.fillText(`문턱 ${Fth}`, x0 + 4, Y(Fth) - 4);
    const curve = (a, col, lw) => {
      let s = 0; ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(X(d0), Y(0));
      for (let i = d0 - 1; i < Math.min(t.length, d1); i++) { s += Math.max(0, t[i] / 10 + a - base); ctx.lineTo(X(i + 1), Y(Math.min(s, ymax))); }
      ctx.stroke();
    };
    if (add > 0) curve(add, C.amber, 1.6);
    curve(0, C.forest, 2);
    const obs = D[y].b, p = predict(t, base, Fth), pw = add > 0 ? predict(t, base, Fth, add) : null;
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.moveTo(X(obs), y0 + gh); ctx.lineTo(X(obs) - 6, y0 + gh + 9); ctx.lineTo(X(obs) + 6, y0 + gh + 9); ctx.fill();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X(obs) + .5, y0 + gh); ctx.lineTo(X(obs) + .5, y0); ctx.stroke();
    ctx.font = `11px ${F.sans}`; ctx.textAlign = X(obs) > x0 + gw - 70 ? "right" : "left"; ctx.fillStyle = C.ink;
    ctx.fillText("실제 만개", X(obs) + (ctx.textAlign === "left" ? 4 : -4), y0 + 10);
    if (p) { ctx.fillStyle = C.warn; ctx.beginPath(); ctx.arc(X(p), Y(Fth), 4.5, 0, 7); ctx.fill(); }
    if (pw) { ctx.fillStyle = C.amber; ctx.beginPath(); ctx.arc(X(pw), Y(Fth), 4.5, 0, 7); ctx.fill(); }
    // 범례
    ctx.textAlign = "left"; ctx.font = `11px ${F.sans}`;
    const lg = [["실제 기온", C.forest]]; if (add > 0) lg.push([`+${add} °C`, C.amber]);
    lg.forEach(([s, c], i) => { ctx.fillStyle = c; ctx.fillRect(x0 + gw - 90, y0 + gh - 34 + i * 15, 12, 3); ctx.fillStyle = C.ink2; ctx.fillText(s, x0 + gw - 73, y0 + gh - 30 + i * 15); });
    return { obs, p, pw };
  }

  function drawAll(sel, base, Fth) {
    const { ctx, size: { w, h } } = g2; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const box = { x0: 44, y0: 18, w: w - 56, h: h - 52 };
    if (lower === "yr") {
      const X = (y) => box.x0 + (y - 1940) / 86 * box.w, Y = (d) => box.y0 + box.h - (d - 70) / 42 * box.h;
      axes(ctx, { ...box, X, Y, xt: [1940, 1960, 1980, 2000, 2020].map((y) => [y, String(y)]), yt: [[74, "3/15"], [84, "3/25"], [94, "4/4"], [104, "4/14"]], ylabel: "만개일 (평년 기준 날짜)" });
      ctx.strokeStyle = C.warn; ctx.lineWidth = 1.3; ctx.beginPath(); let on = false;
      YRS.forEach((y) => { const p = predict(D[y].t, base, Fth); if (p == null) { on = false; return; } on ? ctx.lineTo(X(y), Y(p)) : ctx.moveTo(X(y), Y(p)); on = true; });
      ctx.stroke();
      YRS.forEach((y) => { ctx.fillStyle = y === sel ? C.ink : C.forest; ctx.beginPath(); ctx.arc(X(y), Y(D[y].b), y === sel ? 4.5 : 2.8, 0, 7); ctx.fill(); });
      const f = L.linfit(YRS, YRS.map((y) => D[y].b));
      ctx.strokeStyle = C.ink3; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(X(1942), Y(f.a * 1942 + f.b)); ctx.lineTo(X(2024), Y(f.a * 2024 + f.b)); ctx.stroke(); ctx.setLineDash([]);
      ctx.font = `11px ${F.sans}`; ctx.textAlign = "left";
      ctx.fillStyle = C.forest; ctx.fillText("● 실제", box.x0 + 6, box.y0 + box.h + 32);
      ctx.fillStyle = C.warn; ctx.fillText("— 모형 예측", box.x0 + 56, box.y0 + box.h + 32);
      ctx.fillStyle = C.ink3; ctx.fillText(`- - 실제의 추세: 10년에 ${(f.a * 10).toFixed(1)}일`, box.x0 + 140, box.y0 + box.h + 32);
    } else {
      const pts = YRS.map((y, i) => ({ x: FM[i], y: D[y].b }));
      const f = L.linfit(pts.map((p) => p.x), pts.map((p) => p.y));
      const r = L.plot(ctx, box, { pts, fit: f, xr: [1.5, 11], yr: [70, 112], xlabel: "2–3월 평균 기온 (°C)", ylabel: "만개일 (1월 1일 = 1)" });
      const i = YRS.indexOf(sel); ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(r.X(FM[i]), r.Y(D[sel].b), 5, 0, 7); ctx.fill();
      ctx.fillStyle = C.warn; ctx.font = `11px ${F.mono}`; ctx.textAlign = "right";
      ctx.fillText(`기울기 ${f.a.toFixed(1)}일/°C · R² = ${f.r2.toFixed(2)}`, box.x0 + box.w - 4, box.y0 + 12);
    }
  }

  function draw() {
    const y = +$(".yr").value, base = +$(".base").value, Fth = +$(".fth").value, add = +$(".warm").value;
    const r = drawGdd(y, base, Fth, add);
    drawAll(y, base, Fth);
    if (!r) return;
    $(".n1").textContent = dateOf(y, r.obs);
    const n2 = $(".n2");
    if (r.p == null) { n2.textContent = "4월 말까지 안 핌"; n2.className = "n2 bad"; }
    else {
      const d = r.p - r.obs;
      n2.textContent = `${dateOf(y, r.p)} (${d > 0 ? "+" : ""}${d}일)` + (r.pw ? ` · +${add} °C면 ${r.p - r.pw}일 당김` : "");
      n2.className = "n2" + (Math.abs(d) <= 3 ? " good" : "");
    }
    const e = rms(base, Fth), n3 = $(".n3"); n3.textContent = `${e.toFixed(1)}일`; n3.className = "n3" + (e < 5 ? " good" : e > 10 ? " bad" : "");
  }

  const out = (sel, o, f) => $(sel).addEventListener("input", () => { $(o).textContent = f(+$(sel).value); draw(); });
  out(".yr", ".y-out", String); out(".base", ".b-out", (v) => v.toFixed(1)); out(".fth", ".f-out", String); out(".warm", ".w-out", (v) => v.toFixed(1));
  $(".c2-lower").addEventListener("click", (e) => { const b = e.target.closest("[data-g]"); if (!b) return; lower = b.dataset.g; root.querySelectorAll("[data-g]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); draw(); });
  function best() {
    let b = [1e9, 0, 0];
    for (let base = 0; base <= 8; base += 0.5) for (let Fth = 100; Fth <= 600; Fth += 5) { const r = rms(base, Fth); if (r < b[0]) b = [r, base, Fth]; }
    $(".base").value = b[1]; $(".b-out").textContent = b[1].toFixed(1); $(".fth").value = b[2]; $(".f-out").textContent = String(b[2]);
    draw();
  }
  $(".c2-best").addEventListener("click", best);
  if (L.demo) { best(); $(".warm").value = 2; $(".w-out").textContent = "2.0"; draw(); }
  draw();
})();
