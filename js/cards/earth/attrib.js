/* 카드: 지금의 온난화가 자연 때문인지 사람 때문인지 어떻게 가려낼까? — GISTEMP v4 관측 + 유효 복사 강제력(AR6 방법, 2024년까지), 2상자 에너지 균형 모형 */
(() => {
  const root = document.getElementById("card-earth-attrib");
  if (!root || !window.NMAttrib) return;
  const { C, F, fit, axes } = NM;
  const D = NMAttrib, $ = (s) => root.querySelector(s);
  const NF = D.ghg.length, Y1 = D.fY0 + NF - 1;
  const F2X = 3.93;   // CO₂ 2배의 유효 복사 강제력 (AR6, W/m²)
  // 2상자 모형: 혼합층 C dT/dt = F − λT − γ(T − Td), 깊은 바다 Cd dTd/dt = γ(T − Td). 1년 간격
  const CM = 8, CD = 100, GAM = 0.7;
  // 화산 강제력은 AR6처럼 장기 평균(여기서는 1750–2024 평균)을 0으로 놓고, 효율 0.6을 곱한다 (단순 모형은 짧고 강한 화산 강제력에 지나치게 반응하는 경향이 있어서 둔 가정)
  const KV = 0.6, VM = D.vol.reduce((s, v) => s + v, 0) / NF, VOL = D.vol.map((v) => KV * (v - VM));
  const COL = { nat: "#3f8f5a", ant: "#c4462f", all: "#2f62a8", obs: C.ink2 };
  const NAME = { nat: "자연 요인만", ant: "인위 요인만", all: "모두" };
  let mode = "all";

  function run(lam, as, nat, ant) {
    let T = 0, Td = 0; const out = new Array(NF);
    for (let i = 0; i < NF; i++) {
      const F0 = nat * (D.sol[i] + VOL[i]) + ant * (D.ghg[i] + as * D.aer[i] + D.oth[i]);
      const dT = (F0 - lam * T - GAM * (T - Td)) / CM;
      Td += GAM * (T - Td) / CD; T += dT;
      out[i] = T;
    }
    return out;
  }
  // 1880–1900 평균을 0으로 맞춘 값 (관측과 모형 모두)
  // 모형은 1750년부터 돌려(예열) 1850–1900 평균을 0으로, 관측(1880년부터)은 1880–1900 평균을 0으로 맞춘다
  const base = (arr, y0, a = 1850) => { let s = 0; for (let y = a; y <= 1900; y++) s += arr[y - y0]; return s / (1901 - a); };
  const obsB = base(D.t, D.tY0, 1880), obs = (y) => D.t[y - D.tY0] - obsB;
  const YE = Math.min(Y1, D.tY0 + D.t.length - 1);
  function score(m) {
    const mb = base(m, D.fY0); let se = 0, st = 0, mo = 0, n = 0;
    for (let y = 1880; y <= YE; y++) { mo += obs(y); n++; }
    mo /= n;
    for (let y = 1880; y <= YE; y++) { const d = obs(y) - (m[y - D.fY0] - mb); se += d * d; st += (obs(y) - mo) ** 2; }
    return { rms: Math.sqrt(se / n), r2: 1 - se / st };
  }
  const dec = (f, a, b) => { let s = 0; for (let y = a; y <= b; y++) s += f(y); return s / (b - a + 1); };

  const a = fit($(".at-ts"), () => draw()), b = fit($(".at-f"), () => drawF());
  const P = () => ({ lam: +$(".lam").value, as: +$(".aer").value });
  let M = {};

  function compute() {
    const { lam, as } = P();
    M = { nat: run(lam, as, 1, 0), ant: run(lam, as, 0, 1), all: run(lam, as, 1, 1) };
    Object.keys(M).forEach((k) => { const mb = base(M[k], D.fY0); M[k] = M[k].map((v) => v - mb); });
  }

  function draw() {
    const { ctx } = a, { w, h } = a.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const box = { x0: 34, y0: 22, w: w - 44, h: h - 50 }, ylo = -0.75, yhi = 1.6;
    const X = (y) => box.x0 + (y - 1880) / (Y1 + 1 - 1880) * box.w, Y = (v) => box.y0 + (yhi - v) / (yhi - ylo) * box.h;
    axes(ctx, { ...box, X, Y, xt: [1880, 1920, 1960, 2000].map((y) => [y, String(y)]), yt: [-0.5, 0, 0.5, 1, 1.5].map((v) => [v, (v > 0 ? "+" : "") + v]), ylabel: "기온 편차 (°C, 관측 1880–1900 · 모형 1850–1900 평균 대비)" });
    // 큰 화산 분화
    ctx.font = `9.5px ${F.sans}`; ctx.textAlign = "center";
    [[1883, "크라카타우"], [1963, "아궁"], [1982, "엘치촌"], [1991, "피나투보"]].forEach(([y, t]) => {
      const x = X(y + 0.5); ctx.strokeStyle = "rgba(63,143,90,.5)"; ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(x, box.y0 + box.h - 14); ctx.lineTo(x, Y(1.25)); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = COL.nat; ctx.fillText(t, Math.max(box.x0 + 28, Math.min(x, box.x0 + box.w - 22)), box.y0 + box.h - 4);
    });
    // 관측
    ctx.fillStyle = COL.obs;
    for (let y = 1880; y <= D.tY0 + D.t.length - 1; y++) { ctx.beginPath(); ctx.arc(X(y + 0.5), Y(obs(y)), 1.7, 0, Math.PI * 2); ctx.fill(); }
    ctx.strokeStyle = "rgba(93,93,97,.45)"; ctx.lineWidth = 1; ctx.beginPath();
    for (let y = 1880; y <= D.tY0 + D.t.length - 1; y++) { const p = [X(y + 0.5), Y(obs(y))]; y === 1880 ? ctx.moveTo(...p) : ctx.lineTo(...p); } ctx.stroke();
    // 모형
    ["nat", "ant", "all"].forEach((k) => {
      const on = k === mode; ctx.strokeStyle = COL[k]; ctx.lineWidth = on ? 2.6 : 1.1; ctx.globalAlpha = on ? 1 : 0.35; ctx.setLineDash(on ? [] : [4, 3]);
      ctx.beginPath(); for (let i = 0; i < NF; i++) { const y = D.fY0 + i; if (y < 1880) continue; const p = [X(y + 0.5), Y(M[k][i])]; y === 1880 ? ctx.moveTo(...p) : ctx.lineTo(...p); } ctx.stroke();
    });
    ctx.globalAlpha = 1; ctx.setLineDash([]);
    // 범례
    const L = [["obs", "관측 (GISTEMP)"], ["nat", "모형: 자연만"], ["ant", "모형: 인위만"], ["all", "모형: 모두"]];
    ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left";
    L.forEach(([k, t], i) => {
      const x = box.x0 + 8, y = box.y0 + 12 + i * 14;
      ctx.fillStyle = COL[k]; ctx.globalAlpha = k === "obs" || k === mode ? 1 : 0.5;
      if (k === "obs") { ctx.beginPath(); ctx.arc(x + 7, y - 3, 2.4, 0, Math.PI * 2); ctx.fill(); } else ctx.fillRect(x, y - 4, 14, k === mode ? 3 : 1.5);
      ctx.fillStyle = C.ink2; ctx.fillText(t, x + 20, y); ctx.globalAlpha = 1;
    });
  }

  function drawF() {
    const { ctx } = b, { w, h } = b.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const { as } = P();
    const box = { x0: 34, y0: 22, w: w - 150, h: h - 50 }, ylo = -2.5, yhi = 4;
    const X = (y) => box.x0 + (y - 1850) / (Y1 + 1 - 1850) * box.w, Y = (v) => box.y0 + (yhi - v) / (yhi - ylo) * box.h;
    axes(ctx, { ...box, X, Y, xt: [1850, 1900, 1950, 2000].map((y) => [y, String(y)]), yt: [-2, -1, 0, 1, 2, 3, 4].map((v) => [v, String(v)]), ylabel: "유효 복사 강제력 (W/m², 화산은 장기 평균 대비)" });
    const nat = mode !== "ant", ant = mode !== "nat";
    const S = [
      ["온실 기체", "#c4462f", (i) => D.ghg[i], ant],
      [`에어로졸 ×${as.toFixed(1)}`, "#7a5aa8", (i) => as * D.aer[i], ant],
      ["기타 인위", "#9a8f7a", (i) => D.oth[i], ant],
      ["태양", "#d0a020", (i) => D.sol[i], nat],
      [`화산 ×${KV}`, "#3f8f5a", (i) => VOL[i], nat],
      ["합계", C.ink, (i) => (ant ? D.ghg[i] + as * D.aer[i] + D.oth[i] : 0) + (nat ? D.sol[i] + VOL[i] : 0), true],
    ];
    ctx.save(); ctx.beginPath(); ctx.rect(box.x0, box.y0, box.w, box.h); ctx.clip();
    S.forEach(([, c, f, on], j) => {
      ctx.strokeStyle = c; ctx.lineWidth = j === 5 ? 2.2 : 1.3; ctx.globalAlpha = on ? 1 : 0.15;
      ctx.beginPath(); for (let i = 0; i < NF; i++) { const p = [X(D.fY0 + i + 0.5), Y(f(i))]; i ? ctx.lineTo(...p) : ctx.moveTo(...p); } ctx.stroke();
    });
    ctx.restore(); ctx.globalAlpha = 1;
    ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left";
    S.forEach(([t, c, f, on], j) => {
      const y = box.y0 + 10 + j * 16, x = box.x0 + box.w + 8;
      ctx.globalAlpha = on ? 1 : 0.35; ctx.fillStyle = c; ctx.fillRect(x, y - 4, 12, j === 5 ? 3 : 2);
      ctx.fillStyle = C.ink2; ctx.fillText(t, x + 16, y);
      ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "right"; ctx.fillText(on ? f(NF - 1).toFixed(2) : "—", w - 2, y); ctx.textAlign = "left"; ctx.font = `10.5px ${F.sans}`;
    });
    ctx.globalAlpha = 1;
  }

  function update() {
    const { lam, as } = P();
    $(".l-out").textContent = lam.toFixed(2); $(".a-out").textContent = as.toFixed(1);
    compute(); draw(); drawF();
    const s = score(M[mode]);
    $(".n-e").textContent = `${(F2X / lam).toFixed(1)} °C`;
    $(".n-r").textContent = `${s.rms.toFixed(2)} °C`;
    $(".n-q").textContent = s.r2.toFixed(2);
    $(".n-r").className = "n-r " + (s.rms < 0.16 ? "good" : s.rms > 0.25 ? "bad" : "");
    const mAnt = dec((y) => M.ant[y - D.fY0], 2011, 2020), mNat = dec((y) => M.nat[y - D.fY0], 2011, 2020), oD = dec(obs, 2011, 2020);
    $(".n-a").textContent = `${mAnt >= 0 ? "+" : ""}${mAnt.toFixed(2)} / ${mNat >= 0 ? "+" : ""}${mNat.toFixed(2)}`;
    const mi = (y) => M[mode][y - D.fY0], pin = (mi(1992) + mi(1993) - mi(1990) - mi(1991)) / 2, pinO = (obs(1992) + obs(1993) - obs(1990) - obs(1991)) / 2;
    const v = $(".verdict");
    const msg = mode === "nat"
      ? `자연 요인만으로는 2011–2020년 관측(+${oD.toFixed(2)} °C)을 설명하지 못합니다(모형 ${mNat >= 0 ? "+" : ""}${mNat.toFixed(2)} °C). 자연 강제력에는 1950년 뒤 꾸준히 늘어나는 추세가 없어서 λ를 어떻게 바꿔도 따라가지 못합니다.`
      : mode === "ant"
        ? `인위 요인만 넣으면 긴 추세는 따라가지만, 피나투보 직후 1992–93년의 하강(1990–91년 대비 관측 ${pinO.toFixed(2)} °C)이 모형에서는 ${pin >= 0 ? "+" : ""}${pin.toFixed(2)} °C로 나타나지 않습니다.`
        : `모두 넣으면 추세와 피나투보 직후 1992–93년의 하강(1990–91년 대비 관측 ${pinO.toFixed(2)}, 모형 ${pin.toFixed(2)} °C)을 함께 보여 줍니다. 관측의 하강이 더 큰 것은 내부 변동이 겹친 탓도 있습니다. 2011–2020년 관측 +${oD.toFixed(2)} °C 가운데 모형의 인위 몫은 ${mAnt >= 0 ? "+" : ""}${mAnt.toFixed(2)} °C입니다.`;
    v.className = "verdict small " + (mode === "nat" ? "bad" : s.rms < 0.16 ? "good" : "");
    v.textContent = msg;
  }

  $(".modes").addEventListener("click", (e) => {
    const bt = e.target.closest("[data-m]"); if (!bt) return;
    mode = bt.dataset.m; root.querySelectorAll(".modes [data-m]").forEach((x) => x.setAttribute("aria-pressed", String(x === bt))); update();
  });
  root.querySelectorAll(".lam, .aer").forEach((el) => el.addEventListener("input", update));
  const set = (lam, as) => { $(".lam").value = lam; $(".aer").value = as; update(); };
  $(".ipcc").addEventListener("click", () => set((F2X / 3).toFixed(2), 1.1));
  $(".best").addEventListener("click", () => {
    const k = mode === "nat" ? [1, 0] : mode === "ant" ? [0, 1] : [1, 1];
    let best = { rms: 1e9 };
    for (let lam = 0.6; lam <= 2.5001; lam += 0.05) for (let as = 0; as <= 2.0001; as += 0.1) {
      const m = run(lam, as, ...k), s = score(m);
      if (s.rms < best.rms) best = { rms: s.rms, lam, as };
    }
    set(best.lam.toFixed(2), best.as.toFixed(1));
  });
  update();
  if (/[?&]demo\b/.test(location.search)) $(".ipcc").click();
})();
