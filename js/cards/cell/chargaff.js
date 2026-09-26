/* 카드: 생물마다 DNA는 다른데, 왜 A와 T의 양은 늘 같을까? — 샤가프 규칙(염기 조성 실측값)과 상보적 염기쌍 */
(() => {
  const root = document.getElementById("card-cell-chargaff");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sGC = $(".gc"), oGC = $(".gc-out"), gcRow = $(".gc-row");
  const nAT = $(".n-at"), nGC = $(".n-gc"), nR = $(".n-ratio"), nHB = $(".n-hb");
  // 염기 조성(몰 %) 측정값
  const ORG = {
    human: { name: "사람", A: 30.9, T: 29.4, G: 19.9, C: 19.8, ds: true },
    wheat: { name: "밀", A: 27.3, T: 27.1, G: 22.7, C: 22.8, ds: true },
    yeast: { name: "효모", A: 31.3, T: 32.9, G: 18.7, C: 17.1, ds: true },
    ecoli: { name: "대장균", A: 24.7, T: 23.6, G: 26.0, C: 25.7, ds: true },
    phix: { name: "φX174 (단일 가닥 DNA)", A: 24.0, T: 31.2, G: 23.3, C: 21.5, ds: false },
  };
  const COL = { A: "#d4493a", T: "#e0a02a", G: "#3f6fa3", C: "#3b7c2a" };
  const PAIR = { A: "T", T: "A", G: "C", C: "G" };
  let key = "human";

  function comp() {
    if (key !== "custom") return ORG[key];
    const gc = +sGC.value;
    return { name: `직접 만든 이중 가닥 DNA`, A: (100 - gc) / 2, T: (100 - gc) / 2, G: gc / 2, C: gc / 2, ds: true };
  }
  // 조성에 맞춘 16염기 예시 서열(결정적): 누적 비율로 고르게 뽑기
  function seq(o) {
    const n = 16, out = [], acc = { A: 0, T: 0, G: 0, C: 0 };
    const tot = o.A + o.T + o.G + o.C;
    const want = o.ds ? { A: (o.A + o.T) / 2, T: (o.A + o.T) / 2, G: (o.G + o.C) / 2, C: (o.G + o.C) / 2 } : o;
    const order = [3, 1, 0, 2, 1, 3, 2, 0, 0, 2, 3, 1, 2, 0, 1, 3];
    for (let i = 0; i < n; i++) {
      // 가장 부족한 염기를 고르되, 같은 염기가 너무 이어지지 않게 순서표로 흔든다
      let best = null, bv = -1e9;
      ["A", "T", "G", "C"].forEach((b, j) => {
        const v = want[b] / tot * (i + 1) - acc[b] + ((order[i] === j) ? 0.35 : 0);
        if (v > bv) { bv = v; best = b; }
      });
      acc[best]++; out.push(best);
    }
    return out;
  }

  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const o = comp(), s = seq(o);
    ctx.fillStyle = C.ink2; ctx.font = `600 13px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillText(o.name, 12, 20);
    // 사다리
    const x0 = 34, x1 = w - 20, n = s.length, dx = (x1 - x0) / n;
    const yT = 52, yB = o.ds ? 120 : 52;
    ctx.fillStyle = C.ink3; ctx.font = `11px ${F.mono}`;
    ctx.textAlign = "right"; ctx.fillText("5′", x0 - 6, yT - 10);
    ctx.textAlign = "left"; ctx.fillText("3′", x1 + 4, yT - 10);
    if (o.ds) { ctx.textAlign = "right"; ctx.fillText("3′", x0 - 6, yB + 20); ctx.textAlign = "left"; ctx.fillText("5′", x1 + 4, yB + 20); }
    ctx.strokeStyle = C.ink; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x0, yT - 14); ctx.lineTo(x1, yT - 14); ctx.stroke();
    if (o.ds) { ctx.beginPath(); ctx.moveTo(x0, yB + 14); ctx.lineTo(x1, yB + 14); ctx.stroke(); }
    let hb = 0;
    s.forEach((b, i) => {
      const cx = x0 + dx * (i + 0.5), bw = Math.min(dx - 4, 22);
      const box = (y, base, down) => {
        ctx.fillStyle = COL[base]; ctx.fillRect(cx - bw / 2, down ? y - 14 : y - 14 + 0, bw, 26);
        ctx.fillStyle = "#fff"; ctx.font = `600 12px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText(base, cx, y + 4);
      };
      box(yT + 2, b);
      if (o.ds) {
        const p = PAIR[b], k = (b === "G" || b === "C") ? 3 : 2; hb += k;
        box(yB - 2, p);
        ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.setLineDash([2, 2]);
        for (let j = 0; j < k; j++) { const xx = cx + (j - (k - 1) / 2) * 5; ctx.beginPath(); ctx.moveTo(xx, yT + 16); ctx.lineTo(xx, yB - 16); ctx.stroke(); }
        ctx.setLineDash([]);
      }
    });
    ctx.fillStyle = C.ink3; ctx.font = `11px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillText(o.ds ? `예시 조각의 수소 결합 ${hb}개 (점선: A–T 2개, G–C 3개)` : "짝이 되는 가닥이 없음", x0, (o.ds ? yB : yT) + 36);
    // 막대
    const gy0 = h * 0.63, gh = h * 0.29, gx0 = 40, gw = w - 60;
    const Y = (v) => gy0 + gh - v / 40 * gh;
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "right";
    [0, 10, 20, 30, 40].forEach((v) => { ctx.beginPath(); ctx.moveTo(gx0, Y(v) + .5); ctx.lineTo(gx0 + gw, Y(v) + .5); ctx.stroke(); ctx.fillText(v, gx0 - 5, Y(v) + 3); });
    ctx.textAlign = "left"; ctx.fillText("DNA 전체의 염기 비율 (몰 %)", gx0, gy0 - 12);
    const groups = [["A", "T"], ["G", "C"]];
    groups.forEach((g, gi) => {
      g.forEach((b, bi) => {
        const bx = gx0 + gw * (0.08 + gi * 0.5 + bi * 0.19), bw = gw * 0.16;
        ctx.fillStyle = COL[b]; ctx.fillRect(bx, Y(o[b]), bw, gy0 + gh - Y(o[b]));
        ctx.fillStyle = C.ink; ctx.font = `600 12px ${F.mono}`; ctx.textAlign = "center";
        ctx.fillText(o[b].toFixed(1), bx + bw / 2, Y(o[b]) - 5);
        ctx.fillText(b, bx + bw / 2, gy0 + gh + 15);
      });
    });
  }

  function update() {
    const o = comp();
    oGC.textContent = sGC.value;
    gcRow.style.display = key === "custom" ? "" : "none";
    nAT.textContent = (o.A / o.T).toFixed(2); nGC.textContent = (o.G / o.C).toFixed(2);
    nR.textContent = ((o.A + o.T) / (o.G + o.C)).toFixed(2);
    nAT.classList.toggle("bad", Math.abs(o.A / o.T - 1) > 0.1); nGC.classList.toggle("bad", Math.abs(o.G / o.C - 1) > 0.1);
    nHB.textContent = o.ds ? Math.round(2 * (o.A + o.T) + 3 * (o.G + o.C)) : "—";
    root.querySelectorAll("[data-org]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.org === key ? "true" : "false"));
    draw();
  }
  root.querySelectorAll("[data-org]").forEach((b) => b.addEventListener("click", () => { key = b.dataset.org; update(); }));
  sGC.addEventListener("input", update);
  update();
})();
