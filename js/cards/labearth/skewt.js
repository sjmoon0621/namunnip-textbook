/* 카드: 라디오존데 자료 한 장으로 구름이 생길 높이를 찾을 수 있을까? — 스큐 T–log p 단열선도에서 LCL·CCL·LFC·EL 읽기 */
(() => {
  const root = document.getElementById("card-labearth-skewt");
  if (!root) return;
  const { C, F, fit } = NM;
  const L = NMLab, T = LEThermo, SND = window.LESnd || [];
  const $ = (s) => root.querySelector(s);
  const P0 = 1050, P1 = 100, TMIN = -40, TMAX = 45, SKEW = 75;
  const LBL = { "072706": "7/27 15시", "072700": "7/27 09시", "011700": "1/17 09시" };
  let sid = "072706", snd = null, an = null, cur = null, showTruth = false;
  const lay = { dry: false, mix: false, moist: false, cape: false };
  let box = null;

  const pick = () => { snd = SND.find((s) => s.id === sid); an = T.parcel(snd.lv); };
  const fr = (p) => Math.log(P0 / p) / Math.log(P0 / P1);   // 0 (아래) → 1 (위)
  const X = (t, p) => box.x0 + (t - TMIN + SKEW * fr(p)) / (TMAX - TMIN) * box.w;
  const Y = (p) => box.y0 + box.h * (1 - fr(p));
  const invP = (y) => P0 * Math.pow(P1 / P0, 1 - (y - box.y0) / box.h);
  const invT = (x, p) => (x - box.x0) / box.w * (TMAX - TMIN) + TMIN - SKEW * fr(p);

  const sk = fit($(".sk"), () => draw());
  const tbl = L.table($(".tbl-host"), [
    { key: "s", label: "자료" }, { key: "k", label: "구분" }, { key: "p", label: "p (hPa)", res: 5 },
    { key: "t", label: "T (°C)", res: 0.5 }, { key: "z", label: "높이 (m)", res: 10 }, { key: "dz", label: "계산값과 차 (m)", res: 10 },
  ], () => {});

  function curve(ctx, f, pa, pb, step = 10) {
    ctx.beginPath();
    let first = true;
    for (let p = pa; p >= pb - 1e-6; p -= step) {
      const t = f(p); if (t == null || !Number.isFinite(t)) { first = true; continue; }
      const x = X(t, p), y = Y(p);
      if (first) { ctx.moveTo(x, y); first = false; } else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  function truthOf(k) {
    if (k === "LCL") return an.lcl.p;
    if (k === "CCL") return an.ccl ? an.ccl.p : null;
    if (k === "LFC") return an.lfc;
    if (k === "EL") return an.el;
    return null;
  }

  function draw() {
    const { ctx } = sk, { w, h } = sk.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    box = { x0: 38, y0: 8, w: w - 38 - 34, h: h - 8 - 30 };
    ctx.save(); ctx.beginPath(); ctx.rect(box.x0, box.y0, box.w, box.h); ctx.clip();
    /* 등온선 */
    ctx.lineWidth = 1; ctx.strokeStyle = C.rule;
    for (let t = -120; t <= 50; t += 10) { ctx.beginPath(); ctx.moveTo(X(t, P0), Y(P0)); ctx.lineTo(X(t, P1), Y(P1)); ctx.stroke(); }
    ctx.strokeStyle = "#a9c3d9"; ctx.beginPath(); ctx.moveTo(X(0, P0), Y(P0)); ctx.lineTo(X(0, P1), Y(P1)); ctx.stroke();
    /* 등압선 */
    ctx.strokeStyle = C.rule;
    for (let p = 1000; p >= 100; p -= 100) { ctx.beginPath(); ctx.moveTo(box.x0, Y(p)); ctx.lineTo(box.x0 + box.w, Y(p)); ctx.stroke(); }
    /* 건조 단열선 */
    ctx.strokeStyle = "rgba(181,83,47,.28)";
    for (let th = -30; th <= 170; th += 10) curve(ctx, (p) => T.dryT(th, p), P0, P1, 25);
    /* 습윤 단열선 */
    ctx.strokeStyle = "rgba(59,124,42,.35)"; ctx.setLineDash([5, 3]);
    for (let t0 = -12; t0 <= 32; t0 += 4) {
      let tt = t0, pp = 1000; const pts = [[P0, T.moistT(t0, 1000, P0)], [1000, t0]];
      for (let p = 990; p >= 200; p -= 10) { tt = T.moistT(tt, pp, p); pp = p; pts.push([p, tt]); }
      ctx.beginPath(); pts.forEach(([p, t], i) => (i ? ctx.lineTo(X(t, p), Y(p)) : ctx.moveTo(X(t, p), Y(p)))); ctx.stroke();
    }
    /* 혼합비선 */
    ctx.strokeStyle = "rgba(120,80,160,.45)"; ctx.setLineDash([2, 3]);
    const WS = [1, 2, 4, 7, 10, 16, 24];
    for (const g of WS) curve(ctx, (p) => T.wLineT(g / 1000, p), P0, 600, 25);
    ctx.setLineDash([]);
    ctx.fillStyle = "rgba(120,80,160,.85)"; ctx.font = `9.5px ${F.mono}`; ctx.textAlign = "center";
    for (const g of WS) ctx.fillText(String(g), X(T.wLineT(g / 1000, 600), 600), Y(600) - 3);

    const s0 = snd.lv[0], w0 = an.w0;
    /* 양의 부력 칠하기 */
    if (lay.cape && an.lfc) {
      ctx.fillStyle = "rgba(212,73,58,.18)";
      const seg = an.path.filter(([p]) => p <= an.lfc && p >= an.el);
      ctx.beginPath();
      seg.forEach(([p, tp], i) => (i ? ctx.lineTo(X(tp, p), Y(p)) : ctx.moveTo(X(tp, p), Y(p))));
      for (let i = seg.length - 1; i >= 0; i--) ctx.lineTo(X(seg[i][2], seg[i][0]), Y(seg[i][0]));
      ctx.closePath(); ctx.fill();
    }
    /* 학생이 그리는 작도선 */
    ctx.lineWidth = 2;
    if (lay.dry) { ctx.strokeStyle = C.warn; curve(ctx, (p) => T.dryT(an.theta, p), s0[0], Math.max(400, an.lcl.p - 150), 5); }
    if (lay.mix) { ctx.strokeStyle = "#7850a0"; ctx.setLineDash([6, 3]); curve(ctx, (p) => T.wLineT(w0, p), s0[0], 450, 5); ctx.setLineDash([]); }
    if (lay.moist) {
      ctx.strokeStyle = C.ink; ctx.setLineDash([7, 4]);
      const seg = an.path.filter(([p]) => p <= an.lcl.p);
      ctx.beginPath(); seg.forEach(([p, tp], i) => (i ? ctx.lineTo(X(tp, p), Y(p)) : ctx.moveTo(X(tp, p), Y(p)))); ctx.stroke(); ctx.setLineDash([]);
    }
    /* 관측 곡선 */
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = C.apple; ctx.beginPath(); snd.lv.forEach((r, i) => (i ? ctx.lineTo(X(r[2], r[0]), Y(r[0])) : ctx.moveTo(X(r[2], r[0]), Y(r[0])))); ctx.stroke();
    ctx.strokeStyle = C.forest; ctx.beginPath();
    let st = false; snd.lv.forEach((r) => { if (r[3] == null) return; const x = X(r[3], r[0]), y = Y(r[0]); st ? ctx.lineTo(x, y) : ctx.moveTo(x, y); st = true; }); ctx.stroke();
    /* 계산값 표시 */
    if (showTruth) {
      const mk = [["LCL", an.lcl.p, an.lcl.T], ["CCL", an.ccl && an.ccl.p, an.ccl && an.ccl.T], ["LFC", an.lfc, an.lfc && T.envT(snd.lv, an.lfc)], ["EL", an.el, an.el && T.envT(snd.lv, an.el)]];
      ctx.font = `600 10.5px ${F.mono}`; ctx.textAlign = "left";
      mk.forEach(([k, p, t], i) => {
        if (!p) return;
        const x = X(t, p), y = Y(p);
        ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(x, y, 3.5, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x + 4, y); ctx.lineTo(x + 18 + (i % 2) * 34, y); ctx.stroke();
        ctx.fillText(k, x + 20 + (i % 2) * 34, y + 4);
      });
    }
    /* 기록한 점 */
    ctx.fillStyle = C.warn;
    tbl.rows.filter((r) => r.s === LBL[sid]).forEach((r) => { ctx.beginPath(); ctx.arc(X(r.t, r.p), Y(r.p), 3, 0, Math.PI * 2); ctx.fill(); });
    /* 커서 */
    if (cur) {
      ctx.strokeStyle = C.ink2; ctx.lineWidth = 1;
      const x = X(cur.t, cur.p), y = Y(cur.p);
      ctx.beginPath(); ctx.moveTo(x - 10, y); ctx.lineTo(x + 10, y); ctx.moveTo(x, y - 10); ctx.lineTo(x, y + 10); ctx.stroke();
      ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();
    /* 축 글자 */
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "right";
    for (let p = 1000; p >= 100; p -= 100) ctx.fillText(String(p), box.x0 - 4, Y(p) + 3);
    ctx.textAlign = "left"; ctx.fillText("hPa", 2, box.y0 + box.h + 14);
    ctx.textAlign = "center";
    for (let t = -40; t <= 40; t += 10) ctx.fillText(String(t), X(t, P0), box.y0 + box.h + 13);
    ctx.textAlign = "right"; ctx.fillText("기온 (°C, 1050 hPa 기준)", box.x0 + box.w, box.y0 + box.h + 26);
    ctx.textAlign = "left";
    for (const km of [1, 2, 3, 5, 7, 10, 12, 14]) {
      const p = T.pAtZ(snd.lv, km * 1000); if (!p || p < P1) continue;
      const y = Y(p); ctx.strokeStyle = C.ink3; ctx.beginPath(); ctx.moveTo(box.x0 + box.w, y); ctx.lineTo(box.x0 + box.w + 4, y); ctx.stroke();
      ctx.fillText(km + "km", box.x0 + box.w + 6, y + 3);
    }
    /* 범례 */
    ctx.font = `10.5px ${F.sans}`;
    ctx.fillStyle = C.apple; ctx.fillText("기온", box.x0 + 6, box.y0 + 14);
    ctx.fillStyle = C.forest; ctx.fillText("이슬점", box.x0 + 40, box.y0 + 14);
    ctx.fillStyle = C.ink2; ctx.fillText("포항 " + LBL[sid], box.x0 + 86, box.y0 + 14);
  }

  function readout() {
    if (!cur) { $(".sk-read").textContent = "단열선도를 누르거나 끌어서 읽을 점을 고르세요."; return; }
    const z = T.zAt(snd.lv, cur.p);
    $(".sk-read").textContent = `커서  p ${cur.p.toFixed(0)} hPa · T ${cur.t.toFixed(1)} °C · 높이 ${z == null ? "—" : Math.round(z) + " m"} · 온위 ${T.thetaOf(cur.t, cur.p).toFixed(1)} °C · 포화 혼합비 ${(1000 * T.ws(cur.t, cur.p)).toFixed(1)} g/kg`;
  }
  function nums() {
    const f = (p) => (p ? `${Math.round(p)} hPa · ${Math.round(T.zAt(snd.lv, p) / 10) * 10} m` : "없음");
    const set = (c, v) => ($(".n-" + c).textContent = showTruth ? v : "—");
    set("lcl", f(an.lcl.p)); set("ccl", f(an.ccl && an.ccl.p)); set("lfc", f(an.lfc)); set("el", f(an.el));
    const s0 = snd.lv[0];
    $(".sk-cape").textContent = showTruth
      ? `지표 ${s0[2]} °C / 이슬점 ${s0[3]} °C, 혼합비 ${(1000 * an.w0).toFixed(1)} g/kg · CAPE ${Math.round(an.cape)} J/kg · CIN ${Math.round(an.cin)} J/kg · 대류 온도 ${an.convT.toFixed(1)} °C`
      : `지표 ${s0[2]} °C / 이슬점 ${s0[3]} °C (${s0[0]} hPa)`;
  }

  function pointer(e) {
    const r = $(".sk").getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    if (!box || y < box.y0 || y > box.y0 + box.h || x < box.x0 || x > box.x0 + box.w) return;
    const p = invP(y); cur = { p, t: invT(x, p) }; readout(); draw();
  }
  let down = false;
  $(".sk").addEventListener("pointerdown", (e) => { down = true; pointer(e); });
  $(".sk").addEventListener("pointermove", (e) => { if (down) pointer(e); });
  window.addEventListener("pointerup", () => { down = false; });

  function record(k) {
    if (!cur) return;
    const p = L.snap(cur.p, 5), t = L.snap(cur.t, 0.5), z = T.zAt(snd.lv, p), tp = truthOf(k);
    tbl.add({ s: LBL[sid], k, p, t, z: z == null ? NaN : z, dz: tp && z != null ? z - T.zAt(snd.lv, tp) : NaN });
    draw();
  }
  root.querySelectorAll("[data-k]").forEach((b) => b.addEventListener("click", () => record(b.dataset.k)));
  $(".clear").addEventListener("click", () => { tbl.clear(); draw(); });
  $(".truth").addEventListener("click", (e) => { showTruth = !showTruth; e.currentTarget.setAttribute("aria-pressed", String(showTruth)); nums(); draw(); });
  $(".snd").addEventListener("click", (e) => {
    const b = e.target.closest("[data-s]"); if (!b) return;
    sid = b.dataset.s; root.querySelectorAll("[data-s]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    pick(); cur = null; readout(); nums(); draw();
  });
  $(".lay").addEventListener("click", (e) => {
    const b = e.target.closest("[data-l]"); if (!b) return;
    lay[b.dataset.l] = !lay[b.dataset.l]; b.setAttribute("aria-pressed", String(lay[b.dataset.l])); draw();
  });
  pick(); nums();
  if (L.demo) {
    ["dry", "mix", "moist", "cape"].forEach((k) => { lay[k] = true; root.querySelector(`[data-l="${k}"]`).setAttribute("aria-pressed", "true"); });
    const pts = [["LCL", an.lcl.p + 12, an.lcl.T + 0.6], ["CCL", an.ccl.p - 8, an.ccl.T - 0.4], ["LFC", an.lfc + 15, T.envT(snd.lv, an.lfc) + 0.5], ["EL", an.el - 5, T.envT(snd.lv, an.el)]];
    pts.forEach(([k, p, t]) => { cur = { p, t }; record(k); });
    showTruth = true; $(".truth").setAttribute("aria-pressed", "true"); nums();
    cur = { p: an.lcl.p + 12, t: an.lcl.T + 0.6 }; readout();
  }
})();
