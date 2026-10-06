/* 카드: 우리나라 어디에서 어느 시대 화석이 나올까? — 화석 산지 지도, 시대 거르기, 바다·육지 고환경 추론, 한반도 지사 정리 */
(() => {
  const root = document.getElementById("card-earth-fossil-map");
  if (!root || !window.NMFossilMap) return;
  const { C, F, fit } = NM;
  const D = NMFossilMap, $ = (s) => root.querySelector(s);
  const ERA = ["고생대", "중생대", "신생대"], ECOL = ["#3a6fb0", "#3f9a5a", "#d08a1c"];
  const W = 124.0, E = 131.2, S = 33.0, N = 38.8, K = Math.cos(35.9 * Math.PI / 180);
  let era = -1, cur = -1, sum = false;
  const ans = new Map();
  const cv = $("canvas");
  const { ctx, size } = fit(cv, () => draw());
  const prj = () => {
    const { w, h } = size, sc = Math.min(w / ((E - W) * K), h / (N - S));
    const ox = (w - (E - W) * K * sc) / 2, oy = (h - (N - S) * sc) / 2;
    return { X: (lon) => ox + (lon - W) * K * sc, Y: (lat) => oy + (N - lat) * sc };
  };
  const vis = (s) => era < 0 || s.era === era;

  function draw() {
    const { w, h } = size; if (!w) return;
    const { X, Y } = prj();
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#dfe8ef"; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#f4f1e8"; ctx.strokeStyle = "#b9b3a2"; ctx.lineWidth = 0.8;
    D.land.forEach((p) => { ctx.beginPath(); for (let i = 0; i < p.length; i += 2) ctx[i ? "lineTo" : "moveTo"](X(p[i]), Y(p[i + 1])); ctx.closePath(); ctx.fill(); ctx.stroke(); });
    ctx.fillStyle = "#8aa2b6"; ctx.font = `italic 12px ${F.sans}`; ctx.textAlign = "center";
    ctx.fillText("동해", X(130.4), Y(37.6)); ctx.fillText("황해", X(124.9), Y(36.4)); ctx.fillText("남해", X(128.3), Y(33.9));
    /* 경위도 눈금 */
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "left";
    [34, 36, 38].forEach((la) => ctx.fillText(`${la}°N`, 4, Y(la) + 3));
    ctx.textAlign = "center"; [126, 128, 130].forEach((lo) => ctx.fillText(`${lo}°E`, X(lo), h - 5));
    /* 산지 */
    D.sites.forEach((s, i) => {
      if (!vis(s)) return;
      const x = X(s.lon), y = Y(s.lat), a = ans.get(i);
      if (sum) { ctx.fillStyle = s.env === "sea" ? "rgba(58,111,176,.22)" : "rgba(160,120,60,.25)"; ctx.beginPath(); ctx.arc(x, y, 15, 0, 7); ctx.fill(); }
      if (i === cur) { ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, 10, 0, 7); ctx.stroke(); }
      ctx.fillStyle = ECOL[s.era]; ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y, 6, 0, 7); ctx.fill(); ctx.stroke();
      if (a) { ctx.fillStyle = "#fff"; ctx.font = `700 9px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(a === s.env ? "✓" : "✕", x, y + 3); }
      ctx.font = `${i === cur ? 600 : 400} 11px ${F.sans}`; ctx.textAlign = s.lab[2];
      const lx = x + s.lab[0], ly = y + s.lab[1];
      ctx.lineWidth = 3; ctx.strokeStyle = "rgba(244,241,232,.9)"; ctx.strokeText(s.n, lx, ly); ctx.fillStyle = a && a !== s.env ? C.warn : C.ink; ctx.fillText(s.n, lx, ly);
    });
    /* 범례 (동해 쪽 빈 바다) */
    const lx = X(129.85), ly = Y(35.7);
    ctx.textAlign = "left"; ctx.font = `600 11px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.fillText("화석 산지의 시대", lx - 6, ly - 10);
    ERA.forEach((t, i) => { const y = ly + 8 + i * 18; ctx.fillStyle = ECOL[i]; ctx.globalAlpha = era < 0 || era === i ? 1 : 0.3; ctx.beginPath(); ctx.arc(lx, y, 5.5, 0, 7); ctx.fill(); ctx.fillStyle = C.ink2; ctx.font = `11px ${F.sans}`; ctx.fillText(t, lx + 11, y + 4); ctx.globalAlpha = 1; });
    if (sum) {
      [["rgba(58,111,176,.35)", "바다에서 쌓임"], ["rgba(160,120,60,.4)", "육지(호수·강·늪)"]].forEach(([c, t], i) => { const y = ly + 72 + i * 18; ctx.fillStyle = c; ctx.beginPath(); ctx.arc(lx, y, 7, 0, 7); ctx.fill(); ctx.fillStyle = C.ink2; ctx.fillText(t, lx + 11, y + 4); });
    }
    info();
  }
  function info() {
    const s = D.sites[cur], box = $(".site");
    const right = D.sites.filter((x, i) => ans.get(i) === x.env).length;
    $(".n-a").textContent = `${ans.size} / ${D.sites.length}`;
    $(".n-r").textContent = ans.size ? `${right}곳` : "—";
    $(".n-e").textContent = era < 0 ? "전체" : ERA[era];
    if (!s) { box.innerHTML = `<p class="small dim">지도에서 점을 눌러 화석 산지를 고르세요.</p>`; return; }
    const a = ans.get(cur);
    box.innerHTML = `<h4><i style="background:${ECOL[s.era]}"></i>${s.n}</h4>
      <dl><dt>시대</dt><dd>${s.age}</dd><dt>지층</dt><dd>${s.unit}</dd><dt>대표 화석</dt><dd>${s.fos}</dd>
      <dt>환경</dt><dd>${a ? (s.env === "sea" ? "바다" : "육지 (호수·강·늪)") + " · " + s.why : "이 지역 지층은 바다였을까, 육지였을까? 아래에서 골라 보세요."}</dd></dl>`;
  }
  const say = (t, cls) => { const v = $(".verdict"); v.textContent = t; v.className = "verdict small " + (cls || ""); };

  cv.addEventListener("click", (e) => {
    const r = cv.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top, { X, Y } = prj();
    let best = -1, bd = 16;
    D.sites.forEach((s, i) => { if (!vis(s)) return; const d = Math.hypot(X(s.lon) - px, Y(s.lat) - py); if (d < bd) { bd = d; best = i; } });
    if (best >= 0) { cur = best; say(""); draw(); }
  });
  $(".eras").addEventListener("click", (e) => {
    const b = e.target.closest("[data-e]"); if (!b) return;
    era = +b.dataset.e; root.querySelectorAll("[data-e]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    if (cur >= 0 && !vis(D.sites[cur])) cur = -1;
    draw();
  });
  $(".env").addEventListener("click", (e) => {
    const b = e.target.closest("[data-v]"); if (!b) return;
    if (cur < 0) { say("먼저 지도에서 화석 산지를 하나 고르세요."); return; }
    const s = D.sites[cur], ok = b.dataset.v === s.env;
    ans.set(cur, b.dataset.v);
    say(ok ? `맞습니다. ${s.why}` : `다시 생각해 보세요. ${s.env === "sea" ? "바다에 사는 생물의 화석이 나왔습니다. " : "발자국·알·식물은 물 밖이나 물가에서 생기는 흔적입니다. "}${s.why}`, ok ? "good" : "bad");
    if (ans.size === D.sites.length) setTimeout(() => { if (!sum) $(".sum").click(); }, 0);
    draw();
  });
  $(".sum").addEventListener("click", (e) => {
    sum = !sum; e.target.setAttribute("aria-pressed", String(sum));
    say(sum ? "한반도 지사: 고생대 전기에는 강원 남부가 따뜻하고 얕은 바다여서 석회암과 삼엽충이 쌓였습니다(조선 누층군). 고생대 후기에는 바다가 물러나며 늪에서 석탄이 생겼습니다(평안 누층군). 중생대 백악기에는 경상도와 전라남도 일대에 큰 호수와 강이 있어 공룡 발자국과 알이 남았습니다. 신생대에는 동해가 열리며 포항 일대가 바다 분지가 되었고, 제주도 둘레 얕은 바다에서 서귀포층이 쌓였습니다." : "", sum ? "good" : "");
    draw();
  });
  $(".clr").addEventListener("click", () => { ans.clear(); sum = false; $(".sum").setAttribute("aria-pressed", "false"); say(""); draw(); });
  draw();
  if (/[?&]demo\b/.test(location.search)) {
    cur = 0; root.querySelector('[data-v="sea"]').click();
    cur = 10; root.querySelector('[data-v="land"]').click();
    cur = 11; root.querySelector('[data-v="land"]').click();
    $(".sum").click(); cur = 11; draw();
  }
})();
