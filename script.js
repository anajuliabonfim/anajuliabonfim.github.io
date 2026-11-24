(() => {
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
let lang = "en", filter = "all", typeTimer;
try { lang = localStorage.getItem("ab-lang") || "en"; } catch (e) {}

// glow follows the pointer
const glow = $("#glow");
addEventListener("pointermove", e => { glow.style.transform = `translate3d(${e.clientX}px,${e.clientY}px,0)`; }, {passive:true});

// typing effect
function typeRole() {
  clearTimeout(typeTimer); const el = $("#role"), txt = CONTENT[lang].role; let i = 0;
  if (reduce) { el.textContent = txt; return; }
  const step = () => { el.textContent = txt.slice(0, ++i); if (i < txt.length) typeTimer = setTimeout(step, 45); };
  el.textContent = ""; step();
}

// terminal
const screen = $("#screen");
function print(cls, text) { const p = document.createElement("p"); p.className = cls; p.textContent = text; screen.appendChild(p); screen.scrollTop = screen.scrollHeight; }
function run(raw) {
  const c = raw.trim().toLowerCase(); if (!c) return;
  print("cmd", "$ " + c);
  if (c === "clear") { screen.innerHTML = ""; return; }
  const out = CONTENT[lang].cmds[c]; print(out ? "out" : "dim", out || CONTENT[lang].unknown(c));
}
function bootTerm() {
  screen.innerHTML = ""; print("dim", CONTENT[lang].hello); run("help");
  $("#chips").innerHTML = Object.keys(CONTENT[lang].cmds).filter(k => k !== "help").concat("help", "clear").map(k => `<button type="button" data-c="${esc(k)}">${esc(k)}</button>`).join("");
}
$("#chips").addEventListener("click", e => { const b = e.target.closest("button"); if (b) run(b.dataset.c); });
$("#tf").addEventListener("submit", e => { e.preventDefault(); run($("#ti").value); $("#ti").value = ""; });

// stack filter
function renderStack() {
  const g = CONTENT[lang].g;
  $("#filters").innerHTML = [["all", CONTENT[lang].all], ["fe", g.fe], ["uni", g.uni], ["flow", g.flow]].map(([k, l]) => `<button type="button" data-f="${k}" aria-pressed="${k === filter}">${esc(l)}</button>`).join("");
  $("#tiles").innerHTML = STACK.map(([s, n, grp]) => `<div class="tile${filter !== "all" && filter !== grp ? " off" : ""}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${ICONS[s]}"/></svg>${esc(n)}</div>`).join("");
}
$("#filters").addEventListener("click", e => { const b = e.target.closest("button"); if (b) { filter = b.dataset.f; renderStack(); } });

// language switch
function setLang(l) {
  lang = l; document.documentElement.lang = l === "pt" ? "pt-BR" : "en";
  try { localStorage.setItem("ab-lang", l); } catch (e) {}
  $("#pt").setAttribute("aria-pressed", l === "pt"); $("#en").setAttribute("aria-pressed", l === "en");
  $$("[data-t]").forEach(el => { const v = CONTENT[l][el.dataset.t]; if (typeof v === "string") el.textContent = v; });
  $$("[data-en]").forEach(el => { el.textContent = el.dataset[l]; });
  const ph = document.querySelector(".photo img"); if (ph) ph.alt = l === "pt" ? "Foto de Ana Júlia Bonfim" : "Photo of Ana Júlia Bonfim";
  typeRole(); bootTerm(); renderStack();
}
$("#pt").addEventListener("click", () => setLang("pt"));
$("#en").addEventListener("click", () => setLang("en"));

// card tilt
$$(".tilt").forEach(card => {
  card.addEventListener("pointermove", e => {
    const r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    card.style.setProperty("--x", x * 100 + "%"); card.style.setProperty("--y", y * 100 + "%");
    if (!reduce) card.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 6}deg) rotateY(${(x - 0.5) * 8}deg)`;
  });
  card.addEventListener("pointerleave", () => { card.style.transform = ""; });
});

// reveal on scroll
function countUp(el) {
  const end = +el.dataset.n, k = el.dataset.s === "k", dec = lang === "pt" ? "," : ".", t0 = performance.now(), dur = reduce ? 0 : 1200;
  const fmt = v => k ? v.toFixed(1).replace(".", dec) + (lang === "pt" ? " mil" : "k") : Math.round(v);
  const tick = now => { const p = dur ? Math.min(1, (now - t0) / dur) : 1; el.textContent = fmt(end * (1 - (1 - p) ** 3)); if (p < 1) requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
}
const io = new IntersectionObserver(entries => entries.forEach(en => {
  if (!en.isIntersecting) return; en.target.classList.add("in");
  en.target.querySelectorAll("[data-n]").forEach(countUp);
  en.target.querySelectorAll("[data-w]").forEach(i => i.style.width = i.dataset.w + "%");
  io.unobserve(en.target);
}), {threshold: .2});
$$(".rv").forEach(s => io.observe(s));

// copy email
const toast = $("#toast");
function show(msg) { toast.textContent = msg; toast.classList.add("on"); setTimeout(() => toast.classList.remove("on"), 2200); }
$("#copy").addEventListener("click", async () => { try { await navigator.clipboard.writeText("anajuliaabonfim@gmail.com"); show(CONTENT[lang].copied); } catch (e) { show(CONTENT[lang].copyfail); } });

setLang(lang);
})();
