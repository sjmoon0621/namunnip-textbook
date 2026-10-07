/* 카드: 검은 깡통의 물은 정말 더 빨리 데워질까? — 탐구 요소(변인 통제, 자료 해석, 결론, 일반화) 모식 실험 */
(() => {
  const root = document.getElementById("card-resr-elements");
  if (!root) return;
  const { C, F, fit } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const cVol = $(".c-vol"), cPos = $(".c-pos"), cT0 = $(".c-t0");
  let sky = 1, last = null;
  const AMB = 25;
  const SKY = { 1: "맑은 날", 0.3: "흐린 날", 0.04: "실내" };

  /* 모식: 200 mL, 햇빛 800 W/m²에서 20분 동안 흡수율 1일 때 약 6.3 °C 상승(손실 30% 반영) */
  const setup = () => ({
    b: { a: 0.95, v: cVol.checked ? 200 : 400, sh: cPos.checked ? 1 : 0.3, t0: AMB },
    w: { a: 0.25, v: cVol.checked ? 200 : 100, sh: 1, t0: cT0.checked ? AMB : 33 },
  });
  const finalT = (c, S) => c.t0 + 6.3 * c.a * S * c.sh * (200 / c.v) - 0.25 * (c.t0 - AMB);

  const cv = fit($(".cv-wide"), () => drawApp());
  const pl = fit($(".cv-plot"), () => drawPlot());
  const tbl = L.table($(".tbl-host"), [
    { key: "sky", label: "날씨" }, { key: "cond", label: "다르게 둔 조건" },
    { key: "tb", label: "검은 (°C)", res: 0.1 }, { key: "tw", label: "흰 (°C)", res: 0.1 },
  ], () => { drawPlot(); report(); });

  function can(ctx, x, y, cw, ch, fill, vol, temp, label) {
    ctx.fillStyle = fill; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.4;
    ctx.fillRect(x, y, cw, ch); ctx.strokeRect(x, y, cw, ch);
    ctx.beginPath(); ctx.ellipse(x + cw / 2, y, cw / 2, 5, 0, 0, Math.PI * 2); ctx.fillStyle = "#c9cac4"; ctx.fill(); ctx.stroke();
    const lv = ch * Math.min(1, vol / 420);
    ctx.setLineDash([3, 3]); ctx.strokeStyle = fill === "#2b2b2e" ? "#9cc3ea" : "#4a78b5"; ctx.beginPath(); ctx.moveTo(x + 3, y + ch - lv); ctx.lineTo(x + cw - 3, y + ch - lv); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.ink2; ctx.font = `11.5px ${F.sans}`; ctx.textAlign = "center";
    ctx.fillText(`${label} · ${vol} mL`, x + cw / 2, y + ch + 16);
    ctx.font = `600 14px ${F.mono}`; ctx.fillStyle = C.ink;
    ctx.fillText(temp, x + cw / 2, y - 14);
  }

  function drawApp() {
    const { ctx } = cv, { w, h } = cv.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const s = setup(), gy = h - 34;
    ctx.fillStyle = "#e6e2d3"; ctx.fillRect(0, gy, w, h - gy);
    const sx = w * 0.12, sy = 34;
    if (sky >= 1) {
      ctx.fillStyle = C.amber; ctx.beginPath(); ctx.arc(sx, sy, 16, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = C.amber; ctx.lineWidth = 2;
      for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; ctx.beginPath(); ctx.moveTo(sx + Math.cos(a) * 21, sy + Math.sin(a) * 21); ctx.lineTo(sx + Math.cos(a) * 28, sy + Math.sin(a) * 28); ctx.stroke(); }
    } else if (sky > 0.1) {
      ctx.fillStyle = "#b9bbb6";
      [[0, 0, 16], [16, -6, 18], [32, 0, 14]].forEach(([dx, dy, r]) => { ctx.beginPath(); ctx.arc(sx + dx - 10, sy + dy, r, 0, Math.PI * 2); ctx.fill(); });
    } else {
      ctx.strokeStyle = C.ink3; ctx.lineWidth = 1.2; ctx.strokeRect(sx - 22, sy - 18, 44, 36);
      ctx.beginPath(); ctx.moveTo(sx, sy - 18); ctx.lineTo(sx, sy + 18); ctx.moveTo(sx - 22, sy); ctx.lineTo(sx + 22, sy); ctx.stroke();
    }
    ctx.fillStyle = C.ink3; ctx.font = `11px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(SKY[sky], sx, sy + 46);
    const cw = Math.min(56, w * 0.11), ch = Math.min(96, gy - 70);
    const bx = w * 0.42, wx = w * 0.72;
    if (s.b.sh < 1) {
      ctx.fillStyle = "rgba(60,80,50,.16)"; ctx.fillRect(bx - 30, 0, cw + 60, gy);
      ctx.fillStyle = C.forest; ctx.font = `11px ${F.sans}`; ctx.fillText("나무 그늘", bx + cw / 2, 16);
    }
    const tb = last ? last.tb.toFixed(1) + " °C" : s.b.t0 + " °C";
    const tw = last ? last.tw.toFixed(1) + " °C" : s.w.t0 + " °C";
    can(ctx, bx, gy - ch, cw, ch, "#2b2b2e", s.b.v, tb, "검은");
    can(ctx, wx, gy - ch, cw, ch, "#f7f7f2", s.w.v, tw, "흰");
    ctx.fillStyle = C.ink3; ctx.font = `11px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillText(last ? "마지막 측정: 20분 뒤 온도" : "처음 물 온도", 10, h - 12);
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const rows = tbl.rows;
    const all = rows.flatMap((r) => [r.tb, r.tw]);
    let lo = all.length ? Math.floor(Math.min(...all) - 1) : 24, hi = all.length ? Math.ceil(Math.max(...all) + 1) : 34;
    if (hi - lo < 4) hi = lo + 4;
    const x0 = 44, y0 = 30, bw = w - x0 - 16, bh = h - y0 - 28;
    const Y = (v) => y0 + bh - (v - lo) / (hi - lo) * bh;
    NM.axes(ctx, { x0, y0, w: bw, h: bh, X: (v) => v, Y, yt: L.ticks(lo, hi, 4).map((v) => [v, String(v)]), ylabel: "20분 뒤 물 온도 (°C)" });
    [["tb", "검은 깡통", C.ink, 0.3], ["tw", "흰 깡통", C.amber, 0.7]].forEach(([k, lab, col, fx]) => {
      const cx = x0 + bw * fx, xs = rows.map((r) => r[k]);
      ctx.fillStyle = col; ctx.strokeStyle = col; ctx.lineWidth = 1.3;
      xs.forEach((v, i) => {
        ctx.beginPath(); ctx.arc(cx - 18 + (i % 7) * 6, Y(v), 3.2, 0, Math.PI * 2);
        if (rows[i].cond === "없음") ctx.fill(); else ctx.stroke();
      });
      const st = L.stats(xs);
      if (st.n) {
        ctx.strokeStyle = C.warn; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(cx + 26, Y(st.mean)); ctx.lineTo(cx + 46, Y(st.mean)); ctx.stroke();
        if (st.n > 1) { ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(cx + 36, Y(st.mean - st.sd)); ctx.lineTo(cx + 36, Y(st.mean + st.sd)); ctx.stroke(); }
      }
      ctx.fillStyle = C.ink2; ctx.font = `11.5px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(lab, cx + 8, y0 + bh + 18);
    });
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "right";
    if (w > 480) ctx.fillText("빨간 선: 평균 · 세로 막대: ±표준편차 · 빈 점: 조건을 다르게 둔 기록", w - 12, 11);
  }

  function report() {
    const all = tbl.rows, out = $(".r1e-verdict");
    if (!all.length) {
      ["n-b", "n-w", "n-d"].forEach((c) => { $("." + c).textContent = "—"; });
      out.innerHTML = "가설: 검은 깡통이 빛을 더 많이 흡수해 20분 뒤 물 온도가 더 높을 것이다. 측정 버튼을 눌러 자료를 모으세요.";
      return;
    }
    const ref = all[all.length - 1];
    const rows = all.filter((r) => r.sky === ref.sky && r.cond === ref.cond);
    const b = L.stats(rows.map((r) => r.tb)), wv = L.stats(rows.map((r) => r.tw));
    const d = b.mean - wv.mean, sd = L.stats(rows.map((r) => r.tb - r.tw));
    $(".n-b").textContent = b.mean.toFixed(1) + " °C";
    $(".n-w").textContent = wv.mean.toFixed(1) + " °C";
    $(".n-d").textContent = rows.length > 1 ? `${d.toFixed(1)} ± ${sd.se.toFixed(1)}` : `${d.toFixed(1)} (1회)`;
    let msg = `<span class="small dim">마지막 기록과 같은 조건(${ref.sky}, 다르게 둔 조건: ${ref.cond})의 ${rows.length}회만 계산했습니다.</span> `;
    if (rows.length < 3) msg += `측정이 ${rows.length}번뿐이라 차이가 우연인지 판단하기 어렵습니다. 세 번 이상 재세요.`;
    else if (Math.abs(d) < 2 * sd.se) msg += `차이 ${d.toFixed(1)} °C가 표준오차의 2배보다 작습니다. <b>이 자료로는 두 깡통이 다르다고 말하기 어렵습니다.</b>`;
    else msg += `<b>${d > 0 ? "검은" : "흰"} 깡통이 평균 ${Math.abs(d).toFixed(1)} °C 더 높습니다.</b> 차이가 표준오차의 2배보다 커서 우연으로 보기 어렵습니다.`;
    if (ref.cond !== "없음") msg += ` <span class="r1e-warn">그런데 색 말고도 다르게 둔 조건(${ref.cond})이 있습니다. 차이가 색 때문인지 가려낼 수 없습니다.</span>`;
    out.innerHTML = msg;
  }

  function run() {
    const s = setup(), weather = 1 + 0.12 * L.gauss();
    const tb = L.measure(finalT(s.b, sky * weather), { sd: 0.3, res: 0.1 });
    const tw = L.measure(finalT(s.w, sky * weather), { sd: 0.3, res: 0.1 });
    const cond = [!cVol.checked && "물의 양", !cPos.checked && "자리", !cT0.checked && "처음 온도"].filter(Boolean).join("·") || "없음";
    last = { tb, tw };
    tbl.add({ sky: SKY[sky], cond, tb, tw });
    drawApp();
  }

  [cVol, cPos, cT0].forEach((el) => el.addEventListener("change", () => { last = null; drawApp(); }));
  $(".r1e-sky").addEventListener("click", (e) => {
    const b = e.target.closest("[data-s]"); if (!b) return;
    sky = +b.dataset.s; last = null;
    root.querySelectorAll(".r1e-sky [data-s]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    drawApp();
  });
  $(".r1e-run").addEventListener("click", run);
  $(".r1e-clr").addEventListener("click", () => { last = null; tbl.clear(); drawApp(); });
  report();
  if (L.demo) {
    for (let i = 0; i < 5; i++) run();
    cVol.checked = false;
    for (let i = 0; i < 3; i++) run();
  }
})();
