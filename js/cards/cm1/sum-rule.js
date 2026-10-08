/* 카드: 'A 또는 B'의 경우의 수는 언제 더하기만 하면 될까? — 주사위 두 개 36칸 표에서 두 사건과 겹침 세기 */
(() => {
  const root = document.getElementById("card-cm1-sum-rule");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const EV = {
    m3: (a, b) => (a + b) % 3 === 0, s5: (a, b) => a + b === 5, dbl: (a, b) => a === b,
    m4: (a, b) => (a + b) % 4 === 0, s7: (a, b) => a + b === 7, ge10: (a, b) => a + b >= 10,
  };
  let A = "m3", B = "m4";
  const { ctx, size } = fit($("canvas"), () => draw());

  function count() {
    let na = 0, nb = 0, nab = 0;
    for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) {
      const ia = EV[A](a, b), ib = EV[B](a, b);
      na += ia; nb += ib; nab += ia && ib;
    }
    return { na, nb, nab, nu: na + nb - nab };
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const gx = 30, gy = 24, cs = Math.floor(Math.min((h - gy - 8) / 6, (w * 0.62 - gx) / 6));
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3;
    for (let i = 1; i <= 6; i++) { ctx.fillText(i, gx + (i - 0.5) * cs, gy - 9); ctx.fillText(i, gx - 12, gy + (i - 0.5) * cs); }
    ctx.textAlign = "left"; ctx.fillText("첫째 →", gx + 6 * cs + 4, gy - 9);
    for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) {
      const x = gx + (a - 1) * cs, y = gy + (b - 1) * cs, ia = EV[A](a, b), ib = EV[B](a, b);
      ctx.fillStyle = ia && ib ? C.warn : ia ? C.sprout : ib ? C.amber : C.card;
      ctx.globalAlpha = ib && !ia ? 0.55 : 1;
      ctx.fillRect(x, y, cs, cs); ctx.globalAlpha = 1;
      ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.strokeRect(x + .5, y + .5, cs - 1, cs - 1);
      ctx.fillStyle = ia && ib ? C.card : C.ink2; ctx.textAlign = "center";
      ctx.font = `${cs < 34 ? 10.5 : 12}px ${F.mono}`; ctx.fillText(a + b, x + cs / 2, y + cs / 2 + 1);
    }
    ctx.textAlign = "left"; ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.fillText("둘째↓", 0, gy - 9);
    // 오른쪽 범례와 개수
    const k = count(), lx = gx + 6 * cs + 16, fs = w < 400 ? 11.5 : 12.5;
    const rows = [[C.sprout, 1, "A만", k.na - k.nab], [C.amber, 0.55, "B만", k.nb - k.nab], [C.warn, 1, "겹침", k.nab]];
    ctx.textAlign = "left"; ctx.font = `${fs}px ${F.sans}`;
    let y = gy + 18;
    for (const [col, al, lab, v] of rows) {
      ctx.globalAlpha = al; ctx.fillStyle = col; ctx.fillRect(lx, y - 7, 14, 14); ctx.globalAlpha = 1;
      ctx.fillStyle = C.ink; ctx.fillText(`${lab} ${v}`, lx + 20, y); y += 26;
    }
    y += 6;
    ctx.strokeStyle = C.rule; ctx.beginPath(); ctx.moveTo(lx, y - 14); ctx.lineTo(w - 6, y - 14); ctx.stroke();
    ctx.fillStyle = C.ink2; ctx.fillText(`A ${k.na} + B ${k.nb}`, lx, y); y += 20;
    ctx.fillText(`= ${k.na + k.nb}`, lx, y); y += 26;
    ctx.fillStyle = k.nab ? C.warn : C.forest; ctx.font = `600 ${fs}px ${F.sans}`;
    ctx.fillText(`실제 ${k.nu}칸`, lx, y);
  }

  function update() {
    const k = count();
    $(".n-a").textContent = k.na; $(".n-b").textContent = k.nb; $(".n-ab").textContent = k.nab; $(".n-u").textContent = k.nu;
    const u = $(".n-u"); u.className = `n-u ${k.nab ? "bad" : "good"}`;
    $(".chk").textContent = k.nab
      ? `${k.na} + ${k.nb} = ${k.na + k.nb}이지만 실제로는 ${k.nu}가지입니다. 겹치는 ${k.nab}가지를 두 번 셌으므로 한 번 빼야 합니다.`
      : `두 사건이 동시에 일어나지 않으므로 ${k.na} + ${k.nb} = ${k.nu}가지, 더하기만 하면 됩니다.`;
    draw();
  }
  for (const [sel, set] of [[".ev-a", (v) => { A = v; }], [".ev-b", (v) => { B = v; }]]) {
    const bs = [...root.querySelectorAll(`${sel} .chip`)];
    bs.forEach((b) => b.addEventListener("click", () => { set(b.dataset.e); bs.forEach((x) => x.setAttribute("aria-pressed", String(x === b))); update(); }));
  }
  update();
})();
