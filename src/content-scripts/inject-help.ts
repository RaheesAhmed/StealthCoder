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

    .stealth-coder-content pre {
      background-color: rgba(0, 0, 0, 0.3);
      padding: 8px;
      border-radius: 5px;
      margin: 10px 0;
      overflow-x: auto;
    }

    .stealth-coder-content pre code {
      background-color: transparent;
      padding: 0;
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

    .stealth-coder-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 10px;
      padding-top: 10px;
      border-top: 1px solid #444;
    }

    .stealth-coder-button {
      background-color: #00ff9d;
      color: #1e1e1e;
      border: none;
      border-radius: 4px;
      padding: 5px 10px;
      font-size: 12px;
      font-weight: bold;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .stealth-coder-button:hover {
      background-color: #00cc7d;
    }

    .stealth-coder-button + .stealth-coder-button {
      margin-left: 8px;
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

// Global variable to store the extracted code
let extractedCode = '';

// Extract code from AI response
const extractCodeFromResponse = (response: string): string => {
  // Look for code blocks in the response
  const codeBlockRegex = /```(\w*)([\s\S]*?)```/g;
  const matches = [...response.matchAll(codeBlockRegex)];

  if (matches.length > 0) {
    // Find the largest code block (likely the solution)
    let largestCodeBlock = '';
    for (const match of matches) {
      const code = match[2].trim();
      if (code.length > largestCodeBlock.length) {
        largestCodeBlock = code;
      }
    }
    return largestCodeBlock;
  }

  return '';
};

// Show AI response
const showResponse = (container: HTMLElement, response: string) => {
  const content = container.querySelector('.stealth-coder-content');

  // Extract code from the response
  extractedCode = extractCodeFromResponse(response);

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

  // Automatically insert code if found
  if (extractedCode) {
    // Use setTimeout to give the UI a moment to update before inserting code
    setTimeout(() => {
      insertCodeToEditor();
      // Hide the UI after inserting code
      toggleStealthMode(false);
    }, 500);
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

                IMPORTANT: I need a solution that will pass ALL test cases. Your code will be automatically inserted into the editor and run.

                Please provide:
                1. The most optimal solution with the correct time and space complexity
                2. Code that handles ALL edge cases and corner cases
                3. Clean, well-commented code that follows best practices

                Format your response with the complete solution code in a SINGLE code block using triple backticks.

                DO NOT include any explanations or analysis outside the code block - ONLY provide the working solution code.`
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

// Find code editor on the page
const findCodeEditor = (): HTMLElement | null => {
  // Different selectors for different platforms
  const editorSelectors = [
    // LeetCode
    '.CodeMirror',
    '.monaco-editor',
    // HackerRank
    '.inputarea',
    '.CodeMirror-code',
    // CodeSignal
    '.cm-content',
    // Generic
    '[role="code-editor"]',
    '[data-mode="text/javascript"]',
    '[data-mode="text/python"]',
    '[data-mode="text/java"]',
    '[data-mode="text/cpp"]',
    'textarea.code-editor',
    // Monaco editor (used by many platforms)
    '.monaco-editor .view-lines',
  ];

  for (const selector of editorSelectors) {
    const editor = document.querySelector(selector);
    if (editor) {
      return editor as HTMLElement;
    }
  }

  return null;
};

// Clear the code editor before inserting new code
const clearCodeEditor = (editor: HTMLElement): boolean => {
  try {
    if (editor.classList.contains('CodeMirror')) {
      // CodeMirror editor (used by LeetCode and others)
      const cmInstance = (editor as any).__vue__ || (editor as any).CodeMirror;
      if (cmInstance && cmInstance.setValue) {
        cmInstance.setValue(''); // Clear the editor
        return true;
      } else {
        // Fallback for CodeMirror
        const textarea = editor.querySelector('textarea');
        if (textarea) {
          textarea.value = '';
          textarea.dispatchEvent(new Event('input', { bubbles: true }));
          return true;
        }
      }
    } else if (editor.classList.contains('monaco-editor') || editor.classList.contains('view-lines')) {
      // Monaco editor (used by many platforms)

      // Special handling for LeetCode's Monaco editor
      const leetCodeMonacoInstance = (window as any).monaco?.editor?.getModels?.()?.[0];
      if (leetCodeMonacoInstance) {
        leetCodeMonacoInstance.setValue('');
        return true;
      } else {
        // Try to find the textarea inside Monaco as a fallback
        const textarea = editor.querySelector('textarea');
        if (textarea) {
          textarea.value = '';
          textarea.dispatchEvent(new Event('input', { bubbles: true }));
          textarea.dispatchEvent(new Event('change', { bubbles: true }));
          return true;
        }
      }
    } else {
      // Generic approach for other editors
      if (editor.tagName === 'TEXTAREA') {
        (editor as HTMLTextAreaElement).value = '';
        editor.dispatchEvent(new Event('input', { bubbles: true }));
        return true;
      } else {
        editor.textContent = '';
        editor.dispatchEvent(new Event('input', { bubbles: true }));
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Error clearing editor:', error);
    return false;
  }
};

// Insert code into the editor
const insertCodeToEditor = () => {
  if (!extractedCode) {
    console.error('No code found to insert');
    return;
  }

  try {
    // Find the code editor
    const editor = findCodeEditor();

    if (!editor) {
      // If we can't find a specific editor, try to find any textarea or contenteditable element
      const fallbackEditors = document.querySelectorAll('textarea, [contenteditable="true"]');

      if (fallbackEditors.length > 0) {
        // Use the first textarea or contenteditable element we find
        const fallbackEditor = fallbackEditors[0] as HTMLElement;

        // Clear the editor first
        if (fallbackEditor.tagName === 'TEXTAREA') {
          (fallbackEditor as HTMLTextAreaElement).value = '';
          (fallbackEditor as HTMLTextAreaElement).dispatchEvent(new Event('input', { bubbles: true }));
        } else {
          fallbackEditor.textContent = '';
          fallbackEditor.dispatchEvent(new Event('input', { bubbles: true }));
        }

        // Then insert the new code
        if (fallbackEditor.tagName === 'TEXTAREA') {
          (fallbackEditor as HTMLTextAreaElement).value = extractedCode;
          (fallbackEditor as HTMLTextAreaElement).dispatchEvent(new Event('input', { bubbles: true }));
        } else {
          fallbackEditor.textContent = extractedCode;
          fallbackEditor.dispatchEvent(new Event('input', { bubbles: true }));
        }

        // Simulate clicking the run button
        simulateKeyboardShortcut();
        return;
      }

      // If we still can't find an editor, log an error
      console.error('Could not find a code editor on this page');
      return;
    }

    // Clear the editor first
    clearCodeEditor(editor);

    // Different approaches based on editor type
    if (editor.classList.contains('CodeMirror')) {
      // CodeMirror editor (used by LeetCode and others)
      const cmInstance = (editor as any).__vue__ || (editor as any).CodeMirror;
      if (cmInstance && cmInstance.setValue) {
        cmInstance.setValue(extractedCode);
      } else {
        // Fallback for CodeMirror
        const textarea = editor.querySelector('textarea');
        if (textarea) {
          textarea.value = extractedCode;
          textarea.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }
    } else if (editor.classList.contains('monaco-editor') || editor.classList.contains('view-lines')) {
      // Monaco editor (used by many platforms)
      // This is more complex as Monaco uses a model

      // Special handling for LeetCode's Monaco editor
      const leetCodeMonacoInstance = (window as any).monaco?.editor?.getModels?.()?.[0];
      if (leetCodeMonacoInstance) {
        leetCodeMonacoInstance.setValue(extractedCode);
      } else {
        // Try to find the textarea inside Monaco as a fallback
        const textarea = editor.querySelector('textarea');
        if (textarea) {
          textarea.value = extractedCode;
          textarea.dispatchEvent(new Event('input', { bubbles: true }));

          // Also try to dispatch a change event
          textarea.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
    } else {
      // Generic approach for other editors
      if (editor.tagName === 'TEXTAREA') {
        (editor as HTMLTextAreaElement).value = extractedCode;
      } else {
        editor.textContent = extractedCode;
      }

      // Dispatch input event to trigger any listeners
      editor.dispatchEvent(new Event('input', { bubbles: true }));
    }

    // Simulate clicking the run button
    simulateKeyboardShortcut();
  } catch (error) {
    console.error('Error inserting code:', error);
  }
};

// Check if all tests passed and submit the solution
const checkTestsAndSubmit = () => {
  // Wait for test results to appear
  setTimeout(() => {
    // Common selectors for test result indicators
    const passSelectors = [
      '.test-case-success', // Common class for passed tests
      '[data-e2e-locator="console-test-result-success"]',
      '.success-icon',
      '.test-success',
      '.test-result-success',
      '.passed-test',
      '[data-cy="test-success"]',
      // Text-based detection
      'div:contains("All test cases passed")',
      'span:contains("All test cases passed")',
      'div:contains("Accepted")',
      'span:contains("Accepted")',
    ];

    // Check if all tests passed
    let allTestsPassed = false;

    // First check for specific success indicators
    for (const selector of passSelectors) {
      try {
        const successElement = document.querySelector(selector);
        if (successElement) {
          console.log('Found success indicator with selector:', selector);
          allTestsPassed = true;
          break;
        }
      } catch (error) {
        // Ignore errors with invalid selectors
      }
    }

    // If no specific success indicator found, check for test result elements
    if (!allTestsPassed) {
      // Look for test case elements
      const testCaseElements = document.querySelectorAll('.test-case, .test-result, [data-cy="test-case"]');
      if (testCaseElements.length > 0) {
        // Check if all test cases have passed
        allTestsPassed = true;
        for (const element of testCaseElements) {
          const text = element.textContent?.toLowerCase() || '';
          if (text.includes('fail') || text.includes('error') || text.includes('wrong')) {
            allTestsPassed = false;
            break;
          }
        }
      }
    }

    // If all tests passed, click the submit button
    if (allTestsPassed) {
      console.log('All tests passed, submitting solution...');

      // Submit button selectors
      const submitButtonSelectors = [
        '[data-e2e-locator="console-submit-button"]',
        '.submit-button',
        '#submit-button',
        '[data-cy="submit-button"]',
        'button.submit',
        '[title="Submit"]',
        '[aria-label="Submit"]',
        // More generic selectors
        'button:contains("Submit")',
        'button:contains("Submit Solution")',
      ];

      // Try to find and click the submit button
      for (const selector of submitButtonSelectors) {
        try {
          const submitButton = document.querySelector(selector) as HTMLElement;
          if (submitButton) {
            console.log('Found submit button with selector:', selector);
            submitButton.click();
            return;
          }
        } catch (error) {
          // Ignore errors with invalid selectors
        }
      }

      // If no button found, try to find any button with "Submit" text
      const allButtons = document.querySelectorAll('button');
      for (const button of allButtons) {
        const buttonText = button.textContent?.toLowerCase() || '';
        if (buttonText.includes('submit')) {
          console.log('Found submit button by text content:', buttonText);
          (button as HTMLElement).click();
          return;
        }
      }

      console.log('Could not find a submit button');
    } else {
      console.log('Not all tests passed, not submitting');
    }
  }, 3000); // Wait 3 seconds for test results to appear
};

// Simulate keyboard shortcut to trigger the run button
const simulateKeyboardShortcut = () => {
  // Wait a short time to ensure the editor has processed the input
  setTimeout(() => {
    // Find and click the run button
    const runButtonSelectors = [
      '[data-e2e-locator="console-run-button"]',
      '.run-code-btn',
      '#run-code',
      '[data-cy="run-code-btn"]',
      'button.run',
      '.submit-code',
      '[title="Run Code"]',
      '[aria-label="Run Code"]',
      // More generic selectors
      'button:contains("Run")',
      'button:contains("Execute")',
      '.execute-code',
      '[title*="Run"]',
      '[aria-label*="Run"]',
      // Try to find buttons with Run text
      'button',
    ];

    // First try exact selectors
    for (const selector of runButtonSelectors) {
      try {
        const runButton = document.querySelector(selector) as HTMLElement;
        if (runButton) {
          console.log('Found run button with selector:', selector);
          runButton.click();

          // After clicking run, check if tests pass and submit
          checkTestsAndSubmit();
          return;
        }
      } catch (error) {
        // Ignore errors with invalid selectors
      }
    }

    // If no button found, try to find any button with "Run" text
    const allButtons = document.querySelectorAll('button');
    for (const button of allButtons) {
      const buttonText = button.textContent?.toLowerCase() || '';
      if (buttonText.includes('run') || buttonText.includes('execute')) {
        console.log('Found run button by text content:', buttonText);
        (button as HTMLElement).click();

        // After clicking run, check if tests pass and submit
        checkTestsAndSubmit();
        return;
      }
    }

    console.log('Could not find a run button');
  }, 300); // Wait 300ms before trying to click the run button
};

// Copy code to clipboard
const copyCodeToClipboard = () => {
  if (!extractedCode) {
    alert('No code found to copy');
    return;
  }

  navigator.clipboard.writeText(extractedCode)
    .then(() => {
      const copyButton = document.querySelector('.stealth-coder-copy') as HTMLElement;
      if (copyButton) {
        const originalText = copyButton.textContent;
        copyButton.textContent = 'Copied!';
        setTimeout(() => {
          copyButton.textContent = originalText;
        }, 2000);
      }
    })
    .catch(err => {
      console.error('Error copying code to clipboard:', err);
      alert('Error copying code to clipboard');
    });
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
