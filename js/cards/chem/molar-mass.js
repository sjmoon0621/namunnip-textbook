/* 카드: 물 1몰과 설탕 1몰은 왜 무게가 다를까? — 1몰 질량 측정, 분자량·화학식량·원자량 구분 */
(() => {
  const root = document.getElementById("card-chem-molar-mass");
  if (!root) return;
  const { C, F, fit } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const AW = { H: 1.008, C: 12.01, O: 16.0, Na: 22.99, Cl: 35.45, Ca: 40.08, Fe: 55.85, S: 32.06, Cu: 63.55 };
  // [이름, 화학식 표시, 원소 조성, 종류, 밀도 g/cm³, 색]
  const S = {
    water: ["물", "H₂O", { H: 2, O: 1 }, "분자", 1.0, "#cfe3f5"],
    sugar: ["설탕", "C₁₂H₂₂O₁₁", { C: 12, H: 22, O: 11 }, "분자", 1.59, "#f4f1e8"],
    salt: ["소금", "NaCl", { Na: 1, Cl: 1 }, "이온 결정", 2.16, "#ffffff"],
    caco3: ["탄산 칼슘", "CaCO₃", { Ca: 1, C: 1, O: 3 }, "이온 결정", 2.71, "#eeeae0"],
    iron: ["철", "Fe", { Fe: 1 }, "금속", 7.87, "#8d8d92"],
    cuso4: ["황산 구리 오수화물", "CuSO₄·5H₂O", { Cu: 1, S: 1, O: 9, H: 10 }, "이온 결정 (결정수 포함)", 2.29, "#4a8fd8"],
  };
  const KIND = { 분자: "분자량", "이온 결정": "화학식량", "이온 결정 (결정수 포함)": "화학식량", 금속: "원자량" };
  let cur = "water", shown = null;
  const mm = (k) => Object.entries(S[k][2]).reduce((a, [e, n]) => a + AW[e] * n, 0);
  $(".sub").innerHTML = '<span class="mono small dim">물질</span>' + Object.entries(S).map(([k, s]) => `<button class="chip" data-s="${k}" aria-pressed="${k === cur}">${s[0]} ${s[1]}</button>`).join("");
  const tbl = L.table($(".tbl-host"), [{ key: "n", label: "물질" }, { key: "k", label: "종류" }, { key: "c", label: "계산 (g/mol)", res: 0.01 }, { key: "m", label: "잰 질량 (g)", res: 0.01 }, { key: "v", label: "부피 (cm³)", res: 0.1 }]);
  const { ctx, size } = fit($("canvas"), () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const s = S[cur], M = mm(cur), V = M / s[4];
    // 저울
    const bx = w * 0.08, bw = w * 0.4, by = h - 40;
    ctx.fillStyle = "#d9dad2"; ctx.fillRect(bx, by, bw, 26); ctx.fillStyle = "#1c1e1b"; ctx.fillRect(bx + bw * 0.25, by + 5, bw * 0.5, 16);
    ctx.fillStyle = "#8fd16f"; ctx.font = `600 13px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText(shown != null ? `${shown.toFixed(2)} g` : "0.00 g", bx + bw / 2, by + 18);
    ctx.fillStyle = "#b9b9c1"; ctx.fillRect(bx + 10, by - 6, bw - 20, 6);
    // 물질 더미: 부피에 비례한 정육면체
    const side = Math.cbrt(V) * Math.min(14, h / 40), cx = bx + bw / 2;
    if (shown != null) { ctx.fillStyle = s[5]; ctx.strokeStyle = C.ink2; ctx.fillRect(cx - side / 2, by - 6 - side, side, side); ctx.strokeRect(cx - side / 2, by - 6 - side, side, side); ctx.fillStyle = C.ink2; ctx.font = `10px ${F.mono}`; ctx.fillText(`${V.toFixed(1)} cm³`, cx, by - 12 - side); }
    // 계산
    const tx = w * 0.55; ctx.textAlign = "left"; ctx.fillStyle = C.ink; ctx.font = `600 14px ${F.sans}`; ctx.fillText(`${s[0]} ${s[1]}`, tx, 26);
    ctx.font = `11.5px ${F.mono}`; ctx.fillStyle = C.ink2;
    let y = 50; Object.entries(s[2]).forEach(([e, n]) => { ctx.fillText(`${e} ${AW[e]} × ${n} = ${(AW[e] * n).toFixed(2)}`, tx, y); y += 18; });
    ctx.fillStyle = C.ink; ctx.font = `600 12px ${F.mono}`; ctx.fillText(`${KIND[s[3]]} = ${M.toFixed(2)}`, tx, y + 6);
    ctx.fillStyle = C.ink3; ctx.font = `11px ${F.sans}`; ctx.fillText(`종류: ${s[3]}`, tx, y + 26); ctx.fillText(`1몰 = 6.02×10²³개의 ${s[3] === "분자" ? "분자" : s[3] === "금속" ? "원자" : "화학식 단위"}`, tx, y + 44);
  }
  $(".sub").addEventListener("click", (e) => { const b = e.target.closest("[data-s]"); if (!b) return; cur = b.dataset.s; shown = null; root.querySelectorAll("[data-s]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); draw(); });
  $(".weigh").addEventListener("click", () => { const M = mm(cur); shown = L.measure(M, { rel: 0.003, res: 0.01 }); tbl.add({ n: S[cur][0], k: KIND[S[cur][3]], c: M, m: shown, v: M / S[cur][4] }); draw(); });
  $(".clear").addEventListener("click", () => tbl.clear());
  draw();
  if (L.demo) { Object.keys(S).forEach((k) => { cur = k; $(".weigh").click(); }); }
})();
