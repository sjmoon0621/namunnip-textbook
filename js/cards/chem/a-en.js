/* 카드: 전기 음성도 — 두 원자 중 누가 공유 전자쌍을 더 세게 당길까? */
(() => {
  const root = document.getElementById("card-chem-en");
  if (!root) return;
  const { C, F, fit, clamp } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), grid = $(".ptable");
  const dA = $(".v-a"), dB = $(".v-b"), dD = $(".v-d"), dI = $(".v-i"), msg = $(".en-msg");

  // 폴링 전기 음성도 (Allred 1961 개정값), m: 금속
  const ROWS = [
    [["H", 2.20]],
    [["Li", 0.98, 1], ["Be", 1.57, 1], ["B", 2.04], ["C", 2.55], ["N", 3.04], ["O", 3.44], ["F", 3.98]],
    [["Na", 0.93, 1], ["Mg", 1.31, 1], ["Al", 1.61, 1], ["Si", 1.90], ["P", 2.19], ["S", 2.58], ["Cl", 3.16]],
    [["K", 0.82, 1], ["Ca", 1.00, 1], ["Ga", 1.81, 1], ["Ge", 2.01], ["As", 2.18], ["Se", 2.55], ["Br", 2.96]],
    [["Rb", 0.82, 1], ["Sr", 0.95, 1], ["In", 1.78, 1], ["Sn", 1.96, 1], ["Sb", 2.05], ["Te", 2.10], ["I", 2.66]],
  ];
  const EL = {};
  ROWS.forEach((r) => r.forEach(([s, en, m]) => { EL[s] = { s, en, metal: !!m }; }));
  let A = "H", B = "Cl", slot = 0;

  const mix = (t) => { // 전기 음성도 → 칸 색 (옅은 종이색 → 짙은 초록)
    const a = [243, 244, 239], b = [59, 124, 42], k = clamp((t - 0.7) / 3.3, 0, 1);
    return `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * k)).join(",")})`;
  };
  ROWS.forEach((r, ri) => r.forEach(([s, en], ci) => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "el"; b.dataset.s = s;
    b.style.gridRow = ri + 1; b.style.gridColumn = ci + 1;
    b.style.background = mix(en); b.style.color = en > 2.5 ? "#fff" : "var(--ink)";
    b.innerHTML = `<b>${s}</b><span>${en.toFixed(2)}</span>`;
    b.setAttribute("aria-label", `${s}, 전기 음성도 ${en}`);
    b.addEventListener("click", () => { if (slot === 0) A = s; else B = s; slot = 1 - slot; update(); });
    grid.appendChild(b);
  }));

  const EX = [[0, "H–H"], [0.35, "C–H"], [0.84, "N–H"], [1.24, "O–H"], [1.78, "H–F"], [2.23, "Na–Cl"], [3.16, "K–F"]];
  const { ctx, size } = fit(cv, () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const a = EL[A], b = EL[B], small = w < 520;
    const d = Math.abs(a.en - b.en), bothMetal = a.metal && b.metal;
    const ionic = !bothMetal && d >= 1.9 && (a.metal || b.metal);
    // 왼쪽 원자가 덜 당기는 쪽이 되도록 정렬
    const [L, R] = a.en <= b.en ? [a, b] : [b, a];
    const cy = h * 0.4, cx = w / 2, sep = Math.min(w * 0.22, 130) * (ionic ? 1.25 : 1);
    const xL = cx - sep / 2, xR = cx + sep / 2, r = Math.min(34, h * 0.14);
    if (!bothMetal) {
      // 공유 전자쌍의 분포: 더 세게 당기는 쪽으로 치우친다 (모식)
      const f = ionic ? 1 : Math.tanh(d * 0.6);
      const ex = cx + f * sep * 0.5, spread = sep * (0.55 - 0.25 * f) + r * 0.6;
      const g = ctx.createRadialGradient(ex, cy, 2, ex, cy, spread);
      g.addColorStop(0, "rgba(63,111,181,.55)"); g.addColorStop(1, "rgba(63,111,181,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(ex, cy, spread, spread * 0.72, 0, 0, Math.PI * 2); ctx.fill();
      // 전자쌍 두 점
      ctx.fillStyle = "#1f3f73";
      ctx.beginPath(); ctx.arc(ex - 1, cy - 5, 3, 0, Math.PI * 2); ctx.arc(ex - 1, cy + 5, 3, 0, Math.PI * 2); ctx.fill();
    }
    for (const [el, x] of [[L, xL], [R, xR]]) {
      ctx.beginPath(); ctx.arc(x, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1.3; ctx.stroke();
      ctx.fillStyle = C.ink; ctx.font = `600 ${small ? 16 : 20}px ${F.sans}`; ctx.textAlign = "center";
      ctx.fillText(el.s, x, cy + 7);
    }
    ctx.font = `${small ? 13 : 15}px ${F.serif}`; ctx.fillStyle = C.warn;
    if (bothMetal) {
      ctx.fillStyle = C.ink2; ctx.font = `${small ? 11 : 12.5}px ${F.sans}`;
      ctx.fillText("두 원자 모두 금속 — 공유 결합이 아니라 금속 결합을 합니다.", cx, cy + r + 30);
    } else if (ionic) {
      ctx.fillText(L.s + "⁺", xL + r * 0.9, cy - r - 4); ctx.fillText(R.s + "⁻", xR + r * 0.9, cy - r - 4);
      ctx.fillStyle = C.ink2; ctx.font = `${small ? 11 : 12.5}px ${F.sans}`;
      ctx.fillText("전자가 거의 완전히 넘어가 이온이 됩니다.", cx, cy + r + 30);
    } else if (d < 0.05) {
      ctx.fillStyle = C.ink2; ctx.font = `${small ? 11 : 12.5}px ${F.sans}`;
      ctx.fillText("전자쌍이 가운데에 고르게 — 무극성 공유 결합", cx, cy + r + 30);
    } else {
      ctx.fillText("δ+", xL - r * 0.2, cy - r - 6); ctx.fillText("δ−", xR + r * 0.2, cy - r - 6);
      ctx.fillStyle = C.ink2; ctx.font = `${small ? 11 : 12.5}px ${F.sans}`;
      ctx.fillText(`전자쌍이 ${R.s} 쪽으로 치우침 — 극성 공유 결합`, cx, cy + r + 30);
    }

    // ── 아래: 전기 음성도 차이 띠
    const x0 = small ? 16 : 30, x1 = w - (small ? 16 : 30), by = h - 44;
    const X = (v) => x0 + v / 3.3 * (x1 - x0);
    const g2 = ctx.createLinearGradient(x0, 0, x1, 0);
    g2.addColorStop(0, "rgba(63,111,181,.15)"); g2.addColorStop(1, "rgba(181,83,47,.3)");
    ctx.fillStyle = g2; ctx.fillRect(x0, by - 7, x1 - x0, 14);
    ctx.font = `${small ? 9 : 10.5}px ${F.mono}`; ctx.fillStyle = C.ink3;
    EX.forEach(([v, lab], i) => {
      ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X(v), by + 7); ctx.lineTo(X(v), by + 12); ctx.stroke();
      ctx.textAlign = "center"; ctx.fillText(lab, clamp(X(v), x0 + 14, x1 - 14), by + 23 + (i % 2) * 11);
    });
    ctx.textAlign = "left"; ctx.fillText("전기 음성도 차이 0", x0, by - 13);
    ctx.textAlign = "right"; ctx.fillText("3.3", x1, by - 13);
    if (!bothMetal) {
      ctx.beginPath(); ctx.moveTo(X(d), by - 10); ctx.lineTo(X(d) - 6, by - 20); ctx.lineTo(X(d) + 6, by - 20); ctx.closePath();
      ctx.fillStyle = C.ink; ctx.fill();
    }
  }

  function update() {
    const a = EL[A], b = EL[B], d = Math.abs(a.en - b.en);
    grid.querySelectorAll(".el").forEach((x) => { x.classList.toggle("pa", x.dataset.s === A); x.classList.toggle("pb", x.dataset.s === B); });
    dA.textContent = `${A} ${a.en.toFixed(2)}`; dB.textContent = `${B} ${b.en.toFixed(2)}`;
    dD.textContent = d.toFixed(2);
    const both = a.metal && b.metal;
    dI.textContent = both ? "—" : `${Math.round((1 - Math.exp(-d * d / 4)) * 100)}%`;
    msg.textContent = `다음에 누르는 원소가 ${slot === 0 ? "첫째" : "둘째"} 원자가 됩니다.`;
    draw();
  }
  update();
})();
