const ARTICLE_AUTHORS = Object.freeze({
    otreva: {
        name: 'Otreva',
        initial: 'O',
        description: 'Tecnología, redes y seguridad'
    },
    spiegel: {
        name: 'Spiegel',
        initial: 'S',
        description: 'Filosofía, sociedad y pensamiento personal'
    }
});

document.addEventListener('DOMContentLoaded', () => {
    setupTheme();
    setupReadingProgress();
    updateCurrentYear();
    loadPost();
});

async function loadPost() {
    const container = document.getElementById('post-content');
    const postId = Number(new URLSearchParams(window.location.search).get('id'));

    if (!Number.isFinite(postId) || postId <= 0) {
        showError('No se especificó una historia válida.');
        return;
    }

    try {
        const response = await fetch('blog-data.json', { cache: 'no-cache' });
        if (!response.ok) {
            throw new Error(`No se pudo cargar el archivo (HTTP ${response.status})`);
        }

        const posts = await response.json();
        const post = Array.isArray(posts) ? posts.find(item => Number(item.id) === postId) : null;

        if (!post || !ARTICLE_AUTHORS[post.author]) {
            showError('Esta historia no existe o ya no está disponible.');
            return;
        }

        renderPost(post);
        renderRelatedPosts(posts, post);
    } catch (error) {
        console.error('Error al cargar el artículo:', error);
        showError('No pudimos abrir esta historia. Inténtalo de nuevo en unos minutos.');
    } finally {
        container?.setAttribute('aria-busy', 'false');
    }
}

function renderPost(post) {
    const container = document.getElementById('post-content');
    if (!container) return;

    const author = ARTICLE_AUTHORS[post.author];
    const tags = Array.isArray(post.tags) ? post.tags : [];
    const coverURL = safeHTTPURL(post.cover);
    const sourceURL = safeHTTPURL(post.source_url);
    const plainText = stripHTML(post.content).replace(/\s+/g, ' ').trim();
    const readingMinutes = estimateReadingTime(plainText);
    const description = makeExcerpt(plainText, 158);
    const body = post.content_type === 'html'
        ? sanitizeHTML(post.content, coverURL)
        : plainTextToHTML(post.content);

    updateDocumentMetadata(post, description, coverURL);

    const cover = coverURL
        ? `
            <figure class="article-cover-wrap">
                <img class="article-cover" src="${escapeAttribute(coverURL)}" alt="" decoding="async">
            </figure>
        `
        : '';

    const sourceAction = sourceURL
        ? `<a class="article-action source-action" href="${escapeAttribute(sourceURL)}" target="_blank" rel="noopener noreferrer">Medium <span aria-hidden="true">↗</span></a>`
        : '';

    const sourceNote = sourceURL
        ? `
            <p class="source-note">
                <a href="${escapeAttribute(sourceURL)}" target="_blank" rel="noopener noreferrer">Leer también en Medium <span aria-hidden="true">↗</span></a>
            </p>
        `
        : '';

    container.innerHTML = `
        <header class="article-intro">
            ${tags[0] ? `<p class="article-topic">${escapeHTML(tags[0])}</p>` : ''}
            <h1 class="post-title">${escapeHTML(post.title)}</h1>

            <div class="article-byline">
                <span class="article-avatar article-avatar-${escapeAttribute(post.author)}" aria-hidden="true">${author.initial}</span>
                <div class="byline-copy">
                    <p class="byline-name">${author.name}</p>
                    <p class="byline-meta">
                        <time datetime="${escapeAttribute(post.date)}">${formatDate(post.date)}</time>
                        <span aria-hidden="true">·</span>
                        <span>${readingMinutes} min de lectura</span>
                    </p>
                </div>
                <div class="article-actions">
                    <button class="article-action" id="share-article" type="button" aria-label="Compartir este artículo">Compartir</button>
                    <button class="article-action icon-action" id="copy-link" type="button" aria-label="Copiar enlace">⌁</button>
                    ${sourceAction}
                </div>
            </div>
            <p class="action-status" id="action-status" role="status" aria-live="polite"></p>
        </header>

        ${cover}

        <div class="post-content" id="post-body">${body}</div>

        <footer class="article-end">
            ${tags.length ? `
                <div class="article-tags" aria-label="Temas del artículo">
                    ${tags.map(tag => `<span class="tag">${escapeHTML(tag)}</span>`).join('')}
                </div>
            ` : ''}
            ${sourceNote}
            <div class="end-mark" aria-hidden="true">O</div>
        </footer>
    `;

    setupArticleActions(post);
    container.querySelector('.article-cover')?.addEventListener('error', event => {
        event.currentTarget.closest('.article-cover-wrap')?.remove();
    }, { once: true });
}

function renderRelatedPosts(posts, currentPost) {
    const section = document.getElementById('related-section');
    const container = document.getElementById('related-posts');
    if (!section || !container || !Array.isArray(posts)) return;

    const related = posts
        .filter(post => post.author === currentPost.author && Number(post.id) !== Number(currentPost.id))
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 3);

    if (related.length === 0) return;

    container.innerHTML = related.map(post => `
        <article class="related-card">
            <p class="related-meta">${formatDate(post.date)} <span aria-hidden="true">·</span> ${estimateReadingTime(stripHTML(post.content))} min</p>
            <h3><a href="post.html?id=${encodeURIComponent(post.id)}">${escapeHTML(post.title)}</a></h3>
            <p>${escapeHTML(makeExcerpt(stripHTML(post.content), 110))}</p>
        </article>
    `).join('');
    section.hidden = false;
}

function setupArticleActions(post) {
    const pageURL = window.location.href;
    const status = document.getElementById('action-status');

    document.getElementById('share-article')?.addEventListener('click', async () => {
        if (navigator.share) {
            try {
                await navigator.share({ title: post.title, text: `${post.title} — Otreva`, url: pageURL });
                return;
            } catch (error) {
                if (error?.name === 'AbortError') return;
            }
        }
        await copyText(pageURL, status);
    });

    document.getElementById('copy-link')?.addEventListener('click', () => copyText(pageURL, status));
}

async function copyText(text, statusElement) {
    try {
        await navigator.clipboard.writeText(text);
        if (statusElement) statusElement.textContent = 'Enlace copiado.';
    } catch {
        if (statusElement) statusElement.textContent = 'No fue posible copiar el enlace.';
    }

    window.setTimeout(() => {
        if (statusElement) statusElement.textContent = '';
    }, 2200);
}

function sanitizeHTML(html, coverURL = '') {
    const parsed = new DOMParser().parseFromString(html || '', 'text/html');
    const allowedTags = new Set([
        'P', 'BR', 'STRONG', 'EM', 'B', 'I', 'H2', 'H3', 'H4',
        'BLOCKQUOTE', 'UL', 'OL', 'LI', 'IMG', 'A', 'HR',
        'FIGURE', 'FIGCAPTION'
    ]);

    parsed.querySelectorAll('script, style, iframe, object, embed, form, input, button, noscript').forEach(element => element.remove());

    Array.from(parsed.body.querySelectorAll('*')).forEach(element => {
        if (!allowedTags.has(element.tagName)) {
            element.replaceWith(...element.childNodes);
            return;
        }

        const keepAttributes = element.tagName === 'IMG'
            ? new Set(['src', 'alt', 'title'])
            : element.tagName === 'A'
                ? new Set(['href', 'title'])
                : new Set();

        Array.from(element.attributes).forEach(attribute => {
            if (!keepAttributes.has(attribute.name.toLowerCase())) {
                element.removeAttribute(attribute.name);
            }
        });

        if (element.tagName === 'IMG') {
            const imageURL = safeHTTPURL(element.getAttribute('src'));
            if (!imageURL || imageURL === coverURL || imageURL.includes('medium.com/_/stat')) {
                element.closest('figure')?.remove();
                element.remove();
                return;
            }
            element.setAttribute('src', imageURL);
            element.setAttribute('loading', 'lazy');
            element.setAttribute('decoding', 'async');
            element.setAttribute('alt', element.getAttribute('alt') || '');
        }

        if (element.tagName === 'A') {
            const href = safeLinkURL(element.getAttribute('href'));
            if (!href) {
                element.removeAttribute('href');
                return;
            }
            element.setAttribute('href', href);
            if (/^https?:/i.test(href)) {
                element.setAttribute('target', '_blank');
                element.setAttribute('rel', 'noopener noreferrer');
            }
        }
    });

    return parsed.body.innerHTML;
}

function plainTextToHTML(content) {
    return String(content || '')
        .split(/\n\s*\n/)
        .map(paragraph => paragraph.replace(/\s*\n\s*/g, ' ').trim())
        .filter(Boolean)
        .map(paragraph => `<p>${escapeHTML(paragraph)}</p>`)
        .join('');
}

function showError(message) {
    const container = document.getElementById('post-content');
    if (!container) return;

    container.setAttribute('aria-busy', 'false');
    container.innerHTML = `
        <div class="article-error">
            <p class="empty-state-mark" aria-hidden="true">404</p>
            <h1>No encontramos la historia</h1>
            <p>${escapeHTML(message)}</p>
            <a class="primary-button" href="index.html#archivo">Volver al archivo</a>
        </div>
    `;
}

function updateDocumentMetadata(post, description, coverURL) {
    document.title = `${post.title} — Otreva`;
    document.querySelector('meta[name="description"]')?.setAttribute('content', description);

    upsertMeta('property', 'og:title', post.title);
    upsertMeta('property', 'og:description', description);
    if (coverURL) upsertMeta('property', 'og:image', coverURL);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
        canonical = document.createElement('link');
        canonical.rel = 'canonical';
        document.head.appendChild(canonical);
    }
    canonical.href = window.location.href;
}

function upsertMeta(attribute, key, content) {
    let meta = document.querySelector(`meta[${attribute}="${key}"]`);
    if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, key);
        document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
}

function setupReadingProgress() {
    const progress = document.getElementById('reading-progress');
    if (!progress) return;

    const update = () => {
        const maximum = document.documentElement.scrollHeight - window.innerHeight;
        const percentage = maximum > 0 ? Math.min(100, Math.max(0, (window.scrollY / maximum) * 100)) : 0;
        progress.style.width = `${percentage}%`;
    };

    document.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
}

function estimateReadingTime(text) {
    const words = String(text || '').trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 210));
}

function stripHTML(content) {
    const spacedContent = String(content || '').replace(
        /<(\/?(?:p|br|blockquote|li|h[1-4]|figure)\b[^>]*)>/gi,
        ' <$1> '
    );
    const parsed = new DOMParser().parseFromString(spacedContent, 'text/html');
    return parsed.body.textContent || '';
}

function makeExcerpt(text, maximumLength) {
    const normalized = String(text || '').replace(/\s+/g, ' ').trim();
    if (normalized.length <= maximumLength) return normalized;
    return `${normalized.slice(0, maximumLength).replace(/\s+\S*$/, '')}…`;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('es-MX', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC'
    }).format(date);
}

function safeHTTPURL(value) {
    if (!value) return '';
    try {
        const parsed = new URL(value, window.location.href);
        return ['http:', 'https:'].includes(parsed.protocol) ? parsed.href : '';
    } catch {
        return '';
    }
}

function safeLinkURL(value) {
    if (!value) return '';
    try {
        const parsed = new URL(value, window.location.href);
        return ['http:', 'https:', 'mailto:'].includes(parsed.protocol) ? parsed.href : '';
    } catch {
        return '';
    }
}

function escapeHTML(value) {
    const element = document.createElement('div');
    element.textContent = String(value ?? '');
    return element.innerHTML;
}

function escapeAttribute(value) {
    return escapeHTML(value).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function setupTheme() {
    const savedTheme = localStorage.getItem('otreva-theme');
    const preferredTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    applyTheme(savedTheme || preferredTheme);

    document.getElementById('theme-toggle')?.addEventListener('click', () => {
        const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('otreva-theme', nextTheme);
        applyTheme(nextTheme);
    });
}

function applyTheme(theme) {
    const isDark = theme === 'dark';
    document.documentElement.dataset.theme = isDark ? 'dark' : 'light';

    const toggle = document.getElementById('theme-toggle');
    if (toggle) {
        toggle.setAttribute('aria-pressed', String(isDark));
        toggle.setAttribute('aria-label', isDark ? 'Activar modo claro' : 'Activar modo oscuro');
        const icon = toggle.querySelector('.theme-icon');
        if (icon) icon.textContent = isDark ? '☀' : '☾';
    }

    document.querySelector('meta[name="theme-color"]')
        ?.setAttribute('content', isDark ? '#171715' : '#f7f6f2');
}

function updateCurrentYear() {
    const year = document.getElementById('current-year');
    if (year) year.textContent = new Date().getFullYear();
}
