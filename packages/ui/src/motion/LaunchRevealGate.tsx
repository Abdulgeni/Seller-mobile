import React, { useEffect, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { tokens } from "../tokens";
import { useReducedMotion } from "./index";

export interface LaunchRevealGateProps {
  children: React.ReactNode;
}

export function LaunchRevealGate({ children }: LaunchRevealGateProps): React.JSX.Element {
  const isReducedMotion = useReducedMotion();
  const [isDismissed, setIsDismissed] = useState(false);

  const [opacityAnim] = useState(() => new Animated.Value(1));
  const [scaleAnim] = useState(() => new Animated.Value(0.92));

  useEffect(() => {
    if (isReducedMotion) {
      setIsDismissed(true);
      return;
    }

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 68,
        friction: 12,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(280),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      setIsDismissed(true);
    });
  }, [isReducedMotion, opacityAnim, scaleAnim]);

  return (
    <View style={styles.container}>
      {children}
      {!isDismissed && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.overlay,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.emblemContainer}>
            <View style={styles.emblemBadge}>
              <Text style={styles.emblemText}>✦</Text>
            </View>
            <Text style={styles.brandTitle}>ATELIER</Text>
            <Text style={styles.brandSubtitle}>MERCHANT SIGNATURE</Text>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: tokens.colors.light.bgCanvas,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  emblemContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  emblemBadge: {
    width: 64,
    height: 64,
    borderRadius: tokens.radii.lg,
    backgroundColor: tokens.colors.light.bgRaised,
    borderWidth: 1,
    borderColor: tokens.colors.light.gold,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: tokens.spacing.md,
  },
  emblemText: {
    fontSize: 28,
    color: tokens.colors.light.accent,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 4,
    color: tokens.colors.light.contentPrimary,
    marginBottom: tokens.spacing.xs,
  },
  brandSubtitle: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 2,
    color: tokens.colors.light.contentSecondary,
  },
});
