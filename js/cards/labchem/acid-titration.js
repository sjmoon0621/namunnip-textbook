/* 카드: 뷰렛 한 방울 차이로 미지 산의 농도를 어디까지 알 수 있을까? — 중화 적정, 지시약 선택, 반복 측정 */
(() => {
  const root = document.getElementById("card-labchem-acid-titration");
  if (!root) return;
  const { C, F, fit } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);

  const CB = 0.1012, VA = 20.00, KA = { hcl: 1e7, ac: 1.75e-5 };
  const TRUE = { hcl: +(0.0950 + 0.03 * Math.random()).toFixed(4), ac: +(0.0900 + 0.03 * Math.random()).toFixed(4) };
  const NAME = { hcl: "HCl", ac: "CH₃COOH", pp: "페놀프탈레인", btb: "BTB", mo: "메틸 오렌지" };
  let acid = "hcl", ind = "pp", tr = null, shown = false;

  /* 전하 균형 [H⁺] + [Na⁺] = [OH⁻] + [A⁻]을 이분법으로 풀어 pH */
  function pH(vb) {
    const Vt = VA + vb, ca = TRUE[acid] * VA / Vt, na = CB * vb / Vt, Ka = KA[acid];
    let lo = -14.5, hi = 0.5;
    for (let i = 0; i < 60; i++) {
      const m = (lo + hi) / 2, h = 10 ** m;
      const f = h + na - 1e-14 / h - ca * Ka / (Ka + h);
      if (f > 0) hi = m; else lo = m;
    }
    return -(lo + hi) / 2;
  }
  /* 지시약 색: [r, g, b, 진하기] */
  function color(p) {
    const s = (a, b) => Math.min(1, Math.max(0, (p - a) / (b - a)));
    if (ind === "pp") { const k = s(8.2, 10); return [235, 60, 150, 0.06 + 0.7 * k]; }
    if (ind === "btb") { const k = s(6.0, 7.6); return [Math.round(225 - 175 * k), Math.round(200 - 40 * k + 20 * Math.sin(Math.PI * k)), Math.round(40 + 170 * k), 0.6]; }
    const k = s(3.1, 4.4); return [Math.round(225 + 15 * k), Math.round(60 + 140 * k), 40, 0.6];
  }

  const tbl = L.table($(".tbl-host"), [
    { key: "a", label: "산" }, { key: "i", label: "지시약" }, { key: "v0", label: "처음 (mL)", res: 0.01 }, { key: "v1", label: "나중 (mL)", res: 0.01 },
    { key: "dv", label: "적정 부피 (mL)", res: 0.01 }, { key: "c", label: "C산 (M)", res: 0.0001 },
  ], () => { drawPlot(); nums(); });
  const app = fit($(".cv-wide"), () => drawApp());
  const pl = fit($(".cv-plot"), () => drawPlot());

  function fresh() {
    const r0 = 0.2 + 1.3 * Math.random();
    tr = { r0, v: 0, read0: L.snap(r0 + 0.02 * L.gauss(), 0.01), curve: [{ x: 0, y: pH(0) }] };
    drawApp(); drawPlot();
  }
  function add(dv) {
    tr.v += dv;
    if ($(".phm").checked) tr.curve.push({ x: tr.v, y: L.measure(pH(tr.v), { sd: 0.02, res: 0.01 }) });
    drawApp(); drawPlot();
  }
  const drop = () => 0.05 * (1 + 0.15 * L.gauss());
  function record() {
    if (!tr || tr.v <= 0) return;
    const read1 = L.snap(tr.r0 + tr.v + 0.02 * L.gauss(), 0.01), dv = read1 - tr.read0;
    tbl.add({ a: NAME[acid], i: NAME[ind], ak: acid, ik: ind, v0: tr.read0, v1: read1, dv, c: CB * dv / VA });
    fresh();
  }

  function drawApp() {
    const { ctx } = app, { w, h } = app.size; if (!w || !tr) return;
    ctx.clearRect(0, 0, w, h);
    const bx = w * 0.14, bt = 8, bb = h * 0.6, bw = 12;
    const read = tr.r0 + tr.v, yOf = (ml) => bt + 10 + (bb - bt - 20) * ml / 50;
    // 뷰렛
    ctx.fillStyle = "rgba(200,220,240,.55)"; ctx.fillRect(bx - bw / 2, yOf(read), bw, bb - yOf(read));
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.2; ctx.strokeRect(bx - bw / 2, bt, bw, bb - bt);
    ctx.fillStyle = C.ink3; ctx.font = `9px ${F.mono}`; ctx.textAlign = "right";
    for (let ml = 0; ml <= 50; ml += 5) { const y = yOf(ml); ctx.fillRect(bx - bw / 2, y, ml % 10 ? 4 : 7, 1); if (ml % 10 === 0) ctx.fillText(ml, bx - bw / 2 - 3, y + 3); }
    ctx.fillStyle = C.ink2; ctx.fillRect(bx - 9, bb, 18, 7); ctx.fillRect(bx - 2, bb + 7, 4, 12);
    // 플라스크
    const fy = h * 0.72, fb = h - 8, fw = Math.min(90, w * 0.2);
    const [r, g, b, a] = color(pH(tr.v));
    ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
    ctx.beginPath(); ctx.moveTo(bx - fw * 0.36, fy + 18); ctx.lineTo(bx + fw * 0.36, fy + 18); ctx.lineTo(bx + fw / 2, fb); ctx.lineTo(bx - fw / 2, fb); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = C.ink2; ctx.beginPath(); ctx.moveTo(bx - 8, fy - 6); ctx.lineTo(bx - 8, fy + 6); ctx.lineTo(bx - fw / 2, fb); ctx.lineTo(bx + fw / 2, fb); ctx.lineTo(bx + 8, fy + 6); ctx.lineTo(bx + 8, fy - 6); ctx.stroke();
    if ($(".phm").checked) { ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(bx + 30, fy - 30); ctx.lineTo(bx + 14, fb - 8); ctx.stroke(); }
    // 눈금 확대 (메니스커스 둘레 ±0.6 mL)
    const zx = w * 0.3, zw = w * 0.2, zt = 14, zh = h * 0.6, zc = zt + zh / 2, sc = zh / 1.2;
    ctx.save(); ctx.beginPath(); ctx.rect(zx, zt, zw, zh); ctx.clip();
    ctx.fillStyle = "#fbfbf8"; ctx.fillRect(zx, zt, zw, zh);
    const my = zc;   // 메니스커스는 늘 가운데
    ctx.fillStyle = "rgba(200,220,240,.7)"; ctx.fillRect(zx, my, zw, zh);
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(zx, my - 5); ctx.quadraticCurveTo(zx + zw / 2, my + 9, zx + zw, my - 5); ctx.stroke();
    ctx.fillStyle = C.ink; ctx.font = `10px ${F.mono}`; ctx.textAlign = "left";
    for (let k = Math.ceil((read - 0.6) * 10); k <= (read + 0.6) * 10; k++) {
      const ml = k / 10, y = zc + (ml - read) * sc;
      ctx.fillRect(zx, y, k % 10 ? (k % 5 ? zw * 0.25 : zw * 0.4) : zw * 0.55, 1);
      if (k % 10 === 0 || k % 5 === 0) ctx.fillText(k % 10 ? ml.toFixed(1) : String(ml), zx + zw * 0.6, y + 4);
    }
    ctx.restore();
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.strokeRect(zx, zt, zw, zh);
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("눈금 확대", zx + zw / 2, zt + zh + 14);
    // 읽은 값
    const tx = w * 0.56; ctx.textAlign = "left";
    const kw = Math.min(86, (w - tx) * 0.42), line = (y, k, v, col) => { ctx.font = `11px ${F.sans}`; ctx.fillStyle = C.ink3; ctx.fillText(k, tx, y); let fs = 13; ctx.font = `600 ${fs}px ${F.mono}`; while (fs > 9 && ctx.measureText(v).width > w - tx - kw - 4) { fs -= 0.5; ctx.font = `600 ${fs}px ${F.mono}`; } ctx.fillStyle = col || C.ink; ctx.fillText(v, tx + kw, y); };
    line(28, "미지 산", `${NAME[acid]} 20.00 mL`);
    line(50, "지시약", NAME[ind]);
    line(72, "NaOH", "0.1012 M");
    line(98, "처음 눈금", `${tr.read0.toFixed(2)} mL`);
    line(120, "넣은 양(대략)", `${tr.v.toFixed(2)} mL`, C.ink2);
    if ($(".phm").checked) line(146, "pH 미터", L.fmt(tr.curve.length ? tr.curve[tr.curve.length - 1].y : pH(tr.v), 0.01), C.warn);
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.sans}`;
    ctx.fillText("색이 30초 넘게 남는 첫 방울에서 기록하세요", tx, h - 12);
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const box = { x0: 44, y0: 18, w: w - 58, h: h - 52 };
    if ($(".phm").checked && tr) {
      const xmax = Math.max(30, Math.ceil(tr.v / 5) * 5 + 5);
      const P = L.plot(ctx, box, { pts: tr.curve, xr: [0, xmax], yr: [0, 14], xlabel: "넣은 NaOH 부피 (mL)", ylabel: "pH" });
      const band = { pp: [8.2, 10], btb: [6.0, 7.6], mo: [3.1, 4.4] }[ind];
      ctx.fillStyle = "rgba(181,83,47,.12)"; ctx.fillRect(box.x0, P.Y(band[1]), box.w, P.Y(band[0]) - P.Y(band[1]));
      ctx.fillStyle = C.warn; ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "right"; ctx.fillText(`${NAME[ind]} 변색 범위`, box.x0 + box.w - 4, P.Y(band[1]) - 4);
      return;
    }
    const rows = tbl.rows.filter((r) => r.ak === acid);
    const pts = rows.map((r, i) => ({ x: i + 1, y: r.dv }));
    const P = L.plot(ctx, box, { pts, xr: [0, Math.max(5, rows.length + 1)], xlabel: `${NAME[acid]} 적정 순서`, ylabel: "적정 부피 (mL)" });
    const cc = concord(rows);
    if (cc) { ctx.fillStyle = "rgba(59,124,42,.12)"; ctx.fillRect(box.x0, P.Y(cc.hi), box.w, Math.max(2, P.Y(cc.lo) - P.Y(cc.hi))); }
    if (!rows.length) { ctx.fillStyle = C.ink3; ctx.font = `12px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("기록한 적정 부피가 여기에 쌓입니다 (pH 미터를 꽂으면 적정 곡선)", box.x0 + box.w / 2, box.y0 + box.h / 2); }
  }

  /* 0.10 mL 안에 드는 가장 큰 무리 (같은 산·지시약) */
  function concord(rows) {
    let best = null;
    ["pp", "btb", "mo"].forEach((ik) => {
      const v = rows.filter((r) => r.ik === ik).map((r) => r.dv).sort((a, b) => a - b);
      for (let i = 0; i < v.length; i++) {
        const g = v.filter((x) => x >= v[i] && x <= v[i] + 0.1001);
        if (g.length >= 2 && (!best || g.length > best.g.length)) best = { g, lo: g[0], hi: g[g.length - 1], ik };
      }
    });
    return best;
  }
  function nums() {
    const cc = concord(tbl.rows.filter((r) => r.ak === acid));
    if (cc) {
      const m = L.stats(cc.g).mean;
      $(".n-c").textContent = `${cc.g.length}회, ${m.toFixed(2)} mL`;
      $(".n-m").textContent = `${(CB * m / VA).toFixed(4)} M`;
    } else { $(".n-c").textContent = "아직 없음"; $(".n-m").textContent = "—"; }
    $(".n-t").textContent = shown ? `${TRUE[acid].toFixed(4)} M` : "?";
  }

  const pick = (sel, attr, set) => $(sel).addEventListener("click", (e) => {
    const b = e.target.closest(`[${attr}]`); if (!b) return;
    root.querySelectorAll(`${sel} [${attr}]`).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    set(b.getAttribute(attr)); fresh(); nums();
  });
  pick(".acid", "data-a", (v) => { acid = v; });
  pick(".ind", "data-i", (v) => { ind = v; });
  $(".phm").addEventListener("change", () => { if ($(".phm").checked && tr.curve.length < 2) tr.curve = [{ x: tr.v, y: L.measure(pH(tr.v), { sd: 0.02, res: 0.01 }) }]; drawApp(); drawPlot(); });
  $(".a1").addEventListener("click", () => add(1.00));
  $(".a01").addEventListener("click", () => add(0.10));
  $(".adrop").addEventListener("click", () => add(drop()));
  $(".rec").addEventListener("click", record);
  $(".fresh").addEventListener("click", fresh);
  $(".truth").addEventListener("click", () => { shown = !shown; nums(); });
  $(".clear").addEventListener("click", () => { tbl.clear(); fresh(); });
  fresh(); nums();

  if (L.demo) {
    const ep = { pp: 8.2, btb: 6.0, mo: 4.4 };
    const auto = (a, i, over) => {   // 학생처럼: 1 mL씩 → 방울씩, 색이 바뀐 첫 방울에서 멈춤
      acid = a; ind = i; fresh();
      const veq = TRUE[a] * VA / CB, rough = over > 0;
      while (pH(tr.v + 1) < ep[i] && tr.v < (rough ? veq + 2 : veq - 1)) add(1.00);
      while (pH(tr.v) < ep[i]) add(rough ? 0.5 : drop());
      record();
    };
    auto("hcl", "pp", 1); auto("hcl", "pp", 0); auto("hcl", "pp", 0); auto("hcl", "pp", 0); auto("hcl", "mo", 0); auto("ac", "mo", 0);
    acid = "hcl"; ind = "pp";
    root.querySelector('[data-i="mo"]').setAttribute("aria-pressed", "false"); root.querySelector('[data-i="pp"]').setAttribute("aria-pressed", "true");
    $(".phm").checked = true; fresh();
    while (tr.v < 28) add(tr.v >= 19 && tr.v < 23 ? 0.2 : 1.0);
    nums();
  }
})();
