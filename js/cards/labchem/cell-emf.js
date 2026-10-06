/* 카드: 전지의 전압은 금속이 정할까, 용액이 정할까? — 금속 쌍·염다리·농도에 따른 기전력 측정 */
(() => {
  const root = document.getElementById("card-labchem-cell-emf");
  if (!root) return;
  const { C, F, fit } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);

  /* 표준 환원 전위(V, 25 °C)와 전자 수. eff: 학교 실험에서 실제로 나타나는 전위(모식값, 산화막·부식 반영) */
  const M = {
    Mg: { e0: -2.37, n: 2, eff: -1.60, col: "#b9bcc2", ion: "Mg²⁺" },
    Zn: { e0: -0.76, n: 2, eff: -0.76, col: "#a7b0b8", ion: "Zn²⁺" },
    Fe: { e0: -0.44, n: 2, eff: -0.40, col: "#6f6a66", ion: "Fe²⁺" },
    Pb: { e0: -0.13, n: 2, eff: -0.13, col: "#5d6470", ion: "Pb²⁺" },
    Cu: { e0: 0.34, n: 2, eff: 0.34, col: "#c7773d", ion: "Cu²⁺" },
    Ag: { e0: 0.80, n: 1, eff: 0.80, col: "#d6d8dc", ion: "Ag⁺" },
  };
  const SOL = { Cu: "rgba(80,150,230,", Fe: "rgba(150,190,120,", other: "rgba(205,225,240," };
  let lm = "Zn", rm = "Cu", view = "e0", last = null;

  const tbl = L.table($(".tbl-host"), [
    { key: "l", label: "왼쪽(COM)" }, { key: "cl", label: "c (M)", res: 0.001 }, { key: "r", label: "오른쪽(+)" }, { key: "cr", label: "c (M)", res: 0.001 },
    { key: "b", label: "염다리" }, { key: "v", label: "V (V)", res: 0.001 },
  ], () => drawPlot());
  const app = fit($(".cv-wide"), () => drawApp());
  const pl = fit($(".cv-plot"), () => drawPlot());

  const cOf = (el) => 10 ** +el.value;
  const half = (m, c) => M[m].eff + 0.05916 / M[m].n * Math.log10(c);   // 네른스트 (25 °C)
  function reading() {
    if (!$(".bridge").checked || lm === rm && +$(".cl").value === +$(".cr").value) return L.measure(0, { sd: 0.004, res: 0.001 });
    return L.measure(half(rm, cOf($(".cr"))) - half(lm, cOf($(".cl"))), { sd: 0.004, res: 0.001 });
  }
  /* 전지 반응 Q (왼쪽 산화, 오른쪽 환원 기준): n = 최소공배수 */
  function logQ(r) {
    const nl = M[r.l].n, nr = M[r.r].n, n = nl * nr / (nl === nr ? nl : 1);
    return { n, x: (n / nl) * Math.log10(r.cl) - (n / nr) * Math.log10(r.cr) };
  }

  function drawApp() {
    const { ctx } = app, { w, h } = app.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const bw = Math.min(110, w * 0.26), bh = h * 0.42, by = h - 14 - bh, lx = w * 0.22, rx = w * 0.78;
    const beaker = (cx, m, c) => {
      const base = m === "Cu" ? SOL.Cu : m === "Fe" ? SOL.Fe : SOL.other, a = m === "Cu" || m === "Fe" ? 0.15 + 0.45 * (1 + Math.log10(c) / 3) : 0.45;
      ctx.fillStyle = base + a + ")"; ctx.fillRect(cx - bw / 2, by + bh * 0.25, bw, bh * 0.75);
      ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(cx - bw / 2, by); ctx.lineTo(cx - bw / 2, by + bh); ctx.lineTo(cx + bw / 2, by + bh); ctx.lineTo(cx + bw / 2, by); ctx.stroke();
      ctx.fillStyle = M[m].col; ctx.fillRect(cx - bw * 0.3, by - 34, 16, bh * 0.85 + 34);
      ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.strokeRect(cx - bw * 0.3, by - 34, 16, bh * 0.85 + 34);
      ctx.fillStyle = C.ink; ctx.font = `600 13px ${F.mono}`; ctx.textAlign = "left"; ctx.fillText(m, cx - bw * 0.3 + 20, by - 20);
      ctx.font = `11px ${F.mono}`; ctx.fillStyle = C.ink2; ctx.textAlign = "center"; ctx.fillText(`${M[m].ion} ${c >= 1 ? "1.0" : c.toString()} M`, cx + bw * 0.12, by + bh - 8);
    };
    const cl = cOf($(".cl")), cr = cOf($(".cr"));
    beaker(lx, lm, cl); beaker(rx, rm, cr);
    // 염다리
    if ($(".bridge").checked) {
      ctx.strokeStyle = "#e4dcc4"; ctx.lineWidth = 14; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(lx + bw * 0.25, by + bh * 0.55); ctx.lineTo(lx + bw * 0.25, by - 18); ctx.lineTo(rx - bw * 0.25, by - 18); ctx.lineTo(rx - bw * 0.25, by + bh * 0.55); ctx.stroke();
      ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.lineCap = "butt";
      ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("염다리 KNO₃", w / 2, by - 30);
    } else { ctx.fillStyle = C.warn; ctx.font = `11px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("염다리 없음", w / 2, by - 24); }
    // 전압계와 도선
    const vx = w / 2, vy = 28, vw = 104, vh = 40;
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(lx - bw * 0.3 + 8, by - 34); ctx.lineTo(lx - bw * 0.3 + 8, vy + vh / 2); ctx.lineTo(vx - vw / 2, vy + vh / 2); ctx.stroke();
    ctx.strokeStyle = C.apple; ctx.beginPath(); ctx.moveTo(rx - bw * 0.3 + 8, by - 34); ctx.lineTo(rx - bw * 0.3 + 8, vy + vh / 2); ctx.lineTo(vx + vw / 2, vy + vh / 2); ctx.stroke();
    ctx.fillStyle = C.night; ctx.fillRect(vx - vw / 2, vy, vw, vh);
    ctx.fillStyle = "#9fe08a"; ctx.font = `600 18px ${F.mono}`; ctx.textAlign = "center";
    ctx.fillText(last != null ? `${last.toFixed(3)} V` : "-.--- V", vx, vy + 26);
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3;
    ctx.fillText("COM", vx - vw / 2 - 16, vy + vh / 2 - 6); ctx.fillStyle = C.apple; ctx.fillText("+", vx + vw / 2 + 10, vy + vh / 2 - 6);
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const box = { x0: 48, y0: 18, w: w - 62, h: h - 52 };
    const rows = tbl.rows.filter((r) => r.b === "있음");
    if (view === "e0") {
      const s = rows.filter((r) => r.cl === 1 && r.cr === 1);
      const pts = s.map((r) => ({ x: M[r.r].e0 - M[r.l].e0, y: r.v }));
      const P = L.plot(ctx, box, { pts, model: (x) => x, xr: [-1.5, 3.2], yr: [-1.5, 3.2], xlabel: "E°(오른쪽) − E°(왼쪽) (V)", ylabel: "측정 전압 (V)" });
      ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink2; ctx.textAlign = "left";
      const seen = new Map();
      s.forEach((r) => { const k = r.l + "–" + r.r; if (!seen.has(k)) seen.set(k, r); });
      [...seen.entries()].sort((a, b) => (M[a[1].r].e0 - M[a[1].l].e0) - (M[b[1].r].e0 - M[b[1].l].e0)).forEach(([k, r], i) => {
        const px = P.X(M[r.r].e0 - M[r.l].e0), py = P.Y(r.v);
        ctx.textAlign = i % 2 ? "right" : "left"; ctx.fillText(k, px + (i % 2 ? -6 : 6), py + (i % 2 ? -6 : 13));
      });
      ctx.fillStyle = C.ink3; ctx.textAlign = "right"; ctx.fillText("점선: 측정값 = E° 차이", box.x0 + box.w - 4, box.y0 + box.h - 6);
    } else {
      const s = rows.filter((r) => r.l === lm && r.r === rm);
      const q = s.map((r) => ({ ...logQ(r), y: r.v }));
      const f = q.length > 1 ? L.linfit(q.map((p) => p.x), q.map((p) => p.y)) : null;
      L.plot(ctx, box, { pts: q.map((p) => ({ x: p.x, y: p.y })), fit: f, xr: [-6.5, 6.5], xlabel: `log Q  (${lm}–${rm})`, ylabel: "측정 전압 (V)" });
      ctx.fillStyle = C.warn; ctx.font = `11px ${F.mono}`; ctx.textAlign = "left";
      if (f && Math.abs(f.a) > 1e-3) ctx.fillText(`기울기 ${(f.a * 1000).toFixed(1)} mV → n ≈ ${(0.05916 / Math.abs(f.a)).toFixed(2)}`, box.x0 + 8, box.y0 + 14);
      else { ctx.fillStyle = C.ink3; ctx.fillText(`${lm}–${rm} 쌍에서 농도를 바꿔 두 번 이상 재세요`, box.x0 + 8, box.y0 + 14); }
    }
  }

  function nums() {
    const d = M[rm].e0 - M[lm].e0;
    $(".n-e").textContent = `${d >= 0 ? "+" : ""}${d.toFixed(2)} V`;
    $(".n-v").textContent = last != null ? `${last.toFixed(3)} V` : "—";
    $(".n-d").textContent = last != null ? `${(last - d >= 0 ? "+" : "")}${((last - d) * 1000).toFixed(0)} mV` : "—";
  }
  function measure() {
    last = reading();
    tbl.add({ l: lm, r: rm, cl: cOf($(".cl")), cr: cOf($(".cr")), b: $(".bridge").checked ? "있음" : "없음", v: last });
    drawApp(); nums();
  }
  const reset = () => { last = null; drawApp(); nums(); };
  $(".ml").addEventListener("click", (e) => { const b = e.target.closest("[data-l]"); if (!b) return; lm = b.dataset.l; root.querySelectorAll("[data-l]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); reset(); drawPlot(); });
  $(".mr").addEventListener("click", (e) => { const b = e.target.closest("[data-r]"); if (!b) return; rm = b.dataset.r; root.querySelectorAll("[data-r]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); reset(); drawPlot(); });
  $(".view").addEventListener("click", (e) => { const b = e.target.closest("[data-p]"); if (!b) return; view = b.dataset.p; root.querySelectorAll("[data-p]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); drawPlot(); });
  const upd = () => { $(".cl-out").textContent = cOf($(".cl")) >= 1 ? "1.0" : String(cOf($(".cl"))); $(".cr-out").textContent = cOf($(".cr")) >= 1 ? "1.0" : String(cOf($(".cr"))); reset(); };
  [$(".cl"), $(".cr")].forEach((el) => el.addEventListener("input", upd));
  $(".bridge").addEventListener("change", reset);
  $(".meas").addEventListener("click", measure);
  $(".clear").addEventListener("click", () => { tbl.clear(); reset(); });
  upd();

  if (L.demo) {
    const set = (l, r, a, b, br) => {
      lm = l; rm = r; $(".cl").value = a; $(".cr").value = b; $(".bridge").checked = br !== false; measure();
    };
    set("Zn", "Fe", 0, 0); set("Zn", "Pb", 0, 0); set("Zn", "Cu", 0, 0); set("Zn", "Ag", 0, 0); set("Mg", "Cu", 0, 0); set("Cu", "Zn", 0, 0); set("Pb", "Ag", 0, 0);
    set("Zn", "Cu", -1, 0); set("Zn", "Cu", -2, 0); set("Zn", "Cu", 0, -1); set("Zn", "Cu", 0, -2); set("Zn", "Cu", -3, 0);
    set("Zn", "Cu", 0, 0, false);
    set("Zn", "Cu", 0, 0);
    const keep = last; upd(); last = keep; drawApp(); nums();
  }
})();
