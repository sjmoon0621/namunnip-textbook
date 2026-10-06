/* 카드: 오염 물질과 무 씨앗의 발아·뿌리 생장 — 농도 계열, 반복 접시, 상대 뿌리 길이, EC50 (교육용 모형값) */
(() => {
  const root = document.getElementById("card-labbio-pollutant");
  if (!root) return;
  const { C, F, fit } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const [cvD, cvP] = root.querySelectorAll("canvas");
  /* 물질: 이름, 단위, 농도 계열, 뿌리 EC50·기울기, 발아 EC50·기울기 (교육용 모형값). 산성비는 pH로 고르고 초과 [H⁺]로 계산 */
  const PO = [
    { n: "염화 나트륨", u: "mM", cs: [0, 25, 50, 100, 200, 400], e: 85, h: 2, eg: 220, hg: 3 },
    { n: "황산 구리", u: "mg/L Cu²⁺", cs: [0, 0.5, 1, 2, 4, 8], e: 2.0, h: 1.5, eg: 60, hg: 2 },
    { n: "합성 세제", u: "mg/L", cs: [0, 12.5, 25, 50, 100, 200], e: 45, h: 1.8, eg: 320, hg: 2 },
    { n: "인공 산성비", u: "pH", cs: [5.6, 4.5, 4.0, 3.5, 3.0, 2.5], e: 1e-3, h: 1.4, eg: 5e-3, hg: 2, ph: true },
  ];
  const L0 = 36, G0 = 0.93, NS = 20;   /* 대조군 3일 뿌리 길이(mm), 대조군 발아율, 접시당 씨앗 수 */
  let pol = 0, ci = 0, xLog = false, shown = [];

  const dose = (p, c) => (p.ph ? Math.max(0, 10 ** -c - 10 ** -5.6) : c);
  const isCtl = (p, c) => (p.ph ? c === 5.6 : c === 0);
  const ll = (x, e, h) => (x <= 0 ? 1 : 1 / (1 + (x / e) ** h));

  const dv = fit(cvD, () => drawDish());
  const pl = fit(cvP, () => { drawPlot(); });
  const tbl = L.table($(".tbl-host"), [
    { key: "pn", label: "물질" }, { key: "cl", label: "농도" }, { key: "g", label: "발아 /20", res: 1 },
    { key: "gp", label: "발아율 %", res: 1 }, { key: "rl", label: "뿌리 평균 mm", res: 0.1 },
  ], () => { drawPlot(); });

  function concChips() {
    const p = PO[pol];
    $(".conc").innerHTML = `<span class="mono small dim">${p.ph ? "pH" : "농도"}</span>` + p.cs.map((c, i) => `<button class="chip" data-c="${i}" aria-pressed="${i === ci}">${p.ph ? (i ? c.toFixed(1) : "5.6 (대조)") : (i ? c + " " + p.u : "0 (대조)")}</button>`).join("");
    root.querySelectorAll("[data-x]").forEach((b) => { b.disabled = !!p.ph; });
  }

  function dish(pi, cidx, rec = true) {
    const p = PO[pi], c = p.cs[cidx], open = $(".open").checked;
    const x = dose(p, c) * (open ? 1.6 : 1);
    const pg = G0 * ll(x, p.eg, p.hg), mu = L0 * ll(x, p.e, p.h) * (open ? 0.85 : 1) * Math.exp(0.08 * L.gauss());
    const seeds = [];
    for (let i = 0; i < NS; i++) {
      const g = Math.random() < pg;
      seeds.push({ g, len: g ? Math.max(1, L.snap(mu * (1 + 0.3 * L.gauss()), 1)) : 0, a: Math.random() * 6.28, r: Math.sqrt(Math.random()) });
    }
    const gl = seeds.filter((s) => s.g);
    const rl = gl.length ? gl.reduce((s, x) => s + x.len, 0) / gl.length : 0;
    shown.push({ pi, c, seeds, lab: p.ph ? `pH ${c}` : `${c} ${p.u}` });
    if (shown.length > 3) shown.shift();
    if (rec) tbl.add({ p: pi, c, pn: p.n, cl: p.ph ? `pH ${c}` : `${c}`, g: gl.length, gp: gl.length / NS * 100, rl, open });
  }

  function drawDish() {
    const { ctx } = dv, { w, h } = dv.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const R = Math.min(w / 6.6, (h - 34) / 2);
    for (let k = 0; k < 3; k++) {
      const cx = w * (k + 0.5) / 3, cy = 8 + R, d = shown[k];
      ctx.fillStyle = "#f6f4ec"; ctx.strokeStyle = C.ink3; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#ece8d8"; ctx.beginPath(); ctx.arc(cx, cy, R - 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = C.ink2; ctx.font = `11px ${F.mono}`; ctx.textAlign = "center";
      if (!d) { ctx.fillText("빈 접시", cx, cy + R + 16); continue; }
      const sc = (R - 8) / 70;   /* 1 mm → 픽셀 */
      for (const s of d.seeds) {
        const sx = cx + Math.cos(s.a) * s.r * (R - 18) * 0.75, sy = cy + Math.sin(s.a) * s.r * (R - 18) * 0.75;
        if (s.g) {
          const dir = s.a + 0.6, len = s.len * sc;
          ctx.strokeStyle = "#e9e6dd"; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(sx, sy);
          ctx.quadraticCurveTo(sx + Math.cos(dir) * len * 0.6 + 3, sy + Math.sin(dir) * len * 0.6, sx + Math.cos(dir + 0.3) * len, sy + Math.sin(dir + 0.3) * len); ctx.stroke();
          ctx.strokeStyle = "#b8ad8c"; ctx.lineWidth = 0.8; ctx.stroke();
        }
        ctx.fillStyle = s.g ? "#8a5a3c" : "#6b5a4c"; ctx.beginPath(); ctx.ellipse(sx, sy, 3, 2.4, s.a, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = C.ink; ctx.font = `600 11px ${F.sans}`;
      ctx.fillText(`${PO[d.pi].n} ${d.lab}`, cx, cy + R + 16);
    }
  }

  function groups(pi) {
    const p = PO[pi], rs = tbl.rows.filter((r) => r.p === pi);
    const ctl = rs.filter((r) => isCtl(p, r.c)).map((r) => r.rl);
    const cm = ctl.length ? ctl.reduce((s, x) => s + x, 0) / ctl.length : NaN;
    return { cm, gs: p.cs.map((c) => {
      const g = rs.filter((r) => r.c === c);
      const a = L.stats(g.map((r) => r.rl / cm * 100)), b = L.stats(g.map((r) => r.gp));
      return { c, x: p.ph ? c : c, n: g.length, rel: a.mean, se: a.se, gp: b.mean };
    }).filter((q) => q.n) };
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const p = PO[pol], { cm, gs } = groups(pol);
    const useLog = xLog && !p.ph;
    const xv = (c) => (useLog ? Math.log10(c) : c);
    const data = gs.filter((q) => !(useLog && q.c === 0));
    const box = { x0: 40, y0: 34, w: w - 54, h: h - 68 };
    const nz = p.cs.filter((c) => c > 0);
    const xr = p.ph ? [2.3, 5.8] : useLog ? [Math.log10(nz[0]) - 0.2, Math.log10(nz[nz.length - 1]) + 0.2] : [0, p.cs[p.cs.length - 1] * 1.05];
    const g = L.plot(ctx, box, { pts: Number.isFinite(cm) ? data.map((q) => ({ x: xv(q.c), y: q.rel, ey: q.n > 1 ? q.se : 0 })) : [], xr, yr: [0, 125], xlabel: p.ph ? "pH" : useLog ? `log₁₀ 농도 (${p.u})` : `농도 (${p.u})`, ylabel: "대조군 대비 %" });
    ctx.strokeStyle = C.ink3; ctx.setLineDash([2, 4]); ctx.lineWidth = 1;
    [50, 100].forEach((v) => { ctx.beginPath(); ctx.moveTo(box.x0, g.Y(v)); ctx.lineTo(box.x0 + box.w, g.Y(v)); ctx.stroke(); });
    ctx.setLineDash([]);
    /* 발아율 */
    ctx.fillStyle = C.amber; ctx.strokeStyle = C.amber;
    data.forEach((q) => { const px = g.X(xv(q.c)), py = g.Y(q.gp); ctx.beginPath(); ctx.rect(px - 3, py - 3, 6, 6); ctx.fill(); });
    /* 뿌리 선 */
    if (Number.isFinite(cm)) {
      const s = data.slice().sort((a, b) => xv(a.c) - xv(b.c));
      ctx.strokeStyle = C.forest; ctx.lineWidth = 1.2; ctx.beginPath(); s.forEach((q, i) => (i ? ctx.lineTo(g.X(xv(q.c)), g.Y(q.rel)) : ctx.moveTo(g.X(xv(q.c)), g.Y(q.rel)))); ctx.stroke();
    }
    ctx.font = `11px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillStyle = C.forest; ctx.beginPath(); ctx.arc(box.x0 + 130, 14, 3.2, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = C.ink2; ctx.fillText("뿌리 길이", box.x0 + 137, 18);
    ctx.fillStyle = C.amber; ctx.fillRect(box.x0 + 205, 11, 6, 6); ctx.fillStyle = C.ink2; ctx.fillText("발아율", box.x0 + 215, 18);
    if (!Number.isFinite(cm) && gs.length) { ctx.fillStyle = C.warn; ctx.textAlign = "center"; ctx.fillText("대조군 접시가 있어야 상대 길이를 계산합니다", box.x0 + box.w / 2, box.y0 + box.h / 2); }
    nums(p, cm, gs);
  }

  function nums(p, cm, gs) {
    $(".n-c").textContent = Number.isFinite(cm) ? `${cm.toFixed(1)} mm` : "—";
    const s = gs.filter((q) => Number.isFinite(q.rel)).sort((a, b) => dose(p, a.c) - dose(p, b.c));
    let e = "—";
    for (let i = 1; i < s.length; i++) {
      const a = s[i - 1], b = s[i];
      if (a.rel >= 50 && b.rel < 50) {
        const t = (a.rel - 50) / (a.rel - b.rel);
        if (p.ph) e = `pH ${(a.c + (b.c - a.c) * t).toFixed(2)}`;
        else if (a.c === 0) e = `${(b.c * t).toFixed(2)} ${p.u}`;
        else e = `${(10 ** (Math.log10(a.c) + (Math.log10(b.c) - Math.log10(a.c)) * t)).toPrecision(2)} ${p.u}`;
        break;
      }
    }
    if (e === "—" && s.length > 2 && s[s.length - 1].rel >= 50) e = "최고 농도에서도 50% 이상";
    $(".n-e").textContent = e;
    const hi = s.length ? s[s.length - 1] : null;
    $(".n-g").textContent = hi && hi.c !== (p.ph ? 5.6 : 0) ? `${hi.gp.toFixed(0)}%` : "—";
  }

  $(".pol").addEventListener("click", (e) => {
    const b = e.target.closest("[data-p]"); if (!b) return;
    pol = +b.dataset.p; ci = 0; root.querySelectorAll("[data-p]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    concChips(); drawPlot();
  });
  $(".conc").addEventListener("click", (e) => {
    const b = e.target.closest("[data-c]"); if (!b) return;
    ci = +b.dataset.c; root.querySelectorAll("[data-c]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
  });
  $(".xsel").addEventListener("click", (e) => {
    const b = e.target.closest("[data-x]"); if (!b || b.disabled) return;
    xLog = b.dataset.x === "log"; root.querySelectorAll("[data-x]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); drawPlot();
  });
  $(".one").addEventListener("click", () => { dish(pol, ci); drawDish(); });
  $(".series").addEventListener("click", () => { PO[pol].cs.forEach((c, i) => dish(pol, i)); drawDish(); });
  $(".clear").addEventListener("click", () => { shown = []; tbl.clear(); drawDish(); });
  concChips();
  if (L.demo) {
    for (let r = 0; r < 3; r++) PO[0].cs.forEach((c, i) => dish(0, i));
    shown = []; [0, 3, 5].forEach((i) => dish(0, i, false)); drawDish();
    root.querySelector('[data-x="log"]').click();
  }
})();
