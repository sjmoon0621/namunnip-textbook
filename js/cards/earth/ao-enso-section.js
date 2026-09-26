/* 카드: 엘니뇨 때는 적도 태평양에서 무엇이 뒤바뀔까? — 무역풍 세기로 움직이는 모식 단면 */
(() => {
  const root = document.getElementById("card-earth-enso");
  if (!root) return;
  const { C, F, fit, clamp } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const sW = $(".w"), oW = $(".w-out");
  const nH = $(".n-h"), nA = $(".n-a"), nS = $(".n-s"), nK = $(".n-k"), msg = $(".msg");

  // x: 0 = 120°E (서), 1 = 80°W (동). 모든 수치는 대략적인 크기만 맞춘 모식.
  const lonX = (lonE) => (lonE - 120) / 160;
  const M = (w) => ({
    h: (x) => Math.max(15, 110 + w * 60 * (1 - 2 * x)),          // 수온 약층 깊이 (m)
    sst: (x) => 29.5 - w * 7 * Math.pow(x, 1.5),                  // 해수면 온도 (°C)
    eta: (x) => w * 0.45 * (0.5 - x),                             // 해수면 높이 편차 (m)
    xr: clamp(0.12 + 0.45 * (1 - w), 0.06, 0.62),                 // 상승 기류 위치
  });
  const NINO = 0.6, anomaly = (w) => M(w).sst(NINO) - M(1).sst(NINO);
  const tcol = (T) => { const k = clamp((T - 18) / 12, 0, 1); return `rgb(${Math.round(70 + 160 * k)},${Math.round(120 + 40 * k)},${Math.round(180 - 120 * k)})`; };

  function arrow(x1, y1, x2, y2, col, lw) {
    const a = Math.atan2(y2 - y1, x2 - x1), hl = 5 + lw * 1.3;
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = lw;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2 - hl * .5 * Math.cos(a), y2 - hl * .5 * Math.sin(a)); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - hl * Math.cos(a - .45), y2 - hl * Math.sin(a - .45)); ctx.lineTo(x2 - hl * Math.cos(a + .45), y2 - hl * Math.sin(a + .45)); ctx.closePath(); ctx.fill();
  }

  const { ctx, size } = fit(cv, () => draw());
  let ph = 0;
  function draw() {
    const { w, h } = size; if (!w) return;
    const wind = +sW.value, m = M(wind), small = w < 480;
    ctx.clearRect(0, 0, w, h);
    const x0 = 10, x1 = w - 10, X = (x) => x0 + x * (x1 - x0);
    const surf = Math.round(h * .42), bot = h - 16, D = (z) => surf + z / 300 * (bot - surf);
    const etaY = (x) => surf - m.eta(x) * 40;     // 해수면 높이는 크게 과장
    // 대기
    ctx.fillStyle = "#eef2f4"; ctx.fillRect(x0, 4, x1 - x0, surf);
    // 바다: 수온 약층 위 따뜻한 층, 아래 찬 층
    for (let i = 0; i < 100; i++) {
      const xa = i / 100, xb = (i + 1) / 100, xm = (xa + xb) / 2;
      const hy = D(m.h(xm));
      ctx.fillStyle = tcol(m.sst(xm)); ctx.fillRect(X(xa), etaY(xm), X(xb) - X(xa) + .6, hy - etaY(xm));
      const g = ctx.createLinearGradient(0, hy, 0, bot); g.addColorStop(0, tcol(17)); g.addColorStop(1, tcol(9));
      ctx.fillStyle = g; ctx.fillRect(X(xa), hy, X(xb) - X(xa) + .6, bot - hy);
    }
    // 수온 약층 선
    ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.setLineDash([6, 4]); ctx.beginPath();
    for (let i = 0; i <= 50; i++) { const x = i / 50; i ? ctx.lineTo(X(x), D(m.h(x))) : ctx.moveTo(X(x), D(m.h(x))); }
    ctx.stroke(); ctx.setLineDash([]);
    ctx.font = `${small ? 9.5 : 10.5}px ${F.sans}`; ctx.fillStyle = "#fff"; ctx.textAlign = "left";
    ctx.fillText("수온 약층", X(.02), D(m.h(.02)) + 13);
    // 용승 화살표 (동쪽)
    if (wind > .45) { const s = clamp((wind - .45) * 2, .3, 2); arrow(X(.93), D(Math.min(290, m.h(.93) + 50)), X(.93), etaY(.93) + 12, "rgba(255,255,255,.85)", 1 + s); }
    // 해수면 선
    ctx.strokeStyle = "#2e5d9a"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(X(0), etaY(0)); ctx.lineTo(X(1), etaY(1)); ctx.stroke();
    // 워커 순환
    const xr = m.xr, str = clamp(wind, 0.15, 1.6);
    const yTop = 26, yLow = surf - 18;
    ctx.globalAlpha = clamp(.35 + str * .5, .35, 1);
    // 구름과 비
    const cxr = X(xr);
    ctx.fillStyle = "rgba(140,143,150,.85)";
    [[-18, 0, 16], [0, -8, 20], [18, 0, 16]].forEach(([dx, dy, r]) => { ctx.beginPath(); ctx.arc(cxr + dx, yTop + 30 + dy, r * (small ? .8 : 1), 0, Math.PI * 2); ctx.fill(); });
    ctx.strokeStyle = "rgba(63,111,163,.8)"; ctx.lineWidth = 1;
    for (let i = 0; i < 7; i++) { const x = cxr - 18 + i * 6, y = yTop + 48 + ((ph * 40 + i * 9) % Math.max(10, yLow - yTop - 50)); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 2, y + 6); ctx.stroke(); }
    const lw = 1 + str * 1.6, col = C.ink2;
    const xs = Math.min(.95, xr + .55);
    arrow(X(xs), yLow, cxr + 26, yLow, col, lw);           // 지표 무역풍 (동 → 서)
    arrow(cxr, yLow - 6, cxr, yTop + 52, col, lw);          // 상승
    arrow(cxr + 26, yTop + 10, X(xs), yTop + 10, col, lw);  // 상층 서풍
    arrow(X(xs), yTop + 18, X(xs), yLow - 8, col, lw);      // 하강
    ctx.globalAlpha = 1;
    ctx.font = `${small ? 9.5 : 10.5}px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.textAlign = "center";
    ctx.fillText("무역풍", (X(xs) + cxr) / 2, yLow - 6);
    // 지명
    ctx.font = `${small ? 9.5 : 10.5}px ${F.sans}`; ctx.fillStyle = C.ink; ctx.textAlign = "left";
    ctx.fillText("서 · 인도네시아", X(0) + 2, 16);
    ctx.textAlign = "right"; ctx.fillText("남아메리카 · 동", X(1) - 2, 16);
    [["다윈", lonX(131)], ["타히티", lonX(360 - 149)]].forEach(([n, x]) => {
      ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(X(x), etaY(x) - 3, 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.textAlign = "center"; ctx.fillText(n, X(x), etaY(x) - 8);
    });
    // 감시 구역
    ctx.strokeStyle = C.warn; ctx.lineWidth = 1.5; ctx.strokeRect(X(lonX(190)), etaY(.5) + 1, X(lonX(240)) - X(lonX(190)), 12);
    ctx.font = `9.5px ${F.sans}`; ctx.fillStyle = C.warn; ctx.textAlign = "center"; ctx.fillText("감시 구역", X(lonX(215)), etaY(.5) + 24);
    // 깊이 눈금, 수온
    ctx.font = `9.5px ${F.mono}`; ctx.fillStyle = "rgba(255,255,255,.8)"; ctx.textAlign = "right";
    ctx.fillText("300 m", X(1) - 3, bot - 4);
    ctx.fillStyle = C.ink; ctx.textAlign = "left"; ctx.fillText(`${m.sst(0.05).toFixed(0)} °C`, X(.02), etaY(.02) + 13);
    ctx.textAlign = "right"; ctx.fillText(`${m.sst(.97).toFixed(0)} °C`, X(.98), etaY(.98) + 13);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.strokeRect(x0 + .5, 4.5, x1 - x0 - 1, bot - 4);
  }

  function update() {
    const wind = +sW.value, m = M(wind), a = anomaly(wind);
    oW.textContent = wind.toFixed(2).replace(/0$/, "");
    nH.textContent = `약 ${Math.round(m.h(.95) / 5) * 5} m`;
    nA.textContent = `${a >= 0 ? "+" : "−"}${Math.abs(a).toFixed(1)} °C`;
    nA.className = a >= .5 ? "bad" : a <= -.5 ? "good" : "";
    const dp = wind - 1;
    nS.textContent = Math.abs(dp) < .1 ? "평년 정도" : dp > 0 ? "평년보다 큼" : "평년보다 작음";
    nK.textContent = a >= .5 ? "엘니뇨" : a <= -.5 ? "라니냐" : "평상시";
    const where = m.xr < .2 ? "서태평양(인도네시아 부근)" : m.xr < .4 ? "서태평양~중앙 태평양" : "중앙 태평양";
    msg.textContent = `비가 많이 오는 곳: ${where}. 동태평양은 ${m.sst(.97) > 25 ? "따뜻해져 용승이 약하고 영양 염류가 적습니다" : "찬물이 올라와 영양 염류가 풍부합니다"}. 해수면 높이와 깊이는 크게 과장해 그렸습니다.`;
    draw();
  }
  sW.addEventListener("input", update);
  root.querySelectorAll("[data-w]").forEach((b) => b.addEventListener("click", () => { sW.value = b.dataset.w; update(); }));
  NM.loop(cv, (dt) => { if (!NM.reduce) { ph += dt; draw(); } });
  update();
})();
