/* 카드: 뚜껑 닫은 병 속의 물은 왜 줄지 않을까? — 증발과 응축의 동적 평형 */
(() => {
  const root = document.getElementById("card-chem-vapor-eq");
  if (!root) return;
  const { C, F, clamp, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const sT = $(".temp"), oT = $(".temp-out"), lid = $(".lid"), again = $(".again");
  const dP = $(".p-vap"), dPs = $(".p-sat"), dE = $(".r-evap"), dC = $(".r-cond"), msg = $(".msg");

  // 물의 포화 수증기압 (앙투안 식, 1–100 °C), kPa
  const Psat = (T) => 10 ** (8.07131 - 1730.63 / (233.426 + T)) * 0.133322;
  const N25 = 30;              // 25 °C 평형에서 보이는 수증기 점 수 (모식)
  const kc = 0.55;             // 수증기 점 하나가 1초 안에 응축될 확률 (모식)
  const Neq = () => N25 * Psat(+sT.value) / Psat(25);

  let V = [], open = false, water = 1, t = 0, ev = [], hist = [], sample = 0;
  function reset() { V = []; water = 1; t = 0; ev = []; hist = []; sample = 0; }

  function step(dt) {
    const E = kc * Neq();          // 증발 속도: 온도로만 정해진다
    // 포아송 발생: dt 동안 평균 E·dt 개가 증발
    let k = 0; const lam = E * dt; let L = Math.exp(-lam), pr = 1;
    do { k++; pr *= Math.random(); } while (pr > L); k--;
    for (let i = 0; i < k; i++) {
      V.push({ x: Math.random(), y: 0.001, vx: (Math.random() - .5) * .5, vy: 0.25 + Math.random() * .3, down: false });
      ev.push({ t, d: 1 }); water -= 0.0005;
    }
    for (let i = V.length - 1; i >= 0; i--) {
      const p = V[i];
      if (!p.down && Math.random() < kc * dt) { p.down = true; p.vy = -(0.35 + Math.random() * .3); }
      p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.x < 0) { p.x = -p.x; p.vx = Math.abs(p.vx); } if (p.x > 1) { p.x = 2 - p.x; p.vx = -Math.abs(p.vx); }
      if (p.y > 1) {
        if (open && p.x > 0.3 && p.x < 0.7) { V.splice(i, 1); continue; }  // 병 밖으로 날아감
        p.y = 2 - p.y; p.vy = -Math.abs(p.vy);
      }
      if (p.y <= 0) {
        if (p.down) { V.splice(i, 1); ev.push({ t, d: -1 }); water += 0.0005; continue; }
        p.y = -p.y; p.vy = Math.abs(p.vy);
      }
      if (!p.down && Math.random() < dt * 1.5) { const a = Math.random() * Math.PI * 2; p.vx = Math.cos(a) * .35; p.vy = Math.sin(a) * .35; }
    }
    if (open) water = Math.max(0.35, water);
    ev = ev.filter((e) => e.t > t - 3);
    t += dt; sample += dt;
    if (sample > 0.1) {
      sample = 0;
      const w = Math.min(2, Math.max(t, 0.3));
      const e = ev.filter((x) => x.t > t - w && x.d > 0).length / w, c = ev.filter((x) => x.t > t - w && x.d < 0).length / w;
      hist.push({ t, e, c, n: V.length }); if (hist.length > 600) hist.shift();
    }
  }

  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const split = Math.round(w * 0.4);
    // ── 병
    const bx = 14, bw = split - 30, by = 44, bh = h - 64, neck = bw * 0.4;
    const liqTop = by + bh * (1 - 0.38 * water);
    const airTop = by, airH = liqTop - airTop;
    ctx.fillStyle = "rgba(90,150,210,.20)"; ctx.fillRect(bx, liqTop, bw, by + bh - liqTop);
    ctx.strokeStyle = "#5a96d2"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(bx, liqTop + .5); ctx.lineTo(bx + bw, liqTop + .5); ctx.stroke();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5;
    const nx = bx + (bw - neck) / 2;
    ctx.beginPath(); ctx.moveTo(nx, by - 20); ctx.lineTo(nx, by); ctx.lineTo(bx, by); ctx.lineTo(bx, by + bh); ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx + bw, by); ctx.lineTo(nx + neck, by); ctx.lineTo(nx + neck, by - 20); ctx.stroke();
    if (!open) { ctx.fillStyle = C.ink2; ctx.fillRect(nx - 4, by - 30, neck + 8, 10); }
    // 점: 병 입구 영역(0.3–0.7)은 목 아래
    for (const p of V) {
      const x = bx + 3 + p.x * (bw - 6), y = liqTop - 3 - p.y * (airH - 6);
      ctx.beginPath(); ctx.arc(x, y, 2.6, 0, Math.PI * 2); ctx.fillStyle = "#5a96d2"; ctx.fill();
    }
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left";
    ctx.fillText(open ? "뚜껑 열림" : "뚜껑 닫힘", bx, h - 6);
    ctx.textAlign = "right"; ctx.fillText(`${(+sT.value).toFixed(0)} °C`, bx + bw, h - 6);

    // ── 그래프: 증발 속도 · 응축 속도
    const x0 = split + 34, y0 = 22, pw = w - x0 - 10, ph = h - y0 - 34;
    const tNow = Math.max(t, 20), tMin = tNow - 20;
    const E = kc * Neq(), rMax = Math.max(10, E * 1.8);
    const X = (tt) => x0 + (tt - tMin) / 20 * pw, Y = (r) => y0 + (1 - r / rMax) * ph;
    const st = rMax > 60 ? 40 : rMax > 30 ? 20 : rMax > 15 ? 10 : 5, yt = [];
    for (let v = 0; v <= rMax; v += st) yt.push([v, `${v}`]);
    const xt = []; for (let s = Math.ceil(tMin / 5) * 5; s <= tNow; s += 5) xt.push([s, `${s}`]);
    NM.axes(ctx, { x0, y0, w: pw, h: ph, X, Y, xt, yt, ylabel: "1초 동안 일어나는 횟수 (모식)", xlabel: "시간 (s)" });
    const line = (key, col) => {
      ctx.beginPath(); let s0 = false;
      for (const s of hist) { if (s.t < tMin) continue; s0 ? ctx.lineTo(X(s.t), Y(s[key])) : ctx.moveTo(X(s.t), Y(s[key])); s0 = true; }
      ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.stroke();
    };
    line("e", C.amber); line("c", "#2f6fb0");
    ctx.textAlign = "right"; ctx.font = `10.5px ${F.mono}`;
    ctx.fillStyle = "#a8781c"; ctx.fillText("증발", x0 + pw, y0 + 12);
    ctx.fillStyle = "#2f6fb0"; ctx.fillText("응축", x0 + pw, y0 + 26);
  }

  function readout() {
    const T = +sT.value, ps = Psat(T), n = V.filter((p) => !p.down).length; // 응축하러 내려가는 점은 이미 표면에 닿은 것으로 본다
    const last = hist[hist.length - 1] || { e: 0, c: 0 };
    dP.textContent = `${(ps * n / Neq()).toFixed(2)} kPa`;
    dPs.textContent = `${ps.toFixed(2)} kPa`;
    dE.textContent = last.e.toFixed(0); dC.textContent = last.c.toFixed(0);
    const near = Math.abs(last.e - last.c) < Math.max(3, 0.25 * last.e) && t > 4;
    msg.textContent = open ? "열린 병: 날아간 수증기는 돌아오지 않으니 응축이 증발을 따라잡지 못합니다. 물이 계속 줄어듭니다."
      : near ? "증발과 응축의 빠르기가 같아졌습니다. 둘 다 계속 일어나지만 물의 양은 더 변하지 않습니다."
      : "수증기가 쌓이는 중입니다. 수증기가 많아질수록 응축도 잦아집니다.";
  }

  sT.addEventListener("input", () => { oT.textContent = sT.value; readout(); draw(); });
  lid.addEventListener("click", () => { open = !open; lid.textContent = open ? "뚜껑 닫기" : "뚜껑 열기"; });
  again.addEventListener("click", () => { reset(); draw(); });
  oT.textContent = sT.value;
  reset();
  let acc = 0;
  loop(cv, (dt) => {
    for (let i = 0; i < 3; i++) step(dt / 3);
    draw(); acc += dt; if (acc > 0.25) { acc = 0; readout(); }
  });
  readout();
})();
