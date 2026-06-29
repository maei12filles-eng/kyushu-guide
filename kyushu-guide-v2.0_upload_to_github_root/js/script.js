const DATA = window.TRIP_DATA;

const qs = (selector, root = document) => root.querySelector(selector);
const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];

function renderFlights() {
  qs("#flight-grid").innerHTML = DATA.flights.map(flight => `
    <div class="flight">
      <div class="flight-code">${flight.code}</div>
      <div class="flight-route">${flight.route}</div>
      <div class="flight-times">
        <div><div class="big">${flight.depart}</div><div class="small">${flight.from}</div></div>
        <div>→</div>
        <div><div class="big">${flight.arrive}</div><div class="small">${flight.to}</div></div>
      </div>
    </div>
  `).join("");
}

function renderStays() {
  qs("#stay-grid").innerHTML = DATA.stays.map(stay => `
    <article class="hotel-card" id="${stay.id}">
      <div class="hotel-title">🏡 ${stay.title}</div>
      <div class="hotel-address">${stay.addr}</div>
      <div class="hotel-actions">
        <a class="btn" target="_blank" rel="noopener" href="${stay.map}">Google Maps</a>
        <a class="btn airbnb" target="_blank" rel="noopener" href="${stay.airbnb}">Airbnb</a>
      </div>
      <div class="hotel-gallery" aria-label="${stay.name} 房型照片">
        ${stay.photos.map((photo, index) => `
          <button class="hotel-thumb" type="button" data-hotel="${stay.id}" data-index="${index}">
            ${photo.src ? `<img src="${photo.src}" alt="${photo.label}" loading="lazy"><span class="thumb-label">${photo.label}</span>` : `<span>${photo.label}</span><small>${photo.hint || ""}</small>`}
          </button>
        `).join("")}
      </div>
      <details>
        <summary>🏡 住宿指南</summary>
        <div class="tips">
          <div class="guide-grid">
            <section class="guide-section">
              <h4>📅 入住資訊</h4>
              <div class="info-table">
                <div>Check-in</div><div>${stay.guide.checkin}</div>
                <div>Check-out</div><div>${stay.guide.checkout}</div>
                <div>平台</div><div>${stay.guide.platform}</div>
                ${stay.guide.order && stay.guide.order !== "不顯示" ? `<div>訂單編號</div><div>${stay.guide.order}</div>` : ``}
              </div>
            </section>
            <section class="guide-section">
              <h4>🔑 入住提醒</h4>
              <div class="info-table">
                <div>門鎖密碼</div><div>${stay.guide.lock}</div>
                <div>停車</div><div>${stay.guide.parking}</div>
              </div>
            </section>
            <section class="guide-section">
              <h4>🛒 周邊生活</h4>
              <div class="nearby">
                ${stay.guide.nearby.map(([type, name, url]) => `<a class="btn light" target="_blank" rel="noopener" href="${url}">${type}｜${name}</a>`).join("")}
              </div>
            </section>
            <section class="guide-section">
              <h4>✨ 住宿特色</h4>
              <div class="chips">${stay.guide.features.map(item => `<span class="chip">${item}</span>`).join("")}</div>
            </section>
          </div>
        </div>
      </details>
    </article>
  `).join("");
}

function renderOverview() {
  qs("#overview-grid").innerHTML = DATA.days.map((day, index) => `
    <a class="daylink" href="#${day.id}">
      <div class="d">D${index + 1}</div>
      <div class="route">${day.route}</div>
      <div class="hotel">${day.id === "day8" ? "✈️" : "🏡"} ${day.stay}</div>
    </a>
  `).join("");
}

function renderDays() {
  qs("#days-container").innerHTML = DATA.days.map(day => `
    <article id="${day.id}" class="day">
      <div class="day-head">
        <small>${day.day}</small>
        <h2>${day.title}</h2>
        <div class="meta">${day.id === "day8" ? "✈️" : "🏡"} 住宿：${day.stay}</div>
      </div>
      <div class="day-body">
        <div class="timeline">
          ${day.timeline.map(([time, text]) => `<div class="item"><div class="time">${time}</div><div class="text">${text}</div></div>`).join("")}
        </div>
        <div class="buttons">
          ${day.buttons.map(([text, url, style]) => `<a class="btn ${style || "primary"}" target="_blank" rel="noopener" href="${url}">${text}</a>`).join("")}
        </div>
        ${day.tips.map(([title, items]) => `
          <details>
            <summary>${title}（點我展開）</summary>
            <div class="tips"><ul>${items.map(item => `<li>${item}</li>`).join("")}</ul></div>
          </details>
        `).join("")}
      </div>
    </article>
  `).join("");
}

function initMenu() {
  const nav = qs("#nav");
  const links = qsa('#nav a[href^="#"]');
  const getSections = () => links.map(link => ({ link, target: qs(link.getAttribute("href")) })).filter(item => item.target);

  function setActive(link) {
    links.forEach(item => item.classList.remove("active"));
    link.classList.add("active");
    const left = link.offsetLeft - nav.clientWidth / 2 + link.clientWidth / 2;
    nav.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
  }

  function scrollToTarget(link) {
    const target = qs(link.getAttribute("href"));
    if (!target) return;
    setActive(link);
    const top = target.getBoundingClientRect().top + window.scrollY - nav.offsetHeight - 12;
    window.scrollTo({ top, behavior: "smooth" });
    history.replaceState(null, "", link.getAttribute("href"));
  }

  function updateActive() {
    const y = window.scrollY + nav.offsetHeight + 16;
    let current = getSections()[0];
    for (const item of getSections()) {
      if (item.target.offsetTop <= y) current = item;
      else break;
    }
    if (current) setActive(current.link);
  }

  links.forEach(link => {
    link.addEventListener("click", event => {
      event.preventDefault();
      scrollToTarget(link);
      setTimeout(() => setActive(link), 80);
      setTimeout(updateActive, 700);
    });
  });

  let ticking = false;
  window.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateActive();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  window.addEventListener("resize", updateActive);
  updateActive();
}

function initChecklist() {
  qsa('input[type="checkbox"]').forEach((box, index) => {
    const key = `kyushu_v20_check_${index}`;
    box.checked = localStorage.getItem(key) === "1";
    box.addEventListener("change", () => localStorage.setItem(key, box.checked ? "1" : "0"));
  });
}

function initGallery() {
  const lightbox = qs("#lightbox");
  const img = qs("#lightbox-img");
  const caption = qs("#lightbox-caption");
  const close = qs(".lightbox-close");

  qsa(".hotel-thumb").forEach(button => {
    button.addEventListener("click", () => {
      const hotel = DATA.stays.find(stay => stay.id === button.dataset.hotel);
      const photo = hotel.photos[Number(button.dataset.index)];
      img.innerHTML = photo.src ? `<img src="${photo.src}" alt="${photo.label}">` : photo.label;
      caption.textContent = `${hotel.name}｜${photo.label}`;
      lightbox.classList.add("open");
      lightbox.setAttribute("aria-hidden", "false");
    });
  });

  function closeLightbox() {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
  }

  close.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", event => {
    if (event.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeLightbox();
  });
}

function init() {
  renderFlights();
  renderStays();
  renderOverview();
  renderDays();
  initMenu();
  initChecklist();
  initGallery();
}

document.addEventListener("DOMContentLoaded", init);

