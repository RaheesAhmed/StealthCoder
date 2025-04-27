// Content script for StealthCoder extension

// Create a style element for our stealth UI
const createStealthStyles = () => {
  const style = document.createElement('style');
  style.textContent = `
    .stealth-coder-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 400px;
      max-height: 500px;
      background-color: rgba(30, 30, 30, 0.9);
      color: #f0f0f0;
      border-radius: 8px;
      padding: 10px;
      font-family: 'Courier New', monospace;
      font-size: 14px;
      z-index: 9999;
      overflow-y: auto;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
      transition: opacity 0.3s ease;
      opacity: 0;
      pointer-events: none;
    }

    .stealth-coder-container.visible {
      opacity: 1;
      pointer-events: auto;
    }

    .stealth-coder-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      border-bottom: 1px solid #444;
      padding-bottom: 5px;
    }

    .stealth-coder-title {
      font-weight: bold;
      color: #00ff9d;
    }

    .stealth-coder-close {
      cursor: pointer;
      color: #999;
    }

    .stealth-coder-close:hover {
      color: #ff4444;
    }

    .stealth-coder-content {
      white-space: pre-wrap;
      line-height: 1.4;
    }

    .stealth-coder-content code {
      background-color: rgba(0, 0, 0, 0.3);
      padding: 2px 4px;
      border-radius: 3px;
    }

    .stealth-coder-loading {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100px;
    }

    .stealth-coder-dot {
      width: 8px;
      height: 8px;
      background-color: #00ff9d;
      border-radius: 50%;
      margin: 0 5px;
      animation: pulse 1.5s infinite ease-in-out;
    }

    .stealth-coder-dot:nth-child(2) {
      animation-delay: 0.2s;
    }

    .stealth-coder-dot:nth-child(3) {
      animation-delay: 0.4s;
    }

    @keyframes pulse {
      0%, 100% {
        transform: scale(0.5);
        opacity: 0.5;
      }
      50% {
        transform: scale(1);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);
};

// Create the stealth UI container
const createStealthUI = () => {
  const container = document.createElement('div');
  container.className = 'stealth-coder-container';
  container.innerHTML = `
    <div class="stealth-coder-header">
      <div class="stealth-coder-title">StealthCoder</div>
      <div class="stealth-coder-close">×</div>
    </div>
    <div class="stealth-coder-content"></div>
  `;
  document.body.appendChild(container);

  // Add event listener to close button
  const closeButton = container.querySelector('.stealth-coder-close');
  if (closeButton) {
    closeButton.addEventListener('click', () => {
      toggleStealthMode(false);
    });
  }

  return container;
};

// Show loading animation
const showLoading = (container: HTMLElement) => {
  const content = container.querySelector('.stealth-coder-content');
  if (content) {
    content.innerHTML = `
      <div class="stealth-coder-loading">
        <div class="stealth-coder-dot"></div>
        <div class="stealth-coder-dot"></div>
        <div class="stealth-coder-dot"></div>
      </div>
    `;
  }
};

// Show AI response
const showResponse = (container: HTMLElement, response: string) => {
  const content = container.querySelector('.stealth-coder-content');

  // Convert markdown-like code blocks to HTML
  const formattedResponse = response
    .replace(/```(\w*)([\s\S]*?)```/g, (_, language, code) => {
      return `<pre><code class="language-${language}">${code.trim()}</code></pre>`;
    })
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>');

  if (content) {
    content.innerHTML = formattedResponse;
  }
};

// Toggle stealth mode
const toggleStealthMode = (show?: boolean) => {
  const container = document.querySelector('.stealth-coder-container') as HTMLElement;

  if (!container) return;

  if (show === undefined) {
    container.classList.toggle('visible');
  } else {
    if (show) {
      container.classList.add('visible');
    } else {
      container.classList.remove('visible');
    }
  }
};

// Get problem description from the page
const getProblemDescription = (): string => {
  let problemDescription = '';

  // Different selectors for different platforms
  const selectors = [
    // LeetCode
    '.question-content__JfgR',
    '.content__u3I1',
    // HackerRank
    '.challenge-body-html',
    '.challenge-text',
    // CodeSignal
    '.task-description',
    // Generic
    '[role="main"]',
    'main',
    '.problem-statement',
    '.problem-description',
  ];

  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element && element.textContent) {
      problemDescription = element.textContent.trim();
      break;
    }
  }

  const bodyText = document.body.textContent || '';
  return problemDescription || bodyText.substring(0, 5000);
};

// Request AI help
const requestAIHelp = async () => {
  const container = document.querySelector('.stealth-coder-container') as HTMLElement;
  if (!container) return;

  showLoading(container);
  toggleStealthMode(true);

  try {
    const problemDescription = getProblemDescription();

    // Send message to background script
    chrome.runtime.sendMessage(
      {
        action: 'getAIHelp',
        prompt: `I'm working on this coding problem: ${problemDescription}.
                Please analyze it and provide:
                1. A clear explanation of the problem
                2. The approach to solve it (with time and space complexity)
                3. A step-by-step solution with code
                4. Any edge cases to consider`
      },
      (response) => {
        if (response && response.success) {
          showResponse(container, response.response);
        } else {
          showResponse(container, `Error: ${response?.error || 'Failed to get AI help'}`);
        }
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    showResponse(container, `Error: ${errorMessage}`);
  }
};

// Initialize the extension
const initialize = () => {
  // Create styles and UI
  createStealthStyles();
  createStealthUI();

  // Listen for keyboard shortcuts from the page
  document.addEventListener('keydown', (event) => {
    // Check for Ctrl+Shift+A (default shortcut)
    if (event.ctrlKey && event.shiftKey && event.key === 'A') {
      event.preventDefault();
      requestAIHelp();
    }
  });

  // Listen for messages from background script
  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'toggleStealthMode') {
      requestAIHelp();
    }
  });
};

// Initialize when the page is fully loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}
