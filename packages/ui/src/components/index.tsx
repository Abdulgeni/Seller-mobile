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
import { tokens } from "../tokens";

// Button
export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger" | "outline";
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

  const bgColor = disabled
    ? tokens.colors.light.surfaceSubtle
    : isDanger
    ? tokens.colors.light.danger
    : isSecondary
    ? tokens.colors.light.surfaceSubtle
    : isOutline
    ? "transparent"
    : tokens.colors.light.primary;

  const textColor = disabled
    ? tokens.colors.light.contentMuted
    : isDanger
    ? tokens.colors.light.dangerForeground
    : isSecondary
    ? tokens.colors.light.contentPrimary
    : isOutline
    ? tokens.colors.light.primary
    : tokens.colors.light.primaryForeground;

  const height = size === "sm" ? 36 : size === "lg" ? 52 : tokens.touchTarget.minHeight;

  return (
    <Pressable
      onPress={onPress}
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
          borderColor: isOutline ? tokens.colors.light.primary : tokens.colors.light.border,
          borderWidth: isOutline ? 1 : 0,
          opacity: pressed ? 0.8 : 1,
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

// Card
export interface CardProps extends ViewProps {
  children: React.ReactNode;
}

export function Card({ children, style, ...props }: CardProps): React.JSX.Element {
  return (
    <View style={[styles.card, style]} {...props}>
      {children}
    </View>
  );
}

// Badge
export interface BadgeProps {
  label: string;
  variant?: "new" | "accepted" | "packed" | "shipped" | "delivered" | "cancelled" | "default";
}

export function Badge({ label, variant = "default" }: BadgeProps): React.JSX.Element {
  let bg: string = tokens.colors.light.surfaceSubtle;
  let text: string = tokens.colors.light.contentSecondary;

  switch (variant) {
    case "new":
      bg = tokens.colors.light.badgeNewBg;
      text = tokens.colors.light.badgeNewText;
      break;
    case "accepted":
      bg = tokens.colors.light.badgeAcceptedBg;
      text = tokens.colors.light.badgeAcceptedText;
      break;
    case "packed":
      bg = tokens.colors.light.badgePackedBg;
      text = tokens.colors.light.badgePackedText;
      break;
    case "shipped":
      bg = tokens.colors.light.badgeShippedBg;
      text = tokens.colors.light.badgeShippedText;
      break;
    case "delivered":
      bg = tokens.colors.light.badgeDeliveredBg;
      text = tokens.colors.light.badgeDeliveredText;
      break;
    case "cancelled":
      bg = tokens.colors.light.badgeCancelledBg;
      text = tokens.colors.light.badgeCancelledText;
      break;
  }

  return (
    <View style={[styles.badgeContainer, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color: text }]}>{label}</Text>
    </View>
  );
}

// Input
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
          error ? { borderColor: tokens.colors.light.danger } : null,
          style,
        ]}
        placeholderTextColor={tokens.colors.light.contentMuted}
        {...props}
      />
      {error && <Text style={styles.inputError}>{error}</Text>}
    </View>
  );
}

// Skeleton
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

// Empty State
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
    fontSize: 16,
    fontWeight: "600",
  },
  card: {
    backgroundColor: tokens.colors.light.surface,
    borderRadius: tokens.radii.md,
    padding: tokens.spacing.md,
    borderColor: tokens.colors.light.border,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  badgeContainer: {
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: tokens.spacing.xs,
    borderRadius: tokens.radii.full,
    alignSelf: "flex-start",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  inputWrapper: {
    marginBottom: tokens.spacing.md,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: tokens.colors.light.contentSecondary,
    marginBottom: tokens.spacing.xs,
  },
  inputField: {
    height: tokens.touchTarget.minHeight,
    backgroundColor: tokens.colors.light.surface,
    borderColor: tokens.colors.light.border,
    borderWidth: 1,
    borderRadius: tokens.radii.md,
    paddingHorizontal: tokens.spacing.md,
    fontSize: 16,
    color: tokens.colors.light.contentPrimary,
  },
  inputError: {
    fontSize: 12,
    color: tokens.colors.light.danger,
    marginTop: tokens.spacing.xs,
  },
  skeleton: {
    backgroundColor: tokens.colors.light.surfaceSubtle,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: tokens.spacing.xl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: tokens.colors.light.contentPrimary,
    textAlign: "center",
  },
  emptyDescription: {
    fontSize: 14,
    color: tokens.colors.light.contentSecondary,
    marginTop: tokens.spacing.xs,
    textAlign: "center",
  },
  emptyActionWrapper: {
    marginTop: tokens.spacing.md,
  },
});
