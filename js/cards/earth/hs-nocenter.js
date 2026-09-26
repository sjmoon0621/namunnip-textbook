/* 카드: 우주에는 중심이 있을까? — 늘어나는 공간에서 어느 은하를 기준으로 해도 같은 법칙 (2차원 모식) */
(() => {
  const root = document.getElementById("card-earth-nocenter");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sA = $(".scale"), oA = $(".scale-out"), play = $(".play");
  const nObs = $(".obs"), nRatio = $(".ratio"), msg = $(".nc-msg");

  // 은하 위치 (공동 좌표, −1~1 정사각형): 격자에서 조금씩 흔든 점들
  let s = 11; const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  const G = []; for (let i = -3; i <= 3; i++) for (let j = -3; j <= 3; j++) G.push([i / 3.4 + (rnd() - .5) * 0.12, j / 3.4 + (rnd() - .5) * 0.12]);
  let obs = 24, dir = 1, running = false;   // 가운데 근처 은하에서 시작

  const { ctx, size } = fit(cv, () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const a = +sA.value, a0 = 1, R = Math.min(w, h) * 0.42 / 1.6;
    const [ox, oy] = G[obs];
    // 관측자를 화면 가운데에 두고 그린다 (어디를 기준으로 봐도 같은지 확인)
    const cx = w / 2, cy = h / 2;
    const P = (p, sc) => [cx + (p[0] - ox) * sc * R, cy - (p[1] - oy) * sc * R];
    // 예전 위치(흐리게)와 지금 위치, 변위 화살표
    G.forEach((p, i) => {
      const [x1, y1] = P(p, a0), [x2, y2] = P(p, a);
      if (i !== obs) {
        ctx.strokeStyle = "rgba(201,70,61,.55)"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
        const ang = Math.atan2(y2 - y1, x2 - x1), L = Math.hypot(x2 - x1, y2 - y1);
        if (L > 6) { ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - 6 * Math.cos(ang - .4), y2 - 6 * Math.sin(ang - .4)); ctx.lineTo(x2 - 6 * Math.cos(ang + .4), y2 - 6 * Math.sin(ang + .4)); ctx.closePath(); ctx.fillStyle = "rgba(201,70,61,.7)"; ctx.fill(); }
        ctx.fillStyle = "rgba(141,141,146,.35)"; ctx.beginPath(); ctx.arc(x1, y1, 3, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = i === obs ? C.forest : "#3f7fc4"; ctx.beginPath(); ctx.arc(x2, y2, i === obs ? 7 : 4.5, 0, Math.PI * 2); ctx.fill();
    });
    ctx.font = `600 11px ${F.sans}`; ctx.fillStyle = C.forest; ctx.textAlign = "center"; ctx.fillText("우리 은하 (기준)", cx, cy - 12);
    ctx.textAlign = "left"; ctx.font = `10px ${F.sans}`; ctx.fillStyle = C.ink3;
    ctx.fillText("회색: 처음 위치 · 파랑: 지금 위치 · 화살표: 기준 은하에서 본 움직임", 8, h - 8);
    ctx.fillText("은하를 눌러 기준을 바꿔 보세요", 8, 16);
  }

  function update() {
    const a = +sA.value;
    oA.textContent = `${a.toFixed(2)}배`;
    // 가까운 은하와 먼 은하의 이동 거리 비
    const [ox, oy] = G[obs];
    const ds = G.map((p, i) => i === obs ? null : Math.hypot(p[0] - ox, p[1] - oy)).filter((x) => x !== null).sort((x, y) => x - y);
    const near = ds[0], far = ds[ds.length - 1];
    nObs.textContent = `${obs + 1}번 은하`;
    nRatio.textContent = `${(far / near).toFixed(1)}배 멀고, ${(far / near).toFixed(1)}배 많이 움직임`;
    msg.textContent = a <= 1.001 ? "슬라이더로 공간을 늘려 보세요." : "어느 은하를 기준으로 골라도, 다른 모든 은하가 거리에 비례하는 빠르기로 멀어집니다. 가운데 은하도, 가장자리 은하도 스스로를 중심이라고 느낍니다.";
    draw();
  }
  cv.addEventListener("click", (e) => {
    const r = cv.getBoundingClientRect(), { w, h } = size, a = +sA.value, R = Math.min(w, h) * 0.42 / 1.6;
    const [ox, oy] = G[obs], mx = e.clientX - r.left, my = e.clientY - r.top;
    let best = obs, bd = 1e9;
    G.forEach((p, i) => { const x = w / 2 + (p[0] - ox) * a * R, y = h / 2 - (p[1] - oy) * a * R, d = (x - mx) ** 2 + (y - my) ** 2; if (d < bd) { bd = d; best = i; } });
    if (bd < 400) { obs = best; update(); }
  });
  sA.addEventListener("input", () => { running = false; play.textContent = "재생"; update(); });
  play.addEventListener("click", () => { running = !running; play.textContent = running ? "멈춤" : "재생"; });
  update();
  loop(cv, (dt) => { if (!running) return; let a = +sA.value + dir * dt * 0.25; if (a >= 1.8) { a = 1.8; dir = -1; } if (a <= 1) { a = 1; dir = 1; } sA.value = a; update(); });
})();
