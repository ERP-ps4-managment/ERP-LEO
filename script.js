import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "PASTE_YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT.firebaseio.com",
    projectId: "YOUR_PROJECT",
    appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let currentRole = 'player';
let currentSection = 'callsigns';
let globalData = {};

// 1. Authentication
window.checkAuth = () => {
    const role = document.getElementById('roleSelect').value;
    const pass = document.getElementById('passInput').value;

    if ((role === 'player' && pass === 'ERP-leo') || (role === 'admin' && pass === 'pal1anth23')) {
        currentRole = role;
        document.getElementById('gatekeeper').style.display = 'none';
        document.getElementById('dashboard').style.display = 'flex';
        if (role === 'admin') {
            document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'block');
        }
        loadData();
    } else {
        document.getElementById('error-msg').innerText = "ACCESS DENIED";
    }
};

// 2. Data Sync
function loadData() {
    onValue(ref(db, 'leoData'), (snapshot) => {
        globalData = snapshot.val() || {};
        updateUI();
    });
}

window.showSection = (section) => {
    currentSection = section;
    updateUI();
};

function updateUI() {
    document.getElementById('sectionTitle').innerText = currentSection.toUpperCase();
    document.getElementById('displayArea').innerText = globalData[currentSection] || "No data assigned.";
    document.getElementById('editArea').style.display = 'none';
    document.getElementById('displayArea').style.display = 'block';
}

// 3. Admin Actions
window.toggleEdit = () => {
    document.getElementById('displayArea').style.display = 'none';
    document.getElementById('editArea').style.display = 'block';
    document.getElementById('editor').value = globalData[currentSection] || "";
};

window.saveContent = () => {
    const val = document.getElementById('editor').value;
    set(ref(db, `leoData/${currentSection}`), val)
        .then(() => alert("Database Updated"))
        .catch(err => console.error(err));
};
