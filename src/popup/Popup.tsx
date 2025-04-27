import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './popup.css';

interface Settings {
  apiKey: string;
  model: string;
  shortcut: string;
}

const Popup: React.FC = () => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get settings from storage
    chrome.runtime.sendMessage({ action: 'getSettings' }, (response) => {
      setSettings(response);
      setLoading(false);
    });
  }, []);

  const openOptionsPage = () => {
    chrome.runtime.openOptionsPage();
  };

  if (loading) {
    return (
      <div className="popup-container">
        <div className="header">
          <img src="../assets/icon48.png" alt="StealthCoder Logo" className="logo" />
          <div>
            <div className="title">StealthCoder</div>
            <div className="subtitle">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="popup-container">
      <div className="header">
        <img src="../assets/icon48.png" alt="StealthCoder Logo" className="logo" />
        <div>
          <div className="title">StealthCoder</div>
          <div className="subtitle">Your invisible coding assistant</div>
        </div>
      </div>

      <div className="content">
        <div className="section">
          <div className="section-title">Current Settings</div>
          <div className="info-box">
            <div className="info-item">
              <div className="info-label">AI Model:</div>
              <div className="info-value">
                {settings?.model === 'gemini' ? 'Google Gemini 2.0 Flash' :
                 settings?.model === 'claude' ? 'Claude 3.7 Sonnet (Mock)' :
                 settings?.model === 'gpt4' ? 'GPT-4' :
                 settings?.model || 'Not set'}
              </div>
            </div>
            <div className="info-item">
              <div className="info-label">API Key:</div>
              <div className="info-value">
                {settings?.apiKey ? '••••••••••••••••' : 'Not set'}
              </div>
            </div>
          </div>
        </div>

        <div className="section">
          <div className="section-title">How to Use</div>
          <div className="shortcut-info">
            Press <span className="shortcut-key">Ctrl</span> +
            <span className="shortcut-key">Shift</span> +
            <span className="shortcut-key">A</span> on any coding problem
            to get instant AI help.
          </div>
        </div>

        <button className="button" onClick={openOptionsPage}>
          Settings
        </button>

        <a
          href="https://github.com/raheesahmed/stealthcoder-extension"
          target="_blank"
          rel="noopener noreferrer"
          className="button secondary"
        >
          View on GitHub
        </a>
      </div>

      <div className="footer">
        StealthCoder v1.0.0 • Built with ❤️
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<Popup />);
