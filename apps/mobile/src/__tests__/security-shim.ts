export const hasHardwareAsync = async () => true;
export const isEnrolledAsync = async () => true;
export const authenticateAsync = async () => ({ success: true });
export const setItemAsync = async () => {};
export const getItemAsync = async (key: string) => `mock_secret_token_${key}`;
export const deleteItemAsync = async () => {};

export default {
  hasHardwareAsync,
  isEnrolledAsync,
  authenticateAsync,
  setItemAsync,
  getItemAsync,
  deleteItemAsync,
};
