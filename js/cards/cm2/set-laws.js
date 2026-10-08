/* 카드: 두 식이 같은 집합인지 그림으로 어떻게 확인할까? — 좌변·우변을 단계별로 칠해 8개 영역을 비교 (교환·결합·분배·드모르간) */
(() => {
  const root = document.getElementById("card-cm2-set-laws");
  if (!root) return;
  const { C, F, fit } = NM;
  const S = NMSets;
  const $ = (s) => root.querySelector(s), cv = $("canvas");
  const lb = [...root.querySelectorAll(".laws .chip")];
  /* 영역 m: 1비트 A, 2비트 B, 4비트 C */
  const a = (m) => !!(m & 1), b = (m) => !!(m & 2), c = (m) => !!(m & 4);
  const LAWS = {
    comm: { n: 2, L: [["A ∪ B", (m) => a(m) || b(m)]], R: [["B ∪ A", (m) => b(m) || a(m)]] },
    assoc: { n: 3, L: [["A ∪ B", (m) => a(m) || b(m)], ["(A ∪ B) ∪ C", (m) => a(m) || b(m) || c(m)]],
      R: [["B ∪ C", (m) => b(m) || c(m)], ["A ∪ (B ∪ C)", (m) => a(m) || b(m) || c(m)]] },
    dist1: { n: 3, L: [["B ∪ C", (m) => b(m) || c(m)], ["A ∩ (B ∪ C)", (m) => a(m) && (b(m) || c(m))]],
      R: [["A ∩ B", (m) => a(m) && b(m)], ["A ∩ C", (m) => a(m) && c(m)], ["(A ∩ B) ∪ (A ∩ C)", (m) => (a(m) && b(m)) || (a(m) && c(m))]] },
    dist2: { n: 3, L: [["B ∩ C", (m) => b(m) && c(m)], ["A ∪ (B ∩ C)", (m) => a(m) || (b(m) && c(m))]],
      R: [["A ∪ B", (m) => a(m) || b(m)], ["A ∪ C", (m) => a(m) || c(m)], ["(A ∪ B) ∩ (A ∪ C)", (m) => (a(m) || b(m)) && (a(m) || c(m))]] },
    dm1: { n: 2, L: [["A ∪ B", (m) => a(m) || b(m)], ["(A ∪ B)ᶜ", (m) => !(a(m) || b(m))]],
      R: [["Aᶜ", (m) => !a(m)], ["Bᶜ", (m) => !b(m)], ["Aᶜ ∩ Bᶜ", (m) => !a(m) && !b(m)]] },
    dm2: { n: 2, L: [["A ∩ B", (m) => a(m) && b(m)], ["(A ∩ B)ᶜ", (m) => !(a(m) && b(m))]],
      R: [["Aᶜ", (m) => !a(m)], ["Bᶜ", (m) => !b(m)], ["Aᶜ ∪ Bᶜ", (m) => !a(m) || !b(m)]] },
    trap: { n: 3, L: [["B ∩ C", (m) => b(m) && c(m)], ["A ∪ (B ∩ C)", (m) => a(m) || (b(m) && c(m))]],
      R: [["A ∪ B", (m) => a(m) || b(m)], ["(A ∪ B) ∩ C", (m) => (a(m) || b(m)) && c(m)]] },
  };
  let law = "dist1", step = 0, pickRel = null;     // pickRel: 패널 안 상대 위치 [0..1, 0..1]
  let panels = [];
  const { ctx, size } = fit(cv, () => draw());
  const L = () => LAWS[law];
  const maxStep = () => Math.max(L().L.length, L().R.length) - 1;
  const stage = (side) => side[Math.min(step, side.length - 1)];
  const isFinal = (side) => step >= side.length - 1;

  function circles(p, n) {
    if (n === 2) { const r = Math.min(p.w * 0.27, p.h * 0.36); return [{ x: p.x + p.w / 2 - r * 0.55, y: p.y + p.h / 2, r }, { x: p.x + p.w / 2 + r * 0.55, y: p.y + p.h / 2, r }]; }
    const r = Math.min(p.w * 0.24, p.h * 0.27), cy = p.y + p.h * 0.4;
    return [{ x: p.x + p.w / 2 - r * 0.58, y: cy, r }, { x: p.x + p.w / 2 + r * 0.58, y: cy, r }, { x: p.x + p.w / 2, y: cy + r * 0.95, r }];
  }
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const pw = (w - 18) / 2, ph = h - 44, lw = L();
    panels = [{ x: 6, y: 22, w: pw, h: ph }, { x: 12 + pw, y: 22, w: pw, h: ph }];
    [lw.L, lw.R].forEach((side, i) => {
      const p = panels[i], cs = circles(p, lw.n), [txt, f] = stage(side), fin = isFinal(side);
      S.shadeWhere(ctx, cs, p, f, fin ? C.leaf : C.amber, fin ? 0.55 : 0.35);
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2; ctx.strokeRect(p.x + .5, p.y + .5, p.w - 1, p.h - 1);
      S.outline(ctx, cs, lw.n === 2 ? ["A", "B"] : ["A", "B", "C"], lw.n === 2 ? [125, 55] : [130, 50, 270]);
      ctx.font = `600 12px ${F.sans}`; ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillStyle = C.ink2;
      ctx.fillText(i ? "우변" : "좌변", p.x + 2, 10);
      ctx.font = `600 12.5px ${F.mono}`; ctx.textAlign = "center"; ctx.fillStyle = fin ? C.forest : C.amber;
      ctx.fillText(txt, p.x + p.w / 2, p.y + p.h + 13);
      if (pickRel) {
        const x = p.x + pickRel[0] * p.w, y = p.y + pickRel[1] * p.h, m = S.region(cs, x, y), on = f(m);
        ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fillStyle = on ? C.forest : C.card; ctx.fill();
        ctx.lineWidth = 2; ctx.strokeStyle = on ? C.forest : C.warn; ctx.stroke();
      }
    });
  }
  function update() {
    const lw = L(), [lt] = stage(lw.L), [rt] = stage(lw.R);
    const fl = lw.L[lw.L.length - 1], fr = lw.R[lw.R.length - 1];
    $(".eq").innerHTML = `증명할 식: ${fl[0]} = ${fr[0]}<br>지금 칠한 것: 좌변 ${lt}, 우변 ${rt} (단계 ${step + 1}/${maxStep() + 1})`.replace(/ᶜ/g, "<sup>C</sup>");
    const done = step >= maxStep(), ns = $(".n-same");
    if (!done) { ns.textContent = "끝까지 칠한 뒤 비교합니다"; ns.className = "n-same"; }
    else {
      let diff = 0; for (let m = 0; m < 1 << lw.n; m++) if (fl[1](m) !== fr[1](m)) diff++;
      ns.textContent = diff ? `다른 영역 ${diff}개 → 같지 않음` : `${1 << lw.n}개 영역 모두 같음`; ns.className = `n-same ${diff ? "bad" : "good"}`;
    }
    const pt = $(".n-pt");
    if (pickRel && panels.length) {
      const cs = circles(panels[0], lw.n), m = S.region(cs, panels[0].x + pickRel[0] * panels[0].w, panels[0].y + pickRel[1] * panels[0].h);
      const where = ["A", "B", "C"].slice(0, lw.n).map((s, i) => `${s} ${m >> i & 1 ? "안" : "밖"}`).join(" · ");
      const inL = fl[1](m), inR = fr[1](m);
      pt.textContent = `${where} → 좌변 ${inL ? "○" : "×"}, 우변 ${inR ? "○" : "×"}`; pt.className = `n-pt ${inL === inR ? "" : "bad"}`;
    } else { pt.textContent = "그림을 눌러 보세요"; pt.className = "n-pt"; }
    draw();
  }
  cv.addEventListener("pointerdown", (e) => {
    const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    const p = panels.find((q) => x >= q.x && x <= q.x + q.w && y >= q.y && y <= q.y + q.h);
    if (!p) return;
    pickRel = [(x - p.x) / p.w, (y - p.y) / p.h]; update();
  });
  lb.forEach((bt) => bt.addEventListener("click", () => { law = bt.dataset.l; step = 0; pickRel = null; lb.forEach((x) => x.setAttribute("aria-pressed", String(x === bt))); update(); }));
  $(".go-next").addEventListener("click", () => { step = Math.min(maxStep(), step + 1); update(); });
  $(".go-all").addEventListener("click", () => { step = maxStep(); update(); });
  $(".go-reset").addEventListener("click", () => { step = 0; update(); });
  update();
})();
