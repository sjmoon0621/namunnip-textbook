/* 카드: 시소에서 가벼운 사람은 왜 멀리 앉아야 할까? — 돌림힘의 평형 (판의 회전을 수치 적분) */
(() => {
  const root = document.getElementById("card-phy-seesaw");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const mA = $(".ma"), mB = $(".mb"), dA = $(".da"), dB = $(".db");
  const oMA = $(".ma-out"), oMB = $(".mb-out"), oDA = $(".da-out"), oDB = $(".db-out");
  const nA = $(".ta"), nB = $(".tb"), nNet = $(".tnet");

  const g = 9.81, HALF = 2.0, PIV = 0.5, MP = 20; // 판 반길이(m), 받침 높이(m), 판 질량(kg)
  const TH = Math.asin(PIV / HALF); // 판 끝이 땅에 닿는 각
  const COL_A = C.forest, COL_B = C.amber;
  let th = 0, om = 0;

  const P = () => ({ ma: +mA.value, mb: +mB.value, da: +dA.value, db: +dB.value });
  // 반시계 방향(오른쪽 끝이 올라감)을 +로. 두 사람을 판 위의 점 질량으로 본다.
  const net = (p) => p.ma * g * p.da - p.mb * g * p.db;

  function step(dt) {
    const p = P();
    const I = MP * (2 * HALF) ** 2 / 12 + p.ma * p.da ** 2 + p.mb * p.db ** 2;
    const alpha = net(p) * Math.cos(th) / I - 0.25 * om; // 받침의 작은 마찰
    om += alpha * dt; th += om * dt;
    if (th > TH) { th = TH; if (om > 0) om = 0; }
    if (th < -TH) { th = -TH; if (om < 0) om = 0; }
  }

  function update() {
    const p = P();
    oMA.textContent = p.ma; oMB.textContent = p.mb;
    oDA.textContent = p.da.toFixed(2); oDB.textContent = p.db.toFixed(2);
    const ta = p.ma * g * p.da, tb = p.mb * g * p.db, d = ta - tb;
    nA.textContent = `${ta.toFixed(0)} N·m`;
    nB.textContent = `${tb.toFixed(0)} N·m`;
    const bal = Math.abs(d) < 1e-6;
    nNet.textContent = bal ? "0 · 평형" : `${Math.abs(d).toFixed(0)} N·m · ${d > 0 ? "A" : "B"} 쪽`;
    nNet.classList.toggle("good", bal);
    draw();
  }

  const { ctx, size } = fit(cv, () => draw());

  function arrow(x0, y0, x1, y1, col, lw = 2) {
    const a = Math.atan2(y1 - y0, x1 - x0), hl = 8;
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = lw;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - hl * 0.8 * Math.cos(a), y1 - hl * 0.8 * Math.sin(a)); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x1, y1);
    ctx.lineTo(x1 - hl * Math.cos(a - 0.4), y1 - hl * Math.sin(a - 0.4));
    ctx.lineTo(x1 - hl * Math.cos(a + 0.4), y1 - hl * Math.sin(a + 0.4)); ctx.fill();
  }

  function person(x, y, m, col, ang) { // (x,y): 판 위의 앉은 자리, ang: 판 기울기(화면 기준)
    const k = Math.cbrt(m / 50), s = size.w / 4.9;
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
    const bw = 0.30 * k * s, bh = 0.52 * k * s, hr = 0.12 * k * s;
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.roundRect(-bw / 2, -bh, bw, bh, bw * 0.35); ctx.fill();
    ctx.beginPath(); ctx.arc(0, -bh - hr * 1.15, hr, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    const p = P();
    ctx.clearRect(0, 0, w, h);
    const s = w / 4.9, cx = w / 2, gy = h - 34, py = gy - PIV * s;
    // 땅
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(8, gy + .5); ctx.lineTo(w - 8, gy + .5); ctx.stroke();
    // 받침
    ctx.fillStyle = C.ink2;
    ctx.beginPath(); ctx.moveTo(cx, py); ctx.lineTo(cx - 0.22 * s, gy); ctx.lineTo(cx + 0.22 * s, gy); ctx.closePath(); ctx.fill();
    // 판 (화면 좌표에서는 y가 아래로: 반시계 +θ → 회전 -θ)
    const ang = -th, ca = Math.cos(ang), sa = Math.sin(ang);
    const at = (d) => [cx + d * s * ca, py + d * s * sa];
    ctx.strokeStyle = "#8a6b4e"; ctx.lineWidth = 7; ctx.lineCap = "round";
    const [lx, ly] = at(-HALF), [rx, ry] = at(HALF);
    ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(rx, ry); ctx.stroke(); ctx.lineCap = "butt";
    // 눈금 (0.5 m마다)
    ctx.strokeStyle = "rgba(255,255,255,.7)"; ctx.lineWidth = 1;
    for (let d = -2; d <= 2.001; d += 0.5) {
      const [x, y] = at(d);
      ctx.beginPath(); ctx.moveTo(x - 3 * sa, y + 3 * ca); ctx.lineTo(x + 3 * sa, y - 3 * ca); ctx.stroke();
    }
    // 사람
    const [ax, ay] = at(-p.da), [bx, by] = at(p.db);
    person(ax, ay - 3.5, p.ma, COL_A, ang);
    person(bx, by - 3.5, p.mb, COL_B, ang);
    // 무게 화살표 (판 아래로, 길이 ∝ 무게)
    const fs = 0.00055 * s;
    arrow(ax, ay + 4, ax, ay + 4 + p.ma * g * fs, COL_A);
    arrow(bx, by + 4, bx, by + 4 + p.mb * g * fs, COL_B);
    // 받침이 떠받치는 힘 (정지해 있을 때의 크기)
    const Nt = (p.ma + p.mb + MP) * g;
    arrow(cx, py - 4, cx, py - 4 - Nt * fs * 0.6, C.ink, 1.6);
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink2; ctx.textAlign = "left";
    ctx.textAlign = "center"; ctx.fillText(`N ≈ ${Nt.toFixed(0)} N`, cx, py - 12 - Nt * fs * 0.6);
    // 팔 길이 치수선 (판과 나란하게, 판 위쪽)
    const dim = (d0, d1, col, label) => {
      const off = -0.95 * s;
      const [x0, y0] = at(d0), [x1, y1] = at(d1);
      const ox = -off * sa, oy = off * ca;
      ctx.strokeStyle = col; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(x0 + ox, y0 + oy); ctx.lineTo(x1 + ox, y1 + oy); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = col; ctx.textAlign = "center";
      ctx.fillText(label, (x0 + x1) / 2 + ox, (y0 + y1) / 2 + oy - 6);
    };
    dim(-p.da, 0, COL_A, `d = ${p.da.toFixed(2)} m`);
    dim(0, p.db, COL_B, `d = ${p.db.toFixed(2)} m`);
    // 이름
    ctx.textAlign = "left"; ctx.font = `500 12px ${F.mono}`;
    ctx.fillStyle = COL_A; ctx.fillText(`A ${p.ma} kg`, 10, 18);
    ctx.fillStyle = COL_B; ctx.textAlign = "right"; ctx.fillText(`B ${p.mb} kg`, w - 10, 18);
    ctx.textAlign = "left"; ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3;
    ctx.fillText(`기울기 ${(th * 180 / Math.PI).toFixed(1)}°`, 10, gy + 20);
    ctx.textAlign = "right"; ctx.fillText("판 4 m · 20 kg", w - 10, gy + 20);
    ctx.textAlign = "left";
  }

  [mA, mB, dA, dB].forEach((el) => el.addEventListener("input", update));
  root.querySelectorAll("[data-set]").forEach((b) => b.addEventListener("click", () => {
    const [a, da, bm, db] = b.dataset.set.split(",").map(Number);
    mA.value = a; dA.value = da; mB.value = bm; dB.value = db; update();
  }));
  $(".tilt").addEventListener("click", () => { th = TH * 0.6; om = 0; draw(); });
  update();
  loop(cv, (dt) => { for (let i = 0; i < 10; i++) step(dt / 10); draw(); });
})();
