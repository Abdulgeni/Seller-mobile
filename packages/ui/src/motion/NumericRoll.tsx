import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, type TextStyle } from "react-native";
import { tokens } from "../tokens";
import { useReducedMotion } from "./index";

export interface NumericRollProps {
  value: number;
  prefix?: string;
  suffix?: string;
  durationMs?: number;
  decimals?: number;
  style?: TextStyle | TextStyle[];
}

export function NumericRoll({
  value,
  prefix = "",
  suffix = "",
  durationMs = 450,
  decimals = 0,
  style,
}: NumericRollProps): React.JSX.Element {
  const isReducedMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = useState<number>(() => (isReducedMotion ? value : 0));
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    if (isReducedMotion) {
      setDisplayValue(value);
      return;
    }

    if (hasAnimatedRef.current) {
      setDisplayValue(value);
      return;
    }

    hasAnimatedRef.current = true;
    const startValue = 0;
    const endValue = value;
    const startTime = Date.now();

    let animationFrameId: number;

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(1, elapsed / durationMs);

      // Ease-out cubic: 1 - (1 - t)^3
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (endValue - startValue) * easeOut;

      setDisplayValue(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(tick);
      } else {
        setDisplayValue(endValue);
      }
    };

    animationFrameId = requestAnimationFrame(tick);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [value, durationMs, isReducedMotion]);

  const formattedNumber =
    decimals > 0
      ? displayValue.toLocaleString(undefined, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })
      : Math.round(displayValue).toLocaleString();

  return (
    <Text style={[styles.tabularText, style]}>
      {prefix}
      {formattedNumber}
      {suffix}
    </Text>
  );
}

const styles = StyleSheet.create({
  tabularText: {
    fontVariant: ["tabular-nums"],
    color: tokens.colors.light.contentPrimary,
  },
});
