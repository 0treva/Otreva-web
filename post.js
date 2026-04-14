// ==========================================
// OTREVA BLOG - Individual Post View
// ==========================================

// Initialize on page load
document.addEventListener('DOMContentLoaded', function () {
    initMatrixBackground();
    setupThemeToggle();
    loadTheme();
    loadPost();
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

// === Load Post ===
async function loadPost() {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = parseInt(urlParams.get('id'));

    if (!postId) {
        showError('No post ID specified');
        return;
    }

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
        const deletedIds = JSON.parse(localStorage.getItem('deletedPosts') || '[]');

        // Find the post
        const allPosts = [...initialPosts, ...userPosts];
        const post = allPosts.find(p => p.id === postId && !deletedIds.includes(p.id));

        if (post) {
            renderPost(post);
        } else {
            showError('Post not found or has been deleted');
        }
    } catch (error) {
        console.error('Error loading post:', error);
        showError('Error loading post');
    }
}

// === Render Post ===
function renderPost(post) {
    const container = document.getElementById('post-content');
    const titleSpan = document.getElementById('post-id-title');

    if (titleSpan) {
        titleSpan.textContent = post.id;
    }

    const date = formatDate(post.date);
    const tags = post.tags || [];

    container.innerHTML = `
        <article class="post">
            <div class="post-header">
                <h2 class="post-title">${escapeHTML(post.title)}</h2>
                <div class="post-meta">
                    <span class="post-author">@${escapeHTML(post.author)}</span>
                    <span class="post-date">${date}</span>
                </div>
            </div>
            <div class="post-content">${escapeHTML(post.content).replace(/\n/g, '<br>')}</div>
            ${tags.length > 0 ? `
                <div class="post-tags">
                    ${tags.map(tag => `<span class="tag">#${escapeHTML(tag)}</span>`).join('')}
                </div>
            ` : ''}
        </article>
    `;
}

// === Format Date ===
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('en-US', options);
}

// === Escape HTML ===
function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// === Show Error ===
function showError(message) {
    const container = document.getElementById('post-content');
    container.innerHTML = `
        <div class="message error show">
            <p>ERROR: ${message}</p>
            <p><a href="index.html" class="nav-link">← Back to blog</a></p>
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
