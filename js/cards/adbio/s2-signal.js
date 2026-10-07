/* 카드: 신호는 얼마나 멀리, 얼마나 빨리 갈까? — 확산 시간 t = x²/2D, 분해가 있을 때의 도달 범위 λ = √(D·τ) */
(() => {
  const root = document.getElementById("card-adbio-signal");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sX = $(".dist"), sH = $(".half"), oX = $(".dist-out"), oH = $(".half-out");
  const nDiff = $(".n-diff"), nBlood = $(".n-blood"), nNerve = $(".n-nerve"), nLam = $(".n-lam");

  /* D: µm²/s. 작은 분자(아세틸콜린·NO 수준)와 단백질(성장 인자 수준, 조직 속) */
  const DS = { small: 500, prot: 50 };
  let dk = "small";
  const BLOOD = 60;        /* 온몸 한 바퀴 순환 ≈ 1분 (혈액량 5 L ÷ 심박출량 5 L/분) */
  const VNERVE = 50;       /* 말이집 축삭, m/s */
  const SYN = 0.5e-3;      /* 시냅스 지연, s */

  const fmtX = (um) => um < 1 ? `${(um * 1000).toFixed(0)} nm` : um < 1000 ? `${um.toPrecision(2)} µm` : um < 1e6 ? `${(um / 1000).toPrecision(2)} mm` : `${(um / 1e6).toPrecision(2)} m`;
  const fmtT = (s) => {
    if (s < 1e-3) return `${(s * 1e6).toPrecision(2)} µs`;
    if (s < 1) return `${(s * 1e3).toPrecision(2)} ms`;
    if (s < 120) return `${s.toPrecision(2)} 초`;
    if (s < 7200) return `${(s / 60).toPrecision(2)} 분`;
    if (s < 2 * 86400) return `${(s / 3600).toPrecision(2)} 시간`;
    if (s < 365 * 86400) return `${(s / 86400).toPrecision(2)} 일`;
    return `${(s / 3.156e7).toPrecision(2)} 년`;
  };
  const tDiff = (um) => um * um / (2 * DS[dk]);
  const tNerve = (um) => um / (VNERVE * 1e6) + SYN;

  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const x0 = 48, x1 = w - 12;
    /* 1) 거리–시간 (로그–로그) */
    const g0 = 24, gh = h * 0.44;
    const LX0 = -2, LX1 = 6, LT0 = -7, LT1 = 9;
    const X = (um) => x0 + (Math.log10(um) - LX0) / (LX1 - LX0) * (x1 - x0);
    const Y = (s) => g0 + gh - (Math.log10(s) - LT0) / (LT1 - LT0) * gh;
    ctx.fillStyle = C.ink2; ctx.font = `11px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("신호가 도착하는 데 걸리는 시간", x0, g0 - 8);
    ctx.font = `10px ${F.mono}`;
    [[0.01, "10nm"], [1, "1µm"], [100, "100µm"], [1e4, "1cm"], [1e6, "1m"]].forEach(([v, l]) => {
      const x = X(v); ctx.strokeStyle = C.rule; ctx.beginPath(); ctx.moveTo(x, g0); ctx.lineTo(x, g0 + gh); ctx.stroke();
      ctx.fillStyle = C.ink3; ctx.textAlign = "center"; ctx.fillText(l, x, g0 + gh + 13);
    });
    [[1e-6, "1µs"], [1e-3, "1ms"], [1, "1초"], [3600, "1시간"], [3.156e7, "1년"]].forEach(([v, l]) => {
      const y = Y(v); ctx.strokeStyle = C.rule; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
      ctx.fillStyle = C.ink3; ctx.textAlign = "right"; ctx.fillText(l, x0 - 4, y + 3);
    });
    ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.moveTo(x0, g0); ctx.lineTo(x0, g0 + gh); ctx.lineTo(x1, g0 + gh); ctx.stroke();
    ctx.save(); ctx.beginPath(); ctx.rect(x0, g0, x1 - x0, gh); ctx.clip();
    const curve = (f, col, from) => { ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath(); let st = false; for (let i = 0; i <= 200; i++) { const L = LX0 + (LX1 - LX0) * i / 200, um = 10 ** L; if (um < from) continue; const x = X(um), y = Y(f(um)); if (st) ctx.lineTo(x, y); else { ctx.moveTo(x, y); st = true; } } ctx.stroke(); ctx.lineWidth = 1; };
    curve(tDiff, "#3f6fa3", 0);
    curve(() => BLOOD, "#c0504d", 100);
    curve(tNerve, C.forest, 100);
    ctx.restore();
    ctx.font = `10px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillStyle = "#3f6fa3"; ctx.fillText("확산만", X(0.05), Y(tDiff(0.05)) + 16);
    ctx.fillStyle = "#c0504d"; ctx.fillText("혈액 순환 (≈1분)", X(1500), Y(BLOOD) - 6);
    ctx.fillStyle = C.forest; ctx.fillText("뉴런 (50 m/s)", X(3000), Y(tNerve(3000)) + 14);
    const um = 10 ** +sX.value, xm = X(um);
    ctx.strokeStyle = C.amber; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(xm, g0); ctx.lineTo(xm, g0 + gh); ctx.stroke(); ctx.setLineDash([]); ctx.lineWidth = 1;
    const ty = Math.max(g0 + 4, Math.min(g0 + gh - 4, Y(tDiff(um))));
    ctx.fillStyle = "#3f6fa3"; ctx.beginPath(); ctx.arc(xm, ty, 4, 0, Math.PI * 2); ctx.fill();
    /* 2) 분해가 있을 때 측분비 신호의 농도 분포 */
    const c0 = g0 + gh + 52, chh = h - c0 - 32;
    const lam = Math.sqrt(DS[dk] * (+sH.value * 60) / Math.LN2);
    const RMAX = 1000, r0 = 10;
    const PX = (r) => x0 + r / RMAX * (x1 - x0), CY = (c) => c0 + chh - c * chh;
    ctx.fillStyle = C.ink2; ctx.font = `11px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillText("분비 세포 둘레의 신호 물질 농도 (분비 세포 표면 = 1, 정상 상태)", x0, c0 - 8);
    ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.moveTo(x0, c0); ctx.lineTo(x0, c0 + chh); ctx.lineTo(x1, c0 + chh); ctx.stroke();
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3;
    for (let r = 0; r <= RMAX; r += 200) { ctx.textAlign = "center"; ctx.fillText(String(r), PX(r), c0 + chh + 13); }
    ctx.textAlign = "right"; ctx.fillText("분비 세포에서의 거리 (µm)", x1, c0 + chh + 26);
    /* 세포 줄 (지름 20 µm). 수용체 반응 문턱: 표면 농도의 1/100 */
    const conc = (r) => (r0 / r) * Math.exp(-(r - r0) / lam);
    const TH = 0.01;
    for (let r = 30; r < RMAX; r += 40) {
      const on = conc(r) >= TH;
      ctx.fillStyle = on ? "rgba(116,171,102,.85)" : "rgba(0,0,0,.08)";
      ctx.beginPath(); ctx.arc(PX(r), c0 + chh - 9, Math.max(3, (PX(20) - PX(0)) / 2), 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = C.warn; ctx.beginPath(); ctx.arc(PX(0) + 4, c0 + chh - 9, 5, 0, Math.PI * 2); ctx.fill();
    /* 농도 (세로는 로그: 1 ~ 10⁻⁴) */
    const LY = (c) => c0 + (-Math.log10(Math.max(c, 1e-4))) / 4 * (chh - 22);
    ctx.textAlign = "right"; ctx.fillStyle = C.ink3;
    [[1, "1"], [0.01, "0.01"], [1e-4, "10⁻⁴"]].forEach(([c, l]) => ctx.fillText(l, x0 - 4, LY(c) + 3));
    ctx.setLineDash([3, 3]); ctx.strokeStyle = C.warn; ctx.beginPath(); ctx.moveTo(x0, LY(TH)); ctx.lineTo(x1, LY(TH)); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.warn; ctx.font = `10px ${F.sans}`; ctx.textAlign = "right"; ctx.fillText("수용체가 반응하는 농도(가정)", x1, LY(TH) - 4);
    ctx.strokeStyle = "#7a5ca8"; ctx.lineWidth = 2; ctx.beginPath();
    for (let r = r0; r <= RMAX; r += 2) { const y = LY(conc(r)); if (r === r0) ctx.moveTo(PX(r), y); else ctx.lineTo(PX(r), y); }
    ctx.stroke(); ctx.lineWidth = 1;
  }
  function update() {
    root.querySelectorAll("[data-d]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.d === dk)));
    const um = 10 ** +sX.value;
    oX.textContent = fmtX(um); oH.textContent = sH.value;
    nDiff.textContent = fmtT(tDiff(um));
    nBlood.textContent = um < 100 ? "해당 없음" : `약 ${fmtT(BLOOD)}`;
    nNerve.textContent = um < 100 ? "해당 없음" : fmtT(tNerve(um));
    const lam = Math.sqrt(DS[dk] * (+sH.value * 60) / Math.LN2);
    nLam.textContent = `${lam.toFixed(0)} µm`;
    draw();
  }
  root.querySelectorAll("[data-d]").forEach((b) => b.addEventListener("click", () => { dk = b.dataset.d; update(); }));
  root.querySelectorAll("[data-x]").forEach((b) => b.addEventListener("click", () => { sX.value = Math.log10(+b.dataset.x); update(); }));
  sX.addEventListener("input", update); sH.addEventListener("input", update);
  update();
})();
