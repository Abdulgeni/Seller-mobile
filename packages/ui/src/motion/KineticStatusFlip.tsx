import React, { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { hapticFeedback } from "../haptics";
import { useReducedMotion } from "./index";

export interface KineticStatusFlipProps {
  status: string;
  children: React.ReactNode;
}

export function KineticStatusFlip({
  status,
  children,
}: KineticStatusFlipProps): React.JSX.Element {
  const isReducedMotion = useReducedMotion();
  const [scaleAnim] = useState(() => new Animated.Value(1));
  const prevStatusRef = useRef(status);

  useEffect(() => {
    if (prevStatusRef.current !== status) {
      prevStatusRef.current = status;
      hapticFeedback.success();

      if (!isReducedMotion) {
        Animated.sequence([
          Animated.spring(scaleAnim, {
            toValue: 1.15,
            tension: 100,
            friction: 6,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 70,
            friction: 10,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }
  }, [status, isReducedMotion, scaleAnim]);

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: "flex-start",
  },
});
