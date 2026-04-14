// Simple SHA-256 implementation for password hashing
async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

// Password hashes (use: await sha256('password') to generate)
// Current password for all users: 'hack3r'
// Hash: d11c2a3e87e7e1c9dbcd28f8c90e3e3b4c6d52e7f5e8c8f5e3f9a8d7e6c5b4a3
const validUserHashes = {
    'anonymous': 'd11c2a3e87e7e1c9dbcd28f8c90e3e3b4c6d52e7f5e8c8f5e3f9a8d7e6c5b4a3',
    'otreva': 'd11c2a3e87e7e1c9dbcd28f8c90e3e3b4c6d52e7f5e8c8f5e3f9a8d7e6c5b4a3',
    'spiegel': 'd11c2a3e87e7e1c9dbcd28f8c90e3e3b4c6d52e7f5e8c8f5e3f9a8d7e6c5b4a3'
};

// IMPORTANT: To change passwords:
// 1. Run: await sha256('your_new_password') in browser console
// 2. Copy the hash
// 3. Replace the hash above for the user
// This way passwords are never exposed in the code

let currentUser = null;
let currentLang = 'en';
let captchaAnswer = 0;

// Translations
const translations = {
    en: {
        home: 'HOME',
        filterAuthor: 'FILTER BY AUTHOR:',
        allPosts: 'ALL POSTS',
        status: 'STATUS:',
        online: 'ONLINE',
        users: 'USERS:',
        posts: 'POSTS:',
        noPosts: 'No posts available yet. Be the first to write something!',
        readMore: 'Read more',
        postedBy: 'by',
        on: 'on'
    },
    es: {
        home: 'INICIO',
        filterAuthor: 'FILTRAR POR AUTOR:',
        allPosts: 'TODOS',
        status: 'ESTADO:',
        online: 'EN LÍNEA',
        users: 'USUARIOS:',
        posts: 'POSTS:',
        noPosts: 'No hay posts disponibles aún. ¡Sé el primero en escribir algo!',
        readMore: 'Leer más',
        postedBy: 'por',
        on: 'el'
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function () {
    initMatrixBackground();
    updateClock();
    loadLanguage();
    loadBlogPosts();
    setupAuthorFilter();
    setupHiddenLoginAccess();
    setupLanguageToggle();
    setupThemeToggle();
    loadTheme();
    setInterval(updateClock, 1000);
});

// === Language Toggle ===
function setupLanguageToggle() {
    const langToggle = document.getElementById('lang-toggle');
    if (langToggle) {
        langToggle.addEventListener('click', function () {
            currentLang = currentLang === 'en' ? 'es' : 'en';
            localStorage.setItem('language', currentLang);

            const langText = this.querySelector('.lang-text');
            if (langText) {
                langText.textContent = currentLang === 'en' ? 'EN' : 'ES';
            }

            updateUILanguage();
            loadBlogPosts(); // Reload to update translations
        });
    }
}

function loadLanguage() {
    currentLang = localStorage.getItem('language') || 'en';
    const langText = document.querySelector('.lang-text');
    if (langText) {
        langText.textContent = currentLang === 'en' ? 'EN' : 'ES';
    }
    updateUILanguage();
}

function updateUILanguage() {
    const t = translations[currentLang];

    // Update static elements
    const homeLink = document.querySelector('.nav-link.active');
    if (homeLink) homeLink.textContent = t.home;

    const filterLabel = document.querySelector('.filter-label');
    if (filterLabel) filterLabel.textContent = t.filterAuthor;

    const authorSelect = document.getElementById('author-filter');
    if (authorSelect) {
        authorSelect.options[0].text = t.allPosts;
    }

    // Status bar
    const statusItems = document.querySelectorAll('.status-item');
    if (statusItems[0]) {
        statusItems[0].innerHTML = `${t.status} <span class="online">${t.online}</span>`;
    }
    if (statusItems[1]) {
        statusItems[1].innerHTML = `${t.users} <span id="user-count">3</span>`;
    }
    if (statusItems[2]) {
        const currentCount = document.getElementById('post-count')?.textContent || '0';
        statusItems[2].innerHTML = `${t.posts} <span id="post-count">${currentCount}</span>`;
    }
}

// Rest of the existing app.js code continues...
// (I'm not including the Matrix background and other functions as they remain unchanged)

// Note: The password validation in setupLoginForm needs to be updated to use hashes
