/* 카드: 물 한 컵을 계속 반으로 나누면 몇 번 만에 분자 하나가 될까? */
(() => {
  const root = document.getElementById("card-chem-cup");
  if (!root) return;
  const { C, F, fit, clamp } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const sK = $(".k"), oK = $(".k-out");
  const dV = $(".v-vol"), dN = $(".v-num"), dMol = $(".v-mol"), msg = $(".cup-msg");

  const NA = 6.02214076e23, M = 18.015, V0 = 200;          // mL, 물 1.00 g/mL로 어림
  const mol0 = V0 * 1.0 / M, N0 = mol0 * NA;                 // 11.1 mol, 6.69×10²⁴개
  const vMol = M / NA * 1e-6;                                // 분자 하나의 몫 (m³) ≈ 3.0×10⁻²⁹
  // 비교 대상: 부피가 비슷해지는 곳 (크기는 대표값)
  const MARKS = [
    { name: "물 한 방울", sh: "한 방울", note: "약 0.05 mL", v: 5e-8, d: 4.6e-3 },
    { name: "가는 모래알", sh: "모래알", note: "지름 약 0.2 mm", v: 4.2e-12, d: 2e-4 },
    { name: "적혈구", sh: "적혈구", note: "부피 약 90 fL", v: 9e-17, d: 8e-6, disc: true },
    { name: "대장균", sh: "대장균", note: "부피 약 1 fL", v: 1e-18, d: 2e-6, rod: true },
    { name: "바이러스", sh: "바이러스", note: "지름 약 100 nm", v: 5.2e-22, d: 1e-7 },
    { name: "단백질 분자", sh: "단백질", note: "지름 약 5 nm", v: 6.5e-26, d: 5e-9 },
  ];
  MARKS.forEach((m) => { m.k = Math.log2(V0 * 1e-6 / m.v); });

  const SUP = "⁰¹²³⁴⁵⁶⁷⁸⁹";
  const sup = (n) => (n < 0 ? "⁻" : "") + String(Math.abs(n)).split("").map((d) => SUP[+d]).join("");
  const sci = (x) => { const e = Math.floor(Math.log10(x)); const m = x / 10 ** e; return e >= -2 && e <= 3 ? x.toPrecision(3) : `${m.toFixed(2)}×10${sup(e)}`; };
  const len = (m) => {
    const u = [[1e-2, "cm"], [1e-3, "mm"], [1e-6, "μm"], [1e-9, "nm"]];
    for (const [s, n] of u) if (m >= s) { const v = m / s; return `${v < 10 ? v.toFixed(2) : v < 100 ? v.toFixed(1) : v.toFixed(0)} ${n}`; }
    return `${(m / 1e-9).toFixed(2)} nm`;
  };
  const vol = (mL) => {
    if (mL >= 0.1) return `${mL < 10 ? mL.toFixed(2) : mL.toFixed(1)} mL`;
    const L = mL * 1e-3, u = [[1e-6, "μL"], [1e-9, "nL"], [1e-12, "pL"], [1e-15, "fL"], [1e-18, "aL"], [1e-21, "zL"], [1e-24, "yL"]];
    for (const [s, n] of u) if (L >= s) return `${(L / s).toPrecision(3)} ${n}`;
    return `${sci(mL)} mL`;
  };

  const { ctx, size } = fit(cv, () => draw());

  function water(x, y, s, a) { // 작은 물 분자 모식: O 하나, H 둘 (104.5°)
    ctx.save(); ctx.translate(x, y); ctx.rotate(a);
    const r = s * 0.5, rh = s * 0.3, b = s * 0.52;
    for (const t of [-52.25, 52.25]) {
      const q = (t + 90) * Math.PI / 180;
      ctx.beginPath(); ctx.arc(Math.cos(q) * b, Math.sin(q) * b, rh, 0, Math.PI * 2);
      ctx.fillStyle = "#f4f4f0"; ctx.fill(); ctx.strokeStyle = C.ink3; ctx.lineWidth = 0.8; ctx.stroke();
    }
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fillStyle = C.apple; ctx.fill();
    ctx.restore();
  }
  let seed = 1;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const k = +sK.value;
    const Vm3 = V0 * 1e-6 / 2 ** k, L = Math.cbrt(Vm3), N = N0 / 2 ** k;
    const small = w < 520;

    // ── 위: 지금 남은 물 (정육면체로 모은 모습) + 같은 배율의 비교 대상
    const box = Math.min(h * 0.36, w * 0.24), bx = small ? 22 : 40, by = 30;
    ctx.font = `${small ? 10.5 : 11.5}px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left";
    ctx.fillText(k === 0 ? "처음: 물 200 mL를 정육면체로 모으면" : `${k}번 나눈 뒤 남은 물`, bx, by - 12);
    if (N >= 1) {
      const dep = box * 0.28;
      ctx.fillStyle = "rgba(63,111,181,.10)"; ctx.strokeStyle = "#3f6fb5"; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(bx, by + dep); ctx.lineTo(bx + dep, by); ctx.lineTo(bx + box + dep, by); ctx.lineTo(bx + box + dep, by + box); ctx.lineTo(bx + box, by + box + dep); ctx.lineTo(bx, by + box + dep); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(bx, by + dep); ctx.lineTo(bx + box, by + dep); ctx.lineTo(bx + box + dep, by); ctx.moveTo(bx + box, by + dep); ctx.lineTo(bx + box, by + box + dep); ctx.stroke();
      // 분자가 셀 만큼 적으면 하나하나 그린다
      if (N <= 120) {
        seed = 7;
        const n = Math.max(1, Math.round(N)), s = clamp(box * Math.cbrt(vMol) / L * 0.9, 6, 34);
        for (let i = 0; i < n; i++) {
          const px = bx + s * 0.8 + rnd() * (box - s * 1.6) + rnd() * dep * 0.6;
          const py = by + dep + s * 0.8 + rnd() * (box - s * 1.6) - rnd() * dep * 0.4;
          water(n === 1 ? bx + box / 2 + dep / 2 : px, n === 1 ? by + box / 2 + dep / 2 : py, s, rnd() * 6.28);
        }
      } else {
        ctx.fillStyle = "rgba(63,111,181,.18)"; ctx.fillRect(bx, by + dep, box, box);
      }
      ctx.fillStyle = C.ink; ctx.textAlign = "center"; ctx.font = `500 ${small ? 11 : 12.5}px ${F.mono}`;
      ctx.fillText(`한 변 ${len(L)}`, bx + box / 2, by + box + dep + 18);
      // 같은 배율로 그린 비교 대상 (크기가 비슷할 때만)
      const near = MARKS.map((m) => ({ m, r: m.d / L })).filter((o) => o.r > 0.12 && o.r < 2.2).sort((a, b) => Math.abs(Math.log(a.r)) - Math.abs(Math.log(b.r)))[0];
      if (near) {
        const cx = bx + box + dep + (small ? 50 : 80), cy = by + box / 2 + dep / 2, R = near.r * box / 2;
        ctx.fillStyle = "rgba(181,83,47,.14)"; ctx.strokeStyle = C.warn; ctx.lineWidth = 1.2;
        ctx.beginPath();
        if (near.m.rod) ctx.roundRect ? ctx.roundRect(cx - R, cy - R * 0.25, 2 * R, R * 0.5, R * 0.25) : ctx.rect(cx - R, cy - R * 0.25, 2 * R, R * 0.5);
        else if (near.m.disc) ctx.ellipse(cx, cy, R, R * 0.3, 0, 0, Math.PI * 2);
        else ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = C.warn; ctx.font = `${small ? 10 : 11}px ${F.sans}`; ctx.textAlign = "center";
        ctx.fillText(near.m.name, cx, cy + Math.max(R, 10) + 16);
        ctx.fillStyle = C.ink3; ctx.font = `${small ? 9.5 : 10.5}px ${F.mono}`;
        ctx.fillText("같은 배율", cx, cy + Math.max(R, 10) + 30);
      }
    } else {
      ctx.fillStyle = C.warn; ctx.font = `${small ? 12 : 14}px ${F.sans}`; ctx.textAlign = "left";
      ctx.fillText("분자 하나를 반으로 나누면 더는 물이 아닙니다.", bx, by + box / 2);
      ctx.fillStyle = C.ink3; ctx.font = `${small ? 10.5 : 12}px ${F.sans}`;
      ctx.fillText("수소 원자와 산소 원자로 흩어질 뿐입니다.", bx, by + box / 2 + 22);
    }

    // ── 아래: 나눈 횟수 축과 비교 대상의 자리
    const ax0 = small ? 16 : 30, ax1 = w - (small ? 16 : 30), ay = h - (small ? 34 : 40);
    const X = (kk) => ax0 + kk / 84 * (ax1 - ax0);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(ax0, ay); ctx.lineTo(ax1, ay); ctx.stroke();
    ctx.font = `${small ? 9.5 : 10.5}px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "center";
    for (let t = 0; t <= 80; t += small ? 20 : 10) { ctx.beginPath(); ctx.moveTo(X(t), ay - 3); ctx.lineTo(X(t), ay + 3); ctx.strokeStyle = C.ink3; ctx.stroke(); ctx.fillText(t, X(t), ay + 15); }
    ctx.textAlign = "right"; ctx.fillText("나눈 횟수", ax1, ay + 28);
    const kMol = Math.log2(N0);
    MARKS.concat([{ name: "물 분자 1개", sh: "분자 1개", k: kMol, mol: true }]).forEach((m, i) => {
      const x = X(m.k), up = i % 2 ? 26 : 12;
      ctx.strokeStyle = m.mol ? C.forest : C.ink3; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x, ay); ctx.lineTo(x, ay - up + 2); ctx.stroke();
      ctx.fillStyle = m.mol ? C.forest : C.ink2; ctx.textAlign = "center";
      ctx.font = `${small ? 9 : 10.5}px ${F.sans}`;
      ctx.fillText(small ? m.sh : m.name, clamp(x, ax0 + 20, ax1 - 30), ay - up - 3);
    });
    ctx.beginPath(); ctx.arc(X(k), ay, 5.5, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill();
  }

  function update() {
    const k = +sK.value, N = N0 / 2 ** k;
    oK.textContent = k;
    dV.textContent = N >= 1 ? vol(V0 / 2 ** k) : "—";
    dN.textContent = N >= 1 ? (N < 1000 ? `${Math.round(N)}` : sci(N)) : "0.7개?";
    dMol.textContent = N >= 1 ? `${sci(mol0 / 2 ** k)} mol` : "—";
    dN.classList.toggle("bad", N < 1);
    const m = MARKS.filter((q) => k >= q.k - 0.5).pop();
    msg.textContent = N < 1 ? "82번쯤에서 분자 하나가 남고, 그 다음은 나눌 수 없습니다."
      : k === 0 ? `200 g ÷ 18.0 g/mol = ${mol0.toFixed(1)} mol. 여기에 6.02×10²³을 곱하면 분자 수입니다.`
      : m ? `남은 물이 ${m.name} 크기(${m.note})까지 작아졌습니다.` : "아직 눈에 보이는 양입니다.";
    draw();
  }
  sK.addEventListener("input", update);
  root.querySelectorAll("[data-k]").forEach((b) => b.addEventListener("click", () => { sK.value = b.dataset.k; update(); }));
  update();
})();
