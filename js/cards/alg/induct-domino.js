/* 카드: 몇 개를 확인하면 모든 자연수에서 참일까? — 명제 P(n)의 참거짓을 도미노로, 처음 민 도미노에서 어디까지 연쇄로 쓰러지는지 */
(() => {
  const root = document.getElementById("card-alg-induct-domino");
  if (!root) return;
  const { C, F, fit } = NM;
  const S = NMSeq;
  const $ = (s) => root.querySelector(s), btns = [...root.querySelectorAll(".presets .chip")];
  const sm = $(".m"), ss = $(".s"), MAX = 47, WIN = 12;
  const isPrime = (x) => { if (x < 2) return false; for (let d = 2; d * d <= x; d++) if (x % d === 0) return false; return true; };
  const ST = {
    odd: { p: () => true, txt: "P(<i>n</i>): 1 + 3 + 5 + … + (2<i>n</i> − 1) = <i>n</i><sup>2</sup>", why: (n) => `${n * n} = ${n}²` },
    prime: { p: (n) => isPrime(n * n + n + 41), txt: "P(<i>n</i>): <i>n</i><sup>2</sup> + <i>n</i> + 41은 소수", why: (n) => `${n * n + n + 41}` },
    pow: { p: (n) => 2 ** n > n * n, txt: "P(<i>n</i>): 2<sup><i>n</i></sup> &gt; <i>n</i><sup>2</sup>", why: (n) => `${2 ** n} vs ${n * n}` },
  };
  let st = ST.odd;
  const { ctx, size } = fit($("canvas"), () => draw());
  /* 처음 m에서 밀었을 때 쓰러지는 마지막 번호 (P(m)이 거짓이면 m − 1) */
  const reach = (m) => { let n = m - 1; while (n + 1 <= MAX && st.p(n + 1)) n++; return n; };

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const m = +sm.value, s = +ss.value, end = reach(m), cw = (w - 34) / WIN, dw = Math.min(14, cw * 0.36), dh = h * 0.42, base = h * 0.66;
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(4, base); ctx.lineTo(w - 4, base); ctx.stroke();
    for (let i = 0; i < WIN; i++) {
      const n = s + i, cx = 8 + (i + 0.5) * cw, ok = st.p(n), fallen = n >= m && n <= end;
      ctx.save(); ctx.translate(cx + dw / 2, base);
      if (fallen) ctx.rotate(Math.atan2(cw - dw * 0.4, dh) * 0.98);
      ctx.fillStyle = fallen ? C.leaf : ok ? C.card : "rgba(181,83,47,.2)";
      ctx.strokeStyle = fallen ? C.forest : ok ? C.ink2 : C.warn; ctx.lineWidth = 1.4;
      ctx.fillRect(-dw, -dh, dw, dh); ctx.strokeRect(-dw + .5, -dh + .5, dw - 1, dh - 1);
      ctx.restore();
      ctx.font = `${n === m ? "700 " : ""}11px ${F.mono}`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillStyle = n === m ? C.warn : C.ink2; ctx.fillText(String(n), cx, base + 13);
      ctx.fillStyle = ok ? C.forest : C.warn; ctx.font = `10px ${F.mono}`; ctx.fillText(ok ? "참" : "거짓", cx, base + 27);
      if (i < WIN - 1) {
        const link = !(ok && !st.p(n + 1)), lx = cx + cw / 2, ly = base - dh - 10;
        if (link) S.dot(ctx, lx, ly, 2.5, C.forest);
        else { ctx.strokeStyle = C.warn; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(lx - 4, ly - 4); ctx.lineTo(lx + 4, ly + 4); ctx.moveTo(lx + 4, ly - 4); ctx.lineTo(lx - 4, ly + 4); ctx.stroke(); }
      }
      if (n === m) S.arrow(ctx, cx - cw * 0.55, base - dh * 0.75, cx - dw * 0.3, base - dh * 0.75, C.warn, 2);
    }
    if (end + 1 <= MAX && end + 1 >= s && end + 1 < s + WIN && end >= m - 1) {
      const i = end + 1 - s, cx = 8 + (i + 0.5) * cw;
      S.tag(ctx, `P(${end + 1}) 거짓: ${st.why(end + 1)}`, Math.min(w - 8, Math.max(8, cx)), 12, C.warn, cx > w * 0.6 ? "right" : cx < w * 0.3 ? "left" : "center", 11);
    }
  }

  function update() {
    const m = +sm.value, s = +ss.value, end = reach(m);
    $(".m-out").textContent = m; $(".s-out").textContent = s; $(".stmt").innerHTML = st.txt;
    $(".v-f").textContent = end < m ? "없음 (P(" + m + ") 거짓)" : end >= MAX ? `${m}번부터 끝까지` : `${m}번 ~ ${end}번`;
    $(".v-x").textContent = end >= MAX ? `${MAX}번까지 멈추지 않음` : `${end + 1}번`;
    let br = []; for (let k = 1; k < MAX; k++) if (st.p(k) && !st.p(k + 1)) br.push(k);
    $(".v-i").textContent = br.length ? `깨지는 곳 k = ${br.slice(0, 3).join(", ")}${br.length > 3 ? " …" : ""}` : "보이는 범위에서 모두 성립";
    draw();
  }
  btns.forEach((b) => b.addEventListener("click", () => { st = ST[b.dataset.s]; btns.forEach((x) => x.setAttribute("aria-pressed", String(x === b))); update(); }));
  [sm, ss].forEach((x) => x.addEventListener("input", update));
  update();
})();
