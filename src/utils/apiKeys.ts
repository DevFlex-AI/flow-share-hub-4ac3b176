
const OPENAI_KEY_STORAGE_KEY = 'openai_api_key';

export const setOpenAIKey = (key: string) => {
  localStorage.setItem(OPENAI_KEY_STORAGE_KEY, key);
};

export const getOpenAIKey = () => {
  return localStorage.getItem(OPENAI_KEY_STORAGE_KEY);
};

export const removeOpenAIKey = () => {
  localStorage.removeItem(OPENAI_KEY_STORAGE_KEY);
};
