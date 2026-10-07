/* 카드: 파스퇴르–푸셰 논쟁 모식 실험 — 액체(포자), 목 모양(먼지), 장소, 끓인 시간 */
(() => {
  const root = document.getElementById("card-hist-pasteur");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const st = { liq: "yeast", neck: "swan", place: "lab" };
  const NAME = { yeast: "효모 설탕물", hay: "건초 우린 물", open: "곧은 목", swan: "백조목", broken: "백조목 꺾음", lab: "실험실", alps: "빙하" };
  let flasks = null, grow = 1;

  /* 모식 확률: 액체 속 생존(끓임), 공기 먼지 유입 */
  function pContam() {
    const t = +$(".t").value, tyn = $(".tyn").checked;
    let surv = st.liq === "yeast" ? 0.95 * Math.exp(-t / 0.8) : 0.97 * Math.exp(-t / 45);
    if (tyn) surv *= st.liq === "yeast" ? 0.05 : 0.004;
    const dust = st.place === "lab" ? 1 : 0.15;
    const air = st.neck === "swan" ? 0.01 : 0.92 * dust;
    return 1 - (1 - surv) * (1 - air);
  }

  const cv = fit($(".cv-wide"), () => draw());
  const tbl = L.table($(".tbl-host"), [
    { key: "liq", label: "액체" }, { key: "t", label: "끓임(분)", res: 1 }, { key: "neck", label: "목" },
    { key: "place", label: "장소" }, { key: "n", label: "상한 수 / 10", res: 1 },
  ]);

  function flaskPath(ctx, x, y, s, neck) {
    const R = 20 * s, a = Math.asin(4 * s / R), ny = y - Math.sqrt(R * R - 16 * s * s), top = ny - 8 * s;
    ctx.beginPath(); ctx.arc(x, y, R, -Math.PI / 2 + a, -Math.PI / 2 - a + Math.PI * 2); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x - 4 * s, ny); ctx.lineTo(x - 4 * s, top); ctx.moveTo(x + 4 * s, ny); ctx.lineTo(x + 4 * s, top);
    if (neck === "open") { ctx.moveTo(x - 4 * s, top); ctx.lineTo(x - 4 * s, top - 40 * s); ctx.moveTo(x + 4 * s, top); ctx.lineTo(x + 4 * s, top - 40 * s); }
    else {
      /* S자 목: 위로 올라가다 오른쪽 아래로 처졌다가 다시 올라감 */
      const seg = (o) => {
        ctx.moveTo(x + o, top);
        ctx.bezierCurveTo(x + o, top - 26 * s, x + 24 * s + o, top - 26 * s, x + 24 * s + o, top - 8 * s);
        if (neck === "swan") ctx.bezierCurveTo(x + 24 * s + o, top + 6 * s, x + 44 * s + o, top + 6 * s, x + 46 * s + o, top - 18 * s);
      };
      seg(-4 * s); seg(4 * s);
      if (neck === "broken") { ctx.moveTo(x + 18 * s, top - 6 * s); ctx.lineTo(x + 30 * s, top - 10 * s); }
    }
    ctx.stroke();
  }

  function draw() {
    const { ctx } = cv, { w, h } = cv.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const n = 10, cols = 5, rows = 2, cw = w / cols, rh = (h - 30) / rows, s = Math.min(cw / 84, rh / 72);
    for (let i = 0; i < n; i++) {
      const c = i % cols, r = Math.floor(i / cols);
      const x = c * cw + cw * 0.3, y = 30 + r * rh + rh - 22 * s;
      const bad = flasks && flasks[i];
      const k = bad ? Math.min(1, grow) : 0, R = 20 * s;
      ctx.save(); ctx.beginPath(); ctx.arc(x, y, R - 1, 0, Math.PI * 2); ctx.clip();
      ctx.fillStyle = `rgb(${Math.round(240 - 80 * k)},${Math.round(214 - 92 * k)},${Math.round(150 - 70 * k)})`;
      ctx.fillRect(x - R, y - R * 0.15, 2 * R, 2 * R);
      if (bad && k > 0.3) {
        ctx.fillStyle = "rgba(80,60,30,.4)";
        for (let j = 0; j < 18; j++) { const ang = j * 2.39, rr = (0.2 + (j * 7 % 11) / 14) * R; ctx.beginPath(); ctx.arc(x + Math.cos(ang) * rr, y + R * 0.35 + Math.sin(ang) * rr * 0.5, 1.3, 0, 7); ctx.fill(); }
      }
      ctx.restore();
      ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.4; flaskPath(ctx, x, y, s, st.neck);
    }
    ctx.fillStyle = C.ink2; ctx.font = `12px ${F.sans}`; ctx.textAlign = "left";
    const t = +$(".t").value;
    ctx.fillText(`${NAME[st.liq]} · ${t}분 끓임${$(".tyn").checked ? " ×3" : ""} · ${NAME[st.neck]} · ${NAME[st.place]}`, 10, 18);
    if (flasks) {
      const nb = flasks.filter(Boolean).length;
      ctx.textAlign = "right"; ctx.fillStyle = nb ? C.warn : C.forest; ctx.font = `600 13px ${F.sans}`;
      ctx.fillText(grow >= 1 ? `2주 뒤: 흐려진 플라스크 ${nb}개` : "관찰 중…", w - 10, 18);
    }
  }

  function run() {
    const p = pContam();
    flasks = Array.from({ length: 10 }, () => Math.random() < p);
    grow = 0;
    tbl.add({ liq: NAME[st.liq], t: +$(".t").value + ($(".tyn").checked ? "×3" : ""), neck: NAME[st.neck], place: NAME[st.place], n: flasks.filter(Boolean).length });
  }

  loop($(".cv-wide"), (dt) => { if (grow < 1) { grow = Math.min(1, grow + dt * 1.2); draw(); } });
  ["liq", "neck", "place"].forEach((g) => $("." + g).addEventListener("click", (e) => {
    const b = e.target.closest(".chip"); if (!b) return;
    st[g] = b.dataset.v; root.querySelectorAll(`.${g} .chip`).forEach((c) => c.setAttribute("aria-pressed", String(c === b)));
    flasks = null; draw();
  }));
  $(".t").addEventListener("input", () => { $(".t-out").textContent = $(".t").value; flasks = null; draw(); });
  $(".tyn").addEventListener("change", () => { flasks = null; draw(); });
  $(".meas").addEventListener("click", run);
  $(".clear").addEventListener("click", () => { tbl.clear(); flasks = null; draw(); });
  if (L.demo) {
    run();
    st.neck = "broken"; run();
    st.neck = "swan"; st.liq = "hay"; run(); grow = 1;
    root.querySelectorAll(".liq .chip").forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.v === "hay")));
  }
})();
