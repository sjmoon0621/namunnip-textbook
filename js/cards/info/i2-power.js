/* 카드: 3의 1000제곱을 곱셈 몇 번으로 구할까? — 분할 정복 거듭제곱과 호출 스택 */
(() => {
  const root = document.getElementById("card-info-power");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const CODE = [
    "def power(a, n):",
    "    if n == 0:",
    "        return 1",
    "    half = power(a, n // 2)",
    "    if n % 2 == 0:",
    "        return half * half",
    "    return half * half * a",
  ];
  const cp = I2.code($(".i2c"), CODE);
  const sA = $(".a"), sN = $(".n");
  let a = 3, n = 13, frames = [], ev = [], k = 0;

  const short = (b) => { const s = b.toString(); return s.length > 14 ? `${s.slice(0, 5)}…(${s.length}자리)` : s; };
  function build() {
    a = +sA.value; n = +sN.value;
    $(".a-out").textContent = a; $(".n-out").textContent = n;
    frames = []; for (let m = n; ; m = m >> 1) { frames.push({ n: m, val: null }); if (m === 0) break; }
    ev = [];
    frames.forEach((f, i) => ev.push({ t: "call", i, line: i ? 3 : 0 }));
    for (let i = frames.length - 1; i >= 0; i--) ev.push({ t: "ret", i, line: frames[i].n === 0 ? 2 : frames[i].n % 2 ? 6 : 5 });
    k = 0; frames.forEach((f) => { f.val = null; f.on = false; });
    apply(); counts();
  }
  function apply() {
    frames.forEach((f) => { f.on = false; f.val = null; });
    let v = 1n;
    for (let j = 0; j <= k; j++) {
      const e = ev[j], f = frames[e.i];
      if (e.t === "call") f.on = true;
      else {
        const m = f.n;
        v = m === 0 ? 1n : (m % 2 ? v * v * BigInt(a) : v * v);
        f.val = v;
      }
    }
    cp.set(ev[k].line); draw(); show();
  }
  function step() { if (k >= ev.length - 1) return false; k++; apply(); return k < ev.length - 1; }
  function mults(m, twice) {
    if (m === 0) return { mul: 0, calls: 1 };
    const s = mults(m >> 1, twice), own = m % 2 ? 2 : 1;
    return twice ? { mul: 2 * s.mul + own, calls: 2 * s.calls + 1 } : { mul: s.mul + own, calls: s.calls + 1 };
  }
  function counts() {
    const one = mults(n, false), two = mults(n, true);
    $(".n-loop").textContent = Math.max(0, n - 1);
    $(".n-two").textContent = `${two.mul} (호출 ${two.calls})`;
    $(".n-one").textContent = `${one.mul} (호출 ${one.calls})`;
    $(".n-bin").textContent = n.toString(2);
  }
  function show() {
    const e = ev[k], f = frames[e.i];
    $(".note").textContent = e.t === "call"
      ? `power(${a}, ${f.n}) 호출${f.n ? ` → 먼저 power(${a}, ${f.n >> 1})를 구해야 함` : " → 기저 사례"}`
      : `power(${a}, ${f.n}) = ${f.n === 0 ? "1" : f.n % 2 ? `half × half × ${a}` : "half × half"} = ${short(f.val)}`;
  }

  const view = fit($(".cv-wide"), () => draw());
  function draw() {
    const { ctx } = view, { w, h } = view.size; if (!w || !frames.length) return;
    ctx.clearRect(0, 0, w, h);
    const rows = frames.length, rh = Math.min(30, (h - 24) / rows), bw = Math.min(170, w * 0.32);
    ctx.font = `11px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left";
    ctx.fillText("호출", 8, 12); ctx.fillText("n (2진수)", bw + 62, 12); ctx.fillText("돌려준 값", bw + 150, 12);
    frames.forEach((f, i) => {
      const y = 20 + i * rh, x = 8 + Math.min(i * 6, 40);
      if (!f.on && f.val === null) { ctx.strokeStyle = C.rule; ctx.setLineDash([3, 3]); ctx.strokeRect(x + .5, y + .5, bw - 1, rh - 5); ctx.setLineDash([]); }
      else {
        ctx.fillStyle = f.val !== null ? "#cfe3c5" : C.card; ctx.fillRect(x, y, bw, rh - 4);
        const top = ev[k].i === i;
        ctx.strokeStyle = top ? C.warn : C.ink2; ctx.lineWidth = top ? 2.5 : 1; ctx.strokeRect(x + .5, y + .5, bw - 1, rh - 5);
      }
      ctx.fillStyle = f.on || f.val !== null ? C.ink : C.ink3; ctx.font = `${Math.min(12, rh * 0.45)}px ${F.mono}`; ctx.textBaseline = "middle";
      ctx.fillText(`power(${a}, ${f.n})`, x + 8, y + (rh - 4) / 2 + 1);
      ctx.fillStyle = f.n % 2 ? C.warn : C.ink2; ctx.fillText(f.n.toString(2), bw + 62, y + (rh - 4) / 2 + 1);
      if (f.val !== null) { ctx.fillStyle = C.forest; ctx.fillText(short(f.val), bw + 150, y + (rh - 4) / 2 + 1); }
      ctx.textBaseline = "alphabetic";
    });
  }

  const run = I2.runner($(".run"), step, 380);
  const reset = () => { run.stop(); build(); };
  [sA, sN].forEach((el) => el.addEventListener("input", reset));
  $(".step").addEventListener("click", () => { run.stop(); step(); });
  $(".again").addEventListener("click", reset);
  build();
  if (NMLab.demo) { for (let i = 0; i < 7; i++) step(); }
})();
