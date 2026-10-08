/* 카드: 둔각이나 음의 각의 사인은 무엇일까? — 동경 위의 점 P(x, y)로 sin θ = y/r, cos θ = x/r, tan θ = y/x를 정하고 짝 각과 비교한다 */
(() => {
  const root = document.getElementById("card-alg-trig-def");
  if (!root) return;
  const { C, F, fit, clamp } = NM;
  const $ = (s) => root.querySelector(s), pairs = [...root.querySelectorAll(".presets .chip")];
  const cv = $("canvas"), sd = $(".d"), sr = $(".r");
  const M = "−", n = (v, d = 2) => { const r = Math.round(v * 10 ** d) / 10 ** d; return r === 0 ? "0" : (r < 0 ? M : "") + Math.abs(r); };
  const SIN = { 0: "0", 30: "1/2", 45: "√2/2", 60: "√3/2", 90: "1", 120: "√3/2", 135: "√2/2", 150: "1/2", 180: "0", 210: "−1/2", 225: "−√2/2", 240: "−√3/2", 270: "−1", 300: "−√3/2", 315: "−√2/2", 330: "−1/2" };
  const TAN = { 0: "0", 30: "√3/3", 45: "1", 60: "√3", 120: "−√3", 135: "−1", 150: "−√3/3", 180: "0", 210: "√3/3", 225: "1", 240: "√3", 300: "−√3", 315: "−1", 330: "−√3/3" };
  const md = (d) => ((d % 360) + 360) % 360;
  const exact = (f, d) => {
    d = md(d);
    if (f === "tan" && d % 180 === 90) return "정의되지 않음";
    const v = f === "sin" ? Math.sin(d * Math.PI / 180) : f === "cos" ? Math.cos(d * Math.PI / 180) : Math.tan(d * Math.PI / 180);
    const e = f === "sin" ? SIN[d] : f === "cos" ? SIN[md(d + 90)] : TAN[d];
    return e === undefined ? `≈ ${n(v, 3)}` : /√/.test(e) ? `${e} ≈ ${n(v, 3)}` : e;
  };
  const gcd = (a, b) => (b ? gcd(b, a % b) : a);
  const piStr = (deg) => { let p = deg / 15, q = 12; const g = gcd(Math.abs(p), q) || 1; p /= g; q /= g; return p === 0 ? "0" : `${p < 0 ? M : ""}${Math.abs(p) === 1 ? "" : Math.abs(p)}π${q === 1 ? "" : "/" + q}`; };
  let mode = "none";
  const { ctx, size } = fit(cv, () => draw());
  const S = () => size.w / 7.4;

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const s = S(), ox = w / 2, oy = h / 2, X = (x) => ox + x * s, Y = (y) => oy - y * s;
    const d = +sd.value, r = +sr.value, t = d * Math.PI / 180, x = r * Math.cos(t), y = r * Math.sin(t);
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.beginPath();
    for (let k = -3; k <= 3; k++) { ctx.moveTo(X(k), 0); ctx.lineTo(X(k), h); ctx.moveTo(0, Y(k)); ctx.lineTo(w, Y(k)); }
    ctx.stroke();
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(0, oy); ctx.lineTo(w, oy); ctx.moveTo(ox, 0); ctx.lineTo(ox, h); ctx.stroke();
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "center"; ctx.textBaseline = "top";
    [-3, -2, -1, 1, 2, 3].forEach((k) => { ctx.fillText(n(k), X(k), oy + 4); });
    ctx.textAlign = "right"; ctx.textBaseline = "middle";
    [-3, -2, -1, 1, 2, 3].forEach((k) => { ctx.fillText(n(k), ox - 4, Y(k)); });
    ctx.fillText("x", w - 4, oy - 10); ctx.textAlign = "left"; ctx.fillText("y", ox + 6, 8);
    ctx.strokeStyle = C.ink3; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.arc(ox, oy, r * s, 0, 7); ctx.stroke(); ctx.setLineDash([]);
    if (mode !== "none") {
      const [qx, qy] = mode === "neg" ? [x, -y] : mode === "sup" ? [-x, y] : [-x, -y];
      ctx.strokeStyle = C.warn; ctx.lineWidth = 2; ctx.setLineDash([6, 4]);
      ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(X(qx), Y(qy)); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = C.warn; ctx.beginPath(); ctx.arc(X(qx), Y(qy), 5, 0, 7); ctx.fill();
      ctx.font = `600 12px ${F.sans}`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("Q", X(qx) + (qx >= 0 ? 12 : -12), Y(qy) + (qy >= 0 ? -12 : 12));
    }
    ctx.globalAlpha = 0.35; ctx.fillStyle = C.sprout;
    ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(X(x), oy); ctx.lineTo(X(x), Y(y)); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
    ctx.lineWidth = 3;
    ctx.strokeStyle = C.amber; ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(X(x), oy); ctx.stroke();
    ctx.strokeStyle = C.forest; ctx.beginPath(); ctx.moveTo(X(x), oy); ctx.lineTo(X(x), Y(y)); ctx.stroke();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(X(x), Y(y)); ctx.stroke();
    if (d > 0) {
      ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(ox, oy, 0.38 * s, 0, -t, true); ctx.stroke();
      ctx.font = `600 12px ${F.serif}`; ctx.fillStyle = C.ink2; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("θ", ox + 0.62 * s * Math.cos(t / 2), oy - 0.62 * s * Math.sin(t / 2));
    }
    ctx.font = `600 12px ${F.sans}`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    if (Math.abs(x) > 0.25) { ctx.fillStyle = C.amber; ctx.fillText("x", X(x / 2), oy + (y >= 0 ? -10 : 10)); }
    if (Math.abs(y) > 0.25) { ctx.fillStyle = C.forest; ctx.fillText("y", X(x) + (x >= 0 ? 11 : -11), Y(y / 2)); }
    ctx.fillStyle = C.ink; ctx.fillText("r", X(x / 2) - 11 * Math.sin(t), Y(y / 2) - 11 * Math.cos(t));
    ctx.fillStyle = C.forest; ctx.beginPath(); ctx.arc(X(x), Y(y), 8, 0, 7); ctx.fill();
    ctx.fillStyle = C.card; ctx.beginPath(); ctx.arc(X(x), Y(y), 3, 0, 7); ctx.fill();
    const lab = `P(${n(x)}, ${n(y)})`;
    ctx.font = `11px ${F.mono}`; const tw = ctx.measureText(lab).width;
    let lx = X(x) + (x >= 0 ? 12 : -12 - tw), ly = Y(y) + (y >= 0 ? -14 : 14);
    lx = clamp(lx, 2, w - tw - 2); ly = clamp(ly, 10, h - 10);
    ctx.fillStyle = C.card; ctx.fillRect(lx - 2, ly - 8, tw + 4, 16);
    ctx.fillStyle = C.ink; ctx.textAlign = "left"; ctx.fillText(lab, lx, ly);
  }

  const QUAD = ["", "제1사분면: sin +, cos +, tan +", "제2사분면: sin +, cos −, tan −", "제3사분면: sin −, cos −, tan +", "제4사분면: sin −, cos +, tan −"];
  function update() {
    const d = +sd.value, r = +sr.value, t = d * Math.PI / 180;
    $(".d-out").textContent = d; $(".r-out").textContent = n(r, 1);
    $(".n-t").textContent = `${piStr(d)} (${d}°)`;
    $(".n-s").textContent = exact("sin", d); $(".n-c").textContent = exact("cos", d); $(".n-tn").textContent = exact("tan", d);
    const q = d % 90 === 0 ? 0 : Math.floor(d / 90) + 1;
    const s = Math.sin(t), c = Math.cos(t);
    let txt = `r = ${n(r, 1)} · ${q ? QUAD[q] : "축 위의 동경"} · sin²θ + cos²θ = ${n(s * s, 3)} + ${n(c * c, 3)} = ${n(s * s + c * c, 3)}`;
    if (mode !== "none") {
      const nm = { neg: `${M}θ`, sup: "π − θ", opp: "π + θ" }[mode], qd = { neg: -d, sup: 180 - d, opp: 180 + d }[mode];
      const rel = { neg: "x축 대칭: sin은 부호만 반대, cos는 같음", sup: "y축 대칭: sin은 같음, cos는 부호만 반대", opp: "원점 대칭: sin, cos 모두 부호 반대, tan는 같음" }[mode];
      txt += `\nQ의 각 ${nm}: sin = ${exact("sin", qd)}, cos = ${exact("cos", qd)} (${rel})`;
    }
    $(".eq").textContent = txt;
    pairs.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.m === mode)));
    draw();
  }

  let drag = false;
  const pick = (e) => {
    const b = cv.getBoundingClientRect(), s = S();
    const x = (e.clientX - b.left - size.w / 2) / s, y = (size.h / 2 - (e.clientY - b.top)) / s;
    if (Math.hypot(x, y) < 0.15) return;
    sr.value = clamp(Math.round(Math.hypot(x, y) * 10) / 10, 0.5, 3);
    sd.value = md(Math.round(Math.atan2(y, x) * 180 / Math.PI / 5) * 5) % 360;
    update();
  };
  cv.addEventListener("pointerdown", (e) => { drag = true; cv.setPointerCapture(e.pointerId); pick(e); });
  cv.addEventListener("pointermove", (e) => { if (drag) pick(e); });
  cv.addEventListener("pointerup", () => { drag = false; }); cv.addEventListener("pointercancel", () => { drag = false; });
  sd.addEventListener("input", update); sr.addEventListener("input", update);
  pairs.forEach((b) => b.addEventListener("click", () => { mode = b.dataset.m; update(); }));
  update();
})();
