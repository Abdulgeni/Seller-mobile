import React from "react";

export function useSafeAreaInsets() {
  return { top: 44, bottom: 34, left: 0, right: 0 };
}

export function SafeAreaProvider({ children }: { children: React.ReactNode }) {
  return children;
}

export function SafeAreaView({ children }: { children: React.ReactNode }) {
  return children;
}

export default {
  useSafeAreaInsets,
  SafeAreaProvider,
  SafeAreaView,
};
