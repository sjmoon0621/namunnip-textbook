/* 카드: 수평으로 던진 공은 왜 포물선을 그릴까? — 수평 방향 등속, 연직 방향 자유 낙하 (공기 저항 무시) */
(() => {
  const root = document.getElementById("card-is1-projectile");
  if (!root) return;
  const { C, F, clamp, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const sV = $(".v0"), oV = $(".v0-out"), sH = $(".h0"), oH = $(".h0-out");
  const cDrop = $(".show-drop"), cGrid = $(".show-grid"), go = $(".throw");
  const nT = $(".t-fly"), nX = $(".x-range"), nV = $(".v-land"), nA = $(".ang");

  const g = 9.81, DT = 0.2; // 기록 간격 (s)
  const XMIN = 62, YMAX = 47;  // 그림의 최소 범위 (m) — 눈금은 슬라이더와 무관하게 고정
  let v0, H, tf, clock = 0, running = false;

  function prepare() {
    v0 = +sV.value; H = +sH.value;
    oV.textContent = v0; oH.textContent = H;
    tf = Math.sqrt(2 * H / g);
    const vy = g * tf, vl = Math.hypot(v0, vy);
    nT.textContent = `${tf.toFixed(2)} s`;
    nX.textContent = `${(v0 * tf).toFixed(1)} m`;
    nV.textContent = `${vl.toFixed(1)} m/s`;
    nA.textContent = `${(Math.atan2(vy, v0) * 180 / Math.PI).toFixed(0)}°`;
    clock = running ? 0 : tf;
    draw();
  }

  const { ctx, size } = fit(cv, () => draw());

  function draw() {
    const { w, h } = size; if (!w || tf == null) return;
    ctx.clearRect(0, 0, w, h);
    const padL = 34, padR = 12, padT = 18, padB = 30;
    const s = Math.min((w - padL - padR) / XMIN, (h - padT - padB) / YMAX);
    const XMAX = Math.floor((w - padL - padR) / s);
    const gy = h - padB;                       // 땅
    const X = (x) => padL + x * s, Y = (y) => gy - y * s; // y: 땅에서의 높이
    const y0 = H;

    // 눈금
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.strokeStyle = C.rule; ctx.lineWidth = 1;
    for (let x = 0; x <= XMAX; x += 10) {
      ctx.beginPath(); ctx.moveTo(Math.round(X(x)) + .5, gy); ctx.lineTo(Math.round(X(x)) + .5, gy + 4); ctx.stroke();
      ctx.textAlign = "center"; ctx.fillText(x, X(x), gy + 16);
    }
    ctx.textAlign = "right"; ctx.fillText("수평 거리 (m)", X(XMAX), gy + 27);
    for (let y = 0; y <= YMAX; y += 10) {
      ctx.beginPath(); ctx.moveTo(padL - 4, Math.round(Y(y)) + .5); ctx.lineTo(padL, Math.round(Y(y)) + .5); ctx.stroke();
      ctx.textAlign = "right"; ctx.fillText(y, padL - 7, Y(y) + 3.5);
    }
    ctx.strokeStyle = C.ink2; ctx.beginPath(); ctx.moveTo(padL, gy + .5); ctx.lineTo(X(XMAX), gy + .5); ctx.stroke();

    // 던지는 곳 (절벽)
    ctx.fillStyle = "#e3e4dc"; ctx.fillRect(padL - 2, Y(y0), 8, y0 * s);
    ctx.fillStyle = C.ink2; ctx.fillRect(padL - 2, Y(y0) - 1.5, 14, 3);

    const pos = (t) => ({ x: v0 * t, y: y0 - 0.5 * g * t * t });
    const tc = Math.min(clock, tf);

    // 전체 궤적 (옅게)
    ctx.beginPath();
    for (let i = 0; i <= 60; i++) { const p = pos(tf * i / 60); i ? ctx.lineTo(X(p.x), Y(p.y)) : ctx.moveTo(X(p.x), Y(p.y)); }
    ctx.strokeStyle = "rgba(59,124,42,.25)"; ctx.lineWidth = 1.5; ctx.setLineDash([4, 4]); ctx.stroke(); ctx.setLineDash([]);

    // 0.2초 간격 기록
    const marks = [];
    for (let t = 0; t <= tc + 1e-9; t += DT) marks.push(t);
    if (cGrid.checked) {
      ctx.lineWidth = 1;
      marks.forEach((t) => {
        const p = pos(t);
        // 수평 방향: 같은 시간 동안 같은 거리 → 바닥에 같은 간격
        ctx.strokeStyle = "rgba(141,141,146,.45)"; ctx.setLineDash([2, 3]);
        ctx.beginPath(); ctx.moveTo(X(p.x) + .5, Y(p.y)); ctx.lineTo(X(p.x) + .5, gy); ctx.stroke();
        // 연직 방향: 떨어뜨린 공과 같은 높이
        if (cDrop.checked) { ctx.beginPath(); ctx.moveTo(X(0), Y(p.y) + .5); ctx.lineTo(X(p.x), Y(p.y) + .5); ctx.stroke(); }
        ctx.setLineDash([]);
        ctx.fillStyle = C.forest; ctx.fillRect(X(p.x) - 1, gy - 3, 2, 6);
      });
    }
    marks.forEach((t) => {
      const p = pos(t);
      ctx.beginPath(); ctx.arc(X(p.x), Y(p.y), 3.2, 0, Math.PI * 2); ctx.fillStyle = "rgba(212,73,58,.35)"; ctx.fill();
      if (cDrop.checked) { ctx.beginPath(); ctx.arc(X(0) + 8, Y(p.y), 3.2, 0, Math.PI * 2); ctx.fillStyle = "rgba(35,35,38,.25)"; ctx.fill(); }
    });

    // 현재 공
    const p = pos(tc);
    if (cDrop.checked) {
      ctx.beginPath(); ctx.arc(X(0) + 8, Y(p.y) - 6 * (tc >= tf), 6, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill();
    }
    ctx.beginPath(); ctx.arc(X(p.x), Y(p.y) - 6 * (tc >= tf), 6, 0, Math.PI * 2); ctx.fillStyle = C.apple; ctx.fill();
    // 속도 벡터 (성분)
    if (tc > 0.05) {
      const k = 1.6 * Math.max(s, 3) / 3.5, vx = v0, vy = g * tc;
      const bx = X(p.x), by = Y(p.y);
      const arrow = (dx, dy, col) => {
        const L = Math.hypot(dx, dy); if (L < 3) return;
        ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 1.8;
        ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + dx, by + dy); ctx.stroke();
        const a = Math.atan2(dy, dx);
        ctx.beginPath(); ctx.moveTo(bx + dx, by + dy);
        ctx.lineTo(bx + dx - 7 * Math.cos(a - .4), by + dy - 7 * Math.sin(a - .4));
        ctx.lineTo(bx + dx - 7 * Math.cos(a + .4), by + dy - 7 * Math.sin(a + .4)); ctx.fill();
      };
      arrow(vx * k, 0, C.forest);
      arrow(0, vy * k, C.amber);
    }

    ctx.textAlign = "left"; ctx.fillStyle = C.ink; ctx.font = `500 13px ${F.mono}`;
    ctx.fillText(`t = ${tc.toFixed(2)} s`, X(XMAX) - 96, padT + 8);
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3;
    ctx.fillText("점: 0.2초마다 찍은 위치", X(XMAX) - 150, padT + 24);
  }

  [sV, sH].forEach((el) => el.addEventListener("input", () => { running = false; prepare(); }));
  [cDrop, cGrid].forEach((el) => el.addEventListener("change", draw));
  go.addEventListener("click", () => { running = true; clock = 0; draw(); });
  prepare();
  let autoplayed = false;
  loop(cv, (dt) => {
    if (!autoplayed && !NM.reduce) { autoplayed = true; running = true; clock = 0; }
    if (!running) return;
    clock += dt * 0.8;
    if (clock >= tf) { clock = tf; running = false; }
    draw();
  });
})();
