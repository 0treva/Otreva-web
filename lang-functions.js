// === Language Toggle ===
function setupLanguageToggle() {
    const langToggle = document.getElementById('lang-toggle');
    if (langToggle) {
        langToggle.addEventListener('click', function () {
            currentLang = currentLang === 'en' ? 'es' : 'en';
            localStorage.setItem('language', currentLang);

            const langText = this.querySelector('.lang-text');
            if (langText) {
                langText.textContent = currentLang.toUpperCase();
            }

            updateUILanguage();
            loadBlogPosts();
        });
    }
}

function loadLanguage() {
    currentLang = localStorage.getItem('language') || 'en';
    const langText = document.querySelector('.lang-text');
    if (langText) {
        langText.textContent = currentLang.toUpperCase();
    }
    updateUILanguage();
}

function updateUILanguage() {
    const t = translations[currentLang];

    // Update nav
    const homeLink = document.querySelector('.nav-link.active');
    if (homeLink) homeLink.textContent = t.home;

    const filterLabel = document.querySelector('.filter-label');
    if (filterLabel) filterLabel.textContent = t.filterAuthor;

    // Update author select options
    const authorSelect = document.getElementById('author-filter');
    if (authorSelect) {
        authorSelect.options[0].text = t.allPosts;
        authorSelect.options[1].text = t.anonymous.toUpperCase();
        authorSelect.options[2].text = t.otreva.toUpperCase();
        authorSelect.options[3].text = t.spiegel.toUpperCase();
    }

    // Update status bar
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
