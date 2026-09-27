/* 카드: 별의 밝기가 변하는 모양으로 무엇을 알 수 있을까? — 광도 곡선, 세페이드 P–L, Ia 표준 촛불 */
(() => {
  const root = document.getElementById("card-space-variables");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sP = $(".p"), oP = $(".p-out"), sM = $(".m"), oM = $(".m-out"), nK = $(".n-k"), nMM = $(".n-M"), nD = $(".n-d");
  let v = "ceph";
  const K = {
    ceph: ["맥동 변광성 · 별이 팽창과 수축을 되풀이", "주기"], rr: ["맥동 변광성 · 늙은 저질량 별의 맥동 (주기 약 0.5일)", "rr"],
    ecl: ["식쌍성 · 두 별이 서로를 가림 (별 자체는 변하지 않음)", "ecl"], nova: ["폭발 변광성 · 백색 왜성 표면의 수소 폭발 (되풀이될 수 있음)", "nova"],
    sn1a: ["폭발 변광성 · 한계 질량에 이른 백색 왜성의 폭발", "sn"], sn2: ["폭발 변광성 · 무거운 별의 중심핵 붕괴", "sn2"],
  };
  const Mabs = () => v === "ceph" ? -2.43 * (+sP.value - 1) - 4.05 : v === "rr" ? 0.6 : v === "sn1a" ? -19.3 : null;
  function curve(t) { // t: 0..1 (그래프 범위), 반환 등급 변화(+는 어두움)
    if (v === "ceph" || v === "rr") { const ph = (t * 3) % 1; return ph < 0.15 ? 0.8 * (1 - ph / 0.15) : 0.8 * (ph - 0.15) / 0.85; }
    if (v === "ecl") { const ph = (t * 2.5) % 1, d1 = Math.abs(ph - 0.2), d2 = Math.abs(ph - 0.7); return (d1 < 0.04 ? 1.2 * Math.min(1, (0.04 - d1) / 0.015) : 0) + (d2 < 0.04 ? 0.25 * Math.min(1, (0.04 - d2) / 0.015) : 0); }
    if (v === "nova") { if (t < 0.1) return 11; const u = t - 0.1; return u < 0.02 ? 11 - 11 * u / 0.02 : Math.min(11, 11 * (1 - Math.exp(-(u - 0.02) * 6))); }
    if (v === "sn1a") { if (t < 0.1) return 8; const u = (t - 0.1) * 200; return u < 18 ? 8 * (1 - u / 18) ** 2 : Math.min(8, 3 * (1 - Math.exp(-(u - 18) / 20)) + 0.02 * (u - 18)); }
    if (t < 0.1) return 8; const u = (t - 0.1) * 250; return u < 12 ? 8 * (1 - u / 12) ** 2 : u < 110 ? 0.5 + 0.004 * (u - 12) : Math.min(8, 0.9 + (u - 110) * 0.08);
  }
  const span = () => v === "ceph" ? 3 * 10 ** +sP.value : v === "rr" ? 1.5 : v === "ecl" ? 2.5 * 2.87 : v === "nova" ? 1 / 0.9 * 60 : v === "sn1a" ? 200 : 250;
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const x0 = 44, x1 = w - 12, y0 = h - 26, y1 = 14, maxd = v === "nova" ? 12 : v === "sn1a" || v === "sn2" ? 9 : 1.4, Y = (d) => y1 + d / maxd * (y0 - y1);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, y1); ctx.lineTo(x0, y0); ctx.lineTo(x1, y0); ctx.stroke();
    ctx.strokeStyle = "#3f6fa3"; ctx.lineWidth = 2.2; ctx.beginPath(); for (let i = 0; i <= 400; i++) { const t = i / 400, y = Y(curve(t)); i ? ctx.lineTo(x0 + t * (x1 - x0), y) : ctx.moveTo(x0, y); } ctx.stroke();
    ctx.fillStyle = C.ink3; ctx.font = `9.5px ${F.sans}`; ctx.textAlign = "right"; ctx.fillText("밝음", x0 - 4, y1 + 8); ctx.fillText("어두움", x0 - 4, y0); ctx.save(); ctx.translate(12, (y0 + y1) / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = "center"; ctx.fillText(`등급 변화 (눈금 ${maxd >= 5 ? "넓게" : "좁게"})`, 0, 0); ctx.restore();
    const sp = span(); ctx.textAlign = "center"; ctx.font = `9.5px ${F.mono}`; [0, 0.25, 0.5, 0.75, 1].forEach((f) => ctx.fillText(`${(f * sp).toFixed(sp < 5 ? 1 : 0)}`, x0 + f * (x1 - x0), y0 + 12)); ctx.textAlign = "right"; ctx.fillText("일", x1, y0 - 4);
    ctx.textAlign = "left"; ctx.font = `600 11px ${F.sans}`; ctx.fillStyle = C.ink; ctx.fillText({ ceph: "세페이드: 빠르게 밝아지고 천천히 어두워지는 톱니 모양", rr: "거문고자리 RR형: 짧은 주기의 톱니 모양", ecl: "식쌍성: 가려질 때만 평평하게 어두워짐 (주식·부식)", nova: "신성: 며칠 만에 수만 배 밝아졌다 서서히 어두워짐", sn1a: "Ia형: 최대 밝기가 거의 일정, 매끈하게 감소", sn2: "II형: 최대 뒤 밝기가 한동안 유지되는 평탄부" }[v], x0 + 6, y1 + 6);
  }
  function update() {
    root.querySelectorAll("[data-v]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.v === v)));
    root.querySelectorAll(".x-p").forEach((e) => (e.hidden = v !== "ceph")); root.querySelectorAll(".x-m").forEach((e) => (e.hidden = Mabs() === null));
    oP.textContent = (10 ** +sP.value).toFixed(1); oM.textContent = (+sM.value).toFixed(1);
    nK.textContent = K[v][0]; const M = Mabs();
    if (M === null) { nMM.textContent = v === "ecl" ? "— (쌍성의 질량·크기 연구에 쓰임)" : "— (최대 밝기가 일정하지 않음)"; nD.textContent = "—"; }
    else { const d = 10 ** ((+sM.value - M + 5) / 5); nMM.textContent = M.toFixed(2); nD.textContent = d < 1e3 ? `${Math.round(d)} pc` : d < 1e6 ? `${(d / 1000).toFixed(1)} kpc (${(d * 3.26 / 1000).toFixed(0)}천 광년)` : `${(d / 1e6).toFixed(1)} Mpc (${(d * 3.26 / 1e9).toFixed(2)}억 광년)`.replace(/\((\d+\.\d+)억/, (m, x) => `(${(x * 10).toFixed(1)}억`); }
    draw();
  }
  root.querySelectorAll("[data-v]").forEach((b) => b.addEventListener("click", () => { v = b.dataset.v; update(); }));
  sP.addEventListener("input", update); sM.addEventListener("input", update); update();
})();
