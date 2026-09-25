/* 카드: 규소는 도체일까, 절연체일까? — 띠 간격, 온도, 도핑과 전도 전자 농도 */
(() => {
  const root = document.getElementById("card-phy-lm-bands");
  if (!root) return;
  const { C, F, clamp, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const tS = $(".temp"), tO = $(".temp-out"), dope = $(".dope");
  const gEl = $(".eg"), nEl = $(".ncar"), rEl = $(".ratio");
  const k = 8.617e-5, ND = 1e16;
  // 띠 간격 Eg(eV, 300 K), 유효 상태 밀도 Nc·Nv(cm⁻³, 300 K), 원자 수 밀도(cm⁻³)
  const M = {
    cu: { name: "구리", eg: 0, atoms: 8.5e22, free: 8.5e22 },
    ge: { name: "게르마늄", eg: 0.66, nc: 1.04e19, nv: 6.0e18, atoms: 4.4e22 },
    si: { name: "규소", eg: 1.12, nc: 2.8e19, nv: 1.04e19, atoms: 5.0e22 },
    gaas: { name: "비화 갈륨", eg: 1.42, nc: 4.7e17, nv: 7.0e18, atoms: 4.4e22 },
    dia: { name: "다이아몬드", eg: 5.47, nc: 1e19, nv: 1e19, atoms: 1.76e23 },
  };
  let cur = "si";
  const ni = (m, T) => Math.sqrt(m.nc * m.nv) * Math.pow(T / 300, 1.5) * Math.exp(-m.eg / (2 * k * T));
  const carriers = (key, T, doped) => {
    const m = M[key];
    if (!m.eg) return m.free;
    const n = ni(m, T);
    return doped ? ND / 2 + Math.sqrt(ND * ND / 4 + n * n) : n;
  };
  const SUP = { "-": "⁻", 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹" };
  const sci = (x) => {
    if (x < 1e-30) return "0";
    const e = Math.floor(Math.log10(x)), m = x / Math.pow(10, e);
    return `${m.toFixed(1)}×10${String(e).split("").map((c) => SUP[c]).join("")}`;
  };

  const { ctx, size } = fit(cv, () => draw());

  function draw() {
    const { w, h } = size;
    if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const T = +tS.value, m = M[cur], doped = dope.checked && m.eg > 0;
    const n = carriers(cur, T, doped);
    // 1) 에너지띠 그림
    const bx0 = 16, bx1 = Math.round(w * 0.42), mid = h / 2 + 4, sc = (h * 0.62) / 6;
    const cbY = mid - (m.eg * sc) / 2, vbY = mid + (m.eg * sc) / 2, bandH = h * 0.16;
    ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "left";
    if (!m.eg) {
      ctx.fillStyle = "rgba(92,150,190,.35)"; ctx.fillRect(bx0, mid - bandH, bx1 - bx0, bandH * 2);
      ctx.fillStyle = "rgba(92,150,190,.12)"; ctx.fillRect(bx0, mid - bandH * 1.8, bx1 - bx0, bandH * 0.8);
      ctx.strokeStyle = C.ink; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(bx0, mid - bandH + .5); ctx.lineTo(bx1, mid - bandH + .5); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = C.ink2; ctx.fillText("띠의 절반쯤까지만 전자가 참", bx0 + 4, mid - bandH - 6);
      ctx.fillText("→ 바로 위에 빈자리가 있음", bx0 + 4, mid - bandH + 14);
    } else {
      ctx.fillStyle = "rgba(92,150,190,.12)"; ctx.fillRect(bx0, cbY - bandH, bx1 - bx0, bandH);
      ctx.fillStyle = "rgba(92,150,190,.45)"; ctx.fillRect(bx0, vbY, bx1 - bx0, bandH);
      ctx.fillStyle = C.ink2;
      ctx.fillText("전도띠 (빈 띠)", bx0 + 4, cbY - bandH + 12);
      ctx.fillText("원자가 띠 (꽉 찬 띠)", bx0 + 4, vbY + bandH - 5);
      // 띠 간격 화살표
      const ax = bx1 - 20;
      ctx.strokeStyle = C.warn; ctx.fillStyle = C.warn; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(ax, cbY + 1); ctx.lineTo(ax, vbY - 1); ctx.stroke();
      ctx.textAlign = "right"; ctx.fillText(`${m.eg} eV`, ax - 4, mid + 4); ctx.textAlign = "left";
      if (doped) {
        ctx.strokeStyle = C.forest; ctx.setLineDash([3, 3]);
        const dy = cbY + Math.max(3, 0.045 * sc);
        ctx.beginPath(); ctx.moveTo(bx0 + 10, dy); ctx.lineTo(bx0 + (bx1 - bx0) * 0.6, dy); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = C.forest; ctx.fillText("인(P)이 준 전자의 자리", bx0 + 4, dy + 12);
      }
      // 전도띠의 전자(●)와 원자가 띠의 빈자리(○): 개수는 농도의 로그에 비례한 모식
      const ne = Math.round(clamp((Math.log10(n) - 4) * 1.4, 0, 26));
      const nh = Math.round(clamp((Math.log10(doped ? ni(m, T) ** 2 / n : n) - 4) * 1.4, 0, 26));
      let seed = 7; const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
      ctx.fillStyle = C.ink;
      for (let i = 0; i < ne; i++) { ctx.beginPath(); ctx.arc(bx0 + 8 + rnd() * (bx1 - bx0 - 40), cbY - 4 - rnd() * (bandH * 0.55), 2.6, 0, Math.PI * 2); ctx.fill(); }
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2;
      for (let i = 0; i < nh; i++) { ctx.beginPath(); ctx.arc(bx0 + 8 + rnd() * (bx1 - bx0 - 40), vbY + 4 + rnd() * (bandH * 0.45), 2.6, 0, Math.PI * 2); ctx.stroke(); }
    }
    ctx.fillStyle = C.ink3; ctx.fillText(`${m.name} · ${T} K`, bx0, 12);
    ctx.fillText("점 개수는 농도의 로그에 비례 (모식)", bx0, h - 6);

    // 2) 전도 전자 농도 막대 (로그 눈금)
    const gx0 = Math.round(w * 0.5) + 60, gx1 = w - 12, E0 = 0, E1 = 24;
    const X = (v) => gx0 + (clamp(Math.log10(Math.max(v, 1)), E0, E1) - E0) / (E1 - E0) * (gx1 - gx0);
    ctx.fillStyle = C.ink3; ctx.textAlign = "left"; ctx.fillText("1 cm³ 속 전도 전자 수 (로그 눈금)", gx0 - 60, 12);
    const keys = Object.keys(M), rh = (h - 60) / keys.length;
    keys.forEach((key, i) => {
      const y = 26 + i * rh, v = carriers(key, T, dope.checked && M[key].eg > 0), on = key === cur;
      ctx.fillStyle = on ? C.ink : C.ink3; ctx.textAlign = "right"; ctx.font = `${on ? 600 : 400} 11px ${F.sans}`;
      ctx.fillText(M[key].name, gx0 - 6, y + rh * 0.45 + 4);
      ctx.fillStyle = on ? C.forest : C.sprout; ctx.fillRect(gx0, y + rh * 0.2, Math.max(1, X(v) - gx0), rh * 0.5);
      ctx.font = `10px ${F.mono}`; ctx.textAlign = "left"; ctx.fillStyle = C.ink2;
      const lab = v < 1 ? "1개 미만" : sci(v), lx = X(v) + 4;
      if (lx + 58 < gx1) ctx.fillText(lab, lx, y + rh * 0.45 + 4);
      else { ctx.fillStyle = "#fff"; ctx.textAlign = "right"; ctx.fillText(lab, X(v) - 4, y + rh * 0.45 + 4); }
    });
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "center";
    for (let e = 0; e <= 24; e += 6) {
      const x = X(Math.pow(10, e)) + .5;
      ctx.beginPath(); ctx.moveTo(x, 22); ctx.lineTo(x, h - 30); ctx.stroke();
      ctx.fillText(`10${String(e).split("").map((c) => SUP[c]).join("")}`, x, h - 18);
    }
  }

  function update() {
    const T = +tS.value, m = M[cur];
    tO.textContent = T;
    dope.disabled = !m.eg;
    const n = carriers(cur, T, dope.checked && m.eg > 0);
    gEl.textContent = m.eg ? `${m.eg} eV` : "없음 (띠가 겹침)";
    nEl.textContent = n < 1 ? "1개 미만" : `${sci(n)} cm⁻³`;
    const r = m.atoms / n;
    rEl.textContent = r <= 1.01 ? "원자마다 1개" : r > 1e20 ? "사실상 없음" : `원자 ${sci(r)}개에 1개`;
    draw();
  }
  tS.addEventListener("input", update);
  dope.addEventListener("change", update);
  const chips = root.querySelectorAll("[data-mat]");
  chips.forEach((b) => b.addEventListener("click", () => {
    cur = b.dataset.mat; chips.forEach((o) => o.setAttribute("aria-pressed", o === b)); update();
  }));
  update();
})();
