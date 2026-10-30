import React from "react";
import {
  ActivityIndicator,
  type DimensionValue,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
  type ViewProps,
} from "react-native";
import { hapticFeedback } from "../haptics";
import { tokens } from "../tokens";

// ─── BUTTON ─────────────────────────────────────────────────────────────
export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger" | "outline" | "gold";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  accessibilityLabel?: string;
}

export function Button({
  title,
  onPress,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  accessibilityLabel,
}: ButtonProps): React.JSX.Element {
  const isDanger = variant === "danger";
  const isSecondary = variant === "secondary";
  const isOutline = variant === "outline";
  const isGold = variant === "gold";

  const bgColor = disabled
    ? tokens.colors.light.bgRaised
    : isDanger
    ? tokens.colors.light.critical
    : isSecondary
    ? tokens.colors.light.bgRaised
    : isOutline
    ? "transparent"
    : isGold
    ? tokens.colors.light.gold
    : tokens.colors.light.accent;

  const textColor = disabled
    ? tokens.colors.light.textTertiary
    : isDanger
    ? tokens.colors.light.textInverse
    : isSecondary
    ? tokens.colors.light.textPrimary
    : isOutline
    ? tokens.colors.light.accent
    : tokens.colors.light.textInverse;

  const height = size === "sm" ? 38 : size === "lg" ? 52 : tokens.touchTarget.minHeight;

  const handlePress = () => {
    void hapticFeedback.buttonPress();
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      style={({ pressed }) => [
        styles.buttonBase,
        {
          backgroundColor: bgColor,
          height,
          minHeight: tokens.touchTarget.minHeight,
          minWidth: tokens.touchTarget.minWidth,
          borderColor: isOutline ? tokens.colors.light.accent : "transparent",
          borderWidth: isOutline ? 1 : 0,
          opacity: pressed ? 0.88 : 1,
          transform: [{ scale: pressed ? 0.985 : 1.0 }],
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <Text style={[styles.buttonText, { color: textColor }]}>{title}</Text>
      )}
    </Pressable>
  );
}

// ─── CARD ───────────────────────────────────────────────────────────────
export interface CardProps extends ViewProps {
  children: React.ReactNode;
  variant?: "standard" | "raised" | "flat";
}

export function Card({ children, style, variant = "standard", ...props }: CardProps): React.JSX.Element {
  const elevationStyle =
    variant === "raised"
      ? tokens.elevation.light.raised
      : variant === "flat"
      ? null
      : tokens.elevation.light.card;

  return (
    <View style={[styles.card, elevationStyle, style]} {...props}>
      {children}
    </View>
  );
}

// ─── BADGE ──────────────────────────────────────────────────────────────
export interface BadgeProps {
  label: string;
  variant?:
    | "new"
    | "accepted"
    | "packed"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "critical"
    | "warning"
    | "success"
    | "info"
    | "default";
  size?: "sm" | "md";
}

export function Badge({ label, variant = "default" }: BadgeProps): React.JSX.Element {
  let bg: string = tokens.colors.light.bgRaised;
  let text: string = tokens.colors.light.textSecondary;
  let dotColor: string = tokens.colors.light.textTertiary;

  switch (variant) {
    case "new":
    case "info":
      bg = tokens.colors.light.badgeNewBg;
      text = tokens.colors.light.badgeNewText;
      dotColor = tokens.colors.light.accent;
      break;
    case "accepted":
    case "warning":
      bg = tokens.colors.light.badgeAcceptedBg;
      text = tokens.colors.light.badgeAcceptedText;
      dotColor = tokens.colors.light.gold;
      break;
    case "packed":
      bg = tokens.colors.light.badgePackedBg;
      text = tokens.colors.light.badgePackedText;
      dotColor = tokens.colors.light.textSecondary;
      break;
    case "shipped":
      bg = tokens.colors.light.badgeShippedBg;
      text = tokens.colors.light.badgeShippedText;
      dotColor = tokens.colors.light.textPrimary;
      break;
    case "delivered":
    case "success":
      bg = tokens.colors.light.badgeDeliveredBg;
      text = tokens.colors.light.badgeDeliveredText;
      dotColor = tokens.colors.light.positive;
      break;
    case "cancelled":
    case "critical":
      bg = tokens.colors.light.badgeCancelledBg;
      text = tokens.colors.light.badgeCancelledText;
      dotColor = tokens.colors.light.critical;
      break;
  }

  return (
    <View style={[styles.badgeContainer, { backgroundColor: bg }]}>
      <View style={[styles.badgeDot, { backgroundColor: dotColor }]} />
      <Text style={[styles.badgeText, { color: text }]}>{label}</Text>
    </View>
  );
}

// ─── INPUT ──────────────────────────────────────────────────────────────
export interface InputProps extends TextInputProps {
  label?: string | undefined;
  error?: string | undefined;
}

export function Input({ label, error, style, ...props }: InputProps): React.JSX.Element {
  return (
    <View style={styles.inputWrapper}>
      {label && <Text style={styles.inputLabel}>{label}</Text>}
      <TextInput
        style={[
          styles.inputField,
          error ? { borderColor: tokens.colors.light.critical } : null,
          style,
        ]}
        placeholderTextColor={tokens.colors.light.textTertiary}
        {...props}
      />
      {error && <Text style={styles.inputError}>{error}</Text>}
    </View>
  );
}

// ─── SKELETON ───────────────────────────────────────────────────────────
export function Skeleton({
  width = "100%",
  height = 20,
  borderRadius = tokens.radii.sm,
}: {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
}): React.JSX.Element {
  return (
    <View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
        },
      ]}
    />
  );
}

// ─── EMPTY STATE ────────────────────────────────────────────────────────
export function EmptyState({
  title,
  description,
  actionTitle,
  onAction,
}: {
  title: string;
  description?: string;
  actionTitle?: string;
  onAction?: () => void;
}): React.JSX.Element {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>{title}</Text>
      {description && <Text style={styles.emptyDescription}>{description}</Text>}
      {actionTitle && onAction && (
        <View style={styles.emptyActionWrapper}>
          <Button title={actionTitle} onPress={onAction} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  buttonBase: {
    borderRadius: tokens.radii.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: tokens.spacing.md,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: -0.1,
  },
  card: {
    backgroundColor: tokens.colors.light.bgSurface,
    borderRadius: tokens.radii.lg,
    padding: tokens.spacing.md,
    borderColor: tokens.colors.light.borderSubtle,
    borderWidth: 0.5,
  },
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: tokens.spacing.xs,
    borderRadius: tokens.radii.full,
    alignSelf: "flex-start",
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.1,
  },
  inputWrapper: {
    marginBottom: tokens.spacing.md,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: tokens.colors.light.textSecondary,
    marginBottom: tokens.spacing.xs,
    letterSpacing: 0.0,
  },
  inputField: {
    height: 48,
    borderRadius: tokens.radii.md,
    borderWidth: 1,
    borderColor: tokens.colors.light.borderStrong,
    backgroundColor: tokens.colors.light.bgSurface,
    paddingHorizontal: tokens.spacing.md,
    fontSize: 15,
    color: tokens.colors.light.textPrimary,
  },
  inputError: {
    fontSize: 12,
    color: tokens.colors.light.critical,
    marginTop: tokens.spacing.xs,
  },
  skeleton: {
    backgroundColor: tokens.colors.light.bgRaised,
  },
  emptyContainer: {
    padding: tokens.spacing.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: tokens.colors.light.textPrimary,
    textAlign: "center",
    marginBottom: tokens.spacing.xs,
    letterSpacing: -0.2,
  },
  emptyDescription: {
    fontSize: 14,
    color: tokens.colors.light.textSecondary,
    textAlign: "center",
    marginBottom: tokens.spacing.lg,
    lineHeight: 20,
  },
  emptyActionWrapper: {
    minWidth: 160,
  },
});

export * from "./SparklineChart";
