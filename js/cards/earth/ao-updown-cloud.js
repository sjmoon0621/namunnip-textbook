/* 카드: 고기압 아래에서는 왜 날씨가 맑을까? — 상승·하강하는 공기 덩어리의 단열 변화 */
(() => {
  const root = document.getElementById("card-earth-updown");
  if (!root) return;
  const { C, F, fit, clamp } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const sA = $(".a"), sB = $(".b"), oA = $(".a-out"), oB = $(".b-out");
  const aName = $(".a-name"), bName = $(".b-name");
  const r1 = $(".r1"), r2 = $(".r2"), r3 = $(".r3"), r1n = $(".r1-name"), r2n = $(".r2-name"), r3n = $(".r3-name");

  const GD = 10, GM = 5, GDEW = 2, ZTOP = 5, Z0 = 3; // °C/km, km
  const es = (T) => 6.112 * Math.exp(17.62 * T / (243.12 + T)); // hPa, 마그누스 식
  const rh = (T, Td) => clamp(100 * es(Td) / es(T), 0, 100);
  let mode = "up";
  const saved = { up: [25, 17], down: [-5, -5] };

  // 높이 z(km)에서 공기 덩어리의 기온·이슬점
  function prof(z) {
    const a = +sA.value, b = Math.min(+sB.value, a);
    if (mode === "up") {
      const zl = (a - b) / (GD - GDEW);
      if (z <= zl) return { T: a - GD * z, Td: b - GDEW * z, zl };
      const Tl = a - GD * zl; return { T: Tl - GM * (z - zl), Td: Tl - GM * (z - zl), zl };
    }
    // 하강: Z0 높이에서 출발, 구름은 곧 증발한다고 보고 건조 단열로 데워짐
    return { T: a + GD * (Z0 - z), Td: b + GDEW * (Z0 - z), zl: Infinity };
  }

  const { ctx, size } = fit(cv, () => draw());
  let ph = 0;

  function draw() {
    const { w, h } = size; if (!w) return;
    const small = w < 480;
    ctx.clearRect(0, 0, w, h);
    const top = 18, bot = h - 30;
    const Z = (z) => bot - z / ZTOP * (bot - top);
    const p0 = prof(0);

    // ── 왼쪽: 장면 ──
    const sx = 6, sw = Math.round(w * .34);
    const sky = ctx.createLinearGradient(0, top, 0, bot);
    sky.addColorStop(0, mode === "up" ? "#c9d2d8" : "#bfd9ee"); sky.addColorStop(1, mode === "up" ? "#e3e7e9" : "#eef6fb");
    ctx.fillStyle = sky; ctx.fillRect(sx, top, sw, bot - top);
    ctx.fillStyle = "#b9c4a8"; ctx.fillRect(sx, bot, sw, 6);
    if (mode === "up") {
      const zl = p0.zl;
      if (zl < ZTOP) { // 구름
        const yb = Z(zl), yt = Z(Math.min(ZTOP, zl + 3));
        ctx.fillStyle = "rgba(255,255,255,.95)"; ctx.strokeStyle = "rgba(93,93,97,.4)"; ctx.lineWidth = 1;
        ctx.beginPath();
        const cx = sx + sw / 2, cw = sw * .8;
        ctx.moveTo(cx - cw / 2, yb);
        for (let i = 0; i <= 6; i++) { const x = cx - cw / 2 + cw * i / 6; ctx.lineTo(x, yb); }
        ctx.lineTo(cx + cw / 2, yb);
        const bumps = 5;
        for (let i = bumps; i >= 0; i--) { const x = cx - cw / 2 + cw * i / bumps; ctx.quadraticCurveTo(x + cw / bumps / 2, yt - 10 - (i % 2) * 8, x, yt + 6); }
        ctx.closePath(); ctx.fill(); ctx.stroke();
        if (ZTOP - zl > 2) { // 비
          ctx.strokeStyle = "rgba(63,111,163,.6)"; ctx.lineWidth = 1;
          for (let i = 0; i < 9; i++) { const x = sx + sw * (.15 + i * .08), y = yb + 6 + ((ph * 60 + i * 13) % Math.max(8, bot - yb - 12)); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 2, y + 6); ctx.stroke(); }
        }
        ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink2; ctx.textAlign = "right"; ctx.fillText("구름 밑면", sx + sw - 4, yb + 12);
      }
      // 모여드는 바람, 상승 화살표
      ctx.strokeStyle = C.warn; ctx.fillStyle = C.warn; ctx.lineWidth = 2;
      const cx = sx + sw / 2;
      [[sx + 8, cx - 12], [sx + sw - 8, cx + 12]].forEach(([a, b]) => { ctx.beginPath(); ctx.moveTo(a, bot - 8); ctx.lineTo(b, bot - 8); ctx.stroke(); });
      ctx.beginPath(); ctx.moveTo(cx, bot - 14); ctx.lineTo(cx, top + 16); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, top + 10); ctx.lineTo(cx - 5, top + 19); ctx.lineTo(cx + 5, top + 19); ctx.fill();
      ctx.font = `700 ${small ? 16 : 20}px ${F.sans}`; ctx.fillStyle = C.warn; ctx.textAlign = "left"; ctx.fillText("L", sx + 6, bot - 16);
    } else {
      // 위쪽에서 흩어지는 구름, 하강 화살표, 퍼져 나가는 바람
      const yc = Z(Z0);
      const k = 0.5 + 0.5 * Math.cos(ph * 1.2);
      ctx.fillStyle = `rgba(255,255,255,${0.35 + 0.4 * k})`;
      ctx.beginPath(); ctx.ellipse(sx + sw * .5, yc, sw * .3 * (0.6 + 0.4 * k), 9, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(sx + sw - 18, top + 16, 9, 0, Math.PI * 2); ctx.fillStyle = C.amber; ctx.fill();
      const cx = sx + sw / 2;
      ctx.strokeStyle = "#3f6fa3"; ctx.fillStyle = "#3f6fa3"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx, yc + 12); ctx.lineTo(cx, bot - 14); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, bot - 8); ctx.lineTo(cx - 5, bot - 17); ctx.lineTo(cx + 5, bot - 17); ctx.fill();
      [[cx - 12, sx + 10], [cx + 12, sx + sw - 10]].forEach(([a, b]) => {
        ctx.beginPath(); ctx.moveTo(a, bot - 6); ctx.lineTo(b, bot - 6); ctx.stroke();
        const d = Math.sign(b - a); ctx.beginPath(); ctx.moveTo(b, bot - 6); ctx.lineTo(b - d * 8, bot - 10); ctx.lineTo(b - d * 8, bot - 2); ctx.fill();
      });
      ctx.font = `700 ${small ? 16 : 20}px ${F.sans}`; ctx.fillStyle = "#3f6fa3"; ctx.textAlign = "left"; ctx.fillText("H", sx + 6, bot - 16);
    }
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.strokeRect(sx + .5, top + .5, sw - 1, bot - top + 5);

    // ── 오른쪽: 기온–높이 그래프 ──
    const gx0 = sx + sw + (small ? 32 : 40), gw = w - gx0 - 10;
    let lo = Infinity, hi = -Infinity;
    for (let z = 0; z <= ZTOP; z += .1) { const p = prof(z); lo = Math.min(lo, p.Td, p.T); hi = Math.max(hi, p.T); }
    lo = Math.floor((lo - 3) / 10) * 10; hi = Math.ceil((hi + 3) / 10) * 10;
    const X = (T) => gx0 + (T - lo) / (hi - lo) * gw;
    const xt = []; for (let v = lo; v <= hi; v += (hi - lo > 60 ? 20 : 10)) xt.push([v, String(v)]);
    NM.axes(ctx, { x0: gx0, y0: top, w: gw, h: bot - top, X, Y: Z, xt, yt: [0, 1, 2, 3, 4, 5].map((v) => [v, String(v)]), xlabel: "기온 (°C)", ylabel: "높이 (km)" });
    const z0 = mode === "up" ? 0 : Z0, z1 = mode === "up" ? ZTOP : 0;
    if (mode === "up" && p0.zl < ZTOP) {
      ctx.fillStyle = "rgba(93,93,97,.07)"; ctx.fillRect(gx0 + 1, Z(ZTOP), gw - 1, Z(p0.zl) - Z(ZTOP));
      ctx.strokeStyle = C.ink3; ctx.setLineDash([4, 3]); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(gx0, Z(p0.zl)); ctx.lineTo(gx0 + gw, Z(p0.zl)); ctx.stroke(); ctx.setLineDash([]);
      ctx.font = `10.5px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.textAlign = "right";
      ctx.fillText(`상승 응결 고도 ${Math.round(p0.zl * 1000)} m`, gx0 + gw - 4, Z(p0.zl) - 5);
      ctx.fillText("구름 (포화)", gx0 + gw - 4, Z(ZTOP) + 14);
    }
    const line = (key, col) => {
      ctx.strokeStyle = col; ctx.lineWidth = 2.3; ctx.beginPath();
      for (let k = 0; k <= 50; k++) { const z = Math.min(z0, z1) + Math.abs(z1 - z0) * k / 50, p = prof(z); k ? ctx.lineTo(X(p[key]), Z(z)) : ctx.moveTo(X(p[key]), Z(z)); }
      ctx.stroke();
    };
    line("Td", "#3f6fa3"); line("T", C.warn);
    // 움직이는 공기 덩어리
    const f = (ph * .25) % 1, zz = z0 + (z1 - z0) * f, pp = prof(zz);
    ctx.beginPath(); ctx.arc(X(pp.T), Z(zz), 5, 0, Math.PI * 2); ctx.fillStyle = C.warn; ctx.fill();
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink; ctx.textAlign = X(pp.T) > gx0 + gw - 110 ? "right" : "left";
    ctx.fillText(`습도 ${Math.round(rh(pp.T, pp.Td))}%`, X(pp.T) + (ctx.textAlign === "right" ? -9 : 9), Z(zz) + 4);
    ctx.textAlign = "left";
  }

  function update() {
    if (+sB.value > +sA.value) sB.value = sA.value;
    oA.textContent = sA.value; oB.textContent = sB.value;
    const p0 = prof(0);
    if (mode === "up") {
      r1n.textContent = "구름 밑면 높이"; r2n.textContent = "5 km에서 기온"; r3n.textContent = "지표 상대 습도";
      r1.textContent = p0.zl < ZTOP ? `${Math.round(p0.zl * 1000)} m` : "5 km 위";
      r2.textContent = `${prof(ZTOP).T.toFixed(1)} °C`;
      r3.textContent = `${Math.round(rh(p0.T, p0.Td))} %`;
    } else {
      r1n.textContent = "지표 도착 기온"; r2n.textContent = "지표 도착 이슬점"; r3n.textContent = "지표 상대 습도";
      r1.textContent = `${p0.T.toFixed(0)} °C`; r2.textContent = `${p0.Td.toFixed(0)} °C`;
      r3.textContent = `${Math.round(rh(p0.T, p0.Td))} %`;
    }
    draw();
  }
  function setMode(m) {
    saved[mode] = [+sA.value, +sB.value];
    mode = m;
    root.querySelectorAll(".mode").forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.m === m)));
    aName.textContent = m === "up" ? "지표 기온" : "3 km 높이 기온";
    bName.textContent = m === "up" ? "지표 이슬점" : "3 km 높이 이슬점";
    if (m === "up") { sA.min = 0; sA.max = 35; sB.min = -10; sB.max = 30; } else { sA.min = -20; sA.max = 10; sB.min = -30; sB.max = 10; }
    sA.value = saved[m][0]; sB.value = saved[m][1];
    update();
  }
  [sA, sB].forEach((el) => el.addEventListener("input", update));
  root.querySelectorAll(".mode").forEach((b) => b.addEventListener("click", () => setMode(b.dataset.m)));
  NM.loop(cv, (dt) => { if (!NM.reduce) { ph += dt; draw(); } });
  setMode("up");
})();
