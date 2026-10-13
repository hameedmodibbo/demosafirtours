/* ==========================================================
   CONFIGURATION
   Add the business's real WhatsApp number here, digits only,
   with country code and no "+" or spaces. Example: "923001234567".
   While this is empty, the WhatsApp button shows a demo message
   instead of opening a link.
   ========================================================== */
const WHATSAPP_NUMBER = "923555322759";

(function () {
  "use strict";
  document.documentElement.classList.add("js");
  const $ = (s, c = document) => c.querySelector(s);

  /* Images: if a photo file is missing, remove it so the
     illustrated fallback scene behind it shows instead. */
  document.querySelectorAll(".scene img").forEach((img) => {
    img.addEventListener("error", () => img.remove());
  });

  /* Navigation: solid on scroll, mobile menu */
  const nav = $("#nav"), toggle = $("#navToggle"), menu = $("#menu");
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 40);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const setMenu = (open) => {
    menu.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", open);
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.style.overflow = open ? "hidden" : "";
  };
  toggle.addEventListener("click", () => setMenu(!menu.classList.contains("open")));
  menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menu.classList.contains("open")) { setMenu(false); toggle.focus(); }
  });

  /* Scroll reveal */
  const items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    items.forEach((el) => io.observe(el));
  } else items.forEach((el) => el.classList.add("in"));

  /* Destination buttons preselect the form */
  const form = $("#inquiryForm"), result = $("#result");
  document.querySelectorAll("[data-dest]").forEach((btn) => {
    btn.addEventListener("click", () => {
      form.destination.value = btn.dataset.dest;
      showForm();
      $("#inquiry").scrollIntoView({ behavior: "smooth" });
      setTimeout(() => form.name.focus({ preventScroll: true }), 600);
    });
  });

  /* Form */
  form.date.min = new Date().toISOString().split("T")[0];
  const rules = {
    name: (v) => (v.trim().length >= 2 ? "" : "Enter your full name."),
    email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : "Enter a valid email, like name@example.com."),
    phone: (v) => (/^\+?[\d\s\-()]{7,18}$/.test(v.trim()) && v.replace(/\D/g, "").length >= 7 ? "" : "Enter a phone number with at least 7 digits."),
    destination: (v) => (v ? "" : "Choose a destination."),
    type: (v) => (v ? "" : "Choose a travel type."),
    date: (v) => (!v ? "Choose a departure date." : v < form.date.min ? "Choose a date from today onward." : ""),
    travelers: (v) => (Number.isInteger(+v) && +v >= 1 && +v <= 50 ? "" : "Enter a number between 1 and 50."),
  };
  const check = (name) => {
    const f = form[name], msg = rules[name](f.value), box = f.closest(".field");
    $("#" + name + "-err").textContent = msg;
    box.classList.toggle("invalid", !!msg);
    f.setAttribute("aria-invalid", !!msg);
    return !msg;
  };
  Object.keys(rules).forEach((n) => {
    form[n].addEventListener("blur", () => check(n));
    form[n].addEventListener("input", () => form[n].closest(".field").classList.contains("invalid") && check(n));
  });

  let message = "";
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const firstBad = Object.keys(rules).filter((n) => !check(n))[0];
    if (firstBad) { form[firstBad].focus(); return; }
    const d = new Date(form.date.value + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    const notes = form.notes.value.trim();
    message =
      "Hello Demu Safir Tours, I would like to plan a trip.\n\n" +
      `Name: ${form.name.value.trim()}\nEmail: ${form.email.value.trim()}\nPhone/WhatsApp: ${form.phone.value.trim()}\n` +
      `Destination: ${form.destination.value}\nTravel type: ${form.type.value}\nDeparture: ${d}\nTravelers: ${form.travelers.value}` +
      (notes ? `\nPreferences: ${notes}` : "");
    $("#summary").textContent = message;
    $("#waMsg").textContent = "";
    form.hidden = true; result.hidden = false; result.focus();
  });

  function showForm() { result.hidden = true; form.hidden = false; }
  $("#editBtn").addEventListener("click", () => { showForm(); form.name.focus(); });

  $("#waBtn").addEventListener("click", () => {
    const out = $("#waMsg");
    if (!/^\d{8,15}$/.test(WHATSAPP_NUMBER)) {
      out.textContent = "Demo mode: no business WhatsApp number is configured yet. Once the real number is added in script.js, this button will open WhatsApp with the message above.";
      return;
    }
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank", "noopener");
  });

  $("#year").textContent = new Date().getFullYear();
})();
