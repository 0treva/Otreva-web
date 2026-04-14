// ==========================================
// OTREVA BLOG - Individual Post View
// ==========================================

document.addEventListener('DOMContentLoaded', function () {
    loadPost();
});

// === Load Post ===
async function loadPost() {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = parseInt(urlParams.get('id'));

    if (!postId) {
        showError('No se especificó el artículo');
        return;
    }

    try {
        let initialPosts = [];
        try {
            const response = await fetch('blog-data.json');
            if (response.ok) {
                initialPosts = await response.json();
            } else if (typeof initialBlogData !== 'undefined') {
                initialPosts = initialBlogData;
            }
        } catch (error) {
            if (typeof initialBlogData !== 'undefined') {
                initialPosts = initialBlogData;
            }
        }

        const userPosts = JSON.parse(localStorage.getItem('userPosts') || '[]');
        const deletedIds = JSON.parse(localStorage.getItem('deletedPosts') || '[]');
        const allPosts = [...initialPosts, ...userPosts];
        const post = allPosts.find(p => p.id === postId && !deletedIds.includes(p.id));

        if (post) {
            renderPost(post);
        } else {
            showError('Artículo no encontrado');
        }
    } catch (error) {
        console.error('Error loading post:', error);
        showError('Error al cargar el artículo');
    }
}

// === Render Post ===
function renderPost(post) {
    const container = document.getElementById('post-content');
    if (!container) return;

    // Update page title
    document.title = `${post.title} · Otreva Blog`;

    const date = formatDate(post.date);
    const tags = post.tags || [];
    const isHTML = post.content_type === 'html';

    let bodyHTML;
    if (isHTML) {
        // Rich content from Medium: sanitize but preserve structure
        bodyHTML = sanitizeHTML(post.content);
    } else {
        // Plain text posts: convert to paragraphs
        bodyHTML = post.content
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .map(line => `<p>${escapeHTML(line)}</p>`)
            .join('');
    }

    // Cover image (first image from Medium)
    const coverHTML = post.cover
        ? `<img src="${escapeAttr(post.cover)}" alt="${escapeAttr(post.title)}" class="post-cover">`
        : '';

    container.innerHTML = `
        <article class="full-post">
            ${coverHTML}
            <h1 class="post-title">${escapeHTML(post.title)}</h1>
            <div class="post-meta">
                <span class="post-author">${escapeHTML(post.author)}</span>
                <span class="post-date">· ${date}</span>
            </div>
            <div class="post-content">${bodyHTML}</div>
            ${tags.length > 0 ? `
                <div class="post-tags post-tags-footer">
                    ${tags.map(tag => `<span class="tag-pill">${escapeHTML(tag)}</span>`).join('')}
                </div>
            ` : ''}
        </article>
    `;
}

// === Sanitize HTML (keep safe tags, strip dangerous ones) ===
function sanitizeHTML(html) {
    const allowed = ['p','br','strong','em','b','i','h2','h3','h4',
                     'blockquote','ul','ol','li','img','a','hr','figure','figcaption'];
    // Use DOMParser for safe parsing
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Remove script/style/iframe
    doc.querySelectorAll('script, style, iframe, noscript').forEach(el => el.remove());

    // Make images responsive
    doc.querySelectorAll('img').forEach(img => {
        img.classList.add('post-img');
        img.setAttribute('loading', 'lazy');
        // Remove fixed width/height
        img.removeAttribute('width');
        img.removeAttribute('height');
    });

    // Make links open in new tab
    doc.querySelectorAll('a').forEach(a => {
        a.setAttribute('target', '_blank');
        a.setAttribute('rel', 'noopener noreferrer');
    });

    return doc.body.innerHTML;
}

// === Escape helpers ===
function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
}

function escapeAttr(str) {
    return (str || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// === Format Date ===
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// === Show Error ===
function showError(message) {
    const container = document.getElementById('post-content');
    if (container) {
        container.innerHTML = `
            <div style="padding:3rem 0; text-align:center; color:var(--text-secondary);">
                <p style="font-size:1.1rem;">${escapeHTML(message)}</p>
                <p style="margin-top:1.25rem;">
                    <a href="index.html" style="text-decoration:underline;">← Volver al blog</a>
                </p>
            </div>
        `;
    }
}
