/* 카드: 잎이나 줄기 한 조각에서 식물 한 그루를 다시 키울 수 있을까? — 옥신:사이토키닌 비율과 캘러스·줄기·뿌리 (스쿠그–밀러 모식), 무균 조작 */
(() => {
  const root = document.getElementById("card-labbio-tissue-culture");
  if (!root) return;
  const { C, F, fit, loop, clamp, axes } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const LV = [0, 0.03, 0.1, 0.3, 1, 3];   // mg/L
  const NAME = { tob: "담배", car: "당근" };
  let plant = "tob", dish = null;

  const sig = (x) => 1 / (1 + Math.exp(-x));
  function probs(a, c, p) {
    const x = Math.log10((c + 0.01) / (a + 0.01));
    const grow = 1 - Math.exp(-(a + c) / (p === "car" ? 0.05 : 0.12));
    return {
      callus: grow * 0.92,
      shoot: grow * sig((x - 0.55) / 0.22) * (p === "car" ? 0.55 : 0.85) * (a > 2 ? 0.6 : 1),
      root: grow * sig((-x - 0.55) / 0.22) * (p === "car" ? 0.9 : 0.8) * (a > 2 ? 0.35 : 1),
    };
  }
  const contamP = () => 1 - (1 - 0.03) * ($(".s1").checked ? 1 : 0.4) * ($(".s2").checked ? 1 : 0.45) * ($(".s3").checked ? 1 : 0.75);

  const tbl = L.table($(".tbl-host"), [
    { key: "p", label: "절편" }, { key: "a", label: "옥신 (mg/L)", res: 0.01 }, { key: "c", label: "사이토키닌 (mg/L)", res: 0.01 },
    { key: "k", label: "캘러스", res: 1 }, { key: "s", label: "줄기", res: 1 }, { key: "r", label: "뿌리", res: 1 }, { key: "x", label: "오염", res: 1 },
  ], () => drawPlot());
  const app = fit($(".cv-wide"), () => drawApp());
  const pl = fit($(".cv-plot"), () => drawPlot());

  function culture() {
    const a = LV[+$(".a").value], c = LV[+$(".c").value], pr = probs(a, c, plant), cp = contamP();
    const ex = Array.from({ length: 10 }, () => {
      if (Math.random() < cp) return { cont: Math.random() < 0.6 ? "f" : "b", callus: 0, shoot: 0, root: 0 };
      const callus = Math.random() < pr.callus ? 0.5 + Math.random() * 0.5 : 0;
      return { cont: null, callus, shoot: Math.random() < pr.shoot ? 1 + Math.floor(Math.random() * 3) : 0, root: Math.random() < pr.root ? 2 + Math.floor(Math.random() * 4) : 0 };
    });
    return { a, c, p: plant, ex, t: 0 };
  }
  function record(d) {
    const n = (f) => d.ex.filter(f).length;
    tbl.add({ p: NAME[d.p], a: d.a, c: d.c, k: n((e) => e.callus > 0), s: n((e) => e.shoot > 0), r: n((e) => e.root > 0), x: n((e) => e.cont), ai: LV.indexOf(d.a), ci: LV.indexOf(d.c) });
  }

  function drawApp() {
    const { ctx } = app, { w, h } = app.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const R = Math.min(h * 0.44, w * 0.27), cx = R + 14, cy = h / 2;
    ctx.fillStyle = "#f2ecc8"; ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, R - 5, 0, Math.PI * 2); ctx.strokeStyle = "rgba(0,0,0,.12)"; ctx.stroke();
    const t = dish ? clamp(dish.t, 0, 1) : 0;
    for (let i = 0; i < 10; i++) {
      const ang = i / 10 * Math.PI * 2 - Math.PI / 2, rr = i % 2 ? R * 0.62 : R * 0.42;
      const x = cx + Math.cos(ang) * rr, y = cy + Math.sin(ang) * rr, e = dish ? dish.ex[i] : null;
      if (e && e.cont) {
        ctx.fillStyle = e.cont === "f" ? `rgba(235,235,225,${0.9 * t})` : `rgba(230,210,120,${0.8 * t})`;
        ctx.beginPath(); ctx.arc(x, y, 6 + 14 * t, 0, Math.PI * 2); ctx.fill();
        if (e.cont === "f") { ctx.strokeStyle = `rgba(90,110,90,${t})`; ctx.lineWidth = 0.8; for (let k = 0; k < 10; k++) { const q = k / 10 * Math.PI * 2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(q) * (6 + 14 * t), y + Math.sin(q) * (6 + 14 * t)); ctx.stroke(); } }
      }
      // 절편
      const cs = e ? 4 + 9 * t * e.callus : 4;
      ctx.fillStyle = e && e.cont ? "#8a7a55" : e && e.callus > 0 && t > 0.2 ? "#d9cf8c" : plant === "car" ? "#e8913a" : "#dfe6c4";
      ctx.strokeStyle = "rgba(80,70,40,.6)"; ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.ellipse(x, y, cs + 3, cs, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      if (!e || e.cont) continue;
      ctx.strokeStyle = "#f4efe0"; ctx.lineWidth = 1.4;
      for (let k = 0; k < e.root; k++) { const q = Math.PI * (0.25 + k * 0.13); ctx.beginPath(); ctx.moveTo(x, y + cs * 0.5); ctx.quadraticCurveTo(x + Math.cos(q) * 10 * t, y + 12 * t, x + Math.cos(q) * 16 * t, y + Math.sin(q) * 20 * t); ctx.stroke(); }
      ctx.strokeStyle = "rgba(160,150,120,.7)"; ctx.lineWidth = 0.5;
      for (let k = 0; k < e.root; k++) { const q = Math.PI * (0.25 + k * 0.13); ctx.beginPath(); ctx.moveTo(x, y + cs * 0.5); ctx.quadraticCurveTo(x + Math.cos(q) * 10 * t, y + 12 * t, x + Math.cos(q) * 16 * t, y + Math.sin(q) * 20 * t); ctx.stroke(); }
      for (let k = 0; k < e.shoot; k++) {
        const sx = x - 5 + k * 5, top = y - cs - 14 * t;
        ctx.strokeStyle = C.forest; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(sx, y - cs * 0.5); ctx.lineTo(sx, top); ctx.stroke();
        ctx.fillStyle = C.leaf; ctx.beginPath(); ctx.ellipse(sx - 3, top + 2, 3.5 * t + 0.5, 1.8 * t + 0.4, -0.5, 0, Math.PI * 2); ctx.ellipse(sx + 3, top + 4, 3.5 * t + 0.5, 1.8 * t + 0.4, 0.5, 0, Math.PI * 2); ctx.fill();
      }
    }
    // 정보
    const ix = cx + R + 22;
    ctx.textAlign = "left"; ctx.fillStyle = C.ink; ctx.font = `600 13px ${F.sans}`;
    const a = dish ? dish.a : LV[+$(".a").value], c = dish ? dish.c : LV[+$(".c").value];
    ctx.fillText(`${NAME[dish ? dish.p : plant]} 절편 · MS 배지`, ix, 34);
    ctx.font = `12px ${F.mono}`; ctx.fillStyle = C.ink2;
    ctx.fillText(`옥신 ${a} · 사이토키닌 ${c} mg/L`, ix, 56);
    ctx.fillText(`사이토키닌/옥신 = ${a ? (c / a).toFixed(c / a < 1 ? 2 : 1) : c ? "∞" : "—"}`, ix, 76);
    ctx.fillText(dish ? `배양 ${Math.round(t * 4)}주째` : "치상 전", ix, 96);
    if (dish && t >= 1) {
      const n = (f) => dish.ex.filter(f).length;
      const rows = [["캘러스", n((e) => e.callus > 0), "#b08a4a"], ["줄기", n((e) => e.shoot > 0), C.forest], ["뿌리", n((e) => e.root > 0), "#7f9cbb"], ["오염", n((e) => e.cont), C.warn]];
      const bw = Math.max(40, w - ix - 96);
      rows.forEach(([lab, k, col], i) => {
        const y = 122 + i * 22;
        ctx.fillStyle = C.ink2; ctx.fillText(lab, ix, y + 9);
        ctx.fillStyle = C.rule; ctx.fillRect(ix + 50, y, bw, 10); ctx.fillStyle = col; ctx.fillRect(ix + 50, y, bw * k / 10, 10);
        ctx.fillStyle = C.ink; ctx.fillText(`${k}/10`, ix + 56 + bw, y + 9);
      });
    }
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const box = { x0: 56, y0: 22, w: w - 72, h: h - 62 };
    const cw = box.w / 6, ch = box.h / 6;
    const X = (i) => box.x0 + (i + 0.5) * cw, Y = (j) => box.y0 + box.h - (j + 0.5) * ch;
    axes(ctx, { ...box, X, Y, xt: LV.map((v, i) => [i, String(v)]), yt: LV.map((v, j) => [j, String(v)]), xlabel: "옥신 (mg/L)", ylabel: "사이토키닌 (mg/L)" });
    const last = {};
    tbl.rows.forEach((r) => { if (r.p === NAME[plant]) last[r.ai + "," + r.ci] = r; });
    Object.values(last).forEach((r) => {
      const cx = X(r.ai), cy = Y(r.ci), bw = Math.min(9, cw / 4.5), bh = ch * 0.8, n = Math.max(1, 10 - r.x);
      [[r.k, "#b08a4a"], [r.s, C.forest], [r.r, "#7f9cbb"]].forEach(([k, col], i) => {
        const x = cx + (i - 1.5) * bw; ctx.fillStyle = C.rule; ctx.fillRect(x, cy - bh / 2, bw - 1, bh);
        ctx.fillStyle = col; ctx.fillRect(x, cy + bh / 2 - bh * k / n, bw - 1, bh * k / n);
      });
      if (r.x) { ctx.strokeStyle = C.warn; ctx.lineWidth = 1.6; const x = cx + 1.6 * bw, y = cy - bh / 2 + 4; ctx.beginPath(); ctx.moveTo(x - 3, y - 3); ctx.lineTo(x + 3, y + 3); ctx.moveTo(x + 3, y - 3); ctx.lineTo(x - 3, y + 3); ctx.stroke(); }
    });
    ctx.font = `11px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "right";
    ctx.fillText(`${NAME[plant]} 절편 기록만 표시`, box.x0 + box.w, 12);
  }

  loop($(".cv-wide"), (dt) => {
    if (dish && dish.t < 1) { dish.t += dt / 2; if (dish.t >= 1) { dish.t = 1; record(dish); } drawApp(); return; }
    return false;
  });
  const upd = () => { $(".a-out").textContent = LV[+$(".a").value]; $(".c-out").textContent = LV[+$(".c").value]; if (!dish || dish.t >= 1) { dish = null; drawApp(); } };
  ["a", "c"].forEach((k) => $("." + k).addEventListener("input", upd));
  root.querySelector(".plant").addEventListener("click", (e) => { const b = e.target.closest("[data-p]"); if (!b) return; plant = b.dataset.p; root.querySelectorAll("[data-p]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); dish = null; drawApp(); drawPlot(); });
  $(".run").addEventListener("click", () => { if (dish && dish.t < 1) return; dish = culture(); drawApp(); });
  $(".clear").addEventListener("click", () => tbl.clear());
  upd();

  if (L.demo) {
    [[4, 0], [4, 1], [4, 2], [4, 3], [4, 4], [4, 5], [1, 4], [2, 4], [3, 4], [5, 4], [0, 0], [2, 2]].forEach(([ai, ci]) => { $(".a").value = ai; $(".c").value = ci; record(culture()); });
    $(".a").value = 2; $(".c").value = 4; upd(); dish = culture(); dish.t = 1; drawApp();
  }
})();
