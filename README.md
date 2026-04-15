# PromptPetal ✿

> Smart AI-powered teleprompter with voice tracking for content creators.

![React](https://img.shields.io/badge/React-18-blue) ![Vite](https://img.shields.io/badge/Vite-6-purple) ![License](https://img.shields.io/badge/License-MIT-green)

## What is this?

PromptPetal is a responsive web-based teleprompter built for creators who want to record videos without memorizing scripts. It listens to your voice and scrolls the text in real-time as you speak — so you can focus on the camera, not the words.

### Key Features

- **Voice-tracked scrolling** — Uses the Web Speech API to detect what you're saying and auto-advances the highlighted word to match your pace
- **AI script generation** — Enter a topic and let Claude generate a trending, platform-optimized script (supports YouTube, Instagram, Shorts/Reels)
- **Multi-language** — Generate scripts in English, Hindi, or Hinglish
- **Manual script entry** — Paste or type your own script directly
- **Mobile-first design** — Works beautifully on phones for recording
- **Customizable display** — Font size, scroll speed, text/background colors, mirror mode (for beam-splitter setups)
- **Dark/Light theme** — Easy on the eyes in any lighting
- **Reading guide line** — A subtle marker showing where to look on screen
- **Progress tracking** — See how far through your script you are

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- An [Anthropic API key](https://console.anthropic.com/) _(optional, only needed for AI script generation)_

### Installation

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/promptpetal.git
cd promptpetal

# Install dependencies
npm install

# Set up your API key (optional — for AI script generation)
cp .env.example .env
# Edit .env and add your Anthropic API key

# Start the dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
npm run preview   # preview the production build locally
```

The built files will be in `dist/` — deploy to Vercel, Netlify, GitHub Pages, or any static host.

## How to Use

### Option 1: Write Your Own Script
1. Select **"Write Script"** on the home screen
2. Paste or type your script
3. Hit **"Continue to Editor"** to review and tweak
4. Press **"Start Teleprompter"** to begin

### Option 2: AI-Generate a Script
1. Select **"AI Generate"**
2. Enter your topic (e.g. _"5 habits that changed my life"_)
3. Pick your platform, duration, tone, and language
4. Hit **"Generate Script"** — Claude writes it with trending angles
5. Review in the editor, then start the teleprompter

### Teleprompter Controls
- **Play/Pause** — Start or stop scrolling + voice tracking
- **A- / A+** — Decrease or increase font size
- **Speed** — Cycle through scroll speeds (1×–10×)
- **Reset** — Jump back to the beginning
- **Back** — Return to the editor

Controls auto-hide after 3 seconds during playback. Tap anywhere to show them again.

## Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_ANTHROPIC_API_KEY` | No | Your Anthropic API key for AI script generation |

### Prompter Settings (in-app)

| Setting | Default | Description |
|---------|---------|-------------|
| Font Size | 32px | 18–72px range |
| Scroll Speed | 3 | 1–10 (backup auto-scroll speed) |
| Voice Tracking | On | Speech recognition for auto-advance |
| Mirror Mode | Off | Flip text horizontally for beam splitters |
| Text Color | White | Customizable via presets or color picker |
| Background | Black | Customizable via presets or color picker |

## Browser Compatibility

| Feature | Chrome | Safari | Firefox | Edge |
|---------|--------|--------|---------|------|
| Core teleprompter | ✅ | ✅ | ✅ | ✅ |
| Voice tracking | ✅ | ✅ | ❌ | ✅ |
| Mobile | ✅ | ✅ | ✅ | ✅ |

> **Note:** Voice tracking uses the Web Speech API, which is fully supported in Chrome, Safari, and Edge. Firefox does not support it — the teleprompter will fall back to auto-scroll only.

## Tech Stack

- **React 18** — UI framework
- **Vite 6** — Build tool
- **Web Speech API** — Voice recognition
- **Anthropic Claude API** — AI script generation
- **CSS-in-JS** — Inline styles with CSS custom properties for theming

## Project Structure

```
promptpetal/
├── index.html
├── package.json
├── vite.config.js
├── .env.example
├── .gitignore
└── src/
    ├── main.jsx              # Entry point
    ├── App.jsx               # Root component & routing
    ├── index.css             # Global styles & animations
    ├── theme.js              # Design tokens
    ├── services/
    │   └── ai.js             # Anthropic API integration
    └── components/
        ├── Icons.jsx          # SVG icon components
        ├── UI.jsx             # Shared UI primitives
        ├── HomeScreen.jsx     # Landing — write or AI generate
        ├── EditorScreen.jsx   # Script review & editing
        ├── SettingsScreen.jsx # Prompter customization
        └── PrompterScreen.jsx # The teleprompter itself
```

## Deployment

### Vercel (recommended)
```bash
npm i -g vercel
vercel
```
Add `VITE_ANTHROPIC_API_KEY` in Project Settings → Environment Variables.

### Netlify
```bash
npm run build
# Deploy the dist/ folder
```

### GitHub Pages
```bash
# In vite.config.js, add: base: '/promptpetal/'
npm run build
# Push dist/ to gh-pages branch
```

## Contributing

PRs welcome! Feel free to open issues for bugs, feature requests, or suggestions.

## License

MIT — use it however you like.

---

Built with 🌸 by a creator, for creators.
