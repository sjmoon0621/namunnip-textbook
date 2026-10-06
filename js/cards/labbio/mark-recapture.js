/* 카드: 쥐며느리 개체군 — 표지 재포획법(채프먼 보정), 구역별 생물·비생물 요인, 밀도 의존·비의존 사건 (가상 자료) */
(() => {
  const root = document.getElementById("card-labbio-mark-recapture");
  if (!root) return;
  const { C, F, fit } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const [cvF, cvP] = root.querySelectorAll("canvas");
  /* 구역: 참 개체 수, 낙엽 g/m², 흙 수분 %, 한낮 지표 온도 °C, 포식자 */
  const PL = [
    { n: "구역 1", N: 400, lit: 600, w: 32, T: 22, pred: "관찰 안 됨" },
    { n: "구역 2", N: 110, lit: 40, w: 18, T: 26, pred: "관찰 안 됨" },
    { n: "구역 3", N: 180, lit: 580, w: 31, T: 22, pred: "두꺼비 2마리, 먼지벌레 여러 마리" },
    { n: "구역 4", N: 130, lit: 550, w: 14, T: 31, pred: "관찰 안 됨" },
  ];
  const EV = ["봄", "가뭄 뒤", "곰팡이병 뒤"];
  const P = 0.3, BX = 5, BY = 4;   /* 한 번 조사에서 한 개체가 판자 밑에서 잡힐 확률, 판자 배치 */
  let plot = 0, ev = 0, pop = [], stage = 0, M = 0, Cc = 0, m = 0;

  const trueN = (p, e) => {
    const N = PL[p].N;
    if (e === 1) return N * 0.45;   /* 가뭄: 밀도와 상관없이 같은 비율 */
    if (e === 2) return N / (1 + N / 250);   /* 전염병: 빽빽할수록 더 많이 죽음 */
    return N;
  };
  const chap = (M, C, m) => {
    const N = (M + 1) * (C + 1) / (m + 1) - 1;
    const v = (M + 1) * (C + 1) * (M - m) * (C - m) / ((m + 1) ** 2 * (m + 2));
    return { N, se: Math.sqrt(Math.max(0, v)) };
  };

  const fv = fit(cvF, () => drawField());
  const pl = fit(cvP, () => drawPlot());
  const tbl = L.table($(".tbl-host"), [
    { key: "pn", label: "구역" }, { key: "evn", label: "사건" }, { key: "M", label: "M", res: 1 }, { key: "C", label: "C", res: 1 },
    { key: "m", label: "m", res: 1 }, { key: "N", label: "N̂", res: 1 }, { key: "ci", label: "95% 구간" },
  ], () => drawPlot());

  function info() {
    const p = PL[plot];
    $(".mr-plot").innerHTML = `<b>${p.n}</b> <span class="r">낙엽 ${p.lit} g/m² · 흙 수분 ${p.w}% · 한낮 지표 ${p.T} °C</span><br>포식자: ${p.pred}`;
  }

  function newPop() {
    const N = Math.max(5, Math.round(trueN(plot, ev) * Math.exp(0.05 * L.gauss())));
    pop = Array.from({ length: N }, () => ({ x: Math.random(), y: Math.random(), a: Math.random() * 6.28, mk: false, orig: false, c2: false }));
  }

  function cap1() {
    newPop();
    pop.forEach((o) => { if (Math.random() < P) { o.mk = true; o.orig = true; } });
    M = pop.filter((o) => o.mk).length; stage = 1;
    $(".cap2").disabled = false; drawField();
  }
  function cap2() {
    if (stage !== 1) return;
    const molt = $(".molt").checked, nomix = $(".nomix").checked;
    pop.forEach((o) => {
      if (o.mk && molt && Math.random() < 0.35) o.mk = false;
      if (!nomix) { o.x = Math.random(); o.y = Math.random(); }
      o.c2 = Math.random() < (nomix && o.orig ? 0.55 : P);
    });
    Cc = pop.filter((o) => o.c2).length; m = pop.filter((o) => o.c2 && o.mk).length; stage = 2;
    $(".cap2").disabled = true;
    const r = chap(M, Cc, m);
    const flag = (molt ? "*" : "") + (nomix ? "†" : "");
    tbl.add({ p: plot, e: ev, pn: PL[plot].n.replace("구역 ", "") + flag, evn: EV[ev], M, C: Cc, m, N: r.N, se: r.se, ci: `${Math.max(0, Math.round(r.N - 1.96 * r.se))}~${Math.round(r.N + 1.96 * r.se)}` });
    drawField();
  }
  function reset() { stage = 0; pop = []; $(".cap2").disabled = true; drawField(); }

  function drawField() {
    const { ctx } = fv, { w, h } = fv.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const x0 = 6, y0 = 26, fw = w - 12, fh = h - 32;
    ctx.fillStyle = PL[plot].lit > 300 ? "#c9b98f" : "#b9a57e"; ctx.fillRect(x0, y0, fw, fh);
    let sd = 3 + plot * 31; const R = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
    if (PL[plot].lit > 300) for (let i = 0; i < 90; i++) { ctx.fillStyle = ["#b39a66", "#a5884f", "#c7ad74", "#9c7d45"][i % 4]; ctx.beginPath(); ctx.ellipse(x0 + R() * fw, y0 + R() * fh, 6, 3, R() * 3, 0, Math.PI * 2); ctx.fill(); }
    if (plot === 3) { ctx.fillStyle = "rgba(255,236,170,.35)"; ctx.fillRect(x0, y0, fw, fh); }
    /* 판자 */
    ctx.fillStyle = "rgba(120,92,58,.35)"; ctx.strokeStyle = "rgba(90,66,40,.6)"; ctx.lineWidth = 1;
    for (let i = 0; i < BX; i++) for (let j = 0; j < BY; j++) { const bx = x0 + fw * (i + 0.5) / BX - 16, by = y0 + fh * (j + 0.5) / BY - 10; ctx.fillRect(bx, by, 32, 20); ctx.strokeRect(bx + 0.5, by + 0.5, 31, 19); }
    if (plot === 2) { ctx.fillStyle = "#7d7a4a"; [[0.13, 0.3], [0.78, 0.72]].forEach(([u, v]) => { ctx.beginPath(); ctx.ellipse(x0 + u * fw, y0 + v * fh, 9, 7, 0, 0, Math.PI * 2); ctx.fill(); }); }
    /* 개체 */
    for (const o of pop) {
      const px = x0 + 4 + o.x * (fw - 8), py = y0 + 4 + o.y * (fh - 8);
      ctx.save(); ctx.translate(px, py); ctx.rotate(o.a);
      ctx.fillStyle = "#5d5d61"; ctx.beginPath(); ctx.ellipse(0, 0, 3.6, 2.2, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      if (o.mk) { ctx.fillStyle = "#f2c230"; ctx.beginPath(); ctx.arc(px, py, 1.6, 0, Math.PI * 2); ctx.fill(); }
      if (stage === 2 && o.c2) { ctx.strokeStyle = o.mk ? C.forest : C.ink; ctx.lineWidth = o.mk ? 2 : 1; ctx.beginPath(); ctx.arc(px, py, 6, 0, Math.PI * 2); ctx.stroke(); }
    }
    ctx.fillStyle = C.ink; ctx.font = `600 12px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillText(`${PL[plot].n} · ${EV[ev]}`, x0, 16);
    ctx.font = `11px ${F.mono}`; ctx.textAlign = "right";
    const t = stage === 0 ? "조사 전 — 개체는 판자 밑에 숨어 있어 다 셀 수 없습니다" : stage === 1 ? `1차: ${M}마리 표지 후 놓아줌` : `2차: C = ${Cc}, 그중 표지 m = ${m}`;
    ctx.fillStyle = stage === 2 ? C.forest : C.ink2; ctx.fillText(t, w - 6, 16);
    if (stage === 0) { ctx.fillStyle = "rgba(201,185,143,.85)"; ctx.fillRect(x0, y0, fw, fh); ctx.fillStyle = C.ink2; ctx.font = `12px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("‘1차’를 누르면 판자 밑을 뒤져 잡습니다", w / 2, y0 + fh / 2); }
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const rs = tbl.rows, n = rs.length;
    const pts = rs.map((r, i) => ({ x: i + 1, y: r.N, ey: 1.96 * r.se }));
    const top = Math.max(200, ...pts.map((p) => p.y + p.ey)) * 1.05;
    const box = { x0: 44, y0: 30, w: w - 58, h: h - 64 };
    const g = L.plot(ctx, box, { pts, xr: [0.5, Math.max(4, n) + 0.5], yr: [0, top], xlabel: "기록 번호", ylabel: "N̂ ± 95% 구간 (마리)" });
    ctx.font = `600 10px ${F.mono}`; ctx.textAlign = "center";
    rs.forEach((r, i) => { ctx.fillStyle = [C.forest, C.amber, C.apple, "#3d6fb0"][r.p]; ctx.fillText(String(r.p + 1) + ["", "가", "병"][r.e], g.X(i + 1), Math.max(box.y0 + 10, g.Y(r.N + 1.96 * r.se) - 6)); });
    ctx.font = `10.5px ${F.sans}`; ctx.fillStyle = C.ink3; ctx.textAlign = "right";
    ctx.fillText("숫자 = 구역, 가 = 가뭄 뒤, 병 = 곰팡이병 뒤", box.x0 + box.w, 14);
  }

  const press = (sel, attr, b) => root.querySelectorAll(`${sel} [${attr}]`).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
  $(".plot").addEventListener("click", (e) => { const b = e.target.closest("[data-p]"); if (!b) return; plot = +b.dataset.p; press(".plot", "data-p", b); info(); reset(); });
  $(".ev").addEventListener("click", (e) => { const b = e.target.closest("[data-e]"); if (!b) return; ev = +b.dataset.e; press(".ev", "data-e", b); reset(); });
  [".molt", ".nomix"].forEach((s) => $(s).addEventListener("change", () => { if (stage === 1) return; reset(); }));
  $(".cap1").addEventListener("click", cap1);
  $(".cap2").addEventListener("click", cap2);
  $(".clear").addEventListener("click", () => { tbl.clear(); reset(); });
  info();
  if (L.demo) {
    [[0, 0], [1, 0], [2, 0], [3, 0], [0, 1], [1, 1], [0, 2], [1, 2]].forEach(([p, e]) => { plot = p; ev = e; cap1(); cap2(); });
    press(".plot", "data-p", root.querySelector('[data-p="1"]')); press(".ev", "data-e", root.querySelector('[data-e="2"]')); info(); drawField();
  }
})();
