/* 카드: 지방산 사슬의 시스–트랜스 이성질체와 막의 유동성 (사슬 모양은 모식, 녹는점은 실측) */
(() => {
  const root = document.getElementById("card-adbio-fatty");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sT = $(".t"), oT = $(".t-out"), nMp = $(".n-mp"), nSt = $(".n-st"), nW = $(".n-w");
  /* db: 이중 결합 [Ci–Ci+1의 i, 시스 여부], mp: 녹는점 °C */
  const FA = {
    st: { name: "스테아르산", db: [], mp: 69.3 },
    el: { name: "엘라이드산", db: [[9, false]], mp: 44 },
    ol: { name: "올레산", db: [[9, true]], mp: 13 },
    li: { name: "리놀레산", db: [[9, true], [12, true]], mp: -5 },
  };
  let fa = "ol", t = 0;
  const ZIG = 34 * Math.PI / 180, KINK = 30 * Math.PI / 180;

  /* 탄소 18개의 2차원 좌표 (결합 길이 1) */
  function chain(key) {
    const dbs = FA[key].db;
    const pts = [[0, 0]];
    let base = Math.PI / 2, sgn = 1;
    for (let i = 1; i < 18; i++) {
      const d = dbs.find((q) => q[0] === i);
      let a = base + sgn * ZIG;
      if (d && d[1]) {
        /* 시스: 이중 결합 양옆 사슬이 같은 쪽 → 사슬 축이 꺾임 */
        base += KINK; a = base + sgn * ZIG;
      }
      const [x, y] = pts[pts.length - 1];
      pts.push([x + Math.cos(a), y + Math.sin(a)]);
      sgn = -sgn;
    }
    return pts;
  }
  const widthOf = (p) => Math.max(...p.map((q) => q[0])) - Math.min(...p.map((q) => q[0]));
  const W0 = widthOf(chain("st"));

  const { ctx, size } = fit(cv, () => draw());
  function txt(s, x, y, col, font, al) { ctx.fillStyle = col; ctx.font = font; ctx.textAlign = al || "center"; ctx.fillText(s, x, y); }

  function drawChain(p, ox, oy, b, jig, seed, detail) {
    const dbs = FA[fa].db;
    const P = p.map(([x, y], i) => {
      if (!jig) return [ox + x * b, oy + y * b];
      const ph = seed * 1.7 + i * 0.9;
      return [ox + x * b + jig * Math.sin(t * 5 + ph) * (i / 17 + 0.2), oy + y * b + jig * 0.4 * Math.cos(t * 4 + ph * 1.3)];
    });
    for (let i = 0; i < 17; i++) {
      const d = dbs.find((q) => q[0] === i + 1);
      const [x1, y1] = P[i], [x2, y2] = P[i + 1];
      ctx.strokeStyle = d ? (d[1] ? C.forest : C.warn) : C.ink;
      ctx.lineWidth = detail ? 2 : 1.4; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      if (d) {
        const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy), nx = -dy / L * (detail ? 4.5 : 3), ny = dx / L * (detail ? 4.5 : 3);
        ctx.beginPath(); ctx.moveTo(x1 + nx + dx * 0.15, y1 + ny + dy * 0.15); ctx.lineTo(x2 + nx - dx * 0.15, y2 + ny - dy * 0.15); ctx.stroke();
        if (detail) {
          /* 이중 결합 탄소의 H: 시스는 같은 쪽, 트랜스는 반대쪽 */
          const hs = d[1] ? [1, 1] : [1, -1];
          [[x1, y1, hs[0]], [x2, y2, hs[1]]].forEach(([x, y, s]) => {
            const hx = x - nx * 3.2 * s, hy = y - ny * 3.2 * s;
            ctx.strokeStyle = C.ink3; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(x - nx * 0.6 * s, y - ny * 0.6 * s); ctx.lineTo(hx, hy); ctx.stroke();
            txt("H", hx - nx * 1.1 * s, hy - ny * 1.1 * s + 4, d[1] ? C.forest : C.warn, `600 11px ${F.mono}`);
          });
        }
      }
    }
    return P;
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const T = +sT.value, liquid = T > FA[fa].mp;
    const p = chain(fa);
    /* 왼쪽: 사슬 하나 */
    const lw = w * 0.36;
    txt("사슬 하나", lw / 2, 18, C.ink2, `600 12px ${F.sans}`);
    const b = Math.min((h - 70) / 15, 19);
    const xs = p.map((q) => q[0]), mid = (Math.min(...xs) + Math.max(...xs)) / 2;
    const P = drawChain(p, lw / 2 - mid * b, 50, b, 0, 0, true);
    txt("HOOC", P[0][0], P[0][1] - 9, C.apple, `600 12px ${F.mono}`);
    txt("CH₃", P[17][0], P[17][1] + 16, C.ink2, `600 11px ${F.mono}`);
    const dbs = FA[fa].db;
    txt(dbs.length === 0 ? "이중 결합 없음 (포화)" : dbs[0][1] ? "시스: H가 같은 쪽 → 꺾임" : "트랜스: H가 반대쪽 → 곧음", lw / 2, h - 8, dbs.length === 0 ? C.ink2 : dbs[0][1] ? C.forest : C.warn, `11px ${F.sans}`);
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(lw, 10); ctx.lineTo(lw, h - 24); ctx.stroke();
    /* 오른쪽: 여러 사슬이 나란히 */
    const rx0 = lw + 14, rw = w - rx0 - 8;
    txt("막의 한쪽 층처럼 나란히", rx0 + rw / 2, 18, C.ink2, `600 12px ${F.sans}`);
    const b2 = Math.min((h - 80) / 15, 13);
    const wid = widthOf(p), gap = 0.55;
    const step = (Math.max(wid, W0) + gap) * b2;
    const n = Math.max(3, Math.min(8, Math.floor(rw / step)));
    const used = n * step, start = rx0 + (rw - used) / 2;
    ctx.fillStyle = "rgba(212,73,58,.12)"; ctx.fillRect(rx0, 34, rw, 16);
    txt("머리 (친수성)", rx0 + rw / 2, 46, C.apple, `10.5px ${F.sans}`);
    for (let k = 0; k < n; k++) {
      const ox = start + k * step + (step - wid * b2) / 2 - Math.min(...xs) * b2;
      drawChain(p, ox, 58, b2, liquid ? b2 * 0.9 : 0, k, false);
    }
    txt(liquid ? "녹는점보다 높음: 사슬이 흔들리며 미끄러짐 (유동적)" : "녹는점보다 낮음: 사슬이 규칙적으로 쌓임 (굳음)", rx0 + rw / 2, h - 8, liquid ? C.forest : "#3f6fa3", `11px ${F.sans}`);
  }

  function update() {
    root.querySelectorAll("[data-a]").forEach((q) => q.setAttribute("aria-pressed", String(q.dataset.a === fa)));
    const T = +sT.value; oT.textContent = String(T).replace("-", "−");
    const mp = FA[fa].mp;
    nMp.textContent = `${String(mp).replace("-", "−")} °C`;
    const liquid = T > mp;
    nSt.textContent = liquid ? "액체 (유동적)" : "고체 (굳음)";
    nSt.className = "n-st " + (liquid ? "good" : "");
    nW.textContent = `약 ${FA[fa].db.filter((q) => q[1]).length * 30}°`;
    draw();
  }
  root.querySelectorAll("[data-a]").forEach((q) => q.addEventListener("click", () => { fa = q.dataset.a; update(); }));
  sT.addEventListener("input", update);
  loop(cv, (dt) => {
    if (+sT.value > FA[fa].mp && !NM.reduce) { t += dt; draw(); }
  });
  update();
})();
