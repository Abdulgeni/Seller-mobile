import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { Order, PaymentProvider, PaymentTransaction } from "@repo/schemas";
import {
  Button,
  Card,
  hapticFeedback,
  Input,
  PaymentReceiptConfirmation,
  tokens,
} from "@repo/ui";
import { defaultPaymentService } from "./paymentService";

export interface PaymentSheetModalProps {
  order: Order;
  visible: boolean;
  onClose: () => void;
  onSuccess: (tx: PaymentTransaction) => void;
}

export function PaymentSheetModal({
  order,
  visible,
  onClose,
  onSuccess,
}: PaymentSheetModalProps): React.JSX.Element {
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider>("TELEBIRR");
  const [phone, setPhone] = useState(order.customer.phone);
  const [accountNumber, setAccountNumber] = useState("");
  const [status, setStatus] = useState<"IDLE" | "INITIATING" | "PENDING" | "SUCCESS" | "FAILED">("IDLE");
  const [completedTx, setCompletedTx] = useState<PaymentTransaction | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const normalizePhone = (raw: string): string => {
    const cleaned = raw.replace(/\s+/g, "");
    if (cleaned.startsWith("+251")) return cleaned;
    if (cleaned.startsWith("09") || cleaned.startsWith("07")) {
      return `+251${cleaned.slice(1)}`;
    }
    if (cleaned.startsWith("9") || cleaned.startsWith("7")) {
      return `+251${cleaned}`;
    }
    return cleaned;
  };

  const handleInitiatePayment = async () => {
    const formattedPhone = normalizePhone(phone);
    if (!formattedPhone || formattedPhone.length < 10) {
      Alert.alert(
        "Invalid Phone",
        "Please enter a valid Ethiopian mobile number (e.g. 0911234567 or +251911234567)"
      );
      return;
    }

    hapticFeedback.selection();
    setStatus("INITIATING");
    setErrorMessage(null);

    const idempotencyKey = `pay_${order.id}_${selectedProvider}_${Date.now()}`;

    try {
      const tx = await defaultPaymentService.initiatePayment({
        orderId: order.id,
        vendorId: order.vendorId,
        amount: order.total,
        currency: order.currency,
        customerPhone: formattedPhone,
        provider: selectedProvider,
        accountNumber: selectedProvider === "CBE" ? accountNumber || undefined : undefined,
        idempotencyKey,
      });

      if (tx.state === "PENDING") {
        setStatus("PENDING");
        // Simulated settlement
        setTimeout(async () => {
          const recovered = await defaultPaymentService.recoverActivePayment();
          if (recovered && recovered.state === "SUCCESS") {
            setStatus("SUCCESS");
            setCompletedTx(recovered);
            onSuccess(recovered);
            hapticFeedback.success();
          } else if (recovered && recovered.state === "FAILED") {
            setStatus("FAILED");
            setErrorMessage(recovered.failureReason ?? "Payment was declined");
            hapticFeedback.warning();
          } else {
            setStatus("SUCCESS");
            setCompletedTx(tx);
            onSuccess(tx);
            hapticFeedback.success();
          }
        }, 1600);
      } else if (tx.state === "SUCCESS") {
        setStatus("SUCCESS");
        setCompletedTx(tx);
        onSuccess(tx);
        hapticFeedback.success();
      } else {
        setStatus("FAILED");
        setErrorMessage(tx.failureReason ?? "Payment request was rejected");
        hapticFeedback.warning();
      }
    } catch (err: unknown) {
      setStatus("FAILED");
      setErrorMessage(err instanceof Error ? err.message : "Payment failed");
      hapticFeedback.warning();
    }
  };

  const handleShareReceipt = async () => {
    if (!completedTx) return;
    hapticFeedback.selection();
    const text = defaultPaymentService.formatReceiptText(completedTx);
    await Share.share({
      title: `Payment Receipt - ${order.orderNumber}`,
      message: text,
    });
  };

  const providers: { id: PaymentProvider; label: string; badge: string }[] = [
    { id: "TELEBIRR", label: "Telebirr", badge: "Ethio Telecom" },
    { id: "CBE", label: "CBE Birr", badge: "Commercial Bank" },
    { id: "MPESA", label: "M-Pesa", badge: "Safaricom ETH" },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Card style={styles.sheetContent}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>Collect Payment</Text>
              <Text style={styles.subtitle}>Ethiopian Digital Payment Suite</Text>
            </View>
            <TouchableOpacity onPress={onClose} disabled={status === "INITIATING" || status === "PENDING"}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          {status === "SUCCESS" && completedTx ? (
            <PaymentReceiptConfirmation
              transaction={completedTx}
              onShare={handleShareReceipt}
              onDone={onClose}
            />
          ) : (
            <>
              {/* Order Amount Callout */}
              <View style={styles.amountBox}>
                <Text style={styles.amountLabel}>AMOUNT DUE</Text>
                <Text style={styles.amountHighlight}>
                  {order.currency} {order.total.toLocaleString()}
                </Text>
              </View>

              {/* Payment Provider Segmented Control */}
              <Text style={styles.inputSectionLabel}>SELECT PAYMENT METHOD</Text>
              <View style={styles.providerRow}>
                {providers.map((p) => {
                  const isSelected = selectedProvider === p.id;
                  return (
                    <Pressable
                      key={p.id}
                      style={[
                        styles.providerCard,
                        isSelected && styles.providerCardActive,
                      ]}
                      onPress={() => {
                        hapticFeedback.selection();
                        setSelectedProvider(p.id);
                      }}
                    >
                      <Text style={[styles.providerTitle, isSelected && styles.providerTitleActive]}>
                        {p.label}
                      </Text>
                      <Text style={styles.providerBadge}>{p.badge}</Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Method-Specific Instructions */}
              <View style={styles.hintBox}>
                <Text style={styles.hintText}>
                  {selectedProvider === "TELEBIRR" &&
                    "✦ Telebirr: Prompt pushes directly to customer's phone (*127# or Telebirr SuperApp)."}
                  {selectedProvider === "CBE" &&
                    "✦ CBE Birr: Direct debit prompt via Commercial Bank of Ethiopia (*847#)."}
                  {selectedProvider === "MPESA" &&
                    "✦ M-Pesa: Safaricom Ethiopia USSD STK prompt sent to customer (*733#)."}
                </Text>
              </View>

              <Input
                label="Customer Mobile Number"
                value={phone}
                onChangeText={setPhone}
                placeholder="0911234567 or +251911234567"
                keyboardType="phone-pad"
              />

              {selectedProvider === "CBE" && (
                <Input
                  label="CBE Account Number (Optional)"
                  value={accountNumber}
                  onChangeText={setAccountNumber}
                  placeholder="1000XXXXXXXXX (Optional for direct transfer)"
                  keyboardType="numeric"
                />
              )}

              {status === "PENDING" && (
                <View style={styles.pendingBox}>
                  <ActivityIndicator size="small" color={tokens.colors.light.accent} />
                  <Text style={styles.pendingText}>
                    Prompt dispatched via {selectedProvider}. Waiting for customer PIN authorization...
                  </Text>
                </View>
              )}

              {status === "FAILED" && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>Payment Error: {errorMessage}</Text>
                </View>
              )}

              <View style={styles.buttonStack}>
                <Button
                  title={
                    status === "INITIATING"
                      ? "Dispatching Request..."
                      : status === "PENDING"
                        ? "Awaiting Customer Authorization..."
                        : `Send ${selectedProvider === "TELEBIRR" ? "Telebirr" : selectedProvider === "CBE" ? "CBE Birr" : "M-Pesa"} Prompt`
                  }
                  variant="gold"
                  loading={status === "INITIATING" || status === "PENDING"}
                  disabled={status === "INITIATING" || status === "PENDING"}
                  onPress={handleInitiatePayment}
                />
              </View>
            </>
          )}
        </Card>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: tokens.colors.light.bgOverlay,
    justifyContent: "flex-end",
  },
  sheetContent: {
    margin: tokens.spacing.md,
    gap: tokens.spacing.md,
    backgroundColor: tokens.colors.light.bgCanvas,
    borderColor: tokens.colors.light.borderStrong,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: tokens.colors.light.contentPrimary,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 11,
    color: tokens.colors.light.contentSecondary,
    marginTop: 2,
  },
  closeBtn: {
    fontSize: 18,
    color: tokens.colors.light.contentMuted,
    padding: tokens.spacing.xs,
  },
  amountBox: {
    backgroundColor: tokens.colors.light.bgRaised,
    padding: tokens.spacing.md,
    borderRadius: tokens.radii.md,
    borderWidth: 1,
    borderColor: tokens.colors.light.borderSubtle,
    alignItems: "center",
    gap: 2,
  },
  amountLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: tokens.colors.light.contentMuted,
    letterSpacing: 1,
  },
  amountHighlight: {
    fontSize: 24,
    fontWeight: "800",
    color: tokens.colors.light.contentPrimary,
    fontVariant: ["tabular-nums"],
  },
  inputSectionLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: tokens.colors.light.contentMuted,
    letterSpacing: 1,
    marginTop: 2,
  },
  providerRow: {
    flexDirection: "row",
    gap: tokens.spacing.xs,
  },
  providerCard: {
    flex: 1,
    paddingVertical: tokens.spacing.sm,
    paddingHorizontal: tokens.spacing.xs,
    backgroundColor: tokens.colors.light.bgRaised,
    borderRadius: tokens.radii.md,
    borderWidth: 1,
    borderColor: tokens.colors.light.borderSubtle,
    alignItems: "center",
    gap: 2,
  },
  providerCardActive: {
    backgroundColor: tokens.colors.light.bgSurface,
    borderColor: tokens.colors.light.gold,
  },
  providerTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: tokens.colors.light.contentSecondary,
  },
  providerTitleActive: {
    color: tokens.colors.light.gold,
  },
  providerBadge: {
    fontSize: 9,
    color: tokens.colors.light.contentMuted,
  },
  hintBox: {
    backgroundColor: tokens.colors.light.bgRaised,
    padding: tokens.spacing.sm,
    borderRadius: tokens.radii.sm,
    borderLeftWidth: 3,
    borderLeftColor: tokens.colors.light.gold,
  },
  hintText: {
    fontSize: 11,
    lineHeight: 16,
    color: tokens.colors.light.contentSecondary,
  },
  buttonStack: {
    gap: tokens.spacing.xs,
    marginTop: tokens.spacing.xs,
  },
  pendingBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing.sm,
    padding: tokens.spacing.sm,
    backgroundColor: tokens.colors.light.bgRaised,
    borderRadius: tokens.radii.sm,
    borderWidth: 1,
    borderColor: tokens.colors.light.borderSubtle,
  },
  pendingText: {
    fontSize: 11,
    color: tokens.colors.light.contentSecondary,
    flex: 1,
    lineHeight: 16,
  },
  errorBox: {
    padding: tokens.spacing.sm,
    backgroundColor: tokens.colors.light.bgRaised,
    borderRadius: tokens.radii.sm,
    borderWidth: 1,
    borderColor: tokens.colors.light.danger,
  },
  errorText: {
    fontSize: 12,
    color: tokens.colors.light.danger,
    fontWeight: "600",
  },
});
