/* 카드 2.1.2: 우주는 왜 대부분 수소와 헬륨일까? — 중성자 비율과 헬륨 질량 비율 (모식 계산) */
(() => {
  const root = document.getElementById("card-is1-bbn");
  if (!root) return;
  const { C, F, clamp, fit, ease, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), slider = $(".t"), tOut = $(".t-out"), bind = $(".bind");
  const oNP = $(".np"), oY = $(".y"), oNum = $(".num"), oT = $(".temp");

  const XN0 = 0.155, TAU = 879.4, OBS = 0.245;          // 1초 뒤 중성자 비율(모식), 중성자 평균 수명(s), 관측 Y
  const Xn = (t) => XN0 * Math.exp(-Math.max(0, t - 1) / TAU);
  const N = 200, COLS = 20, ROWS = 10;

  // 핵자마다 고정된 순서: 앞쪽 nN개가 중성자. 시간이 지나면 뒤쪽 중성자부터 양성자로 바뀐다.
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const order = [...Array(N).keys()];
  for (let i = N - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
  const jit = order.map(() => [rnd() - .5, rnd() - .5]);

  let t = 200, bindK = 1, bindTarget = 1, lastN = -1, groups = null;

  const fmtT = (t) => t < 60 ? `${Math.round(t)}초` : t < 3600 - 1 ? `${Math.floor(t / 60)}분${Math.round(t % 60) ? ` ${Math.round(t % 60)}초` : ""}` : "1시간";

  function state() {
    const x = Xn(t);
    let nN = Math.round(x * N); nN -= nN % 2;
    return { x, nN, Y: 2 * x };
  }

  // 헬륨 묶음: 중성자 두 개마다, 가까운 양성자 두 개를 찾아 붙인다
  function makeGroups(nN, home) {
    const isN = new Array(N).fill(false);
    for (let k = 0; k < nN; k++) isN[order[k]] = true;
    const used = new Array(N).fill(false), gs = [];
    for (let k = 0; k < nN; k += 2) {
      const a = order[k], b = order[k + 1];
      used[a] = used[b] = true;
      const cx = home[a][0], cy = home[a][1];
      const ps = [];
      for (let q = 0; q < 2; q++) {
        let best = -1, bd = 1e9;
        for (let i = 0; i < N; i++) if (!isN[i] && !used[i]) {
          const d = (home[i][0] - cx) ** 2 + (home[i][1] - cy) ** 2;
          if (d < bd) { bd = d; best = i; }
        }
        used[best] = true; ps.push(best);
      }
      gs.push({ c: [cx, cy], m: [a, ps[0], b, ps[1]] });
    }
    return { isN, gs };
  }

  const { ctx, size } = fit(cv, () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const small = w < 520;
    const split = Math.round(w * (small ? 0.46 : 0.44));
    const S = state();

    // ── 왼쪽: 핵자 200개
    const gx = 6, gy = 26, gw = split - 14, gh = h - gy - 10;
    const cw = gw / COLS, ch = gh / ROWS;
    const home = [...Array(N).keys()].map((i) => {
      const c = i % COLS, r = Math.floor(i / COLS);
      return [gx + (c + .5 + jit[i][0] * .35) * cw, gy + (r + .5 + jit[i][1] * .35) * ch];
    });
    if (S.nN !== lastN || !groups) { groups = makeGroups(S.nN, home); lastN = S.nN; }
    const rad = Math.max(2, Math.min(cw, ch) * 0.26);
    const pos = home.map((p) => p.slice());
    const k = ease(clamp(bindK, 0, 1));
    const off = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([a, b]) => [a * rad * 0.95, b * rad * 0.95]);
    for (const g of groups.gs) g.m.forEach((i, j) => {
      pos[i][0] = home[i][0] + (g.c[0] + off[j][0] - home[i][0]) * k;
      pos[i][1] = home[i][1] + (g.c[1] + off[j][1] - home[i][1]) * k;
    });
    ctx.font = `600 12px ${F.sans}`; ctx.fillStyle = C.ink; ctx.textAlign = "left";
    ctx.fillText(`핵자 200개 · 빅뱅 후 ${fmtT(t)}`, gx, 14);
    for (const g of groups.gs) if (k > .6) {
      ctx.strokeStyle = C.amber; ctx.lineWidth = 1.5; ctx.globalAlpha = (k - .6) / .4;
      ctx.beginPath(); ctx.arc(g.c[0], g.c[1], rad * 2.55, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1;
    }
    for (let i = 0; i < N; i++) {
      ctx.fillStyle = groups.isN[i] ? C.ink2 : C.apple;
      ctx.beginPath(); ctx.arc(pos[i][0], pos[i][1], rad, 0, Math.PI * 2); ctx.fill();
    }

    // ── 오른쪽: 헬륨을 만든 시각 → 헬륨 질량 비율
    const x0 = split + (small ? 30 : 40), y0 = 24, pw = w - x0 - 10, ph = h - y0 - (small ? 40 : 36);
    const lt0 = 0, lt1 = Math.log10(3600), YM = 0.35;
    const X = (tt) => x0 + (Math.log10(tt) - lt0) / (lt1 - lt0) * pw;
    const Y = (v) => y0 + (1 - v / YM) * ph;
    const xt = small ? [[1, "1s"], [60, "1분"], [3600, "1h"]] : [[1, "1초"], [10, "10초"], [60, "1분"], [600, "10분"], [3600, "1시간"]];
    NM.axes(ctx, { x0, y0, w: pw, h: ph, X, Y, xt, yt: [[0, "0"], [0.1, "10%"], [0.2, "20%"], [0.3, "30%"]], ylabel: "헬륨 질량 비율", xlabel: small ? "" : "헬륨을 만든 시각" });
    // 실제로는 불가능한 구간 (중수소가 버티지 못함)
    ctx.fillStyle = "rgba(141,141,146,.12)"; ctx.fillRect(x0, y0, X(180) - x0, ph);
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left";
    ctx.fillText("너무 뜨거움", x0 + 4, y0 + ph - 8);
    // 관측 띠
    ctx.fillStyle = "rgba(116,171,102,.28)"; ctx.fillRect(x0, Y(0.25), pw, Y(0.24) - Y(0.25));
    ctx.fillStyle = C.forest; ctx.textAlign = "right"; ctx.fillText("관측 24.5%", x0 + pw - 2, Y(0.24) + 12);
    // 곡선
    ctx.beginPath();
    for (let i = 0; i <= 200; i++) {
      const tt = 10 ** (lt0 + (lt1 - lt0) * i / 200), yy = Y(2 * Xn(tt));
      i ? ctx.lineTo(X(tt), yy) : ctx.moveTo(X(tt), yy);
    }
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.stroke();
    // 현재 점
    const px = X(t), py = Y(S.Y);
    ctx.setLineDash([2, 3]); ctx.strokeStyle = C.ink3; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(px, y0 + ph); ctx.lineTo(px, py); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.apple; ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI * 2); ctx.fill();
    ctx.font = `500 12px ${F.mono}`; ctx.fillStyle = C.ink;
    ctx.textAlign = px > x0 + pw * .7 ? "right" : "left";
    ctx.fillText(`${(S.Y * 100).toFixed(1)}%`, px + (px > x0 + pw * .7 ? -9 : 9), py - 8);
    ctx.textAlign = "left";
  }

  function update() {
    t = 10 ** +slider.value;
    const S = state();
    tOut.textContent = fmtT(t);
    const r = (1 - S.x) / S.x;
    oNP.textContent = `1 : ${r.toFixed(1)}`;
    oY.textContent = `${(S.Y * 100).toFixed(1)}%`;
    oY.className = "y" + (Math.abs(S.Y - OBS) < 0.006 ? " good" : "");
    const yh = S.Y, perH = (yh / 4) / (1 - yh);
    oNum.textContent = perH > 1e-3 ? `${(1 / perH).toFixed(perH > 0.05 ? 0 : 0)} : 1` : "헬륨 거의 없음";
    const T9 = 1.5e10 / Math.sqrt(t);
    oT.textContent = T9 >= 1e10 ? `${(T9 / 1e10).toFixed(1)}×10¹⁰ K` : `${(T9 / 1e8).toFixed(0)}억 K`;
    root.querySelectorAll(".presets .chip").forEach((b) => b.setAttribute("aria-pressed", Math.abs(Math.log10(+b.dataset.t) - +slider.value) < 0.01 ? "true" : "false"));
    draw();
  }

  slider.addEventListener("input", update);
  root.querySelectorAll(".presets .chip").forEach((b) => b.addEventListener("click", () => { slider.value = Math.log10(+b.dataset.t); update(); }));
  bind.addEventListener("change", () => { bindTarget = bind.checked ? 1 : 0; if (NM.reduce) { bindK = bindTarget; draw(); } });
  loop(cv, (dt) => {
    if (bindK === bindTarget) return;
    bindK = bindTarget > bindK ? Math.min(1, bindK + dt * 1.6) : Math.max(0, bindK - dt * 1.6);
    draw();
  });
  update();
})();
