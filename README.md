# ⚡ StealthCoder - Your Invisible Coding Assistant for LeetCode & Interviews

StealthCoder is a Chrome extension that secretly assists you during live coding interviews on LeetCode, HackerRank, etc.
It uses top AI models like Google Gemini 2.5 and Claude Sonnet — and is designed for maximum stealth: no popups, no flashing UI, no detection on Zoom or Google Meet.

## ✨ Features

- 🔥 **Model Choice**: Gemini 2.5, Claude Sonnet, or GPT-4
- 🔒 **Secure API Key**: User enters API key one time, saved safely inside Chrome
- 🛡️ **No Backend Needed**: Direct API calls from your browser
- 👻 **Stealth Mode**: Invisible UI triggered with secret keyboard shortcuts
- ⚡ **Ultra Fast**: No server = No latency
- 🧠 **Smart Prompting**: AI understands problems and suggests clean solutions
- 🛠️ **Customizable**: User settings saved and easily editable

## 📂 Project Structure

```
/stealthcoder-extension
├── public/
│   ├── icons/
│   │   ├── icon16.png
│   │   ├── icon48.png
│   │   └── icon128.png
│   └── manifest.json
├── src/
│   ├── background/
│   │   └── service-worker.ts
│   ├── content-scripts/
│   │   └── inject-help.ts
│   ├── popup/
│   │   ├── Popup.tsx
│   │   ├── popup.css
│   │   └── index.html
│   ├── options/
│   │   ├── SettingsPage.tsx
│   │   ├── options.css
│   │   └── index.html
│   ├── assets/
│   │   └── styles.css
│   ├── utils/
│   │   └── apiHandler.ts
│   ├── background.ts
│   └── content.tsx
├── vite.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

## 🛠️ How It Works

1. Install the extension in Chrome (Developer Mode)
2. On first use, a Settings Page opens:
   - Select your preferred AI model
   - Enter your API key
3. Start solving coding problems!
4. Press a secret shortcut (Ctrl + Shift + A) to fetch hidden AI help
5. Help appears subtly inside the page (ghost mode)

## 🔧 Setup Instructions

### Clone this repo:

```bash
git clone https://github.com/yourusername/stealthcoder-extension.git
cd stealthcoder-extension
```

### Install dependencies:

```bash
npm install
```

### Build the extension:

```bash
npm run build
```

### Load extension into Chrome:

1. Open `chrome://extensions/`
2. Enable Developer Mode
3. Click "Load unpacked" and select the `/dist` folder after build

## 🔐 API Key Management

- Your API keys are stored using `chrome.storage.local`
- They never leave your browser
- If you want to change the model or key, go to the Settings Page in the extension popup

## 🧠 Future Improvements

- Add backup key management
- Auto-detect problem types (DP, Trees, Greedy) and adjust prompts
- Fake human typing simulation
- Support for more platforms (HackerRank, CodeSignal, CoderPad)

## ⚠️ Disclaimer

This extension is for educational purposes only.
Use it ethically and responsibly.
Passing interviews should be based on real skill, not just hidden tools! 🙏

## 🧑‍💻 Author

Rahees Ahmed — Fullstack AI Developer

Built with ❤️, React, Vite, and TypeScript

## 🚀 Let's Build The Future Together!
