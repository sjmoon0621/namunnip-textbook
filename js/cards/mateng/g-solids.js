/* 카드: 소금, 얼음, 다이아몬드, 구리는 무엇으로 붙잡혀 있을까? — 이온·분자·공유·금속 결정과 비결정의 모식도와 성질 */
(() => {
  const root = document.getElementById("card-mateng-solids");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), nType = $(".n-type"), nMp = $(".n-mp"), nSol = $(".n-sol"), nLiq = $(".n-liq");
  const S = {
    nacl: { n: "소금 NaCl", type: "이온 결정", kind: "ion", mp: "801 °C", sol: "안 통함", liq: "통함", hard: "단단하지만 쉽게 쪼개짐" },
    ice: { n: "얼음 H₂O", type: "분자 결정", kind: "mol", mp: "0 °C", sol: "안 통함", liq: "거의 안 통함", hard: "무름 (수소 결합)" },
    dry: { n: "드라이아이스 CO₂", type: "분자 결정", kind: "mol", mp: "−78 °C (승화)", sol: "안 통함", liq: "—", hard: "무름 (분산력)" },
    dia: { n: "다이아몬드 C", type: "공유 결정", kind: "cov", mp: "약 3500 °C 이상", sol: "안 통함", liq: "—", hard: "가장 단단한 물질 중 하나" },
    quartz: { n: "석영 SiO₂", type: "공유 결정", kind: "cov", mp: "약 1710 °C", sol: "안 통함", liq: "안 통함", hard: "매우 단단함" },
    cu: { n: "구리 Cu", type: "금속 결정", kind: "met", mp: "1085 °C", sol: "잘 통함", liq: "잘 통함", hard: "펴지고 늘어남" },
    glass: { n: "유리 (주성분 SiO₂)", type: "비결정", kind: "amor", mp: "일정하지 않음 (서서히 무름)", sol: "안 통함", liq: "조금 통함", hard: "단단하지만 깨지기 쉬움" },
  };
  let s = "nacl";
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const d = S[s], cx0 = 20, cy0 = 20, gw = w * 0.55, gh = h - 40, nx = 6, ny = 4, dx = gw / nx, dy = gh / ny;
    let seed = 9; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const pos = (i, j) => d.kind === "amor" ? [cx0 + dx * (i + 0.5) + (rnd() - 0.5) * dx * 0.8, cy0 + dy * (j + 0.5) + (rnd() - 0.5) * dy * 0.8] : [cx0 + dx * (i + 0.5), cy0 + dy * (j + 0.5)];
    const P = []; for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) P.push([i, j, ...pos(i, j)]);
    if (d.kind === "met") { ctx.fillStyle = "rgba(224,160,42,.18)"; ctx.fillRect(cx0, cy0, gw, gh); ctx.fillStyle = "#e0a02a"; for (let k = 0; k < 40; k++) { ctx.beginPath(); ctx.arc(cx0 + rnd() * gw, cy0 + rnd() * gh, 2, 0, Math.PI * 2); ctx.fill(); } }
    if (d.kind === "cov" || d.kind === "amor") { ctx.strokeStyle = C.ink2; ctx.lineWidth = 2; P.forEach(([i, j, x, y]) => { P.forEach(([i2, j2, x2, y2]) => { if ((i2 === i + 1 && j2 === j) || (i2 === i && j2 === j + 1)) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x2, y2); ctx.stroke(); } }); }); }
    P.forEach(([i, j, x, y]) => {
      if (d.kind === "ion") { const plus = (i + j) % 2 === 0; ctx.fillStyle = plus ? "#8a4fb0" : "#3b7c2a"; ctx.beginPath(); ctx.arc(x, y, plus ? 10 : 15, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "#fff"; ctx.font = `600 12px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(plus ? "+" : "−", x, y + 4); }
      else if (d.kind === "mol") { ctx.fillStyle = "#3f6fa3"; ctx.beginPath(); ctx.ellipse(x, y, 16, 9, s === "ice" ? 0.5 : 0, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = "rgba(63,111,163,.35)"; ctx.setLineDash([2, 3]); ctx.lineWidth = 1; if (i < nx - 1) { ctx.beginPath(); ctx.moveTo(x + 17, y); ctx.lineTo(x + dx - 17, y); ctx.stroke(); } ctx.setLineDash([]); }
      else if (d.kind === "met") { ctx.fillStyle = "#b5532f"; ctx.beginPath(); ctx.arc(x, y, 12, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "#fff"; ctx.font = `600 11px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("+", x, y + 4); }
      else { ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fill(); }
    });
    // 오른쪽 설명
    const tx = w * 0.62; ctx.textAlign = "left"; ctx.fillStyle = C.ink; ctx.font = `600 14px ${F.sans}`; ctx.fillText(d.n, tx, 36);
    ctx.font = `12px ${F.sans}`; ctx.fillStyle = C.ink2;
    const lines = { ion: ["보라: 양이온, 초록: 음이온", "이온 결합이 모든 방향으로", "규칙적으로 되풀이"], mol: ["파란 타원: 분자 하나", "분자 안: 강한 공유 결합", "분자 사이: 약한 힘(점선)"], cov: ["점: 원자, 선: 공유 결합", "결정 전체가 공유 결합의", "그물로 이어짐"], met: ["붉은 점: 금속 양이온", "노란 점: 자유 전자", "전자가 결정 전체를 돌아다님"], amor: ["점: 원자, 선: 공유 결합", "결합은 있지만 배열이", "불규칙함 (비결정)"] }[d.kind];
    lines.forEach((l, i) => ctx.fillText(l, tx, 64 + i * 20));
    ctx.fillStyle = C.ink3; ctx.fillText(`단단함: ${d.hard}`, tx, 64 + lines.length * 20 + 12);
  }
  function update() {
    const d = S[s]; nType.textContent = d.type; nMp.textContent = d.mp; nSol.textContent = d.sol; nLiq.textContent = d.liq;
    root.querySelectorAll("[data-s]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.s === s)));
    draw();
  }
  root.querySelectorAll("[data-s]").forEach((b) => b.addEventListener("click", () => { s = b.dataset.s; update(); }));
  update();
})();
