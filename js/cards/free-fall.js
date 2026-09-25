/* 카드: 무거운 물체가 더 빨리 떨어질까? — 공기 저항이 있는/없는 낙하 */
(() => {
  const root = document.getElementById("card-free-fall");
  if (!root) return;
  const { C, F, clamp, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const selA = $(".obj-a"), selB = $(".obj-b"), air = $(".air"), hS = $(".height"), hO = $(".height-out"), go = $(".drop");
  const out = { a: root.querySelectorAll(".ra dd"), b: root.querySelectorAll(".rb dd") };

  const g = 9.81, RHO = 1.2;
  // 질량(kg), 반지름(m), 항력계수 — 대표값
  const OBJ = {
    bowling: { name: "볼링공", m: 7.0, r: 0.109, cd: 0.47, color: C.ink },
    baseball: { name: "야구공", m: 0.145, r: 0.0366, cd: 0.4, color: "#8a6b4e" },
    pingpong: { name: "탁구공", m: 0.0027, r: 0.020, cd: 0.47, color: C.amber },
    paper: { name: "구긴 종이공", m: 0.005, r: 0.035, cd: 0.6, color: "#9aa0a6" },
  };
  const vt = (o) => Math.sqrt(2 * o.m * g / (RHO * o.cd * Math.PI * o.r * o.r)); // 종단 속도

  // 궤적을 미리 계산: dv/dt = g - k v², k = ρ Cd A / 2m
  function simulate(o, H, withAir) {
    const k = withAir ? RHO * o.cd * Math.PI * o.r * o.r / (2 * o.m) : 0;
    const dt = 0.001, pts = [[0, 0, 0]];
    let t = 0, y = 0, v = 0;
    while (y < H && t < 60) {
      const a1 = g - k * v * v, v1 = v + a1 * dt / 2;
      const a2 = g - k * v1 * v1;
      y += v1 * dt; v += a2 * dt; t += dt;
      if (Math.round(t * 1000) % 10 === 0) pts.push([t, Math.min(y, H), v]);
    }
    // 마지막 점은 땅에 닿는 순간으로 보정
    const [tp, yp, vp] = pts[pts.length - 1];
    const frac = y > yp ? (H - yp) / (y - yp) : 1;
    const tl = tp + frac * (t - tp), vl = vp + frac * (v - vp);
    pts.push([tl, H, vl]);
    return { pts, tl, vl };
  }

  let A, B, H, clock = 0, running = false;
  function prepare() {
    H = +hS.value; hO.textContent = H;
    A = simulate(OBJ[selA.value], H, air.checked);
    B = simulate(OBJ[selB.value], H, air.checked);
    clock = 0; running = false;
    for (const [key, sim, o] of [["a", A, OBJ[selA.value]], ["b", B, OBJ[selB.value]]]) {
      const [t, v, term] = out[key];
      t.textContent = `${sim.tl.toFixed(2)} s`;
      v.textContent = `${sim.vl.toFixed(1)} m/s`;
      term.textContent = air.checked ? `${vt(o).toFixed(1)} m/s` : "없음";
    }
    draw();
  }
  const at = (sim, t) => {
    const p = sim.pts; if (t >= sim.tl) return p[p.length - 1];
    const i = clamp(Math.floor(t / 0.01), 0, p.length - 2);
    return p[i];
  };

  const { ctx, size } = fit(cv, () => draw());

  function draw() {
    const { w, h } = size; if (!w || !A) return;
    ctx.clearRect(0, 0, w, h);
    const split = Math.round(w * 0.36);
    // ── 왼쪽: 낙하 장면
    const top = 26, bot = h - 26, sc = (bot - top) / H;
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(10, bot + .5); ctx.lineTo(split - 10, bot + .5); ctx.stroke();
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3;
    const stepM = H <= 20 ? 5 : H <= 50 ? 10 : 25;
    for (let m = 0; m <= H; m += stepM) {
      const y = top + m * sc;
      ctx.beginPath(); ctx.moveTo(split - 16, y + .5); ctx.lineTo(split - 10, y + .5); ctx.stroke();
      ctx.textAlign = "right"; ctx.fillText(`${m}`, split - 20, y + 3);
    }
    ctx.textAlign = "left"; ctx.fillText("m", split - 18, top - 10);
    const lanes = [[A, OBJ[selA.value], split * 0.3], [B, OBJ[selB.value], split * 0.6]];
    for (const [sim, o, x] of lanes) {
      const [, y] = at(sim, clock);
      const r = 5 + 9 * Math.cbrt(o.r / 0.109);
      ctx.beginPath(); ctx.arc(x, top + y * sc - r * (y >= H ? 1 : 0), r, 0, Math.PI * 2);
      ctx.fillStyle = o.color; ctx.fill();
      ctx.fillStyle = C.ink2; ctx.textAlign = "center"; ctx.fillText(o.name, x, top - 10);
    }
    ctx.textAlign = "left";
    ctx.fillStyle = C.ink; ctx.font = `500 13px ${F.mono}`;
    ctx.fillText(`t = ${clock.toFixed(2)} s`, 10, bot + 18);

    // ── 오른쪽: 속력–시간 그래프
    const x0 = split + 40, y0 = 24, pw = w - x0 - 10, ph = h - y0 - 34;
    const tMax = Math.max(A.tl, B.tl) * 1.05, vMax = Math.max(A.vl, B.vl, 1) * 1.15;
    const X = (t) => x0 + t / tMax * pw, Y = (v) => y0 + (1 - v / vMax) * ph;
    const niceStep = (m) => { const s = m / 4, p = 10 ** Math.floor(Math.log10(s)); return [1, 2, 5, 10].map((k) => k * p).find((k) => k >= s); };
    const xs = niceStep(tMax), ys = niceStep(vMax), xt = [], yt = [];
    for (let t = 0; t <= tMax; t += xs) xt.push([t, t.toFixed(xs < 1 ? 1 : 0)]);
    for (let v = 0; v <= vMax; v += ys) yt.push([v, v.toFixed(0)]);
    NM.axes(ctx, { x0, y0, w: pw, h: ph, X, Y, xt, yt, ylabel: "속력 (m/s)", xlabel: "시간 (s)" });
    if (air.checked) for (const [, o] of lanes) {
      const v = vt(o); if (v > vMax) continue;
      ctx.setLineDash([2, 4]); ctx.strokeStyle = o.color; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x0, Y(v)); ctx.lineTo(x0 + pw, Y(v)); ctx.stroke(); ctx.setLineDash([]);
    }
    for (const [sim, o] of lanes) {
      ctx.beginPath();
      for (const [t, , v] of sim.pts) { if (t > clock) break; t ? ctx.lineTo(X(t), Y(v)) : ctx.moveTo(X(t), Y(v)); }
      ctx.strokeStyle = o.color; ctx.lineWidth = 2.2; ctx.stroke();
    }
  }

  [selA, selB, air, hS].forEach((el) => el.addEventListener("input", prepare));
  go.addEventListener("click", () => { clock = 0; running = true; });
  prepare();
  let autoplayed = false;
  loop(cv, (dt) => {
    if (!autoplayed && !NM.reduce) { autoplayed = true; running = true; }
    if (!running) return;
    clock += dt;
    if (clock >= Math.max(A.tl, B.tl)) { clock = Math.max(A.tl, B.tl); running = false; }
    draw();
  });
})();
