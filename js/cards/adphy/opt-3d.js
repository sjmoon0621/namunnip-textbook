/* 카드: 3D 영화관 안경은 왜 고개를 기울여도 화면이 겹쳐 보이지 않을까? — 존스 벡터로 계산한 파장판·편광 3D 안경 */
(() => {
  const root = document.getElementById("card-adphy-3d");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const SL = [{ inp: $(".sa"), out: $(".oa"), lab: $(".la") }, { inp: $(".sb"), out: $(".ob"), lab: $(".lb") }];
  const N = [0, 1, 2].map((i) => ({ dt: $(".d" + i), dd: $(".n" + i) }));
  const RAD = Math.PI / 180;
  const MODES = {
    plate: [["파장판 지연 δ", 0, 360, 5, 60, (v) => v + "°"], ["검광자 각 φ", 0, 180, 1, 0, (v) => v + "°"]],
    lin: [["머리 기울기 β", -45, 45, 1, 20, (v) => v + "°"], ["파장 λ", 450, 650, 10, 550, (v) => v + " nm"]],
    circ: [["머리 기울기 β", -45, 45, 1, 20, (v) => v + "°"], ["파장 λ", 450, 650, 10, 550, (v) => v + " nm"]],
  };
  const store = { plate: [60, 0], lin: [20, 550], circ: [20, 550] };
  let mode = "plate";

  /* 복소수 [re, im]와 2×2 존스 행렬 */
  const cm = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
  const ca = (a, b) => [a[0] + b[0], a[1] + b[1]];
  const R = (x) => [x, 0];
  const mv = (M, v) => [ca(cm(M[0][0], v[0]), cm(M[0][1], v[1])), ca(cm(M[1][0], v[0]), cm(M[1][1], v[1]))];
  const mm = (A, B) => [[ca(cm(A[0][0], B[0][0]), cm(A[0][1], B[1][0])), ca(cm(A[0][0], B[0][1]), cm(A[0][1], B[1][1]))],
    [ca(cm(A[1][0], B[0][0]), cm(A[1][1], B[1][0])), ca(cm(A[1][0], B[0][1]), cm(A[1][1], B[1][1]))]];
  const rot = (a) => { const c = Math.cos(a), s = Math.sin(a); return [[R(c), R(-s)], [R(s), R(c)]]; };
  const pol = (a) => { const c = Math.cos(a), s = Math.sin(a); return [[R(c * c), R(c * s)], [R(c * s), R(s * s)]]; };
  const ret = (a, d) => mm(mm(rot(a), [[R(1), R(0)], [R(0), [Math.cos(d), -Math.sin(d)]]]), rot(-a));
  const lin = (a) => [R(Math.cos(a)), R(Math.sin(a))];
  const I = (v) => v[0][0] ** 2 + v[0][1] ** 2 + v[1][0] ** 2 + v[1][1] ** 2;

  const { ctx, size } = fit(cv, () => draw());
  function txt(t, x, y, al, c, f) { ctx.fillStyle = c || C.ink3; ctx.font = f || `11px ${F.sans}`; ctx.textAlign = al || "left"; ctx.fillText(t, x, y); }

  /* 전기장 끝의 자취 (편광 타원)와 회전 방향 */
  function ellipse(v, cx, cy, r, col, label, axisAng) {
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cx - r, cy); ctx.lineTo(cx + r, cy); ctx.moveTo(cx, cy - r); ctx.lineTo(cx, cy + r); ctx.stroke();
    if (axisAng != null) {
      ctx.strokeStyle = C.ink; ctx.setLineDash([5, 3]); const c = Math.cos(axisAng), s = Math.sin(axisAng);
      ctx.beginPath(); ctx.moveTo(cx - r * 1.1 * c, cy + r * 1.1 * s); ctx.lineTo(cx + r * 1.1 * c, cy - r * 1.1 * s); ctx.stroke(); ctx.setLineDash([]);
    }
    const P = (t) => [cx + r * (v[0][0] * Math.cos(t) + v[0][1] * Math.sin(t)), cy - r * (v[1][0] * Math.cos(t) + v[1][1] * Math.sin(t))];
    ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath();
    for (let i = 0; i <= 120; i++) { const [x, y] = P(i / 120 * 2 * Math.PI); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke();
    const [x1, y1] = P(0.9), [x2, y2] = P(1.15);
    if (Math.abs(v[0][0] * v[1][1] - v[0][1] * v[1][0]) > 0.02) {
      const an = Math.atan2(y2 - y1, x2 - x1); ctx.fillStyle = col;
      ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - 9 * Math.cos(an - 0.45), y2 - 9 * Math.sin(an - 0.45)); ctx.lineTo(x2 - 9 * Math.cos(an + 0.45), y2 - 9 * Math.sin(an + 0.45)); ctx.closePath(); ctx.fill();
    }
    if (label) txt(label, cx, cy + r + 16, "center", C.ink);
  }

  function drawPlate(w, h) {
    const [dDeg, phDeg] = store.plate, d = dDeg * RAD, ph = phDeg * RAD;
    const v = mv(ret(0, d), lin(45 * RAD));
    const r = Math.min(h * 0.34, w * 0.18), cx = r + 24, cy = h * 0.46;
    ellipse(v, cx, cy, r, "#3f6fa3", "파장판을 지난 빛 (점선: 검광자)", ph);
    txt("빠른 축: 가로 방향", cx, cy + r + 32, "center");
    const tr = (a) => { const p = mv(pol(a), v); return I(p); };
    const gx = w * 0.5, gw = w * 0.47, gy = 24, gh = h - 64;
    const X = (a) => gx + a / 180 * gw, Y = (t) => gy + gh - t * gh;
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx, gy + gh); ctx.lineTo(gx + gw, gy + gh); ctx.stroke();
    ctx.strokeStyle = C.rule; [0.5, 1].forEach((t) => { ctx.beginPath(); ctx.moveTo(gx, Y(t)); ctx.lineTo(gx + gw, Y(t)); ctx.stroke(); });
    txt("1", gx - 4, Y(1) + 4, "right"); txt("0.5", gx - 4, Y(0.5) + 4, "right");
    ctx.strokeStyle = "#3f6fa3"; ctx.lineWidth = 2; ctx.beginPath();
    for (let i = 0; i <= 180; i++) { const y = Y(tr(i * RAD)); i ? ctx.lineTo(X(i), y) : ctx.moveTo(X(i), y); } ctx.stroke();
    ctx.fillStyle = C.warn; ctx.beginPath(); ctx.arc(X(phDeg), Y(tr(ph)), 4.5, 0, 7); ctx.fill();
    [0, 45, 90, 135, 180].forEach((a) => txt(a + "°", X(a), gy + gh + 14, "center"));
    txt("투과 세기", gx + 4, gy - 8); txt("검광자 각 φ", gx + gw, gy + gh + 30, "right");
    let mx = 0, mn = 1; for (let i = 0; i < 180; i++) { const t = tr(i * RAD); mx = Math.max(mx, t); mn = Math.min(mn, t); }
    const q = mn / mx;
    N[0].dt.textContent = "편광 상태"; N[0].dd.textContent = q < 0.005 ? "선편광" : q > 0.985 ? "원편광" : "타원 편광";
    N[1].dt.textContent = "최소 / 최대 투과"; N[1].dd.textContent = q.toFixed(2);
    N[2].dt.textContent = "검광자 투과 세기"; N[2].dd.textContent = tr(ph).toFixed(2);
    [0, 1, 2].forEach((i) => (N[i].dd.className = "n" + i));
  }

  function draw3D(w, h, circ) {
    const [bDeg, lam] = store[mode], b = bDeg * RAD, d = 90 * RAD * 550 / lam;
    const L = circ ? mv(ret(45 * RAD, d), lin(0)) : lin(45 * RAD);
    const Rr = circ ? mv(ret(45 * RAD, d), lin(90 * RAD)) : lin(135 * RAD);
    const eyeL = circ ? mm(pol(b), ret(-45 * RAD + b, d)) : pol(45 * RAD + b);
    const eyeR = circ ? mm(pol(90 * RAD + b), ret(-45 * RAD + b, d)) : pol(135 * RAD + b);
    const LL = I(mv(eyeL, L)), LR = I(mv(eyeL, Rr)), RR = I(mv(eyeR, Rr)), RL = I(mv(eyeR, L));
    /* 왼쪽: 두 영상의 편광 */
    const r = Math.min(h * 0.17, w * 0.09), ex = r + 22;
    ellipse(L, ex, h * 0.27, r, "#3f6fa3", "왼눈용 영상");
    ellipse(Rr, ex, h * 0.72, r, "#d4493a", "오른눈용 영상");
    /* 가운데: 기울어진 머리와 안경 */
    const hx = w * 0.38, hy = h * 0.5, hr = Math.min(h * 0.3, w * 0.12);
    ctx.save(); ctx.translate(hx, hy); ctx.rotate(-b);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(0, 0, hr * 0.85, hr, 0, 0, 7); ctx.stroke();
    [[-1, eyeL, "#3f6fa3", circ ? 0 : 45], [1, eyeR, "#d4493a", circ ? 90 : 135]].forEach(([s, , col, ax]) => {
      const lx = s * hr * 0.38, ly = -hr * 0.12, lr = hr * 0.28;
      ctx.fillStyle = "rgba(35,35,38,.08)"; ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(lx, ly, lr, 0, 7); ctx.fill(); ctx.stroke();
      const a = ax * RAD; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(lx - lr * 0.85 * Math.cos(a), ly + lr * 0.85 * Math.sin(a)); ctx.lineTo(lx + lr * 0.85 * Math.cos(a), ly - lr * 0.85 * Math.sin(a)); ctx.stroke();
    });
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-hr * 0.1, -hr * 0.12); ctx.lineTo(hr * 0.1, -hr * 0.12); ctx.stroke();
    ctx.restore();
    txt(circ ? "안경: 1/4 파장판 + 편광판 (선은 편광판 축)" : "안경: 편광판 (선은 투과축)", hx, hy + hr + 20, "center");
    txt("(관객이 화면을 보는 방향에서 본 모습)", hx, hy + hr + 34, "center");
    /* 오른쪽: 막대 */
    const bx = w * 0.62, bw = w - bx - 10, rows = [["왼눈 ← 왼눈용", LL, "#3f6fa3"], ["왼눈 ← 오른눈용", LR, "#d4493a"], ["오른눈 ← 오른눈용", RR, "#d4493a"], ["오른눈 ← 왼눈용", RL, "#3f6fa3"]];
    const rh = (h - 40) / 4;
    rows.forEach(([name, val, col], i) => {
      const y = 22 + i * rh;
      txt(name, bx, y, "left", C.ink);
      ctx.fillStyle = C.rule; ctx.fillRect(bx, y + 6, bw, 12);
      ctx.fillStyle = col; ctx.globalAlpha = i % 2 ? 0.55 : 1; ctx.fillRect(bx, y + 6, bw * Math.min(1, val), 12); ctx.globalAlpha = 1;
      txt(`${(val * 100).toFixed(1)} %`, bx + bw, y, "right", i % 2 ? C.warn : C.ink, `11px ${F.mono}`);
    });
    N[0].dt.textContent = "왼눈: 제 영상 통과"; N[0].dd.textContent = `${(LL * 100).toFixed(1)} %`;
    N[1].dt.textContent = "누화 비율 (남 영상 / 제 영상)"; const x = LR / Math.max(LL, 1e-9);
    N[1].dd.textContent = `${(x * 100).toFixed(1)} %`; N[1].dd.className = "n1 " + (x < 0.01 ? "good" : "bad");
    N[2].dt.textContent = circ ? "이 파장에서 파장판 지연" : "말뤼스 예측 sin²β / cos²β";
    N[2].dd.textContent = circ ? `${(d / RAD).toFixed(1)}°` : `${(Math.tan(b) ** 2 * 100).toFixed(1)} %`;
    N[0].dd.className = "n0"; N[2].dd.className = "n2";
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    if (mode === "plate") drawPlate(w, h); else draw3D(w, h, mode === "circ");
  }
  function setMode(m) {
    mode = m;
    root.querySelectorAll("[data-m]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.m === m)));
    MODES[m].forEach((d, i) => { const s = SL[i]; s.lab.textContent = d[0]; s.inp.min = d[1]; s.inp.max = d[2]; s.inp.step = d[3]; s.inp.value = store[m][i]; s.inp.setAttribute("aria-label", d[0]); });
    update();
  }
  function update() {
    MODES[mode].forEach((d, i) => { store[mode][i] = +SL[i].inp.value; SL[i].out.textContent = d[5](store[mode][i]); });
    draw();
  }
  root.querySelectorAll("[data-m]").forEach((b) => b.addEventListener("click", () => setMode(b.dataset.m)));
  SL.forEach((s) => s.inp.addEventListener("input", update));
  const dq = new URLSearchParams(location.search).get("demo");
  setMode(MODES[dq] ? dq : "plate");
})();
