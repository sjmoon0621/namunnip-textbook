/* 카드: 해파리 유전자를 넣은 대장균만 골라낼 수 있을까? — pGLO 형질 전환, CaCl₂·열 충격·회복, 선택 배지, 효율 계산 */
(() => {
  const root = document.getElementById("card-labbio-transformation");
  if (!root) return;
  const { C, F, fit, clamp } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const DNA_UG = 0.8 * 100 / 510;   // 평판에 펼친 플라스미드 (μg)
  const PL = [
    { lab: ["+pGLO", "LB/amp"], ara: false, amp: true, plus: true },
    { lab: ["+pGLO", "LB/amp/ara"], ara: true, amp: true, plus: true },
    { lab: ["−pGLO", "LB/amp"], ara: false, amp: true, plus: false },
    { lab: ["−pGLO", "LB"], ara: false, amp: false, plus: false },
  ];
  const OPT = [["none", "자라지 않음"], ["white", "콜로니 (빛 없음)"], ["glow", "콜로니 (자외선에서 초록빛)"], ["lawn", "잔디처럼 빽빽함"]];
  const TRUTH = ["white", "glow", "none", "lawn"];
  let temp = 42, uv = false, res = null;

  root.querySelectorAll("select[data-p]").forEach((s) => { s.innerHTML = `<option value="">예측…</option>` + OPT.map(([v, t]) => `<option value="${v}">${t}</option>`).join(""); });

  function efficiency() {
    const t = +$(".hs").value;
    let f = ($(".cacl").checked ? 1 : 0.01) * ($(".ice").checked ? 1 : 0.3) * ($(".rec").checked ? 1 : 0.6);
    if (temp === 42) f *= (0.06 + 0.94 * Math.exp(-(((t - 50) / 38) ** 2))) * Math.exp(-Math.max(0, t - 70) / 90);
    else if (temp === 37) f *= 0.06;
    else f *= t ? 0.5 * Math.exp(-t / 20) : 0.06;   // 50 °C: 세포가 죽음
    const surv = temp === 50 ? Math.exp(-t / 25) : 1;
    return { eff: 1.5e3 * f, surv, t };
  }
  const poisson = (m) => Math.max(0, Math.round(m + Math.sqrt(m) * L.gauss()));
  let seed = 3;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };

  function culture() {
    const e = efficiency(), m = e.eff * DNA_UG;
    const n1 = poisson(m), n2 = poisson(m * 0.95);
    const lawnOK = e.surv > 0.02;
    res = { n: [n1, n2, 0, lawnOK ? -1 : poisson(e.surv * 4e4)], e, spots: PL.map(() => Array.from({ length: 400 }, () => { const r = Math.sqrt(rnd()) * 0.9, a = rnd() * Math.PI * 2; return [r * Math.cos(a), r * Math.sin(a), 0.6 + rnd() * 0.8]; })) };
    const show = (n) => (n > 300 ? "300 넘음" : n);
    tbl.add({
      c: `${$(".cacl").checked ? "CaCl₂" : "CaCl₂ 없음"}${$(".ice").checked ? "" : ", 얼음 없음"}${$(".rec").checked ? "" : ", 회복 없음"}`,
      h: `${temp} °C ${e.t} s`, a: show(n1), b: show(n2), x: 0, l: lawnOK ? "잔디" : show(res.n[3]),
      eff: n1 <= 300 ? Math.round(n1 / DNA_UG) : "—", hs: temp === 42 ? e.t : null, ok: $(".cacl").checked && $(".ice").checked && $(".rec").checked,
    });
    $(".tf-msg").textContent = `①의 콜로니 ${show(n1)}개 ÷ 펼친 DNA ${DNA_UG.toFixed(3)} μg = 효율 ${n1 <= 300 ? Math.round(n1 / DNA_UG).toLocaleString() : "(셀 수 없음)"} /μg`;
  }

  const tbl = L.table($(".tbl-host"), [
    { key: "c", label: "처리" }, { key: "h", label: "열 충격" }, { key: "a", label: "① 콜로니" }, { key: "b", label: "② 콜로니" }, { key: "x", label: "③" }, { key: "l", label: "④" }, { key: "eff", label: "효율 (/μg)", res: 1 },
  ], () => drawPlot());
  const app = fit($(".cv-wide"), () => drawApp());
  const pl = fit($(".cv-plot"), () => drawPlot());

  function drawApp() {
    const { ctx } = app, { w, h } = app.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    if (uv) { ctx.fillStyle = "#15131f"; ctx.fillRect(0, 0, w, h); }
    const R = Math.min(w / 8 - 8, h * 0.3), cy = h * 0.42;
    PL.forEach((p, i) => {
      const cx = w / 8 + i * w / 4;
      ctx.fillStyle = uv ? "#2a2540" : p.ara ? "#f1e3b8" : "#efe0b0";
      ctx.strokeStyle = uv ? "#6a6390" : C.ink2; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      if (res) {
        const n = res.n[i];
        if (n === -1 || n > 400) { ctx.fillStyle = uv ? "rgba(200,200,220,.25)" : "rgba(235,232,215,.95)"; ctx.beginPath(); ctx.arc(cx, cy, R * 0.9, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = uv ? "rgba(255,255,255,.15)" : "rgba(200,190,160,.6)"; for (let k = 0; k < 160; k++) { const s = res.spots[i][k]; ctx.fillRect(cx + s[0] * R, cy + s[1] * R, 1.5, 1.5); } }
        else for (let k = 0; k < Math.min(n, 400); k++) {
          const s = res.spots[i][k], glow = uv && p.ara && p.plus;
          ctx.fillStyle = glow ? "#7dff8a" : uv ? "rgba(220,220,230,.35)" : "#fbf8ee";
          if (glow) { ctx.shadowColor = "#5cff70"; ctx.shadowBlur = 6; }
          ctx.beginPath(); ctx.arc(cx + s[0] * R, cy + s[1] * R, 1.4 * s[2] + 0.6, 0, Math.PI * 2); ctx.fill();
          ctx.shadowBlur = 0;
          if (!uv) { ctx.strokeStyle = "rgba(150,140,110,.6)"; ctx.lineWidth = 0.5; ctx.stroke(); }
        }
      }
      ctx.fillStyle = uv ? "#d8d4ec" : C.ink; ctx.font = `600 12px ${F.mono}`; ctx.textAlign = "center";
      ctx.fillText(`${"①②③④"[i]} ${p.lab[0]}`, cx, cy + R + 18);
      ctx.font = `11px ${F.mono}`; ctx.fillStyle = uv ? "#a9a3c8" : C.ink2;
      ctx.fillText(p.lab[1], cx, cy + R + 34);
      if (res) { const n = res.n[i]; ctx.fillText(n === -1 ? "잔디" : n > 300 ? "300 넘음" : `${n}개`, cx, cy + R + 50); }
    });
    if (uv) { ctx.fillStyle = "#b9a8ff"; ctx.font = `11px ${F.mono}`; ctx.textAlign = "left"; ctx.fillText("자외선 365 nm", 8, 14); }
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const rows = tbl.rows.filter((r) => r.hs != null && r.ok && typeof r.eff === "number");
    const pts = rows.map((r) => ({ x: r.hs, y: r.eff / 1000 }));
    L.plot(ctx, { x0: 44, y0: 30, w: w - 58, h: h - 64 }, { pts, xr: [0, 125], yr: [0, Math.max(2.4, ...pts.map((p) => p.y * 1.15))], xlabel: "42 °C 열 충격 시간 (s)", ylabel: "효율 (×10³ /μg)" });
    ctx.font = `11px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "right";
    ctx.fillText("CaCl₂·얼음·회복을 모두 한 기록만", w - 14, 14);
  }

  root.querySelector(".temp").addEventListener("click", (e) => { const b = e.target.closest("[data-c]"); if (!b) return; temp = +b.dataset.c; root.querySelectorAll("[data-c]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); });
  $(".hs").addEventListener("input", () => { $(".hs-out").textContent = $(".hs").value; });
  $(".run").addEventListener("click", () => { culture(); drawApp(); });
  $(".uv").addEventListener("click", () => { uv = !uv; $(".uv").setAttribute("aria-pressed", String(uv)); drawApp(); });
  $(".check").addEventListener("click", () => {
    let ok = 0;
    root.querySelectorAll("select[data-p]").forEach((s, i) => { const r = s.value === TRUTH[i]; s.classList.toggle("ok", r); s.classList.toggle("no", !r); ok += r; });
    $(".tf-msg").textContent = ok === 4 ? "네 평판 모두 맞혔습니다. 각 평판이 어떤 대조 역할을 하는지 설명해 보세요." : `${ok}/4 맞았습니다. 선택 배지(amp)는 생존을, 아라비노스(ara)는 GFP 발현을 정한다는 점을 떠올려 보세요.`;
  });
  $(".clear").addEventListener("click", () => tbl.clear());
  drawApp();

  if (L.demo) {
    [0, 10, 30, 50, 50, 70, 90, 120].forEach((t) => { $(".hs").value = t; culture(); });
    $(".cacl").checked = false; $(".hs").value = 50; culture(); $(".cacl").checked = true;
    $(".hs").value = 50; $(".hs-out").textContent = "50"; culture();
    root.querySelectorAll("select[data-p]").forEach((s, i) => { s.value = ["white", "glow", "none", "white"][i]; });
    $(".check").click(); uv = true; $(".uv").setAttribute("aria-pressed", "true"); drawApp();
  }
})();
