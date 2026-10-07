/* 카드: X선 사진 한 장으로 DNA가 나선이라는 것을 어떻게 알았을까? — 점 나선의 섬유 회절 무늬 계산 */
(() => {
  const root = document.getElementById("card-fusi-helix");
  if (!root) return;
  const { C, F, fit, clamp } = NM;
  const $ = (s) => root.querySelector(s);
  const sP = $(".p"), sR = $(".r"), sN = $(".n");
  const Q = 91, KMAX = 3.3, TURNS = 6, PHI = 24, XD = 1.6;
  let strand = 0.375, myst = null, mark = null, img = null, timer = 0;

  const par = () => (myst ? myst : { P: +sP.value, R: +sR.value, n: +sN.value, s: strand });

  function atoms(p) {
    const out = [], N = Math.round(p.n * TURNS);
    for (let j = 0; j < N; j++) {
      const z = j * p.P / p.n - TURNS * p.P / 2;
      out.push([z, 2 * Math.PI * z / p.P, 0]);
      if (p.s < 1) { const z2 = z + p.s * p.P; out.push([z2, 2 * Math.PI * z / p.P, 1]); }
    }
    return out;
  }

  /* 나선은 높이 P마다 반복되므로 무늬는 kz = l/P인 층선 위에만 생긴다.
     층선마다 kx 방향 세기 |F|²를 한 바퀴의 원자로 계산하고 (섬유 축 둘레 평균), 층선에 약간의 두께를 주어 그린다 */
  function compute() {
    const p = par(), at = atoms(p).filter((a) => a[0] >= -TURNS * p.P / 2 - 1e-9 && a[0] < -TURNS * p.P / 2 + p.P - 1e-9);
    const M = at.length, kx = (i) => i / (Q - 1) * KMAX, L = Math.floor(KMAX * p.P);
    const lines = [];
    for (let l = 0; l <= L; l++) {
      const kz = l / p.P, row = new Float32Array(Q);
      for (let ix = 0; ix < Q; ix++) {
        let sum = 0;
        for (let f = 0; f < PHI; f++) {
          const ph = f / PHI * Math.PI * 2; let re = 0, im = 0;
          for (const [z, th] of at) { const a = 2 * Math.PI * (kx(ix) * p.R * Math.cos(th + ph) + kz * z); re += Math.cos(a); im += Math.sin(a); }
          sum += re * re + im * im;
        }
        const kk = Math.hypot(kx(ix), kz);
        row[ix] = kk < 0.2 ? 0 : sum / PHI / M * Math.exp(-XD * kx(ix) * kx(ix) - 0.08 * kz * kz);
      }
      lines.push([kz, row]);
    }
    const all = lines.flatMap(([, r]) => [...r]).sort((a, b) => a - b);
    const ref = all[Math.floor(all.length * 0.99)] || 1;
    const S = 2 * Q - 1, data = new ImageData(S, S), wpx = 1.3, px1 = (S - 1) / 2 / KMAX;
    const buf = new Float32Array(S * S);
    for (const [kz, row] of lines) for (const sz of kz ? [1, -1] : [1]) {
      const yc = (S - 1) / 2 - sz * kz * px1;
      for (let y = Math.max(0, Math.floor(yc - 4)); y <= Math.min(S - 1, Math.ceil(yc + 4)); y++) {
        const gy = Math.exp(-0.5 * ((y - yc) / wpx) ** 2);
        for (let ix = 0; ix < Q; ix++) { const v = row[ix] * gy; buf[y * S + Q - 1 + ix] += v; if (ix) buf[y * S + Q - 1 - ix] += v; }
      }
    }
    for (let i = 0; i < S * S; i++) {
      const v = Math.pow(clamp(buf[i] / ref, 0, 1), 0.85), o = i * 4;
      data.data[o] = 251 - 216 * v; data.data[o + 1] = 251 - 216 * v; data.data[o + 2] = 248 - 210 * v; data.data[o + 3] = 255;
    }
    const cv = document.createElement("canvas"); cv.width = S; cv.height = S;
    cv.getContext("2d").putImageData(data, 0, 0);
    img = cv;
    readouts(p);
    draw();
  }
  const later = () => { clearTimeout(timer); timer = setTimeout(compute, 30); };

  function readouts(p) {
    const hide = !!myst;
    $(".d-lay").textContent = hide ? "직접 재기" : (1 / p.P).toFixed(3) + " nm⁻¹";
    const mer = p.n / p.P;
    $(".d-mer").textContent = hide ? "직접 재기" : mer.toFixed(2) + " nm⁻¹" + (mer > KMAX ? " (범위 밖)" : "");
    let miss = "없음";
    if (p.s === 0.5) miss = "홀수 층선";
    else if (p.s === 0.375) miss = "4, 12, …번째";
    $(".d-miss").textContent = hide ? "직접 찾기" : miss;
  }

  const cvs = $("canvas");
  const view = fit(cvs, () => draw());
  const geo = () => {
    const { w, h } = view.size, side = Math.min(h - 26, w * 0.66), px = w - side - 4, py = 6;
    return { side, px, py, lw: px - 14 };
  };

  function draw() {
    const { ctx } = view, { w, h } = view.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const p = par(), g = geo();
    /* 왼쪽: 나선 (옆모습, 두 바퀴 남짓) */
    const span = 2.4 * 3.4, sc = (h - 34) / span, cx = g.lw / 2 + 4, cy = h / 2 - 6;
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx, cy - span * sc / 2); ctx.lineTo(cx, cy + span * sc / 2); ctx.stroke();
    const at = atoms(p).filter((a) => Math.abs(a[0]) <= span / 2);
    const drawStrand = (sel, col) => {
      ctx.fillStyle = col;
      at.forEach((a) => { if (sel(a[2])) { const x = cx + p.R * Math.cos(a[1]) * sc, y = cy - a[0] * sc, dep = Math.sin(a[1]); ctx.globalAlpha = 0.45 + 0.55 * (dep + 1) / 2; ctx.beginPath(); ctx.arc(x, y, 2.6, 0, Math.PI * 2); ctx.fill(); } });
      ctx.globalAlpha = 1;
    };
    if (p.s < 1) { drawStrand((q) => q === 0, C.forest); drawStrand((q) => q === 1, C.warn); }
    else drawStrand(() => true, C.forest);
    ctx.font = `11px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "center";
    ctx.fillText(myst ? "구조를 모름" : `P ${p.P.toFixed(1)} · R ${p.R.toFixed(2)} nm`, cx, h - 6);
    /* 오른쪽: 회절 무늬 */
    ctx.fillStyle = C.card; ctx.fillRect(g.px, g.py, g.side, g.side);
    if (img) { ctx.imageSmoothingEnabled = true; ctx.drawImage(img, g.px, g.py, g.side, g.side); }
    ctx.strokeStyle = C.ink3; ctx.strokeRect(g.px + 0.5, g.py + 0.5, g.side - 1, g.side - 1);
    ctx.fillStyle = C.ink3; ctx.textAlign = "left";
    ctx.fillText("kz ↑   kx →", g.px, g.py + g.side + 14);
    ctx.textAlign = "right"; ctx.fillText(`±${KMAX} nm⁻¹`, g.px + g.side, g.py + g.side + 14);
    if (mark !== null) {
      const y = g.py + g.side / 2 - mark / KMAX * g.side / 2;
      ctx.strokeStyle = C.warn; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(g.px, y); ctx.lineTo(g.px + g.side, y); ctx.stroke(); ctx.setLineDash([]);
    }
  }

  cvs.addEventListener("click", (e) => {
    const r = cvs.getBoundingClientRect(), g = geo(), y = e.clientY - r.top, x = e.clientX - r.left;
    if (x < g.px || y < g.py || y > g.py + g.side) return;
    mark = Math.abs((g.py + g.side / 2 - y) / (g.side / 2) * KMAX);
    let t = `k<sub>z</sub> = ${mark.toFixed(2)} nm⁻¹ → 1/k<sub>z</sub> = ${mark > 0.05 ? (1 / mark).toFixed(2) : "—"} nm`;
    if (!myst) t += ` · 층선 번호 l ≈ ${(mark * par().P).toFixed(1)}`;
    $(".hx-note").innerHTML = t;
    draw();
  });

  const upd = () => {
    $(".p-out").textContent = (+sP.value).toFixed(1); $(".r-out").textContent = (+sR.value).toFixed(2); $(".n-out").textContent = sN.value;
    later();
  };
  [sP, sR, sN].forEach((el) => el.addEventListener("input", () => { if (myst) exitMyst(); upd(); }));
  const press = (b) => root.querySelectorAll(".strand .chip").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
  function exitMyst() { myst = null; $(".hx-ans").hidden = true; $(".reveal-out").textContent = ""; press(root.querySelector(`[data-s="${strand}"]`)); }
  $(".strand").addEventListener("click", (e) => {
    const b = e.target.closest(".chip"); if (!b) return;
    mark = null; $(".hx-note").textContent = "무늬를 누르면 그 높이의 파수 kz를 읽습니다.";
    if (b.classList.contains("myst")) {
      const P = [2.6, 2.9, 3.8, 4.2, 4.6][Math.floor(Math.random() * 5)], n = 7 + Math.floor(Math.random() * 5);
      myst = { P, R: 0.7 + Math.round(Math.random() * 6) * 0.1, n, s: [1, 0.5, 0.375][Math.floor(Math.random() * 3)] };
      $(".hx-ans").hidden = false; $(".reveal-out").textContent = ""; press(b);
    } else { strand = +b.dataset.s; myst = null; $(".hx-ans").hidden = true; press(b); }
    later();
  });
  $(".reveal").addEventListener("click", () => {
    if (!myst) return;
    const s = { 1: "한 가닥", 0.5: "두 가닥 1/2 어긋남", 0.375: "두 가닥 3/8 어긋남" }[myst.s];
    $(".reveal-out").textContent = `P = ${myst.P} nm, n = ${myst.n}, R = ${myst.R.toFixed(1)} nm, ${s}`;
  });
  upd();
})();
