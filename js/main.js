// ===== عدّل البيانات دي / Edit these =====
const WHATSAPP_NUMBER = "201501508258"; // رقم الواتساب بالصيغة الدولية بدون + (مثال: 201012345678)
// =========================================

const LANG = document.documentElement.lang.startsWith("en") ? "en" : "ar";
const T = {
  ar: {
    hello: "مرحبًا دكتور هيثم، حابب أستفسر عن حجز موعد.",
    title: "طلب حجز موعد", name: "الاسم", phone: "الموبايل", type: "نوع المشكلة", day: "اليوم المفضل", details: "تفاصيل"
  },
  en: {
    hello: "Hello Dr. Haitham, I'd like to ask about booking an appointment.",
    title: "Appointment request", name: "Name", phone: "Mobile", type: "Concern", day: "Preferred day", details: "Details"
  }
}[LANG];

const waLink = (text) => `https://wa.me/${WHATSAPP_NUMBER}` + (text ? `?text=${encodeURIComponent(text)}` : "");
document.querySelectorAll("[data-wa]").forEach(a => { a.href = waLink(T.hello); a.target = "_blank"; a.rel = "noopener"; });

// Language switch: keep the visitor on the same section
document.querySelectorAll("[data-lang-switch]").forEach(a => a.addEventListener("click", () => {
  const ids = ["booking", "faq", "center", "approach", "services", "about"];
  const current = ids.find(id => { const el = document.getElementById(id); return el && el.getBoundingClientRect().top < innerHeight * 0.4; });
  if (current) a.href = a.getAttribute("href").split("#")[0] + "#" + current;
}));

// Nav
const nav = document.getElementById("nav"), menuBtn = document.getElementById("menuBtn");
const onScroll = () => nav.classList.toggle("scrolled", scrollY > 30);
addEventListener("scroll", onScroll, { passive: true }); onScroll();
menuBtn.addEventListener("click", () => { const o = nav.classList.toggle("open"); menuBtn.setAttribute("aria-expanded", o); });
document.querySelectorAll("#links a").forEach(a => a.addEventListener("click", () => { nav.classList.remove("open"); menuBtn.setAttribute("aria-expanded", false); }));

// Reveal on scroll
const io = "IntersectionObserver" in window ? new IntersectionObserver((es) => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .12, rootMargin: "0px 0px -40px 0px" }) : null;
document.querySelectorAll(".reveal").forEach((el, i) => { if (io) { el.style.transitionDelay = (el.closest(".svc-grid,.steps") ? (i % 3) * 80 : 0) + "ms"; io.observe(el); } else el.classList.add("in"); });

// Booking form -> WhatsApp
document.getElementById("bookForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const f = e.target, name = f.name.value.trim(), phone = f.phone.value.trim();
  if (!name) { f.name.focus(); f.name.reportValidity?.(); return; }
  if (!phone) { f.phone.focus(); f.phone.reportValidity?.(); return; }
  const lines = [T.title, `${T.name}: ${name}`, `${T.phone}: ${phone}`, `${T.type}: ${f.type.value}`, `${T.day}: ${f.day.value}`];
  if (f.msg.value.trim()) lines.push(`${T.details}: ${f.msg.value.trim()}`);
  window.open(waLink(lines.join("\n")), "_blank", "noopener");
});

document.getElementById("year").textContent = new Date().getFullYear();

// FAQ category filter
const faqTabs = document.querySelectorAll(".faq-tab");
faqTabs.forEach(tab => tab.addEventListener("click", () => {
  const f = tab.dataset.filter;
  faqTabs.forEach(t => t.setAttribute("aria-pressed", t === tab));
  document.querySelectorAll(".faq-list details").forEach(d => {
    const show = f === "all" || d.dataset.cat === f;
    d.hidden = !show;
    if (!show) d.open = false;
  });
}));

// Center gallery lightbox
const lb = document.getElementById("lightbox");
if (lb) {
  const shots = [...document.querySelectorAll(".gallery-data a")].map(a => ({ src: a.getAttribute("href"), cap: a.dataset.caption }));
  const img = lb.querySelector("img"), cap = lb.querySelector(".lb-cap"), count = lb.querySelector(".lb-count");
  let cur = 0;
  const show = (i) => {
    cur = (i + shots.length) % shots.length;
    img.src = shots[cur].src; img.alt = shots[cur].cap;
    cap.textContent = shots[cur].cap; count.textContent = `${cur + 1} / ${shots.length}`;
    const n = shots[(cur + 1) % shots.length]; if (n) new Image().src = n.src;
  };
  const open = (i) => { show(i); if (typeof lb.showModal === "function") lb.showModal(); else lb.setAttribute("open", ""); document.body.style.overflow = "hidden"; };
  const close = () => { if (lb.open) lb.close(); };
  lb.addEventListener("close", () => { document.body.style.overflow = ""; });
  document.querySelectorAll("[data-index]").forEach(b => b.addEventListener("click", () => open(+b.dataset.index)));
  lb.querySelector(".lb-close").addEventListener("click", close);
  lb.querySelector(".lb-next").addEventListener("click", () => show(cur + 1));
  lb.querySelector(".lb-prev").addEventListener("click", () => show(cur - 1));
  lb.addEventListener("click", (e) => { if (e.target === lb || e.target.tagName === "FIGURE") close(); });
  const rtl = document.documentElement.dir === "rtl";
  lb.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") show(cur + (rtl ? -1 : 1));
    if (e.key === "ArrowLeft") show(cur + (rtl ? 1 : -1));
  });
  let x0 = null;
  lb.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", (e) => {
    if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(dx) > 40) show(cur + ((dx < 0) !== rtl ? 1 : -1));
  });
}
