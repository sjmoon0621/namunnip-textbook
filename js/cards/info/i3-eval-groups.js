/* 카드: 정확도 95 %인 프로그램은 모두에게 잘 동작할까? — 집단별 정확도와 평가 자료 구성 (모식) */
(() => {
  const root = document.getElementById("card-info-eval-groups");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const sTr = $(".tr"), sTe = $(".te");
  const BLUE = "#3f74b5";
  /* 모식: 학습 자료 비율 p(0~0.5)에 따른 정확도. B는 자료가 늘수록 빠르게 좋아지고, A는 조금 낮아진다 */
  const accA = (p) => 0.97 - 0.03 * p;
  const accB = (p) => 0.55 + 0.38 * (1 - Math.exp(-p / 0.12));

  const cv = fit($("canvas"), () => draw());
  let st = null;

  function update() {
    const p = +sTr.value / 100, q = +sTe.value / 100;
    $(".tr-out").textContent = sTr.value; $(".te-out").textContent = sTe.value;
    const nB = Math.round(100 * q), nA = 100 - nB;
    const a = accA(p), b = accB(p);
    const eA = Math.round(nA * (1 - a)), eB = Math.round(nB * (1 - b));
    const all = (nA - eA + nB - eB) / 100;
    /* 화면의 정확도는 평가 자료 100건에서 실제로 센 값 */
    st = { nA, nB, eA, eB, a: nA ? (nA - eA) / nA : NaN, b: nB ? (nB - eB) / nB : NaN, all };
    const pc = (v) => Number.isFinite(v) ? (v * 100).toFixed(1) + " %" : "자료 없음";
    $(".n-all").textContent = pc(all);
    $(".n-a").textContent = pc(st.a);
    $(".n-b").textContent = pc(st.b);
    $(".n-b").className = "n-b" + (st.b < 0.8 ? " bad" : "");
    draw();
  }

  function draw() {
    const { ctx } = cv, { w, h } = cv.size; if (!w || !st) return;
    ctx.clearRect(0, 0, w, h);
    // 왼쪽: 평가 자료 100건
    const gw = Math.min(w * 0.5, h - 40), cell = gw / 10, gx = 8, gy = 26;
    ctx.font = `11px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.textAlign = "left";
    ctx.fillText("평가 자료 100건 (× = 인식 실패)", gx, 15);
    const errIdxA = new Set(), errIdxB = new Set();
    for (let k = 0; k < st.eA; k++) errIdxA.add(Math.floor((k + 0.5) * st.nA / Math.max(st.eA, 1)));
    for (let k = 0; k < st.eB; k++) errIdxB.add(Math.floor((k + 0.5) * st.nB / Math.max(st.eB, 1)));
    for (let i = 0; i < 100; i++) {
      const isB = i >= st.nA, j = isB ? i - st.nA : i, err = isB ? errIdxB.has(j) : errIdxA.has(j);
      const x = gx + (i % 10) * cell + cell / 2, y = gy + Math.floor(i / 10) * cell + cell / 2, r = cell * 0.36;
      ctx.fillStyle = isB ? C.amber : BLUE; ctx.globalAlpha = err ? 0.25 : 0.9;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
      if (err) {
        ctx.strokeStyle = C.warn; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(x - r * .7, y - r * .7); ctx.lineTo(x + r * .7, y + r * .7); ctx.moveTo(x + r * .7, y - r * .7); ctx.lineTo(x - r * .7, y + r * .7); ctx.stroke();
      }
    }
    // 오른쪽: 막대
    const bx = gx + gw + 30, bw = w - bx - 24, bars = [["전체", st.all, C.ink2], ["A 집단", st.a, BLUE], ["B 집단", st.b, C.amber]];
    const top = 40, bh = Math.min(30, (h - top - 40) / 3 - 14);
    ctx.font = `11px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.fillText("정확도 (가로축은 50 %부터)", bx, 15);
    const X = (v) => bx + (v - 0.5) / 0.5 * bw;
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.font = `10px ${F.mono}`; ctx.textAlign = "center"; ctx.fillStyle = C.ink3;
    for (const v of [0.5, 0.75, 1]) { const x = Math.round(X(v)) + .5; ctx.beginPath(); ctx.moveTo(x, top - 6); ctx.lineTo(x, h - 26); ctx.stroke(); ctx.fillText(Math.round(v * 100) + "%", x, h - 12); }
    bars.forEach(([lab, v, col], i) => {
      const y = top + i * (bh + 26);
      ctx.fillStyle = C.ink2; ctx.textAlign = "left"; ctx.font = `11px ${F.sans}`;
      ctx.fillText(lab + (i === 1 ? ` (${st.nA}건)` : i === 2 ? ` (${st.nB}건)` : ""), bx, y + 2);
      if (!Number.isFinite(v)) return;
      ctx.fillStyle = col; ctx.fillRect(bx, y + 7, Math.max(0, X(v) - bx), bh);
      ctx.fillStyle = C.ink; ctx.font = `600 11px ${F.mono}`; ctx.textAlign = "right";
      ctx.fillText((v * 100).toFixed(1) + "%", Math.max(X(v) - 4, bx + 44), y + 7 + bh / 2 + 4);
    });
    ctx.textAlign = "left";
  }

  [sTr, sTe].forEach((s) => s.addEventListener("input", update));
  update();
})();
