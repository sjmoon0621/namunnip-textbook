/* 카드: 콕을 열어 두 기체를 섞으면 각 기체의 압력은 어떻게 될까? — 돌턴 법칙 */
(() => {
  const root = document.getElementById("card-adchem-stopcock");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sPA = $(".pa"), sPB = $(".pb"), sVA = $(".va"), sVB = $(".vb"), openB = $(".open");
  const RT = 0.08206 * 298, PER = 1500;
  const GB = { O2: { name: "O₂", M: 32.00, sp: 1 }, He: { name: "He", M: 4.003, sp: 2.83 }, CO2: { name: "CO₂", M: 44.01, sp: 0.85 } };
  const COL = ["#3b7c2a", "#d07a1a"];
  let gb = "O2", open = false, P = [], geo = null;
  let seed = 3; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };

  const { ctx, size } = fit(cv, () => { geo = null; draw(); });
  const val = () => ({ PA: +sPA.value, PB: +sPB.value, VA: +sVA.value, VB: +sVB.value });

  function geometry() {
    const { w, h } = size, { VA, VB } = val();
    const top = 30, H = h * 0.5 - 24, tube = 34, avail = w - 24 - tube, k = avail / 6;
    const A = { x: 12 + (3 - VA) * k, y: top, w: VA * k, h: H };
    const B = { x: 12 + 3 * k + tube, y: top, w: VB * k, h: H };
    const T = { x: A.x + A.w - 8, y: top + H / 2 - 12, w: tube + 16, h: 24 };
    return { A, B, T };
  }
  const inR = (r, x, y) => x >= r.x + 3 && x <= r.x + r.w - 3 && y >= r.y + 3 && y <= r.y + r.h - 3;
  const ok = (x, y) => inR(geo.A, x, y) || inR(geo.B, x, y) || (open && inR(geo.T, x, y));

  function reset() {
    open = false; openB.textContent = "콕 열기"; openB.setAttribute("aria-pressed", "false");
    geo = size.w ? geometry() : null;
    const { PA, PB, VA, VB } = val();
    const nA = Math.round(PA * VA / RT * PER), nB = Math.round(PB * VB / RT * PER);
    P = []; seed = 3;
    const put = (r, s) => { const a = rnd() * Math.PI * 2, v = 90 * (s ? GB[gb].sp : 1); P.push({ s, x: rnd(), y: rnd(), r, vx: Math.cos(a) * v, vy: Math.sin(a) * v }); };
    for (let i = 0; i < nA; i++) put("A", 0);
    for (let i = 0; i < nB; i++) put("B", 1);
    P.forEach((p) => { p.u = p.x; p.w = p.y; p.init = true; });
  }
  function place() {
    for (const p of P) if (p.init) { const r = geo[p.r]; p.x = r.x + 4 + p.u * (r.w - 8); p.y = r.y + 4 + p.w * (r.h - 8); p.init = false; }
  }

  function counts() {
    const c = { A: [0, 0], B: [0, 0] };
    for (const p of P) { const side = p.x < geo.T.x + geo.T.w / 2 ? "A" : "B"; c[side][p.s]++; }
    return c;
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    if (!geo) { geo = geometry(); P.forEach((p) => { p.init = true; }); }
    place();
    ctx.clearRect(0, 0, w, h);
    const { A, B, T } = geo, { VA, VB, PA, PB } = val();
    /* 관과 콕 */
    ctx.fillStyle = open ? "#f7f8f3" : "#e6e7e0"; ctx.fillRect(T.x, T.y, T.w, T.h);
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(T.x, T.y); ctx.lineTo(T.x + T.w, T.y); ctx.moveTo(T.x, T.y + T.h); ctx.lineTo(T.x + T.w, T.y + T.h); ctx.stroke();
    const cx = T.x + T.w / 2, cy = T.y + T.h / 2;
    ctx.fillStyle = C.card; ctx.beginPath(); ctx.arc(cx, cy, 9, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.lineWidth = 3; ctx.beginPath();
    if (open) { ctx.moveTo(cx - 8, cy); ctx.lineTo(cx + 8, cy); } else { ctx.moveTo(cx, cy - 8); ctx.lineTo(cx, cy + 8); }
    ctx.stroke();
    for (const [r, lab] of [[A, `A · ${VA.toFixed(1)} L`], [B, `B · ${VB.toFixed(1)} L`]]) {
      ctx.fillStyle = "#f7f8f3"; ctx.fillRect(r.x, r.y, r.w, r.h);
      ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.5; ctx.strokeRect(r.x, r.y, r.w, r.h);
      ctx.fillStyle = C.ink2; ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText(lab, r.x + r.w / 2, r.y - 7);
    }
    if (open) { ctx.fillStyle = "#f7f8f3"; ctx.fillRect(T.x + 1, T.y + 1.5, T.w - 2, T.h - 3); ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(cx, cy, 9, 0, Math.PI * 2); ctx.stroke(); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx - 8, cy); ctx.lineTo(cx + 8, cy); ctx.stroke(); }
    for (const p of P) { ctx.fillStyle = COL[p.s]; ctx.beginPath(); ctx.arc(p.x, p.y, 1.8, 0, Math.PI * 2); ctx.fill(); }

    /* 아래: 부분 압력 막대 */
    const c = counts(), y0 = h - 30, y1 = h * 0.5 + 34, PM = 3;
    const Y = (p) => y0 - Math.min(p, PM) / PM * (y0 - y1);
    const nA = PA * VA / RT, nB = PB * VB / RT, Vt = VA + VB;
    const theo = open ? [[nA * RT / Vt, nB * RT / Vt], [nA * RT / Vt, nB * RT / Vt]] : [[PA, 0], [0, PB]];
    const gx0 = 46, gw = w - gx0 - 12;
    NM.axes(ctx, { x0: gx0, y0: y1, w: gw, h: y0 - y1, xt: [], yt: [[0, "0"], [1, "1"], [2, "2"], [3, "3"]], X: (v) => v, Y, ylabel: "부분 압력 (atm)" });
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(gx0, y0); ctx.lineTo(gx0 + gw, y0); ctx.stroke();
    const groups = [["A", VA, 0], ["B", VB, 1]], bw = Math.min(34, gw / 9);
    groups.forEach(([side, V, gi]) => {
      const gxc = gx0 + gw * (gi ? 0.72 : 0.28);
      const vals = [c[side][0] / PER * RT / V, c[side][1] / PER * RT / V];
      vals.forEach((pv, s) => {
        const bx = s === 0 ? gxc - bw * 1.5 - 3 : gxc - bw * 0.5;
        ctx.fillStyle = COL[s]; ctx.globalAlpha = 0.75; ctx.fillRect(bx, Y(pv), bw, y0 - Y(pv)); ctx.globalAlpha = 1;
        ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(bx - 3, Y(theo[gi][s])); ctx.lineTo(bx + bw + 3, Y(theo[gi][s])); ctx.stroke();
      });
      const tot = vals[0] + vals[1], bx = gxc + bw * 0.5 + 3;
      ctx.fillStyle = "#c9cbc2"; ctx.fillRect(bx, Y(tot), bw, y0 - Y(tot));
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(bx - 3, Y(theo[gi][0] + theo[gi][1])); ctx.lineTo(bx + bw + 3, Y(theo[gi][0] + theo[gi][1])); ctx.stroke();
      ctx.fillStyle = C.ink2; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "center";
      ctx.fillText(`플라스크 ${side}: N₂ · ${GB[gb].name} · 전체`, gxc, y0 + 15);
    });
  }

  function update(re) {
    root.querySelectorAll("[data-g]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.g === gb)));
    const { PA, PB, VA, VB } = val();
    $(".pa-out").textContent = PA.toFixed(1); $(".pb-out").textContent = PB.toFixed(1);
    $(".va-out").textContent = VA.toFixed(1); $(".vb-out").textContent = VB.toFixed(1);
    const nA = PA * VA / RT, nB = PB * VB / RT, Vt = VA + VB, xA = nA / (nA + nB);
    $(".n-n").textContent = `${nA.toFixed(4)} / ${nB.toFixed(4)} mol`;
    $(".n-p").textContent = `${(nA * RT / Vt).toFixed(3)} / ${(nB * RT / Vt).toFixed(3)} atm`;
    $(".n-t").textContent = `${((nA + nB) * RT / Vt).toFixed(3)} atm`;
    $(".n-x").textContent = `${xA.toFixed(3)} / ${(1 - xA).toFixed(3)}`;
    $(".n-m").textContent = `${(xA * 28.01 + (1 - xA) * GB[gb].M).toFixed(2)} g/mol`;
    if (re) reset();
    draw();
  }

  root.querySelectorAll("[data-g]").forEach((b) => b.addEventListener("click", () => { gb = b.dataset.g; update(true); }));
  [sPA, sPB, sVA, sVB].forEach((s) => s.addEventListener("input", () => update(true)));
  openB.addEventListener("click", () => {
    open = !open; openB.textContent = open ? "콕 닫기" : "콕 열기"; openB.setAttribute("aria-pressed", String(open)); draw();
  });

  function step(dt) {
    for (const p of P) {
      const nx = p.x + p.vx * dt, ny = p.y + p.vy * dt;
      if (ok(nx, ny)) { p.x = nx; p.y = ny; }
      else if (ok(p.x - p.vx * dt * 0, ny) && !ok(nx, p.y)) { p.vx = -p.vx; }
      else if (ok(nx, p.y) && !ok(p.x, ny)) { p.vy = -p.vy; }
      else { p.vx = -p.vx; p.vy = -p.vy; }
      /* 가끔 방향을 조금 틀어 분자 사이 충돌을 흉내 낸다 */
      if (rnd() < 0.02) { const a = (rnd() - 0.5) * 1.2, c = Math.cos(a), s = Math.sin(a); const vx = p.vx * c - p.vy * s; p.vy = p.vx * s + p.vy * c; p.vx = vx; }
      if (!ok(p.x, p.y)) { const r = geo[p.x < geo.T.x + geo.T.w / 2 ? "A" : "B"]; p.x = Math.min(r.x + r.w - 5, Math.max(r.x + 5, p.x)); p.y = Math.min(r.y + r.h - 5, Math.max(r.y + 5, p.y)); }
    }
  }
  loop(cv, (dt) => { if (!size.w || !geo) return; place(); step(NM.reduce ? 0 : dt); draw(); });

  reset(); update(false);
  if (/[?&]demo\b/.test(location.search)) {
    const fast = () => { if (!size.w) return setTimeout(fast, 50); if (!geo) geo = geometry(); place(); open = true; openB.textContent = "콕 닫기"; openB.setAttribute("aria-pressed", "true"); for (let i = 0; i < 3000; i++) step(0.03); draw(); };
    setTimeout(fast, 60);
  }
})();
