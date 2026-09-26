/* 카드 2.5.2: 단백질과 DNA는 작은 단위를 어떻게 이어 붙일까? — 단위체를 하나씩 이어 보기 */
(() => {
  const root = document.getElementById("card-is1-polymer");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const L = [1, 2, 3].map((i) => $(`.l${i}`)), V = [1, 2, 3, 4].map((i) => $(`.v${i}`));

  const AA = { Gly: "#b5d7ac", Ala: "#cfd8c4", Ser: "#dbe8f3", Cys: "#f3e3b8", Lys: "#c9d6f0", Glu: "#f0c9c3" };
  const BASE = { A: "#e0a02a", T: "#d4493a", G: "#3b7c2a", C: "#3f78b5" };
  const PAIR = { A: "T", T: "A", G: "C", C: "G" };
  const MAX = 12;
  let mode = "prot";
  const seq = { prot: ["Gly", "Ala", "Ser"], dna: ["A", "T", "G"] };

  const SUPD = "⁰¹²³⁴⁵⁶⁷⁸⁹";
  const sup = (n) => String(n).split("").map((d) => SUPD[d]).join("");
  function combos(b, n) {
    if (n === 0) return "—";
    const v = Math.pow(b, n);
    const txt = v < 1e6 ? v.toLocaleString("ko-KR") : `${(v / 10 ** Math.floor(Math.log10(v))).toFixed(1)}×10${sup(Math.floor(Math.log10(v)))}`;
    return `${b}${sup(n)} = ${txt}`;
  }

  const { ctx, size } = fit(cv, () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const S = seq[mode], n = S.length;
    const small = w < 520;
    ctx.textAlign = "center";
    if (!n) {
      ctx.font = `12px ${F.sans}`; ctx.fillStyle = C.ink3;
      ctx.fillText("아래 버튼으로 단위체를 하나씩 이어 보세요.", w / 2, h / 2);
      return;
    }
    if (mode === "prot") {
      // 한 줄에 최대 6개, 넘치면 다음 줄로 (뱀 모양)
      const per = 6, rows = Math.ceil(n / per);
      const gap = (w - 40) / per, r = Math.min(gap * 0.3, 22);
      const rowH = Math.min(h / (rows + 0.2), 118);
      const pos = S.map((_, i) => {
        const row = Math.floor(i / per), k = i % per, col = row % 2 ? per - 1 - k : k;
        return [20 + gap * (col + .5), h / 2 - (rows - 1) * rowH / 2 + row * rowH + 14 + (k % 2 ? 9 : -9)];
      });
      for (let i = 0; i < n - 1; i++) {
        const [x1, y1] = pos[i], [x2, y2] = pos[i + 1];
        ctx.strokeStyle = C.ink; ctx.lineWidth = 2.4;
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
        const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
        ctx.fillStyle = C.forest; ctx.fillRect(mx - 3, my - 3, 6, 6);
        // 빠져나온 물 분자
        ctx.font = `${small ? 9.5 : 10.5}px ${F.mono}`; ctx.fillStyle = "#3f78b5";
        ctx.fillText("H₂O", mx, my - r - 12);
        ctx.strokeStyle = "rgba(63,120,181,.4)"; ctx.lineWidth = 1; ctx.setLineDash([2, 2]);
        ctx.beginPath(); ctx.moveTo(mx, my - 5); ctx.lineTo(mx, my - r - 8); ctx.stroke(); ctx.setLineDash([]);
      }
      S.forEach((a, i) => {
        const [x, y] = pos[i];
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = AA[a]; ctx.fill();
        ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2; ctx.stroke();
        ctx.fillStyle = C.ink; ctx.font = `600 ${small ? 10 : 11.5}px ${F.mono}`; ctx.fillText(a, x, y + 4);
      });
      ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3;
      ctx.fillText("H₂N–", pos[0][0] - r - 16, pos[0][1] + 4);
      ctx.fillText("–COOH", pos[n - 1][0] + (Math.floor((n - 1) / per) % 2 ? -r - 22 : r + 22), pos[n - 1][1] + 4);
      ctx.textAlign = "left"; ctx.fillStyle = C.forest; ctx.fillRect(8, h - 16, 6, 6);
      ctx.fillStyle = C.ink3; ctx.fillText("펩타이드 결합 (결합마다 물 한 분자가 빠짐)", 20, h - 9);
    } else {
      const gap = Math.min((w - 60) / n, 44), x0 = w / 2 - gap * n / 2;
      const yT = h * 0.3, yB = h * 0.7, br = Math.min(gap * 0.36, 15);
      ctx.strokeStyle = C.ink2; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(x0, yT - br - 10); ctx.lineTo(x0 + gap * n, yT - br - 10); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x0, yB + br + 10); ctx.lineTo(x0 + gap * n, yB + br + 10); ctx.stroke();
      ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3;
      ctx.textAlign = "left";
      ctx.fillText("내가 만든 가닥 (당–인산 골격)", x0, yT - br - 18);
      ctx.fillText("저절로 정해지는 맞은편 가닥", x0, yB + br + 26);
      ctx.textAlign = "center";
      S.forEach((b, i) => {
        const x = x0 + gap * (i + .5), p = PAIR[b], hb = b === "A" || b === "T" ? 2 : 3;
        ctx.strokeStyle = C.ink2; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(x, yT - br - 10); ctx.lineTo(x, yT - br); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x, yB + br + 10); ctx.lineTo(x, yB + br); ctx.stroke();
        for (const [ch, y] of [[b, yT], [p, yB]]) {
          ctx.fillStyle = BASE[ch]; ctx.beginPath(); ctx.roundRect(x - br, y - br, 2 * br, 2 * br, 3); ctx.fill();
          ctx.fillStyle = "#fff"; ctx.font = `600 ${small ? 11 : 13}px ${F.mono}`; ctx.fillText(ch, x, y + 5);
        }
        ctx.strokeStyle = "rgba(35,35,38,.55)"; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
        for (let k = 0; k < hb; k++) {
          const dx = (k - (hb - 1) / 2) * Math.min(6, br * .45);
          ctx.beginPath(); ctx.moveTo(x + dx, yT + br + 2); ctx.lineTo(x + dx, yB - br - 2); ctx.stroke();
        }
        ctx.setLineDash([]);
      });
      ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3;
      ctx.fillText("점선 = 수소 결합 (A–T 2개, G–C 3개)", w / 2, h - 6);
    }
    ctx.textAlign = "left";
  }

  function update() {
    const S = seq[mode], n = S.length;
    if (mode === "prot") {
      L[0].textContent = "아미노산"; L[1].textContent = "펩타이드 결합"; L[2].textContent = "빠져나온 물";
      V[0].textContent = `${n}개`; V[1].textContent = `${Math.max(0, n - 1)}개`; V[2].textContent = `${Math.max(0, n - 1)}분자`;
      V[3].textContent = combos(20, n);
    } else {
      const c = { A: 0, T: 0, G: 0, C: 0 };
      for (const b of S) { c[b]++; c[PAIR[b]]++; }
      L[0].textContent = "염기쌍"; L[1].textContent = "두 가닥 A·T / G·C"; L[2].textContent = "수소 결합";
      V[0].textContent = `${n}쌍`; V[1].textContent = `${c.A}·${c.T} / ${c.G}·${c.C}`;
      V[2].textContent = `${S.reduce((s, b) => s + (b === "A" || b === "T" ? 2 : 3), 0)}개`;
      V[3].textContent = combos(4, n);
    }
    root.querySelectorAll(".units .chip").forEach((b) => b.disabled = n >= MAX);
    draw();
  }

  root.querySelectorAll(".mode .chip").forEach((b) => b.addEventListener("click", () => {
    mode = b.dataset.m;
    root.querySelectorAll(".mode .chip").forEach((x) => x.setAttribute("aria-pressed", x === b ? "true" : "false"));
    $(".u-prot").hidden = mode !== "prot"; $(".u-dna").hidden = mode !== "dna";
    update();
  }));
  root.querySelectorAll(".units .chip").forEach((b) => b.addEventListener("click", () => {
    if (seq[mode].length < MAX) seq[mode].push(b.dataset.u);
    update();
  }));
  $(".back").addEventListener("click", () => { seq[mode].pop(); update(); });
  $(".clear").addEventListener("click", () => { seq[mode] = []; update(); });
  update();
})();
