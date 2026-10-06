/* 카드: 연못물 플랑크톤 관찰 — 배율·초점, 접안/대물 마이크로미터 보정, 식물성·동물성 판정 */
(() => {
  const root = document.getElementById("card-labbio-plankton");
  if (!root) return;
  const { C, F, fit, loop, clamp } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const TAU = Math.PI * 2;

  /* 종류: 크기 len(μm), 식물성 여부, 속력(μm/s), 관찰 특징 */
  const KIND = {
    diatom: { name: "규조류 (돌말)", len: 60, phyto: true, v: 4, feat: "황갈색 엽록체가 두 줄로 보이고, 배 모양 껍데기에 가는 줄무늬가 새겨져 있습니다. 아주 천천히 미끄러지듯 움직입니다. 입이나 먹이를 담은 주머니는 보이지 않습니다." },
    spiro: { name: "해캄 (녹조류)", len: 420, phyto: true, v: 0, feat: "원통형 세포가 실처럼 이어져 있고, 세포마다 초록색 띠 모양 엽록체가 나선으로 감겨 있습니다. 움직이지 않습니다." },
    dino: { name: "와편모조류", len: 50, phyto: true, v: 25, feat: "갈색 엽록체가 가득하고 가운데에 가로 홈이 있습니다. 홈 속 편모로 빙글빙글 돌며 헤엄칩니다. 먹이를 삼키는 모습은 보이지 않습니다." },
    anab: { name: "남세균 (아나베나)", len: 140, phyto: true, v: 0, feat: "청록색 작은 구슬(세포)이 염주처럼 이어져 있고, 군데군데 조금 큰 세포가 끼어 있습니다. 핵이나 엽록체 같은 막 구조는 보이지 않지만 세포 전체가 청록색입니다." },
    eug: { name: "유글레나", len: 60, phyto: true, v: 40, feat: "방추형 몸에 초록색 엽록체가 여럿 있고, 앞쪽에 붉은 안점이 있습니다. 긴 편모 하나로 헤엄치며 몸 모양을 바꾸기도 합니다." },
    daph: { name: "물벼룩", len: 1300, phyto: false, v: 300, feat: "투명한 껍데기 속에서 심장이 빠르게 뛰고, 큰 겹눈 하나와 가지 친 더듬이가 있습니다. 더듬이를 저어 톡톡 뛰듯 움직이고, 소화관이 삼킨 조류로 초록색입니다." },
    para: { name: "짚신벌레", len: 210, phyto: false, v: 900, feat: "짚신 모양 몸 전체에 섬모가 나 있어 빠르게 헤엄칩니다. 몸 가운데 오목한 입 쪽 홈이 있고, 그 안쪽에 먹은 세균을 담은 식포가 여러 개 보입니다. 엽록체는 없습니다." },
    roti: { name: "윤충 (로티퍼)", len: 300, phyto: false, v: 15, feat: "머리 쪽 섬모 고리가 바퀴처럼 돌며 물살을 일으켜 먹이를 끌어들이고, 몸 속 턱(저작낭)이 씹듯 움직입니다. 꼬리 발로 바닥에 붙어 있기도 합니다. 엽록체는 없습니다." },
    cope: { name: "요각류 (검물벼룩)", len: 900, phyto: false, v: 500, feat: "눈물방울 모양 몸에 붉은 눈 하나, 긴 더듬이 한 쌍이 있습니다. 다리를 차며 갑자기 튀어 나갑니다. 꼬리 쪽에 알주머니가 달려 있습니다." },
  };
  const FIELD_MM = { 4: 4.5, 10: 1.8, 40: 0.45 };
  let obj = 4, focus = 20, stageOn = false, slow = false, fieldNo = 1, vx = 0, vy = 0, sel = null, t = 0, orgs = [];
  const tbl = L.table($(".tbl-host"), [{ key: "f", label: "시야" }, { key: "m", label: "배율" }, { key: "j", label: "판정" }, { key: "r", label: "실제" }, { key: "d", label: "접안 눈금", res: 0.5 }, { key: "s", label: "크기 (μm)", res: 1 }], () => nums());
  const { ctx, size } = fit($("canvas"), () => draw());

  function makeField() {
    const pick = ["diatom", "diatom", "diatom", "dino", "dino", "anab", "anab", "spiro", "eug", "eug", "diatom", "dino", "para", "para", "roti", "daph", "cope"];
    const n = 11 + Math.floor(Math.random() * 5);
    orgs = [];
    for (let i = 0; i < n; i++) {
      const k = i < 4 ? ["para", "roti", "diatom", "dino"][i] : pick[Math.floor(Math.random() * pick.length)];
      const r = Math.sqrt(Math.random()) * 1900, a = Math.random() * TAU;
      orgs.push({ k, x: r * Math.cos(a), y: r * Math.sin(a), z: 5 + Math.random() * 50, ang: Math.random() * TAU, sc: 1 + 0.15 * L.gauss(), ph: Math.random() * 10, hop: 0 });
    }
    if (Math.random() < 0.6) orgs.push({ k: Math.random() < 0.5 ? "daph" : "cope", x: 600 * L.gauss(), y: 600 * L.gauss(), z: 30, ang: Math.random() * TAU, sc: 1, ph: 0, hop: 0 });
    vx = 0; vy = 0; sel = null;
  }
  const lenOf = (o) => KIND[o.k].len * o.sc;

  /* 생물 그리기: 원점이 생물 중심, s = px/μm */
  function body(o, s) {
    const K = KIND[o.k], l = lenOf(o) * s, tt = t + o.ph;
    ctx.lineWidth = Math.max(0.6, Math.min(1.4, l / 40));
    switch (o.k) {
      case "diatom": {
        ctx.fillStyle = "rgba(240,236,210,.7)"; ctx.strokeStyle = "#8a7a50";
        ctx.beginPath(); ctx.ellipse(0, 0, l / 2, l / 9, 0, 0, TAU); ctx.fill(); ctx.stroke();
        ctx.fillStyle = "rgba(160,120,40,.75)"; ctx.beginPath(); ctx.ellipse(-l / 8, 0, l / 4.2, l / 20, 0, 0, TAU); ctx.ellipse(l / 8, 0, l / 4.2, l / 20, 0, 0, TAU); ctx.fill();
        if (l > 30) { ctx.strokeStyle = "rgba(120,100,60,.35)"; ctx.lineWidth = 0.6; for (let i = -8; i <= 8; i++) { const x = i * l / 20; ctx.beginPath(); ctx.moveTo(x, -l / 10); ctx.lineTo(x, l / 10); ctx.stroke(); } }
        break;
      }
      case "spiro": {
        const wd = l * 40 / 420, n = 6, cl = l / n;
        ctx.fillStyle = "rgba(220,240,215,.55)"; ctx.strokeStyle = "#5c8a50"; ctx.fillRect(-l / 2, -wd / 2, l, wd); ctx.strokeRect(-l / 2, -wd / 2, l, wd);
        for (let i = 1; i < n; i++) { ctx.beginPath(); ctx.moveTo(-l / 2 + i * cl, -wd / 2); ctx.lineTo(-l / 2 + i * cl, wd / 2); ctx.stroke(); }
        ctx.strokeStyle = "rgba(40,140,50,.85)"; ctx.lineWidth = Math.max(1, wd / 6); ctx.beginPath();
        for (let i = 0; i <= 120; i++) { const x = -l / 2 + l * i / 120; const y = Math.sin(i / 120 * n * 2 * TAU) * wd * 0.38; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
        ctx.stroke(); break;
      }
      case "dino": {
        ctx.fillStyle = "rgba(170,120,60,.7)"; ctx.strokeStyle = "#7a5530";
        ctx.beginPath(); ctx.ellipse(0, 0, l / 2, l / 2.3, 0, 0, TAU); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-l / 2, 0); ctx.bezierCurveTo(-l / 6, l / 9, l / 6, -l / 9, l / 2, 0); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, l / 2.3); ctx.lineTo(0, l / 1.6); ctx.stroke(); break;
      }
      case "anab": {
        const n = 20, d = l / n;
        for (let i = 0; i < n; i++) { const big = i === 7 || i === 15; ctx.fillStyle = big ? "rgba(200,220,190,.8)" : "rgba(60,140,130,.8)"; ctx.beginPath(); ctx.arc(-l / 2 + d * (i + 0.5), Math.sin(i * 0.5) * d * 0.6, d * (big ? 0.62 : 0.5), 0, TAU); ctx.fill(); }
        break;
      }
      case "eug": {
        const sq = 1 + 0.12 * Math.sin(tt * 2);
        ctx.fillStyle = "rgba(170,220,150,.6)"; ctx.strokeStyle = "#4b7a3a";
        ctx.beginPath(); ctx.ellipse(0, 0, l / 2 * sq, l / 7 / sq, 0, 0, TAU); ctx.fill(); ctx.stroke();
        ctx.fillStyle = "rgba(40,140,40,.8)"; for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.ellipse(i * l / 10, (i % 2) * l / 30, l / 22, l / 40, 0.3, 0, TAU); ctx.fill(); }
        ctx.fillStyle = "#d33"; ctx.beginPath(); ctx.arc(l * 0.38, -l / 30, Math.max(1, l / 40), 0, TAU); ctx.fill();
        ctx.strokeStyle = "rgba(80,100,80,.6)"; ctx.beginPath(); ctx.moveTo(l / 2, 0); ctx.quadraticCurveTo(l * 0.75, Math.sin(tt * 12) * l / 6, l, 0); ctx.stroke(); break;
      }
      case "daph": {
        ctx.fillStyle = "rgba(235,225,200,.5)"; ctx.strokeStyle = "#8a7a60";
        ctx.beginPath(); ctx.ellipse(l * 0.05, 0, l * 0.42, l * 0.3, 0, 0, TAU); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-l * 0.37, 0); ctx.lineTo(-l * 0.5, l * 0.1); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(l * 0.38, -l * 0.05, l * 0.14, l * 0.12, 0, 0, TAU); ctx.fill(); ctx.stroke();
        ctx.fillStyle = "#222"; ctx.beginPath(); ctx.arc(l * 0.44, -l * 0.07, l * 0.045, 0, TAU); ctx.fill();
        ctx.strokeStyle = "rgba(60,140,50,.8)"; ctx.lineWidth = Math.max(1, l * 0.03); ctx.beginPath(); ctx.moveTo(l * 0.3, 0); ctx.quadraticCurveTo(0, l * 0.12, -l * 0.3, 0); ctx.stroke();
        const hb = 1 + 0.25 * Math.sin(tt * 25); ctx.fillStyle = "rgba(200,90,80,.6)"; ctx.beginPath(); ctx.arc(l * 0.1, -l * 0.18, l * 0.04 * hb, 0, TAU); ctx.fill();
        ctx.strokeStyle = "#8a7a60"; ctx.lineWidth = Math.max(0.8, l * 0.012); const sw = Math.sin(tt * 6) * 0.3;
        [-1, 1].forEach((sg) => { ctx.beginPath(); ctx.moveTo(l * 0.3, sg * l * 0.08); ctx.lineTo(l * 0.2, sg * (l * 0.45 + sw * l * 0.1)); ctx.lineTo(l * 0.0, sg * l * 0.5); ctx.stroke(); });
        break;
      }
      case "para": {
        ctx.fillStyle = "rgba(225,225,215,.55)"; ctx.strokeStyle = "#7a7a70";
        ctx.beginPath(); ctx.ellipse(0, 0, l / 2, l / 5.5, 0, 0, TAU); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(l * 0.05, l / 12, l / 7, l / 22, 0.3, 0, TAU); ctx.stroke();
        ctx.fillStyle = "rgba(150,110,90,.6)"; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(-l * 0.25 + i * l * 0.11, -l * 0.05 + (i % 2) * l * 0.06, l / 30, 0, TAU); ctx.fill(); }
        if (l > 40) { ctx.strokeStyle = "rgba(120,120,110,.5)"; ctx.lineWidth = 0.5; for (let i = 0; i < 36; i++) { const a = i / 36 * TAU, ex = Math.cos(a) * l / 2, ey = Math.sin(a) * l / 5.5, w = Math.sin(tt * 30 + i) * 0.3; ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex * (1.06 + w * 0.02), ey * (1.18 + w * 0.1)); ctx.stroke(); } }
        break;
      }
      case "roti": {
        ctx.fillStyle = "rgba(230,225,210,.55)"; ctx.strokeStyle = "#8a8070";
        ctx.beginPath(); ctx.moveTo(l * 0.3, -l * 0.14); ctx.quadraticCurveTo(-l * 0.1, -l * 0.2, -l * 0.3, -l * 0.04); ctx.lineTo(-l * 0.5, 0); ctx.lineTo(-l * 0.3, l * 0.04); ctx.quadraticCurveTo(-l * 0.1, l * 0.2, l * 0.3, l * 0.14); ctx.closePath(); ctx.fill(); ctx.stroke();
        [-1, 1].forEach((sg) => { ctx.beginPath(); ctx.arc(l * 0.36, sg * l * 0.09, l * 0.08, 0, TAU); ctx.stroke(); if (l > 40) for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + tt * 8 * sg; ctx.beginPath(); ctx.moveTo(l * 0.36 + Math.cos(a) * l * 0.08, sg * l * 0.09 + Math.sin(a) * l * 0.08); ctx.lineTo(l * 0.36 + Math.cos(a) * l * 0.11, sg * l * 0.09 + Math.sin(a) * l * 0.11); ctx.stroke(); } });
        ctx.fillStyle = "rgba(150,120,90,.6)"; ctx.beginPath(); ctx.arc(l * 0.12 + Math.sin(tt * 9) * l * 0.01, 0, l * 0.04, 0, TAU); ctx.fill();
        break;
      }
      case "cope": {
        ctx.fillStyle = "rgba(225,215,195,.55)"; ctx.strokeStyle = "#8a7a60";
        ctx.beginPath(); ctx.ellipse(l * 0.1, 0, l * 0.3, l * 0.16, 0, 0, TAU); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-l * 0.2, -l * 0.04); ctx.lineTo(-l * 0.45, 0); ctx.lineTo(-l * 0.2, l * 0.04); ctx.stroke();
        ctx.fillStyle = "#c33"; ctx.beginPath(); ctx.arc(l * 0.36, 0, l * 0.025, 0, TAU); ctx.fill();
        ctx.fillStyle = "rgba(120,110,80,.55)"; [-1, 1].forEach((sg) => { ctx.beginPath(); ctx.ellipse(-l * 0.3, sg * l * 0.08, l * 0.09, l * 0.05, 0, 0, TAU); ctx.fill(); });
        ctx.strokeStyle = "#8a7a60"; [-1, 1].forEach((sg) => { ctx.beginPath(); ctx.moveTo(l * 0.36, sg * l * 0.05); ctx.quadraticCurveTo(l * 0.4, sg * l * 0.35, l * 0.15, sg * l * 0.5); ctx.stroke(); });
        break;
      }
    }
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const cx = w / 2, cy = h / 2, R = Math.min(w, h) / 2 - 6, s = R / (FIELD_MM[obj] * 500);
    ctx.fillStyle = C.night; ctx.fillRect(0, 0, w, h);
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.clip();
    const g = ctx.createRadialGradient(cx, cy, R * 0.2, cx, cy, R);
    const lum = obj === 40 ? 0.86 : 1;
    g.addColorStop(0, `rgba(${250 * lum},${250 * lum},${240 * lum},1)`); g.addColorStop(1, `rgba(${215 * lum},${215 * lum},${200 * lum},1)`);
    ctx.fillStyle = g; ctx.fillRect(cx - R, cy - R, 2 * R, 2 * R);
    if (stageOn) {
      ctx.strokeStyle = "#333"; ctx.lineWidth = 1; ctx.fillStyle = "#333";
      const x0 = cx - R * 10 / 18, y0 = cy + 6, step = 10 * s;
      for (let i = 0; i <= 100; i++) {
        const x = x0 + i * step; if (x > cx + R) break;
        const long = i % 10 === 0, mid = i % 5 === 0;
        if (!long && !mid && step < 2.5) continue;
        ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y0 + (long ? 26 : mid ? 18 : 12)); ctx.stroke();
      }
      ctx.fillRect(x0, y0, Math.min(1000 * s, cx + R - x0), 1.2);
      ctx.font = `10px ${F.mono}`; ctx.textAlign = "left"; ctx.fillText("대물 마이크로미터 (한 칸 10 μm)", cx - R * 0.5, y0 + 44);
    } else {
      const dof = { 4: 0.006, 10: 0.04, 40: 0.6 }[obj];
      for (const o of orgs) {
        const px = cx + (o.x - vx) * s, py = cy + (o.y - vy) * s, l = lenOf(o) * s;
        if (px < cx - R - l || px > cx + R + l || py < cy - R - l || py > cy + R + l) continue;
        const b = Math.abs(focus - o.z) * dof;
        ctx.save(); ctx.translate(px, py); ctx.rotate(o.ang);
        if (b > 0.3) ctx.filter = `blur(${Math.min(12, b).toFixed(1)}px)`;
        ctx.globalAlpha = clamp(1.1 - b / 14, 0.25, 1);
        body(o, s);
        ctx.restore();
        if (o === sel) { ctx.strokeStyle = C.warn; ctx.lineWidth = 1.2; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.arc(px, py, Math.max(10, l * 0.6), 0, TAU); ctx.stroke(); ctx.setLineDash([]); }
      }
    }
    /* 접안 마이크로미터: 시야 지름의 10/18, 100눈금 */
    const ux = cx - R * 10 / 18, du = (R * 20 / 18) / 100, uy = cy;
    ctx.strokeStyle = "rgba(20,20,30,.85)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(ux, uy); ctx.lineTo(ux + 100 * du, uy); ctx.stroke();
    for (let i = 0; i <= 100; i++) { const x = ux + i * du, len = i % 10 === 0 ? 12 : i % 5 === 0 ? 8 : 5; ctx.beginPath(); ctx.moveTo(x, uy); ctx.lineTo(x, uy - len); ctx.stroke(); }
    ctx.fillStyle = "rgba(20,20,30,.85)"; ctx.font = `9px ${F.mono}`; ctx.textAlign = "center";
    for (let i = 0; i <= 100; i += 20) ctx.fillText(i, ux + i * du, uy - 15);
    ctx.restore();
    ctx.strokeStyle = "#000"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.stroke();
    ctx.fillStyle = "#e8e8e0"; ctx.font = `11px ${F.mono}`; ctx.textAlign = "left"; ctx.fillText(`${obj * 10}×`, 8, 16);
    ctx.textAlign = "right"; ctx.fillText(`시야 ${fieldNo}`, w - 8, 16);
  }

  function step(dt) {
    t += dt;
    const fac = slow ? 0.12 : 1;
    for (const o of orgs) {
      const v = KIND[o.k].v * fac; if (!v) continue;
      if (o.k === "daph" || o.k === "cope") {
        o.hop -= dt; if (o.hop < 0) { o.hop = 0.6 + Math.random() * 1.2; o.vx = Math.cos(o.ang) * v * 2; o.vy = Math.sin(o.ang) * v * 2; o.ang += (Math.random() - 0.5) * 1.2; }
        o.vx = (o.vx || 0) * Math.exp(-3 * dt); o.vy = (o.vy || 0) * Math.exp(-3 * dt);
        o.x += o.vx * dt; o.y += o.vy * dt;
      } else {
        o.ang += (Math.random() - 0.5) * dt * (o.k === "dino" ? 6 : 1.5);
        o.x += Math.cos(o.ang) * v * dt; o.y += Math.sin(o.ang) * v * dt;
      }
      const r = Math.hypot(o.x, o.y); if (r > 2100) { o.ang += Math.PI; o.x *= 2100 / r; o.y *= 2100 / r; }
    }
    if (sel) { vx += (sel.x - vx) * Math.min(1, dt * 4); vy += (sel.y - vy) * Math.min(1, dt * 4); }
  }

  function nums() {
    const rows = tbl.rows, here = rows.filter((r) => r.f === fieldNo);
    $(".n-f").textContent = here.length ? `${here.filter((r) => r.j === "식물성").length} · ${here.filter((r) => r.j === "동물성").length}` : "—";
    $(".n-ok").textContent = rows.length ? `${Math.round(rows.filter((r) => r.ok).length / rows.length * 100)}% (${rows.length}개)` : "—";
    $(".n-d").textContent = `${FIELD_MM[obj] >= 1 ? FIELD_MM[obj].toFixed(1) + " mm" : FIELD_MM[obj] * 1000 + " μm"}`;
  }

  function judge(asPhyto) {
    if (!sel) { $(".feat").textContent = "먼저 시야 속 생물을 하나 누르세요."; return; }
    const K = KIND[sel.k], ok = K.phyto === asPhyto, perDiv = 100 / obj;
    let d = L.measure(lenOf(sel) / perDiv, { sd: K.v > 100 && !slow ? 1.5 : 0.4, res: 0.5 });
    const cal = parseFloat($(".calv").value);
    const over = d > 100;
    if (over) d = NaN;
    tbl.add({ f: fieldNo, m: `${obj * 10}배`, j: asPhyto ? "식물성" : "동물성", r: K.name, d, s: Number.isFinite(d) && cal > 0 ? d * cal : NaN, ok });
    const fb = $(".feat"); fb.classList.toggle("good", ok); fb.classList.toggle("bad", !ok);
    fb.textContent = `${K.name}: ${ok ? "맞습니다" : "다시 생각해 보세요"}. ${K.phyto ? "엽록체(광합성 색소)가 있어 광합성을 하는 생산자이므로 식물성 플랑크톤입니다." : "엽록체가 없고 다른 생물을 먹는 소비자이므로 동물성 플랑크톤입니다."}${over ? " 접안 눈금 100칸을 넘어 이 배율에서는 크기를 잴 수 없습니다. 배율을 낮추세요." : ""}${!(cal > 0) ? " (보정값을 넣으면 크기가 계산됩니다.)" : ""}`;
  }

  $("canvas").addEventListener("click", (e) => {
    if (stageOn) return;
    const r = $("canvas").getBoundingClientRect(), { w, h } = size;
    const R = Math.min(w, h) / 2 - 6, s = R / (FIELD_MM[obj] * 500);
    const mx = vx + (e.clientX - r.left - w / 2) / s, my = vy + (e.clientY - r.top - h / 2) / s;
    let best = null, bd = Infinity;
    for (const o of orgs) { const d = Math.hypot(o.x - mx, o.y - my) - lenOf(o) / 2; if (d < bd) { bd = d; best = o; } }
    if (best && bd < Math.max(20 / s, 30)) {
      sel = best; const fb = $(".feat"); fb.classList.remove("good", "bad");
      fb.textContent = `관찰: ${KIND[best.k].feat}`;
    }
  });
  $(".obj").addEventListener("click", (e) => { const b = e.target.closest("[data-o]"); if (!b) return; obj = +b.dataset.o; root.querySelectorAll("[data-o]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); $(".calv").value = ""; nums(); draw(); });
  $(".focus").addEventListener("input", (e) => { focus = +e.target.value; $(".f-out").textContent = focus.toFixed(1).replace(/\.0$/, ""); });
  $(".field").addEventListener("click", () => { fieldNo++; makeField(); nums(); $(".feat").classList.remove("good", "bad"); $(".feat").textContent = "새 시야입니다. 생물을 눌러 특징을 읽으세요."; });
  $(".stage").addEventListener("click", (e) => { stageOn = !stageOn; e.currentTarget.setAttribute("aria-pressed", String(stageOn)); e.currentTarget.textContent = stageOn ? "대물 마이크로미터 내리기" : "대물 마이크로미터 올리기"; draw(); });
  $(".slow").addEventListener("click", (e) => { slow = !slow; e.currentTarget.setAttribute("aria-pressed", String(slow)); });
  $(".pick-p").addEventListener("click", () => judge(true));
  $(".pick-z").addEventListener("click", () => judge(false));
  $(".clear").addEventListener("click", () => tbl.clear());
  makeField(); nums();
  loop($("canvas"), (dt) => { step(dt); draw(); });

  if (L.demo) {
    const run = (o, cal, picks) => {
      obj = o; root.querySelectorAll("[data-o]").forEach((x) => x.setAttribute("aria-pressed", String(+x.dataset.o === o))); $(".calv").value = cal;
      picks.forEach(([k, p]) => { sel = orgs.find((q) => q.k === k) || orgs[0]; judge(p); });
    };
    slow = true; $(".slow").setAttribute("aria-pressed", "true");
    run(10, 10, [["para", false], ["roti", false], ["diatom", true]]);
    run(40, 2.5, [["dino", true], ["diatom", true]]);
    fieldNo = 2; makeField();
    run(10, 10, [["para", false], ["dino", true], ["roti", false]]);
    sel = orgs.find((q) => q.k === "roti"); vx = sel.x; vy = sel.y; focus = Math.round(sel.z); $(".focus").value = focus; $(".f-out").textContent = focus;
    $(".feat").textContent = `관찰: ${KIND.roti.feat}`; nums();
  }
})();
