/* 카드: 기기가 그려 준 그래프에서 농도, 작용기, 원소를 어떻게 읽어 낼까? — UV-Vis 검량선, IR 작용기, 질량 스펙트럼 동위원소 묶음 */
(() => {
  const root = document.getElementById("card-labchem-instrument");
  if (!root) return;
  const { C, F, fit, axes } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  let mode = "uv";

  /* ---------- UV-Vis: KMnO4 (모식 흡수 스펙트럼, ε(526) = 2455 L/(mol·cm)) ---------- */
  const BANDS = [[488, 0.33, 11], [507, 0.72, 9.5], [526, 1.0, 9.5], [546, 0.95, 9.5], [566, 0.42, 10]];
  const shape = (l) => BANDS.reduce((s, [c, a, wd]) => s + a * Math.exp(-((l - c) ** 2) / (2 * wd * wd)), 0) + 0.015;
  const EPS = (l) => 2455 * shape(l) / shape(526);
  const STRAY = 0.003;
  const absorb = (c, l) => { const A = EPS(l) * c * 1e-3; return -Math.log10((10 ** -A + STRAY) / (1 + STRAY)); };
  const cx = 0.15 + Math.random() * 0.2;   // 미지 시료의 참 농도 (mM)
  let cSel = "0.1";
  const sLam = $(".lam");
  const lam = () => +sLam.value;

  const tbl = L.table($(".tbl-host"), [
    { key: "s", label: "시료" }, { key: "l", label: "λ (nm)", res: 1 }, { key: "A", label: "A", res: 0.001 },
  ], () => { drawCurve(); drawMain(); });

  function measure() {
    const c = cSel === "x" ? cx : +cSel;
    const bias = $(".noblank").checked ? 0.045 : 0;
    const A = L.measure(absorb(c, lam()), { sd: 0.002, bias, res: 0.001 });
    tbl.add({ s: cSel === "x" ? "미지" : (+cSel).toFixed(3) + " mM", c: cSel === "x" ? null : +cSel, l: lam(), A });
  }

  /* ---------- IR: 모식 스펙트럼 (밴드: 파수, 흡광 세기, 너비) ---------- */
  const IR = {
    ethanol: { name: "에탄올", b: [[3340, 1.1, 140], [2975, 0.8, 22], [2930, 0.45, 18], [2880, 0.4, 18], [1450, 0.35, 18], [1380, 0.3, 14], [1330, 0.22, 18], [1090, 0.55, 18], [1050, 1.1, 18], [880, 0.5, 14]] },
    acetone: { name: "아세톤", b: [[3410, 0.1, 20], [3005, 0.22, 14], [2920, 0.18, 14], [1715, 1.6, 16], [1420, 0.5, 14], [1360, 0.85, 11], [1220, 0.95, 14], [1090, 0.22, 10], [530, 0.4, 12]] },
    acid: { name: "아세트산", b: [[3000, 0.95, 290], [1712, 1.6, 20], [1410, 0.6, 18], [1290, 1.0, 18], [940, 0.6, 40], [620, 0.5, 18]] },
    ester: { name: "아세트산 에틸", b: [[2985, 0.5, 20], [1742, 1.6, 14], [1450, 0.3, 14], [1375, 0.6, 11], [1240, 1.5, 20], [1050, 0.9, 14], [940, 0.2, 10], [850, 0.2, 10]] },
  };
  const irT = (k, v) => 100 * 10 ** -IR[k].b.reduce((s, [c, a, wd]) => s + a * Math.exp(-((v - c) ** 2) / (2 * wd * wd)), 0) * 0.97;

  /* ---------- MS: 모식 질량 스펙트럼 ---------- */
  const MS = {
    mecl: { name: "CH₃Cl", base: 50, nCl: 1, nBr: 0, top: 100, frag: [[15, 12], [35, 6], [37, 2]] },
    mebr: { name: "CH₃Br", base: 94, nCl: 0, nBr: 1, top: 100, frag: [[15, 25], [79, 9], [81, 9]] },
    dcm: { name: "CH₂Cl₂", base: 84, nCl: 2, nBr: 0, top: 65, frag: [[49, 100], [51, 32]] },
    etbr: { name: "C₂H₅Br", base: 108, nCl: 0, nBr: 1, top: 95, frag: [[29, 100], [27, 60], [28, 15], [79, 6], [81, 6]] },
  };
  /* 동위원소 묶음: [Δm, 상대 세기] (최댓값 1) */
  function cluster(nCl, nBr) {
    let d = [1];
    const conv = (p) => { const o = new Array(d.length + 2).fill(0); d.forEach((x, i) => { o[i] += x * p[0]; o[i + 2] += x * p[1]; }); d = o; };
    for (let i = 0; i < nCl; i++) conv([0.7578, 0.2422]);
    for (let i = 0; i < nBr; i++) conv([0.5069, 0.4931]);
    const mx = Math.max(...d);
    return d.map((x, i) => [i, x / mx]).filter(([i, x]) => i % 2 === 0 && x > 0.004);
  }
  function msPeaks(k) {
    const m = MS[k];
    return m.frag.filter(([, y]) => y > 0).concat(cluster(m.nCl, m.nBr).map(([dm, r]) => [m.base + dm, m.top * r]));
  }

  const keysOf = { ir: Object.keys(IR), ms: Object.keys(MS) };
  const unk = { ir: keysOf.ir[Math.floor(Math.random() * 4)], ms: keysOf.ms[Math.floor(Math.random() * 4)] };
  let cur = 1700;

  const main = fit($(".main"), () => drawMain());
  const pl = fit($(".cv-plot"), () => drawCurve());

  function wlColor(l) {
    let r = 0, g = 0, b = 0;
    if (l < 440) { r = (440 - l) / 60; b = 1; } else if (l < 490) { g = (l - 440) / 50; b = 1; } else if (l < 510) { g = 1; b = (510 - l) / 20; }
    else if (l < 580) { r = (l - 510) / 70; g = 1; } else if (l < 645) { r = 1; g = (645 - l) / 65; } else r = 1;
    const f = l < 420 ? 0.3 + 0.7 * (l - 380) / 40 : l > 680 ? 0.3 + 0.7 * (750 - l) / 70 : 1;
    return `rgb(${Math.round(255 * r * f)},${Math.round(255 * g * f)},${Math.round(255 * b * f)})`;
  }

  function drawMain() {
    const { ctx } = main, { w, h } = main.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const box = { x0: 46, y0: 22, w: w - 60, h: h - 62 };
    if (mode === "uv") {
      const X = (l) => box.x0 + (l - 400) / 300 * box.w, Y = (a) => box.y0 + box.h - a / 0.32 * box.h;
      axes(ctx, { ...box, X, Y, xt: [400, 450, 500, 550, 600, 650, 700].map((v) => [v, String(v)]), yt: [0, 0.1, 0.2, 0.3].map((v) => [v, v.toFixed(1)]), xlabel: "λ (nm)", ylabel: "A (0.100 mM, 1 cm)" });
      for (let l = 400; l < 700; l += 2) { ctx.fillStyle = wlColor(l); ctx.fillRect(X(l), box.y0 + box.h + 1, X(l + 2) - X(l) + 0.5, 3); }
      ctx.strokeStyle = "#7a3b8f"; ctx.lineWidth = 1.8; ctx.beginPath();
      for (let l = 400; l <= 700; l += 1) { const y = Y(EPS(l) * 1e-4); l === 400 ? ctx.moveTo(X(l), y) : ctx.lineTo(X(l), y); }
      ctx.stroke();
      ctx.strokeStyle = C.warn; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(X(lam()), box.y0); ctx.lineTo(X(lam()), box.y0 + box.h); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = C.warn; ctx.font = `11px ${F.mono}`; ctx.textAlign = lam() > 600 ? "right" : "left";
      ctx.fillText(`${lam()} nm`, X(lam()) + (lam() > 600 ? -5 : 5), box.y0 + 10);
    } else if (mode === "ir") {
      const X = (v) => box.x0 + (4000 - v) / 3500 * box.w, Y = (t) => box.y0 + box.h - t / 100 * box.h;
      axes(ctx, { ...box, X, Y, xt: [4000, 3500, 3000, 2500, 2000, 1500, 1000, 500].map((v) => [v, String(v)]), yt: [0, 50, 100].map((v) => [v, String(v)]), xlabel: "파수 (cm⁻¹)", ylabel: "투과율 %T" });
      ctx.strokeStyle = C.forest; ctx.lineWidth = 1.4; ctx.beginPath();
      for (let v = 4000; v >= 500; v -= 3) { const y = Y(irT(unk.ir, v)); v === 4000 ? ctx.moveTo(X(v), y) : ctx.lineTo(X(v), y); }
      ctx.stroke();
      ctx.strokeStyle = C.warn; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(X(cur), box.y0); ctx.lineTo(X(cur), box.y0 + box.h); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "right";
      ctx.fillText("미지 액체 (액막)", box.x0 + box.w, box.y0 - 8);
    } else {
      const X = (m) => box.x0 + (m - 10) / 110 * box.w, Y = (r) => box.y0 + box.h - r / 100 * box.h;
      axes(ctx, { ...box, X, Y, xt: [10, 20, 40, 60, 80, 100, 120].map((v) => [v, String(v)]), yt: [0, 50, 100].map((v) => [v, String(v)]), xlabel: "m/z", ylabel: "상대 세기" });
      const pk = msPeaks(unk.ms);
      ctx.strokeStyle = C.forest; ctx.lineWidth = 2.4;
      pk.forEach(([m, r]) => { ctx.beginPath(); ctx.moveTo(X(m), Y(0)); ctx.lineTo(X(m), Y(r)); ctx.stroke(); });
      const u = MS[unk.ms], nCl = +$(".ncl").value, nBr = +$(".nbr").value;
      const top = Math.max(...pk.filter(([m]) => m >= u.base).map(([, r]) => r));
      ctx.strokeStyle = C.warn; ctx.lineWidth = 1.2;
      cluster(nCl, nBr).forEach(([dm, r]) => { const x = X(u.base + dm); ctx.strokeRect(x + 2, Y(top * r), 6, Y(0) - Y(top * r)); });
      ctx.fillStyle = C.ink2; ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "center";
      let lastM = -99;
      pk.filter(([, r]) => r >= 20).sort((a, b) => a[0] - b[0]).forEach(([m, r]) => { if (m - lastM > 5) { ctx.fillText(String(m), X(m) - 6, Y(r) - 5); lastM = m; } });
    }
  }

  function drawCurve() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const rows = tbl.rows.filter((r) => r.l === lam());
    const std = rows.filter((r) => r.c != null), ux = rows.filter((r) => r.c == null);
    const fitr = L.linfit(std.filter((r) => r.c <= 0.45).map((r) => r.c), std.filter((r) => r.c <= 0.45).map((r) => r.A));
    const hi = Math.max(0.5, ...rows.map((r) => r.A)) * 1.08;
    const o = L.plot(ctx, { x0: 46, y0: 20, w: w - 60, h: h - 54 }, { pts: std.map((r) => ({ x: r.c, y: r.A })), fit: fitr, xr: [0, std.some((r) => r.c > 0.45) ? 0.9 : 0.5], yr: [0, hi], xlabel: "c (mM)", ylabel: `A (λ = ${lam()} nm)` });
    let xU = null;
    if (ux.length && fitr && fitr.a > 0) {
      const aU = L.stats(ux.map((r) => r.A)).mean; xU = (aU - fitr.b) / fitr.a;
      ctx.strokeStyle = C.apple; ctx.setLineDash([3, 3]); ctx.lineWidth = 1.2; ctx.beginPath();
      ctx.moveTo(o.X(0), o.Y(aU)); ctx.lineTo(o.X(xU), o.Y(aU)); ctx.lineTo(o.X(xU), o.Y(0)); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = C.apple; ctx.beginPath(); ctx.arc(o.X(xU), o.Y(aU), 4, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "left";
    ctx.fillText("직선: 0.45 mM 이하 표준으로 맞춤 · 빨강: 미지", 46, h - 4);
    $(".n-a").textContent = fitr ? fitr.a.toFixed(3) : "—";
    $(".n-b").textContent = fitr ? fitr.b.toFixed(3) : "—";
    $(".n-r").textContent = fitr ? fitr.r2.toFixed(4) : "—";
    $(".n-x").textContent = xU != null ? xU.toFixed(3) + " mM" : "—";
  }

  /* ---------- 판정 ---------- */
  const msg = $(".msg");
  function idChips() {
    const ks = keysOf[mode] || [];
    $(".idsel").innerHTML = `<span class="mono small dim">미지 물질은</span>` + ks.map((k) => `<button class="chip" data-k="${k}" aria-pressed="false">${(mode === "ir" ? IR : MS)[k].name}</button>`).join("");
  }
  const HINT = {
    ethanol: "넓은 O–H(약 3340)와 강한 C–O(약 1050)가 있고 C=O는 없습니다.",
    acetone: "1715 부근의 깊고 날카로운 C=O만 있고 O–H와 강한 C–O가 없습니다.",
    acid: "2500–3300에 걸친 아주 넓은 O–H와 1712의 C=O가 함께 있습니다(카복실산).",
    ester: "1742의 C=O와 1240의 강한 C–O가 함께 있고 O–H가 없습니다(에스터).",
    mecl: "M = 50, M+2 = 52가 약 3 : 1 → Cl 1개.", mebr: "M = 94, M+2 = 96이 약 1 : 1 → Br 1개.",
    dcm: "84 : 86 : 88이 약 9 : 6 : 1 → Cl 2개. 가장 큰 봉우리 49는 Cl 하나를 잃은 CH₂Cl⁺입니다.",
    etbr: "108 : 110이 약 1 : 1 → Br 1개. 108 − 79 = 29는 C₂H₅⁺입니다.",
  };
  $(".idsel").addEventListener("click", (e) => {
    const b = e.target.closest("[data-k]"); if (!b) return;
    root.querySelectorAll("[data-k]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    const ok = b.dataset.k === unk[mode];
    msg.textContent = (ok ? "맞습니다. " : "아닙니다. 근거를 다시 보세요. ") + (ok ? HINT[b.dataset.k] : "");
  });
  $(".next-unk").addEventListener("click", () => {
    const ks = keysOf[mode], i = ks.indexOf(unk[mode]);
    unk[mode] = ks[(i + 1 + Math.floor(Math.random() * (ks.length - 1))) % ks.length];
    msg.textContent = ""; idChips(); drawMain();
  });

  function setMode(m) {
    mode = m;
    root.querySelectorAll("[data-i]").forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.i === m)));
    $(".p-uv").hidden = m !== "uv"; $(".p-ir").hidden = m !== "ir"; $(".p-ms").hidden = m !== "ms"; $(".p-id").hidden = m === "uv";
    msg.textContent = ""; idChips(); irRead(); drawMain();
  }
  function irRead() {
    $(".k-out").textContent = cur;
    $(".t-out").textContent = irT(unk.ir, cur).toFixed(0) + " %";
  }

  $(".isel").addEventListener("click", (e) => { const b = e.target.closest("[data-i]"); if (b) setMode(b.dataset.i); });
  sLam.addEventListener("input", () => { $(".l-out").textContent = lam(); drawMain(); drawCurve(); });
  $(".csel").addEventListener("click", (e) => {
    const b = e.target.closest("[data-c]"); if (!b) return;
    cSel = b.dataset.c; root.querySelectorAll("[data-c]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
  });
  $(".meas").addEventListener("click", measure);
  $(".truth").addEventListener("click", () => { $(".n-x").textContent = `참 ${cx.toFixed(3)} mM`; });
  $(".clear").addEventListener("click", () => tbl.clear());
  $(".wn").addEventListener("input", (e) => { cur = +e.target.value; irRead(); drawMain(); });
  $(".main").addEventListener("click", (e) => {
    if (mode !== "ir") return;
    const r = e.currentTarget.getBoundingClientRect(), x = e.clientX - r.left, bw = r.width - 60;
    cur = Math.round(NM.clamp(4000 - (x - 46) / bw * 3500, 500, 4000) / 2) * 2;
    $(".wn").value = cur; irRead(); drawMain();
  });
  [".ncl", ".nbr"].forEach((s) => $(s).addEventListener("input", () => { $(".cl-out").textContent = $(".ncl").value; $(".br-out").textContent = $(".nbr").value; drawMain(); }));

  setMode("uv");
  if (L.demo) {
    sLam.value = 526; $(".l-out").textContent = 526;
    ["0.05", "0.1", "0.2", "0.3", "0.4", "0.8", "x", "x", "x"].forEach((c) => { cSel = c; measure(); });
    cSel = "0.1"; drawMain(); drawCurve();
  }
})();
