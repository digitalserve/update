// 🔥 Firebase config (same project as admin)
const firebaseConfig = {
  apiKey: "AIzaSyDmv9DFpld7X6-e2Aue6h3GYQgs_r1UJ1I",
  authDomain: "mini-playstore-3c2f2.firebaseapp.com",
  projectId: "mini-playstore-3c2f2"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const appsDiv = document.getElementById("apps");
const searchInput = document.getElementById("search");
const categoryBox = document.getElementById("categories");

let allApps = [];
let selectedCategory = "All";

// ---------------- LOAD DATA ----------------
db.collection("apps").onSnapshot(snapshot => {
  allApps = [];

  snapshot.forEach(doc => {
    const app = doc.data();
    app.id = doc.id;
    allApps.push(app);
  });

  renderCategories();
  renderApps(allApps);
});

// ---------------- RENDER CATEGORIES ----------------
function renderCategories() {
  const cats = ["All", ...new Set(allApps.map(a => a.category))];
  categoryBox.innerHTML = "";

  cats.forEach(cat => {
    const div = document.createElement("div");
    div.className = "cat" + (cat === selectedCategory ? " active" : "");
    div.innerText = cat;

    div.onclick = () => {
      selectedCategory = cat;
      renderApps(allApps);
    };

    categoryBox.appendChild(div);
  });
}

// ---------------- SEARCH ----------------
searchInput.addEventListener("input", () => {
  renderApps(allApps);
});

// ---------------- RENDER APPS ----------------
function renderApps(list) {
  const query = searchInput.value.toLowerCase();
  appsDiv.innerHTML = "";

  list
    .filter(app => {
      const matchSearch =
        app.name.toLowerCase().includes(query) ||
        (app.category || "").toLowerCase().includes(query);

      const matchCat =
        selectedCategory === "All" || app.category === selectedCategory;

      return matchSearch && matchCat;
    })
    .forEach(app => createCard(app));
}

// ---------------- APP CARD ----------------
function createCard(app) {
  const card = document.createElement("div");
  card.className = "card";

  card.innerHTML = `
    <img src="${app.icon || 'https://via.placeholder.com/70'}">
    <div class="info">
      <div class="title">${app.name}</div>
      <div class="meta">
        Version: ${app.versionName}<br>
        Category: ${app.category || "General"}
      </div>
      <button onclick="downloadApp('${app.apkUrl}', '${app.id}')">
        Download
      </button>
    </div>
  `;

  appsDiv.appendChild(card);
}

// ---------------- DOWNLOAD + COUNT ----------------
function downloadApp(url, appId) {
  db.collection("apps").doc(appId).update({
    downloads: firebase.firestore.FieldValue.increment(1)
  });

  window.location.href = url;
}
