/* 카드: 체세포 분열과 감수 분열은 무엇이 다를까? — 2n = 4 모형으로 염색체 수와 DNA 양 추적 */
(() => {
  const root = document.getElementById("card-bio-division");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const sS = $(".stage"), oS = $(".stage-out"), desc = $(".stage-desc");
  const nCell = $(".n-cell"), nChr = $(".n-chr"), nHum = $(".n-hum"), nDna = $(".n-dna");

  const MOM = "#c8554a", DAD = "#3f6f9c";
  const LEN = { A: .19, B: .11 };
  // 염색체: [u, v, id, 복제됨, 각도]
  const G1 = { name: "간기 (G₁기)", cells: [[.5, .5, .4, .44, 1]], ch: [[.38, .42, "Am", 0, .3], [.58, .38, "Af", 0, -.5], [.44, .64, "Bm", 0, 1.1], [.62, .62, "Bf", 0, .4]], loose: 1,
    d: "염색체가 풀린 염색사 상태입니다. 상동 염색체(같은 글자, 다른 색)가 두 쌍 있습니다." };
  const G2 = { name: "간기 (G₂기)", cells: G1.cells, ch: G1.ch.map((c) => [c[0], c[1], c[2], 1, c[4]]), loose: 1,
    d: "S기에 DNA가 복제되었습니다. 염색체 수는 그대로 4개지만, 염색체마다 염색 분체가 2가닥이라 DNA 양은 2배입니다." };
  const cells2 = [[.26, .5, .22, .32, 0], [.74, .5, .22, .32, 0]];
  const MITO = [
    [G1, 2, 4, 1, "2n"],
    [G2, 4, 4, 1, "2n"],
    [{ name: "전기", cells: [[.5, .5, .4, .44, 0]], ch: [[.36, .4, "Am", 1, .5], [.6, .36, "Af", 1, -.3], [.42, .66, "Bm", 1, -.8], [.66, .62, "Bf", 1, .3]],
      d: "염색사가 응축해 막대 모양 염색체가 보입니다. 상동 염색체는 서로 짝을 짓지 않고 따로 움직입니다." }, 4, 4, 1, "2n"],
    [{ name: "중기", cells: [[.5, .5, .4, .44, 0]], plate: [.5], ch: [[.5, .2, "Am", 1, 0], [.5, .42, "Af", 1, 0], [.5, .6, "Bm", 1, 0], [.5, .76, "Bf", 1, 0]],
      d: "염색체 4개가 세포 가운데(적도판)에 한 줄로 늘어섭니다. 방추사가 염색체마다 양쪽 극에서 붙습니다." }, 4, 4, 1, "2n"],
    [{ name: "후기", cells: [[.5, .5, .46, .4, 0]], poles: 1, ch: ["Am", "Af", "Bm", "Bf"].flatMap((id, i) => { const v = [.22, .42, .6, .76][i]; return [[.26, v, id, 0, 0], [.74, v, id, 0, 0]]; }),
      d: "염색 분체가 떨어져 양쪽 극으로 끌려갑니다. 떨어진 염색 분체는 각각 하나의 염색체로 셉니다. 그래서 잠시 8개입니다." }, 4, 8, 1, "2n"],
    [{ name: "말기 · 세포질 분열", cells: cells2, ch: [.26, .74].flatMap((u) => [[u - .06, .42, "Am", 0, .2], [u + .05, .4, "Af", 0, -.3], [u - .05, .6, "Bm", 0, .5], [u + .06, .6, "Bf", 0, -.2]]),
      d: "딸세포 2개가 생깁니다. 두 세포는 모체 세포와 염색체 구성이 똑같습니다." }, 2, 4, 2, "2n"],
  ];
  const MEIO = [
    [G1, 2, 4, 1, "2n"],
    [G2, 4, 4, 1, "2n"],
    [{ name: "감수 1분열 전기", cells: [[.5, .5, .4, .44, 0]], pairs: 1, ch: [[.44, .42, "Am", 1, 0], [.52, .42, "Af", 1, 0], [.46, .66, "Bm", 1, 0], [.54, .66, "Bf", 1, 0]],
      d: "상동 염색체끼리 붙어 2가 염색체를 만듭니다. 체세포 분열에는 없는 일입니다. 이때 교차가 일어나 유전자 일부를 바꾸기도 합니다." }, 4, 4, 1, "2n"],
    [{ name: "감수 1분열 중기", cells: [[.5, .5, .4, .44, 0]], plate: [.5], ch: [[.45, .36, "Am", 1, 0], [.55, .36, "Af", 1, 0], [.45, .64, "Bf", 1, 0], [.55, .64, "Bm", 1, 0]],
      d: "2가 염색체가 적도판에 늘어섭니다. 상동 염색체 중 어느 쪽이 왼쪽에 설지는 쌍마다 따로, 무작위로 정해집니다." }, 4, 4, 1, "2n"],
    [{ name: "감수 1분열 후기", cells: [[.5, .5, .46, .4, 0]], poles: 1, ch: [[.26, .4, "Am", 1, 0], [.26, .6, "Bf", 1, 0], [.74, .4, "Af", 1, 0], [.74, .6, "Bm", 1, 0]],
      d: "상동 염색체가 떨어져 양쪽으로 갑니다. 염색 분체는 아직 붙어 있습니다. 여기서 염색체 수가 절반이 됩니다." }, 4, 4, 1, "2n"],
    [{ name: "감수 1분열 말기", cells: cells2, ch: [[.22, .42, "Am", 1, .2], [.3, .58, "Bf", 1, -.3], [.7, .42, "Af", 1, -.2], [.78, .58, "Bm", 1, .3]],
      d: "세포 2개가 생깁니다. 각 세포에는 상동 염색체가 한 개씩만 있으니 핵상은 n입니다. 두 세포의 구성은 서로 다릅니다." }, 2, 2, 2, "n"],
    [{ name: "감수 2분열 중기", cells: cells2, plate: [.26, .74], ch: [[.26, .4, "Am", 1, 0], [.26, .6, "Bf", 1, 0], [.74, .4, "Af", 1, 0], [.74, .6, "Bm", 1, 0]],
      d: "DNA를 다시 복제하지 않고 곧바로 두 번째 분열에 들어갑니다. 염색체가 각 세포의 적도판에 늘어섭니다." }, 2, 2, 2, "n"],
    [{ name: "감수 2분열 후기", cells: [[.26, .5, .24, .3, 0], [.74, .5, .24, .3, 0]], ch: [[.14, .42, "Am", 0, 0], [.38, .42, "Am", 0, 0], [.14, .58, "Bf", 0, 0], [.38, .58, "Bf", 0, 0], [.62, .42, "Af", 0, 0], [.86, .42, "Af", 0, 0], [.62, .58, "Bm", 0, 0], [.86, .58, "Bm", 0, 0]],
      d: "염색 분체가 떨어집니다. 체세포 분열의 후기와 같은 방식입니다." }, 2, 4, 2, "n"],
    [{ name: "감수 2분열 말기", cells: [.13, .37, .63, .87].map((u) => [u, .5, .11, .2, 0]), ch: [[.11, .46, "Am", 0, 0], [.15, .56, "Bf", 0, 0], [.35, .46, "Am", 0, 0], [.39, .56, "Bf", 0, 0], [.61, .46, "Af", 0, 0], [.65, .56, "Bm", 0, 0], [.85, .46, "Af", 0, 0], [.89, .56, "Bm", 0, 0]],
      d: "생식세포가 될 세포 4개가 생깁니다. 각각 염색체 2개(n), DNA 양은 처음(G₁기)의 절반입니다." }, 1, 2, 4, "n"],
  ];
  let mode = "mito";
  const list = () => mode === "mito" ? MITO : MEIO;

  const { ctx, size } = fit(cv, () => draw());

  function chromo(x, y, id, rep, ang, ph, loose) {
    const L = LEN[id[0]] * ph, cw = Math.max(4, ph * .032) * (loose ? .6 : 1);
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
    ctx.fillStyle = id[1] === "m" ? MOM : DAD; ctx.globalAlpha = loose ? .6 : 1;
    const rod = (dx) => {
      const r = cw / 2;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(dx - r, -L / 2, cw, L, r) : ctx.rect(dx - r, -L / 2, cw, L);
      ctx.fill();
    };
    if (rep) { rod(-cw / 2 - .3); rod(cw / 2 + .3); } else rod(0);
    ctx.globalAlpha = 1; ctx.fillStyle = C.card;
    ctx.fillRect(-cw * (rep ? 1.1 : .6), -L * .12 - 1, cw * (rep ? 2.2 : 1.2), 2);
    ctx.fillStyle = "rgba(255,255,255,.9)"; ctx.font = `600 ${Math.max(8, cw * 1.1)}px ${F.mono}`; ctx.textAlign = "center";
    if (!loose) { ctx.save(); ctx.rotate(-ang); ctx.fillStyle = C.ink2; ctx.fillText(id[0], rep ? cw * 1.8 : cw * 1.4, -L * .3); ctx.restore(); }
    ctx.restore();
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const L = list(), i = +sS.value, [st, dna, chr, ncell, pl] = L[i];
    const split = Math.round(w * .56);
    const x0 = 2, y0 = 22, pw = split - 12, ph = h - y0 - 4;
    const U = (u) => x0 + u * pw, V = (v) => y0 + v * ph;
    ctx.font = `600 13px ${F.sans}`; ctx.fillStyle = C.ink; ctx.textAlign = "left";
    ctx.fillText(`${st.name} · 핵상 ${pl}`, 4, 15);
    for (const [cu, cvv, ru, rv, nuc] of st.cells) {
      ctx.fillStyle = "#f1ece0"; ctx.strokeStyle = "#b9a98a"; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.ellipse(U(cu), V(cvv), ru * pw, rv * ph, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      if (nuc) { ctx.setLineDash([3, 3]); ctx.strokeStyle = C.ink3; ctx.beginPath(); ctx.ellipse(U(cu), V(cvv), ru * pw * .62, rv * ph * .62, 0, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]); }
    }
    if (st.plate) for (const pu of st.plate) {
      const cell = st.cells.find((c) => Math.abs(c[0] - pu) < .05);
      ctx.strokeStyle = "rgba(224,160,42,.8)"; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(U(pu), V(cell[1] - cell[3] * .9)); ctx.lineTo(U(pu), V(cell[1] + cell[3] * .9)); ctx.stroke(); ctx.setLineDash([]);
      // 방추사
      ctx.strokeStyle = "rgba(93,93,97,.25)"; ctx.lineWidth = 1;
      for (const c of st.ch) {
        if (Math.abs(c[0] - pu) > .1) continue;
        for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(U(pu + s * cell[2] * .85), V(cell[1])); ctx.lineTo(U(c[0]), V(c[1] - LEN[c[2][0]] * .12)); ctx.stroke(); }
      }
    }
    for (const c of st.ch) chromo(U(c[0]), V(c[1]), c[2], c[3], c[4], ph, st.loose);
    if (st.pairs) {
      ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink2; ctx.textAlign = "left";
      ctx.fillText("← 2가 염색체", U(.6), V(.42)); ctx.fillText("← 2가 염색체", U(.62), V(.67));
    }

    // 오른쪽 그래프 두 개
    ctx.strokeStyle = C.rule; ctx.beginPath(); ctx.moveTo(split + .5, 6); ctx.lineTo(split + .5, h - 6); ctx.stroke();
    const gx0 = split + 30, gw = w - gx0 - 8;
    const n = L.length, X = (k) => gx0 + (k + .5) / n * gw;
    const graph = (gy0, gh, key, max, label, col) => {
      const Y = (v) => gy0 + gh - v / max * gh;
      NM.axes(ctx, { x0: gx0, y0: gy0, w: gw, h: gh, X, Y, yt: max === 4 ? [[0, "0"], [2, "2"], [4, "4"]] : [[0, "0"], [4, "4"], [8, "8"]], ylabel: label });
      ctx.fillStyle = "rgba(224,160,42,.18)"; ctx.fillRect(gx0 + i / n * gw, gy0, gw / n, gh);
      ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath();
      L.forEach((r, k) => { const y = Y(r[key]); const xa = gx0 + k / n * gw, xb = gx0 + (k + 1) / n * gw; k ? ctx.lineTo(xa, y) : ctx.moveTo(xa, y); ctx.lineTo(xb, y); });
      ctx.stroke();
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(X(i), Y(L[i][key]), 3.5, 0, Math.PI * 2); ctx.fill();
    };
    const gh = (h - 70) / 2;
    graph(24, gh, 1, 4, "세포 1개의 DNA 상대량", C.forest);
    graph(24 + gh + 34, gh, 2, 8, "세포 1개의 염색체 수", C.ink);
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "center";
    ctx.fillText("단계 →", gx0 + gw / 2, h - 3);
    ctx.textAlign = "left";
  }

  function update() {
    const L = list();
    sS.max = L.length - 1;
    if (+sS.value > L.length - 1) sS.value = L.length - 1;
    const i = +sS.value, [st, dna, chr, ncell, pl] = L[i];
    oS.textContent = `${i + 1} / ${L.length} · ${st.name}`;
    desc.textContent = st.d;
    nCell.textContent = `${ncell}개`;
    nChr.textContent = `${chr}개 (${pl})`;
    nHum.textContent = `${chr * 23 / 2}개`;
    nDna.textContent = `${dna}`;
    root.querySelectorAll("[data-mode]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.mode === mode ? "true" : "false"));
    draw();
  }
  sS.addEventListener("input", update);
  root.querySelectorAll("[data-mode]").forEach((b) => b.addEventListener("click", () => { mode = b.dataset.mode; update(); }));
  $(".prev").addEventListener("click", () => { sS.value = Math.max(0, +sS.value - 1); update(); });
  $(".nextst").addEventListener("click", () => { sS.value = Math.min(+sS.max, +sS.value + 1); update(); });
  update();
})();
