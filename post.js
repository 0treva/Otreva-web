// ==========================================
// OTREVA BLOG - Individual Post View
// ==========================================

// Initialize on page load
document.addEventListener('DOMContentLoaded', function () {
    // initMatrixBackground is removed
    // setupThemeToggle and loadTheme are handled by app.js mostly, but we can do it if needed
    // Actually app.js is now loaded, so we only need to loadPost().
    loadPost();
});

// === Matrix background removed for clean Medium styling ===

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
            } else if (typeof initialBlogData !== 'undefined') {
                initialPosts = initialBlogData;
            }
        } catch (error) {
            console.log('Using embedded data from app.js fallback');
            if (typeof initialBlogData !== 'undefined') {
                initialPosts = initialBlogData;
            }
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

    // Transformar texto plano en párrafos semánticos reales para el Medium style
    const paragraphsHTML = escapeHTML(post.content)
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => `<p>${line}</p>`)
        .join('');

    container.innerHTML = `
        <article class="post">
            <h1 class="post-title">${escapeHTML(post.title)}</h1>
            <div class="post-meta" style="margin-bottom: 2rem;">
                <span class="post-author">${escapeHTML(post.author)}</span>
                <span class="post-date">· ${date}</span>
            </div>
            <div class="post-content">${paragraphsHTML}</div>
            ${tags.length > 0 ? `
                <div class="post-tags" style="margin-top: 3rem; padding-top: 2rem; border-top: 1px solid var(--border-color);">
                    ${tags.map(tag => `<span class="tag-pill">${escapeHTML(tag)}</span>`).join('')}
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
    if (container) {
        container.innerHTML = `
            <div style="padding: 2rem; text-align: center; color: var(--text-secondary);">
                <p>ERROR: ${message}</p>
                <p style="margin-top: 1rem;"><a href="index.html" style="text-decoration: underline;">← Volver al blog</a></p>
            </div>
        `;
    }
}

// (Theme handling is delegated entirely to app.js, which is loaded in post.html)
