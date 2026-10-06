/* 카드: 흰 눈 초파리는 암수를 바꿔 교배하면 왜 결과가 달라질까? — 정역 교배, F1·F2 성별 분리, X 연관 vs 상염색체 가설 χ² */
(() => {
  const root = document.getElementById("card-labbio-sex-linked");
  if (!root) return;
  const { C, F, fit } = NM;
  const L = NMLab, X = LBChi;
  const $ = (s) => root.querySelector(s);

  /* 칸 순서: 야생형 ♀, 돌연변이 ♀, 야생형 ♂, 돌연변이 ♂ */
  const CROSS = {
    A: { gene: "w", xl: true, mutSex: "f", wt: "붉은 눈", mt: "흰 눈" },
    B: { gene: "w", xl: true, mutSex: "m", wt: "붉은 눈", mt: "흰 눈" },
    C: { gene: "vg", xl: false, mutSex: "f", wt: "야생형", mt: "흔적" },
    D: { gene: "vg", xl: false, mutSex: "m", wt: "야생형", mt: "흔적" },
  };
  /* 가설별 기대 비율 */
  function expect(xl, mutSex, gen) {
    if (!xl) return gen === 1 ? [0.5, 0, 0.5, 0] : [3 / 8, 1 / 8, 3 / 8, 1 / 8];
    if (mutSex === "f") return gen === 1 ? [0.5, 0, 0, 0.5] : [0.25, 0.25, 0.25, 0.25];
    return gen === 1 ? [0.5, 0, 0.5, 0] : [0.5, 0, 0.25, 0.25];
  }
  let cur = "A", stage = 0, vials = 0, tbl = null;
  const cr = () => CROSS[cur];

  function makeTable() {
    const old = $(".tbl-host"), host = old.cloneNode(false);
    old.replaceWith(host);
    const c = cr();
    tbl = L.table(host, [{ key: "g", label: "세대" }, { key: "c0", label: `${c.wt} ♀`, res: 1 }, { key: "c1", label: `${c.mt} ♀`, res: 1 }, { key: "c2", label: `${c.wt} ♂`, res: 1 }, { key: "c3", label: `${c.mt} ♂`, res: 1 }, { key: "n", label: "합계", res: 1 }], () => { update(); draw(); });
  }
  const brood = () => Math.max(35, Math.min(110, Math.round(L.measure(72, { sd: 18 }))));
  function count(gen) {
    const p = expect(cr().xl, cr().mutSex, gen).slice();   // 참값: 흰 눈은 실제로 X 연관, 흔적 날개는 상염색체
    if ($(".viab").checked) { p[1] *= 0.85; p[3] *= 0.85; }
    const tot = p.reduce((s, x) => s + x, 0), cnt = [0, 0, 0, 0], n = brood();
    for (let i = 0; i < n; i++) { let r = Math.random() * tot, k = 0; while (r > p[k] && k < 3) { r -= p[k]; k++; } cnt[k]++; }
    return cnt;
  }
  function add(gen) {
    const cnt = count(gen), row = { g: gen === 1 ? "F₁" : `F₂ ${++vials}병`, n: cnt.reduce((s, x) => s + x, 0) };
    cnt.forEach((c, i) => { row["c" + i] = c; });
    tbl.add(row);
  }
  function data() {
    const f2 = tbl.rows.filter((r) => r.g !== "F₁"), use = f2.length ? f2 : tbl.rows.filter((r) => r.g === "F₁");
    const t = [0, 0, 0, 0]; let n = 0;
    use.forEach((r) => { for (let i = 0; i < 4; i++) t[i] += r["c" + i]; n += r.n; });
    return { t, n, gen: f2.length ? 2 : 1, rows: use.length };
  }
  const fmtP = (r) => (r.bad ? "모순 (기대 0인 칸)" : `${r.x2.toFixed(2)} · ${r.p < 0.001 ? "< 0.001" : r.p.toFixed(3)}`);
  function update() {
    const d = data(), c = cr();
    const pTxt = c.xl ? (c.mutSex === "f" ? "XʷXʷ ♀ × X⁺Y ♂" : "X⁺X⁺ ♀ × XʷY ♂") : (c.mutSex === "f" ? "vg/vg ♀ × +/+ ♂" : "+/+ ♀ × vg/vg ♂");
    let msg = `P: ${c.mt === "흰 눈" ? "흰 눈" : "흔적 날개"} ${c.mutSex === "f" ? "암컷" : "수컷"} 교배 (${pTxt}).`;
    const f1 = tbl.rows.find((r) => r.g === "F₁");
    if (f1) {
      if (f1.c3 && !f1.c1) msg += ` <b>F₁ 딸은 모두 ${c.wt}, 아들은 모두 ${c.mt}</b>입니다. 아들의 형질은 어머니를 따랐습니다.`;
      else if (!f1.c1 && !f1.c3) msg += ` <b>F₁은 암수 모두 ${c.wt}</b>입니다.`;
    } else if (!stage) msg = "교배를 고르고 ① P 교배부터 시작하세요. 막대는 암수와 표현형별 비율, 선은 두 가설의 기댓값입니다.";
    $(".sl-obs").innerHTML = msg;
    if (!d.n) { [".n-n", ".n-x", ".n-a"].forEach((s) => { $(s).textContent = "—"; $(s).className = s.slice(1); }); return; }
    $(".n-n").textContent = `${d.gen === 1 ? "F₁" : `F₂ ${d.rows}병`} ${d.n}마리`;
    const rx = X.chi2(d.t, expect(true, c.mutSex, d.gen).map((p) => p * d.n));
    const ra = X.chi2(d.t, expect(false, c.mutSex, d.gen).map((p) => p * d.n));
    $(".n-x").textContent = fmtP(rx); $(".n-x").className = "n-x " + (rx.p > 0.05 ? "good" : "bad");
    $(".n-a").textContent = fmtP(ra); $(".n-a").className = "n-a " + (ra.p > 0.05 ? "good" : "bad");
  }

  const { ctx, size } = fit($("canvas"), () => draw());
  /* 염색체 막대: kind = "X" | "Y" | "A", mut = 돌연변이 대립유전자 여부 */
  function chromo(x, y, kind, mut, hs) {
    const len = kind === "Y" ? 26 * hs : 40 * hs;
    ctx.fillStyle = kind === "Y" ? "#9aa6b2" : kind === "X" ? "#e8c4c0" : "#d6dcc4";
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x - 4, y, 8, len, 4) : ctx.rect(x - 4, y, 8, len); ctx.fill(); ctx.stroke();
    if (kind !== "Y") { ctx.fillStyle = mut ? "#fff" : C.apple; ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.arc(x, y + len * 0.35, 3.4, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
  }
  function pair(cx, y, sex, gtype, hs, label) {
    const c = cr();
    if (c.xl) {
      chromo(cx - 7, y, "X", gtype[0], hs);
      chromo(cx + 7, y, sex === "m" ? "Y" : "X", gtype[1], hs);
    } else { chromo(cx - 7, y, "A", gtype[0], hs); chromo(cx + 7, y, "A", gtype[1], hs); }
    ctx.fillStyle = C.ink2; ctx.font = `11px ${F.sans}`; ctx.textAlign = "center";
    ctx.fillText(label, cx, y + 40 * hs + 14);
  }
  function draw() {
    const { w, h } = size; if (!w || !tbl) return;
    ctx.clearRect(0, 0, w, h);
    const c = cr(), lw = w * 0.42, hs = Math.min(1.35, (h - 90) / 2 / 54);
    ctx.textAlign = "left"; ctx.fillStyle = C.ink; ctx.font = `600 12px ${F.sans}`;
    ctx.fillText(c.xl ? "성염색체 (●붉은 눈 w⁺, ○흰 눈 w)" : "2번 염색체 (●야생형, ○vg)", 6, 15);
    const mf = c.mutSex === "f";
    const yP = 26, yF = yP + 40 * hs + 30;
    ctx.fillStyle = C.ink3; ctx.font = `600 11px ${F.mono}`; ctx.fillText("P", 6, yP + 16); ctx.fillText("F₁", 6, yF + 16);
    const g = (mut) => [mut, mut];
    pair(lw * 0.36, yP, "f", g(mf), hs, `${mf ? c.mt : c.wt} ♀`);
    pair(lw * 0.78, yP, "m", c.xl ? [!mf, false] : g(!mf), hs, `${mf ? c.wt : c.mt} ♂`);
    if (stage) {
      pair(lw * 0.36, yF, "f", [true, false], hs, `${c.wt} ♀`);
      const sonMut = c.xl && mf;
      pair(lw * 0.78, yF, "m", c.xl ? [sonMut, false] : [true, false], hs, `${sonMut ? c.mt : c.wt} ♂`);
    }
    ctx.strokeStyle = C.rule; ctx.beginPath(); ctx.moveTo(lw + 6, 6); ctx.lineTo(lw + 6, h - 6); ctx.stroke();
    /* 오른쪽 막대 */
    const d = data(), x0 = lw + 40, y0 = 44, bh = h - y0 - 36, bw0 = (w - x0 - 8) / 4;
    ctx.fillStyle = C.ink; ctx.font = `600 12px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillText(d.n ? `${d.gen === 1 ? "F₁" : "F₂ 누적"} 비율 (${d.n}마리)` : "성별·표현형 비율", lw + 14, 15);
    ctx.font = `10px ${F.sans}`; ctx.fillStyle = C.ink2;
    const lx = lw + 14;
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(lx, 25); ctx.lineTo(lx + 16, 25); ctx.stroke();
    ctx.fillText("X 연관 기댓값", lx + 20, 29);
    ctx.strokeStyle = C.warn; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(lx + 100, 25); ctx.lineTo(lx + 116, 25); ctx.stroke(); ctx.setLineDash([]); ctx.lineWidth = 1;
    ctx.fillText("상염색체 기댓값", lx + 120, 29);
    ctx.font = `10px ${F.mono}`; ctx.textAlign = "right";
    for (let v = 0; v <= 0.6001; v += 0.2) { const y = y0 + bh - v / 0.6 * bh; ctx.strokeStyle = C.rule; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(w - 8, y); ctx.stroke(); ctx.fillStyle = C.ink3; ctx.fillText(v.toFixed(1), x0 - 4, y + 3); }
    const ex = expect(true, c.mutSex, d.gen), ea = expect(false, c.mutSex, d.gen);
    const lab = [`${c.wt}♀`, `${c.mt}♀`, `${c.wt}♂`, `${c.mt}♂`];
    for (let i = 0; i < 4; i++) {
      const bx = x0 + bw0 * i + bw0 * 0.2, bw = bw0 * 0.6, Y = (v) => y0 + bh - Math.min(v, 0.6) / 0.6 * bh;
      if (d.n) { ctx.fillStyle = i % 2 ? C.amber : C.sprout; ctx.fillRect(bx, Y(d.t[i] / d.n), bw, y0 + bh - Y(d.t[i] / d.n)); }
      if (stage) {
        ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(bx - 3, Y(ex[i])); ctx.lineTo(bx + bw + 3, Y(ex[i])); ctx.stroke();
        ctx.strokeStyle = C.warn; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(bx - 3, Y(ea[i]) - 1); ctx.lineTo(bx + bw + 3, Y(ea[i]) - 1); ctx.stroke(); ctx.setLineDash([]); ctx.lineWidth = 1;
      }
      ctx.fillStyle = C.ink2; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "center";
      ctx.fillText(lab[i], bx + bw / 2, y0 + bh + 14);
      if (d.n) { ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.fillText(String(d.t[i]), bx + bw / 2, y0 + bh + 27); }
    }
  }

  function reset() { stage = 0; vials = 0; makeTable(); update(); draw(); }
  $(".cross").addEventListener("click", (e) => {
    const b = e.target.closest("[data-c]"); if (!b) return;
    cur = b.dataset.c;
    root.querySelectorAll("[data-c]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    reset();
  });
  $(".p-cross").addEventListener("click", () => { reset(); stage = 1; add(1); });
  $(".f-cross").addEventListener("click", () => { if (!stage) { $(".sl-obs").innerHTML = "<b>먼저 ① P 교배</b>로 F₁을 얻어야 합니다."; return; } add(2); });
  $(".clear").addEventListener("click", reset);
  $(".viab").addEventListener("change", reset);
  makeTable(); update(); draw();
  if (L.demo) { stage = 1; add(1); for (let i = 0; i < 4; i++) add(2); }
})();
