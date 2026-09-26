/* 카드: 물이 끓는 동안 가한 열은 어디로 갈까? — −20 °C 얼음 1 kg의 가열 곡선 (비열, 융해열, 기화열) */
(() => {
  const root = document.getElementById("card-mech-heating-curve");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sP = $(".p"), sQ = $(".q"), oP = $(".p-out"), oQ = $(".q-out");
  const nT = $(".n-T"), nSt = $(".n-st"), nUse = $(".n-use"), nt = $(".n-t");
  const cI = 2.1, cW = 4.19, cS = 2.0, Lf = 334, Lv = 2257;   // kJ/kg·K, kJ/kg (m = 1 kg)
  // 구간: [시작 열, 끝 열, 시작 온도, 끝 온도, 이름, 설명]
  const segs = []; let q = 0;
  const add = (dq, T0, T1, name, use) => { segs.push([q, q + dq, T0, T1, name, use]); q += dq; };
  add(cI * 20, -20, 0, "얼음", "얼음의 온도를 올림 (비열)");
  add(Lf, 0, 0, "얼음 + 물", "녹이는 데 씀 (융해열)");
  add(cW * 100, 0, 100, "물", "물의 온도를 올림 (비열)");
  add(Lv, 100, 100, "물 + 수증기", "기체로 바꾸는 데 씀 (기화열)");
  add(cS * 20, 100, 120, "수증기", "수증기의 온도를 올림");
  const QMAX = q;
  const at = (Q) => { const s = segs.find((g) => Q <= g[1]) || segs[segs.length - 1]; const f = (Q - s[0]) / (s[1] - s[0] || 1); return { s, T: s[2] + (s[3] - s[2]) * Math.min(1, f), f }; };

  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const P = +sP.value, Q = +sQ.value, x0 = 44, y0 = h - 30, pw = w - x0 - 90, ph = h - 50;
    const X = (qq) => x0 + qq / QMAX * pw, Y = (T) => y0 - (T + 30) / 160 * ph;
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, y0 - ph); ctx.lineTo(x0, y0); ctx.lineTo(x0 + pw, y0); ctx.stroke();
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "right";
    [-20, 0, 50, 100, 120].forEach((T) => { ctx.fillText(`${T}`, x0 - 5, Y(T) + 3); ctx.strokeStyle = C.rule; ctx.beginPath(); ctx.moveTo(x0, Y(T)); ctx.lineTo(x0 + pw, Y(T)); ctx.stroke(); });
    ctx.textAlign = "center";
    // 가로축: 가한 열(kJ)과 시간(분) 두 가지
    [0, 500, 1000, 1500, 2000, 2500, 3000].forEach((qq) => { ctx.fillText(`${qq}`, X(qq), y0 + 13); });
    ctx.fillText("가한 열 (kJ)", x0 + pw / 2, y0 + 26);
    ctx.textAlign = "left"; ctx.fillText(`°C`, x0 + 4, y0 - ph + 10);
    const cols = { "얼음": "#6ea4e6", "얼음 + 물": "#8fb4e0", "물": "#3f6fa3", "물 + 수증기": "#b0b0b8", "수증기": "#8d8d92" };
    segs.forEach(([a, b, T0, T1, name]) => {
      ctx.strokeStyle = cols[name]; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(X(a), Y(T0)); ctx.lineTo(X(b), Y(T1)); ctx.stroke();
      if (T0 === T1) { ctx.fillStyle = C.ink2; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(T0 === 0 ? `녹는 중 ${Lf} kJ` : `끓는 중 ${Lv} kJ`, (X(a) + X(b)) / 2, Y(T0) - 8); }
    });
    // 지금 위치
    const cur = at(Q);
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(X(Q), Y(cur.T), 6, 0, Math.PI * 2); ctx.fill();
    // 오른쪽: 비커 그림 (얼음·물·수증기 비율)
    const bx = w - 72, bw = 56, by = h * 0.3, bh = h * 0.55;
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.strokeRect(bx, by, bw, bh);
    let ice = 0, water = 0, steam = 0; const n = cur.s[4];
    if (n === "얼음") ice = 1; else if (n === "얼음 + 물") { ice = 1 - cur.f; water = cur.f; } else if (n === "물") water = 1; else if (n === "물 + 수증기") { water = 1 - cur.f; steam = cur.f; } else steam = 1;
    ctx.fillStyle = "#3f6fa3"; ctx.fillRect(bx + 1, by + bh * (1 - water * 0.8), bw - 2, bh * water * 0.8);
    ctx.fillStyle = "#dce9f7"; for (let i = 0; i < Math.round(ice * 6); i++) { ctx.fillRect(bx + 6 + (i % 3) * 16, by + bh - 18 - Math.floor(i / 3) * 16 - water * bh * 0.2, 13, 13); ctx.strokeStyle = "#6ea4e6"; ctx.strokeRect(bx + 6 + (i % 3) * 16, by + bh - 18 - Math.floor(i / 3) * 16 - water * bh * 0.2, 13, 13); }
    ctx.fillStyle = "rgba(141,141,146,.6)"; for (let i = 0; i < Math.round(steam * 14); i++) { ctx.beginPath(); ctx.arc(bx + 10 + (i * 23) % 40, by - 8 - ((i * 13) % 40), 4, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = C.ink2; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(n, bx + bw / 2, by + bh + 14);
  }
  function update() {
    const P = +sP.value, Q = +sQ.value, cur = at(Q);
    oP.textContent = P.toFixed(1); oQ.textContent = Q;
    nT.textContent = `${cur.T.toFixed(1)} °C`; nSt.textContent = cur.s[4]; nUse.textContent = cur.s[5];
    const sec = Q / P; nt.textContent = sec < 60 ? `${sec.toFixed(0)} 초` : `${(sec / 60).toFixed(1)} 분`;
    draw();
  }
  [sP, sQ].forEach((el) => el.addEventListener("input", update));
  update();
})();
