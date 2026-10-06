/* 카드: 콩 주머니에서 짝을 뽑아 세대를 넘기면 대립유전자 빈도는 어떻게 변할까? — 탁상 모의실험, 부동·선택·이주, 하디·바인베르크 비교 */
(() => {
  const root = document.getElementById("card-labbio-bead-sim");
  if (!root) return;
  const { C, F, fit } = NM;
  const L = NMLab, X = LBChi;
  const $ = (s) => root.querySelector(s);
  const BAG = 200;
  const SC = {
    drift: { s: 0, m: 0, name: "무작위로만" },
    sel50: { s: 0.5, m: 0, name: "aa 절반 제거" },
    sel100: { s: 1, m: 0, name: "aa 모두 제거" },
    mig: { s: 0, m: 0.1, name: "흰 콩 개체 이주" },
  };
  let scen = "drift", p0 = 0.5, N = 20;
  let gen = 0, p = 0.5, bag = [], drawn = [], applied = false, hist = [], old = [];

  /* 콩 자리: 주머니 안 무작위 위치 (한 번만 정함) */
  const spots = Array.from({ length: BAG }, () => { const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()); return [r * Math.cos(a), r * Math.sin(a)]; });
  function fill(pp) {
    const red = Math.round(BAG * pp);
    bag = Array.from({ length: BAG }, (_, i) => i < red);
    for (let i = bag.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [bag[i], bag[j]] = [bag[j], bag[i]]; }
  }
  const take = () => bag.splice(Math.floor(Math.random() * bag.length), 1)[0];
  const gt = (d) => (d.a && d.b ? 0 : d.a || d.b ? 1 : 2);   // 0 AA, 1 Aa, 2 aa

  const tbl = L.table($(".tbl-host"), [{ key: "g", label: "세대", res: 1 }, { key: "AA", label: "AA", res: 1 }, { key: "Aa", label: "Aa", res: 1 }, { key: "aa", label: "aa", res: 1 }, { key: "rm", label: "제거/유입" }, { key: "p", label: "다음 p", res: 0.001 }], () => drawPlot());

  function start(keep) {
    if (keep && hist.length > 1) old.push(hist.slice());
    if (old.length > 6) old.shift();
    gen = 1; p = p0; hist = [{ g: 0, p: p0 }]; drawn = []; applied = false; fill(p0);
    if (!keep) { old = []; tbl.clear(); }
    update(); draw(); drawPlot();
  }
  function drawOne() {
    if (applied) { drawn = []; applied = false; }
    if (drawn.length >= N || bag.length < 2) return false;
    drawn.push({ a: take(), b: take(), dead: false });
    return true;
  }
  function drawAll() { if (applied) { drawn = []; applied = false; } while (drawn.length < N) drawOne(); }
  function apply() {
    if (applied) { drawn = []; applied = false; }
    if (drawn.length < N) drawAll();
    const sc = SC[scen];
    let rm = 0;
    drawn.forEach((d) => { if (gt(d) === 2 && Math.random() < sc.s) { d.dead = true; rm++; } });
    const live = drawn.filter((d) => !d.dead);
    let A = live.reduce((s, d) => s + d.a + d.b, 0), tot = live.length * 2;
    const mig = Math.round(sc.m * N);
    tot += mig * 2;
    const np = tot ? A / tot : p;
    const c = [0, 0, 0]; drawn.forEach((d) => c[gt(d)]++);
    tbl.add({ g: gen, AA: c[0], Aa: c[1], aa: c[2], rm: sc.s ? `aa ${rm} 제거` : sc.m ? `aa ${mig} 유입` : "—", p: np });
    hist.push({ g: gen, p: np });
    applied = true; p = np; gen++; fill(p);
    return c;
  }
  function counts() { const c = [0, 0, 0]; drawn.forEach((d) => c[gt(d)]++); return c; }

  function update() {
    $(".n-g").textContent = `${gen}세대 · p = ${p.toFixed(3)}`;
    const c = counts(), n = drawn.length;
    $(".n-o").textContent = n ? `${c[0]}:${c[1]}:${c[2]}` : "—";
    if (n >= 5) {
      const pp = applied ? hist[hist.length - 2].p : p, q = 1 - pp;
      const e = [pp * pp * n, 2 * pp * q * n, q * q * n], r = X.chi2(c, e);
      $(".n-h").textContent = `${e.map((x) => x.toFixed(1)).join(":")} · ${r.bad ? "—" : r.x2.toFixed(2)}`;
    } else $(".n-h").textContent = "—";
    let msg;
    if (p <= 0 || p >= 1) msg = `<b>${p >= 1 ? "흰 콩(a)이 사라지고 A가 고정" : "붉은 콩(A)이 사라지고 a가 고정"}되었습니다.</b> 돌연변이나 이주가 없으면 다시 돌아오지 않습니다.`;
    else if (applied) msg = `${gen - 1}세대 규칙(${SC[scen].name})을 적용했습니다. 다음 세대 주머니의 붉은 콩은 ${Math.round(p * BAG)}개입니다.`;
    else if (n) msg = `${n}/${N}개체를 꺼냈습니다. 다 꺼내면 ③으로 규칙을 적용하세요.`;
    else msg = `주머니에는 콩 ${BAG}개(붉은 콩 ${Math.round(p * BAG)}개)가 들어 있습니다. 두 개씩 꺼내 한 개체로 기록하세요.`;
    $(".bs-obs").innerHTML = msg;
  }

  const { ctx, size } = fit(root.querySelector("canvas.cv-wide"), () => draw());
  function bead(x, y, r, red, fade) {
    ctx.globalAlpha = fade ? 0.35 : 1;
    ctx.fillStyle = red ? "#c2412f" : "#f4efe2"; ctx.strokeStyle = red ? "#7d2418" : "#a59f8e"; ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.ellipse(x, y, r * 1.15, r, 0.4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.globalAlpha = 1;
  }
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const bx = w * 0.22, by = h * 0.56, rx = w * 0.18, ry = h * 0.36;
    ctx.fillStyle = "#e9dcc0"; ctx.strokeStyle = "#9b8257"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.ellipse(bx, by, rx + 8, ry + 8, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(bx - rx * 0.45, by - ry - 4); ctx.quadraticCurveTo(bx, by - ry - 22, bx + rx * 0.45, by - ry - 4); ctx.stroke();
    const br = Math.max(2.4, Math.min(rx, ry) / 15);
    bag.forEach((red, i) => bead(bx + spots[i][0] * (rx - br * 1.4), by + spots[i][1] * (ry - br * 1.4), br, red));
    ctx.fillStyle = C.ink; ctx.font = `600 12px ${F.sans}`; ctx.textAlign = "center";
    ctx.fillText(`주머니: 붉은 ${bag.filter(Boolean).length} · 흰 ${bag.filter((x) => !x).length}`, bx, 16);
    /* 꺼낸 개체 */
    const x0 = w * 0.47, cols = 10, cw = (w - x0 - 6) / cols, rh = Math.min(28, (h - 40) / 5);
    ctx.textAlign = "left"; ctx.fillText(`${applied ? gen - 1 : gen}세대에 꺼낸 개체 (${drawn.length}/${N})`, x0, 16);
    drawn.forEach((d, i) => {
      const cx = x0 + cw * (i % cols) + cw / 2, cy = 34 + rh * Math.floor(i / cols) + rh / 2, r = Math.min(5.5, cw / 5);
      bead(cx - r * 1.1, cy, r, d.a, d.dead); bead(cx + r * 1.1, cy, r, d.b, d.dead);
      if (d.dead) { ctx.strokeStyle = C.warn; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(cx - r * 2.2, cy - r * 1.3); ctx.lineTo(cx + r * 2.2, cy + r * 1.3); ctx.stroke(); ctx.lineWidth = 1; }
    });
    if (!drawn.length) { ctx.fillStyle = C.ink3; ctx.font = `11.5px ${F.sans}`; ctx.fillText("① 한 쌍 꺼내기로 시작합니다.", x0, 40); }
    if (SC[scen].m && applied) { ctx.fillStyle = C.ink2; ctx.font = `11px ${F.sans}`; ctx.fillText(`+ 이주해 온 aa ${Math.round(SC[scen].m * N)}개체`, x0, h - 8); }
  }

  const pc = root.querySelector("canvas.cv-plot");
  const P = fit(pc, () => drawPlot());
  function theory(n) {
    const sc = SC[scen], out = [p0]; let q = 1 - p0;
    for (let i = 0; i < n; i++) {
      if (sc.s) q = q * (1 - sc.s * q) / (1 - sc.s * q * q);
      if (sc.m) { const pp = (1 - sc.m) * (1 - q); q = 1 - pp; }
      out.push(1 - q);
    }
    return out;
  }
  function drawPlot() {
    const { w, h } = P.size; if (!w) return;
    const c = P.ctx; c.clearRect(0, 0, w, h);
    const gmax = Math.max(10, ...hist.map((x) => x.g), ...old.flatMap((r) => r.map((x) => x.g)));
    const th = theory(gmax);
    const box = { x0: 42, y0: 18, w: w - 56, h: h - 52 };
    const r = L.plot(c, box, { pts: hist.map((x) => ({ x: x.g, y: x.p })), xr: [0, gmax], yr: [0, 1], xlabel: "세대", ylabel: "붉은 콩 비율 p",
      model: (x) => { const i = Math.min(th.length - 2, Math.floor(x)), f = x - i; return th[i] * (1 - f) + th[i + 1] * f; } });
    const line = (arr, col, lw) => { c.strokeStyle = col; c.lineWidth = lw; c.beginPath(); arr.forEach((x, i) => (i ? c.lineTo(r.X(x.g), r.Y(x.p)) : c.moveTo(r.X(x.g), r.Y(x.p)))); c.stroke(); c.lineWidth = 1; };
    old.forEach((run) => line(run, "rgba(140,140,146,.55)", 1.2));
    line(hist, C.forest, 1.6);
  }

  const range = (sel, out, f) => { const el = $(sel); el.addEventListener("input", () => { $(out).textContent = f(el.value); }); return el; };
  range(".p0", ".p-out", (v) => (+v).toFixed(2)).addEventListener("change", (e) => { p0 = +e.target.value; start(false); });
  range(".nn", ".n-out", (v) => v).addEventListener("change", (e) => { N = +e.target.value; start(true); });
  $(".scen").addEventListener("click", (e) => {
    const b = e.target.closest("[data-s]"); if (!b) return;
    scen = b.dataset.s; root.querySelectorAll("[data-s]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    start(false);
  });
  $(".one").addEventListener("click", () => { drawOne(); update(); draw(); });
  $(".all").addEventListener("click", () => { drawAll(); update(); draw(); });
  $(".bs-step").addEventListener("click", () => { apply(); update(); draw(); });
  $(".auto").addEventListener("click", () => { for (let i = 0; i < 5; i++) apply(); update(); draw(); });
  $(".again").addEventListener("click", () => start(true));
  start(false);
  if (L.demo) {
    for (let k = 0; k < 3; k++) { for (let i = 0; i < 10; i++) apply(); start(true); }
    tbl.clear();
    for (let i = 0; i < 6; i++) apply();
    drawn = []; applied = false; for (let i = 0; i < 12; i++) drawOne();
    update(); draw(); drawPlot();
  }
})();
