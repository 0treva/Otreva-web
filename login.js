// ==========================================
// OTREVA BLOG - Post Management
// ==========================================

// SHA-256 hashing function for secure password validation
async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

// Password hashes (NOT plain text passwords)
// To generate a new hash: await sha256('your_password') in browser console
// Current password for all users: 'hack3r'
const validUserHashes = {
    'anonymous': '9c9064c59f1ffa2e174ee754d2979be80dd30db552ec03e7e327e9b1a4bd594e',
    'otreva': '9c9064c59f1ffa2e174ee754d2979be80dd30db552ec03e7e327e9b1a4bd594e',
    'spiegel': '9c9064c59f1ffa2e174ee754d2979be80dd30db552ec03e7e327e9b1a4bd594e'
};

let currentUser = null;
let captchaAnswer = 0;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function () {
    initMatrixBackground();
    setupThemeToggle();
    loadTheme();
    checkExistingSession();
    generateCaptcha();
    setupLoginForm();
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

// === Check Existing Session ===
function checkExistingSession() {
    const savedUser = sessionStorage.getItem('currentUser');
    if (savedUser && validUserHashes[savedUser]) {
        currentUser = savedUser;
        showPostPanel();
    }
}

// === Generate Captcha ===
function generateCaptcha() {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    captchaAnswer = num1 + num2;

    const questionElement = document.getElementById('captcha-question');
    if (questionElement) {
        questionElement.textContent = `${num1} + ${num2} = ?`;
    }
}

// === Setup Login Form ===
function setupLoginForm() {
    const loginForm = document.getElementById('login-form');
    if (!loginForm) return;

    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const captchaInput = parseInt(document.getElementById('captcha-answer').value);

        // Validate captcha
        if (captchaInput !== captchaAnswer) {
            showMessage('login-message', 'CAPTCHA FAILED: Incorrect answer', 'error');
            generateCaptcha(); // Generate new captcha
            document.getElementById('captcha-answer').value = '';
            return;
        }

        // Validate credentials using hash
        if (validUserHashes[username]) {
            const passwordHash = await sha256(password);

            if (passwordHash === validUserHashes[username]) {
                currentUser = username;
                sessionStorage.setItem('currentUser', username);
                showMessage('login-message', 'Authentication successful! Loading...', 'success');

                setTimeout(() => {
                    showPostPanel();
                }, 1000);
            } else {
                showMessage('login-message', 'ACCESS DENIED: Invalid credentials', 'error');
                generateCaptcha();
                document.getElementById('captcha-answer').value = '';
            }
        } else {
            showMessage('login-message', 'ACCESS DENIED: Invalid credentials', 'error');
            generateCaptcha();
            document.getElementById('captcha-answer').value = '';
        }
    });
}

// === Show Post Panel ===
function showPostPanel() {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('post-panel').style.display = 'block';

    const loggedUserSpan = document.getElementById('logged-user');
    if (loggedUserSpan) {
        loggedUserSpan.textContent = currentUser.toUpperCase();
    }

    setupModeToggle();
    setupPostForm();
    setupLogout();
}

// === Setup Mode Toggle ===
function setupModeToggle() {
    const createModeBtn = document.getElementById('create-mode-btn');
    const adminModeBtn = document.getElementById('admin-mode-btn');
    const createMode = document.getElementById('create-mode');
    const adminMode = document.getElementById('admin-mode');

    if (createModeBtn) {
        createModeBtn.addEventListener('click', function () {
            createModeBtn.classList.add('active');
            adminModeBtn.classList.remove('active');
            createMode.style.display = 'block';
            adminMode.style.display = 'none';
        });
    }

    if (adminModeBtn) {
        adminModeBtn.addEventListener('click', function () {
            adminModeBtn.classList.add('active');
            createModeBtn.classList.remove('active');
            adminMode.style.display = 'block';
            createMode.style.display = 'none';
            loadAdminPosts();
            loadTrash();
            setupAdminTabs();
        });
    }
}

// === Setup Admin Tabs ===
function setupAdminTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const tab = this.getAttribute('data-tab');

            tabBtns.forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

            this.classList.add('active');
            document.getElementById(tab + '-tab').classList.add('active');
        });
    });
}

// === Setup Post Form ===
function setupPostForm() {
    const postForm = document.getElementById('post-form');
    if (!postForm) return;

    postForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const author = document.getElementById('post-author').value;
        const title = document.getElementById('post-title').value;
        const content = document.getElementById('post-content').value;
        const tags = document.getElementById('post-tags').value
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0);

        const newPost = {
            id: Date.now(),
            title: title,
            content: content,
            author: author,
            date: new Date().toISOString(),
            tags: tags
        };

        // Save to localStorage
        const existingPosts = JSON.parse(localStorage.getItem('userPosts') || '[]');
        existingPosts.push(newPost);
        localStorage.setItem('userPosts', JSON.stringify(existingPosts));

        showMessage('post-message', 'POST PUBLISHED :: Redirecting to blog...', 'success');

        postForm.reset();

        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    });
}

// === Setup Logout ===
function setupLogout() {
    const logoutBtn = document.getElementById('logout-btn');
    if (!logoutBtn) return;

    logoutBtn.addEventListener('click', function () {
        sessionStorage.removeItem('currentUser');
        currentUser = null;
        window.location.reload();
    });
}

// === Load Admin Posts ===
async function loadAdminPosts() {
    try {
        let initialPosts = [];
        try {
            const response = await fetch('blog-data.json');
            if (response.ok) {
                initialPosts = await response.json();
            }
        } catch (error) {
            console.log('Using user posts only');
        }

        const userPosts = JSON.parse(localStorage.getItem('userPosts') || '[]');
        const deletedIds = JSON.parse(localStorage.getItem('deletedPosts') || '[]');

        let allPosts = [...initialPosts, ...userPosts];
        allPosts = allPosts.filter(post => !deletedIds.includes(post.id));
        allPosts.sort((a, b) => new Date(b.date) - new Date(a.date));

        renderAdminPosts(allPosts);
    } catch (error) {
        console.error('Error loading posts:', error);
    }
}

// === Render Admin Posts ===
function renderAdminPosts(posts) {
    const container = document.getElementById('active-posts-container');
    if (!container) return;

    if (posts.length === 0) {
        container.innerHTML = '<p class="info-text">No active posts.</p>';
        return;
    }

    container.innerHTML = posts.map(post => createAdminPostHTML(post)).join('');

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

    const deletedPosts = JSON.parse(localStorage.getItem('deletedPosts') || '[]');
    if (!deletedPosts.includes(postId)) {
        deletedPosts.push(postId);
        localStorage.setItem('deletedPosts', JSON.stringify(deletedPosts));
    }

    loadAdminPosts();
    loadTrash();
}

// === Load Trash ===
async function loadTrash() {
    try {
        let initialPosts = [];
        try {
            const response = await fetch('blog-data.json');
            if (response.ok) {
                initialPosts = await response.json();
            }
        } catch (error) {
            console.log('Using user posts only');
        }

        const userPosts = JSON.parse(localStorage.getItem('userPosts') || '[]');
        const deletedIds = JSON.parse(localStorage.getItem('deletedPosts') || '[]');

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
