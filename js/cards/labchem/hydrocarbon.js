/* 카드: 탄화수소의 구조와 성질 — 끓는점(사슬 길이·가지), 브로민수·KMnO₄ 시험(포화/불포화), 연소 그을음 */
(() => {
  const root = document.getElementById("card-labchem-hydrocarbon");
  if (!root || !window.NMMol || !window.NMOrg) return;
  const { C, F, fit, loop } = NM;
  const L = NMLab, O = NMOrg;
  const $ = (s) => root.querySelector(s);

  /* 지그재그 사슬 구조식 (NMMol 형식). hl: 작용기(이중 결합) 원자 번호 */
  function chain(labs, extra = [], bonds = [], dbl = -1) {
    const n = labs.map((l, i) => [l, i * 0.87, i % 2 ? 0.5 : 0]).concat(extra);
    const b = labs.slice(1).map((_, i) => [i, i + 1, i === dbl ? 2 : 1]).concat(bonds);
    if (dbl >= 0) { n[dbl][3] = 1; n[dbl + 1][3] = 1; }
    return { n, b };
  }
  const ring = { n: [["CH", 0, 1, 1], ["CH", 0.87, 0.5, 1], ["CH₂", 0.87, -0.5], ["CH₂", 0, -1], ["CH₂", -0.87, -0.5], ["CH₂", -0.87, 0.5]], b: [[0, 1, 2], [1, 2, 1], [2, 3, 1], [3, 4, 1], [4, 5, 1], [5, 0, 1]] };
  const S = ["CH₃", "CH₂", "CH₂", "CH₂", "CH₂", "CH₂", "CH₂", "CH₃"];
  const lin = (k) => S.slice(0, k - 1).concat(["CH₃"]);
  /* 끓는점: CRC Handbook 문헌값 (1기압, °C) */
  const K = {
    pen: { name: "펜테인", f: "C₅H₁₂", c: 5, h: 12, t: "a", bp: 36.1, mol: chain(lin(5)) },
    hex: { name: "헥세인", f: "C₆H₁₄", c: 6, h: 14, t: "a", bp: 68.7, mol: chain(lin(6)) },
    hep: { name: "헵테인", f: "C₇H₁₆", c: 7, h: 16, t: "a", bp: 98.4, mol: chain(lin(7)) },
    oct: { name: "옥테인", f: "C₈H₁₈", c: 8, h: 18, t: "a", bp: 125.6, mol: chain(lin(8)) },
    mp: { name: "2-메틸펜테인", f: "C₆H₁₄", c: 6, h: 14, t: "b", bp: 60.3, mol: chain(["CH₃", "CH", "CH₂", "CH₂", "CH₃"], [["CH₃", 0.87, 1.5]], [[1, 5, 1]]) },
    dmb: { name: "2,2-다이메틸뷰테인", f: "C₆H₁₄", c: 6, h: 14, t: "b", bp: 49.7, mol: chain(["CH₃", "C", "CH₂", "CH₃"], [["CH₃", 0.87, 1.5], ["CH₃", 0.87, -0.5]], [[1, 4, 1], [1, 5, 1]]) },
    hxe: { name: "1-헥센", f: "C₆H₁₂", c: 6, h: 12, t: "e", bp: 63.4, mol: chain(["CH₂", "CH", "CH₂", "CH₂", "CH₂", "CH₃"], [], [], 0) },
    chx: { name: "사이클로헥센", f: "C₆H₁₀", c: 6, h: 10, t: "e", bp: 83.0, mol: ring },
  };
  const NBP = [[1, -161.5], [2, -88.6], [3, -42.1], [4, -0.5], [5, 36.1], [6, 68.7], [7, 98.4], [8, 125.6], [9, 150.8], [10, 174.1]];
  const nbp = (x) => { for (let i = 1; i < NBP.length; i++) if (x <= NBP[i][0]) { const [x0, y0] = NBP[i - 1], [x1, y1] = NBP[i]; return y0 + (y1 - y0) * (x - x0) / (x1 - x0); } return NBP[NBP.length - 1][1]; };
  const COL = { a: C.forest, b: C.amber, e: C.apple };
  const unsat = (k) => K[k].t === "e";

  let key = "hex", last = null, t = 0;
  const obs = $(".hc-obs");
  const tbl = L.table($(".tbl-host"), [{ key: "s", label: "시료" }, { key: "f", label: "분자식" }, { key: "bp", label: "끓는점 (°C)", res: 0.1 }, { key: "br", label: "브로민수" }, { key: "mn", label: "KMnO₄" }, { key: "fl", label: "연소" }], () => drawPlot());
  function rec(k, field, val) {
    let r = tbl.rows.find((x) => x.k === k);
    if (r) tbl.rows.splice(tbl.rows.indexOf(r), 1);
    else r = { k, s: K[k].name, f: K[k].f, bp: "—", br: "—", mn: "—", fl: "—" };
    r[field] = val; tbl.add(r);
  }
  const RES = {
    br: (k) => unsat(k) ? ["무색", "흔들자마자 두 층 모두 색이 사라졌습니다. 브로민이 이중 결합에 첨가되었습니다."] : ["색 남음", "위층(시료)은 주황색, 아래 물층은 옅어졌습니다. 브로민이 시료 층으로 옮겨 녹았을 뿐 색은 사라지지 않습니다."],
    mn: (k) => unsat(k) ? ["갈색 침전", "보라색이 사라지고 갈색 MnO₂ 침전이 생겼습니다."] : ["보라색 남음", "아래 물층의 보라색이 그대로입니다."],
    fl: (k) => { const r = K[k].h / K[k].c; return r > 2.2 ? ["그을음 적음", `노란 불꽃, 그을음이 적습니다 (H/C = ${r.toFixed(2)}).`] : r > 1.9 ? ["그을음 조금", `노란 불꽃, 그을음이 조금 납니다 (H/C = ${r.toFixed(2)}).`] : ["그을음 많음", `불꽃이 붉고 검은 그을음이 많이 납니다 (H/C = ${r.toFixed(2)}).`]; },
  };

  const app = fit($(".cv-wide"), () => draw());
  const pl = fit($(".cv-plot"), () => drawPlot());
  function draw() {
    const { ctx, size } = app, { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const m = K[key], mol = m.mol, xs = mol.n.map((n) => n[1]), ys = mol.n.map((n) => n[2]);
    const aw = w * 0.7, sc = Math.min(48, (aw - 30) / (Math.max(...xs) - Math.min(...xs) + 1.2), (h - 70) / (Math.max(...ys) - Math.min(...ys) + 1.2));
    const cx = aw / 2 - (Math.max(...xs) + Math.min(...xs)) / 2 * sc, cy = h * 0.56 + (Math.max(...ys) + Math.min(...ys)) / 2 * sc;
    NMMol.draw(ctx, mol, cx, cy, sc, F, "rgba(212,73,58,.22)");
    ctx.textAlign = "left"; ctx.fillStyle = C.ink; ctx.font = `600 13px ${F.sans}`; ctx.fillText(`${m.name}  ${m.f}`, 12, 20);
    ctx.fillStyle = C.ink3; ctx.font = `11px ${F.sans}`;
    ctx.fillText(m.t === "e" ? "C=C 이중 결합 있음 (불포화)" : m.t === "b" ? "가지 달린 사슬 (포화)" : "곧은 사슬 (포화)", 12, 38);
    // 시험관
    const tx = w * 0.85, top = 26, bot = h - 26, tw = Math.min(34, w * 0.08);
    let layers = [{ f: 0.3, col: "#e3eef6" }], o = { t };
    if (last && last.k === key) {
      const u = unsat(key);
      if (last.test === "br") layers = u ? [{ f: 0.3, col: "#eef2f4" }, { f: 0.16, col: "#f2f2ee" }] : [{ f: 0.3, col: "#f6e7c4" }, { f: 0.16, col: "#e08a2c" }];
      else if (last.test === "mn") { layers = u ? [{ f: 0.3, col: "#d8c9b4" }, { f: 0.16, col: "#eef2f4" }] : [{ f: 0.3, col: "#7a2d8f" }, { f: 0.16, col: "#eef2f4" }]; if (u) { o.ppt = "#7a4a22"; o.pptH = 9; } }
      else if (last.test === "bp") { layers = [{ f: 0.3, col: "#e3eef6" }]; o.bubbles = 9; }
    }
    if (last && last.k === key && last.test === "fl") {
      // 증발 접시와 불꽃
      const r = K[key].h / K[key].c, soot = r > 2.2 ? 0.15 : r > 1.9 ? 0.45 : 0.85, fy = bot - 10;
      ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(tx, fy, 26, 7, 0, 0, Math.PI); ctx.stroke();
      const fl = 34 + 4 * Math.sin(t * 9);
      ctx.fillStyle = O.mix("#ffd166", "#e0602a", soot); ctx.beginPath(); ctx.moveTo(tx - 12, fy); ctx.quadraticCurveTo(tx - 10, fy - fl * 0.6, tx, fy - fl); ctx.quadraticCurveTo(tx + 10, fy - fl * 0.6, tx + 12, fy); ctx.fill();
      for (let i = 0; i < Math.round(soot * 14); i++) { const yy = fy - fl - ((t * 30 + i * 9) % (fy - fl - top)); ctx.fillStyle = `rgba(35,35,38,${0.5 * soot})`; ctx.beginPath(); ctx.arc(tx - 6 + (i * 5) % 12 + 3 * Math.sin(t + i), yy, 2.4, 0, Math.PI * 2); ctx.fill(); }
    } else {
      O.tube(ctx, tx, top, bot, tw, layers, o);
      if (last && last.k === key && last.test === "bp") { ctx.strokeStyle = C.ink3; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(tx + 4, top - 14); ctx.lineTo(tx + 4, bot - 20); ctx.stroke(); ctx.fillStyle = C.apple; ctx.beginPath(); ctx.arc(tx + 4, bot - 18, 3, 0, Math.PI * 2); ctx.fill(); }
    }
  }
  function drawPlot() {
    const { ctx, size } = pl, { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const r = L.plot(ctx, { x0: 44, y0: 18, w: w - 60, h: h - 52 }, { pts: [], model: nbp, xr: [4.5, 8.5], yr: [0, 140], xlabel: "탄소 수", ylabel: "끓는점 (°C)" });
    const off = { a: 0, b: 0.12, e: -0.12 };
    tbl.rows.forEach((row) => {
      if (typeof row.bp !== "number") return;
      const m = K[row.k]; ctx.fillStyle = COL[m.t];
      ctx.beginPath(); ctx.arc(r.X(m.c + off[m.t]), r.Y(row.bp), 3.6, 0, Math.PI * 2); ctx.fill();
    });
  }
  function act(test) {
    last = { k: key, test }; t = 0;
    if (test === "bp") {
      const v = L.measure(K[key].bp, { sd: 0.7, res: 0.1, bias: $(".fast").checked ? 3.2 : 0 });
      rec(key, "bp", v); obs.innerHTML = `<b>${K[key].name}</b>: 모세관의 기포가 끊기는 순간 온도 ${v.toFixed(1)} °C`;
    } else {
      const [short, long] = RES[test](key);
      rec(key, test, short); obs.innerHTML = `<b>${K[key].name}</b>: ${long}`;
    }
    draw();
  }
  $(".smp").addEventListener("click", (e) => {
    const b = e.target.closest("[data-k]"); if (!b) return; key = b.dataset.k;
    root.querySelectorAll("[data-k]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); draw();
  });
  ["bp", "br", "mn", "fl"].forEach((k) => $("." + k).addEventListener("click", () => act(k)));
  $(".clear").addEventListener("click", () => { tbl.clear(); last = null; obs.textContent = "시료를 고르고 시험을 하세요."; draw(); });
  loop($(".cv-wide"), (dt) => { if (!last || (last.test !== "bp" && last.test !== "fl")) return false; t += dt; draw(); });
  if (L.demo) {
    ["pen", "hex", "hep", "oct", "mp", "dmb", "hxe", "chx"].forEach((k) => { key = k; act("bp"); if (k === "hex" || k === "hxe" || k === "chx" || k === "oct") { act("br"); act("mn"); act("fl"); } });
    key = "hxe"; root.querySelector('[data-k="hxe"]').click(); act("br");
  }
  draw();
})();
