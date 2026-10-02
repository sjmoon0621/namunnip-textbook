/* 카드: 직렬과 병렬 회로에서 전류계와 전압계는 무엇을 말해 줄까? — 계기 위치 고르기, 잘못 꽂기, 기록 */
(() => {
  const root = document.getElementById("card-phy-circuit-meter");
  if (!root) return;
  const { C, F, fit } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const E = 6, r = 0.2, RA = 0.05, RV = 1e7, RS = [10, 20, 30];
  let topo = "s", n = 2, where = "A0";
  function places() {
    const p = [["A0", "전류계: 전지 옆"], ...RS.slice(0, n).map((R, i) => [`A${i + 1}`, `전류계: ${R} Ω 쪽`]), ["V0", "전압계: 전지 양 끝"], ...RS.slice(0, n).map((R, i) => [`V${i + 1}`, `전압계: ${R} Ω 양 끝`]), ["xV", "잘못 꽂기: 전압계를 직렬로"], ["xA", "잘못 꽂기: 전류계를 10 Ω 양 끝에"]];
    $(".where").innerHTML = '<span class="mono small dim">계기</span>' + p.map(([k, t]) => `<button class="chip" data-w="${k}" aria-pressed="${k === where}">${t}</button>`).join("");
  }
  function solve() {
    const R = RS.slice(0, n);
    if (where === "xV") return { val: E * RV / (RV + r + (topo === "s" ? R.reduce((a, b) => a + b) : 1 / R.reduce((a, b) => a + 1 / b, 0))), unit: "V", warn: "전압계를 직렬로 끼우면 회로에 전류가 거의 흐르지 않아 저항들이 일을 못 하고, 전압계는 전지 전압을 그대로 읽습니다." };
    if (where === "xA") {
      if (topo === "s") { const Rt = r + RA + R.slice(1).reduce((a, b) => a + b, 0); return { val: E / Rt, unit: "A", warn: "10 Ω이 전류계로 우회(단락)되어 나머지 저항에만 전류가 흐릅니다. 회로가 바뀌어 원래 전류보다 큰 값이 나옵니다." }; }
      return { val: E / (r + RA), unit: "A", warn: "병렬 회로에서는 전지가 전류계로 직접 단락됩니다. 수십 A가 흘러 계기 퓨즈가 끊어집니다. 절대 하면 안 되는 연결입니다." };
    }
    let I, V;
    if (topo === "s") { const Rt = R.reduce((a, b) => a + b) + r + (where[0] === "A" ? RA : 0); I = E / Rt; V = R.map((x) => I * x); return where === "A0" || where[0] === "A" ? { val: I, unit: "A" } : { val: where === "V0" ? E - I * r : V[+where[1] - 1], unit: "V" }; }
    const Rp = 1 / R.reduce((a, b) => a + 1 / b, 0); I = E / (Rp + r); const Vp = I * Rp;
    if (where === "A0") return { val: I, unit: "A" };
    if (where[0] === "A") return { val: Vp / R[+where[1] - 1], unit: "A" };
    return { val: Vp, unit: "V" };
  }
  const tbl = L.table($(".tbl-host"), [{ key: "c", label: "연결" }, { key: "w", label: "계기 위치" }, { key: "v", label: "읽은 값" }]);
  const { ctx, size } = fit($("canvas"), () => draw());
  function resistor(x, y, w, vert, lab) {
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.6; ctx.beginPath();
    if (!vert) { ctx.moveTo(x, y); for (let i = 0; i <= 6; i++) ctx.lineTo(x + w * (i + 0.5) / 7, y + (i % 2 ? 6 : -6)); ctx.lineTo(x + w, y); }
    else { ctx.moveTo(x, y); for (let i = 0; i <= 6; i++) ctx.lineTo(x + (i % 2 ? 6 : -6), y + w * (i + 0.5) / 7); ctx.lineTo(x, y + w); }
    ctx.stroke(); ctx.fillStyle = C.ink2; ctx.font = `11px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText(lab, vert ? x + 26 : x + w / 2, vert ? y + w / 2 + 4 : y - 12);
  }
  const meter = (x, y, ch, bad) => { ctx.fillStyle = bad ? "#f7e3dc" : "#fff"; ctx.strokeStyle = bad ? C.warn : C.ink; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(x, y, 12, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.fillStyle = bad ? C.warn : C.ink; ctx.font = `600 12px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(ch, x, y + 4); };
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const R = RS.slice(0, n), x0 = 40, x1 = w * 0.68, y0 = 40, y1 = h - 30;
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.6;
    // 전지 (왼쪽 세로)
    const by = (y0 + y1) / 2; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0, by - 6); ctx.moveTo(x0, by + 6); ctx.lineTo(x0, y1); ctx.stroke();
    ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x0 - 12, by - 6); ctx.lineTo(x0 + 12, by - 6); ctx.stroke(); ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(x0 - 6, by + 6); ctx.lineTo(x0 + 6, by + 6); ctx.stroke();
    ctx.fillStyle = C.ink2; ctx.font = `11px ${F.mono}`; ctx.textAlign = "left"; ctx.fillText("6 V", x0 + 16, by + 4);
    ctx.beginPath(); ctx.moveTo(x0, y1); ctx.lineTo(x1, y1); ctx.stroke();
    if (topo === "s") {
      const seg = (x1 - x0 - 60) / n; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 + 40, y0); ctx.stroke();
      R.forEach((Rv, i) => { const xs = x0 + 40 + i * seg; resistor(xs + 10, y0, seg - 20, false, `${Rv} Ω`); ctx.beginPath(); ctx.moveTo(xs, y0); ctx.lineTo(xs + 10, y0); ctx.moveTo(xs + seg - 10, y0); ctx.lineTo(xs + seg, y0); ctx.stroke(); });
      ctx.beginPath(); ctx.moveTo(x1 - 20, y0); ctx.lineTo(x1, y0); ctx.lineTo(x1, y1); ctx.stroke();
      const pos = (k) => (k === 0 ? [x0 + 20, y0] : [x0 + 40 + (k - 1) * seg + seg / 2, y0]);
      if (where[0] === "A") meter(...pos(+where[1]), "A");
      if (where === "V0") { meter(x0 - 24, by, "V"); }
      if (where[0] === "V" && where !== "V0") { const [x] = pos(+where[1]); ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(x - seg / 2 + 10, y0); ctx.lineTo(x - seg / 2 + 10, y0 + 40); ctx.lineTo(x + seg / 2 - 10, y0 + 40); ctx.lineTo(x + seg / 2 - 10, y0); ctx.stroke(); ctx.setLineDash([]); meter(x, y0 + 40, "V"); }
      if (where === "xV") meter(x0 + 20, y0, "V", true);
      if (where === "xA") { const [x] = pos(1); ctx.setLineDash([3, 3]); ctx.strokeStyle = C.warn; ctx.beginPath(); ctx.moveTo(x - seg / 2 + 10, y0); ctx.lineTo(x - seg / 2 + 10, y0 + 40); ctx.lineTo(x + seg / 2 - 10, y0 + 40); ctx.lineTo(x + seg / 2 - 10, y0); ctx.stroke(); ctx.setLineDash([]); meter(x, y0 + 40, "A", true); }
    } else {
      const xa = x0 + 60, xb = x1 - 30, gap = (y1 - y0 - 20) / n;
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(xa, y0); ctx.lineTo(xa, y0 + gap * (n - 1)); ctx.moveTo(xb, y0); ctx.lineTo(xb, y1); ctx.lineTo(x1, y1); ctx.stroke();
      R.forEach((Rv, i) => { const y = y0 + i * gap; ctx.beginPath(); ctx.moveTo(xa, y); ctx.lineTo(xa + 50, y); ctx.moveTo(xb - 50, y); ctx.lineTo(xb, y); ctx.stroke(); resistor(xa + 50, y, xb - xa - 100, false, `${Rv} Ω`); });
      if (where === "A0" || where === "xV") meter(x0 + 28, y0, where === "xV" ? "V" : "A", where === "xV");
      if (where[0] === "A" && where !== "A0") meter(xa + 26, y0 + (+where[1] - 1) * gap, "A");
      if (where === "V0") meter(x0 - 24, by, "V");
      if (where[0] === "V" && where !== "V0") { const y = y0 + (+where[1] - 1) * gap; meter((xa + xb) / 2, y + gap * 0.45, "V"); }
      if (where === "xA") meter((xa + xb) / 2, y0 + gap * 0.45, "A", true);
    }
    // 계기 창
    const s = solve(), rd = L.measure(s.val, { rel: 0.003, res: 0.01 });
    const mx = w * 0.74, mw = w - mx - 10;
    ctx.fillStyle = "#1c1e1b"; ctx.fillRect(mx, 30, mw, 60); ctx.fillStyle = s.warn ? "#ff8f6b" : "#8fd16f"; ctx.font = `600 22px ${F.mono}`; ctx.textAlign = "right";
    ctx.fillText(s.val > 20 ? "FUSE" : `${rd.toFixed(2)} ${s.unit}`, mx + mw - 8, 70);
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText(where[0] === "V" || where === "xV" ? "전압계" : "전류계", mx, 104);
    draw.last = { s, rd };
    const v = $(".verdict"); v.textContent = s.warn || ""; v.className = "verdict small " + (s.warn ? "bad" : "");
    v.hidden = !s.warn;
  }
  root.addEventListener("click", (e) => {
    const b = e.target.closest("[data-t],[data-n],[data-w]"); if (!b) return;
    if (b.dataset.t) { topo = b.dataset.t; root.querySelectorAll("[data-t]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); }
    if (b.dataset.n) { n = +b.dataset.n; if (+where[1] > n) where = "A0"; root.querySelectorAll("[data-n]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); }
    if (b.dataset.w) where = b.dataset.w;
    places(); draw();
  });
  $(".rec").addEventListener("click", () => { const { s, rd } = draw.last; tbl.add({ c: `${topo === "s" ? "직렬" : "병렬"} ${n}개`, w: root.querySelector(`[data-w="${where}"]`).textContent, v: s.val > 20 ? "퓨즈 끊어짐" : `${rd.toFixed(2)} ${s.unit}` }); });
  $(".clear").addEventListener("click", () => tbl.clear());
  places(); draw();
  if (L.demo) { ["A0", "A1", "A2", "V0", "V1", "V2"].forEach((k) => { where = k; draw(); $(".rec").click(); }); where = "V1"; places(); draw(); }
})();
