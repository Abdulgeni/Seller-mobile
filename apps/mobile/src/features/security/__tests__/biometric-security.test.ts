import { describe, expect, it } from "vitest";
import {
  FIVE_MINUTES_MS,
  getSecureToken,
  saveSecureToken,
  useBiometricSecurityStore,
} from "../biometricAuth";

describe("Biometric Security Gate & 5-Minute Re-Auth", () => {
  it("authenticates and unlocks session", async () => {
    useBiometricSecurityStore.getState().lock();
    expect(useBiometricSecurityStore.getState().isAuthenticated).toBe(false);

    const success = await useBiometricSecurityStore.getState().authenticate();
    expect(success).toBe(true);
    expect(useBiometricSecurityStore.getState().isAuthenticated).toBe(true);
    expect(useBiometricSecurityStore.getState().lastAuthenticatedAt).not.toBeNull();
  });

  it("locks financial session after 5 minutes in background", () => {
    // 1. Authenticate
    useBiometricSecurityStore.setState({
      isAuthenticated: true,
      lastAuthenticatedAt: Date.now(),
      backgroundedAt: null,
    });

    // 2. App goes to background
    const bgTime = Date.now() - (FIVE_MINUTES_MS + 1000); // 5 mins + 1 sec ago
    useBiometricSecurityStore.setState({ backgroundedAt: bgTime });

    // 3. App returns to active foreground
    useBiometricSecurityStore.getState().handleAppStateChange("active");

    expect(useBiometricSecurityStore.getState().isAuthenticated).toBe(false);
    expect(useBiometricSecurityStore.getState().lastAuthenticatedAt).toBeNull();
  });

  it("maintains authenticated session if background duration is under 5 minutes", () => {
    useBiometricSecurityStore.setState({
      isAuthenticated: true,
      lastAuthenticatedAt: Date.now(),
      backgroundedAt: Date.now() - 60 * 1000, // 1 minute in background
    });

    useBiometricSecurityStore.getState().handleAppStateChange("active");

    expect(useBiometricSecurityStore.getState().isAuthenticated).toBe(true);
  });

  it("saves and retrieves tokens in SecureStore only", async () => {
    await saveSecureToken("vendor_auth_token", "jwt_secure_vendor_session_token");
    const retrieved = await getSecureToken("vendor_auth_token");
    expect(retrieved).toBe("mock_secret_token_vendor_auth_token");
  });
});
