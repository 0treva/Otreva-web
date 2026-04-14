// ==========================================
// H4CK3R BL0G - Main Application Logic
// ==========================================

// Initialize on page load
document.addEventListener('DOMContentLoaded', function () {
    loadLanguage();
    loadBlogPosts();
    setupAuthorFilter();
    setupHiddenLoginAccess();
    setupLanguageToggle();
    setupThemeToggle();
    loadTheme();
});

// Current language
let currentLang = 'en';

// Translations
const translations = {
    en: {
        home: 'HOME',
        filterAuthor: 'FILTER BY AUTHOR:',
        allPosts: 'ALL POSTS',
        anonymous: 'ANONYMOUS',
        otreva: 'OTREVA',
        spiegel: 'SPIEGEL',
        status: 'STATUS:',
        online: 'ONLINE',
        users: 'USERS:',
        posts: 'POSTS:',
        noPosts: 'No posts available yet. Be the first to write something!',
        postedBy: 'by',
        on: 'on'
    },
    es: {
        home: 'INICIO',
        filterAuthor: 'Ver:',
        allPosts: 'Todos',
        anonymous: 'Anónimo',
        otreva: 'Otreva',
        spiegel: 'Spiegel',
        status: 'ESTADO:',
        online: 'EN LÍNEA',
        users: 'USUARIOS:',
        posts: 'POSTS:',
        noPosts: 'No hay posts disponibles aún. ¡Sé el primero en escribir algo!',
        postedBy: 'por',
        on: 'el'
    }
};

// === Matrix Background Effect ===
function initMatrixBackground() {
    const canvas = document.getElementById('matrix-bg');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = 'ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ01234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const charArray = chars.split('');

    const fontSize = 14;
    const columns = canvas.width / fontSize;

    const drops = [];
    for (let x = 0; x < columns; x++) {
        drops[x] = Math.random() * -100;
    }

    function draw() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#00ff00';
        ctx.font = fontSize + 'px monospace';

        for (let i = 0; i < drops.length; i++) {
            const text = charArray[Math.floor(Math.random() * charArray.length)];
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);

            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }

            drops[i]++;
        }
    }

    setInterval(draw, 33);

    // Resize handler
    window.addEventListener('resize', function () {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// === Clock Update ===
function updateClock() {
    const clockElement = document.getElementById('current-time');
    if (!clockElement) return;

    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    clockElement.textContent = timeString;
}

// === Initial Blog Data (Fallback for local file:// protocol) ===
const initialBlogData = [
    {
        "id": 1,
        "title": "Welcome to the Underground",
        "author": "anonymous",
        "date": "2019-01-15T08:00:00Z",
        "content": "The internet is not just a network of computers. It's a battlefield of information, where knowledge is power and anonymity is freedom. This blog will serve as a chronicle of our journey through the digital realm.\n\nWe are the watchers in the shadows, the guardians of digital liberty. Our mission: to expose the truth, share knowledge, and push the boundaries of what's possible.\n\nStay alert. Stay curious. Stay anonymous.",
        "tags": ["announcement", "manifesto", "freedom"]
    },
    {
        "id": 2,
        "title": "Breaking Down Modern Encryption",
        "author": "spiegel",
        "date": "2019-03-20T14:30:00Z",
        "content": "In today's digital age, encryption is more than just a tool—it's a necessity. Let me break down some fundamental concepts:\n\nSymmetric vs Asymmetric: The eternal debate. Symmetric encryption uses the same key for encryption and decryption. Fast, but key distribution is a nightmare. Asymmetric uses key pairs—public and private. Slower, but elegant.\n\nThe real power comes from combining both. Use asymmetric to exchange a symmetric key, then encrypt bulk data with the symmetric algorithm. This is how TLS works, people.\n\nRemember: The algorithm may be public, but your keys are sacred. Guard them with your life.",
        "tags": ["security", "encryption", "tutorial"]
    },
    {
        "id": 3,
        "title": "My Journey into Reverse Engineering",
        "author": "otreva",
        "date": "2019-07-10T09:15:00Z",
        "content": "Reverse engineering is like digital archaeology. You're taking apart someone else's creation to understand how it works, why it works, and sometimes... how to make it work differently.\n\nStarted with simple programs, disassembling them byte by byte. The x86 assembly looked like hieroglyphics at first. But patterns emerge. You start to see the compiler's fingerprints, the programmer's habits.\n\nTools I can't live without: IDA Pro for static analysis, OllyDbg for dynamic debugging, and a LOT of coffee.\n\nThe best feeling? When you finally understand that one function that's been bugging you for days. It's like solving a puzzle nobody asked you to solve.",
        "tags": ["reverse-engineering", "assembly", "tools"]
    },
    {
        "id": 4,
        "title": "The Art of Social Engineering",
        "author": "anonymous",
        "date": "2019-10-05T18:45:00Z",
        "content": "The weakest link in any system isn't the technology—it's the human using it.\n\nSocial engineering is psychological manipulation at its finest. You're not hacking computers; you're hacking minds. Want access to a secure system? Don't brute-force the password. Call the help desk, pretend to be from IT, and ask them to reset it for you.\n\nKey principles:\n1. Build trust quickly\n2. Create urgency\n3. Use authority\n4. Never give them time to think\n\nBut remember: with great power comes great responsibility. Use this knowledge ethically. The goal is to understand vulnerabilities, not exploit people.",
        "tags": ["social-engineering", "psychology", "security"]
    },
    {
        "id": 5,
        "title": "Network Protocols: A Deep Dive",
        "author": "spiegel",
        "date": "2020-02-14T12:20:00Z",
        "content": "Let's talk about the backbone of the internet: protocols.\n\nTCP/IP is the foundation. TCP ensures reliable delivery—every packet acknowledged. IP handles routing. Together, they make the internet work.\n\nBut the interesting stuff happens at higher layers. HTTP is glorified text over TCP. DNS translates names to IPs—a distributed database vulnerable to poisoning. SMTP for email? Totally insecure without extensions.\n\nWant to really understand networks? Fire up Wireshark and watch the traffic. See those packets? Each one tells a story. HTTP headers leak information. DNS queries reveal browsing habits. TCP handshakes show connection patterns.\n\nKnowledge is intercepted packets properly analyzed.",
        "tags": ["networking", "protocols", "analysis"]
    },
    {
        "id": 6,
        "title": "Building Secure Systems",
        "author": "otreva",
        "date": "2020-05-28T23:59:00Z",
        "content": "As we close out the year, let's talk about building things the right way.\n\nSecurity isn't a feature you add at the end. It's a mindset you adopt from day one.\n\nPrinciples I live by:\n- Defense in depth: Multiple layers of security\n- Least privilege: Give minimum necessary access\n- Fail securely: When something breaks, it should lock down, not open up\n- Never trust user input: EVER\n\nThe Y2K bug taught us that shortcuts come back to haunt you. Write code like someone malicious will read it. Because they will.\n\nHere's to a new millennium of secure, robust systems. May your code be clean and your exploits be patched.",
        "tags": ["security", "best-practices", "development"]
    }
];

// === Load Blog Posts ===
async function loadBlogPosts(filterAuthor = null) {
    try {
        let initialPosts = [];

        // Try to fetch from JSON file (works on GitHub Pages and HTTP servers)
        try {
            const response = await fetch('blog-data.json');
            if (response.ok) {
                initialPosts = await response.json();
            } else {
                // Use fallback data if fetch fails
                initialPosts = initialBlogData;
            }
        } catch (fetchError) {
            // Use fallback data for local file:// protocol
            console.log('Using embedded blog data (file:// protocol detected)');
            initialPosts = initialBlogData;
        }

        // Get posts from localStorage
        const storedPosts = JSON.parse(localStorage.getItem('userPosts') || '[]');

        // Get deleted posts IDs
        const deletedIds = JSON.parse(localStorage.getItem('deletedPosts') || '[]');

        // Combine and sort posts (newest first)
        let allPosts = [...initialPosts, ...storedPosts];

        // Filter out deleted posts
        allPosts = allPosts.filter(post => !deletedIds.includes(post.id));

        // Filter by author if specified
        if (filterAuthor) {
            allPosts = allPosts.filter(post => post.author === filterAuthor);
        }

        // Sort by date (newest first)
        allPosts.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Render posts
        renderPosts(allPosts);

        // Update counters
        updateCounters(allPosts.length);

    } catch (error) {
        console.error('Error loading blog posts:', error);
        showErrorMessage();
    }
}

// === Render Posts to DOM ===
function renderPosts(posts) {
    const container = document.getElementById('posts-container');
    if (!container) return;

    if (posts.length === 0) {
        container.innerHTML = '<p class="info-text" style="text-align: center; padding: 40px;">No posts found. Be the first to create one!</p>';
        return;
    }

    container.innerHTML = posts.map(post => createPostHTML(post)).join('');
}

// === Create Post HTML ===
function createPostHTML(post) {
    const date = formatDate(post.date);
    const tags = post.tags || [];

    return `
    <article class="post">
            <div class="post-meta">
                <span class="post-author">${escapeHTML(post.author)}</span>
                <span class="post-date">· ${date}</span>
            </div>
            <h2 class="post-title" onclick="viewPost(${post.id})">${escapeHTML(post.title)}</h2>
            <div class="post-content">${escapeHTML(post.content).replace(/\n/g, '<br>')}</div>
            ${tags.length > 0 ? `
                <div class="post-tags">
                    ${tags.map(tag => `<span class="tag-pill">${escapeHTML(tag)}</span>`).join('')}
                </div>
            ` : ''
        }
        </article>
    `;
}

// === View Individual Post ===
function viewPost(postId) {
    window.location.href = `post.html?id=${postId}`;
}

// === Format Date ===
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('en-US', options);
}

// === Escape HTML to prevent XSS ===
function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// === Update Counters ===
function updateCounters(postCount) {
    const postCountElement = document.getElementById('post-count');
    if (postCountElement) {
        postCountElement.textContent = postCount;
    }
}

// === Setup Author Filter Dropdown ===
function setupAuthorFilter() {
    const filterDropdown = document.getElementById('author-filter');

    if (filterDropdown) {
        filterDropdown.addEventListener('change', function (e) {
            const selectedAuthor = e.target.value;

            if (selectedAuthor === 'all') {
                loadBlogPosts();
            } else {
                loadBlogPosts(selectedAuthor);
            }
        });
    }
}

// === Setup Hidden Login Access (Easter Egg) ===
function setupHiddenLoginAccess() {
    const footerSecret = document.getElementById('footer-secret');
    let clickCount = 0;
    let clickTimer = null;

    if (footerSecret) {
        footerSecret.addEventListener('click', function () {
            clickCount++;

            // Reset counter after 2 seconds
            clearTimeout(clickTimer);
            clickTimer = setTimeout(() => {
                clickCount = 0;
            }, 2000);

            // Triple click to access login
            if (clickCount === 3) {
                window.location.href = 'login.html';
            }
        });
    }
}

// === Show Error Message ===
function showErrorMessage() {
    const container = document.getElementById('posts-container');
    if (!container) return;

    container.innerHTML = `
    <div class="message error show">
        <p>ERROR: Failed to load blog posts. Please check your connection and try again.</p>
    </div>
    `;
}

// === Theme Toggle ===
function setupThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');

    if (themeToggle) {
        themeToggle.addEventListener('click', function () {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';

            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);

            // Update icon
            const themeIcon = this.querySelector('.theme-icon');
            if (themeIcon) {
                themeIcon.textContent = newTheme === 'light' ? '☾' : '☀';
            }
        });
    }
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

    // Update icon
    const themeIcon = document.querySelector('.theme-icon');
    if (themeIcon) {
        themeIcon.textContent = savedTheme === 'light' ? '☾' : '☀';
    }
}
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
