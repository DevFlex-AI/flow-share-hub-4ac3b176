
const OPENAI_KEY_STORAGE_KEY = 'openai_api_key';
const GEMINI_KEY_STORAGE_KEY = 'gemini_api_key';

export const setOpenAIKey = (key: string) => {
  localStorage.setItem(OPENAI_KEY_STORAGE_KEY, key);
};

export const getOpenAIKey = () => {
  return localStorage.getItem(OPENAI_KEY_STORAGE_KEY);
};

export const removeOpenAIKey = () => {
  localStorage.removeItem(OPENAI_KEY_STORAGE_KEY);
};

export const setGeminiKey = (key: string) => {
  localStorage.setItem(GEMINI_KEY_STORAGE_KEY, key);
};

export const getGeminiKey = () => {
  return localStorage.getItem(GEMINI_KEY_STORAGE_KEY);
};

export const removeGeminiKey = () => {
  localStorage.removeItem(GEMINI_KEY_STORAGE_KEY);
};
