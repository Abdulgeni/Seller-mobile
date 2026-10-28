export const setNotificationHandler = () => {};

export const setNotificationCategoryAsync = async () => [];

export const getPermissionsAsync = async () => ({
  status: "granted",
  granted: true,
  canAskAgain: true,
  expires: "never",
});

export const requestPermissionsAsync = async () => ({
  status: "granted",
  granted: true,
  canAskAgain: true,
  expires: "never",
});

export const getExpoPushTokenAsync = async () => ({
  data: "mock_fcm_token_test",
  type: "expo",
});

export const scheduleNotificationAsync = async () => "mock_notif_scheduled_id";

export const addNotificationReceivedListener = () => ({
  remove: () => {},
});

export const addNotificationResponseReceivedListener = () => ({
  remove: () => {},
});

export default {
  setNotificationHandler,
  setNotificationCategoryAsync,
  getPermissionsAsync,
  requestPermissionsAsync,
  getExpoPushTokenAsync,
  scheduleNotificationAsync,
  addNotificationReceivedListener,
  addNotificationResponseReceivedListener,
};
