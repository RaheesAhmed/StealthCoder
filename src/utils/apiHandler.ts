// API Handler for StealthCoder extension

// Define types for our settings
export interface StealthCoderSettings {
  apiKey: string;
  model: 'gemini' | 'claude' | 'gpt4' | string;
  shortcut: string;
}

// Default settings
export const DEFAULT_SETTINGS: StealthCoderSettings = {
  apiKey: '',
  model: 'gemini',
  shortcut: 'Ctrl+Shift+A',
};

// Get settings from storage
export const getSettings = async (): Promise<StealthCoderSettings> => {
  return new Promise((resolve) => {
    chrome.storage.local.get(['settings'], (result) => {
      resolve(result.settings || DEFAULT_SETTINGS);
    });
  });
};

// Save settings to storage
export const saveSettings = async (settings: StealthCoderSettings): Promise<boolean> => {
  return new Promise((resolve) => {
    chrome.storage.local.set({ settings }, () => {
      resolve(true);
    });
  });
};

// Call the appropriate AI API based on the model setting
export const callAIAPI = async (prompt: string, settings: StealthCoderSettings): Promise<string> => {
  const { apiKey, model } = settings;

  if (!apiKey) {
    throw new Error('API key not set. Please configure in extension settings.');
  }

  // Call different APIs based on the selected model
  switch (model) {
    case 'gemini':
      return callGeminiAPI(prompt, apiKey);
    case 'claude':
      return callClaudeAPI(prompt, apiKey);
    case 'gpt4':
      return callGPT4API(prompt, apiKey);
    default:
      throw new Error(`Unsupported model: ${model}`);
  }
};

// Gemini API implementation
export const callGeminiAPI = async (prompt: string, apiKey: string): Promise<string> => {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `You are StealthCoder, an AI assistant helping with coding problems.
                Please analyze this problem and provide a solution:
                ${prompt}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 1,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Error calling Gemini API');
    }

    // Handle the response format correctly
    if (data.candidates && data.candidates.length > 0 &&
        data.candidates[0].content &&
        data.candidates[0].content.parts &&
        data.candidates[0].content.parts.length > 0) {
      return data.candidates[0].content.parts[0].text;
    } else {
      throw new Error('Unexpected response format from Gemini API');
    }
  } catch (error: unknown) {
    console.error('Gemini API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Gemini API error: ${errorMessage}`);
  }
};

// Claude API implementation
export const callClaudeAPI = async (prompt: string, apiKey: string): Promise<string> => {
  try {
    // Create a mock response for testing purposes
    // This is a temporary solution until we can implement a proper proxy
    console.log("Using mock Claude response due to CORS limitations", { promptLength: prompt.length, apiKeyProvided: !!apiKey });

    // Simulate a delay to mimic API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Return a mock response
    return `# Claude Analysis (Mock Response)

## Problem Understanding
I'm analyzing your coding problem. Due to CORS limitations in Chrome extensions,
this is a mock response. In a real implementation, we would need to use a proxy server
or a different approach to make API calls to Claude.

## Solution Approach
For now, please use the GPT-4 model which is working correctly.

## Code Solution
\`\`\`javascript
// This is a mock solution
function solveProblem(input) {
  // Your solution would go here
  return "Solution";
}
\`\`\`

## Next Steps
To fix the Claude API integration, consider:
1. Using a proxy server
2. Using a Chrome extension API like chrome.runtime.sendNativeMessage
3. Implementing a local server that handles the API calls

For now, please use GPT-4 which is working correctly.`;

    /*
    // This is the original implementation that doesn't work due to CORS
    // Keeping it here for reference
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Origin': 'chrome-extension://kogllpicpedniagaheanoeaffhlkfjih'
      },
      // Add CORS mode
      mode: 'cors',
      credentials: 'omit',
      body: JSON.stringify({
        model: 'claude-3-7-sonnet-20250219',
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: `You are StealthCoder, an AI assistant helping with coding problems.
            Please analyze this problem and provide a solution:
            ${prompt}`
          }
        ],
        temperature: 0.2,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Error calling Claude API');
    }

    // Updated to match the correct response format
    if (data.content && Array.isArray(data.content) && data.content.length > 0) {
      return data.content[0].text;
    } else {
      throw new Error('Unexpected response format from Claude API');
    }
    */
  } catch (error: unknown) {
    console.error('Claude API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Claude API error: ${errorMessage}`);
  }
};

// GPT-4 API implementation
export const callGPT4API = async (prompt: string, apiKey: string): Promise<string> => {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are StealthCoder, an AI assistant helping with coding problems.'
          },
          {
            role: 'user',
            content: `Please analyze this problem and provide a solution: ${prompt}`
          }
        ],
        temperature: 0.2,
        max_tokens: 4000,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Error calling GPT-4 API');
    }

    return data.choices[0].message.content;
  } catch (error: unknown) {
    console.error('GPT-4 API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`GPT-4 API error: ${errorMessage}`);
  }
};
