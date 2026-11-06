import React from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { type Order } from "@repo/schemas";
import { Badge, Button, Card, hapticFeedback, tokens } from "@repo/ui";

export interface PackingSlipExportModalProps {
  order: Order;
  visible: boolean;
  onClose: () => void;
}

export function PackingSlipExportModal({
  order,
  visible,
  onClose,
}: PackingSlipExportModalProps): React.JSX.Element | null {
  if (!visible) {
    return null;
  }

  const handleShareSlip = async () => {
    hapticFeedback.selection();
    try {
      const itemsList = order.items
        .map(
          (item, idx) =>
            `${idx + 1}. [${item.sku}] ${item.productTitle} x${item.quantity} - ${order.currency} ${item.subtotal.toLocaleString()}`
        )
        .join("\n");

      const packingSlipContent = [
        "================================================",
        "          ATELIER HABESHA · ADDIS ABABA",
        "        OFFICIAL DISPATCH PACKING SLIP",
        "================================================",
        `Order Number:   ${order.orderNumber}`,
        `Order Date:     ${new Date(order.createdAt).toLocaleDateString()}`,
        `Status:         ${order.status}`,
        "------------------------------------------------",
        "DELIVERY DESTINATION:",
        `Recipient:      ${order.customer.name}`,
        `Contact Phone:  ${order.customer.phone}`,
        `Address:        ${order.customer.shippingAddress}`,
        "------------------------------------------------",
        "PACKAGE CONTENTS:",
        itemsList,
        "------------------------------------------------",
        `Total Items:    ${order.items.reduce((acc, i) => acc + i.quantity, 0)} units`,
        `Declared Value: ${order.currency} ${order.total.toLocaleString()}`,
        "================================================",
        "Dispatched via Atelier Secure Fulfillment Addis Ababa",
        "Verification Hash: ETH-ATL-" + order.id.slice(-8).toUpperCase(),
        "================================================",
      ].join("\n");

      await Share.share({
        title: `Packing Slip - ${order.orderNumber}`,
        message: packingSlipContent,
      });
      hapticFeedback.success();
    } catch {
      Alert.alert("Export Error", "Could not complete packing slip export.");
    }
  };

  const totalQuantity = order.items.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.backdrop}>
        <View style={styles.sheetContainer}>
          {/* Top Bar */}
          <View style={styles.headerBar}>
            <Text style={styles.headerTitle}>OFFICIAL PACKING SLIP</Text>
            <Pressable
              onPress={() => {
                hapticFeedback.selection();
                onClose();
              }}
              style={styles.closeBtn}
            >
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Printable Document Sheet */}
            <Card style={styles.slipCard}>
              {/* Slip Header */}
              <View style={styles.slipBranding}>
                <Text style={styles.atelierWordmark}>✦ ATELIER HABESHA ✦</Text>
                <Text style={styles.slipDocTitle}>DISPATCH & PACKING NOTE</Text>
                <Text style={styles.slipDocSubtitle}>Addis Ababa Fulfillment Center</Text>
              </View>

              <View style={styles.divider} />

              {/* Order & Recipient Metadata */}
              <View style={styles.metaRow}>
                <View style={styles.metaCol}>
                  <Text style={styles.metaLabel}>ORDER NUMBER</Text>
                  <Text style={styles.metaValue}>{order.orderNumber}</Text>
                </View>
                <View style={styles.metaColRight}>
                  <Text style={styles.metaLabel}>ORDER DATE</Text>
                  <Text style={styles.metaValue}>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>

              <View style={styles.addressBox}>
                <Text style={styles.metaLabel}>SHIP TO</Text>
                <Text style={styles.recipientName}>{order.customer.name}</Text>
                <Text style={styles.recipientDetail}>📞 {order.customer.phone}</Text>
                <Text style={styles.recipientDetail}>📍 {order.customer.shippingAddress}</Text>
              </View>

              <View style={styles.divider} />

              {/* Items Table */}
              <Text style={styles.tableHeading}>MANIFESTED ITEMS ({totalQuantity} PCS)</Text>
              {order.items.map((item, idx) => (
                <View key={item.id} style={styles.itemRow}>
                  <Text style={styles.itemIndex}>{idx + 1}.</Text>
                  <View style={styles.itemMeta}>
                    <Text style={styles.itemTitle}>{item.productTitle}</Text>
                    <Text style={styles.itemSku}>SKU: {item.sku}</Text>
                  </View>
                  <View style={styles.itemQuantityBox}>
                    <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                  </View>
                </View>
              ))}

              <View style={styles.divider} />

              {/* Verification & Barcode */}
              <View style={styles.verificationBlock}>
                <Text style={styles.barcodeText}>
                  | | | | ||||| | || |||| | ||||| || | | |||
                </Text>
                <Text style={styles.hashText}>
                  ETH-ATL-VERIFIED-{order.id.slice(-8).toUpperCase()}
                </Text>
                <View style={styles.signatureRow}>
                  <Text style={styles.signatureText}>Fulfillment Sign-off: ✓ INSPECTED</Text>
                  <Badge label="EXPORT READY" variant="success" size="sm" />
                </View>
              </View>
            </Card>

            {/* Action Buttons */}
            <View style={styles.actionRow}>
              <Button
                title="Export & Share Slip"
                variant="gold"
                onPress={handleShareSlip}
              />
              <View style={{ height: tokens.spacing.sm }} />
              <Button
                title="Close"
                variant="outline"
                onPress={onClose}
              />
            </View>
          </ScrollView>
        </View>
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
  sheetContainer: {
    backgroundColor: tokens.colors.light.bgCanvas,
    borderTopLeftRadius: tokens.radii.lg,
    borderTopRightRadius: tokens.radii.lg,
    maxHeight: "90%",
    paddingBottom: tokens.spacing.xl,
  },
  headerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.light.borderSubtle,
    backgroundColor: tokens.colors.light.bgRaised,
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: tokens.colors.light.gold,
    letterSpacing: 1.5,
  },
  closeBtn: {
    padding: tokens.spacing.xs,
  },
  closeText: {
    fontSize: 16,
    color: tokens.colors.light.contentSecondary,
  },
  scrollContent: {
    padding: tokens.spacing.md,
    gap: tokens.spacing.md,
  },
  slipCard: {
    backgroundColor: tokens.colors.light.bgSurface,
    borderColor: tokens.colors.light.borderStrong,
    padding: tokens.spacing.lg,
    gap: tokens.spacing.md,
  },
  slipBranding: {
    alignItems: "center",
    gap: 4,
  },
  atelierWordmark: {
    fontSize: 13,
    fontWeight: "800",
    color: tokens.colors.light.gold,
    letterSpacing: 2,
  },
  slipDocTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: tokens.colors.light.contentPrimary,
    letterSpacing: 1,
  },
  slipDocSubtitle: {
    fontSize: 11,
    color: tokens.colors.light.contentSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: tokens.colors.light.borderSubtle,
    marginVertical: tokens.spacing.xs,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metaCol: {
    gap: 2,
  },
  metaColRight: {
    alignItems: "flex-end",
    gap: 2,
  },
  metaLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: tokens.colors.light.contentMuted,
    letterSpacing: 1,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: "700",
    color: tokens.colors.light.contentPrimary,
    fontVariant: ["tabular-nums"],
  },
  addressBox: {
    backgroundColor: tokens.colors.light.bgRaised,
    padding: tokens.spacing.sm,
    borderRadius: tokens.radii.sm,
    gap: 2,
  },
  recipientName: {
    fontSize: 13,
    fontWeight: "700",
    color: tokens.colors.light.contentPrimary,
    marginTop: 2,
  },
  recipientDetail: {
    fontSize: 12,
    color: tokens.colors.light.contentSecondary,
  },
  tableHeading: {
    fontSize: 11,
    fontWeight: "700",
    color: tokens.colors.light.contentPrimary,
    letterSpacing: 0.5,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: tokens.spacing.xs,
  },
  itemIndex: {
    width: 20,
    fontSize: 12,
    color: tokens.colors.light.contentMuted,
  },
  itemMeta: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: tokens.colors.light.contentPrimary,
  },
  itemSku: {
    fontSize: 10,
    color: tokens.colors.light.contentSecondary,
  },
  itemQuantityBox: {
    backgroundColor: tokens.colors.light.bgRaised,
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: 2,
    borderRadius: tokens.radii.sm,
  },
  itemQuantity: {
    fontSize: 12,
    fontWeight: "700",
    color: tokens.colors.light.contentPrimary,
    fontVariant: ["tabular-nums"],
  },
  verificationBlock: {
    alignItems: "center",
    backgroundColor: tokens.colors.light.bgRaised,
    padding: tokens.spacing.md,
    borderRadius: tokens.radii.md,
    gap: tokens.spacing.xs,
  },
  barcodeText: {
    fontSize: 16,
    letterSpacing: 3,
    color: tokens.colors.light.contentPrimary,
    fontWeight: "900",
  },
  hashText: {
    fontSize: 10,
    fontFamily: "Courier",
    color: tokens.colors.light.contentSecondary,
    letterSpacing: 1,
  },
  signatureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginTop: tokens.spacing.xs,
    paddingTop: tokens.spacing.xs,
    borderTopWidth: 1,
    borderTopColor: tokens.colors.light.borderSubtle,
  },
  signatureText: {
    fontSize: 11,
    fontWeight: "600",
    color: tokens.colors.light.contentSecondary,
  },
  actionRow: {
    gap: tokens.spacing.sm,
  },
});
