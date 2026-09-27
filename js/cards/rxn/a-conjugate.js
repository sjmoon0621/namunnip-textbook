/* 카드: OH⁻가 없는 암모니아는 어떻게 염기일까? — 양성자 이동으로 본 산·염기, 짝산–짝염기 */
(() => {
  const root = document.getElementById("card-rxn-conjugate");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), nA = $(".n-a"), nB = $(".n-b"), nP = $(".n-p"), note = $(".n-note"), bDir = $(".dir");
  // [산, 염기, 짝염기, 짝산, 설명] — 정반응 기준
  const R = [
    ["HCl", "H₂O", "Cl⁻", "H₃O⁺", "HCl은 강산이라 거의 모두 이온화합니다. 역반응(Cl⁻가 양성자를 받는 반응)은 거의 일어나지 않습니다."],
    ["H₂O", "NH₃", "OH⁻", "NH₄⁺", "여기서 물은 산입니다. NH₃는 약한 염기라 일부만 반응합니다."],
    ["HCO₃⁻", "H₂O", "CO₃²⁻", "H₃O⁺", "HCO₃⁻가 산으로 작용합니다. 이 반응은 아주 조금만 일어납니다."],
    ["H₃O⁺", "HCO₃⁻", "H₂O", "H₂CO₃", "같은 HCO₃⁻가 이번에는 염기로 작용합니다(양쪽성). 혈액의 완충 작용에 쓰이는 반응입니다."],
    ["CH₃COOH", "NH₃", "CH₃COO⁻", "NH₄⁺", "물이 없어도 양성자가 옮겨 가면 산–염기 반응입니다."],
  ];
  let r = 0, rev = false;
  const { ctx, size } = fit(cv, () => draw());
  function box(x, y, t, role, col) {
    ctx.font = `600 18px ${F.sans}`; const tw = ctx.measureText(t).width + 26;
    ctx.fillStyle = "#fff"; ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(x - tw / 2, y - 20, tw, 40, 8); ctx.fill(); ctx.stroke();
    ctx.fillStyle = C.ink; ctx.textAlign = "center"; ctx.fillText(t, x, y + 6);
    ctx.fillStyle = col; ctx.font = `600 11px ${F.sans}`; ctx.fillText(role, x, y + 36);
    return tw;
  }
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    let [a, b, cb, ca] = R[r]; if (rev) [a, b, cb, ca] = [ca, cb, b, a];
    const y = h * 0.5, xs = [w * 0.12, w * 0.36, w * 0.64, w * 0.88], RED = C.warn, BLUE = "#3f6fa3";
    box(xs[0], y, a, "산", RED); box(xs[1], y, b, "염기", BLUE); box(xs[2], y, cb, "짝염기", RED); box(xs[3], y, ca, "짝산", BLUE);
    ctx.fillStyle = C.ink2; ctx.font = `18px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("+", (xs[0] + xs[1]) / 2, y + 6); ctx.fillText("+", (xs[2] + xs[3]) / 2, y + 6); ctx.fillText("⇌", w / 2, y + 6);
    // 양성자 이동 화살표 (산 → 염기)
    ctx.strokeStyle = C.forest; ctx.fillStyle = C.forest; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(xs[0], y - 24); ctx.quadraticCurveTo((xs[0] + xs[1]) / 2, y - 80, xs[1], y - 26); ctx.stroke(); ctx.beginPath(); ctx.moveTo(xs[1], y - 22); ctx.lineTo(xs[1] - 10, y - 32); ctx.lineTo(xs[1] + 3, y - 36); ctx.fill();
    ctx.font = `600 12px ${F.sans}`; ctx.fillText("H⁺", (xs[0] + xs[1]) / 2, y - 60);
    // 짝 괄호
    const brace = (x1, x2, yy, col, t) => { ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(x1, yy - 8); ctx.lineTo(x1, yy); ctx.lineTo(x2, yy); ctx.lineTo(x2, yy - 8); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = col; ctx.font = `10.5px ${F.sans}`; ctx.fillText(t, (x1 + x2) / 2, yy + 13); };
    brace(xs[0], xs[2], y + 56, RED, `짝 ①  ${a} / ${cb}`); brace(xs[1], xs[3], y + 84, BLUE, `짝 ②  ${ca} / ${b}`);
  }
  function update() {
    root.querySelectorAll("[data-r]").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.r === r))); bDir.setAttribute("aria-pressed", String(rev));
    let [a, b, cb, ca, t] = R[r]; if (rev) [a, b, cb, ca] = [ca, cb, b, a];
    nA.textContent = a; nB.textContent = b; nP.textContent = `${a}/${cb}, ${ca}/${b}`; note.textContent = rev ? "역반응에서는 생성물 쪽의 짝산이 산, 짝염기가 염기가 됩니다." : t;
    draw();
  }
  root.querySelectorAll("[data-r]").forEach((b) => b.addEventListener("click", () => { r = +b.dataset.r; update(); }));
  bDir.addEventListener("click", () => { rev = !rev; update(); });
  update();
})();
