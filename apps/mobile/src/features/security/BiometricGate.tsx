import React, { useEffect } from "react";
import { AppState, StyleSheet, Text, View } from "react-native";
import { Button, Card, tokens } from "@repo/ui";
import { useBiometricSecurityStore } from "./biometricAuth";

export interface BiometricGateProps {
  children: React.ReactNode;
  title?: string;
}

export function BiometricGate({
  children,
  title = "Financial Security Gate",
}: BiometricGateProps): React.JSX.Element {
  const isAuthenticated = useBiometricSecurityStore((s) => s.isAuthenticated);
  const authenticate = useBiometricSecurityStore((s) => s.authenticate);
  const handleAppStateChange = useBiometricSecurityStore((s) => s.handleAppStateChange);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", handleAppStateChange);
    return () => subscription.remove();
  }, [handleAppStateChange]);

  if (!isAuthenticated) {
    return (
      <View style={styles.lockContainer}>
        <Card style={styles.lockCard}>
          <Text style={styles.lockIcon}>🛡️</Text>
          <Text style={styles.lockTitle}>{title}</Text>
          <Text style={styles.lockDesc}>
            Biometric authentication (fingerprint, Face ID, or passcode) is required to view financial
            payouts and sensitive banking credentials.
          </Text>
          <Button
            title="Authenticate with Biometrics / PIN"
            onPress={() => void authenticate()}
          />
        </Card>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  lockContainer: {
    flex: 1,
    padding: tokens.spacing.md,
    justifyContent: "center",
    backgroundColor: tokens.colors.light.background,
  },
  lockCard: {
    alignItems: "center",
    padding: tokens.spacing.lg,
    gap: tokens.spacing.md,
  },
  lockIcon: {
    fontSize: 48,
  },
  lockTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: tokens.colors.light.contentPrimary,
    textAlign: "center",
  },
  lockDesc: {
    fontSize: 13,
    color: tokens.colors.light.contentSecondary,
    textAlign: "center",
    lineHeight: 18,
  },
});
