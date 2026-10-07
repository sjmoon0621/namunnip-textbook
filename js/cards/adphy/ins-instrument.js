/* 카드: 렌즈 두 장을 겹치면 왜 상이 수백 배로 커질까? — 현미경·망원경·카메라의 근축 광선 추적 (단위 cm) */
(() => {
  const root = document.getElementById("card-adphy-instrument");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const S = [0, 1, 2].map((i) => ({ inp: $(".s" + i), out: $(".o" + i), lab: $(".l" + i) }));
  const N = [0, 1, 2].map((i) => ({ dt: $(".d" + i), dd: $(".n" + i) }));
  const FNUM = [1.4, 2, 2.8, 4, 5.6, 8, 11, 16];
  const F1MIC = 1.6, FCAM = 5, TH0 = Math.PI / 180, COC = 0.003;
  /* 기기별 슬라이더: [이름, min, max, step, 기본값, 표시 함수] */
  const MODES = {
    mic: [["물체 거리 a", 1.705, 1.78, 0.0005, 1.7215, (v) => v.toFixed(4) + " cm"],
      ["접안렌즈 f₂", 1.5, 5, 0.1, 2.5, (v) => v.toFixed(1) + " cm"],
      ["렌즈 간격 L", 20, 26, 0.1, 25, (v) => v.toFixed(1) + " cm"]],
    tel: [["대물렌즈 f₁", 40, 150, 1, 100, (v) => v.toFixed(0) + " cm"],
      ["접안렌즈 f₂", 1, 10, 0.1, 2.5, (v) => v.toFixed(1) + " cm"],
      ["간격 − (f₁+f₂)", -3, 3, 0.05, 0, (v) => (v > 0 ? "+" : "") + v.toFixed(2) + " cm"]],
    cam: [["물체 거리 a", Math.log10(30), Math.log10(3000), 0.005, Math.log10(100), (v) => (10 ** v / 100).toFixed(2) + " m"],
      ["렌즈–센서 거리", 5.0, 5.6, 0.002, 5.26, (v) => (v * 10).toFixed(2) + " mm"],
      ["f-수 N", 0, 7, 1, 2, (v) => FNUM[v].toString()]],
  };
  const store = {};
  for (const k in MODES) store[k] = MODES[k].map((d) => d[4]);
  let mode = "mic";
  const img = (f, a) => (Math.abs(a - f) < 1e-9 ? Infinity : 1 / (1 / f - 1 / a));

  /* 근축 광선 추적: 렌즈를 지날 때 기울기 u → u − y/f */
  function trace(x0, y0, u, lenses, xEnd) {
    const pts = [[x0, y0]]; let x = x0, y = y0;
    for (const L of lenses) { if (L.x <= x) continue; y += u * (L.x - x); x = L.x; pts.push([x, y]); u -= y / L.f; }
    pts.push([xEnd, y + u * (xEnd - x)]);
    return { pts, u, x, y };
  }

  const { ctx, size } = fit(cv, () => draw());
  let V;
  const X = (x) => V.px + (x - V.x0) / (V.x1 - V.x0) * V.pw;
  const Y = (y) => V.cy - y / V.ym * V.ph / 2;

  function line(pts, col, w, dash) {
    ctx.strokeStyle = col; ctx.lineWidth = w; ctx.setLineDash(dash || []);
    ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y)))); ctx.stroke(); ctx.setLineDash([]);
  }
  function lens(x, half, name, f) {
    const xs = X(x), y0 = Y(half), y1 = Y(-half);
    ctx.strokeStyle = "#3f6fa3"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(xs, y0); ctx.lineTo(xs, y1); ctx.stroke();
    ctx.fillStyle = "#3f6fa3"; [[y0, -1], [y1, 1]].forEach(([yy, s]) => { ctx.beginPath(); ctx.moveTo(xs, yy); ctx.lineTo(xs - 5, yy - 6 * s); ctx.lineTo(xs + 5, yy - 6 * s); ctx.closePath(); ctx.fill(); });
    ctx.font = `11px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(name, xs, y0 - 12);
    if (f) { ctx.fillStyle = C.ink3; [x - f, x + f].forEach((fx) => { if (fx > V.x0 && fx < V.x1) { ctx.beginPath(); ctx.arc(X(fx), V.cy, 2.5, 0, 7); ctx.fill(); } }); }
  }
  function arrow(x, y, col, dashed, label, below) {
    const xs = X(x), ys = Y(y);
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 2.2; ctx.setLineDash(dashed ? [4, 3] : []);
    ctx.beginPath(); ctx.moveTo(xs, V.cy); ctx.lineTo(xs, ys); ctx.stroke(); ctx.setLineDash([]);
    const s = ys < V.cy ? 1 : -1;
    ctx.beginPath(); ctx.moveTo(xs, ys); ctx.lineTo(xs - 4, ys + 7 * s); ctx.lineTo(xs + 4, ys + 7 * s); ctx.closePath(); ctx.fill();
    if (label) { ctx.font = `11px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(label, xs, ys < V.cy ? ys - 6 : ys + 15); }
  }
  function axis() {
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(V.px, V.cy); ctx.lineTo(V.px + V.pw, V.cy); ctx.stroke();
  }
  function note(t, x, y, al, col) { ctx.fillStyle = col || C.ink3; ctx.font = `11px ${F.sans}`; ctx.textAlign = al || "left"; ctx.fillText(t, x, y); }

  function drawMic(w, h, v) {
    const [a, f2, L] = v, f1 = F1MIC, b1 = img(f1, a), h0 = 0.05, h1 = -h0 * b1 / a, s2 = L - b1, b2 = img(f2, s2);
    const xe = L + 6;
    V = { x0: -a - 1.2, x1: xe, px: 14, pw: w - 28, cy: h * 0.52, ph: h * 0.72, ym: Math.max(Math.abs(h1) * 1.5, h0 * f1 / (a - f1) * 1.4, 0.9) };
    axis();
    const lenses = [{ x: 0, f: f1 }, { x: L, f: f2 }];
    const rays = [[-a, h0, 0], [-a, h0, -h0 / a], [-a, h0, h0 / (f1 - a)]];
    const cols = ["#d4493a", "#e0a02a", "#3b7c2a"];
    let lens2H = 0.6;
    const outs = rays.map(([x, y, u], i) => { const r = trace(x, y, u, lenses, xe); lens2H = Math.max(lens2H, Math.abs(r.y) * 1.08); return r; });
    outs.forEach((r, i) => line(r.pts, cols[i], 1.4));
    if (isFinite(b2) && b2 < 0) {
      const xv = L + b2;
      outs.forEach((r, i) => line([[r.x, r.y], [Math.max(xv, V.x0), r.y + r.u * (Math.max(xv, V.x0) - r.x)]], cols[i], 1, [3, 4]));
      if (xv > V.x0) arrow(xv, h1 * (b2 / s2) * -1, C.ink3, true, "최종 허상");
    }
    lens(0, Math.max(Math.abs(rays[2][2] * a) * 1.15 + h0, 0.25), "대물", f1);
    lens(L, lens2H, "접안", f2);
    arrow(-a, h0, C.ink, false);
    note("물체", X(-a) - 4, Y(h0) - 6, "left", C.ink);
    if (b1 > 0 && b1 < xe) { arrow(b1, h1, "#7a4fa0", false); note("중간상 (실상)", X(b1) - 6, V.cy - 6, "right", "#7a4fa0"); }
    note("세로 방향 확대 (모식) · 점: 초점", V.px, h - 6);
    /* 각배율 */
    const thEye = Math.abs(h1) / s2, M = s2 > 0 ? thEye / (h0 / 25) : NaN;
    N[0].dt.textContent = "중간상: 위치 b₁ · 배율 m₁"; N[0].dd.textContent = `${b1.toFixed(1)} cm · ${(-b1 / a).toFixed(1)}×`;
    N[1].dt.textContent = "최종 상 (접안렌즈 앞)";
    let fin, ok = true;
    if (!isFinite(b2) || Math.abs(b2) > 2000) fin = "∞ (평행광)";
    else if (s2 <= 0) { fin = "중간상이 접안렌즈 뒤"; ok = false; }
    else if (b2 < 0) { fin = `${(-b2).toFixed(1)} cm 허상`; if (-b2 < 25) { fin += " · 너무 가까움"; ok = false; } }
    else { fin = "눈 뒤 실상 · 볼 수 없음"; ok = false; }
    N[1].dd.textContent = fin; N[1].dd.className = "n1 " + (ok ? "good" : "bad");
    N[2].dt.textContent = "각배율 M (≈ L/f₁ × 25/f₂)"; N[2].dd.textContent = `${isFinite(M) ? M.toFixed(0) : "—"}× (${((L - f2) / f1 * 25 / f2).toFixed(0)}×)`;
  }

  function drawTel(w, h, v) {
    const [f1, f2, dL] = v, L = f1 + f2 + dL, s2 = L - f1, b2 = img(f2, s2), h1 = -f1 * Math.tan(TH0), A1 = 4;
    const xe = L + Math.max(8, f2 * 3);
    V = { x0: -10, x1: xe, px: 14, pw: w - 28, cy: h * 0.52, ph: h * 0.72, ym: 5.2 };
    axis();
    const lenses = [{ x: 0, f: f1 }, { x: L, f: f2 }], cols = ["#d4493a", "#e0a02a", "#3b7c2a"];
    const u0 = -Math.tan(TH0);
    let lens2H = 0.5;
    const outs = [0.75, 0, -0.75].map((k) => { const y0 = k * A1 - u0 * 10; const r = trace(-10, y0, u0, lenses, xe); lens2H = Math.max(lens2H, Math.abs(r.y) * 1.1); return r; });
    outs.forEach((r, i) => line(r.pts, cols[i], 1.4));
    lens(0, A1 * 1.05, "대물", f1); lens(L, lens2H, "접안", f2);
    arrow(f1, h1, "#7a4fa0", false, "중간상", true);
    note("← 먼 별빛 (시야각 1°)", X(0) + 8, Y(-A1 * 1.05) + 4, "left", C.ink);
    note("세로 방향 확대 (모식) · 점: 초점", V.px, h - 6);
    const M = (Math.abs(h1) / s2) / Math.tan(TH0);
    N[0].dt.textContent = "중간상: 대물렌즈 뒤 · 높이"; N[0].dd.textContent = `${f1.toFixed(0)} cm · ${(Math.abs(h1) * 10).toFixed(1)} mm`;
    N[1].dt.textContent = "나가는 빛";
    let fin, ok = true;
    if (Math.abs(dL) < 0.025) fin = "평행광 (최종 상 ∞)";
    else if (b2 < 0) { fin = `퍼짐 · 허상 ${(-b2).toFixed(0)} cm`; ok = -b2 >= 25; }
    else { fin = "모임 · 눈으로 볼 수 없음"; ok = false; }
    N[1].dd.textContent = fin; N[1].dd.className = "n1 " + (ok ? "good" : "bad");
    N[2].dt.textContent = "각배율 M (f₁/f₂)"; N[2].dd.textContent = `${M.toFixed(1)}× (${(f1 / f2).toFixed(1)}×)`;
  }

  function drawCam(w, h, v) {
    const a = 10 ** v[0], d = v[1], Nf = FNUM[v[2]], f = FCAM, D = f / Nf, b = img(f, a);
    const xe = d + 1.4;
    V = { x0: -3, x1: xe, px: 14, pw: w * 0.68, cy: h * 0.5, ph: h * 0.7, ym: 2.4 };
    axis();
    const lenses = [{ x: 0, f }];
    [D / 2, D / 4, 0, -D / 4, -D / 2].forEach((yl, i) => {
      const u = yl / a, r = trace(-3, u * (a - 3), u, lenses, xe);
      line(r.pts, i === 2 ? "#d4493a" : "rgba(212,73,58,.65)", 1.2);
    });
    lens(0, Math.max(D / 2 * 1.08, 0.5), "", 0);
    note("렌즈와 조리개", X(0), Y(2.2) - 8, "center", C.ink);
    /* 조리개 */
    ctx.strokeStyle = C.ink; ctx.lineWidth = 3;
    [[D / 2 + 0.02, 2.2], [-D / 2 - 0.02, -2.2]].forEach(([y0, y1]) => { ctx.beginPath(); ctx.moveTo(X(-0.25), Y(y0)); ctx.lineTo(X(-0.25), Y(y1)); ctx.stroke(); });
    /* 센서 */
    ctx.fillStyle = "#5d5d61"; ctx.fillRect(X(d) - 1, Y(1.2), 4, Y(-1.2) - Y(1.2));
    note("센서", X(d), Y(1.2) - 6, "center", C.ink);
    note(`← 물체 (축 위의 한 점, ${(a / 100).toFixed(2)} m)`, V.px + 2, 16, "left", C.ink);
    if (b > 0 && b < xe) { ctx.fillStyle = "#7a4fa0"; ctx.beginPath(); ctx.arc(X(b), V.cy, 3, 0, 7); ctx.fill(); note("상", X(b), V.cy + 16, "center", "#7a4fa0"); }
    note("세로 방향 확대 (모식)", V.px, h - 6);
    /* 흐림 원 확대 그림 */
    const c = D * Math.abs(d - b) / b, ix = w * 0.86, iy = h * 0.45, sc = 400;
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.strokeRect(ix - 46, iy - 46, 92, 92);
    ctx.fillStyle = c <= COC ? "rgba(59,124,42,.55)" : "rgba(181,83,47,.5)";
    ctx.beginPath(); ctx.arc(ix, iy, Math.max(1.5, Math.min(44, c / 2 * sc * 10)), 0, 7); ctx.fill();
    ctx.strokeStyle = C.ink; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.arc(ix, iy, COC / 2 * sc * 10, 0, 7); ctx.stroke(); ctx.setLineDash([]);
    note("센서 위 흐림 원", ix, iy - 54, "center", C.ink); note("점선: 0.03 mm", ix, iy + 60, "center");
    N[0].dt.textContent = "초점이 맞는 물체 거리"; const sf = img(f, d); N[0].dd.textContent = `${(sf / 100).toFixed(2)} m`;
    N[1].dt.textContent = "흐림 원 지름 (허용 0.03 mm)"; N[1].dd.textContent = `${(c * 10).toFixed(3)} mm`; N[1].dd.className = "n1 " + (c <= COC ? "good" : "bad");
    /* 선명한 범위: 흐림 원이 COC 이하가 되는 상 거리 → 물체 거리 */
    const bFar = d * D / (D + COC), bNear = d * D / (D - COC);
    const aFar = bFar <= f ? Infinity : img(f, bFar), aNear = img(f, bNear);
    N[2].dt.textContent = "선명하게 찍히는 범위"; N[2].dd.textContent = `${(aNear / 100).toFixed(2)} ~ ${isFinite(aFar) && aFar > 0 ? (aFar / 100).toFixed(2) + " m" : "∞"}`;
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, w, h); ctx.clip();
    const v = store[mode];
    if (mode === "mic") drawMic(w, h, v); else if (mode === "tel") drawTel(w, h, v); else drawCam(w, h, v);
    ctx.restore();
  }
  function setMode(m) {
    mode = m;
    root.querySelectorAll("[data-m]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.m === m)));
    MODES[m].forEach((d, i) => { const s = S[i]; s.lab.textContent = d[0]; s.inp.min = d[1]; s.inp.max = d[2]; s.inp.step = d[3]; s.inp.value = store[m][i]; s.inp.setAttribute("aria-label", d[0]); });
    update();
  }
  function update() {
    MODES[mode].forEach((d, i) => { store[mode][i] = +S[i].inp.value; S[i].out.textContent = d[5](store[mode][i]); });
    draw();
  }
  root.querySelectorAll("[data-m]").forEach((b) => b.addEventListener("click", () => setMode(b.dataset.m)));
  S.forEach((s) => s.inp.addEventListener("input", update));
  /* ?demo=tel 처럼 기기를 골라 열 수 있다 */
  const dq = new URLSearchParams(location.search).get("demo");
  setMode(MODES[dq] ? dq : "mic");
})();
