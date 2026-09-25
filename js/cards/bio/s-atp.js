/* 카드: ATP는 왜 에너지 '화폐'일까? — ATP–ADP 순환 속도와 몸속 ATP 양 비교 (어림 계산) */
(() => {
  const root = document.getElementById("card-bio-atp");
  if (!root) return;
  const { C, F, fit, loop, reduce } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sPool = $(".pool");
  let watt = 105, phase = 0;

  // 포도당 1몰(2870 kJ)에서 ATP 30몰로 어림 → 1 J당 ATP 1.045e-5 mol, ATP 1몰 = 507 g
  const MOL_PER_J = 30 / 2.87e6, MW = 507, NA = 6.022e23, BODY = 60;
  const DAY_KCAL = 2300, DAY_KG = DAY_KCAL * 4184 * MOL_PER_J * MW / 1000;
  const rateG = () => watt * MOL_PER_J * MW; // g/s

  const { ctx, size } = fit(cv, () => draw());
  const VW = 400, VH = 225;
  function txt(s, x, y, o = {}) {
    ctx.font = `${o.w || 500} ${o.size || 12}px ${o.mono ? F.mono : F.sans}`;
    ctx.textAlign = o.align || "left"; ctx.fillStyle = o.c || C.ink; ctx.fillText(s, x, y); ctx.textAlign = "left";
  }

  function draw() {
    const { w, h } = size;
    if (!w) return;
    const dpr = cv.width / w, s = Math.min(w / VW, h / VH);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.setTransform(dpr * s, 0, 0, dpr * s, 0, 0);
    // ATP–ADP 순환
    const cx = 100, cy = 114, R = 66;
    ctx.lineWidth = 7; ctx.lineCap = "round";
    ctx.strokeStyle = "rgba(59,124,42,.25)"; ctx.beginPath(); ctx.arc(cx, cy, R, Math.PI * 0.62, Math.PI * 1.38); ctx.stroke();
    ctx.strokeStyle = "rgba(217,130,43,.25)"; ctx.beginPath(); ctx.arc(cx, cy, R, -Math.PI * 0.38, Math.PI * 0.38); ctx.stroke();
    ctx.lineCap = "butt";
    // 화살촉
    const head = (a, dir, c) => {
      const x = cx + R * Math.cos(a), y = cy + R * Math.sin(a), ta = a + dir * Math.PI / 2;
      ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(x + 9 * Math.cos(ta), y + 9 * Math.sin(ta));
      ctx.lineTo(x + 7 * Math.cos(ta + 2.3), y + 7 * Math.sin(ta + 2.3)); ctx.lineTo(x + 7 * Math.cos(ta - 2.3), y + 7 * Math.sin(ta - 2.3)); ctx.fill();
    };
    head(Math.PI * 1.38, 1, C.forest); head(Math.PI * 0.38, 1, "#d9822b");
    // 순환하는 분자
    for (let k = 0; k < 10; k++) {
      const a = phase + k * Math.PI / 5, x = cx + R * Math.cos(a), y = cy + R * Math.sin(a);
      const charged = Math.cos(a) > 0; // 오른쪽(쓰러 가는 쪽) = ATP, 왼쪽(재충전 중) = ADP
      ctx.beginPath(); ctx.arc(x, y, 4.5, 0, Math.PI * 2); ctx.fillStyle = charged ? C.forest : "#d9822b"; ctx.fill();
    }
    ctx.fillStyle = C.card; ctx.beginPath(); ctx.arc(cx, cy - R, 17, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = C.forest; ctx.lineWidth = 1.5; ctx.stroke();
    txt("ATP", cx, cy - R + 4, { align: "center", w: 700, c: C.forest, mono: 1 });
    ctx.fillStyle = C.card; ctx.beginPath(); ctx.roundRect(cx - 30, cy + R - 12, 60, 24, 12); ctx.fill(); ctx.strokeStyle = "#d9822b"; ctx.stroke();
    txt("ADP + Pᵢ", cx, cy + R + 4, { align: "center", w: 700, c: "#b0661c", mono: 1, size: 11 });
    txt("재충전 ↑", cx - 28, cy - 2, { align: "center", size: 11, w: 700, c: C.forest });
    txt("세포 호흡", cx - 28, cy + 12, { align: "center", size: 10, c: C.forest });
    txt("사용 ↓", cx + 28, cy - 2, { align: "center", size: 11, w: 700, c: "#b0661c" });
    txt("생명 활동", cx + 28, cy + 12, { align: "center", size: 10, c: "#b0661c" });
    txt("근육 수축 · 능동 수송 · 물질 합성", 8, 214, { size: 10.5, c: C.ink3 });

    // 양 비교 막대 (같은 눈금)
    const bx = 214, bw = 176, full = BODY;
    const pool = +sPool.value, hourKg = rateG() * 3600 / 1000;
    const rows = [
      ["몸무게", `${BODY} kg`, BODY, C.ink3],
      [`하루에 만드는 ATP`, `약 ${Math.round(DAY_KG)} kg`, DAY_KG, C.forest],
      ["지금 활동으로 1시간", `${hourKg.toFixed(1)} kg`, hourKg, "#6f9f5f"],
      ["몸속에 있는 ATP", `${pool} g`, pool / 1000, "#d9822b"],
    ];
    txt("같은 눈금으로 비교", bx, 22, { size: 10.5, c: C.ink3, mono: 1 });
    rows.forEach(([name, val, kg, c], k) => {
      const y = 44 + k * 44;
      txt(name, bx, y, { size: 11.5, c: C.ink2 });
      txt(val, bx + bw, y, { size: 11.5, align: "right", mono: 1, w: 600 });
      ctx.fillStyle = "rgba(35,35,38,.06)"; ctx.fillRect(bx, y + 6, bw, 12);
      ctx.fillStyle = c; ctx.fillRect(bx, y + 6, Math.max(1.5, Math.min(1, kg / full) * bw), 12);
    });
    txt(`하루 ${DAY_KCAL.toLocaleString()} kcal를 쓰는 사람 기준`, bx, 214, { size: 10, c: C.ink3 });
  }

  function update() {
    const g = rateG(), pool = +sPool.value;
    $(".pool-out").textContent = pool;
    $(".per-s").textContent = `${(watt * MOL_PER_J * NA / 1e20).toFixed(1)} × 10²⁰`;
    $(".per-h").textContent = `${(g * 3.6).toFixed(1)} kg`;
    const sec = pool / g;
    $(".turn").textContent = sec < 90 ? `약 ${Math.round(sec)}초` : `약 ${(sec / 60).toFixed(sec < 600 ? 1 : 0)}분`;
    root.querySelectorAll("[data-w]").forEach((b) => b.setAttribute("aria-pressed", +b.dataset.w === watt));
    draw();
  }
  root.querySelectorAll("[data-w]").forEach((b) => b.addEventListener("click", () => { watt = +b.dataset.w; update(); }));
  sPool.addEventListener("input", update);
  if (!reduce) loop(cv, (dt) => { phase += dt * (0.25 + watt / 220); draw(); });
  update();
})();
