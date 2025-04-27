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
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
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
        temperature: 1,
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
        model: 'o3-mini-2025-01-31',
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
        temperature: 1,
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
