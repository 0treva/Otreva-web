const AUTHORS = Object.freeze({
    otreva: {
        name: 'Otreva',
        initial: 'O',
        accent: 'var(--otreva-accent)'
    },
    spiegel: {
        name: 'Spiegel',
        initial: 'S',
        accent: 'var(--spiegel-accent)'
    }
});

const blogState = {
    posts: [],
    author: 'all',
    query: ''
};

document.addEventListener('DOMContentLoaded', () => {
    setupTheme();
    setupArchiveControls();
    updateCurrentYear();

    if (document.getElementById('posts-container')) {
        loadBlogPosts();
    }
});

async function loadBlogPosts() {
    const container = document.getElementById('posts-container');
    if (!container) return;

    container.setAttribute('aria-busy', 'true');

    try {
        const response = await fetch('blog-data.json', { cache: 'no-cache' });
        if (!response.ok) {
            throw new Error(`No se pudo cargar blog-data.json (HTTP ${response.status})`);
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
            throw new TypeError('El archivo de entradas no contiene una lista válida.');
        }

        blogState.posts = data
            .filter(isValidPost)
            .sort((a, b) => new Date(b.date) - new Date(a.date));

        updateAuthorCounts();
        renderPosts();
    } catch (error) {
        console.error('Error al cargar el archivo:', error);
        renderLoadError();
    } finally {
        container.setAttribute('aria-busy', 'false');
    }
}

function isValidPost(post) {
    return post
        && Number.isFinite(Number(post.id))
        && typeof post.title === 'string'
        && typeof post.author === 'string'
        && AUTHORS[post.author]
        && typeof post.date === 'string'
        && typeof post.content === 'string';
}

function setupArchiveControls() {
    document.querySelectorAll('[data-author]').forEach(button => {
        button.addEventListener('click', () => setAuthorFilter(button.dataset.author));
    });

    document.querySelectorAll('[data-author-target]').forEach(button => {
        button.addEventListener('click', () => {
            setAuthorFilter(button.dataset.authorTarget);
            document.getElementById('archivo')?.scrollIntoView({ behavior: 'smooth' });
        });
    });

    const search = document.getElementById('post-search');
    search?.addEventListener('input', event => {
        blogState.query = normalizeText(event.target.value.trim());
        renderPosts();
    });
}

function setAuthorFilter(author) {
    if (author !== 'all' && !AUTHORS[author]) return;

    blogState.author = author;
    document.querySelectorAll('[data-author]').forEach(button => {
        const isActive = button.dataset.author === author;
        button.classList.toggle('is-active', isActive);
        button.setAttribute('aria-pressed', String(isActive));
    });
    renderPosts();
}

function renderPosts() {
    const container = document.getElementById('posts-container');
    if (!container || blogState.posts.length === 0) return;

    const visiblePosts = blogState.posts.filter(post => {
        const matchesAuthor = blogState.author === 'all' || post.author === blogState.author;
        const haystack = normalizeText([
            post.title,
            post.author,
            ...(post.tags || []),
            stripHTML(post.content)
        ].join(' '));
        const matchesQuery = !blogState.query || haystack.includes(blogState.query);
        return matchesAuthor && matchesQuery;
    });

    updateResultsCount(visiblePosts.length);

    if (visiblePosts.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p class="empty-state-mark" aria-hidden="true">∅</p>
                <h3>No encontramos esa historia</h3>
                <p>Prueba con otra palabra o vuelve a mostrar todos los autores.</p>
                <button class="secondary-button" id="clear-filters" type="button">Limpiar filtros</button>
            </div>
        `;
        document.getElementById('clear-filters')?.addEventListener('click', clearFilters);
        return;
    }

    container.innerHTML = visiblePosts.map(createPostCard).join('');
    container.querySelectorAll('.story-cover img').forEach(image => {
        image.addEventListener('error', () => {
            image.closest('.story-cover')?.classList.add('is-unavailable');
        }, { once: true });
    });
}

function createPostCard(post) {
    const author = AUTHORS[post.author];
    const excerpt = makeExcerpt(post.content, 190);
    const readingMinutes = estimateReadingTime(post.content);
    const tags = Array.isArray(post.tags) ? post.tags.slice(0, 2) : [];
    const postURL = `post.html?id=${encodeURIComponent(post.id)}`;
    const coverURL = safeHTTPURL(post.cover);
    const cover = coverURL
        ? `
            <a class="story-cover" href="${postURL}" tabindex="-1" aria-hidden="true">
                <img src="${escapeAttribute(coverURL)}" alt="" loading="lazy" decoding="async">
                <span class="cover-fallback">${author.initial}</span>
            </a>
        `
        : '';

    return `
        <article class="story-card${cover ? ' has-cover' : ''}">
            <div class="story-copy">
                <div class="story-meta">
                    <span class="mini-avatar mini-avatar-${escapeAttribute(post.author)}" aria-hidden="true">${author.initial}</span>
                    <span class="story-author">${author.name}</span>
                    <span aria-hidden="true">·</span>
                    <time datetime="${escapeAttribute(post.date)}">${formatDate(post.date)}</time>
                </div>

                <h3><a class="story-title" href="${postURL}">${escapeHTML(post.title)}</a></h3>
                <p class="story-excerpt">${escapeHTML(excerpt)}</p>

                <div class="story-footer">
                    <div class="story-tags" aria-label="Temas">
                        ${tags.map(tag => `<span class="tag">${escapeHTML(tag)}</span>`).join('')}
                    </div>
                    <span class="reading-time">${readingMinutes} min de lectura</span>
                </div>
            </div>
            ${cover}
        </article>
    `;
}

function clearFilters() {
    blogState.query = '';
    const search = document.getElementById('post-search');
    if (search) search.value = '';
    setAuthorFilter('all');
}

function updateAuthorCounts() {
    const counts = blogState.posts.reduce((total, post) => {
        total.all += 1;
        total[post.author] += 1;
        return total;
    }, { all: 0, otreva: 0, spiegel: 0 });

    Object.entries(counts).forEach(([author, count]) => {
        document.querySelectorAll(`[data-count="${author}"]`).forEach(element => {
            element.textContent = count;
        });
        document.querySelectorAll(`[data-author-total="${author}"]`).forEach(element => {
            element.textContent = count;
        });
    });
}

function updateResultsCount(count) {
    const results = document.getElementById('results-count');
    if (results) {
        results.textContent = `${count} ${count === 1 ? 'historia' : 'historias'}`;
    }
}

function renderLoadError() {
    const container = document.getElementById('posts-container');
    if (!container) return;

    updateResultsCount(0);
    container.innerHTML = `
        <div class="empty-state">
            <p class="empty-state-mark" aria-hidden="true">!</p>
            <h3>No pudimos abrir el archivo</h3>
            <p>Revisa la conexión e inténtalo de nuevo.</p>
            <button class="secondary-button" id="retry-load" type="button">Reintentar</button>
        </div>
    `;
    document.getElementById('retry-load')?.addEventListener('click', loadBlogPosts);
}

function makeExcerpt(content, maximumLength) {
    const text = stripHTML(content).replace(/\s+/g, ' ').trim();
    if (text.length <= maximumLength) return text;
    return `${text.slice(0, maximumLength).replace(/\s+\S*$/, '')}…`;
}

function estimateReadingTime(content) {
    const words = stripHTML(content).trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 210));
}

function stripHTML(content) {
    const spacedContent = String(content || '').replace(
        /<(\/?(?:p|br|blockquote|li|h[1-4]|figure)\b[^>]*)>/gi,
        ' <$1> '
    );
    const documentFragment = new DOMParser().parseFromString(spacedContent, 'text/html');
    return documentFragment.body.textContent || '';
}

function normalizeText(value) {
    return String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLocaleLowerCase('es');
}

function formatDate(dateString) {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('es-MX', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC'
    }).format(date).replace('.', '');
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

    const themeColor = document.querySelector('meta[name="theme-color"]');
    themeColor?.setAttribute('content', isDark ? '#171715' : '#f7f6f2');
}

function updateCurrentYear() {
    const year = document.getElementById('current-year');
    if (year) year.textContent = new Date().getFullYear();
}
