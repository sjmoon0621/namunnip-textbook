/* 카드: 식초 속 아세트산 농도를 어떻게 알아낼까? — 가상 중화 적정 (페놀프탈레인) */
(() => {
  const root = document.getElementById("card-chem-vinegar");
  if (!root) return;
  const { C, F, clamp, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), dR = $(".reading"), dCol = $(".color"), out = $(".result"), rec = $(".rec");
  const KA = 1.8e-5, KW = 1.0e-14, CB = 0.100, VA = 20, M = 60.05;
  let pct, ca, Vb, target, drip = [], flash = 0;
  function fresh() { pct = +(4 + Math.random() * 3).toFixed(2); ca = pct * 10 / M / 10; refill(); }
  function refill() { Vb = 0; target = 0; out.innerHTML = "종말점이라고 생각되면 ‘종말점 기록’을 누르세요."; update(); }
  function pH(vb) {
    const V = VA + vb, CA = ca * VA / V, Na = CB * vb / V;
    let lo = -15, hi = 1;
    for (let i = 0; i < 90; i++) { const m = (lo + hi) / 2, h = 10 ** m; (h + Na - KW / h - CA * KA / (KA + h)) > 0 ? hi = m : lo = m; }
    return -(lo + hi) / 2;
  }
  const pink = (p) => 1 / (1 + 10 ** (9.4 - p)); // 페놀프탈레인 붉은 형태의 비율 (pKa ≈ 9.4)

  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const bxc = w * 0.2, top = 14, len = h * 0.56, tw = 12;
    const Y = (v) => top + 8 + v / 50 * (len - 16);
    // 뷰렛
    ctx.fillStyle = "rgba(90,150,210,.18)"; ctx.fillRect(bxc - tw / 2, Y(Vb), tw, top + len - Y(Vb));
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2; ctx.strokeRect(bxc - tw / 2 + .5, top + .5, tw, len);
    ctx.font = `9.5px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "right";
    for (let v = 0; v <= 50; v += 10) { ctx.fillText(`${v}`, bxc - tw / 2 - 4, Y(v) + 3); ctx.beginPath(); ctx.moveTo(bxc - tw / 2, Y(v) + .5); ctx.lineTo(bxc - 2, Y(v) + .5); ctx.strokeStyle = C.ink3; ctx.stroke(); }
    ctx.fillStyle = C.ink2; ctx.fillRect(bxc - 9, top + len, 18, 5);
    ctx.beginPath(); ctx.moveTo(bxc - 2, top + len + 5); ctx.lineTo(bxc - 1, top + len + 20); ctx.lineTo(bxc + 1, top + len + 20); ctx.lineTo(bxc + 2, top + len + 5); ctx.fill();
    for (const d of drip) { ctx.fillStyle = "rgba(90,150,210,.8)"; ctx.beginPath(); ctx.arc(bxc, d.y, 2.5, 0, 7); ctx.fill(); }
    // 삼각 플라스크
    const fy = top + len + 28, fb = h - 8, fw = Math.min(w * 0.3, 150), nk = fw * 0.22;
    const p = pH(Vb), f = pink(p);
    const a = clamp(f * 2.2 + flash, 0, 0.9);
    const lvl = fb - (fb - fy) * 0.45;
    const edge = (y) => nk / 2 + (fw / 2 - nk / 2) * clamp((y - (fy + 12)) / (fb - fy - 12), 0, 1);
    ctx.beginPath(); ctx.moveTo(bxc - edge(lvl), lvl); ctx.lineTo(bxc - fw / 2, fb); ctx.lineTo(bxc + fw / 2, fb); ctx.lineTo(bxc + edge(lvl), lvl); ctx.closePath();
    ctx.fillStyle = `rgba(214,40,140,${a})`; ctx.fill();
    ctx.fillStyle = "rgba(90,150,210,.08)"; ctx.fill();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.beginPath();
    ctx.moveTo(bxc - nk / 2, fy); ctx.lineTo(bxc - nk / 2, fy + 12); ctx.lineTo(bxc - fw / 2, fb); ctx.lineTo(bxc + fw / 2, fb); ctx.lineTo(bxc + nk / 2, fy + 12); ctx.lineTo(bxc + nk / 2, fy); ctx.stroke();

    // ── 오른쪽: 눈금 확대
    const zx = w * 0.5, zw = w * 0.2, zy = 18, zh = h - 60;
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2; ctx.strokeRect(zx + .5, zy + .5, zw, zh);
    const span = 1.0, Z = (v) => zy + zh / 2 + (v - Vb) / span * zh;
    ctx.save(); ctx.beginPath(); ctx.rect(zx, zy, zw, zh); ctx.clip();
    ctx.fillStyle = "rgba(90,150,210,.2)"; ctx.fillRect(zx, zy + zh / 2, zw, zh);
    ctx.strokeStyle = "#3d6fb6"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(zx, zy + zh / 2 - 6); ctx.quadraticCurveTo(zx + zw / 2, zy + zh / 2 + 8, zx + zw, zy + zh / 2 - 6); ctx.stroke();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.fillStyle = C.ink; ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "left";
    for (let t = Math.floor((Vb - span) * 10); t <= (Vb + span) * 10; t++) {
      const y = Z(t / 10) + .5, major = t % 10 === 0, mid = t % 5 === 0;
      ctx.beginPath(); ctx.moveTo(zx, y); ctx.lineTo(zx + (major ? zw * 0.5 : mid ? zw * 0.35 : zw * 0.22), y); ctx.stroke();
      if (major) ctx.fillText(`${t / 10}`, zx + zw * 0.55, y + 4);
    }
    ctx.restore();
    ctx.fillStyle = C.ink3; ctx.textAlign = "center"; ctx.fillText("눈금 확대", zx + zw / 2, h - 26);
    ctx.fillText("메니스커스 아래쪽을 읽음", zx + zw / 2, h - 12);
    // 설명 상자
    const tx = zx + zw + 16;
    ctx.textAlign = "left"; ctx.fillStyle = C.ink2; ctx.font = `10.5px ${F.mono}`;
    const lines = ["뷰렛: 0.100 M NaOH", "플라스크: 10배 묽힌 식초", "          20.0 mL", "지시약: 페놀프탈레인"];
    lines.forEach((t, i) => ctx.fillText(t, tx, 30 + i * 16));
  }

  function state() { const f = pink(pH(Vb)); return f < 0.03 ? "무색" : f < 0.35 ? "옅은 분홍" : "진한 분홍 (지나침)"; }
  function update() {
    dR.textContent = `${Vb.toFixed(2)} mL`; dCol.textContent = state();
    dCol.className = "color " + (state() === "옅은 분홍" ? "good" : state().startsWith("진한") ? "bad" : "");
    draw();
  }
  function add(v) { target = Math.min(50, target + v); drip.push({ y: 0, left: v }); }
  root.querySelectorAll("[data-add]").forEach((b) => b.addEventListener("click", () => add(+b.dataset.add)));
  $(".refill").addEventListener("click", refill);
  $(".fresh").addEventListener("click", fresh);
  rec.addEventListener("click", () => {
    Vb = target;
    const n = CB * Vb, cDil = n / VA, cOrig = cDil * 10, gL = cOrig * M, p2 = gL / 10, err = (p2 / pct - 1) * 100;
    out.innerHTML = `NaOH ${CB.toFixed(3)} M × ${Vb.toFixed(2)} mL = <b>${n.toFixed(3)} mmol</b> → 묽힌 식초의 [CH₃COOH] = ${n.toFixed(3)} ÷ 20.0 mL = ${cDil.toFixed(4)} M → 원래 식초 ${cOrig.toFixed(3)} M → ${gL.toFixed(1)} g/L = <b>${p2.toFixed(2)} %</b><br>이 시료의 실제 산도: ${pct.toFixed(2)} % · 오차 <span class="${Math.abs(err) < 1 ? "good" : "bad"}">${err >= 0 ? "+" : ""}${err.toFixed(1)} %</span>`;
    update();
  });
  loop(cv, (dt) => {
    let moved = false;
    if (Vb < target) {
      Vb = Math.min(target, Vb + Math.max(0.05, target - Vb) * dt * 2.5);
      if (pink(pH(Vb + 0.4)) > 0.03) flash = Math.min(0.35, flash + dt * 1.5); // 종말점 근처: 떨어진 자리가 잠깐 붉어졌다가 섞이면 사라짐
      moved = true;
    }
    else flash = Math.max(0, flash - dt * 0.6);
    const cvh = size.h, stop = 14 + cvh * 0.56 + 30;
    drip.forEach((d) => { d.y = (d.y || 14 + cvh * 0.56 + 20) + dt * 200; });
    drip = drip.filter((d) => d.y < stop + 20);
    if (moved || drip.length || flash > 0) update();
  });
  fresh();
})();
