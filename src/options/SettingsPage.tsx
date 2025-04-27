import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './options.css';

interface Settings {
  apiKey: string;
  model: string;
  shortcut: string;
}

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<Settings>({
    apiKey: '',
    model: 'gemini',
    shortcut: 'Ctrl+Shift+A',
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    // Get settings from storage
    chrome.runtime.sendMessage({ action: 'getSettings' }, (response) => {
      if (response) {
        setSettings(response);
      }
      setLoading(false);
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate API key
    if (!settings.apiKey) {
      setMessage({
        type: 'error',
        text: 'API key is required',
      });
      return;
    }

    // Save settings
    chrome.runtime.sendMessage(
      { action: 'saveSettings', settings },
      (response) => {
        if (response.success) {
          setMessage({
            type: 'success',
            text: 'Settings saved successfully',
          });

          // Clear message after 3 seconds
          setTimeout(() => {
            setMessage(null);
          }, 3000);
        } else {
          setMessage({
            type: 'error',
            text: 'Failed to save settings',
          });
        }
      }
    );
  };

  if (loading) {
    return (
      <div className="settings-container">
        <div className="header">
          <img src="../assets/icon48.png" alt="StealthCoder Logo" className="logo" />
          <div className="title-container">
            <h1 className="title">StealthCoder Settings</h1>
            <p className="subtitle">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-container">
      <div className="header">
        <img src="../assets/icon48.png" alt="StealthCoder Logo" className="logo" />
        <div className="title-container">
          <h1 className="title">StealthCoder Settings</h1>
          <p className="subtitle">Configure your invisible coding assistant</p>
        </div>
      </div>

      {message && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="card">
          <div className="card-title">AI Model Settings</div>

          <div className="form-group">
            <label htmlFor="model" className="form-label">
              Select AI Model
            </label>
            <select
              id="model"
              name="model"
              className="form-select"
              value={settings.model}
              onChange={handleChange}
            >
              <option value="gemini">Google Gemini 2.0 Flash</option>
              <option value="claude">Claude 3.7 Sonnet (Mock Response)</option>
              <option value="gpt4">GPT-4</option>
            </select>
            <div className="form-help">
              Choose which AI model to use for generating coding help.
              Note: Due to CORS limitations, Claude will provide a mock response.
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="apiKey" className="form-label">
              API Key
            </label>
            <input
              type="password"
              id="apiKey"
              name="apiKey"
              className="form-input"
              value={settings.apiKey}
              onChange={handleChange}
              placeholder="Enter your API key"
            />
            <div className="form-help">
              Your API key is stored locally and never sent to our servers
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-title">Shortcut Settings</div>

          <div className="form-group">
            <label className="form-label">
              Keyboard Shortcut
            </label>
            <div className="shortcut-container">
              <span className="shortcut-key">Ctrl</span> +
              <span className="shortcut-key">Shift</span> +
              <span className="shortcut-key">A</span>
            </div>
            <div className="form-help">
              This shortcut triggers StealthCoder on any coding problem page
            </div>
          </div>
        </div>

        <div className="button-container">
          <button type="submit" className="button">
            Save Settings
          </button>
        </div>
      </form>

      <div className="footer">
        <p>
          StealthCoder v1.0.0 •
          <a
            href="https://github.com/raheesahmed/stealthcoder-extension"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </p>
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<SettingsPage />);
