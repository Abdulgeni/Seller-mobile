export const StyleSheet = {
  create: (styles: Record<string, unknown>) => styles,
};
export const Text = () => null;
export const View = () => null;
export const Pressable = () => null;
export const TextInput = () => null;
export const ActivityIndicator = () => null;
export const TouchableOpacity = () => null;
export const Modal = () => null;
export const ScrollView = () => null;
export const Alert = { alert: () => {} };
export const Platform = {
  OS: "android" as const,
  select: <T>(obj: { ios?: T; android?: T; default?: T }): T | undefined => obj.android ?? obj.default ?? obj.ios,
};
export default {
  StyleSheet,
  Text,
  View,
  Pressable,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  Platform,
};
