/* 카드: 화성이 26개월마다 충이 된다는 것만으로 화성까지의 거리를 알 수 있을까? — 회합 주기, 공전 주기, 궤도 반지름 */
(() => {
  const root = document.getElementById("card-adearth-synodic");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sA = $(".a"), sT = $(".t"), bPlay = $(".ae-play"), bAns = $(".ae-ans");
  const PE = 365.256, TAU = 2 * Math.PI;
  let playing = false, showAns = false, tmax = 2000;
  const aNow = () => 10 ** +sA.value;
  const per = (a) => PE * a ** 1.5;
  const syn = (a) => 1 / Math.abs(1 / PE - 1 / per(a));
  const pos = (a, t) => { const P = per(a), thE = TAU * t / PE, thP = TAU * t / P + 0.9; return { ex: Math.cos(thE), ey: Math.sin(thE), px: a * Math.cos(thP), py: a * Math.sin(thP) }; };
  function elong(a, t) {
    const p = pos(a, t), gx = p.px - p.ex, gy = p.py - p.ey, sx = -p.ex, sy = -p.ey;
    const cr = sx * gy - sy * gx, dt = sx * gx + sy * gy;
    return Math.atan2(cr, dt) * 180 / Math.PI; /* + : 태양의 동쪽 (반시계 방향) */
  }
  function config(a, e) {
    const ae = Math.abs(e);
    if (a > 1) { if (ae < 2) return "합"; if (ae > 178) return "충"; if (Math.abs(ae - 90) < 1.5) return e > 0 ? "동구" : "서구"; return "—"; }
    const em = Math.asin(a) * 180 / Math.PI;
    if (ae < 1.5) { const t = +sT.value, p = pos(a, t); return Math.hypot(p.px - p.ex, p.py - p.ey) < 1 ? "내합" : "외합"; }
    if (ae > em - 0.6) return e > 0 ? "동방 최대 이각" : "서방 최대 이각";
    return "—";
  }
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const a = aNow(), t = +sT.value, p = pos(a, t);
    /* 위: 궤도 */
    const top = h * 0.56, cx = w * 0.36, cy = top / 2 + 4, R = (top / 2 - 10) / Math.max(1, a);
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, R * a, 0, TAU); ctx.stroke();
    const E = [cx + R * p.ex, cy - R * p.ey], Pp = [cx + R * p.px, cy - R * p.py];
    /* 삼각형 */
    ctx.strokeStyle = C.ink3; ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(...E); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(...Pp); ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = C.forest; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(...E); ctx.lineTo(...Pp); ctx.stroke();
    /* 이각 호 */
    const e = elong(a, t), aS = Math.atan2(cy - E[1], cx - E[0]);
    ctx.strokeStyle = C.amber; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(E[0], E[1], 16, aS, aS - e * Math.PI / 180, e > 0); ctx.stroke();
    ctx.fillStyle = C.amber; ctx.beginPath(); ctx.arc(cx, cy, 8, 0, TAU); ctx.fill();
    ctx.fillStyle = "#3f6fa3"; ctx.beginPath(); ctx.arc(...E, 5.5, 0, TAU); ctx.fill();
    ctx.fillStyle = C.apple; ctx.beginPath(); ctx.arc(...Pp, 5, 0, TAU); ctx.fill();
    ctx.font = `10.5px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.textAlign = "left";
    ctx.fillText("지구", E[0] + 8, E[1] - 6); ctx.fillText("행성", Pp[0] + 8, Pp[1] - 6);
    /* 오른쪽 설명 */
    const lx = w * 0.70; let ly = 24;
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.mono}`;
    const line = (s) => { ctx.fillText(s, lx, ly); ly += 16; };
    line(`지구 P = ${PE.toFixed(1)} 일`);
    line(`관측 t = ${t} 일`);
    ctx.font = `10.5px ${F.sans}`; ctx.fillStyle = C.forest; line("— 지구→행성 시선");
    ctx.fillStyle = C.amber; line("◠ 이각");
    if (a < 1) { ctx.fillStyle = C.ink3; line("최대 이각에서"); line("행성에 직각"); }
    else { ctx.fillStyle = C.ink3; line("구(90°)에서"); line("지구에 직각"); }
    /* 아래: 이각 그래프 */
    const gx0 = 40, gx1 = w - 10, gy0 = top + 22, gy1 = h - 32;
    const em = a < 1 ? Math.ceil(Math.asin(a) * 180 / Math.PI / 10) * 10 + 10 : 180;
    const X = (tt) => gx0 + tt / tmax * (gx1 - gx0), Y = (v) => gy0 + (em - v) / (2 * em) * (gy1 - gy0);
    const yt = a < 1 ? [[em, `${em}°`], [0, "0°"], [-em, `−${em}°`]] : [[180, "180°"], [90, "90°"], [0, "0°"], [-90, "−90°"], [-180, "−180°"]];
    const step = tmax > 4000 ? 1000 : tmax > 1500 ? 500 : 200, xt = [];
    for (let v = 0; v <= tmax; v += step) xt.push([v, String(v)]);
    NM.axes(ctx, { x0: gx0, y0: gy0, w: gx1 - gx0, h: gy1 - gy0, X, Y, xt, yt, xlabel: "경과 일수", ylabel: "이각 (동 +, 서 −)" });
    ctx.save(); ctx.beginPath(); ctx.rect(gx0, gy0, gx1 - gx0, gy1 - gy0); ctx.clip();
    ctx.strokeStyle = C.apple; ctx.lineWidth = 1.5; ctx.beginPath();
    let prev = null;
    for (let i = 0; i <= 900; i++) {
      const tt = i / 900 * tmax, v = elong(a, tt), x = X(tt), y = Y(v);
      if (prev !== null && Math.abs(v - prev) > 180) ctx.moveTo(x, y); else if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      prev = v;
    }
    ctx.stroke();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X(t), gy0); ctx.lineTo(X(t), gy1); ctx.stroke();
    ctx.fillStyle = C.apple; ctx.beginPath(); ctx.arc(X(t), Y(e), 4, 0, TAU); ctx.fill();
    ctx.restore();
  }
  function setRange() {
    const S = syn(aNow());
    tmax = Math.round(Math.min(6000, Math.max(800, 2.4 * S)));
    sT.max = tmax; if (+sT.value > tmax) sT.value = tmax;
  }
  function update() {
    const a = aNow(), t = +sT.value, e = elong(a, t);
    $(".a-out").textContent = a.toFixed(3); $(".t-out").textContent = t;
    root.querySelectorAll("[data-a]").forEach((b) => b.setAttribute("aria-pressed", String(Math.abs(+b.dataset.a - a) < 0.002)));
    $(".n-e").textContent = `${e >= 0 ? "+" : "−"}${Math.abs(e).toFixed(1)}°`;
    $(".n-c").textContent = config(a, e);
    if (showAns) {
      const P = per(a), S = syn(a);
      $(".n-s").textContent = `${S.toFixed(0)} 일`;
      $(".n-p").textContent = `${P < 3000 ? P.toFixed(0) + " 일" : (P / PE).toFixed(2) + " 년"} → ${a.toFixed(2)} AU`;
    } else { $(".n-s").textContent = "직접 재기"; $(".n-p").textContent = "직접 재기"; }
    bAns.setAttribute("aria-pressed", String(showAns));
    bPlay.setAttribute("aria-pressed", String(playing)); bPlay.textContent = playing ? "멈춤" : "재생";
    draw();
  }
  sA.addEventListener("input", () => { setRange(); update(); });
  sT.addEventListener("input", update);
  root.querySelectorAll("[data-a]").forEach((b) => b.addEventListener("click", () => { sA.value = Math.log10(+b.dataset.a); sT.value = 0; setRange(); update(); }));
  bPlay.addEventListener("click", () => { playing = !playing; update(); });
  bAns.addEventListener("click", () => { showAns = !showAns; update(); });
  loop(cv, (dt) => {
    if (!playing) return;
    let t = +sT.value + dt * tmax / 20;
    if (t > tmax) t = 0;
    sT.value = Math.round(t); update();
  });
  setRange(); update();
})();
