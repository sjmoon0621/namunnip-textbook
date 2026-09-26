/* 카드: 은하는 모양으로 어떻게 나눌까? — 허블 분류 직접 해 보기 (은하 그림은 코드로 만든 모식) */
(() => {
  const root = document.getElementById("card-earth-hubble");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), msg = $(".hb-msg"), nScore = $(".score"), nType = $(".type");
  const TYPES = [
    { k: "E", sub: "E0", n: 0 }, { k: "E", sub: "E3", n: 3 }, { k: "E", sub: "E6", n: 6 },
    { k: "S0", sub: "S0" }, { k: "S", sub: "Sa", bulge: 0.42, pitch: 9 }, { k: "S", sub: "Sb", bulge: 0.28, pitch: 15 }, { k: "S", sub: "Sc", bulge: 0.14, pitch: 24 },
    { k: "SB", sub: "SBa", bulge: 0.38, pitch: 10 }, { k: "SB", sub: "SBb", bulge: 0.26, pitch: 16 }, { k: "SB", sub: "SBc", bulge: 0.14, pitch: 24 }, { k: "Irr", sub: "Irr" },
  ];
  const NAME = { E: "타원 은하", S0: "렌즈형 은하", S: "나선 은하", SB: "막대 나선 은하", Irr: "불규칙 은하" };
  const FEAT = {
    E: "나선팔이 없고 매끈한 타원 모양입니다. 납작한 정도에 따라 E0(둥긂)부터 E7까지 나눕니다.",
    S0: "가운데 둥근 부분(팽대부)과 납작한 원반이 있지만 나선팔이 없습니다.",
    S: "팽대부에서 나선팔이 곧바로 뻗어 나옵니다. a→c로 갈수록 팽대부가 작아지고 팔이 느슨하게 벌어집니다.",
    SB: "팽대부를 가로지르는 막대 구조의 양 끝에서 나선팔이 시작됩니다. 우리은하도 막대 나선 은하입니다.",
    Irr: "뚜렷한 모양이나 대칭이 없습니다. 가스와 젊은 별이 많은 경우가 많습니다.",
  };
  let cur, seed = 1, right = 0, total = 0, answered = false;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };

  function newGalaxy() {
    seed = Math.floor(Math.random() * 2e9) + 1;
    const t = TYPES[Math.floor(rnd() * TYPES.length)];
    cur = { ...t, rot: rnd() * Math.PI, inc: t.k === "E" ? 1 : 0.55 + rnd() * 0.45, seed: Math.floor(rnd() * 1e6) + 7 };
    answered = false;
    root.querySelectorAll("[data-g]").forEach((b) => { b.classList.remove("right-a", "wrong-a"); b.setAttribute("aria-pressed", "false"); });
    nType.textContent = "?"; msg.textContent = "이 은하는 어느 무리에 속할까요? 아래 버튼에서 고르세요.";
    draw();
  }

  const { ctx, size } = fit(cv, () => draw());

  function drawGalaxy(cx, cy, R) {
    let s = cur.seed; const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    const g = (m, sd) => { let u = 0; for (let i = 0; i < 3; i++) u += r(); return m + (u / 3 - 0.5) * 3.4 * sd; };
    const put = (x, y, a, size, col) => { // 원반 좌표 → 기울이고 돌린 화면 좌표
      const yy = y * cur.inc, X = cx + x * Math.cos(cur.rot) - yy * Math.sin(cur.rot), Y = cy + x * Math.sin(cur.rot) + yy * Math.cos(cur.rot);
      ctx.globalAlpha = a; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(X, Y, size, 0, Math.PI * 2); ctx.fill();
    };
    ctx.save();
    if (cur.k === "E") {
      const q = 1 - cur.n / 10;
      for (let i = 0; i < 2600; i++) { const rr = R * 0.8 * Math.pow(r(), 1.8), a = r() * Math.PI * 2; put(rr * Math.cos(a), rr * Math.sin(a) * q / cur.inc, 0.18, 1.3, "#f3e3c2"); }
    } else if (cur.k === "Irr") {
      for (let c = 0; c < 6; c++) { const bx = (r() - .5) * R, by = (r() - .5) * R * 0.7; for (let i = 0; i < 260; i++) put(g(bx, R * 0.12), g(by, R * 0.1), 0.25, 1.2, r() < 0.5 ? "#bcd3ff" : "#f0e6d6"); }
    } else {
      const B = cur.k === "S0" ? 0.35 : cur.bulge;
      // 원반
      for (let i = 0; i < 1400; i++) { const rr = R * Math.sqrt(r()) * 0.95, a = r() * Math.PI * 2; put(rr * Math.cos(a), rr * Math.sin(a), cur.k === "S0" ? 0.12 : 0.06, 1.1, "#d9d6cf"); }
      // 막대
      const barL = cur.k === "SB" ? R * 0.45 : 0;
      if (barL) for (let i = 0; i < 500; i++) put((r() * 2 - 1) * barL, g(0, R * 0.04), 0.3, 1.3, "#f3e3c2");
      // 나선팔 (로그 나선)
      if (cur.k !== "S0") {
        const k = Math.tan(cur.pitch * Math.PI / 180), r0 = Math.max(barL, R * B * 0.9);
        for (let arm = 0; arm < 2; arm++) for (let i = 0; i < 900; i++) {
          const th = r() * 3.2 * Math.PI, rr = r0 * Math.exp(k * th); if (rr > R) continue;
          const a = th + arm * Math.PI, jit = R * 0.035 * (1 + rr / R);
          put(g(rr * Math.cos(a), jit), g(rr * Math.sin(a), jit), 0.32, 1.2, r() < 0.35 ? "#9fc0ff" : "#e8e4f0");
        }
      }
      // 팽대부
      for (let i = 0; i < 900; i++) { const rr = R * B * Math.pow(r(), 1.5), a = r() * Math.PI * 2; put(rr * Math.cos(a), rr * Math.sin(a) / cur.inc * Math.min(1, cur.inc + 0.3), 0.25, 1.4, "#f6e3b8"); }
    }
    ctx.restore(); ctx.globalAlpha = 1;
  }

  function drawFork(x0, y0, w, h) {
    // 허블의 소리굽쇠 그림
    const midY = y0 + h / 2, ex = x0 + w * 0.08, s0x = x0 + w * 0.42;
    const pos = { E0: [ex, midY], E3: [x0 + w * 0.2, midY], E6: [x0 + w * 0.32, midY], S0: [s0x, midY],
      Sa: [x0 + w * 0.58, y0 + h * 0.18], Sb: [x0 + w * 0.73, y0 + h * 0.18], Sc: [x0 + w * 0.88, y0 + h * 0.18],
      SBa: [x0 + w * 0.58, y0 + h * 0.82], SBb: [x0 + w * 0.73, y0 + h * 0.82], SBc: [x0 + w * 0.88, y0 + h * 0.82] };
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(ex, midY); ctx.lineTo(s0x, midY); ctx.lineTo(pos.Sa[0], pos.Sa[1]); ctx.lineTo(pos.Sc[0], pos.Sc[1]);
    ctx.moveTo(s0x, midY); ctx.lineTo(pos.SBa[0], pos.SBa[1]); ctx.lineTo(pos.SBc[0], pos.SBc[1]); ctx.stroke();
    ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "center";
    for (const [k, [x, y]] of Object.entries(pos)) {
      const on = answered && cur.sub === k;
      ctx.beginPath(); ctx.arc(x, y, on ? 7 : 4, 0, Math.PI * 2); ctx.fillStyle = on ? C.warn : C.ink2; ctx.fill();
      ctx.fillStyle = on ? C.warn : C.ink2; ctx.fillText(k, x, y + (y < midY - 2 ? -10 : 18));
    }
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`;
    ctx.fillText("나선 은하", pos.Sb[0], pos.Sb[1] - 24); ctx.fillText("막대 나선 은하", pos.SBb[0], pos.SBb[1] + 32);
    ctx.fillText(answered && cur.k === "Irr" ? "불규칙 은하는 소리굽쇠 밖에 따로 둡니다 (Irr)" : "", x0 + w / 2, y0 + h + 2);
    ctx.textAlign = "left";
  }

  function draw() {
    const { w, h } = size; if (!w || !cur) return;
    ctx.clearRect(0, 0, w, h);
    const gh = h * 0.62;
    ctx.fillStyle = C.night; ctx.fillRect(0, 0, w, gh);
    // 배경 별
    let s = 99; const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    ctx.fillStyle = "rgba(255,255,255,.5)"; for (let i = 0; i < 60; i++) ctx.fillRect(r() * w, r() * gh, 1, 1);
    drawGalaxy(w / 2, gh / 2, Math.min(w, gh) * 0.42);
    ctx.font = `10px ${F.sans}`; ctx.fillStyle = "rgba(243,244,239,.6)"; ctx.fillText("코드로 만든 모식 은하 · 방향과 기울기는 무작위", 8, gh - 8);
    drawFork(18, gh + 26, w - 36, h - gh - 48);
  }

  root.querySelectorAll("[data-g]").forEach((b) => b.addEventListener("click", () => {
    if (answered) return;
    answered = true; total++;
    const ok = b.dataset.g === cur.k; if (ok) right++;
    b.setAttribute("aria-pressed", "true");
    nScore.textContent = `${right} / ${total}`;
    nType.textContent = `${NAME[cur.k]} · ${cur.sub}`;
    msg.textContent = `${ok ? "맞습니다." : `아닙니다. 이 은하는 ${NAME[cur.k]}입니다.`} ${FEAT[cur.k]}`;
    draw();
  }));
  $(".new").addEventListener("click", newGalaxy);
  newGalaxy();
})();
