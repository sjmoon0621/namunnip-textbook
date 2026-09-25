/* 카드: 신경 신호는 전선 속 전류와 무엇이 다를까? — 막전위와 활동 전위
   호지킨–헉슬리 모형(오징어 거대 축삭)을 휴지 전위 −70 mV에 맞춰 옮긴 모식 모형 */
(() => {
  const root = document.getElementById("card-bio-ap");
  if (!root) return;
  const { C, F, fit, loop, clamp } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const sAmp = $(".amp"), oAmp = $(".amp-out");
  const cSec = $(".second"), sGap = $(".gap"), oGap = $(".gap-out");
  const cTtx = $(".ttx"), btn = $(".fire");
  const nPeak = $(".peak"), nFire = $(".fired"), nSec = $(".sec2"), msg = $(".ap-msg");
  const NA = "#d08a1e", K = "#3f6f9f";

  /* 게이트 속도 상수 (단위: ms⁻¹, V는 mV). 원래 모형의 −65 mV 기준을 −70 mV로 옮기고,
     Na⁺ 통로 활성화 곡선을 4 mV 옮겨 역치가 약 −55 mV가 되게 했다. */
  function rates(V) {
    const u = V + 5, um = u - 4, x1 = u + 55, x2 = um + 40;
    return {
      an: Math.abs(x1) < 1e-6 ? 0.1 : 0.01 * x1 / (1 - Math.exp(-x1 / 10)), bn: 0.125 * Math.exp(-(u + 65) / 80),
      am: Math.abs(x2) < 1e-6 ? 1 : 0.1 * x2 / (1 - Math.exp(-x2 / 10)), bm: 4 * Math.exp(-(um + 65) / 18),
      ah: 0.07 * Math.exp(-(um + 65) / 20), bh: 1 / (1 + Math.exp(-(um + 35) / 10)),
    };
  }
  const T = 16, PHI = 2, DT = 0.005, EVERY = 10;
  function sim(amp, second, gap, ttx) {
    const gNa = ttx ? 0 : 120;
    let V = -70, r = rates(V);
    let n = r.an / (r.an + r.bn), m = r.am / (r.am + r.bm), h = r.ah / (r.ah + r.bh);
    const step = (I) => {
      r = rates(V);
      n += PHI * DT * (r.an * (1 - n) - r.bn * n);
      m += PHI * DT * (r.am * (1 - m) - r.bm * m);
      h += PHI * DT * (r.ah * (1 - h) - r.bh * h);
      V += DT * (I - gNa * m * m * m * h * (V - 45) - 36 * n ** 4 * (V + 82) - 0.3 * (V + 57.5));
    };
    for (let i = 0; i < 20000; i++) step(0); // 휴지 상태로 가라앉히기
    const out = [];
    for (let i = 0, t = 0; t <= T + 1e-9; i++, t = i * DT) {
      let I = 0;
      if (t >= 1 && t < 1.5) I += amp;
      if (second && t >= 1 + gap && t < 1.5 + gap) I += amp;
      step(I);
      if (i % EVERY === 0) out.push({ t, V, na: (ttx ? 0 : m * m * m * h) / 0.31, k: n ** 4 / 0.38 });
    }
    return out;
  }

  let data = [], cur = T, playing = false;
  const { ctx, size } = fit(cv, () => draw());
  const at = (t) => data[clamp(Math.round(t / (DT * EVERY)), 0, data.length - 1)];

  function layout() {
    const { w, h } = size;
    const stack = w < 620;
    if (stack) {
      const mh = Math.round(h * 0.3);
      return { stack, mem: { x: 0, y: 0, w, h: mh }, g: { x: 40, y: mh + 30, w: w - 50, h: h - mh - 30 - 30 } };
    }
    const mw = Math.round(w * 0.34);
    return { stack, mem: { x: w - mw, y: 0, w: mw, h }, g: { x: 40, y: 22, w: w - mw - 58, h: h - 22 - 30 } };
  }

  function draw() {
    const { w, h } = size;
    if (!w || !data.length) return;
    ctx.clearRect(0, 0, w, h);
    const L = layout(), g = L.g;
    const vh = g.h * 0.7, gh = g.h - vh - 18; // 위: 막전위, 아래: 통로 열림
    const X = (t) => g.x + t / T * g.w;
    const Y = (v) => g.y + (1 - (v + 90) / 140) * vh;
    NM.axes(ctx, { x0: g.x, y0: g.y, w: g.w, h: vh, X, Y,
      xt: [], yt: [[40, "+40"], [0, "0"], [-40, "−40"], [-70, "−70"]], ylabel: "막전위 (mV)" });
    // 역치 부근, 휴지 전위
    ctx.fillStyle = "rgba(181,83,47,.08)"; ctx.fillRect(g.x, Y(-53), g.w, Y(-57) - Y(-53));
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.warn; ctx.textAlign = "right";
    ctx.fillText("역치 부근 (약 −55)", g.x + g.w - 2, Y(-53) - 3);
    ctx.setLineDash([4, 4]); ctx.strokeStyle = C.ink3; ctx.beginPath(); ctx.moveTo(g.x, Y(-70) + .5); ctx.lineTo(g.x + g.w, Y(-70) + .5); ctx.stroke(); ctx.setLineDash([]);
    // 자극 표시
    const mark = (t0) => { ctx.fillStyle = "rgba(35,35,38,.12)"; ctx.fillRect(X(t0), g.y, X(t0 + 0.5) - X(t0), vh); ctx.fillStyle = C.ink2; ctx.textAlign = "center"; ctx.fillText("자극", X(t0 + 0.25), g.y + vh - 4); };
    mark(1); if (cSec.checked) mark(1 + +sGap.value);
    // 막전위 곡선 (cur까지 진하게)
    ctx.lineWidth = 2.2; ctx.strokeStyle = C.ink; ctx.beginPath();
    data.forEach((d, i) => { if (d.t > cur) return; const x = X(d.t), y = Y(d.V); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
    ctx.stroke();
    // 통로 그래프
    const gy = g.y + vh + 18;
    const Yc = (v) => gy + (1 - clamp(v, 0, 1.15) / 1.15) * gh;
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.strokeRect(g.x + .5, gy + .5, g.w, gh);
    const line = (key, col) => { ctx.strokeStyle = col; ctx.lineWidth = 1.8; ctx.beginPath(); data.forEach((d, i) => { if (d.t > cur) return; i ? ctx.lineTo(X(d.t), Yc(d[key])) : ctx.moveTo(X(d.t), Yc(d[key])); }); ctx.stroke(); };
    line("na", NA); line("k", K);
    ctx.textAlign = "left"; ctx.font = `10px ${F.mono}`;
    ctx.fillStyle = NA; ctx.fillText("Na⁺ 통로", g.x + 4, gy + 11);
    ctx.fillStyle = K; ctx.fillText("K⁺ 통로", g.x + 62, gy + 11);
    ctx.fillStyle = C.ink3; ctx.textAlign = "right"; ctx.fillText("통로가 열린 정도 (상대값)", g.x + g.w - 4, gy + 11);
    // 시간 눈금
    ctx.textAlign = "center";
    for (let t = 0; t <= T; t += 4) ctx.fillText(`${t}`, X(t), gy + gh + 13);
    ctx.textAlign = "right"; ctx.fillText("시간 (ms)", g.x + g.w, gy + gh + 26);
    // 커서
    const d = at(cur);
    ctx.strokeStyle = C.forest; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X(cur) + .5, g.y); ctx.lineTo(X(cur) + .5, gy + gh); ctx.stroke();
    ctx.beginPath(); ctx.arc(X(cur), Y(d.V), 4.5, 0, Math.PI * 2); ctx.fillStyle = C.forest; ctx.fill();
    drawMem(L.mem, d);
    ctx.textAlign = "right"; ctx.font = `600 14px ${F.mono}`; ctx.fillStyle = C.ink;
    ctx.fillText(`${d.V >= 0 ? "+" : "−"}${Math.abs(d.V).toFixed(0)} mV`, g.x + g.w, g.y + 12);
    ctx.font = `11px ${F.sans}`; ctx.fillStyle = C.forest;
    ctx.fillText(phase(data.indexOf(d)), g.x + g.w, g.y + 28);
  }

  function phase(i) {
    const d = data[i], p = data[Math.max(0, i - 1)];
    if (d.V < -71.5) return "과분극";
    if (Math.abs(d.V + 70) < 1.5 && Math.abs(d.V - p.V) < 0.05) return "분극 (휴지 상태)";
    return d.V >= p.V ? "탈분극" : "재분극";
  }

  /* 막 그림: 위가 세포 밖, 아래가 세포 안 */
  const parts = { na: [], k: [], pump: [] };
  let clock = 0;
  function drawMem(b, d) {
    const { x, y, w, h } = b;
    ctx.save();
    ctx.fillStyle = "#f6f1e4"; ctx.fillRect(x + 6, y + 4, w - 12, h - 8);
    const my = y + h * 0.5, mt = 9; // 막 두께의 절반
    ctx.fillStyle = "#e9e3d2"; ctx.fillRect(x + 6, y + 4, w - 12, my - mt - y - 4);
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink2; ctx.textAlign = "left";
    ctx.fillText("세포 밖", x + 12, y + 17); ctx.fillText("세포 안", x + 12, y + h - 10);
    // 인지질 이중층
    for (let px = x + 10; px < x + w - 8; px += 7) {
      ctx.fillStyle = "#c9b98f";
      ctx.beginPath(); ctx.arc(px, my - mt + 2, 2.6, 0, Math.PI * 2); ctx.arc(px, my + mt - 2, 2.6, 0, Math.PI * 2); ctx.fill();
    }
    // 단백질 위치
    const cx = [x + w * 0.24, x + w * 0.5, x + w * 0.78];
    const openNa = clamp(d.na, 0, 1), openK = clamp(d.k, 0, 1);
    const chan = (px, open, col, lab) => {
      const gap = 2 + open * 7;
      ctx.fillStyle = col; ctx.globalAlpha = 0.85;
      ctx.fillRect(px - 12 - gap / 2, my - mt - 5, 12, mt * 2 + 10);
      ctx.fillRect(px + gap / 2, my - mt - 5, 12, mt * 2 + 10);
      ctx.globalAlpha = 1;
      ctx.fillStyle = col; ctx.textAlign = "center"; ctx.fillText(lab, px, my - mt - 10);
      ctx.fillStyle = C.ink3; ctx.fillText(open > 0.12 ? "열림" : "닫힘", px, my + mt + 17);
    };
    chan(cx[0], openNa, NA, "Na⁺ 통로");
    chan(cx[1], openK, K, "K⁺ 통로");
    ctx.fillStyle = "#8a8f7c"; ctx.beginPath(); ctx.ellipse(cx[2], my, 13, mt + 7, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.ink2; ctx.textAlign = "center"; ctx.fillText("펌프", cx[2], my - mt - 10);
    ctx.fillStyle = C.paper; ctx.font = `9px ${F.mono}`; ctx.fillText("ATP", cx[2], my + 3);
    // 막 양쪽 전하
    const flip = d.V > 0;
    const k = clamp(Math.abs(d.V) / 70, 0.15, 1);
    ctx.font = `600 11px ${F.mono}`;
    ctx.globalAlpha = k;
    for (const px of [x + w * 0.1, x + w * 0.37, x + w * 0.64, x + w * 0.92]) {
      ctx.fillStyle = flip ? K : C.warn; ctx.fillText(flip ? "−" : "+", px, my - mt - 3);
      ctx.fillStyle = flip ? C.warn : K; ctx.fillText(flip ? "+" : "−", px, my + mt + 9);
    }
    ctx.globalAlpha = 1;
    // 흩어진 이온: Na⁺ 밖에 많고, K⁺ 안에 많다
    const scatter = (n, y1, y2, seed, major, minor) => {
      if (y2 - y1 < 4) return;
      for (let i = 0; i < n; i++) {
        const px = x + 14 + ((i * 37 + seed) % (w - 28)), py = y1 + ((i * 17 + seed) % Math.round(y2 - y1));
        ctx.fillStyle = i % 5 === 0 ? minor : major; ctx.beginPath(); ctx.arc(px, py, 2.4, 0, Math.PI * 2); ctx.fill();
      }
    };
    scatter(12, y + 24, my - mt - 24, 0, NA, K);
    scatter(12, my + mt + 24, y + h - 20, 11, K, NA);
    // 통로를 지나는 이온 (확산 방향: Na⁺ 안으로, K⁺ 밖으로)
    const span = (my - y) - 12;
    const flow = (list, px, dir, col) => list.forEach((p) => {
      const py = my - dir * span * 0.8 + dir * p * span * 1.6;
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(px, py, 3.2, 0, Math.PI * 2); ctx.fill();
    });
    flow(parts.na, cx[0], 1, NA);
    flow(parts.k, cx[1], -1, K);
    parts.pump.forEach(([p, kind]) => {
      const dir = kind === "na" ? -1 : 1;
      const py = my - dir * span * 0.5 + dir * p * span;
      ctx.fillStyle = kind === "na" ? NA : K; ctx.globalAlpha = 0.7;
      ctx.beginPath(); ctx.arc(cx[2] + (kind === "na" ? -5 : 5), py, 2.4, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    });
    ctx.restore();
  }

  function stepParts(dt) {
    const d = at(cur);
    const adv = (list, rate, speed) => {
      for (let i = list.length - 1; i >= 0; i--) { list[i] += dt * speed; if (list[i] > 1) list.splice(i, 1); }
      if (Math.random() < rate * dt) list.push(0);
    };
    adv(parts.na, 18 * clamp(d.na, 0, 1) ** 1.2, 1.6);
    adv(parts.k, 14 * clamp(d.k, 0, 1) ** 1.2, 1.6);
    clock += dt;
    for (let i = parts.pump.length - 1; i >= 0; i--) { parts.pump[i][0] += dt * 0.6; if (parts.pump[i][0] > 1) parts.pump.splice(i, 1); }
    if (clock > 1.4) { clock = 0; parts.pump.push([0, "na"], [0.12, "na"], [0.24, "na"], [0.06, "k"], [0.18, "k"]); }
  }

  function update(replay) {
    oAmp.textContent = sAmp.value; oGap.textContent = sGap.value;
    sGap.disabled = !cSec.checked;
    data = sim(+sAmp.value, cSec.checked, +sGap.value, cTtx.checked);
    const pk = Math.max(...data.filter((d) => d.t < (cSec.checked ? 1 + +sGap.value : T)).map((d) => d.V));
    const fired = pk > 0;
    nPeak.textContent = `${pk >= 0 ? "+" : "−"}${Math.abs(pk).toFixed(0)} mV`;
    nFire.textContent = fired ? "일어남" : "안 일어남";
    nFire.className = fired ? "fired good" : "fired bad";
    if (cSec.checked) {
      const pk2 = Math.max(...data.filter((d) => d.t > 1 + +sGap.value).map((d) => d.V));
      nSec.textContent = !fired ? "—" : pk2 > 0 ? "또 일어남" : "안 일어남";
      nSec.className = "sec2" + (fired && pk2 <= 0 ? " bad" : "");
    } else { nSec.textContent = "—"; nSec.className = "sec2"; }
    msg.textContent = cTtx.checked
      ? "Na⁺ 통로가 막혀 Na⁺가 들어오지 못합니다. 자극을 세게 줘도 자극이 준 만큼만 올랐다가 가라앉습니다."
      : !fired ? "막전위가 조금 올랐다가 그냥 돌아옵니다. 역치에 이르지 못한 자극입니다."
      : cSec.checked && nSec.textContent === "안 일어남" ? "두 번째 자극이 너무 빨리 왔습니다. Na⁺ 통로가 아직 다시 열릴 수 없는 불응기입니다."
      : "역치를 넘자 Na⁺ 통로가 한꺼번에 열리고, 막 안쪽이 잠깐 양(+)으로 뒤집힙니다.";
    if (replay) { cur = 0; playing = true; } else if (!playing) cur = T;
    draw();
  }

  [sAmp, sGap].forEach((el) => el.addEventListener("input", () => update(false)));
  [cSec, cTtx].forEach((el) => el.addEventListener("change", () => update(false)));
  btn.addEventListener("click", () => update(true));
  root.querySelectorAll("[data-amp]").forEach((b) => b.addEventListener("click", () => { sAmp.value = b.dataset.amp; update(true); }));

  // 그래프를 끌어 시점 고르기
  const pick = (e) => {
    const r = cv.getBoundingClientRect(), g = layout().g;
    const t = (e.clientX - r.left - g.x) / g.w * T;
    if (t < -0.5 || t > T + 0.5) return;
    playing = false; cur = clamp(t, 0, T); draw();
  };
  let drag = false;
  cv.addEventListener("pointerdown", (e) => { drag = true; pick(e); });
  cv.addEventListener("pointermove", (e) => { if (drag) pick(e); });
  addEventListener("pointerup", () => { drag = false; });

  update(false);
  loop(cv, (dt) => {
    if (playing) { cur += dt * (T / 4.5); if (cur >= T) { cur = T; playing = false; } }
    stepParts(dt);
    draw();
  });
})();
