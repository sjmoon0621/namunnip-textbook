/* 카드: 제한 효소가 정말 그 염기 서열만 자르는지 어떻게 확인할까? — 인식 서열과 말단, 플라스미드/λ DNA 처리, 부분 절단, 대조군, 전기 영동 */
(() => {
  const root = document.getElementById("card-labbio-restriction");
  if (!root) return;
  const { C, F, fit, clamp } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const ENZ = {
    EcoRI: { site: "GAATTC", top: 1, bot: 5, col: C.apple },
    BamHI: { site: "GGATCC", top: 1, bot: 5, col: "#3b6fb5" },
    HindIII: { site: "AAGCTT", top: 1, bot: 5, col: "#c98a12" },
    EcoRV: { site: "GATATC", top: 3, bot: 3, col: "#8a5bb5" },
  };
  const DNA = {
    p: { name: "pLB", len: 4000, circ: true, sites: { EcoRI: [396], BamHI: [1650], HindIII: [2880, 3620], EcoRV: [1020] } },
    l: { name: "λ", len: 48502, circ: false, sites: { EcoRI: [21226, 26104, 31747, 39168, 44972], BamHI: [5505, 22346, 27972, 34499, 41732], HindIII: [23130, 25157, 27479, 36895, 37459, 37584, 44141], EcoRV: null } },
  };
  const SEQ = "TTGAATTCCGTAGGATCCTTACAAGCTTGCAGATATCCGAGAATTCAG";
  const COMP = { A: "T", T: "A", G: "C", C: "G" };
  const LADDER = [10000, 8000, 6000, 5000, 4000, 3000, 2000, 1500, 1000, 500, 250];
  let dna = "p", sel = new Set(["EcoRI"]), lanes = [], laneNo = 0;

  const tbl = L.table($(".tbl-host"), [{ key: "ln", label: "레인" }, { key: "d", label: "DNA" }, { key: "e", label: "효소" }, { key: "c", label: "조건" }, { key: "n", label: "띠 수" }, { key: "b", label: "띠 크기 (bp, 사다리로 읽음)" }]);
  const app = fit($(".cv-wide"), () => drawMap());
  const pl = fit($(".cv-plot"), () => drawGel());
  const msg = (t) => { $(".re-msg").textContent = t; };

  // 서열 표시: 두 가닥과 자르는 자리
  function drawSeq() {
    const n = SEQ.length, mark = new Array(n).fill(null), cutT = new Set(), cutB = new Set();
    sel.forEach((e) => { const z = ENZ[e]; let i = -1; while ((i = SEQ.indexOf(z.site, i + 1)) >= 0) { for (let k = 0; k < 6; k++) mark[i + k] = e; cutT.add(i + z.top); cutB.add(i + z.bot); } });
    let top = "5′ ", bot = "3′ ";
    for (let i = 0; i <= n; i++) {
      if (cutT.has(i) || cutB.has(i)) { top += cutT.has(i) ? "<i>|</i>" : " "; bot += cutB.has(i) ? "<i>|</i>" : " "; }
      if (i === n) break;
      const b = SEQ[i], c = COMP[b];
      top += mark[i] ? `<b>${b}</b>` : b; bot += mark[i] ? `<b>${c}</b>` : c;
    }
    $(".re-seq").innerHTML = `${top} 3′\n${bot} 5′`;
    $(".re-ends").innerHTML = [...sel].map((e) => { const z = ENZ[e], s = z.site; const arrow = s.slice(0, z.top) + "↓" + s.slice(z.top); return z.top === z.bot ? `<b>${e}</b> ${arrow} → 평활 말단` : `<b>${e}</b> ${arrow} → 5′ 쪽이 ${s.slice(z.top, z.bot)} 만큼 튀어나온 점착 말단`; }).join(" · ") || "효소를 하나 이상 고르세요.";
  }

  function sitesOf(D, enz) {
    const out = [];
    enz.forEach((e) => (D.sites[e] || []).forEach((x) => out.push(x)));
    return [...new Set(out)].sort((a, b) => a - b);
  }
  // 자리마다 잘릴 확률 p일 때 조각별 기대 개수 (부분 절단 포함)
  function fragments(D, enz, p) {
    const s = sitesOf(D, enz), fr = [];
    if (D.circ) {
      const n = s.length;
      if (!n || p < 1) fr.push({ bp: D.len, cnt: (1 - p) ** n, circ: true });
      for (let i = 0; i < n; i++) for (let k = 1; k <= n; k++) {
        const j = (i + k) % n, len = k === n ? D.len : (s[j] - s[i] + D.len) % D.len;
        const c = k === n ? p * (1 - p) ** (n - 1) : p * p * (1 - p) ** (k - 1);
        if (c > 1e-6) fr.push({ bp: len, cnt: c });
      }
    } else {
      const b = [0, ...s, D.len], m = b.length;
      for (let i = 0; i < m - 1; i++) for (let j = i + 1; j < m; j++) {
        const ci = i === 0 ? 1 : p, cj = j === m - 1 ? 1 : p, c = ci * cj * (1 - p) ** (j - i - 1);
        if (c > 1e-6) fr.push({ bp: b[j] - b[i], cnt: c });
      }
    }
    return fr;
  }
  const full = (D, enz) => fragments(D, enz, 1).map((f) => f.bp).sort((a, b) => b - a);

  // 0.8% 젤 모식: 이동 거리 (cm)
  const dist = (bp) => 7 * (4.85 - Math.log10(bp)) / 2.6;
  function bandsOf(fr, D) {
    let raw = [];
    fr.forEach((f) => {
      const m = f.cnt * f.bp;
      if (f.circ) { raw.push({ bp: f.bp * 0.68, m: m * 0.75, tag: "꼬인 원형" }); raw.push({ bp: f.bp * 1.8, m: m * 0.25, tag: "끊긴 원형" }); }
      else raw.push({ bp: f.bp, m });
    });
    const tot = raw.reduce((s, r) => s + r.m, 0) || 1;
    raw = raw.map((r) => ({ ...r, m: r.m / tot, d: dist(r.bp) })).filter((r) => r.m > 0.004).sort((a, b) => a.d - b.d);
    const out = [];
    raw.forEach((r) => { const p = out[out.length - 1]; if (p && Math.abs(p.d - r.d) < 0.1) { p.m += r.m; p.n++; p.d = (p.d + r.d) / 2; } else out.push({ ...r, n: 1 }); });
    return out.filter((b) => b.d <= 7.2 && b.d >= 0);
  }

  function react() {
    const D = DNA[dna];
    const enz = [...sel].filter((e) => D.sites[e]);
    if (dna === "l" && sel.has("EcoRV")) msg("이 카드에서는 λ DNA의 EcoRV 자리를 다루지 않아 EcoRV는 빼고 반응시켰습니다.");
    else msg("");
    const t = +$(".t").value, dead = $(".heat").checked || $(".nomg").checked;
    const p = !enz.length || dead ? 0 : 1 - Math.exp(-t / 6);
    const bands = bandsOf(fragments(D, enz, p), D);
    const cond = [`${t}분`, $(".heat").checked ? "가열한 효소" : "", $(".nomg").checked ? "Mg²⁺ 없음" : ""].filter(Boolean).join(", ");
    const label = enz.length ? enz.join("+") : "없음";
    if (lanes.length >= 7) lanes.shift();
    laneNo++;
    lanes.push({ short: String(laneNo), bands });
    const read = bands.map((b) => { const est = L.measure(b.bp, { rel: 0.03 }); return b.bp > 10500 ? ">10,000" : (Math.round(est / (est > 5000 ? 100 : 10)) * (est > 5000 ? 100 : 10)).toLocaleString() + (b.n > 1 ? "(진함)" : ""); });
    tbl.add({ ln: laneNo, d: D.name, e: label, c: cond, n: bands.length, b: read.join(", ") });
    drawGel();
  }

  function drawMap() {
    const { ctx } = app, { w, h } = app.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const D = DNA[dna];
    ctx.font = `11px ${F.mono}`;
    if (D.circ) {
      const r = Math.min(h * 0.33, w * 0.15), cx = Math.max(r + 104, w * 0.3), cy = h * 0.52;
      ctx.strokeStyle = C.ink2; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
      const ang = (x) => x / D.len * Math.PI * 2 - Math.PI / 2;
      // 유전자 (모식)
      [[2000, 2860, "ampR", C.leaf], [3700, 3990, "ori", C.sprout]].forEach(([a, b, lab, col]) => {
        ctx.strokeStyle = col; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(cx, cy, r, ang(a), ang(b)); ctx.stroke();
        const m = ang((a + b) / 2); ctx.fillStyle = C.forest; ctx.textAlign = "center"; ctx.fillText(lab, cx + Math.cos(m) * (r - 22), cy + Math.sin(m) * (r - 22) + 4);
      });
      ctx.fillStyle = C.ink; ctx.textAlign = "center"; ctx.font = `600 12px ${F.mono}`; ctx.fillText("pLB", cx, cy - 2);
      ctx.font = `11px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.fillText("4,000 bp", cx, cy + 14);
      Object.keys(ENZ).forEach((e) => (D.sites[e] || []).forEach((x) => {
        const a = ang(x), on = sel.has(e);
        ctx.strokeStyle = on ? ENZ[e].col : C.rule; ctx.lineWidth = on ? 2.4 : 1.2;
        ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * (r - 8), cy + Math.sin(a) * (r - 8)); ctx.lineTo(cx + Math.cos(a) * (r + 12), cy + Math.sin(a) * (r + 12)); ctx.stroke();
        ctx.fillStyle = on ? ENZ[e].col : C.ink3; ctx.textAlign = Math.cos(a) >= 0 ? "left" : "right";
        ctx.fillText(`${e} ${x}`, cx + Math.cos(a) * (r + 16), cy + Math.sin(a) * (r + 16) + 4);
      }));
    } else {
      const x0 = 20, x1 = w * 0.62, y = h * 0.5, X = (v) => x0 + v / D.len * (x1 - x0);
      ctx.strokeStyle = C.ink2; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
      ctx.fillStyle = C.ink3; ctx.textAlign = "left"; ctx.fillText("0", x0, y + 30); ctx.textAlign = "right"; ctx.fillText("48,502 bp", x1, y + 30);
      ctx.textAlign = "left"; ctx.fillStyle = C.ink; ctx.font = `600 12px ${F.mono}`; ctx.fillText("λ DNA (선형)", x0, y - 44);
      Object.keys(ENZ).forEach((e, k) => (D.sites[e] || []).forEach((x) => {
        const on = sel.has(e), up = k % 2 === 0;
        ctx.strokeStyle = on ? ENZ[e].col : C.rule; ctx.lineWidth = on ? 2.2 : 1;
        ctx.beginPath(); ctx.moveTo(X(x), y + (up ? -4 : 4)); ctx.lineTo(X(x), y + (up ? -20 : 20)); ctx.stroke();
      }));
      ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.fillText("위: EcoRI·HindIII · 아래: BamHI", x0, h - 12);
    }
    // 자리 수 요약
    const lx = Math.max(w * 0.68, D.circ ? 0 : w * 0.66); let yy = 30;
    ctx.textAlign = "left"; ctx.font = `600 12px ${F.sans}`; ctx.fillStyle = C.ink; ctx.fillText("고른 효소의 자리 (bp)", lx, yy);
    ctx.font = `11px ${F.mono}`;
    [...sel].forEach((e) => {
      yy += 20; ctx.fillStyle = ENZ[e].col; ctx.fillText(`${e}: ${D.sites[e] ? D.sites[e].length + "곳" : "다루지 않음"}`, lx, yy);
      if (D.sites[e] && D.circ) { yy += 15; ctx.fillStyle = C.ink2; ctx.fillText(D.sites[e].join(", "), lx + 10, yy); }
    });
    yy += 26; ctx.fillStyle = C.ink2;
    const n = sitesOf(D, [...sel]).length;
    ctx.fillText(`자리 ${n}곳 → 완전 절단 시 조각 ${D.circ ? Math.max(1, n) : n + 1}개`, lx, Math.min(yy, h - 10));
  }

  function drawGel() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const gx = 34, gy = 30, gw = w - 48, gh = h - 44, Y = (d) => gy + 10 + d / 7.3 * (gh - 16);
    ctx.fillStyle = "#1f2a33"; ctx.fillRect(gx, gy, gw, gh);
    const all = [{ short: "M", bands: LADDER.map((bp) => ({ bp, d: dist(bp), m: 0.09, n: 1 })) }, ...lanes];
    const lw = gw / 8;
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "right";
    [10000, 5000, 2000, 1000, 500, 250].forEach((bp) => ctx.fillText(bp >= 1000 ? bp / 1000 + "k" : String(bp), gx - 4, Y(dist(bp)) + 3));
    all.forEach((ln, i) => {
      const x = gx + i * lw + lw * 0.18, bw = lw * 0.64;
      ctx.fillStyle = "#0e1418"; ctx.fillRect(x, gy + 4, bw, 5);
      ln.bands.forEach((b) => {
        const a = clamp(Math.sqrt(b.m * 6), 0.12, 1), y = Y(b.d);
        ctx.fillStyle = `rgba(255,190,90,${a})`; ctx.fillRect(x, y - 1.6, bw, 3.2);
      });
      ctx.save(); ctx.translate(x + bw / 2, gy - 6); ctx.fillStyle = C.ink2; ctx.textAlign = "center"; ctx.font = `10px ${F.mono}`;
      ctx.fillText(ln.short, 0, 0); ctx.restore();
    });
    if (!lanes.length) { ctx.fillStyle = "rgba(255,255,255,.5)"; ctx.textAlign = "center"; ctx.font = `12px ${F.sans}`; ctx.fillText("반응시킨 시료가 여기에 걸립니다", gx + gw * 0.56, gy + gh / 2); }
  }

  const syncEnz = () => root.querySelectorAll("[data-e]").forEach((b) => b.setAttribute("aria-pressed", String(sel.has(b.dataset.e))));
  root.querySelector(".enz").addEventListener("click", (e) => { const b = e.target.closest("[data-e]"); if (!b) return; const k = b.dataset.e; sel.has(k) ? sel.delete(k) : sel.add(k); syncEnz(); drawSeq(); drawMap(); });
  root.querySelector(".dna").addEventListener("click", (e) => { const b = e.target.closest("[data-d]"); if (!b) return; dna = b.dataset.d; root.querySelectorAll("[data-d]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); drawMap(); });
  $(".t").addEventListener("input", () => { $(".t-out").textContent = $(".t").value; });
  $(".check").addEventListener("click", () => {
    const D = DNA[dna], enz = [...sel].filter((e) => D.sites[e]);
    const want = full(D, enz), got = ($(".pred").value.match(/\d[\d,]*/g) || []).map((s) => +s.replace(/,/g, "")).filter((x) => x > 0).sort((a, b) => b - a);
    if (!got.length) { msg("예상 조각 크기를 숫자로 적어 주세요."); return; }
    const ok = got.length === want.length && got.every((x, i) => Math.abs(x - want[i]) <= want[i] * 0.02 + 5);
    msg(ok ? `맞습니다. ${D.name}을(를) ${enz.join("+") || "효소 없이"} 처리하면 ${want.length}조각이 생깁니다. 이제 전기 영동으로 확인하세요.` : got.length !== want.length ? `조각 수가 다릅니다. 자리 수와 DNA가 원형인지 선형인지 다시 생각해 보세요.` : `조각 수는 맞지만 크기가 다릅니다. 이웃한 자리 사이의 거리를 다시 계산해 보세요(합은 ${D.len.toLocaleString()} bp).`);
  });
  $(".run").addEventListener("click", react);
  $(".clear").addEventListener("click", () => { lanes = []; laneNo = 0; tbl.clear(); drawGel(); });
  drawSeq(); drawMap();

  if (L.demo) {
    const set = (d, es, t, heat) => { dna = d; sel = new Set(es); $(".t").value = t; $(".heat").checked = !!heat; react(); };
    set("p", [], 60); set("p", ["EcoRI"], 60); set("p", ["EcoRI"], 60, true); set("p", ["HindIII"], 60); set("p", ["EcoRI", "HindIII"], 60); set("p", ["EcoRI", "HindIII"], 10); set("l", ["HindIII"], 60);
    $(".heat").checked = false; $(".t").value = 60;
    dna = "p"; sel = new Set(["EcoRI", "HindIII"]); syncEnz(); root.querySelectorAll("[data-d]").forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.d === "p")));
    $(".pred").value = "2484, 776, 740"; drawSeq(); drawMap(); $(".check").click();
  }
})();
