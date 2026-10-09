/* 절 소개의 '먼저 알면 좋은 것': 중학교 개념 버튼(.p-basic)을 누르면 basics/<id>.html 설명 카드를 창으로 띄운다.
   고등 개념은 build.py가 이미 카드 링크(.p-card)로 바꿔 두었다. */
(() => {
  "use strict";
  const btns = document.querySelectorAll(".prereq .p-basic");
  if (!btns.length) return;
  const dlg = document.createElement("dialog");
  dlg.className = "basic-card";
  dlg.innerHTML = `<header><span class="mono">중학교 개념</span><h2></h2><button type="button" class="basic-x" aria-label="닫기">×</button></header><div class="basic-body"></div>`;
  document.body.appendChild(dlg);
  const title = dlg.querySelector("h2"), body = dlg.querySelector(".basic-body");
  dlg.querySelector(".basic-x").addEventListener("click", () => dlg.close());
  dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });
  const cache = new Map();
  async function open(id, label) {
    title.textContent = label;
    body.innerHTML = `<p class="dim">불러오는 중…</p>`;
    dlg.showModal();
    try {
      if (!cache.has(id)) {
        const r = await fetch(`../../basics/${id}.html`);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        cache.set(id, await r.text());
      }
      const html = cache.get(id), head = /<!--basic\s*([\s\S]*?)-->/.exec(html);
      if (head) title.textContent = JSON.parse(head[1]).title || label;
      body.innerHTML = html.replace(/<!--basic[\s\S]*?-->/, "");
      if (window.NMMath) NMMath.render(body);
    } catch (e) {
      console.error("설명 카드를 불러오지 못함", id, e);
      body.innerHTML = `<p>설명을 불러오지 못했습니다. 인터넷 연결을 확인해 주세요.</p>`;
    }
  }
  btns.forEach((b) => b.addEventListener("click", () => open(b.dataset.basic, b.textContent.trim())));
})();
