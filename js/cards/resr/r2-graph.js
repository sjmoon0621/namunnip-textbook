/* 카드: 기포 수를 세어 적은 표를 어떤 그래프로 바꿔야 관계가 드러날까? — 축 변환, 오차 막대, 직선 맞춤 (모식) */
(() => {
  const root = document.getElementById("card-resr-graph");
  if (!root) return;
  const { C, F, fit } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const DS = [10, 12, 15, 20, 25, 30, 40, 50];
  const rate = (d) => { const I = (10 / d) ** 2; return 45 * I / (I + 0.3); };
  let xk = "d", pk = "mean", ek = "none", lk = "join";

  const tbl = L.table($(".tbl-host"), [
    { key: "d", label: "거리 d (cm)", res: 1 }, { key: "r1", label: "1회 (개/분)", res: 1 }, { key: "r2", label: "2회", res: 1 }, { key: "r3", label: "3회", res: 1 },
    { key: "m", label: "평균", res: 0.1 }, { key: "s", label: "표준편차", res: 0.1 },
  ], () => draw());

  function experiment() {
    tbl.clear();
    DS.forEach((d) => {
      const r = rate(d), sd = 0.3 + 0.3 * Math.sqrt(r);
      const v = [0, 1, 2].map(() => Math.max(0, Math.round(r + sd * L.gauss())));
      const st = L.stats(v);
      tbl.add({ d, r1: v[0], r2: v[1], r3: v[2], m: st.mean, s: st.sd, v });
    });
  }

  const XF = {
    d: { f: (d) => d, lab: "램프 거리 d (cm)", xr: [0, 55] },
    inv: { f: (d) => 100 / d, lab: "1/d (1/m)", xr: [0, 11] },
    inv2: { f: (d) => 1e4 / (d * d), lab: "1/d² (1/m²)", xr: [0, 110] },
  };
  const pl = fit($(".cv-plot"), () => draw());

  function draw() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const X = XF[xk], rows = tbl.rows, showLab = $(".lab").checked;
    const means = rows.map((r) => ({ x: X.f(r.d), y: r.m, ey: ek === "sd" ? r.s : ek === "se" ? r.s / Math.sqrt(3) : 0 }));
    const pts = pk === "all" ? rows.flatMap((r) => r.v.map((y) => ({ x: X.f(r.d), y }))) : means;
    const f = lk === "fit" && means.length > 1 ? L.linfit(means.map((p) => p.x), means.map((p) => p.y)) : null;
    const box = { x0: 40, y0: 22, w: w - 54, h: h - 58 };
    if (pk === "all" && ek !== "none") means.forEach((p) => pts.push({ x: p.x, y: p.y, ey: p.ey, mean: true }));
    const m = L.plot(ctx, box, { pts: pts.filter((p) => !p.mean), fit: f, xr: X.xr, yr: [0, 40], xlabel: showLab ? X.lab : "", ylabel: showLab ? "기포 수 (개/분)" : "" });
    ctx.save(); ctx.beginPath(); ctx.rect(box.x0, box.y0, box.w, box.h); ctx.clip();
    if (pk === "all" && ek !== "none") {
      ctx.strokeStyle = C.warn; ctx.lineWidth = 1.4;
      means.forEach((p) => {
        const px = m.X(p.x) + 6;
        ctx.beginPath(); ctx.moveTo(px, m.Y(p.y - p.ey)); ctx.lineTo(px, m.Y(p.y + p.ey));
        ctx.moveTo(px - 3, m.Y(p.y - p.ey)); ctx.lineTo(px + 3, m.Y(p.y - p.ey)); ctx.moveTo(px - 3, m.Y(p.y + p.ey)); ctx.lineTo(px + 3, m.Y(p.y + p.ey)); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(px - 4, m.Y(p.y)); ctx.lineTo(px + 4, m.Y(p.y)); ctx.stroke();
      });
    }
    if (lk === "join" && means.length > 1) {
      const s = [...means].sort((a, b) => a.x - b.x);
      ctx.strokeStyle = C.forest; ctx.lineWidth = 1.2; ctx.beginPath();
      s.forEach((p, i) => (i ? ctx.lineTo(m.X(p.x), m.Y(p.y)) : ctx.moveTo(m.X(p.x), m.Y(p.y)))); ctx.stroke();
    }
    ctx.restore();
    if (f) {
      ctx.fillStyle = C.warn; ctx.font = `11px ${F.mono}`; ctx.textAlign = "right";
      ctx.fillText(`직선 맞춤 r² = ${f.r2.toFixed(3)}`, box.x0 + box.w - 4, box.y0 + 14);
    }
    if (ek !== "none") {
      ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "right";
      ctx.fillText(`오차 막대: ${ek === "sd" ? "표준편차" : "평균의 표준오차"} (n = 3)`, box.x0 + box.w, box.y0 - 7);
    }
    verdict(f, showLab);
  }

  function verdict(f, showLab) {
    const v = $(".verdict"); v.className = "verdict small";
    const msg = [];
    if (!showLab) msg.push("축 이름과 단위가 없으면 무엇을 어떤 단위로 쟀는지 알 수 없습니다.");
    if (lk === "fit" && f) {
      if (xk === "d") msg.push(`곡선 자료에 직선을 맞췄습니다(r² = ${f.r2.toFixed(2)}). 거리가 늘면 기포가 줄지만, 직선은 관계의 모양을 나타내지 못합니다.`);
      else if (xk === "inv2") msg.push("빛이 약한 쪽(왼쪽) 점들은 직선에 가깝고, 빛이 강한 쪽은 직선 아래로 처집니다. 모든 점에 맞춘 직선보다 왼쪽 구간만 따로 보는 편이 정직합니다.");
      else msg.push("1/d는 빛의 세기에 비례하는 양이 아닙니다. 점들이 직선에 가까워 보여도, 관계의 근거가 되는 물리 법칙(1/d²)과 맞는 축을 고르는 것이 좋습니다.");
    }
    if (pk === "all" && ek === "none") msg.push("개별 측정값을 모두 찍으면 흩어짐이 그대로 보입니다. 반복이 적을 때 좋은 방법입니다.");
    if (ek === "se") msg.push("표준오차 막대는 표준편차 막대의 1/√3 ≈ 0.58배입니다. 같은 자료라도 막대가 짧아 보이므로 무엇인지 밝혀야 합니다.");
    v.textContent = msg.join(" ");
    if (xk === "inv2" && lk === "fit" && showLab) v.classList.add("good");
    if (!showLab) v.classList.add("bad");
  }

  const press = (attr, val) => root.querySelectorAll(`[data-${attr}]`).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset[attr] === val)));
  root.querySelector(".card-fig").addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    if (b.dataset.x) { xk = b.dataset.x; press("x", xk); }
    else if (b.dataset.p) { pk = b.dataset.p; press("p", pk); }
    else if (b.dataset.e) { ek = b.dataset.e; press("e", ek); }
    else if (b.dataset.l) { lk = b.dataset.l; press("l", lk); }
    else if (b.classList.contains("redo")) { experiment(); return; }
    else return;
    draw();
  });
  $(".lab").addEventListener("change", draw);
  experiment();
  if (L.demo) { xk = "inv2"; press("x", xk); ek = "se"; press("e", ek); lk = "fit"; press("l", lk); draw(); }
})();
