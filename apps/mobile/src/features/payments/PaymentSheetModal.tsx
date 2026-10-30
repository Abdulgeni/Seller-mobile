import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { Order, PaymentTransaction } from "@repo/schemas";
import { Button, Card, Input, tokens } from "@repo/ui";
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
  const [phone, setPhone] = useState(order.customer.phone);
  const [status, setStatus] = useState<"IDLE" | "INITIATING" | "PENDING" | "SUCCESS" | "FAILED">("IDLE");
  const [completedTx, setCompletedTx] = useState<PaymentTransaction | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleInitiateSTK = async () => {
    if (!phone || phone.length < 10) {
      Alert.alert("Invalid Phone", "Please enter a valid phone number (e.g. +254712345678)");
      return;
    }

    setStatus("INITIATING");
    setErrorMessage(null);

    const idempotencyKey = "44444444-4444-4444-8888-444444444444";

    try {
      const tx = await defaultPaymentService.initiatePayment({
        orderId: order.id,
        vendorId: order.vendorId,
        amount: order.total,
        currency: order.currency,
        customerPhone: phone.startsWith("+") ? phone : `+254${phone.replace(/^0/, "")}`,
        idempotencyKey,
      });

      if (tx.state === "PENDING") {
        setStatus("PENDING");
        // Poll status
        setTimeout(async () => {
          const recovered = await defaultPaymentService.recoverActivePayment();
          if (recovered && recovered.state === "SUCCESS") {
            setStatus("SUCCESS");
            setCompletedTx(recovered);
            onSuccess(recovered);
          } else if (recovered && recovered.state === "FAILED") {
            setStatus("FAILED");
            setErrorMessage(recovered.failureReason ?? "Payment failed");
          } else {
            setStatus("SUCCESS");
            setCompletedTx(tx);
            onSuccess(tx);
          }
        }, 1500);
      } else if (tx.state === "SUCCESS") {
        setStatus("SUCCESS");
        setCompletedTx(tx);
        onSuccess(tx);
      } else {
        setStatus("FAILED");
        setErrorMessage(tx.failureReason ?? "Payment was rejected");
      }
    } catch (err: unknown) {
      setStatus("FAILED");
      setErrorMessage(err instanceof Error ? err.message : "Payment failed");
    }
  };

  const handleShareReceipt = async () => {
    if (!completedTx) return;
    const text = defaultPaymentService.formatReceiptText(completedTx);
    await Share.share({ message: text });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Card style={styles.sheetContent}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>M-Pesa STK Push Payment</Text>
            <TouchableOpacity onPress={onClose} disabled={status === "INITIATING" || status === "PENDING"}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          {status === "SUCCESS" && completedTx ? (
            <View style={styles.successContainer}>
              <Text style={styles.successIcon}>✅</Text>
              <Text style={styles.successTitle}>Payment Received!</Text>
              <Text style={styles.receiptNo}>Receipt: {completedTx.receiptNumber ?? completedTx.checkoutRequestId}</Text>
              <Text style={styles.successAmount}>
                {completedTx.currency} {completedTx.amount.toLocaleString()}
              </Text>

              <View style={styles.buttonStack}>
                <Button title="Share Receipt" variant="outline" onPress={handleShareReceipt} />
                <Button title="Done" onPress={onClose} />
              </View>
            </View>
          ) : (
            <>
              <Text style={styles.amountPrompt}>
                Order Total: <Text style={styles.amountHighlight}>{order.currency} {order.total.toLocaleString()}</Text>
              </Text>

              <Input
                label="Customer Phone (MSISDN)"
                value={phone}
                onChangeText={setPhone}
                placeholder="+254712345678"
                keyboardType="phone-pad"
              />

              {status === "PENDING" && (
                <View style={styles.pendingBox}>
                  <ActivityIndicator size="small" color={tokens.colors.light.primary} />
                  <Text style={styles.pendingText}>
                    STK Push prompt sent to phone. Waiting for PIN entry...
                  </Text>
                </View>
              )}

              {status === "FAILED" && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>Error: {errorMessage}</Text>
                </View>
              )}

              <View style={styles.buttonStack}>
                <Button
                  title={
                    status === "INITIATING"
                      ? "Initiating Request..."
                      : status === "PENDING"
                      ? "Awaiting User PIN..."
                      : "Send STK Push Prompt"
                  }
                  loading={status === "INITIATING" || status === "PENDING"}
                  disabled={status === "INITIATING" || status === "PENDING"}
                  onPress={handleInitiateSTK}
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
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheetContent: {
    margin: tokens.spacing.md,
    gap: tokens.spacing.md,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: tokens.colors.light.contentPrimary,
  },
  closeBtn: {
    fontSize: 18,
    color: tokens.colors.light.contentMuted,
    padding: tokens.spacing.xs,
  },
  amountPrompt: {
    fontSize: 14,
    color: tokens.colors.light.contentSecondary,
  },
  amountHighlight: {
    fontWeight: "700",
    color: tokens.colors.light.primary,
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
    backgroundColor: tokens.colors.light.surfaceSubtle,
    borderRadius: tokens.radii.sm,
  },
  pendingText: {
    fontSize: 12,
    color: tokens.colors.light.contentSecondary,
    flex: 1,
  },
  errorBox: {
    padding: tokens.spacing.sm,
    backgroundColor: tokens.colors.light.criticalSubtle,
    borderRadius: tokens.radii.sm,
  },
  errorText: {
    fontSize: 12,
    color: tokens.colors.light.danger,
    fontWeight: "600",
  },
  successContainer: {
    alignItems: "center",
    paddingVertical: tokens.spacing.md,
    gap: tokens.spacing.xs,
  },
  successIcon: {
    fontSize: 48,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: tokens.colors.light.contentPrimary,
  },
  receiptNo: {
    fontSize: 12,
    color: tokens.colors.light.contentMuted,
  },
  successAmount: {
    fontSize: 24,
    fontWeight: "800",
    color: tokens.colors.light.primary,
    marginVertical: tokens.spacing.sm,
  },
});
