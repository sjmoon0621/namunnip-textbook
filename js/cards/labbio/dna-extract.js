/* 카드: 딸기 한 알에서 DNA를 눈에 보이게 꺼낼 수 있을까? — 추출 단계별 역할 예측, 단계 생략 비교, 시료·에탄올 온도 */
(() => {
  const root = document.getElementById("card-labbio-dna-extract");
  if (!root) return;
  const { C, F, fit, loop, clamp } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const KEYS = ["grind", "soap", "salt", "prot", "filt", "eth"];
  const SHORT = { grind: "으깨기", soap: "세제", salt: "소금", prot: "단백질 분해 효소", filt: "거르기", eth: "에탄올" };
  const ROLE = {
    grind: "조직과 세포벽을 부숴 세포를 흩어 놓는다",
    soap: "세포막과 핵막의 인지질을 녹인다",
    salt: "음전하를 가려 DNA끼리 뭉치게 하고 단백질을 떼어 낸다",
    prot: "DNA에 감긴 히스톤 같은 단백질을 자른다",
    filt: "세포벽 조각과 찌꺼기를 없앤다",
    eth: "DNA가 녹지 않는 용매로 DNA를 침전시킨다",
  };
  const ORDER = ["salt", "eth", "grind", "filt", "prot", "soap"];
  const SAMPLE = { sb: { name: "딸기", base: 60, col: "#d8566a" }, br: { name: "브로콜리", base: 38, col: "#7fa05a" }, bn: { name: "바나나", base: 24, col: "#e9dca0" } };
  let smp = "sb", cold = true, run = null;

  root.querySelectorAll("select[data-k]").forEach((s) => {
    s.innerHTML = `<option value="">역할 고르기…</option>` + ORDER.map((k) => `<option value="${k}">${ROLE[k]}</option>`).join("");
  });
  const on = (k) => root.querySelector(`input[data-k="${k}"]`).checked;

  function extract() {
    const s = SAMPLE[smp];
    let m = s.base, look = "희고 가는 실이 막대에 감긴다";
    if (!on("grind")) { m *= 0.3; look = "실이 아주 조금 생긴다"; }
    if (!on("soap")) { m *= 0.08; look = "거의 보이지 않는다"; }
    if (!on("salt")) { m *= 0.4; look = "가늘게 흩어져 잘 감기지 않는다"; }
    if (!on("prot") && on("soap")) { m *= 0.9; look = "뿌옇고 끈적한 덩어리 (단백질 섞임)"; }
    if (!on("filt")) { m *= 1.15; look += ", 찌꺼기가 섞여 탁하다"; }
    if (!cold) { m *= 0.55; look = look.replace("희고 가는 실이 막대에 감긴다", "실이 성기고 적게 생긴다"); }
    if (!on("eth")) { m = 0; look = "보이지 않는다 (DNA가 물에 녹아 있음)"; }
    const miss = KEYS.filter((k) => !on(k)).map((k) => SHORT[k]).join(", ") || "없음";
    return { s: s.name, miss, e: on("eth") ? (cold ? "냉동" : "실온") : "—", m: m > 0 ? Math.max(0, L.measure(m, { rel: 0.15, res: 1 })) : 0, look, state: Object.fromEntries(KEYS.map((k) => [k, on(k)])), t: 0, smp };
  }

  const tbl = L.table($(".tbl-host"), [{ key: "s", label: "시료" }, { key: "miss", label: "뺀 단계" }, { key: "e", label: "에탄올" }, { key: "m", label: "DNA (mg)", res: 1 }, { key: "look", label: "모습" }], () => drawPlot());
  const app = fit($(".cv-wide"), () => drawApp());
  const pl = fit($(".cv-plot"), () => drawPlot());

  function drawApp() {
    const { ctx } = app, { w, h } = app.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const st = run ? run.state : Object.fromEntries(KEYS.map((k) => [k, on(k)]));
    const t = run ? clamp(run.t, 0, 1) : 0;
    // 확대 그림
    const bx = 10, by = 24, bw = w * 0.56, bh = h - 40;
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.strokeRect(bx + 0.5, by + 0.5, bw, bh);
    ctx.font = `11px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left";
    ctx.fillText(run ? "추출액 속 확대 모식" : "처리 전 세포 확대 모식", bx, by - 8);
    const cx = bx + bw * 0.5, cy = by + bh * 0.5, s = Math.min(bw, bh) * 0.42;
    const done = (k) => run && st[k] && t > 0.05;
    // 세포벽
    ctx.strokeStyle = "#6f9a4e"; ctx.lineWidth = 4;
    if (!done("grind")) ctx.strokeRect(cx - s, cy - s * 0.8, 2 * s, 1.6 * s);
    else { ctx.setLineDash([10, 16]); ctx.strokeRect(cx - s, cy - s * 0.8, 2 * s, 1.6 * s); ctx.setLineDash([]); }
    // 세포막·핵막
    const memb = !done("soap");
    ctx.strokeStyle = "#c29a3a"; ctx.lineWidth = 2;
    ctx.setLineDash(memb ? [] : [2, 9]);
    ctx.strokeRect(cx - s + 7, cy - s * 0.8 + 7, 2 * s - 14, 1.6 * s - 14);
    ctx.beginPath(); ctx.arc(cx, cy, s * 0.45, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    if (!memb) { ctx.fillStyle = "rgba(194,154,58,.6)"; for (let i = 0; i < 14; i++) { ctx.beginPath(); ctx.arc(cx - s * 0.8 + (i * 37) % (1.6 * s), cy - s * 0.6 + (i * 53) % (1.2 * s), 3, 0, Math.PI * 2); ctx.fill(); } }
    // DNA 가닥
    const spread = memb ? 0.32 : 0.75, clump = done("eth") && st.salt ? 0.4 : 1;
    ctx.strokeStyle = C.ink; ctx.lineWidth = done("eth") ? 2.2 : 1.3;
    for (let k = 0; k < 3; k++) {
      ctx.beginPath();
      for (let i = 0; i <= 40; i++) { const u = i / 40, x = cx + (u - 0.5) * 2 * s * spread * clump, y = cy + (k - 1) * s * 0.18 * clump + Math.sin(u * 14 + k) * s * 0.07; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.stroke();
      if (!done("prot")) { ctx.fillStyle = "#9b7fb8"; for (let i = 2; i < 40; i += 5) { const u = i / 40; ctx.beginPath(); ctx.arc(cx + (u - 0.5) * 2 * s * spread * clump, cy + (k - 1) * s * 0.18 * clump + Math.sin(u * 14 + k) * s * 0.07, 3.2, 0, Math.PI * 2); ctx.fill(); } }
      if (done("salt")) { ctx.fillStyle = C.forest; ctx.font = `bold 9px ${F.mono}`; for (let i = 4; i < 40; i += 9) { const u = i / 40; ctx.fillText("+", cx + (u - 0.5) * 2 * s * spread * clump + 3, cy + (k - 1) * s * 0.18 * clump + Math.sin(u * 14 + k) * s * 0.07 - 4); } }
    }
    // 범례
    ctx.font = `10px ${F.mono}`; ctx.textAlign = "left";
    [["세포벽", "#6f9a4e"], ["막", "#c29a3a"], ["단백질", "#9b7fb8"], ["Na⁺", C.forest]].forEach(([lab, col], i) => { const x = bx + 6 + i * (bw / 4); ctx.fillStyle = col; ctx.fillRect(x, by + bh - 12, 8, 8); ctx.fillStyle = C.ink2; ctx.fillText(lab, x + 11, by + bh - 4); });
    // 시험관
    const tx = w * 0.8, tw = 40, top = 20, bot = h - 14, mid = bot - (bot - top) * 0.42;
    const col = SAMPLE[run ? run.smp : smp].col;
    ctx.fillStyle = col; ctx.globalAlpha = run && !run.state.filt ? 0.85 : 0.55; ctx.fillRect(tx - tw / 2, mid, tw, bot - mid - 6); ctx.globalAlpha = 1;
    if (run && run.state.eth) {
      const et = top + 26 + (mid - top - 26) * (1 - t);
      ctx.fillStyle = "rgba(220,235,250,.7)"; ctx.fillRect(tx - tw / 2, et, tw, mid - et);
      const amt = run.m / 60;
      ctx.strokeStyle = "rgba(255,255,255,.95)"; ctx.lineWidth = 1.4;
      for (let i = 0; i < Math.round(26 * amt * t); i++) { const x = tx - tw / 2 + 5 + (i * 11) % (tw - 10), y0 = mid - 2; ctx.beginPath(); ctx.moveTo(x, y0); ctx.bezierCurveTo(x + 6, y0 - 10, x - 6, y0 - 18, x + (i % 3) * 2, y0 - 8 - (i * 7) % 28 * t); ctx.stroke(); }
    }
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(tx - tw / 2, top); ctx.lineTo(tx - tw / 2, bot - 8); ctx.quadraticCurveTo(tx, bot + 8, tx + tw / 2, bot - 8); ctx.lineTo(tx + tw / 2, top); ctx.stroke();
    ctx.font = `11px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "right";
    if (run && run.state.eth) ctx.fillText("에탄올", tx - tw / 2 - 6, top + 40);
    ctx.fillText("여과액", tx - tw / 2 - 6, bot - 20);
    if (run && t >= 1) { ctx.textAlign = "center"; ctx.fillStyle = C.ink; ctx.font = `600 12px ${F.mono}`; ctx.fillText(`${run.m} mg`, tx, top - 6); }
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const rows = tbl.rows, box = { x0: 44, y0: 26, w: w - 58, h: h - 64 };
    const top = Math.max(80, ...rows.map((r) => r.m * 1.1));
    const yt = L.ticks(0, top, 4);
    const n = Math.max(rows.length, 6), bw = box.w / n;
    NM.axes(ctx, { ...box, X: (i) => box.x0 + (i + 0.5) * bw, Y: (v) => box.y0 + box.h - v / top * box.h, xt: rows.map((r, i) => [i, String(i + 1)]), yt: yt.map((v) => [v, String(v)]), xlabel: "기록 번호", ylabel: "건진 DNA (mg)" });
    rows.forEach((r, i) => {
      const hh = r.m / top * box.h, x = box.x0 + i * bw + bw * 0.18;
      const sc = { 딸기: "#d8566a", 브로콜리: "#7fa05a", 바나나: "#d2bf68" }[r.s];
      ctx.fillStyle = sc; ctx.globalAlpha = r.miss === "없음" ? 1 : 0.45; ctx.fillRect(x, box.y0 + box.h - hh, bw * 0.64, hh); ctx.globalAlpha = 1;
    });
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "right";
    ctx.fillText("진한 막대: 모든 단계 · 옅은 막대: 단계를 뺌", box.x0 + box.w, 12);
  }

  loop($(".cv-wide"), (dt) => {
    if (run && run.t < 1) { run.t += dt / 1.8; if (run.t >= 1) { run.t = 1; tbl.add(run); } drawApp(); }
  });
  const pick = (sel, attr, f) => root.querySelector(sel).addEventListener("click", (e) => { const b = e.target.closest(`[${attr}]`); if (!b) return; root.querySelectorAll(`${sel} [${attr}]`).forEach((x) => x.setAttribute("aria-pressed", String(x === b))); f(b); run = null; drawApp(); });
  pick(".smp", "data-s", (b) => { smp = b.dataset.s; });
  pick(".etemp", "data-e", (b) => { cold = b.dataset.e === "cold"; });
  root.querySelectorAll("input[data-k]").forEach((i) => i.addEventListener("change", () => { run = null; drawApp(); }));
  $(".check").addEventListener("click", () => {
    let ok = 0;
    root.querySelectorAll("select[data-k]").forEach((s) => { const r = s.value === s.dataset.k; s.classList.toggle("ok", r); s.classList.toggle("no", !r); ok += r; });
    $(".dx-msg").textContent = ok === 6 ? "여섯 단계의 역할을 모두 맞혔습니다. 이제 단계를 하나씩 빼며 예측을 실험으로 확인하세요." : `${ok}/6 맞았습니다. 붉은 칸은 단계를 빼고 추출해 보면 실마리를 얻을 수 있습니다.`;
  });
  $(".run").addEventListener("click", () => { if (run && run.t < 1) return; run = extract(); });
  $(".clear").addEventListener("click", () => tbl.clear());
  drawApp();

  if (L.demo) {
    const set = (k, v) => { root.querySelector(`input[data-k="${k}"]`).checked = v; };
    const go = () => tbl.add(extract());
    go(); go();
    KEYS.forEach((k) => { set(k, false); go(); set(k, true); });
    cold = false; go(); cold = true;
    smp = "br"; go(); smp = "bn"; go(); smp = "sb";
    root.querySelectorAll("select[data-k]").forEach((s, i) => { s.value = i === 2 ? "prot" : s.dataset.k; });
    $(".check").click();
    set("prot", false); run = extract(); run.t = 1; set("prot", true); drawApp();
  }
})();
