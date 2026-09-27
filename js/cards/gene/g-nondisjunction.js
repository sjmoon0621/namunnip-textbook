/* 카드: 염색체 하나가 더 들어가는 일은 어느 단계에서 생길까? — 감수 1·2분열 비분리 */
(() => {
  const root = document.getElementById("card-gene-nondisjunction");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), nG = $(".n-g"), nO = $(".n-o");
  let nd = 1, ch = "21";
  // 상동 염색체 두 개: [이름, 색]
  const HOM = { "21": [["21", "#b5532f"], ["21", "#3f6fa3"]], xx: [["X", "#b5532f"], ["X", "#3f6fa3"]], xy: [["X", "#b5532f"], ["Y", "#3f6fa3"]] };
  function gametes() {
    const [a, b] = HOM[ch];
    if (nd === 0) return [[a], [a], [b], [b]];
    if (nd === 1) return [[a, b], [a, b], [], []];
    return [[a, a], [], [b], [b]];
  }
    function outcome(g) {
    if (ch === "21") { const n = g.length + 1; return n === 3 ? "47, +21 → 다운 증후군" : n === 1 ? "45, −21 → 발생하지 못함" : "46 → 정상"; }
    const NM2 = { XXXX: "48,XXXX", XXX: "47,XXX", XX: "46,XX 정상", XXXY: "48,XXXY", XXY: "47,XXY 클라인펠터", XY: "46,XY 정상", Y: "45,Y → 발생하지 못함", X: "45,X 터너" };
    const key = (str) => [...str].sort().join("");
    if (ch === "xx") { const s = g.map((x) => x[0]).join(""); return `정자 X와 ${NM2[key("X" + s)]} · 정자 Y와 ${NM2[key(s + "Y")]}`; }
    const s = g.map((x) => x[0]).join(""), k = key("X" + s); return `난자 X와 ${({ ...NM2, XYY: "47,XYY" })[k] || k}`;
  }
  const { ctx, size } = fit(cv, () => draw());
  function chrom(x, y, [name, col], dup, sc = 1) {
    const hh = 26 * sc, ww = 7 * sc;
    const one = (dx) => { ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x + dx - ww / 2, y - hh / 2, ww, hh, 3); ctx.fill(); };
    if (dup) { one(-4 * sc); one(4 * sc); ctx.fillStyle = "#232326"; ctx.beginPath(); ctx.arc(x, y, 3 * sc, 0, Math.PI * 2); ctx.fill(); } else one(0);
    ctx.fillStyle = C.ink2; ctx.font = `9px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(name, x, y + hh / 2 + 10);
  }
  function cell(x, y, r, items, dup, label, col) {
    ctx.fillStyle = "#fbf6ee"; ctx.strokeStyle = col || C.ink3; ctx.lineWidth = col ? 2 : 1; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    const n = items.length; items.forEach((it, i) => chrom(x + (i - (n - 1) / 2) * 22 * (dup ? 1 : 0.8), y - 4, it, dup, r < 30 ? 0.8 : 1));
    if (!n) { ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("없음", x, y); }
    if (label) { ctx.fillStyle = col || C.ink2; ctx.font = `600 10px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(label, x, y + r + 12); }
  }
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const [a, b] = HOM[ch], y0 = h * 0.2, y1 = h * 0.5, y2 = h * 0.8, R0 = Math.min(38, h * 0.14), R1 = R0 * 0.8, R2 = R0 * 0.7;
    const x0 = w * 0.1, xs1 = [w * 0.36, w * 0.36], ys1 = [y0, y2 - (y2 - y0) * 0.35];
    cell(x0, (y0 + y2) / 2, R0, [a, b], true, "간기 후 (복제됨)");
    // 1분열 결과
    const m1 = nd === 1 ? [[a, b], []] : [[a], [b]];
    const c1 = [[w * 0.38, y0 + 10], [w * 0.38, y2 - 10]];
    c1.forEach(([x, y], i) => { cell(x, y, R1, m1[i], true, `감수 1분열 후`, nd === 1 ? C.warn : null); ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0 + R0, (y0 + y2) / 2); ctx.lineTo(x - R1, y); ctx.stroke(); });
    const g = gametes(), gx = w * 0.72, gy = [y0 - 18, y0 + 44, y2 - 44, y2 + 18].map((v) => Math.max(R2 + 4, Math.min(h - R2 - 14, v)));
    g.forEach((items, i) => { const bad = items.length !== 1, [px, py] = c1[i < 2 ? 0 : 1]; ctx.strokeStyle = C.rule; ctx.beginPath(); ctx.moveTo(px + R1, py); ctx.lineTo(gx - R2, gy[i]); ctx.stroke(); cell(gx, gy[i], R2, items, false, null, bad ? C.warn : null); ctx.fillStyle = bad ? C.warn : C.forest; ctx.font = `600 11px ${F.mono}`; ctx.textAlign = "left"; ctx.fillText(items.length === 2 ? "n+1" : items.length === 0 ? "n−1" : "n", gx + R2 + 8, gy[i] + 4); });
    ctx.fillStyle = C.ink2; ctx.font = `10px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("생식세포", gx, h - 2);
    if (nd === 2) { ctx.fillStyle = C.warn; ctx.font = `600 10px ${F.sans}`; ctx.fillText("↑ 여기서 염색 분체가 한쪽으로", (w * 0.38 + gx) / 2, y0 + 58); }
  }
  function update() {
    root.querySelectorAll("[data-n]").forEach((q) => q.setAttribute("aria-pressed", String(+q.dataset.n === nd)));
    root.querySelectorAll("[data-c]").forEach((q) => q.setAttribute("aria-pressed", String(q.dataset.c === ch)));
    const g = gametes(); nG.textContent = g.map((x) => x.length === 2 ? "n+1" : x.length === 0 ? "n−1" : "n").join(", ");
    const uniq = [...new Set(g.map((x) => x.map((y) => y[0]).sort().join("")))];
    nO.textContent = uniq.map((s) => outcome(g.find((x) => x.map((y) => y[0]).sort().join("") === s))).join(" / ");
    draw();
  }
  root.querySelectorAll("[data-n]").forEach((q) => q.addEventListener("click", () => { nd = +q.dataset.n; update(); }));
  root.querySelectorAll("[data-c]").forEach((q) => q.addEventListener("click", () => { ch = q.dataset.c; update(); }));
  update();
})();
