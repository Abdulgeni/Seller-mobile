import { useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";
import { motionTokens } from "../tokens";

/**
 * Global hook to observe and respect system Reduce Motion settings.
 * Guarantees static/instant fallback for all animations when enabled.
 */
export function useReducedMotion(): boolean {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let mounted = true;

    void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) {
        setReduceMotion(enabled);
      }
    });

    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      (enabled) => {
        setReduceMotion(enabled);
      }
    );

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  return reduceMotion;
}

export const physicalSpringConfig = motionTokens.springs.physical;
export const pressSpringConfig = motionTokens.springs.press;
export const popSpringConfig = motionTokens.springs.pop;
export const motionDurations = motionTokens.durations;

export * from "./NumericRoll";
export * from "./LaunchRevealGate";
