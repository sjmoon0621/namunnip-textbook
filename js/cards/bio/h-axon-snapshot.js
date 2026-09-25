/* 카드: 자극 후 몇 ms, 축삭의 각 지점은 어떤 상태일까? — 흥분 전도와 지점별 막전위 (모식 파형) */
(() => {
  const root = document.getElementById("card-bio-snapshot");
  if (!root) return;
  const { C, F, fit, loop, clamp } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const sT = $(".tt"), oT = $(".tt-out"), sV = $(".vv"), oV = $(".vv-out");
  const cells = [...root.querySelectorAll(".pt dd")];
  const playBtn = $(".play");

  // 한 지점의 막전위 변화 (교과서에서 흔히 쓰는 모식 파형): [ms, mV]
  const P = [[0, -70], [0.6, -67], [1, -55], [1.4, -15], [1.8, 22], [2, 30], [2.25, 18], [2.6, -30], [3, -80], [3.4, -77], [4, -70]];
  // 단조 3차 보간 (Fritsch–Carlson): 꼭짓점을 넘어서지 않는다
  const n = P.length, xs = P.map((p) => p[0]), ys = P.map((p) => p[1]);
  const dk = [], mk = [];
  for (let i = 0; i < n - 1; i++) dk.push((ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]));
  mk[0] = dk[0]; mk[n - 1] = dk[n - 2];
  for (let i = 1; i < n - 1; i++) mk[i] = dk[i - 1] * dk[i] <= 0 ? 0 : (dk[i - 1] + dk[i]) / 2;
  for (let i = 0; i < n - 1; i++) {
    if (dk[i] === 0) { mk[i] = mk[i + 1] = 0; continue; }
    const a = mk[i] / dk[i], b = mk[i + 1] / dk[i], s = a * a + b * b;
    if (s > 9) { const tau = 3 / Math.sqrt(s); mk[i] = tau * a * dk[i]; mk[i + 1] = tau * b * dk[i]; }
  }
  function wave(t) {
    if (t <= 0 || t >= 4) return -70;
    let i = 0; while (t > xs[i + 1]) i++;
    const hh = xs[i + 1] - xs[i], u = (t - xs[i]) / hh;
    const h00 = 2 * u ** 3 - 3 * u ** 2 + 1, h10 = u ** 3 - 2 * u ** 2 + u, h01 = -2 * u ** 3 + 3 * u ** 2, h11 = u ** 3 - u ** 2;
    return h00 * ys[i] + h10 * hh * mk[i] + h01 * ys[i + 1] + h11 * hh * mk[i + 1];
  }
  function stage(e) {
    if (e <= 0) return ["아직 도착 전", C.ink3];
    if (e >= 4) return ["회복됨 (분극)", C.ink3];
    if (Math.abs(e - 2) < 0.05) return ["최고점", C.warn];
    if (e < 2) return ["탈분극", C.warn];
    if (e < 3) return [wave(e) > -70 ? "재분극" : "과분극", "#3f6f9f"];
    return ["과분극", "#3f6f9f"];
  }

  const PTS = [0, 2, 4, 6, 8], NAMES = ["d₁", "d₂", "d₃", "d₄", "d₅"], LEN = 8;
  let src = 0, playing = false;
  const { ctx, size } = fit(cv, () => draw());

  function draw() {
    const { w, h } = size;
    if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const t = +sT.value, v = +sV.value;
    const el = (x) => t - Math.abs(x - PTS[src]) / v; // 그 지점에 흥분이 도착한 뒤 지난 시간
    const pl = 40, pr = 14, gw = w - pl - pr;
    const Xx = (x) => pl + x / LEN * gw;
    ctx.font = `10.5px ${F.mono}`;

    /* 1. 축삭 띠: 막전위를 색으로 */
    const ay = 30, ah = 14;
    for (let i = 0; i < gw; i += 2) {
      const x = i / gw * LEN, V = wave(el(x));
      const k = clamp((V + 80) / 110, 0, 1);
      ctx.fillStyle = V > -70 ? `rgba(181,83,47,${0.12 + 0.8 * k})` : V < -71 ? "rgba(63,111,159,.55)" : "#ece8dc";
      ctx.fillRect(pl + i, ay - ah / 2, 2.2, ah);
    }
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1; ctx.strokeRect(pl + .5, ay - ah / 2 + .5, gw, ah);
    // 자극 위치
    const sx = Xx(PTS[src]);
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.moveTo(sx, ay - ah / 2 - 2); ctx.lineTo(sx - 5, ay - ah / 2 - 11); ctx.lineTo(sx + 5, ay - ah / 2 - 11); ctx.fill();
    ctx.textAlign = "center"; ctx.fillText("자극", sx, ay - ah / 2 - 14 < 10 ? 10 : ay - ah / 2 - 14);
    PTS.forEach((x, i) => {
      ctx.fillStyle = C.ink; ctx.fillRect(Xx(x) - .5, ay + ah / 2, 1, 5);
      ctx.fillStyle = C.ink2; ctx.fillText(`${NAMES[i]} ${x}cm`, Xx(x) + (i === 0 ? 12 : i === 4 ? -12 : 0), ay + ah / 2 + 16);
    });

    /* 2. 위치에 따른 막전위 (지금 이 순간의 사진) */
    const g1 = { y: ay + 44, h: (h - ay - 44) * 0.46 };
    const Yv = (V, g) => g.y + (1 - (V + 90) / 130) * g.h;
    NM.axes(ctx, { x0: pl, y0: g1.y, w: gw, h: g1.h, X: Xx, Y: (V) => Yv(V, g1), xt: [], yt: [[30, "+30"], [-70, "−70"]], ylabel: `지금(자극 후 ${t.toFixed(1)} ms) 위치별 막전위` });
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath();
    for (let i = 0; i <= gw; i += 1.5) { const x = i / gw * LEN, y = Yv(wave(el(x)), g1); i ? ctx.lineTo(pl + i, y) : ctx.moveTo(pl + i, y); }
    ctx.stroke();
    PTS.forEach((x, i) => {
      const e = el(x), V = wave(e), [, col] = stage(e);
      ctx.beginPath(); ctx.arc(Xx(x), Yv(V, g1), 4.5, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill();
    });
    ctx.fillStyle = C.ink3; ctx.textAlign = "right"; ctx.fillText("위치 →", pl + gw, g1.y + g1.h + 13);

    /* 3. 한 지점의 막전위 변화 (기준 파형) — 각 지점이 파형의 어디쯤인지 */
    const g2 = { y: g1.y + g1.h + 38, h: h - (g1.y + g1.h + 38) - 22 };
    const TM = 5, Xt = (e) => pl + e / TM * gw;
    NM.axes(ctx, { x0: pl, y0: g2.y, w: gw, h: g2.h, X: Xt, Y: (V) => Yv(V, g2),
      xt: [[0, "0"], [1, "1"], [2, "2"], [3, "3"], [4, "4"], [5, "5 ms"]], yt: [[30, "+30"], [-70, "−70"]], ylabel: "한 지점에 흥분이 도착한 뒤의 막전위 변화 (모식)" });
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.6; ctx.beginPath();
    for (let e = 0; e <= TM; e += 0.02) { const y = Yv(wave(e), g2); e ? ctx.lineTo(Xt(e), y) : ctx.moveTo(Xt(e), y); }
    ctx.stroke();
    // 겹치지 않게 라벨 높이를 번갈아
    const used = [];
    PTS.forEach((x, i) => {
      const e = el(x); if (e < 0) return;
      const ec = Math.min(e, TM), V = wave(ec), [, col] = stage(e);
      ctx.beginPath(); ctx.arc(Xt(ec), Yv(V, g2), 4.5, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill();
      let ly = Yv(V, g2) - 8; while (used.some((u) => Math.abs(u[0] - Xt(ec)) < 22 && Math.abs(u[1] - ly) < 11)) ly -= 11;
      used.push([Xt(ec), ly]);
      ctx.textAlign = "center"; ctx.fillStyle = col; ctx.fillText(NAMES[i], Xt(ec), ly);
    });
  }

  function update() {
    const t = +sT.value, v = +sV.value;
    oT.textContent = t.toFixed(1); oV.textContent = v;
    cells.forEach((dd, i) => {
      const e = t - Math.abs(PTS[i] - PTS[src]) / v, V = wave(e), [st] = stage(e);
      dd.innerHTML = `${V >= 0 ? "+" : "−"}${Math.abs(V).toFixed(0)}<small>${st}</small>`;
    });
    draw();
  }

  sT.addEventListener("input", () => { playing = false; playBtn.textContent = "재생"; update(); });
  sV.addEventListener("input", update);
  root.querySelectorAll("[data-src]").forEach((b) => b.addEventListener("click", () => {
    src = +b.dataset.src;
    root.querySelectorAll("[data-src]").forEach((x) => x.setAttribute("aria-pressed", x === b ? "true" : "false"));
    update();
  }));
  playBtn.addEventListener("click", () => {
    playing = !playing; playBtn.textContent = playing ? "멈춤" : "재생";
    if (playing && +sT.value >= +sT.max) sT.value = 0;
  });
  update();
  loop(cv, (dt) => {
    if (!playing) return;
    let t = +sT.value + dt * 1.2;
    if (t >= +sT.max) { t = +sT.max; playing = false; playBtn.textContent = "재생"; }
    sT.value = t; update();
  });
})();
