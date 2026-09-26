/* 카드: 변성암의 줄무늬는 왜 생길까? — 방향성 압력과 판상 광물의 배열 (모식) */
(() => {
  const root = document.getElementById("card-earth-foliation");
  if (!root) return;
  const { C, F, fit, clamp } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sG = $(".grade"), sS = $(".stress"), oG = $(".grade-out"), oS = $(".stress-out");
  const nName = $(".nname"), nTex = $(".ntex"), nType = $(".ntype");
  let rock = "shale";

  let seed = 5;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const G = Array.from({ length: 900 }, () => ({ x: rnd(), y: rnd(), th: rnd() * Math.PI, mica: rnd() < 0.45, r: rnd(), s: 0.7 + 0.6 * rnd() }));

  function names() {
    const g = +sG.value, s = +sS.value;
    if (g < 0.12) return { n: { shale: "셰일", sand: "사암", lime: "석회암" }[rock], t: "퇴적암 (변성 전)", k: "—" };
    const type = s < 0.2 ? "접촉 변성 (열이 주된 원인)" : "광역 변성 (열과 방향성 압력)";
    if (rock === "sand") return { n: "규암", t: "엽리 없음 · 알갱이가 맞물림", k: type };
    if (rock === "lime") return { n: "대리암", t: "엽리 없음 · 방해석 결정이 커짐", k: type };
    if (s < 0.2) return { n: "혼펠스", t: "엽리 없음 · 치밀함", k: type };
    if (g < 0.4) return { n: "점판암", t: "쪼개짐 (얇게 쪼개짐)", k: type };
    if (g < 0.72) return { n: "편암", t: "편리 (운모가 반짝임)", k: type };
    return { n: "편마암", t: "편마 구조 (밝고 어두운 띠)", k: type };
  }

  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const g = +sG.value, s = +sS.value;
    const sq = Math.min(h - 44, w * 0.56), sx = 30, sy = 24;
    // 배경(바탕 광물)
    const bg = rock === "shale" ? [150, 150, 142] : rock === "sand" ? [222, 205, 160] : [214, 214, 206];
    ctx.fillStyle = `rgb(${bg})`; ctx.fillRect(sx, sy, sq, sq);
    ctx.save(); ctx.beginPath(); ctx.rect(sx, sy, sq, sq); ctx.clip();
    const e = 0.97 * Math.sqrt(s); // 방향성 압력에 의한 회전 정도
    const seg = rock === "shale" ? clamp((g - 0.66) / 0.25, 0, 1) * clamp(s / 0.4, 0, 1) : 0;
    const band = sq / 7;
    for (const q of G) {
      let x = sx + q.x * sq, y = sy + q.y * sq;
      if (seg > 0) {
        // 편마 구조: 어두운 광물과 밝은 광물이 띠로 모인다
        const k = (y - sy) / band, target = (Math.floor(k) + (q.mica ? 0.25 : 0.75)) * band + sy;
        y += (target - y) * seg * 0.85;
      }
      if (rock === "shale" && q.mica) {
        const c = Math.cos(q.th) * (1 + e), sn = Math.sin(q.th) * (1 - e), a = Math.atan2(sn, c);
        const L = (2.5 + 15 * g) * q.s * (sq / 300);
        ctx.strokeStyle = g > 0.4 ? (q.r < 0.5 ? "#2e2a26" : "#6d6150") : "#3a3834";
        ctx.lineWidth = Math.max(1, (0.8 + 2.2 * g) * sq / 300);
        ctx.beginPath(); ctx.moveTo(x - Math.cos(a) * L / 2, y - Math.sin(a) * L / 2); ctx.lineTo(x + Math.cos(a) * L / 2, y + Math.sin(a) * L / 2); ctx.stroke();
      } else {
        // 석영·장석·방해석처럼 둥근 알갱이
        const R = (1.2 + 5.5 * g) * q.s * (sq / 300);
        const col = rock === "shale" ? (q.r < 0.3 ? "#e9e6dc" : "#c9c7bd") : rock === "sand" ? (q.r < 0.5 ? "#f1ead6" : "#d8c9a2") : (q.r < 0.5 ? "#f4f4ef" : "#e2e1da");
        ctx.fillStyle = col;
        ctx.beginPath(); ctx.ellipse(x, y, R * (1 + 0.25 * e * (rock === "shale" ? 1 : 0.4)), R * (1 - 0.25 * e * (rock === "shale" ? 1 : 0.4)), 0, 0, Math.PI * 2); ctx.fill();
        if (g > 0.3 && rock !== "shale") { ctx.strokeStyle = "rgba(0,0,0,.12)"; ctx.lineWidth = 1; ctx.stroke(); }
      }
    }
    ctx.restore();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.strokeRect(sx + .5, sy + .5, sq, sq);
    // 압력 화살표: 사방에서 같은 압력 + 위아래로 더해지는 방향성 압력
    const base = 10, extra = 26 * s, cx = sx + sq / 2, cy = sy + sq / 2;
    const arr = (x0, y0, x1, y1, lw) => {
      ctx.strokeStyle = C.warn; ctx.fillStyle = C.warn; ctx.lineWidth = lw;
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
      const a = Math.atan2(y1 - y0, x1 - x0);
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - 7 * Math.cos(a - .5), y1 - 7 * Math.sin(a - .5)); ctx.lineTo(x1 - 7 * Math.cos(a + .5), y1 - 7 * Math.sin(a + .5)); ctx.closePath(); ctx.fill();
    };
    arr(cx, sy - 4 - base - extra * 0.6, cx, sy - 3, 1.5 + 3 * s);
    arr(cx, sy + sq + 4 + base + extra * 0.6, cx, sy + sq + 3, 1.5 + 3 * s);
    arr(sx - 4 - base - 8, cy, sx - 3, cy, 1.5);
    arr(sx + sq + 4 + base + 8, cy, sx + sq + 3, cy, 1.5);
    // 오른쪽: 셰일의 변성 계열
    const tx = sx + sq + 40, tw = w - tx - 8;
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left";
    ctx.fillText(rock === "shale" ? "셰일이 변성되는 순서" : "원래 암석 → 변성암", tx, sy + 8);
    const seq = rock === "shale" ? (s < 0.2 ? ["셰일", "혼펠스"] : ["셰일", "점판암", "편암", "편마암"]) : rock === "sand" ? ["사암", "규암"] : ["석회암", "대리암"];
    const cur = names().n;
    seq.forEach((n, i) => {
      const y = sy + 22 + i * 34;
      const on = n === cur;
      ctx.fillStyle = on ? C.ink : "#ecece5"; ctx.fillRect(tx, y, tw, 26);
      ctx.fillStyle = on ? C.paper : C.ink2; ctx.font = `600 13px ${F.sans}`;
      ctx.fillText(n, tx + 10, y + 17);
      if (i < seq.length - 1) { ctx.fillStyle = C.ink3; ctx.font = `11px ${F.sans}`; ctx.fillText("↓", tx + tw / 2, y + 31); }
    });
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3;
    ctx.fillText("모식 · 확대 단면", sx, h - 6);
  }

  function update() {
    const g = +sG.value, s = +sS.value;
    oG.textContent = g < 0.12 ? "거의 없음" : g < 0.4 ? "낮음" : g < 0.72 ? "중간" : "높음";
    oS.textContent = s < 0.2 ? "사방에서 거의 같음" : s < 0.6 ? "위아래로 더 셈" : "위아래로 훨씬 셈";
    const N = names(); nName.textContent = N.n; nTex.textContent = N.t; nType.textContent = N.k;
    draw();
  }
  root.querySelectorAll("[data-rock]").forEach((b) => b.addEventListener("click", () => {
    rock = b.dataset.rock; root.querySelectorAll("[data-rock]").forEach((q) => q.setAttribute("aria-pressed", q === b ? "true" : "false")); update();
  }));
  [sG, sS].forEach((x) => x.addEventListener("input", update));
  update();
})();
