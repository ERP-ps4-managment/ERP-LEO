import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// --- PASTE YOUR ACTUAL CONFIG HERE ---
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

// 1. Live Clock Function
function startClock() {
    const clockElement = document.getElementById('liveClock');
    if (!clockElement) return;
    setInterval(() => {
        const now = new Date();
        clockElement.innerText = now.toLocaleTimeString();
    }, 1000);
}

// 2. Authentication with Fade Animation
window.checkAuth = () => {
    const role = document.getElementById('roleSelect').value;
    const pass = document.getElementById('passInput').value;
    const gate = document.getElementById('gatekeeper');
    const dash = document.getElementById('dashboard');

    if ((role === 'player' && pass === 'ERP-leo') || (role === 'admin' && pass === 'pal1anth23')) {
        currentRole = role;
        
        // Start Fade Out
        gate.style.opacity = "0";
        
        setTimeout(() => {
            gate.style.display = 'none';
            
            // Show Dashboard with CSS Animation
            dash.classList.add('animate-in');
            
            // Show Admin elements if applicable
            if (role === 'admin') {
                // This covers elements using either .admin-only or .admin-badge/.edit-btn classes
                document.querySelectorAll('.admin-only, .admin-badge, .edit-btn').forEach(el => {
                    el.style.display = 'inline-block';
                });
            }
            
            startClock();
            loadData();
        }, 600);
    } else {
        document.getElementById('error-msg').innerText = "ACCESS DENIED";
    }
};

// 3. Data Sync
function loadData() {
    onValue(ref(db, 'leoData'), (snapshot) => {
        globalData = snapshot.val() || {};
        updateUI();
    });
}

window.showSection = (section) => {
    currentSection = section;
    
    // Update active state on buttons
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    if (event && event.target) {
        event.target.classList.add('active');
    }
    
    updateUI();
};

function updateUI() {
    const sectionTitle = document.getElementById('sectionTitle');
    const displayArea = document.getElementById('displayArea');
    const editArea = document.getElementById('editArea');

    if (sectionTitle) sectionTitle.innerText = currentSection.toUpperCase();
    if (displayArea) displayArea.innerText = globalData[currentSection] || "No data assigned.";
    
    if (editArea) editArea.style.display = 'none';
    if (displayArea) displayArea.style.display = 'block';
}

// 4. Admin Actions
window.toggleEdit = () => {
    const displayArea = document.getElementById('displayArea');
    const editArea = document.getElementById('editArea');
    const editor = document.getElementById('editor');

    displayArea.style.display = 'none';
    editArea.style.display = 'block';
    editor.value = globalData[currentSection] || "";
};

window.saveContent = () => {
    const val = document.getElementById('editor').value;
    set(ref(db, `leoData/${currentSection}`), val)
        .then(() => {
            alert("Database Updated Successfully");
            updateUI();
        })
        .catch(err => {
            console.error(err);
            alert("Error saving data. Check Firebase Rules.");
        });
};;
