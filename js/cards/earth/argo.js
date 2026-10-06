/* 카드(실험): 바다마다 깊이에 따라 수온과 염분은 어떻게 다를까? — WOA23(2015–2022, Argo 시대) 실제 연직 분포, σt, T–S도, 플로트 측정 */
(() => {
  const root = document.getElementById("card-earth-argo");
  if (!root || !window.NMArgo) return;
  const { C, F, fit, axes, clamp } = NM;
  const L = NMLab, D = NMArgo, Z = D.z;
  const $ = (s) => root.querySelector(s);
  const SITE = {
    eqp: { name: "적도 태평양", col: "#d4493a" },
    nps: { name: "북태평양 아열대", col: "#e0a02a" },
    es: { name: "동해 울릉 분지", col: "#3b7c2a" },
    lab: { name: "래브라도해", col: "#3a62b0" },
    so: { name: "남극해", col: "#7a4fa8" },
    med: { name: "지중해 유출수", col: "#8a5a2b" },
  };
  const VIEW = { T: { lab: "수온 (°C)", r: [-2, 30], st: 5 }, S: { lab: "염분 (psu)", r: [32.5, 37], st: 0.5 }, R: { lab: "밀도 σt (kg/m³)", r: [21, 28.5], st: 1 } };

  /* σt: UNESCO 1980 해수 상태 방정식의 대기압(0 dbar) 식. σt = ρ(S, T, 0) − 1000 */
  function sigt(S, T) {
    const rw = 999.842594 + 6.793952e-2 * T - 9.09529e-3 * T * T + 1.001685e-4 * T ** 3 - 1.120083e-6 * T ** 4 + 6.536332e-9 * T ** 5;
    const A = 8.24493e-1 - 4.0899e-3 * T + 7.6438e-5 * T * T - 8.2467e-7 * T ** 3 + 5.3875e-9 * T ** 4;
    const B = -5.72466e-3 + 1.0227e-4 * T - 1.6546e-6 * T * T;
    return rw + A * S + B * S ** 1.5 + 4.8314e-4 * S * S - 1000;
  }
  const prof = (k, m) => {
    const s = D.site[k], T = s["T" + m], S = s["S" + m];
    return { T, S, R: T.map((t, i) => sigt(S[i], t)) };
  };
  const at = (arr, z) => {
    z = clamp(z, 0, 2000);
    let i = 0; while (i < Z.length - 2 && Z[i + 1] < z) i++;
    const f = (z - Z[i]) / (Z[i + 1] - Z[i]);
    return arr[i] + (arr[i + 1] - arr[i]) * clamp(f, 0, 1);
  };
  /* 혼합층: 10 m보다 σt가 0.03 kg/m³ 커지는 깊이 (de Boyer Montégut 등 2004의 밀도 기준) */
  function mld(p) {
    const r10 = at(p.R, 10);
    for (let i = 2; i < Z.length; i++) if (p.R[i] - r10 >= 0.03) {
      const a = p.R[i - 1] - r10, b = p.R[i] - r10;
      return Z[i - 1] + (Z[i] - Z[i - 1]) * (0.03 - a) / (b - a || 1);
    }
    return 2000;
  }
  /* 수온 약층: 혼합층 아래에서 수온이 1 m에 0.02 °C 넘게 떨어지는 구간 */
  function thermo(p, ml) {
    let a = null, b = null;
    for (let i = 1; i < Z.length; i++) {
      const zm = (Z[i] + Z[i - 1]) / 2; if (zm < ml) continue;
      const g = (p.T[i - 1] - p.T[i]) / (Z[i] - Z[i - 1]);
      if (g >= 0.02) { if (a == null) a = Z[i - 1]; b = Z[i]; } else if (a != null && Z[i] - b > 100) break;
    }
    return a == null ? null : [Math.max(a, ml), b];
  }

  let on = new Set(["eqp", "lab"]), focus = "eqp", mon = "08", view = "T";
  const tbl = L.table($(".tbl-host"), [{ key: "s", label: "해역" }, { key: "m", label: "달" }, { key: "z", label: "깊이 (m)", res: 1 }, { key: "t", label: "수온 (°C)", res: 0.01 }, { key: "sa", label: "염분 (psu)", res: 0.01 }, { key: "r", label: "σt", res: 0.01 }], () => draw());
  const cv = fit($("canvas"), () => draw());

  function draw() {
    const { ctx } = cv, { w, h } = cv.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const zmax = $(".zoom").checked ? 500 : 2000, zr = +$(".zr").value;
    $(".zr-out").textContent = zr;
    const keys = Object.keys(SITE).filter((k) => on.has(k)).sort((a, b) => (a === focus) - (b === focus));
    const box = { x0: 48, y0: 26, w: w - 66, h: h - 62 };
    if (view === "TS") drawTS(ctx, box, keys, zr);
    else {
      const V = VIEW[view], [v0, v1] = V.r;
      const X = (v) => box.x0 + (v - v0) / (v1 - v0) * box.w, Y = (z) => box.y0 + z / zmax * box.h;
      const xt = []; for (let v = Math.ceil(v0 / V.st) * V.st; v <= v1 + 1e-9; v += V.st) xt.push([v, String(+v.toFixed(1))]);
      const yt = []; for (let z = 0; z <= zmax; z += zmax / 4) yt.push([z, String(z)]);
      // 층 구분 (기준 해역)
      const fp = prof(focus, mon), ml = mld(fp), th = thermo(fp, ml);
      if ($(".layers").checked) {
        const band = (a, b, col, lab) => { if (a >= zmax) return; const y0 = Y(a), y1 = Y(Math.min(b, zmax)); ctx.fillStyle = col; ctx.fillRect(box.x0, y0, box.w, y1 - y0); if (y1 - y0 > 13) { ctx.fillStyle = C.ink2; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "right"; ctx.fillText(lab, box.x0 + box.w - 4, Math.min(y1 - 4, y0 + 13)); } };
        band(0, Math.min(ml, 2000), "rgba(116,171,102,.16)", "혼합층");
        if (th) band(th[0], th[1], "rgba(224,160,42,.16)", "수온 약층");
        band(th ? th[1] : ml, 2000, "rgba(58,98,176,.07)", th ? "심해층" : "");
      }
      axes(ctx, { ...box, X, Y, xt, yt, xlabel: V.lab, ylabel: "깊이 (m)" });
      ctx.save(); ctx.beginPath(); ctx.rect(box.x0, box.y0, box.w, box.h); ctx.clip();
      keys.forEach((k) => {
        const f = k === focus;
        const draw1 = (m, dash) => {
          const arr = prof(k, m)[view];
          ctx.strokeStyle = SITE[k].col; ctx.lineWidth = f ? 2.4 : 1.4; ctx.globalAlpha = f ? 1 : 0.7; ctx.setLineDash(dash);
          ctx.beginPath(); Z.forEach((z, i) => { if (i && Z[i - 1] > zmax) return; i ? ctx.lineTo(X(arr[i]), Y(z)) : ctx.moveTo(X(arr[i]), Y(z)); }); ctx.stroke();
        };
        if ($(".other").checked) draw1(mon === "02" ? "08" : "02", [4, 4]);
        draw1(mon, []);
      });
      ctx.setLineDash([]); ctx.globalAlpha = 1;
      // 읽기 깊이
      if (zr <= zmax) {
        ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(box.x0, Y(zr)); ctx.lineTo(box.x0 + box.w, Y(zr)); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(X(at(fp[view], zr)), Y(zr), 4, 0, Math.PI * 2); ctx.fill();
      }
      // 기록한 측정값
      tbl.rows.forEach((r) => { const v = view === "T" ? r.t : view === "S" ? r.sa : r.r; if (r.z > zmax) return; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2; const x = X(v), y = Y(r.z); ctx.beginPath(); ctx.moveTo(x - 4, y - 4); ctx.lineTo(x + 4, y + 4); ctx.moveTo(x + 4, y - 4); ctx.lineTo(x - 4, y + 4); ctx.stroke(); });
      ctx.restore();
    }
    nums();
  }

  function drawTS(ctx, box, keys, zr) {
    const s0 = 32.5, s1 = 37, t0 = -2, t1 = 30;
    const X = (s) => box.x0 + (s - s0) / (s1 - s0) * box.w, Y = (t) => box.y0 + box.h - (t - t0) / (t1 - t0) * box.h;
    const xt = []; for (let s = 33; s <= 37; s += 1) xt.push([s, String(s)]);
    axes(ctx, { ...box, X, Y, xt, yt: [0, 5, 10, 15, 20, 25, 30].map((t) => [t, String(t)]), xlabel: "염분 (psu)", ylabel: "수온 (°C)" });
    ctx.save(); ctx.beginPath(); ctx.rect(box.x0, box.y0, box.w, box.h); ctx.clip();
    // 등밀도선: 각 수온에서 σt(S, T) = 값이 되는 염분을 뉴턴법으로 찾는다
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left";
    for (let g = 21; g <= 28; g++) {
      ctx.strokeStyle = "rgba(141,141,146,.45)"; ctx.lineWidth = 1; ctx.beginPath();
      let first = true, lastPt = null;
      for (let t = t0; t <= t1 + 1e-9; t += 0.5) {
        let s = 35; for (let n = 0; n < 6; n++) s -= (sigt(s, t) - g) / ((sigt(s + 0.01, t) - sigt(s - 0.01, t)) / 0.02);
        const x = X(s), y = Y(t); first ? ctx.moveTo(x, y) : ctx.lineTo(x, y); first = false;
        if (s > s0 && s < s1 - 0.15) lastPt = [x, y];
      }
      ctx.stroke();
      if (lastPt && lastPt[1] > box.y0 + 12) ctx.fillText(String(g), lastPt[0] + 3, lastPt[1] + 10);
    }
    keys.forEach((k) => {
      const f = k === focus, p = prof(k, mon);
      ctx.strokeStyle = SITE[k].col; ctx.fillStyle = SITE[k].col; ctx.lineWidth = f ? 2.4 : 1.4; ctx.globalAlpha = f ? 1 : 0.7;
      ctx.beginPath(); Z.forEach((z, i) => (i ? ctx.lineTo(X(p.S[i]), Y(p.T[i])) : ctx.moveTo(X(p.S[i]), Y(p.T[i])))); ctx.stroke();
      [0, 500, 1000, 2000].forEach((z) => { ctx.beginPath(); ctx.arc(X(at(p.S, z)), Y(at(p.T, z)), z ? 2.6 : 4, 0, Math.PI * 2); z ? ctx.fill() : (ctx.lineWidth = 1.5, ctx.stroke()); });
    });
    ctx.globalAlpha = 1;
    const fp = prof(focus, mon);
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(X(at(fp.S, zr)), Y(at(fp.T, zr)), 4.5, 0, Math.PI * 2); ctx.fill();
    tbl.rows.forEach((r) => { ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2; const x = X(r.sa), y = Y(r.t); ctx.beginPath(); ctx.moveTo(x - 4, y - 4); ctx.lineTo(x + 4, y + 4); ctx.moveTo(x + 4, y - 4); ctx.lineTo(x - 4, y + 4); ctx.stroke(); });
    ctx.restore();
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillText("○ 표층 · ● 500·1000·2000 m · 회색: σt", box.x0, box.y0 + box.h + 28);
  }

  function nums() {
    const p = prof(focus, mon), ml = mld(p), th = thermo(p, ml);
    $(".n-ml").textContent = ml >= 2000 ? "2000 m 넘음" : `${Math.round(ml)} m`;
    $(".n-th").textContent = th ? `${Math.round(th[0])}–${Math.round(th[1])} m` : "뚜렷하지 않음";
    $(".n-r0").textContent = p.R[0].toFixed(2);
    $(".n-r1").textContent = at(p.R, 1000).toFixed(2);
    // 수온이 깊이에 따라 오르는 구간이 있는지 (역전), 그래도 밀도는 깊을수록 큰지
    let inv = null; for (let i = 1; i < Z.length; i++) if (p.T[i] > p.T[i - 1] + 0.05 && Z[i] < 1000) { inv = Z[i]; break; }
    const stable = p.R.every((r, i) => !i || r >= p.R[i - 1] - 0.005);
    const v = $(".verdict");
    v.className = "verdict small " + (stable ? "good" : "bad");
    v.textContent = `${SITE[focus].name} ${+mon}월: ` + (inv != null
      ? `${inv} m 부근에서 깊을수록 수온이 오히려 높아집니다. 그래도 아래쪽 물이 더 짜서 밀도는 깊을수록 큽니다(안정).`
      : stable ? "0–2000 m 내내 깊을수록 밀도가 커집니다(안정한 성층)." : "밀도가 깊을수록 작아지는 구간이 있습니다(불안정).");
  }

  function measure() {
    const z = +$(".zr").value, p = prof(focus, mon);
    const heave = L.gauss() * 10;   // 내부파·소용돌이로 물이 위아래로 10 m쯤 출렁인다
    const zz = clamp(z + heave, 0, 2000), bias = $(".drift").checked ? 0.03 : 0;
    const t = L.measure(at(p.T, zz), { sd: 0.002, res: 0.001 }), sa = L.measure(at(p.S, zz), { sd: 0.005, bias, res: 0.001 });
    tbl.add({ s: SITE[focus].name, m: `${+mon}월`, z: L.measure(z, { sd: 1.5, res: 1 }), t, sa, r: sigt(sa, t) });
  }

  const press = (sel, attr, val) => root.querySelectorAll(sel).forEach((x) => x.setAttribute("aria-pressed", String(x.dataset[attr] === val)));
  function syncSites() { root.querySelectorAll("[data-k]").forEach((b) => { b.setAttribute("aria-pressed", String(on.has(b.dataset.k))); b.style.fontWeight = b.dataset.k === focus ? "700" : ""; }); $(".n-focus").textContent = SITE[focus].name; }
  root.querySelectorAll("[data-k]").forEach((b) => { b.querySelector(".sw").style.background = SITE[b.dataset.k].col; });
  $(".sites").addEventListener("click", (e) => {
    const b = e.target.closest("[data-k]"); if (!b) return; const k = b.dataset.k;
    if (on.has(k) && k === focus) { if (on.size > 1) { on.delete(k); focus = [...on][on.size - 1]; } }
    else { on.add(k); focus = k; }
    syncSites(); draw();
  });
  $(".mons").addEventListener("click", (e) => { const b = e.target.closest("[data-m]"); if (!b) return; mon = b.dataset.m; press("[data-m]", "m", mon); draw(); });
  $(".views").addEventListener("click", (e) => { const b = e.target.closest("[data-v]"); if (!b) return; view = b.dataset.v; press("[data-v]", "v", view); draw(); });
  root.querySelectorAll(".zoom, .layers, .other, .zr").forEach((el) => el.addEventListener("input", draw));
  $(".go").addEventListener("click", measure);
  $(".clear").addEventListener("click", () => tbl.clear());
  syncSites(); draw();
  if (L.demo) {
    on = new Set(["eqp", "es", "lab", "so"]); focus = "es"; syncSites();
    $(".zr").value = 150; for (let i = 0; i < 3; i++) measure();
    $(".zr").value = 800; measure(); measure();
    const vq = location.search.match(/[?&]v=(\w+)/);
    if (vq && root.querySelector(`[data-v="${vq[1]}"]`)) root.querySelector(`[data-v="${vq[1]}"]`).click();
    draw();
  }
})();
