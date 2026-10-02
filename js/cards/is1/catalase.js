/* 카드: 감자 조각을 넣으면 과산화 수소가 왜 거품을 낼까? — 카탈레이스, 대조군, 재사용, 열 변성, 무기 촉매 비교 */
(() => {
  const root = document.getElementById("card-is1-catalase");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const NAME = { none: "아무것도", potato: "생감자", liver: "생간", mno2: "이산화 망가니즈" };
  const K = { none: 0.002, potato: 0.08, liver: 0.6, mno2: 0.25 };   // 1/s, 분해 속도 상수
  let what = "potato", tube = null;
  const tbl = L.table($(".tbl-host"), [{ key: "w", label: "넣은 것" }, { key: "b", label: "끓임" }, { key: "n", label: "붓기" }, { key: "h", label: "최고 거품 (mm)", res: 1 }, { key: "e", label: "불씨" }]);
  const { ctx, size } = fit($("canvas"), () => draw());

  const kOf = () => (tube.boiled && what !== "mno2" ? K.none * 1.5 : K[what]);
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const tx = w * 0.32, tw = 46, top = 18, bot = h - 18, liq = bot - 60;
    // 시험관
    ctx.fillStyle = "rgba(200,225,245,.5)"; ctx.fillRect(tx - tw / 2, liq, tw, bot - liq);
    if (tube) {
      const foam = Math.min(liq - top - 4, tube.foam * 1.6);
      for (let i = 0; i < foam / 3; i++) { ctx.fillStyle = `rgba(255,255,255,${0.75 + 0.2 * Math.sin(i)})`; ctx.beginPath(); ctx.arc(tx - tw / 2 + 6 + ((i * 17) % (tw - 12)), liq - (i * 3) % Math.max(foam, 1), 4 + (i % 3), 0, Math.PI * 2); ctx.fill(); }
      ctx.strokeStyle = "rgba(160,160,170,.6)"; ctx.lineWidth = 1; ctx.strokeRect(tx - tw / 2 + 0.5, liq - foam, tw - 1, foam);
      // 조각
      const col = { none: null, potato: tube.boiled ? "#d9c89a" : "#efe2b8", liver: tube.boiled ? "#6b4a3a" : "#8a2f2a", mno2: "#2b2b2b" }[what];
      if (col) { ctx.fillStyle = col; ctx.fillRect(tx - 10, bot - 16, 20, 12); }
      // 기포
      const rate = tube.rate;
      for (let i = 0; i < Math.min(40, rate * 400); i++) { const yy = bot - 20 - ((tube.t * 60 + i * 13) % (bot - liq - 20)); ctx.strokeStyle = "rgba(255,255,255,.9)"; ctx.beginPath(); ctx.arc(tx - 14 + (i * 7) % 28, yy, 1.8, 0, Math.PI * 2); ctx.stroke(); }
      // 불씨
      if (tube.ember != null) {
        const lit = tube.ember;
        ctx.strokeStyle = "#6b4a2a"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(tx + 50, top - 6); ctx.lineTo(tx + 6, liq - foam - 14); ctx.stroke();
        ctx.fillStyle = lit ? "#ffb02e" : "#7a3b2a"; ctx.beginPath(); ctx.arc(tx + 6, liq - foam - 14, lit ? 7 : 3, 0, Math.PI * 2); ctx.fill();
        if (lit) { ctx.fillStyle = "rgba(255,120,30,.6)"; ctx.beginPath(); ctx.moveTo(tx + 1, liq - foam - 16); ctx.quadraticCurveTo(tx + 6, liq - foam - 40, tx + 11, liq - foam - 16); ctx.fill(); }
      }
    }
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(tx - tw / 2, top); ctx.lineTo(tx - tw / 2, bot - 8); ctx.quadraticCurveTo(tx, bot + 10, tx + tw / 2, bot - 8); ctx.lineTo(tx + tw / 2, top); ctx.stroke();
    // 눈금자
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "right";
    for (let mm = 0; mm <= 60; mm += 10) { const y = liq - mm * 1.6; if (y < top) break; ctx.fillRect(tx - tw / 2 - 8, y, 6, 1); ctx.fillText(mm, tx - tw / 2 - 10, y + 3); }
    // 정보
    ctx.textAlign = "left"; ctx.fillStyle = C.ink; ctx.font = `600 13px ${F.sans}`;
    const ix = w * 0.56;
    ctx.fillText(tube ? `${NAME[what]}${tube.boiled ? " (끓임)" : ""}` : "시험관: 3% 과산화 수소 5 mL", ix, 40);
    if (tube) {
      ctx.font = `12px ${F.mono}`; ctx.fillStyle = C.ink2;
      ctx.fillText(`경과 ${Math.min(60, tube.t).toFixed(0)} s`, ix, 64);
      ctx.fillText(`남은 H₂O₂ ${Math.round(tube.left * 100)}%`, ix, 84);
      ctx.fillText(`거품 ${tube.foam.toFixed(0)} mm (최고 ${tube.peak.toFixed(0)})`, ix, 104);
      const bw = w - ix - 20; ctx.fillStyle = C.rule; ctx.fillRect(ix, 112, bw, 6); ctx.fillStyle = C.forest; ctx.fillRect(ix, 112, bw * tube.left, 6);
    }
  }
  function start(more) {
    if (more && tube) { tube.left += 1; tube.t = 0; tube.peak = 0; tube.n++; tube.done = false; tube.ember = null; return; }
    tube = { t: 0, left: 1, foam: 0, peak: 0, rate: 0, boiled: $(".boil").checked, n: 1, done: false, ember: null };
  }
  loop($("canvas"), (dt) => {
    if (tube && !tube.done) {
      const k = kOf(), step = dt * 6;   // 6배속
      tube.t += step;
      const d = tube.left * (1 - Math.exp(-k * step));
      tube.left -= d; tube.rate = d / step;
      tube.foam = tube.foam * Math.exp(-0.04 * step) + d * 70; tube.peak = Math.max(tube.peak, tube.foam);   // 거품은 터지며 꺼짐
      if (tube.t >= 60) {
        tube.done = true;
        tbl.add({ w: NAME[what], b: tube.boiled ? "예" : "아니요", n: tube.n === 1 ? "처음" : `${tube.n}번째`, h: L.measure(tube.peak, { rel: 0.1, res: 1 }), e: "—" });
      }
    } else if (tube) { tube.rate *= 0.9; tube.t += dt; }
    draw();
  });
  $(".what").addEventListener("click", (e) => { const b = e.target.closest("[data-w]"); if (!b) return; what = b.dataset.w; root.querySelectorAll("[data-w]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); tube = null; draw(); });
  $(".boil").addEventListener("change", () => { tube = null; draw(); });
  $(".add").addEventListener("click", () => start(false));
  $(".more").addEventListener("click", () => { if (tube && tube.done) start(true); });
  $(".ember").addEventListener("click", () => {
    if (!tube) return;
    tube.ember = tube.rate > 0.004 || tube.foam > 15;   // 산소가 모여 있으면 다시 타오름
    const r = tbl.rows[tbl.rows.length - 1];
    if (r && r.e === "—") { r.e = tube.ember ? "타오름" : "꺼짐"; tbl.add(tbl.rows.pop()); }
  });
  $(".clear").addEventListener("click", () => tbl.clear());
  draw();
  if (L.demo) {
    const run = (w, b) => { what = w; $(".boil").checked = b; start(false); while (!tube.done) { const k = kOf(); tube.t += 0.1; const d = tube.left * (1 - Math.exp(-k * 0.1)); tube.left -= d; tube.foam = tube.foam * Math.exp(-0.004) + d * 70; tube.peak = Math.max(tube.peak, tube.foam); if (tube.t >= 60) { tube.done = true; tbl.add({ w: NAME[w], b: b ? "예" : "아니요", n: "처음", h: L.measure(tube.peak, { rel: 0.1, res: 1 }), e: tube.peak > 15 ? "타오름" : "꺼짐" }); } } };
    run("none", false); run("potato", false); run("liver", false); run("mno2", false); run("potato", true); run("mno2", true);
    what = "potato"; root.querySelector('[data-w="potato"]').click(); $(".boil").checked = false; start(false); tube.t = 20; tube.left = 0.2; tube.foam = 42; tube.peak = 45; tube.rate = 0.02; tube.ember = true;
  }
})();
