/* 카드: 눈금 실린더와 뷰렛은 소수 몇째 자리까지 읽어야 할까? — 메니스커스 읽기, 시차, 차감법, 유효숫자 */
(() => {
  const root = document.getElementById("card-labchem-sigfig");
  if (!root) return;
  const { C, F, fit } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const RHO = 0.9982;   // 20 °C 물의 밀도 (g/mL)
  const TOOLS = {
    cyl: { name: "100 mL 눈금 실린더", short: "실린더", div: 1, dec: 1, up: true, lab: 5, vmin: 20, vmax: 90, tare: 128.4 },
    bur: { name: "50 mL 뷰렛", short: "뷰렛", div: 0.1, dec: 2, up: false, lab: 1, vmin: 8, vmax: 30, tare: 31.7 },
  };
  const PX = 20;   // 한 칸(최소 눈금)의 화면 높이
  let tk = "cyl", smp = null, last = null;
  const sEye = $(".eye"), inp = $(".vin"), msg = $(".rd-msg");

  const app = fit($(".cv-wide"), () => draw());
  const pl = fit($(".cv-plot"), () => drawPlot());
  const tbl = L.table($(".tbl-host"), [
    { key: "tool", label: "기구" }, { key: "V", label: "V (mL)" }, { key: "m", label: "m (g)" },
    { key: "rho", label: "ρ (g/mL)" }, { key: "j", label: "판정" },
  ], () => { drawPlot(); nums(); });

  function newSample(t = tk) {
    const T = TOOLS[t];
    const V = T.vmin + Math.random() * (T.vmax - T.vmin);
    const tare = T.tare + Math.random() * 3;
    smp = {
      t, V, ctr: V + (Math.random() - 0.5) * 3 * T.div,
      m0: L.measure(tare, { sd: 0.004, res: 0.01 }), m1: L.measure(tare + RHO * V, { sd: 0.004, res: 0.01 }),
    };
  }
  const eye = () => +sEye.value;
  const shiftPx = () => eye() * 0.15 * PX;   // 시차: 눈이 위에 있으면 메니스커스가 눈금에 대해 위로 보인다
  const apparent = () => { const T = TOOLS[smp.t]; return smp.V + (T.up ? 1 : -1) * eye() * 0.15 * T.div; };

  function draw() {
    const { ctx } = app, { w, h } = app.size; if (!w || !smp) return;
    ctx.clearRect(0, 0, w, h);
    const T = TOOLS[smp.t];
    const tL = 46, tR = Math.round(w * 0.46), mid = h / 2;
    const yOf = (v) => mid + (T.up ? -1 : 1) * (v - smp.ctr) / T.div * PX;
    const yM = yOf(smp.V) - shiftPx();
    ctx.save(); ctx.beginPath(); ctx.rect(0, 8, w * 0.6, h - 16); ctx.clip();
    // 액체
    ctx.fillStyle = "rgba(120,170,215,0.30)";
    ctx.beginPath(); ctx.moveTo(tL, yM - 9);
    for (let i = 0; i <= 20; i++) { const x = tL + (tR - tL) * i / 20, u = (i / 10 - 1); ctx.lineTo(x, yM - 9 * u * u); }
    ctx.lineTo(tR, h); ctx.lineTo(tL, h); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "#3d6f99"; ctx.lineWidth = 1.6; ctx.beginPath();
    for (let i = 0; i <= 20; i++) { const x = tL + (tR - tL) * i / 20, u = (i / 10 - 1); i ? ctx.lineTo(x, yM - 9 * u * u) : ctx.moveTo(x, yM - 9 * u * u); }
    ctx.stroke();
    // 눈금
    const n0 = Math.floor((smp.ctr - 8 * T.div) / T.div), n1 = Math.ceil((smp.ctr + 8 * T.div) / T.div);
    ctx.strokeStyle = C.ink; ctx.fillStyle = C.ink; ctx.font = `11px ${F.mono}`; ctx.textAlign = "right";
    for (let k = n0; k <= n1; k++) {
      const v = k * T.div, y = Math.round(yOf(v)) + 0.5, big = Math.abs(v / T.lab - Math.round(v / T.lab)) < 1e-6;
      const half = T.up ? Math.abs(v / 5 - Math.round(v / 5)) < 1e-6 : Math.abs(v / 0.5 - Math.round(v / 0.5)) < 1e-6;
      const len = big ? 34 : half ? 24 : 15;
      ctx.lineWidth = big ? 1.4 : 1; ctx.beginPath(); ctx.moveTo(tL, y); ctx.lineTo(tL + len, y); ctx.stroke();
      if (big) ctx.fillText(String(Math.round(v)), tL - 6, y + 4);
    }
    ctx.restore();
    // 유리관 벽
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(tL, 8); ctx.lineTo(tL, h - 8); ctx.moveTo(tR, 8); ctx.lineTo(tR, h - 8); ctx.stroke();
    // 눈과 시선
    const ex = w * 0.555, ey = NM.clamp(yM - eye() * 22, 18, h - 18), cx = (tL + tR) / 2;
    ctx.setLineDash([3, 4]); ctx.strokeStyle = eye() ? C.warn : C.forest; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(ex - 12, ey); ctx.lineTo(cx, yM); ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = C.ink; ctx.fillStyle = C.card; ctx.lineWidth = 1.3;
    ctx.beginPath(); ctx.ellipse(ex, ey, 11, 6.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(ex - 4, ey, 3, 0, Math.PI * 2); ctx.fill();
    // 오른쪽: 기구 이름과 저울 표시
    const rx = w * 0.64, bw = w - rx - 10;
    ctx.textAlign = "left"; ctx.fillStyle = C.ink; ctx.font = `600 12px ${F.sans}`;
    ctx.fillText(T.name, rx, 24);
    ctx.font = `11px ${F.sans}`; ctx.fillStyle = C.ink3;
    ctx.fillText(T.up ? "최소 눈금 1 mL (확대)" : "최소 눈금 0.1 mL · 처음 0.00 mL", rx, 40);
    const box = (y, lab, val) => {
      ctx.fillStyle = C.ink3; ctx.font = `11px ${F.sans}`; ctx.fillText(lab, rx, y);
      ctx.fillStyle = C.night; ctx.fillRect(rx, y + 6, bw, 30);
      ctx.fillStyle = "#9be08a"; ctx.font = `600 16px ${F.mono}`; ctx.textAlign = "right";
      ctx.fillText(val.toFixed(2) + " g", rx + bw - 8, y + 27); ctx.textAlign = "left";
    };
    box(h * 0.36, T.up ? "m₀ 빈 실린더" : "m₀ 빈 비커", smp.m0);
    box(h * 0.66, T.up ? "m₁ 실린더 + 물" : "m₁ 비커 + 받은 물", smp.m1);
  }

  const sfCount = (s) => {
    const t = s.replace(/^[-+]/, "").replace(/^0+\.?0*/, (z) => (z.includes(".") ? "." : ""));
    const d = t.replace(".", "").replace(/^0+/, "");
    return s.includes(".") ? d.length : d.replace(/0+$/, "").length;
  };

  function record(str, quiet) {
    const T = TOOLS[smp.t];
    if (!/^\d+(\.\d+)?$/.test(str)) { msg.textContent = "숫자만 입력하세요 (예: 47.3)."; return; }
    const val = +str, dec = str.includes(".") ? str.split(".")[1].length : 0, tol = 0.3 * T.div;
    let j = "알맞음";
    if (dec < T.dec) j = "자릿수 부족";
    else if (dec > T.dec) j = "자릿수 과다";
    else if (Math.abs(val - smp.V) > tol) j = Math.abs(val - apparent()) <= tol && eye() ? "시차" : "읽음 어긋남";
    const mStr = (smp.m1 - smp.m0).toFixed(2), m = +mStr, raw = m / val;
    const sf = Math.min(sfCount(mStr), sfCount(str));
    const dV = 0.2 * T.div, dm = 0.014;
    tbl.add({ tool: T.short, V: str, m: mStr, rho: raw.toPrecision(sf), j, _raw: raw, _ey: raw * Math.hypot(dV / val, dm / m), _cnt: `m ${sfCount(mStr)}개 · V ${sfCount(str)}개` });
    last = smp;
    if (!quiet) {
      msg.textContent = j === "알맞음" ? `기록했습니다. ${T.short}는 소수 ${T.dec === 1 ? "첫째" : "둘째"} 자리까지 읽는 것이 맞습니다.`
        : j === "시차" ? "눈높이가 메니스커스와 맞지 않아 눈금이 어긋나 보였습니다." : j === "읽음 어긋남" ? "메니스커스의 가장 낮은 곳을 다시 보세요."
        : `${T.short}는 최소 눈금 ${T.div} mL의 1/10, 곧 소수 ${T.dec === 1 ? "첫째" : "둘째"} 자리까지 적습니다.`;
    }
    newSample(); inp.value = ""; draw();
  }

  function nums() {
    const r = tbl.rows[tbl.rows.length - 1];
    $(".n-raw").textContent = r ? r._raw.toPrecision(9) : "—";
    $(".n-sf").textContent = r ? r.rho + " g/mL" : "—";
    $(".n-cnt").textContent = r ? r._cnt : "—";
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const rows = tbl.rows, n = rows.length;
    const pts = rows.map((r, i) => ({ x: i + 1, y: r._raw, ey: r._ey }));
    const ys = pts.flatMap((p) => [p.y - p.ey, p.y + p.ey]).concat([RHO]);
    const lo = Math.min(...ys), hi = Math.max(...ys), pad = Math.max(0.002, (hi - lo) * 0.12);
    const o = L.plot(ctx, { x0: 52, y0: 18, w: w - 66, h: h - 52 }, { pts, model: () => RHO, xr: [0, Math.max(6, n + 1)], yr: [lo - pad, hi + pad], xlabel: "기록 번호", ylabel: "ρ (g/mL)" });
    ctx.fillStyle = C.warn;
    rows.forEach((r, i) => { if (r.j !== "알맞음") { ctx.beginPath(); ctx.arc(o.X(i + 1), o.Y(r._raw), 4, 0, Math.PI * 2); ctx.fill(); } });
    ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "left"; ctx.fillStyle = C.ink3;
    ctx.fillText("점선 0.9982 · 주황: 판정 문제", 52, h - 6);
  }

  const upd = () => {
    const e = eye();
    $(".e-out").textContent = e === 0 ? "메니스커스와 수평" : `메니스커스보다 ${e > 0 ? "위" : "아래"} (${Math.abs(e)})`;
    draw();
  };
  sEye.addEventListener("input", upd);
  $(".tsel").addEventListener("click", (e) => {
    const b = e.target.closest("[data-t]"); if (!b) return;
    tk = b.dataset.t; root.querySelectorAll("[data-t]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    newSample(); msg.textContent = ""; draw();
  });
  $(".rec").addEventListener("click", () => record(inp.value.trim()));
  inp.addEventListener("keydown", (e) => { if (e.key === "Enter") record(inp.value.trim()); });
  $(".new").addEventListener("click", () => { newSample(); msg.textContent = ""; draw(); });
  $(".truth").addEventListener("click", () => {
    if (!last) { msg.textContent = "먼저 하나를 기록하세요."; return; }
    msg.textContent = `방금 기록한 시료의 참 부피: ${last.V.toFixed(TOOLS[last.t].dec + 1)} mL (눈높이를 맞추고 읽었을 때)`;
  });
  $(".clear").addEventListener("click", () => { tbl.clear(); last = null; msg.textContent = ""; });

  newSample(); upd();
  if (L.demo) {
    const plan = [["cyl", 0, 1, 1], ["cyl", 0, 3, 1], ["cyl", 3, 1, 1], ["bur", 0, 2, 1], ["bur", 0, 1, 1], ["bur", -3, 2, 1], ["cyl", 0, 1, 1]];
    plan.forEach(([t, e, d]) => { newSample(t); sEye.value = e; record(apparent().toFixed(d), true); });
    sEye.value = 0; newSample("cyl"); upd(); msg.textContent = "";
  }
})();
