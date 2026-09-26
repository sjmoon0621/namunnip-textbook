/* 카드: DNA의 정보는 어떻게 단백질이 될까? — 전사와 번역을 한 단계씩 (사람 β-글로빈 유전자 앞부분) */
(() => {
  const root = document.getElementById("card-is1-dogma");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const sP = $(".prog"), bStep = $(".step1"), bBack = $(".step0");
  const nStage = $(".d-stage"), nRna = $(".d-rna"), nAa = $(".d-aa"), nNow = $(".d-now");

  // 코딩 가닥 (5'→3'): ATG GTG CAT CTG ACT CCT GAG — HBB 첫 7개 코돈
  const CODING = "ATGGTGCATCTGACTCCTGAG";
  const COMP = { A: "T", T: "A", G: "C", C: "G" };
  const RNA_OF_TEMPLATE = { A: "U", T: "A", G: "C", C: "G" };
  const TEMPLATE = [...CODING].map((b) => COMP[b]).join(""); // 3'→5' 방향으로 나란히
  const B4 = "UCAG", AA = "FFLLSSSSYY**CC*WLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG";
  const NAME = { M: ["Met", "메싸이오닌"], V: ["Val", "발린"], H: ["His", "히스티딘"], L: ["Leu", "류신"], T: ["Thr", "트레오닌"], P: ["Pro", "프롤린"], E: ["Glu", "글루탐산"] };
  const tr = (c) => AA[B4.indexOf(c[0]) * 16 + B4.indexOf(c[1]) * 4 + B4.indexOf(c[2])];
  const NB = CODING.length, NC = NB / 3, STEPS = NB + NC;
  const BCOL = { A: "#74ab66", T: "#d4493a", U: "#d4493a", G: "#e0a02a", C: "#4f7fa8" };

  const { ctx, size } = fit(cv, () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const k = +sP.value;
    const nR = Math.min(k, NB), nA = Math.max(0, k - NB);
    const x0 = 34, bw = (w - x0 - 30) / NB;
    const yC = h * 0.12, yT = yC + Math.max(20, bw * 1.25), yR = h * 0.52, yP = h * 0.82;
    const fs = Math.max(9, Math.min(13, bw * 0.72));
    const base = (b, x, y, dim) => {
      ctx.fillStyle = dim ? "#e6e6e0" : BCOL[b]; ctx.fillRect(x + 1, y - bw * 0.55, bw - 2, bw * 1.1);
      ctx.fillStyle = dim ? C.ink3 : "#fff"; ctx.font = `600 ${fs}px ${F.mono}`; ctx.textAlign = "center";
      ctx.fillText(b, x + bw / 2, y + fs * 0.36); ctx.textAlign = "left";
    };
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3;
    ctx.fillText("5′", 8, yC + 4); ctx.fillText("3′", 8, yT + 4);
    ctx.fillText("3′", w - 24, yC + 4); ctx.fillText("5′", w - 24, yT + 4);
    for (let i = 0; i < NB; i++) {
      const x = x0 + i * bw;
      base(CODING[i], x, yC, k <= NB);   // 전사 중에는 코딩 가닥을 흐리게
      base(TEMPLATE[i], x, yT, false);
    }
    ctx.font = `600 11px ${F.sans}`; ctx.fillStyle = C.ink2;
    ctx.fillText("DNA 코딩 가닥", x0, yC - bw * 0.7 - 4);
    ctx.fillText("DNA 주형 가닥 (이 가닥을 읽어 mRNA를 만든다)", x0, yT + bw * 0.55 + 14);
    // 전사: RNA 중합 효소
    if (k > 0 && k <= NB) {
      const x = x0 + (k - 0.5) * bw;
      ctx.fillStyle = "rgba(143,107,176,.25)"; ctx.beginPath(); ctx.ellipse(x, (yT + yR) / 2, bw * 2.2, (yR - yT) / 2 + bw * 0.7, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#6f4f90"; ctx.font = `10px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("RNA 중합 효소", x, (yT + yR) / 2 + 4); ctx.textAlign = "left";
      ctx.strokeStyle = "#6f4f90"; ctx.setLineDash([2, 2]);
      ctx.beginPath(); ctx.moveTo(x, yT + bw * 0.6); ctx.lineTo(x, yR - bw * 0.6); ctx.stroke(); ctx.setLineDash([]);
    }
    // mRNA
    for (let i = 0; i < nR; i++) base(RNA_OF_TEMPLATE[TEMPLATE[i]], x0 + i * bw, yR, false);
    if (nR) {
      ctx.font = `600 11px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.fillText("mRNA", 8, yR - bw * 0.7 - 4);
      ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.fillText("5′", 8, yR + 4);
      for (let c = 0; c < Math.floor(nR / 3); c++) {
        ctx.strokeStyle = C.ink3; ctx.lineWidth = 1;
        const xa = x0 + c * 3 * bw + 2, xb = x0 + (c + 1) * 3 * bw - 2, yb = yR + bw * 0.7;
        ctx.beginPath(); ctx.moveTo(xa, yb); ctx.lineTo(xa, yb + 4); ctx.lineTo(xb, yb + 4); ctx.lineTo(xb, yb); ctx.stroke();
      }
    }
    // 번역: 리보솜과 아미노산 사슬
    if (nA > 0) {
      const c = nA - 1, x = x0 + c * 3 * bw;
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2;
      ctx.strokeRect(x - 2, yR - bw * 0.9, 3 * bw + 4, bw * 1.8);
      ctx.fillStyle = "rgba(35,35,38,.07)"; ctx.fillRect(x - bw * 1.5, yR - bw * 1.6, 6 * bw, bw * 3.2);
      ctx.font = `10px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.textAlign = "center";
      ctx.fillText("리보솜", x + 1.5 * bw, yR - bw * 1.6 - 4); ctx.textAlign = "left";
    }
    const r = Math.min(bw * 1.35, (yP - yR) * 0.3);
    for (let c = 0; c < nA; c++) {
      const cx = x0 + (c * 3 + 1.5) * bw;
      if (c) { ctx.strokeStyle = C.ink2; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx - 3 * bw + r, yP); ctx.lineTo(cx - r, yP); ctx.stroke(); }
      ctx.beginPath(); ctx.arc(cx, yP, r, 0, Math.PI * 2); ctx.fillStyle = "#e2efdc"; ctx.fill();
      ctx.strokeStyle = C.forest; ctx.lineWidth = 1.5; ctx.stroke();
      const a = tr(RNA_OF_TEMPLATE_STR.slice(c * 3, c * 3 + 3));
      ctx.fillStyle = C.ink; ctx.font = `600 ${Math.max(9, Math.min(12, r * 0.62))}px ${F.mono}`; ctx.textAlign = "center";
      ctx.fillText(NAME[a][0], cx, yP + 4); ctx.textAlign = "left";
      ctx.strokeStyle = "rgba(59,124,42,.35)"; ctx.setLineDash([2, 3]); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(cx, yR + bw * 0.9); ctx.lineTo(cx, yP - r); ctx.stroke(); ctx.setLineDash([]);
    }
    if (nA) { ctx.font = `600 11px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.fillText("단백질", 8, yP - r - 6); }
  }
  const RNA_OF_TEMPLATE_STR = [...TEMPLATE].map((b) => RNA_OF_TEMPLATE[b]).join("");

  function update() {
    const k = +sP.value, nR = Math.min(k, NB), nA = Math.max(0, k - NB);
    nStage.textContent = k === 0 ? "시작 전" : k <= NB ? "전사 (핵 안)" : k < STEPS ? "번역 (세포질)" : "번역 끝";
    nRna.textContent = `${nR} / ${NB}`;
    nAa.textContent = `${nA} / ${NC}`;
    if (k === 0) nNow.textContent = "—";
    else if (k <= NB) { const t = TEMPLATE[k - 1]; nNow.textContent = `주형 ${t} → ${RNA_OF_TEMPLATE[t]}`; }
    else { const cod = RNA_OF_TEMPLATE_STR.slice((nA - 1) * 3, nA * 3), a = tr(cod); nNow.textContent = `${cod} → ${NAME[a][1]}`; }
    bBack.disabled = k === 0; bStep.disabled = k === STEPS;
    draw();
  }
  sP.max = STEPS;
  sP.addEventListener("input", update);
  bStep.addEventListener("click", () => { sP.value = Math.min(STEPS, +sP.value + (+sP.value < NB ? 3 : 1)); update(); });
  bBack.addEventListener("click", () => { sP.value = 0; update(); });
  update();
})();
