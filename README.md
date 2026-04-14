# H4CK3R BL0G :: The Underground

A retro Y2K-era hacker-themed blog website with Matrix background effects, CRT scanlines, and authentic terminal aesthetics.

![H4CK3R BL0G](https://img.shields.io/badge/style-retro-00ff00?style=for-the-badge)
![Status](https://img.shields.io/badge/status-online-00ff00?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-00ff00?style=for-the-badge)

## 🎯 Features

- **Retro Hacker Aesthetic**: Matrix rain animation, CRT scanlines, ASCII art headers
- **Three Authors**: anonymous, otreva, and spiegel
- **Dynamic Blog Posts**: JSON-based initial posts with localStorage for new posts
- **Authentication System**: Login to create new blog posts
- **Author Filtering**: View posts by specific author
- **Fully Responsive**: Works on desktop, tablet, and mobile
- **GitHub Pages Ready**: No server required

## 🚀 Live Demo

Visit the live site: [Your GitHub Pages URL here]

## 📸 Screenshots

Main blog page with Matrix background and retro terminal styling.

## 🔐 Login Credentials

| Username | Password |
|----------|----------|
| anonymous | hack3r |
| otreva | hack3r |
| spiegel | hack3r |

## 🛠️ Technologies

- **HTML5**: Semantic markup with Canvas API
- **CSS3**: Custom properties, animations, responsive design
- **JavaScript**: Vanilla JS, localStorage API, Canvas animations
- **Google Fonts**: VT323 monospace font

## 📦 Installation

### Option 1: GitHub Pages (Recommended)

1. Fork this repository
2. Go to Settings → Pages
3. Source: Deploy from branch `main`
4. Visit your GitHub Pages URL

### Option 2: Local Server

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO

# Start a simple HTTP server
python3 -m http.server 8000
# or
npx serve

# Open browser to http://localhost:8000
```

### Option 3: Direct File Access

Simply open `index.html` in your browser. The fallback mechanism allows it to work without a server.

## 📁 File Structure

```
.
├── index.html          # Main blog page
├── login.html          # Login and post creation
├── style.css           # Retro hacker styling
├── app.js              # Main application logic
├── login.js            # Authentication logic
├── blog-data.json      # Initial blog posts
└── README.md           # This file
```

## 🎨 Customization

### Change Colors

Edit CSS variables in `style.css`:

```css
:root {
    --color-primary: #00ff00;    /* Main green */
    --color-secondary: #00ffff;  /* Cyan */
    --color-accent: #ff0000;     /* Red */
}
```

### Add Authors

Update `validUsers` in `login.js`:

```javascript
const validUsers = {
    'anonymous': 'hack3r',
    'otreva': 'hack3r',
    'spiegel': 'hack3r',
    'newauthor': 'password'
};
```

### Modify Initial Posts

Edit the `initialBlogData` array in `app.js` or `blog-data.json`.

## ⚙️ How It Works

1. **Initial Posts**: Loaded from embedded data in `app.js` (fallback) or `blog-data.json` (when served via HTTP)
2. **New Posts**: Users login and create posts, which are saved to `localStorage`
3. **Post Display**: Both initial and user-created posts are combined and sorted by date
4. **Filtering**: Click author names to filter posts
5. **Persistence**: User posts persist across browser sessions via `localStorage`

## 🌐 Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Opera (latest)

## 📝 License

MIT License - Feel free to use this project for your own purposes.

## 🤝 Contributing

Contributions welcome! Feel free to:

- Add new features
- Improve the design
- Fix bugs
- Add more initial blog posts
- Enhance the Matrix animation

## 🎯 Roadmap

- [ ] Markdown support for post content
- [ ] Post editing/deletion
- [ ] Comment system
- [ ] Dark/light theme toggle (currently dark only)
- [ ] Export/import posts as JSON
- [ ] Search functionality

## 👨‍💻 Authors

- **anonymous** - The mysterious one
- **otreva** - Reverse engineering specialist
- **spiegel** - Security researcher

## 🔗 Links

- [Live Demo](https://YOUR_USERNAME.github.io/YOUR_REPO/)
- [Report Bug](https://github.com/YOUR_USERNAME/YOUR_REPO/issues)
- [Request Feature](https://github.com/YOUR_USERNAME/YOUR_REPO/issues)

---

**> root@underground:~$** _ACCESS GRANTED :: PROCEED WITH CAUTION_

© 2000-2025 H4CK3R BL0G :: All wrongs reserved
