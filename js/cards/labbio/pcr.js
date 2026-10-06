/* 카드: 온도만 오르내리게 했는데 DNA가 왜 수억 배로 늘어날까? — PCR 온도 프로그램, 프라이머 Tm, 시약 역할, 2ⁿ과 정체기, 젤 확인 */
(() => {
  const root = document.getElementById("card-labbio-pcr");
  if (!root) return;
  const { C, F, fit } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const PRIM = {
    A: ["AGCTGACCTGAAGGTCATCG", "TCCAGGTAGCTGTTGCAGAC"],
    B: ["ATTAAGTTCAATAGCAATCG", "GCGGCCGCTGGCACGCCGTG"],
    C: ["AGCTGACCTGAAGGGAATTC", "TCCAGGTAGCTGTGAATTCG"],
  };
  const tm = (s) => [...s].reduce((t, c) => t + ("AT".includes(c) ? 2 : 4), 0);
  const gc = (s) => Math.round([...s].filter((c) => "GC".includes(c)).length / s.length * 100);
  const LADDER = [3000, 2000, 1500, 1000, 700, 500, 300, 200, 100];
  const N0 = 1e5, NA = 6.022e23;
  const sig = (x) => 1 / (1 + Math.exp(-x));
  let prim = "A", len = 500, runs = [], lanes = [], laneNo = 0;
  const v = (s) => +$(s).value;
  const has = (k) => root.querySelector(`[data-r="${k}"]`).checked;

  function showPrimer() {
    const [f, r] = PRIM[prim], tf = tm(f), tr = tm(r);
    const mark = (s) => (prim === "C" ? s.replace(/GAATTC(G?)$/, "<i>GAATTC</i>$1") : s);
    let warn = "";
    if (Math.abs(tf - tr) > 5) warn = `  ← Tm 차이 ${Math.abs(tf - tr)} °C`;
    if (prim === "C") warn = "  ← 3′ 끝이 서로 상보적";
    $(".pc-primer").innerHTML = `F 5′-${mark(f)}-3′  Tm ${tf} °C, GC ${gc(f)}%\nR 5′-${mark(r)}-3′  Tm ${tr} °C, GC ${gc(r)}%${warn}`;
  }

  function simulate() {
    const [f, r] = PRIM[prim], tlo = Math.min(tm(f), tm(r)), thi = Math.max(tm(f), tm(r));
    const Td = v(".td"), Ta = v(".ta"), te = v(".te"), n = v(".n");
    const ok = has("pri") && has("dntp") && has("taq") && has("mg");
    const Ed = sig((Td - 92.5) / 0.9);
    const Eb = sig((tlo + 2 - Ta) / 1.5);
    const Ee = 1 - Math.exp(-2.5 * te / (len / 1000 * 60));
    const E = ok && has("tmp") ? 0.97 * Ed * Eb * Ee : 0;
    const ns = ok && has("tmp") ? sig((thi - 12 - Ta) / 2) * Ed : 0;
    const Ex = ns * 0.97 * (1 - Math.exp(-2.5 * te / 40));
    const Edim = ok && prim === "C" ? 0.95 * Ed * sig((tlo + 4 - Ta) / 2) : 0;
    const Nmax = Math.min(1.5e12, 1.4e15 / len);
    let N = has("tmp") ? N0 : 0, X = has("tmp") ? N0 * ns : 0, D = Edim ? 1e4 : 0;
    const path = [{ x: 0, y: N }];
    for (let k = 0; k < n; k++) {
      const load = (N + X + D * 0.1) / Nmax;
      const room = Math.max(0, 1 - load);
      N *= 1 + E * room; X *= 1 + Ex * room; D *= 1 + Edim * Math.max(0, 1 - D / 2e12);
      path.push({ x: k + 1, y: N });
    }
    const ng = (cp, bp) => cp * bp * 650 / NA * 1e9;
    const bands = [];
    if (ng(N, len) > 0) bands.push({ bp: len, ng: ng(N, len) });
    if (X > 0) { bands.push({ bp: Math.round(len * 0.62), ng: ng(X, len * 0.62) * 0.6 }); bands.push({ bp: Math.round(len * 1.7), ng: ng(X, len * 1.7) * 0.4 }); }
    if (D > 0) bands.push({ bp: 50, ng: ng(D, 50) });
    return { path, bands, E, N };
  }

  const tbl = L.table($(".tbl-host"), [
    { key: "ln", label: "레인" }, { key: "p", label: "프라이머" }, { key: "prog", label: "결합·신장·사이클" }, { key: "len", label: "표적 (bp)" }, { key: "miss", label: "뺀 시약" }, { key: "seen", label: "보이는 띠 (bp)" }, { key: "y", label: "표적 생성량 (ng)" },
  ], () => drawPlot());
  const app = fit($(".cv-wide"), () => drawApp());
  const pl = fit($(".cv-plot"), () => drawPlot());

  function run() {
    const s = simulate();
    const load = 0.1;   // 50 μL 중 5 μL
    const vis = s.bands.filter((b) => b.ng * load >= 2);
    laneNo++;
    lanes.push({ no: laneNo, bands: s.bands.map((b) => ({ ...b, ng: b.ng * load })) });
    if (lanes.length > 5) lanes.shift();
    runs.push({ no: laneNo, path: s.path });
    if (runs.length > 4) runs.shift();
    const miss = ["tmp", "pri", "dntp", "taq", "mg"].filter((k) => !has(k)).map((k) => ({ tmp: "주형", pri: "프라이머", dntp: "dNTP", taq: "Taq", mg: "Mg²⁺" })[k]).join(", ") || "없음";
    const main = s.bands.find((b) => b.bp === len);
    tbl.add({ ln: laneNo, p: prim, prog: `${v(".ta")}°/${v(".te")}s/${v(".n")}`, len, miss, seen: vis.length ? vis.map((b) => b.bp).join(", ") : "없음", y: main && main.ng * load >= 2 ? Math.round(L.measure(main.ng, { rel: 0.3 }) / 10) * 10 : "—" });
    const extra = vis.filter((b) => b.bp !== len);
    $(".pc-msg").textContent = !vis.length ? "띠가 보이지 않습니다. 빠진 시약이나 온도 프로그램을 점검하세요." : extra.some((b) => b.bp === 50) ? "젤 아래쪽에 아주 짧은 띠가 보입니다: 프라이머 이합체입니다." : extra.length ? "표적 말고도 다른 크기의 띠가 생겼습니다: 비특이적 증폭입니다." : `표적 ${len} bp 띠 하나가 깨끗하게 나왔습니다. 사이클마다 평균 ${((s.E) * 100).toFixed(0)}%씩 늘어난 셈입니다(정체기 전).`;
    drawApp();
  }

  const dist = (bp) => 7 * (4 - Math.log10(bp)) / 2.3;
  function drawApp() {
    const { ctx } = app, { w, h } = app.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    // 온도 프로그램 (한 사이클)
    const px = 34, py = 24, pw = w * 0.5, ph = h - 64;
    const T = (c) => py + ph - (c - 40) / 60 * ph;
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "right";
    [40, 60, 80, 100].forEach((c) => { ctx.fillText(c, px - 4, T(c) + 3); ctx.fillStyle = C.rule; ctx.fillRect(px, T(c), pw, 1); ctx.fillStyle = C.ink3; });
    ctx.textAlign = "left"; ctx.fillText("°C", px - 26, py - 8);
    const Td = v(".td"), Ta = v(".ta"), te = v(".te");
    const seg = [[Td, 30, "변성"], [Ta, 30, "결합"], [72, te, "신장"]];
    const tot = seg.reduce((s, x) => s + x[1], 0) + 30, X = (t) => px + 8 + t / tot * (pw - 16);
    ctx.strokeStyle = C.warn; ctx.lineWidth = 2.2; ctx.beginPath();
    let t = 0; ctx.moveTo(X(0), T(Td));
    seg.forEach(([c, d], i) => { if (i) ctx.lineTo(X(t + 5), T(c)); ctx.lineTo(X(t + d + 5), T(c)); t += d + 10; });
    ctx.lineTo(X(t), T(Td)); ctx.stroke();
    t = 0; ctx.font = `11px ${F.sans}`; ctx.fillStyle = C.ink; ctx.textAlign = "center";
    seg.forEach(([c, d, lab]) => { const mx = X(t + 5 + d / 2); ctx.fillText(lab, mx, T(c) - 18); ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink2; ctx.fillText(`${c}° ${d}s`, mx, T(c) - 6); ctx.font = `11px ${F.sans}`; ctx.fillStyle = C.ink; t += d + 10; });
    ctx.fillStyle = C.ink2; ctx.font = `12px ${F.mono}`; ctx.textAlign = "left";
    ctx.fillText(`× ${v(".n")} 사이클`, px, h - 10);
    // 젤
    const gx = w * 0.62, gy = 22, gw = w - gx - 8, gh = h - 34, Y = (d) => gy + 10 + d / 7.2 * (gh - 16);
    ctx.fillStyle = "#1f2a33"; ctx.fillRect(gx, gy, gw, gh);
    const all = [{ no: "M", bands: LADDER.map((bp) => ({ bp, ng: 20 })) }, ...lanes];
    const lw = gw / 6;
    all.forEach((ln, i) => {
      const x = gx + i * lw + lw * 0.15, bw = lw * 0.7;
      ctx.fillStyle = "#0e1418"; ctx.fillRect(x, gy + 4, bw, 4);
      ln.bands.forEach((b) => {
        if (b.ng < 2) return;
        const a = Math.min(1, 0.25 + Math.log10(b.ng / 2) * 0.35), y = Y(dist(b.bp));
        ctx.fillStyle = `rgba(255,190,90,${a})`;
        if (b.bp === 50) { ctx.fillRect(x, y - 3, bw, 6); } else ctx.fillRect(x, y - 1.6, bw, 3.2);
      });
      ctx.fillStyle = C.ink2; ctx.font = `10px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText(String(ln.no), x + bw / 2, gy - 5);
    });
    ctx.fillStyle = "rgba(255,255,255,.55)"; ctx.font = `9px ${F.mono}`; ctx.textAlign = "left";
    [3000, 1000, 500, 100].forEach((bp) => ctx.fillText(bp >= 1000 ? bp / 1000 + "k" : String(bp), gx + 2, Y(dist(bp)) - 3));
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const last = runs[runs.length - 1];
    const lg = (p) => ({ x: p.x, y: p.y > 0 ? Math.log10(p.y) : NaN });
    const P = L.plot(ctx, { x0: 44, y0: 30, w: w - 58, h: h - 64 }, { pts: last ? last.path.map(lg) : [], model: (x) => Math.log10(N0) + x * Math.log10(2), xr: [0, 40], yr: [4, 14], xlabel: "사이클 수 n", ylabel: "log₁₀(표적 복사본 수)" });
    const cols = [C.ink3, C.amber, "#3b6fb5", C.forest];
    runs.forEach((r, i) => {
      const col = cols[(r.no - 1) % 4];
      ctx.strokeStyle = col; ctx.lineWidth = 1.4; ctx.beginPath();
      let started = false;
      r.path.forEach((p) => { if (!(p.y > 0)) return; const x = P.X(p.x), y = P.Y(Math.min(14, Math.log10(p.y))); started ? ctx.lineTo(x, y) : ctx.moveTo(x, y); started = true; });
      ctx.stroke();
      const e = r.path[r.path.length - 1];
      ctx.fillStyle = col; ctx.fillRect(52, 40 + i * 15, 14, 2); ctx.font = `10px ${F.mono}`; ctx.textAlign = "left";
      ctx.fillText(`레인 ${r.no}${e && e.y > 0 ? "" : " (증폭 없음)"}`, 70, 44 + i * 15);
    });
    ctx.fillStyle = C.ink3; ctx.font = `11px ${F.mono}`; ctx.textAlign = "right"; ctx.fillText("점선: N₀ × 2ⁿ", w - 14, 14);
  }

  const outs = () => { ["td", "ta", "te", "n"].forEach((k) => { $(`.${k}-out`).textContent = $("." + k).value; }); drawApp(); };
  ["td", "ta", "te", "n"].forEach((k) => $("." + k).addEventListener("input", outs));
  const pick = (sel, attr, f) => root.querySelector(sel).addEventListener("click", (e) => { const b = e.target.closest(`[${attr}]`); if (!b) return; root.querySelectorAll(`${sel} [${attr}]`).forEach((x) => x.setAttribute("aria-pressed", String(x === b))); f(b); });
  pick(".prim", "data-p", (b) => { prim = b.dataset.p; showPrimer(); });
  pick(".len", "data-l", (b) => { len = +b.dataset.l; });
  $(".run").addEventListener("click", run);
  $(".clear").addEventListener("click", () => { tbl.clear(); runs = []; lanes = []; laneNo = 0; drawApp(); drawPlot(); });
  showPrimer(); outs();

  if (L.demo) {
    const set = (o) => { Object.entries(o).forEach(([k, val]) => { $("." + k).value = val; }); };
    const setP = (p) => { prim = p; root.querySelectorAll("[data-p]").forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.p === p))); showPrimer(); };
    set({ ta: 58, te: 60, n: 30 }); run();
    set({ ta: 46 }); run();
    root.querySelector('[data-r="tmp"]').checked = false; set({ ta: 58 }); run(); root.querySelector('[data-r="tmp"]').checked = true;
    setP("C"); run();
    setP("A"); set({ ta: 58, te: 60, n: 15 }); run();
    set({ n: 30 }); outs();
  }
})();
