/* 카드: 태양은 무엇을 태워서 빛날까? — 질량 결손과 태양의 수명 비교 */
(() => {
  const root = document.getElementById("card-is2-sun-fusion");
  if (!root) return;
  const { C, F, fit, clamp } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const sF = $(".frac"), oF = $(".frac-out");
  const nE = $(".ekg"), nT = $(".life"), nV = $(".verdict"), msg = $(".src-msg");

  // 상수 (SI)
  const L = 3.828e26, M = 1.989e30, R = 6.957e8, G = 6.674e-11, c = 2.998e8, YR = 3.156e7;
  const mH = 1.007825, mHe = 4.002603, U = 931.494; // 원자 질량 (u), 1 u = 931.494 MeV
  const dm = 4 * mH - mHe;              // 0.0287 u
  const eff = dm / (4 * mH);            // 0.71 %
  const AGE = 4.54e9;                   // 지구 나이 (년)

  const SRC = {
    coal: { name: "석탄처럼 탄다면", ekg: 3e7,
      life: () => M * 3e7 / L / YR,
      msg: "석탄 1 kg이 탈 때 나오는 에너지는 약 3×10⁷ J입니다. 태양 전체가 석탄이라도 지금 밝기로는 수천 년이면 다 탑니다." },
    grav: { name: "중력으로 줄어든다면", ekg: G * M / R,
      life: () => G * M * M / R / L / YR,
      msg: "기체 공이 중력으로 수축하면 위치 에너지가 열로 바뀝니다. 19세기 과학자들이 생각한 답인데, 계산하면 수천만 년에 그칩니다." },
    fus: { name: "수소 핵융합", ekg: eff * c * c,
      life: () => (+sF.value / 100) * M * eff * c * c / L / YR,
      msg: "수소 4개가 헬륨 1개가 될 때 질량의 0.71%가 사라지고, 그만큼이 E = mc²의 에너지로 나옵니다. 중심핵의 수소만 써도 약 100억 년을 버팁니다." },
  };
  let cur = "fus";

  const { ctx, size } = fit(cv, () => draw());
  const toSup = (n) => String(n).split("").map((d) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[d] || "⁻").join("");
  const sup = (x) => {
    const e = Math.floor(Math.log10(x)), m = x / 10 ** e;
    return `${m.toFixed(1)}×10${toSup(e)}`;
  };
  const sig2 = (x) => { const e = Math.floor(Math.log10(x)) - 1; return Math.round(x / 10 ** e) * 10 ** e; };
  const years = (y) => y >= 1e8 ? `${(y / 1e8 >= 20 ? Math.round(y / 1e8) : (y / 1e8).toFixed(1))}억 년` : y >= 1e4 ? `${sig2(y / 1e4).toLocaleString("ko-KR")}만 년` : `${sig2(y).toLocaleString("ko-KR")}년`;

  function atom(x, y, r, label, col) {
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = "#fff"; ctx.font = `600 ${Math.round(r * 0.8)}px ${F.mono}`; ctx.textAlign = "center";
    ctx.fillText(label, x, y + r * 0.3);
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const narrow = w < 480;
    // ─ 위: 저울 (수소 4개 vs 헬륨 1개)
    const topH = h * 0.46;
    const cx = w * 0.5, beamY = topH * 0.56, half = Math.min(w * 0.3, 190);
    const tilt = 0.06; // 왼쪽(수소)이 무겁다
    const lx = cx - half * Math.cos(tilt), ly = beamY + half * Math.sin(tilt);
    const rx = cx + half * Math.cos(tilt), ry = beamY - half * Math.sin(tilt);
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx, beamY); ctx.lineTo(cx, topH - 4); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - 18, topH - 4); ctx.lineTo(cx + 18, topH - 4); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(rx, ry); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, beamY, 3.5, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill();
    const pan = (x, y) => { ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 30, y + 26); ctx.moveTo(x, y); ctx.lineTo(x + 30, y + 26); ctx.stroke();
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - 36, y + 26); ctx.lineTo(x + 36, y + 26); ctx.stroke(); };
    pan(lx, ly); pan(rx, ry);
    const r1 = narrow ? 8 : 10;
    [[-1.5, 0], [-0.5, 0], [0.5, 0], [1.5, 0]].forEach(([dx]) => atom(lx + dx * r1 * 2.1, ly + 26 - r1 - 1, r1, "H", C.warn));
    atom(rx, ry + 26 - 16, 15, "He", C.amber);
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink2; ctx.textAlign = "center";
    ctx.fillText(`¹H × 4 = ${(4 * mH).toFixed(4)} u`, lx, ly + 44);
    ctx.fillText(`⁴He = ${mHe.toFixed(4)} u`, rx, ry + 44);
    ctx.fillStyle = C.warn; ctx.font = `600 11.5px ${F.mono}`;
    ctx.fillText(`사라진 질량 ${dm.toFixed(4)} u (${(eff * 100).toFixed(2)}%)`, cx, 16);
    ctx.fillStyle = C.ink2; ctx.font = `10.5px ${F.mono}`;
    ctx.fillText(`→ ${(dm * U).toFixed(1)} MeV의 에너지 (E = Δm c²)`, cx, 31);
    ctx.textAlign = "left";

    // ─ 아래: 로그 시간 축
    const padL = narrow ? 8 : 16, padR = narrow ? 8 : 16, y0 = topH + 22, pw = w - padL - padR;
    const LY0 = 2, LY1 = 11;
    const X = (y) => padL + (Math.log10(y) - LY0) / (LY1 - LY0) * pw;
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3;
    ctx.fillText("지금 밝기로 빛날 수 있는 시간 (년, 로그 눈금)", padL, y0 - 8);
    const rowH = (h - y0 - 30) / 3;
    const keys = ["coal", "grav", "fus"];
    // 눈금
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1;
    for (let e = LY0; e <= LY1; e++) {
      const x = Math.round(X(10 ** e)) + .5;
      ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y0 + rowH * 3); ctx.stroke();
      if (!narrow || e % 2 === 0) { ctx.textAlign = "center"; ctx.fillStyle = C.ink3; ctx.fillText(`10${toSup(e)}`, x, y0 + rowH * 3 + 13); }
    }
    ctx.textAlign = "left";
    keys.forEach((k, i) => {
      const s = SRC[k], life = s.life(), y = y0 + i * rowH + rowH * 0.2, bh = rowH * 0.5;
      const on = k === cur;
      ctx.fillStyle = on ? (k === "fus" ? C.amber : C.ink2) : "rgba(35,35,38,.12)";
      ctx.fillRect(padL, y, Math.max(2, X(life) - padL), bh);
      ctx.font = `${on ? 600 : 400} 11px ${F.sans}`;
      const lab = `${s.name} · ${years(life)}`;
      const tw = ctx.measureText(lab).width;
      const inside = X(life) - padL > tw + 12;
      ctx.fillStyle = inside ? (on ? (k === "fus" ? C.ink : "#fff") : C.ink2) : (on ? C.ink : C.ink3);
      ctx.fillText(lab, inside ? padL + 6 : X(life) + 6, y + bh / 2 + 4);
    });
    // 기준선
    const marks = [[1e4, "인류 문명", C.ink3], [6.6e7, "공룡 멸종", C.ink3], [AGE, "지구 나이", C.forest]];
    marks.forEach(([t, name, col]) => {
      const x = X(t);
      ctx.strokeStyle = col; ctx.setLineDash([4, 3]); ctx.lineWidth = 1.3;
      ctx.beginPath(); ctx.moveTo(x, y0 - 2); ctx.lineTo(x, y0 + rowH * 3); ctx.stroke(); ctx.setLineDash([]);
    });
    ctx.font = `10px ${F.mono}`;
    const ly2 = y0 + rowH * 3 + 26;
    marks.forEach(([t, name, col], i) => {
      ctx.fillStyle = col; ctx.textAlign = i === 2 ? "right" : "center";
      ctx.fillText(name, X(t) + (i === 2 ? 3 : 0), ly2);
    });
    ctx.textAlign = "left";
  }

  function update() {
    oF.textContent = sF.value;
    const s = SRC[cur], life = s.life();
    nE.textContent = `${sup(s.ekg)} J`;
    nT.textContent = years(life);
    const ok = life > AGE;
    nV.textContent = ok ? "설명 가능" : "모자람";
    nV.classList.toggle("good", ok); nV.classList.toggle("bad", !ok);
    msg.textContent = s.msg;
    sF.disabled = cur !== "fus";
    root.querySelectorAll("[data-src]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.src === cur));
    draw();
  }
  sF.addEventListener("input", update);
  root.querySelectorAll("[data-src]").forEach((b) => b.addEventListener("click", () => { cur = b.dataset.src; update(); }));
  update();
})();
