/* 카드: 마르코프 연쇄로 선율 만들기 — 전이 빈도표, 생성 선율, 원곡 4음 조각 비율 */
(() => {
  const root = document.getElementById("card-hist-markov");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const MIDI = [55, 60, 62, 64, 65, 67, 69];
  const NAME = ["솔₃", "도", "레", "미", "파", "솔", "라"];
  const ix = (m) => MIDI.indexOf(m);
  const c = 60, d = 62, e = 64, f = 65, g = 67, a = 69, G = 55;
  const TW = [c, c, g, g, a, a, g, f, f, e, e, d, d, c, g, g, f, f, e, e, d, g, g, f, f, e, e, d, c, c, g, g, a, a, g, f, f, e, e, d, d, c].map(ix);
  const ODE = [e, e, f, g, g, f, e, d, c, c, d, e, e, d, d, e, e, f, g, g, f, e, d, c, c, d, e, d, c, c,
    d, d, e, c, d, e, f, e, c, d, e, f, e, d, c, d, G, e, e, f, g, g, f, e, d, c, c, d, e, d, c, c].map(ix);
  let song = "t", order = 1, mel = [], seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const songs = () => (song === "t" ? [TW] : song === "o" ? [ODE] : [TW, ODE]);
  function model(k) {
    const m = new Map();
    for (const s of songs()) for (let i = k; i < s.length; i++) {
      const key = s.slice(i - k, i).join(","); if (!m.has(key)) m.set(key, []); m.get(key).push(s[i]);
    }
    return m;
  }
  function grams() { const set = new Set(); for (const s of songs()) for (let i = 0; i + 4 <= s.length; i++) set.add(s.slice(i, i + 4).join(",")); return set; }
  function generate() {
    const ms = [null, model(1), model(2), model(3)], src = songs()[Math.floor(rnd() * songs().length)];
    const out = src.slice(0, order);
    while (out.length < 24) {
      let nxt = null;
      for (let k = order; k >= 1 && nxt === null; k--) {
        const opts = ms[k].get(out.slice(-k).join(","));
        if (opts && opts.length) nxt = opts[Math.floor(rnd() * opts.length)];
      }
      if (nxt === null) nxt = Math.floor(rnd() * MIDI.length);
      out.push(nxt);
    }
    mel = out;
  }
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    // 왼쪽: 1음 전이 빈도표
    const m1 = model(1), n = MIDI.length, x0 = 40, y0 = 34, cs = Math.min((w * 0.42 - x0) / n, (h - y0 - 12) / n);
    let mx = 1; const cnt = [];
    for (let i = 0; i < n; i++) { cnt.push(Array(n).fill(0)); (m1.get(String(i)) || []).forEach((j) => cnt[i][j]++); mx = Math.max(mx, ...cnt[i]); }
    ctx.font = `10px ${F.sans}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left"; ctx.fillText("앞 음(세로) → 다음 음(가로) 횟수", 4, 12);
    for (let i = 0; i < n; i++) {
      ctx.fillStyle = C.ink2; ctx.textAlign = "right"; ctx.fillText(NAME[i], x0 - 5, y0 + (i + .5) * cs + 4);
      ctx.textAlign = "center"; ctx.fillText(NAME[i], x0 + (i + .5) * cs, y0 - 6);
      for (let j = 0; j < n; j++) {
        const v = cnt[i][j];
        ctx.fillStyle = v ? `rgba(59,124,42,${0.15 + 0.85 * v / mx})` : "#f0f1ec";
        ctx.fillRect(x0 + j * cs + 1, y0 + i * cs + 1, cs - 2, cs - 2);
        if (v) { ctx.fillStyle = v / mx > 0.55 ? "#fff" : C.ink; ctx.font = `9.5px ${F.mono}`; ctx.fillText(`${v}`, x0 + (j + .5) * cs, y0 + (i + .5) * cs + 3.5); ctx.font = `10px ${F.sans}`; }
      }
    }
    // 오른쪽: 만든 선율 (음높이 막대)
    const rx0 = w * 0.47, rx1 = w - 8, ry0 = h - 22, ry1 = 30, nw = (rx1 - rx0) / 24, nh = (ry0 - ry1) / n;
    const known = grams();
    ctx.fillStyle = C.ink3; ctx.textAlign = "left"; ctx.fillText("만든 선율 (주황 = 원곡에 없던 이어짐)", rx0, 12);
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1;
    for (let i = 0; i <= n; i++) { ctx.beginPath(); ctx.moveTo(rx0, ry0 - i * nh + .5); ctx.lineTo(rx1, ry0 - i * nh + .5); ctx.stroke(); }
    const fresh = Array(mel.length).fill(false);
    for (let i = 0; i + 4 <= mel.length; i++) if (!known.has(mel.slice(i, i + 4).join(","))) fresh[i + 3] = true;
    mel.forEach((p, i) => { ctx.fillStyle = fresh[i] ? C.amber : "#3f6fa3"; ctx.fillRect(rx0 + i * nw + 1, ry0 - (p + 1) * nh + 1, nw - 2, nh - 2); });
    ctx.fillStyle = C.ink3; ctx.font = `9.5px ${F.sans}`; ctx.textAlign = "right";
    for (let i = 0; i < n; i += 2) ctx.fillText(NAME[i], rx0 - 3, ry0 - (i + .5) * nh + 3);
    ctx.font = `10px ${F.mono}`; ctx.textAlign = "right"; ctx.fillText("시간 →", rx1, ry0 + 15);
  }
  function update() {
    root.querySelectorAll("[data-g]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.g === song)));
    root.querySelectorAll("[data-o]").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.o === order)));
    const known = grams(); let hit = 0, tot = 0;
    for (let i = 0; i + 4 <= mel.length; i++) { tot++; if (known.has(mel.slice(i, i + 4).join(","))) hit++; }
    $(".n-n").textContent = `${songs().reduce((s, x) => s + x.length, 0)} 음`;
    $(".n-c").textContent = tot ? `${Math.round(hit / tot * 100)} %` : "—";
    $(".n-u").textContent = `${tot - hit} 개 / ${tot}`;
    draw();
  }
  root.querySelectorAll("[data-g]").forEach((b) => b.addEventListener("click", () => { song = b.dataset.g; generate(); update(); }));
  root.querySelectorAll("[data-o]").forEach((b) => b.addEventListener("click", () => { order = +b.dataset.o; generate(); update(); }));
  $(".gen").addEventListener("click", () => { generate(); update(); });
  let ac = null;
  $(".play").addEventListener("click", () => {
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    if (!ac) ac = new AC();
    if (ac.state === "suspended") ac.resume();
    const wave = ac.createPeriodicWave(new Float32Array(5), new Float32Array([0, 1, 0.4, 0.2, 0.1]));
    let t = ac.currentTime + 0.05;
    mel.forEach((p) => {
      const o = ac.createOscillator(), gn = ac.createGain();
      o.setPeriodicWave(wave); o.frequency.value = 440 * 2 ** ((MIDI[p] - 69) / 12);
      gn.gain.setValueAtTime(0, t); gn.gain.linearRampToValueAtTime(0.15, t + 0.02); gn.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      o.connect(gn).connect(ac.destination); o.start(t); o.stop(t + 0.32); t += 0.3;
    });
  });
  if (/[?&]demo\b/.test(location.search)) { order = 2; song = "b"; }
  generate(); update();
})();
