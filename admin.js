// ==========================================
// OTREVA BLOG - Admin Panel
// ==========================================

const ADMIN_PASSWORD = 'admin2025';

// Initialize on page load
document.addEventListener('DOMContentLoaded', function () {
    initMatrixBackground();
    setupAdminLogin();
    setupThemeToggle();
    loadTheme();
    checkAdminSession();
});

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

    window.addEventListener('resize', function () {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// === Check Admin Session ===
function checkAdminSession() {
    const isAdmin = sessionStorage.getItem('adminAccess');
    if (isAdmin === 'true') {
        showAdminPanel();
    }
}

// === Setup Admin Login ===
function setupAdminLogin() {
    const loginForm = document.getElementById('admin-login-form');
    if (!loginForm) return;

    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const password = document.getElementById('admin-password').value;

        if (password === ADMIN_PASSWORD) {
            sessionStorage.setItem('adminAccess', 'true');
            showMessage('login-message', 'Access granted! Loading admin panel...', 'success');

            setTimeout(() => {
                showAdminPanel();
            }, 1000);
        } else {
            showMessage('login-message', 'ACCESS DENIED: Invalid password', 'error');
        }
    });
}

// === Show Admin Panel ===
function showAdminPanel() {
    document.getElementById('admin-login').style.display = 'none';
    document.getElementById('admin-panel').style.display = 'block';

    setupTabs();
    loadAdminPosts();
    loadTrash();
}

// === Setup Tabs ===
function setupTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const tab = this.getAttribute('data-tab');

            // Remove active class from all tabs
            tabBtns.forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

            // Add active class to clicked tab
            this.classList.add('active');
            document.getElementById(tab + '-tab').classList.add('active');
        });
    });
}

// === Load Admin Posts ===
async function loadAdminPosts() {
    try {
        // Load initial data
        let initialPosts = [];
        try {
            const response = await fetch('blog-data.json');
            if (response.ok) {
                initialPosts = await response.json();
            }
        } catch (error) {
            console.log('Using embedded data');
        }

        // Get user posts
        const userPosts = JSON.parse(localStorage.getItem('userPosts') || '[]');

        // Get deleted posts IDs
        const deletedIds = JSON.parse(localStorage.getItem('deletedPosts') || '[]');

        // Combine and filter out deleted
        let allPosts = [...initialPosts, ...userPosts];
        allPosts = allPosts.filter(post => !deletedIds.includes(post.id));

        // Sort by date
        allPosts.sort((a, b) => new Date(b.date) - new Date(a.date));

        renderAdminPosts(allPosts);
    } catch (error) {
        console.error('Error loading posts:', error);
    }
}

// === Render Admin Posts ===
function renderAdminPosts(posts) {
    const container = document.getElementById('admin-posts-container');
    if (!container) return;

    if (posts.length === 0) {
        container.innerHTML = '<p class="info-text">No active posts.</p>';
        return;
    }

    container.innerHTML = posts.map(post => createAdminPostHTML(post)).join('');

    // Setup delete buttons
    document.querySelectorAll('.delete-post-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const postId = parseInt(this.getAttribute('data-id'));
            deletePost(postId);
        });
    });
}

// === Create Admin Post HTML ===
function createAdminPostHTML(post) {
    const date = new Date(post.date).toLocaleDateString();

    return `
        <div class="admin-post">
            <div class="admin-post-header">
                <div>
                    <h3 class="post-title-small">${escapeHTML(post.title)}</h3>
                    <span class="post-meta-small">by @${escapeHTML(post.author)} on ${date}</span>
                </div>
                <button class="btn-danger delete-post-btn" data-id="${post.id}">
                    <span class="btn-text">[DELETE]</span>
                </button>
            </div>
        </div>
    `;
}

// === Delete Post ===
function deletePost(postId) {
    if (!confirm('Are you sure you want to delete this post?')) return;

    // Add to deleted posts
    const deletedPosts = JSON.parse(localStorage.getItem('deletedPosts') || '[]');
    if (!deletedPosts.includes(postId)) {
        deletedPosts.push(postId);
        localStorage.setItem('deletedPosts', JSON.stringify(deletedPosts));
    }

    // Reload
    loadAdminPosts();
    loadTrash();
}

// === Load Trash ===
async function loadTrash() {
    try {
        // Load all posts
        let initialPosts = [];
        try {
            const response = await fetch('blog-data.json');
            if (response.ok) {
                initialPosts = await response.json();
            }
        } catch (error) {
            console.log('Using embedded data');
        }

        const userPosts = JSON.parse(localStorage.getItem('userPosts') || '[]');
        const deletedIds = JSON.parse(localStorage.getItem('deletedPosts') || '[]');

        // Get only deleted posts
        const allPosts = [...initialPosts, ...userPosts];
        const trashedPosts = allPosts.filter(post => deletedIds.includes(post.id));

        trashedPosts.sort((a, b) => new Date(b.date) - new Date(a.date));

        renderTrash(trashedPosts);
    } catch (error) {
        console.error('Error loading trash:', error);
    }
}

// === Render Trash ===
function renderTrash(posts) {
    const container = document.getElementById('trash-container');
    if (!container) return;

    if (posts.length === 0) {
        container.innerHTML = '<p class="info-text">Trash is empty.</p>';
        return;
    }

    container.innerHTML = posts.map(post => createTrashPostHTML(post)).join('');

    // Setup restore buttons
    document.querySelectorAll('.restore-post-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const postId = parseInt(this.getAttribute('data-id'));
            restorePost(postId);
        });
    });
}

// === Create Trash Post HTML ===
function createTrashPostHTML(post) {
    const date = new Date(post.date).toLocaleDateString();

    return `
        <div class="admin-post deleted">
            <div class="admin-post-header">
                <div>
                    <h3 class="post-title-small">${escapeHTML(post.title)}</h3>
                    <span class="post-meta-small">by @${escapeHTML(post.author)} on ${date}</span>
                </div>
                <button class="btn-success restore-post-btn" data-id="${post.id}">
                    <span class="btn-text">[RESTORE]</span>
                </button>
            </div>
        </div>
    `;
}

// === Restore Post ===
function restorePost(postId) {
    const deletedPosts = JSON.parse(localStorage.getItem('deletedPosts') || '[]');
    const index = deletedPosts.indexOf(postId);

    if (index > -1) {
        deletedPosts.splice(index, 1);
        localStorage.setItem('deletedPosts', JSON.stringify(deletedPosts));
    }

    loadAdminPosts();
    loadTrash();
}

// === Escape HTML ===
function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// === Show Message ===
function showMessage(elementId, text, type) {
    const messageElement = document.getElementById(elementId);
    if (!messageElement) return;

    messageElement.textContent = text;
    messageElement.className = 'message show ' + type;

    if (type === 'success') {
        setTimeout(() => {
            messageElement.classList.remove('show');
        }, 5000);
    }
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

    const themeIcon = document.querySelector('.theme-icon');
    if (themeIcon) {
        themeIcon.textContent = savedTheme === 'light' ? '☾' : '☀';
    }
}
