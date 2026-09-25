/* 카드: 빙하가 녹으면 심층 순환이 멈출 수 있을까? — 스토멜 두 상자 모형 (무차원, 모식) */
(() => {
  const root = document.getElementById("card-earth-amoc");
  if (!root) return;
  const { C, F, fit, clamp } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const sF = $(".f"), oF = $(".f-out");
  const nQ = $(".n-q"), nSink = $(".n-sink"), nState = $(".n-state"), msg = $(".msg");

  // 무차원 모형: x = (염분 차에 의한 밀도 차) / (수온 차에 의한 밀도 차)
  // 순환 세기 q = 1 − x (양수: 고위도에서 침강), dx/dt = f − |q|·x
  let x = 0.113; // f = 0.10일 때 정상 상태 근처
  const q = () => 1 - x;
  const trail = [];

  const { ctx, size } = fit(cv, () => draw());

  function arrow(x1, y1, x2, y2, col, lw) {
    const a = Math.atan2(y2 - y1, x2 - x1), hl = 5 + lw * 1.4;
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = lw; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2 - hl * .6 * Math.cos(a), y2 - hl * .6 * Math.sin(a)); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - hl * Math.cos(a - .45), y2 - hl * Math.sin(a - .45)); ctx.lineTo(x2 - hl * Math.cos(a + .45), y2 - hl * Math.sin(a + .45)); ctx.closePath(); ctx.fill();
    ctx.lineCap = "butt";
  }

  let t = 0;
  function draw() {
    const { w, h } = size; if (!w) return;
    const small = w < 480;
    const f = +sF.value, Q = q();
    ctx.clearRect(0, 0, w, h);

    // ── 왼쪽: 두 상자 단면 ──
    const bx = 8, bw = Math.round(w * .44), by = 34, bh = h - by - 26;
    const mid = bx + bw / 2, sy = by + bh * .28; // 표층/심층 경계
    ctx.fillStyle = "rgba(224,160,42,.18)"; ctx.fillRect(bx, by, bw / 2, bh * .28);
    ctx.fillStyle = "rgba(63,111,163,.20)"; ctx.fillRect(mid, by, bw / 2, bh * .28);
    ctx.fillStyle = "rgba(63,111,163,.10)"; ctx.fillRect(bx, sy, bw, bh - bh * .28);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.strokeRect(bx + .5, by + .5, bw - 1, bh - 1);
    ctx.strokeStyle = C.rule; ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(mid, by); ctx.lineTo(mid, sy); ctx.stroke(); ctx.setLineDash([]);
    ctx.font = `${small ? 10 : 11}px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.textAlign = "center";
    ctx.fillText("저위도", bx + bw / 4, by - 8); ctx.fillText("고위도", bx + bw * .75, by - 8);
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3;
    ctx.fillText("따뜻함", bx + bw / 4, by + 16); ctx.fillText("차가움", bx + bw * .75, by + 16);
    ctx.fillText("심층", mid, by + bh - 8);
    // 빙하와 녹은 물
    const gx = bx + bw - 6;
    ctx.fillStyle = "#eef3f7"; ctx.strokeStyle = C.ink3;
    ctx.beginPath(); ctx.moveTo(gx - 26, by); ctx.lineTo(gx - 16, by - 18); ctx.lineTo(gx, by - 22); ctx.lineTo(gx, by); ctx.closePath(); ctx.fill(); ctx.stroke();
    const nd = Math.round(f * 20);
    ctx.fillStyle = "#6fa0b8";
    for (let i = 0; i < nd; i++) {
      const ph = (t * .8 + i / Math.max(1, nd)) % 1;
      ctx.beginPath(); ctx.arc(gx - 10 - (i % 4) * 7, by + 4 + ph * bh * .22, 1.8, 0, Math.PI * 2); ctx.fill();
    }
    // 순환 화살표: 두께 ∝ |q|, 방향은 부호
    const aw = Math.abs(Q), lw = 1 + 6 * aw, col = Q >= 0 ? C.warn : "#3f6fa3";
    if (aw > 0.03) {
      const L = bx + bw * .2, R = bx + bw * .8, yT = by + bh * .15, yB = by + bh * .72;
      const path = Q >= 0 ? [[L, yT, R, yT], [R, yT + 8, R, yB - 4], [R, yB, L, yB], [L, yB - 8, L, yT + 6]] : [[R, yT, L, yT], [L, yT + 8, L, yB - 4], [L, yB, R, yB], [R, yB - 8, R, yT + 6]];
      path.forEach(([a, b, c, d]) => arrow(a, b, c, d, col, lw));
    }
    ctx.font = `${small ? 10 : 11}px ${F.sans}`; ctx.fillStyle = Q >= 0 ? C.warn : "#3f6fa3"; ctx.textAlign = "center";
    ctx.fillText(Q > 0.03 ? "고위도에서 가라앉음" : Q < -0.03 ? "약하게 거꾸로 돎 (모형 결과)" : "거의 멈춤", mid, by + bh * .5);

    // ── 오른쪽: 담수–순환 세기 그래프 ──
    const gx0 = bx + bw + (small ? 36 : 44), gw = w - gx0 - 10, gy0 = 18, gh = h - gy0 - 34;
    const FX = (v) => gx0 + v / 0.4 * gw, QY = (v) => gy0 + (1 - (v + 0.6) / 1.6) * gh;
    NM.axes(ctx, { x0: gx0, y0: gy0, w: gw, h: gh, X: FX, Y: QY,
      xt: [[0, "0"], [0.1, ".1"], [0.2, ".2"], [0.3, ".3"], [0.4, ".4"]],
      yt: [[-0.5, "−0.5"], [0, "0"], [0.5, "0.5"], [1, "1"]], xlabel: "담수 유입 →", ylabel: "순환 세기" });
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(gx0, QY(0) + .5); ctx.lineTo(gx0 + gw, QY(0) + .5); ctx.stroke();
    // 정상 상태 곡선: 고위도 침강(q>0): f = q(1−q), 역순환(q<0): f = −q(1−q)
    const branch = (q0, q1, dash) => {
      ctx.setLineDash(dash ? [5, 4] : []); ctx.strokeStyle = dash ? C.ink3 : C.ink; ctx.lineWidth = dash ? 1.3 : 2;
      ctx.beginPath(); let first = true;
      for (let k = 0; k <= 80; k++) {
        const qq = q0 + (q1 - q0) * k / 80, ff = Math.abs(qq) * (1 - qq);
        if (ff > 0.4) { first = true; continue; }
        first ? ctx.moveTo(FX(ff), QY(qq)) : ctx.lineTo(FX(ff), QY(qq)); first = false;
      }
      ctx.stroke(); ctx.setLineDash([]);
    };
    branch(1, 0.5, false); branch(0.5, 0, true); branch(0, -0.6, false);
    // 문턱 표시
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "left";
    ctx.fillText("문턱", FX(0.25) + 7, QY(0.5) + 4);
    ctx.beginPath(); ctx.arc(FX(0.25), QY(0.5), 2.5, 0, Math.PI * 2); ctx.fill();
    // 지나온 자취
    ctx.strokeStyle = "rgba(181,83,47,.35)"; ctx.lineWidth = 1.5; ctx.beginPath();
    trail.forEach(([ff, qq], i) => (i ? ctx.lineTo(FX(ff), QY(qq)) : ctx.moveTo(FX(ff), QY(qq)))); ctx.stroke();
    ctx.beginPath(); ctx.arc(FX(f), QY(clamp(Q, -0.6, 1)), 5.5, 0, Math.PI * 2); ctx.fillStyle = C.warn; ctx.fill();
    ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.textAlign = "left";
  }

  let shown = "";
  function readouts() {
    const Q = q(), f = +sF.value;
    oF.textContent = f.toFixed(2);
    nQ.textContent = `${Math.round(Q * 100)} %`;
    nQ.classList.toggle("bad", Q < 0.5);
    nSink.textContent = Q > 0.03 ? "있음" : "없음";
    const settled = Math.abs(f - Math.abs(Q) * x) < 0.004;
    const state = Q >= 0.5 ? (settled ? "안정" : "변하는 중") : Q > 0.03 ? "무너지는 중" : Q > -0.03 ? "거의 멈춤" : (settled ? "역순환에 갇힘" : "변하는 중");
    nState.textContent = state;
    const m = Q >= 0.5 && f <= 0.25
      ? "고위도의 차갑고 짠 물이 가라앉아 순환이 유지됩니다. 담수를 늘리면 순환이 조금씩 약해집니다."
      : Q >= 0.5 ? "문턱(0.25)을 넘었습니다. 이 담수량에서는 고위도 침강이 유지되는 상태가 없습니다. 잠시 지켜보세요."
      : Q > 0.03 ? "침강이 약해져 짠 물이 덜 실려 오고, 그래서 더 약해집니다."
      : "고위도 물이 가벼워져 가라앉지 못합니다. 담수를 줄여도 이 상태에 머무는지 확인해 보세요.";
    if (m !== shown) { msg.textContent = m; shown = m; }
  }

  NM.loop(cv, (dt) => {
    const f = +sF.value;
    const steps = 6, h = dt * 1.6 / steps;
    for (let i = 0; i < steps; i++) x += h * (f - Math.abs(1 - x) * x);
    t += dt;
    const last = trail[trail.length - 1];
    if (!last || Math.abs(last[0] - f) > 0.002 || Math.abs(last[1] - q()) > 0.004) { trail.push([f, q()]); if (trail.length > 400) trail.shift(); }
    readouts(); draw();
  });

  sF.addEventListener("input", () => { readouts(); draw(); });
  root.querySelectorAll("[data-f]").forEach((b) => b.addEventListener("click", () => { sF.value = b.dataset.f; readouts(); draw(); }));
  $(".reset").addEventListener("click", () => { sF.value = 0.1; x = 0.113; trail.length = 0; readouts(); draw(); });
  readouts();
})();
