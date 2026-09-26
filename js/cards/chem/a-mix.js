/* 카드: 기름과 물은 왜 섞이지 않을까? — 격자 위 분자 자리 바꾸기 시뮬레이션 (인력 크기는 상대값, 모식) */
(() => {
  const root = document.getElementById("card-chem-mix");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const sX = $(".exx"), oX = $(".exx-out"), sWX = $(".ewx"), oWX = $(".ewx-out"), sT = $(".kt"), oT = $(".kt-out");
  const dMix = $(".v-mix"), dD = $(".v-d"), dJ = $(".v-j"), msg = $(".mix-msg");

  const NX = 40, NY = 22, N = NX * NY, EWW = 1.0;     // 물–물 인력 (수소 결합) = 1
  const g = new Uint8Array(N);                        // 0 물, 1 상대 분자
  let partner = "hexane";
  const P = { hexane: { n: "헥세인", xx: 0.3, wx: 0.3 }, ethanol: { n: "에탄올", xx: 0.7, wx: 0.95 } };

  function shake() { for (let i = 0; i < N; i++) g[i] = i < N / 2 ? 0 : 1; for (let i = N - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [g[i], g[j]] = [g[j], g[i]]; } }
  const nb = (i) => { const x = i % NX, y = (i / NX) | 0; return [((x + 1) % NX) + y * NX, ((x + NX - 1) % NX) + y * NX, x + ((y + 1) % NY) * NX, x + ((y + NY - 1) % NY) * NX]; };
  const NB = [...Array(N)].map((_, i) => nb(i));
  const eps = (a, b) => (a === 0 && b === 0 ? EWW : a === 1 && b === 1 ? +sX.value : +sWX.value);
  const siteE = (i, t) => { let e = 0; for (const j of NB[i]) e -= eps(t, g[j]); return e; };

  function sweep(n) {
    const kT = +sT.value;
    for (let k = 0; k < n; k++) {
      const i = (Math.random() * N) | 0;
      const j = Math.random() < 0.5 ? NB[i][(Math.random() * 4) | 0] : (Math.random() * N) | 0;
      const a = g[i], b = g[j]; if (a === b) continue;
      const e0 = siteE(i, a) + siteE(j, b);
      g[i] = b; g[j] = a;
      const e1 = siteE(i, b) + siteE(j, a);
      if (e1 > e0 && Math.random() > Math.exp(-(e1 - e0) / kT)) { g[i] = a; g[j] = b; }
    }
  }
  const mixing = () => { // 서로 다른 이웃 쌍의 비율 ÷ 완전히 무작위일 때의 비율
    let u = 0; for (let i = 0; i < N; i++) { const [r, , d] = NB[i]; if (g[i] !== g[r]) u++; if (g[i] !== g[d]) u++; }
    return u / (2 * N) / 0.5;
  };

  const { ctx, size } = fit(cv, () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const c = Math.min((w - 20) / NX, (h - 30) / NY), ox = (w - c * NX) / 2, oy = 22;
    for (let i = 0; i < N; i++) {
      const x = ox + (i % NX) * c + c / 2, y = oy + ((i / NX) | 0) * c + c / 2;
      ctx.beginPath(); ctx.arc(x, y, c * 0.42, 0, Math.PI * 2);
      ctx.fillStyle = g[i] ? C.amber : "#3f6fb5"; ctx.fill();
    }
    ctx.font = `${w < 520 ? 10 : 11.5}px ${F.mono}`; ctx.textAlign = "left";
    ctx.fillStyle = "#3f6fb5"; ctx.fillText("● 물", ox, 14);
    ctx.fillStyle = "#b07a12"; ctx.fillText(`● ${P[partner] ? P[partner].n : "상대 분자"}`, ox + 56, 14);
    ctx.fillStyle = C.ink3; ctx.textAlign = "right"; ctx.fillText("격자 모형 (모식) · 가장자리는 반대편과 이어짐", ox + c * NX, 14);
  }

  function info() {
    const xx = +sX.value, wx = +sWX.value, kT = +sT.value;
    oX.textContent = xx.toFixed(2); oWX.textContent = wx.toFixed(2); oT.textContent = kT.toFixed(2);
    const d = wx - (EWW + xx) / 2;
    dD.textContent = `${d >= 0 ? "+" : ""}${d.toFixed(2)}`;
    dD.className = d < 0 ? "v-d bad" : "v-d good";
    dJ.textContent = d < 0 ? "섞이면 손해" : "섞여도 손해 없음";
    const m = P[partner];
    root.querySelectorAll("[data-p]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.p === partner ? "true" : "false"));
    msg.textContent = !m ? "직접 고른 인력입니다. 물–상대 인력이 두 같은 분자끼리 인력의 평균보다 작으면 층이 나뉩니다."
      : partner === "hexane" ? "헥세인은 무극성이라 물과 수소 결합을 하지 못합니다. 물–헥세인 인력이 0은 아니지만 물–물 인력보다 훨씬 약합니다."
      : "에탄올의 –OH는 물과 수소 결합을 합니다. 물–에탄올 인력이 물–물 인력과 비슷해서 섞여도 잃는 것이 없습니다.";
  }
  function numbers() { const m = mixing(); dMix.textContent = `${Math.min(100, Math.round(m * 100))}%`; }

  root.querySelectorAll("[data-p]").forEach((b) => b.addEventListener("click", () => {
    partner = b.dataset.p; sX.value = P[partner].xx; sWX.value = P[partner].wx; info();
  }));
  [sX, sWX].forEach((el) => el.addEventListener("input", () => { partner = "custom"; info(); }));
  sT.addEventListener("input", info);
  $(".shake").addEventListener("click", () => { shake(); numbers(); draw(); });

  shake(); sweep(N * 30); info(); numbers();
  loop(cv, () => { sweep(NM.reduce ? N * 20 : N * 3); numbers(); draw(); });
})();
