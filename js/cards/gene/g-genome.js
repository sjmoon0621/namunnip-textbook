/* 카드: 사람의 DNA 가운데 유전자는 얼마나 될까? — 오페론 vs 인트론·엑손 구조, 유전체 구성 비율 */
(() => {
  const root = document.getElementById("card-gene-genome");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), nS = $(".n-s"), nG = $(".n-g"), nC = $(".n-c"), nK = $(".n-k");
  // [크기, 유전자 수, 구성: [이름, 비율, 색]...]
  const O = {
    eco: ["약 460만 염기쌍", "약 4,300개", [["단백질 암호", 0.88, "#3f6fa3"], ["조절·RNA 유전자 등", 0.12, "#c9cdd2"]], "원형 염색체 1개 (+ 플라스미드)"],
    yeast: ["약 1,200만 염기쌍", "약 6,000개", [["단백질 암호", 0.7, "#3f6fa3"], ["인트론", 0.01, "#e0a02a"], ["조절 부위·기타", 0.29, "#c9cdd2"]], "선형 염색체 16개 (반수체)"],
    human: ["약 31억 염기쌍", "약 20,000개", [["단백질 암호 (엑손)", 0.015, "#3f6fa3"], ["인트론", 0.25, "#e0a02a"], ["반복 서열 (전이 인자 등)", 0.5, "#b5532f"], ["조절 부위·기타", 0.235, "#c9cdd2"]], "선형 염색체 23쌍 (46개)"],
  };
  let o = "eco";
  const { ctx, size } = fit(cv, () => draw());
  function box(x, y, w, h, col, t, tc) { ctx.fillStyle = col; ctx.fillRect(x, y, w, h); if (t) { ctx.fillStyle = tc || "#fff"; ctx.font = `600 10px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(t, x + w / 2, y + h / 2 + 3.5); } }
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const x0 = 14, x1 = w - 14, y = 40, bh = 20, L = x1 - x0;
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0, y + bh / 2); ctx.lineTo(x1, y + bh / 2); ctx.stroke();
    ctx.fillStyle = C.ink; ctx.font = `600 11px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText(o === "eco" ? "원핵생물의 유전자 (오페론)" : "진핵생물의 유전자", x0, 18);
    const lab = (t, xx, yy) => { ctx.fillStyle = C.ink2; ctx.font = `9.5px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(t, xx, yy); };
    if (o === "eco") {
      box(x0 + L * 0.05, y, L * 0.08, bh, "#8a4fb5"); lab("프로모터", x0 + L * 0.09, y + bh + 12); box(x0 + L * 0.14, y, L * 0.05, bh, "#3b7c2a"); lab("작동 부위", x0 + L * 0.165, y - 4);
      ["유전자 A", "유전자 B", "유전자 C"].forEach((t, i) => box(x0 + L * (0.21 + i * 0.22), y, L * 0.2, bh, "#3f6fa3", t)); box(x0 + L * 0.87, y, L * 0.04, bh, "#555"); lab("종결", x0 + L * 0.89, y + bh + 12);
      // mRNA와 단백질
      const my = y + 58; ctx.strokeStyle = C.warn; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x0 + L * 0.21, my); ctx.lineTo(x0 + L * 0.86, my); ctx.stroke(); lab("mRNA 하나 (여러 유전자를 한꺼번에 전사)", x0 + L * 0.53, my - 6);
      ["A", "B", "C"].forEach((t, i) => { const cx = x0 + L * (0.31 + i * 0.22); ctx.fillStyle = C.forest; ctx.beginPath(); ctx.arc(cx, my + 26, 9, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "#fff"; ctx.font = `600 9px ${F.sans}`; ctx.fillText(t, cx, my + 29); }); lab("단백질 A, B, C", x0 + L * 0.53, my + 50);
    } else {
      box(x0 + L * 0.02, y, L * 0.06, bh, "#b8a2d1"); lab("인핸서", x0 + L * 0.05, y + bh + 12); box(x0 + L * 0.14, y, L * 0.07, bh, "#8a4fb5"); lab("프로모터", x0 + L * 0.175, y + bh + 12);
      const ex = [[0.23, 0.1], [0.43, 0.08], [0.63, 0.08], [0.8, 0.09]]; const intr = o === "human";
      ex.forEach(([s, l], i) => box(x0 + L * s, y, L * l, bh, "#3f6fa3", `엑손 ${i + 1}`)); for (let i = 0; i < 3; i++) { const s = ex[i][0] + ex[i][1], e = ex[i + 1][0]; box(x0 + L * s, y + 4, L * (e - s), bh - 8, "#e0a02a"); } lab("인트론", x0 + L * 0.38, y - 4);
      box(x0 + L * 0.92, y, L * 0.04, bh, "#555"); lab("종결", x0 + L * 0.94, y + bh + 12);
      const my = y + 58; ctx.strokeStyle = C.warn; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x0 + L * 0.3, my); ctx.lineTo(x0 + L * 0.66, my); ctx.stroke(); ctx.fillStyle = C.warn; ctx.beginPath(); ctx.arc(x0 + L * 0.3, my, 4, 0, Math.PI * 2); ctx.fill(); ctx.fillText("AAA…", x0 + L * 0.7, my + 4);
      lab("스플라이싱으로 인트론을 잘라 낸 mRNA (엑손만)", x0 + L * 0.48, my - 6);
      ctx.fillStyle = C.forest; ctx.beginPath(); ctx.arc(x0 + L * 0.48, my + 26, 9, 0, Math.PI * 2); ctx.fill(); lab("단백질 하나", x0 + L * 0.48, my + 50);
    }
    // 유전체 구성 비율
    const gy = h - 50, gh = 18; let gx = x0; ctx.fillStyle = C.ink; ctx.font = `600 11px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("유전체 구성", x0, gy - 8);
    O[o][2].forEach(([t, f, col]) => { const ww = Math.max(2, f * L); ctx.fillStyle = col; ctx.fillRect(gx, gy, ww, gh); gx += ww; });
    O[o][2].forEach(([t, f, col], i) => { const lx = x0 + (i % 2) * (L / 2), ly = gy + gh + 6 + Math.floor(i / 2) * 13; ctx.fillStyle = col; ctx.fillRect(lx, ly, 9, 9); ctx.fillStyle = C.ink2; ctx.font = `9.5px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText(`${t} ${f < 0.02 ? (f * 100).toFixed(1) : Math.round(f * 100)}%`, lx + 12, ly + 8); });
  }
  function update() {
    root.querySelectorAll("[data-o]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.o === o)));
    const [s, g, comp, k] = O[o]; nS.textContent = s; nG.textContent = g; nC.textContent = `약 ${comp[0][1] < 0.02 ? (comp[0][1] * 100).toFixed(1) : Math.round(comp[0][1] * 100)} %`; nK.textContent = k; draw();
  }
  root.querySelectorAll("[data-o]").forEach((b) => b.addEventListener("click", () => { o = b.dataset.o; update(); }));
  update();
})();
