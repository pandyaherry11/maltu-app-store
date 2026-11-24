/* ================= Maltu App Store ================= */
const APPS = [
  {
    id: "maltu-tools",
    name: "Maltu Tools",
    cat: "utility",
    icon: "🛠️",
    desc: "All-in-one toolbox: music player, video to audio, video to images and more. Built in Android Studio.",
    version: "1.0.0",
    size: "13 MB",
    url: "assets/apps/maltu-tools.apk"
  },
  {
    id: "music-player",
    name: "Maltu Music Player",
    cat: "music",
    icon: "🎵",
    desc: "Lightweight offline music player with playlists, equalizer and sleep timer.",
    version: "1.2.0",
    size: "8 MB",
    url: "assets/apps/music-player.apk"
  },
  {
    id: "video-to-audio",
    name: "Video to Audio Converter",
    cat: "video",
    icon: "🎧",
    desc: "Convert any video (MP4/MKV/AVI) to MP3/AAC/WAV audio in one tap.",
    version: "1.0.4",
    size: "12 MB",
    url: "assets/apps/video-to-audio.apk"
  },
  {
    id: "video-to-images",
    name: "Video to Images",
    cat: "image",
    icon: "🖼️",
    desc: "Extract frames from a video and save as JPG/PNG images.",
    version: "1.1.0",
    size: "9 MB",
    url: "assets/apps/video-to-images.apk"
  },
  {
    id: "audio-trimmer",
    name: "Audio Trimmer",
    cat: "music",
    icon: "✂️",
    desc: "Trim, fade and export audio clips quickly.",
    version: "1.0.1",
    size: "6 MB",
    url: "assets/apps/audio-trimmer.apk"
  },
  {
    id: "image-compressor",
    name: "Image Compressor",
    cat: "image",
    icon: "🗜️",
    desc: "Compress images without visible quality loss. Batch support.",
    version: "1.3.0",
    size: "7 MB",
    url: "assets/apps/image-compressor.apk"
  },
  {
    id: "file-converter",
    name: "Universal File Converter",
    cat: "utility",
    icon: "🔄",
    desc: "Convert between common file formats on device.",
    version: "1.0.0",
    size: "15 MB",
    url: "assets/apps/file-converter.apk"
  }
];

const grid = document.getElementById("apps-grid");
const empty = document.getElementById("empty");
const search = document.getElementById("search");
const catBtns = document.querySelectorAll(".cat-btn");
const modal = document.getElementById("modal");
const modalBackdrop = document.getElementById("modal-backdrop");
const modalClose = document.getElementById("modal-close");
const modalTitle = document.getElementById("modal-title");
const modalApp = document.getElementById("modal-app");
const modalEmail = document.getElementById("modal-email");
const modalStatus = document.getElementById("modal-status");
const downloadForm = document.getElementById("download-form");
const toast = document.getElementById("toast");

let currentApp = null;
let activeCat = "all";

function renderApps() {
  const q = (search.value || "").toLowerCase().trim();
  const filtered = APPS.filter(a => {
    const catOk = activeCat === "all" || a.cat === activeCat;
    const qOk = !q || a.name.toLowerCase().includes(q) || a.desc.toLowerCase().includes(q) || a.cat.includes(q);
    return catOk && qOk;
  });
  grid.innerHTML = "";
  if (filtered.length === 0) { empty.hidden = false; return; }
  empty.hidden = true;
  filtered.forEach(a => {
    const card = document.createElement("article");
    card.className = "app-card reveal";
    card.innerHTML = `
      <div class="app-icon">${a.icon}</div>
      <div>
        <p class="app-cat">${a.cat}</p>
        <h3 class="app-name">${escapeHtml(a.name)}</h3>
        <p class="app-desc">${escapeHtml(a.desc)}</p>
      </div>
      <div class="app-meta">
        <span>v${escapeHtml(a.version)}</span>
        <span>${escapeHtml(a.size)}</span>
        <span>Android</span>
      </div>
      <div class="app-actions">
        <button class="btn btn-primary" data-id="${a.id}">Download</button>
      </div>
    `;
    grid.appendChild(card);
  });
  document.getElementById("app-count").textContent = APPS.length;
  // reveal
  requestAnimationFrame(() => {
    document.querySelectorAll(".reveal").forEach(el => {
      const io = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
      }, { threshold: 0.12 });
      io.observe(el);
    });
  });
  // bind download buttons
  grid.querySelectorAll("button[data-id]").forEach(btn => {
    btn.addEventListener("click", () => openModal(btn.dataset.id));
  });
}

function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

function openModal(id) {
  currentApp = APPS.find(a => a.id === id);
  if (!currentApp) return;
  modalTitle.textContent = "Download " + currentApp.name;
  modalApp.textContent = currentApp.name + " · v" + currentApp.version;
  modalEmail.value = localStorage.getItem("maltu_email") || "";
  modalStatus.textContent = "";
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  setTimeout(() => modalEmail.focus(), 50);
}

function closeModal() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  currentApp = null;
}

modalBackdrop.addEventListener("click", closeModal);
modalClose.addEventListener("click", closeModal);
document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });

downloadForm.addEventListener("submit", e => {
  e.preventDefault();
  const email = modalEmail.value.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    modalStatus.textContent = "Please enter a valid email.";
    return;
  }
  localStorage.setItem("maltu_email", email);
  // record download (local log)
  const log = JSON.parse(localStorage.getItem("maltu_downloads") || "[]");
  log.push({ app: currentApp.id, email, ts: Date.now() });
  localStorage.setItem("maltu_downloads", JSON.stringify(log));
  // trigger download
  const a = document.createElement("a");
  a.href = currentApp.url;
  a.download = currentApp.id + ".apk";
  document.body.appendChild(a);
  a.click();
  a.remove();
  showToast("Download started for " + currentApp.name);
  closeModal();
});

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2600);
}

// category filter
catBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    catBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    activeCat = btn.dataset.cat;
    renderApps();
  });
});
search.addEventListener("input", renderApps);

// theme toggle
const themeToggle = document.getElementById("theme-toggle");
const root = document.documentElement;
const savedTheme = localStorage.getItem("theme");
if (savedTheme) root.setAttribute("data-theme", savedTheme);
themeToggle.addEventListener("click", () => {
  const cur = root.getAttribute("data-theme");
  const next = cur === "dark" ? "light" : "dark";
  root.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
  themeToggle.setAttribute("aria-pressed", next === "dark");
});

// mobile menu
const menuToggle = document.getElementById("menu-toggle");
const nav = document.getElementById("nav");
menuToggle.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", open);
});

// reveal on scroll
const io = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
}, { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach(el => io.observe(el));

// year
document.getElementById("year").textContent = new Date().getFullYear();

renderApps();
