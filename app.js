import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBh3emVSH8gOiw_Enaqadwc2_Q_VOgUQiM",
  authDomain: "lloyd-mc.firebaseapp.com",
  projectId: "lloyd-mc",
  storageBucket: "lloyd-mc.firebasestorage.app",
  messagingSenderId: "478565173797",
  appId: "1:478565173797:web:f06650982b45f122258dcc"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const grid = document.getElementById("contentGrid");
const searchInput = document.getElementById("searchInput");
const categoryButtons = document.querySelectorAll(".category");

let contents = [];
let selectedCategory = "All";

async function loadContents() {
  try {
    const q = query(
      collection(db, "contents"),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);

    contents = snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .filter(item => item.published === true);

    renderContents();

  } catch (error) {
    console.error(error);

    // Tetap coba membaca data jika createdAt belum ada
    try {
      const snapshot = await getDocs(collection(db, "contents"));

      contents = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(item => item.published === true);

      renderContents();

    } catch (err) {
      grid.innerHTML = `
        <div class="empty">
          Gagal memuat konten.
        </div>
      `;
    }
  }
}

function renderContents() {
  const search = searchInput.value.toLowerCase().trim();

  const filtered = contents.filter(item => {
    const matchCategory =
      selectedCategory === "All" ||
      item.category === selectedCategory;

    const text =
      `${item.title || ""} ${item.description || ""} ${item.category || ""}`
        .toLowerCase();

    const matchSearch = text.includes(search);

    return matchCategory && matchSearch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty">
        Tidak ada konten ditemukan.
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(item => `
    <article class="card">

      ${
        item.thumbnail
          ? `<img class="card-image"
              src="${escapeHTML(item.thumbnail)}"
              alt="${escapeHTML(item.title || "Minecraft content")}"
              loading="lazy">`
          : `<div class="card-image"></div>`
      }

      <div class="card-body">

        <div class="card-category">
          ${escapeHTML(item.category || "Lainnya")}
        </div>

        <h2>${escapeHTML(item.title || "Untitled")}</h2>

        <p>
          ${escapeHTML(item.description || "Tidak ada deskripsi.")}
        </p>

        <div class="card-info">
          <span>${escapeHTML(item.version || "1.26+")}</span>
          <span>${formatDate(item.createdAt)}</span>
        </div>

        ${
          item.downloadUrl
            ? `<a class="download"
                href="${escapeHTML(item.downloadUrl)}"
                target="_blank"
                rel="noopener noreferrer">
                Download
              </a>`
            : ""
        }

      </div>
    </article>
  `).join("");
}

categoryButtons.forEach(button => {
  button.addEventListener("click", () => {

    categoryButtons.forEach(btn =>
      btn.classList.remove("active")
    );

    button.classList.add("active");

    selectedCategory = button.dataset.category;

    renderContents();
  });
});

searchInput.addEventListener("input", renderContents);

function formatDate(timestamp) {
  if (!timestamp) return "Terbaru";

  try {
    const date = timestamp.toDate
      ? timestamp.toDate()
      : new Date(timestamp);

    return date.toLocaleDateString("id-ID");
  } catch {
    return "Terbaru";
  }
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

loadContents();
