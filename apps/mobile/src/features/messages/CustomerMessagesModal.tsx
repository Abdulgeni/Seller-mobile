import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { defaultApiClient, queryKeys } from "@repo/api";
import {
  type CannedResponse,
  type CustomerMessage,
  type Order,
} from "@repo/schemas";
import { Button, hapticFeedback, tokens } from "@repo/ui";

export interface CustomerMessagesModalProps {
  visible: boolean;
  order: Order | null;
  onClose: () => void;
}

const CANNED_RESPONSES: CannedResponse[] = [
  {
    id: "can_1",
    title: "Packed & Ready",
    template: "Your order is packed and securely staged for dispatch.",
  },
  {
    id: "can_2",
    title: "Dispatched",
    template: "Dispatched with our local courier. Expected arrival within 2 hours!",
  },
  {
    id: "can_3",
    title: "Payment Confirmed",
    template: "M-Pesa payment received and verified. Thank you for your business!",
  },
  {
    id: "can_4",
    title: "Preparing Craft",
    template: "We are carefully handcrafting and inspecting your item.",
  },
];

export function CustomerMessagesModal({
  visible,
  order,
  onClose,
}: CustomerMessagesModalProps): React.JSX.Element | null {
  const [inputText, setInputText] = useState("");
  const queryClient = useQueryClient();

  const orderId = order?.id ?? "";

  const { data: messages = [] } = useQuery({
    queryKey: queryKeys.messages.byOrder(orderId),
    queryFn: () => defaultApiClient.getOrderMessages(orderId),
    enabled: visible && !!orderId,
  });

  const sendMutation = useMutation<
    CustomerMessage,
    Error,
    { text: string },
    { previous: CustomerMessage[] | undefined }
  >({
    mutationFn: (vars) =>
      defaultApiClient.sendMessage({
        orderId,
        text: vars.text,
        idempotencyKey: `msg_${Date.now()}_${Math.random()}`,
      }),
    onMutate: async ({ text }) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.messages.byOrder(orderId),
      });
      const previous = queryClient.getQueryData<CustomerMessage[]>(
        queryKeys.messages.byOrder(orderId)
      );

      const optimisticMsg: CustomerMessage = {
        id: `optimistic_${Date.now()}`,
        orderId,
        sender: "seller",
        text,
        timestamp: new Date().toISOString(),
        status: "sending",
      };

      queryClient.setQueryData<CustomerMessage[]>(
        queryKeys.messages.byOrder(orderId),
        [...(previous ?? []), optimisticMsg]
      );

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          queryKeys.messages.byOrder(orderId),
          context.previous
        );
      }
      hapticFeedback.warning();
    },
    onSuccess: (deliveredMsg) => {
      hapticFeedback.success();
      queryClient.setQueryData<CustomerMessage[]>(
        queryKeys.messages.byOrder(orderId),
        (old = []) =>
          old.map((m) =>
            m.id.startsWith("optimistic_") && m.text === deliveredMsg.text
              ? deliveredMsg
              : m
          )
      );
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.messages.byOrder(orderId),
      });
    },
  });

  if (!visible || !order) {
    return null;
  }

  const handleSend = () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;
    hapticFeedback.buttonPress();
    setInputText("");
    sendMutation.mutate({ text: trimmed });
  };

  const handleApplyCanned = (canned: CannedResponse) => {
    hapticFeedback.selection();
    setInputText(canned.template);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>
                Customer Thread · {order.customer.name}
              </Text>
              <Text style={styles.subtitle}>
                Order #{order.id.slice(0, 8)} · {order.customer.phone}
              </Text>
            </View>
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

          {/* Messages Stream */}
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messageList}
            renderItem={({ item }) => {
              const isSeller = item.sender === "seller";
              return (
                <View
                  style={[
                    styles.messageBubbleWrapper,
                    isSeller
                      ? styles.bubbleSellerWrapper
                      : styles.bubbleCustomerWrapper,
                  ]}
                >
                  <View
                    style={[
                      styles.messageBubble,
                      isSeller ? styles.bubbleSeller : styles.bubbleCustomer,
                    ]}
                  >
                    <Text
                      style={[
                        styles.messageText,
                        isSeller
                          ? styles.messageTextSeller
                          : styles.messageTextCustomer,
                      ]}
                    >
                      {item.text}
                    </Text>
                    <View style={styles.timestampRow}>
                      <Text
                        style={[
                          styles.timestampText,
                          isSeller
                            ? styles.timestampSeller
                            : styles.timestampCustomer,
                        ]}
                      >
                        {new Date(item.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Text>
                      {isSeller && (
                        <Text style={styles.deliveryStatus}>
                          {item.status === "sending" ? " · sending" : " · ✓✓"}
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  No previous messages. Start the conversation with a quick reply
                  below.
                </Text>
              </View>
            }
          />

          {/* Canned Quick Responses */}
          <Text style={styles.cannedSectionHeader}>Quick Replies</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cannedRow}
          >
            {CANNED_RESPONSES.map((c) => (
              <Pressable
                key={c.id}
                onPress={() => handleApplyCanned(c)}
                style={styles.cannedChip}
              >
                <Text style={styles.cannedChipText}>✦ {c.title}</Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Composer Input Bar */}
          <View style={styles.composerBar}>
            <TextInput
              style={styles.composerInput}
              placeholder="Type message to buyer..."
              placeholderTextColor={tokens.colors.light.contentMuted}
              value={inputText}
              onChangeText={setInputText}
            />
            <Button
              title="Send"
              size="sm"
              variant="primary"
              disabled={!inputText.trim()}
              onPress={handleSend}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: tokens.colors.light.bgOverlay,
    justifyContent: "flex-end",
  },
  sheetContainer: {
    backgroundColor: tokens.colors.light.bgCanvas,
    borderTopLeftRadius: tokens.radii.xl,
    borderTopRightRadius: tokens.radii.xl,
    padding: tokens.spacing.md,
    maxHeight: "88%",
    height: "85%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: tokens.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.light.borderSubtle,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: tokens.colors.light.contentPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: tokens.colors.light.contentSecondary,
    marginTop: 2,
  },
  closeBtn: {
    padding: tokens.spacing.xs,
  },
  closeText: {
    fontSize: 18,
    color: tokens.colors.light.contentSecondary,
  },
  messageList: {
    paddingVertical: tokens.spacing.sm,
    gap: tokens.spacing.xs,
    flexGrow: 1,
  },
  messageBubbleWrapper: {
    width: "100%",
    flexDirection: "row",
    marginBottom: tokens.spacing.xs,
  },
  bubbleSellerWrapper: {
    justifyContent: "flex-end",
  },
  bubbleCustomerWrapper: {
    justifyContent: "flex-start",
  },
  messageBubble: {
    maxWidth: "80%",
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
    borderRadius: tokens.radii.lg,
  },
  bubbleSeller: {
    backgroundColor: tokens.colors.light.accent,
    borderBottomRightRadius: tokens.radii.xs,
  },
  bubbleCustomer: {
    backgroundColor: tokens.colors.light.bgRaised,
    borderBottomLeftRadius: tokens.radii.xs,
    borderWidth: 1,
    borderColor: tokens.colors.light.borderSubtle,
  },
  messageText: {
    fontSize: 13,
    lineHeight: 18,
  },
  messageTextSeller: {
    color: tokens.colors.light.surface,
  },
  messageTextCustomer: {
    color: tokens.colors.light.contentPrimary,
  },
  timestampRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 4,
  },
  timestampText: {
    fontSize: 10,
  },
  timestampSeller: {
    color: tokens.colors.light.bgSurface,
    opacity: 0.85,
  },
  timestampCustomer: {
    color: tokens.colors.light.contentSecondary,
  },
  deliveryStatus: {
    fontSize: 10,
    color: tokens.colors.light.bgSurface,
    opacity: 0.85,
  },
  emptyContainer: {
    padding: tokens.spacing.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 13,
    color: tokens.colors.light.contentSecondary,
    textAlign: "center",
  },
  cannedSectionHeader: {
    fontSize: 12,
    fontWeight: "600",
    color: tokens.colors.light.contentSecondary,
    marginBottom: tokens.spacing.xs,
  },
  cannedRow: {
    gap: tokens.spacing.xs,
    paddingBottom: tokens.spacing.sm,
  },
  cannedChip: {
    backgroundColor: tokens.colors.light.bgRaised,
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: tokens.spacing.xs,
    borderRadius: tokens.radii.full,
    borderWidth: 1,
    borderColor: tokens.colors.light.borderSubtle,
  },
  cannedChipText: {
    fontSize: 11,
    fontWeight: "600",
    color: tokens.colors.light.accent,
  },
  composerBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: tokens.colors.light.borderSubtle,
    paddingTop: tokens.spacing.sm,
  },
  composerInput: {
    flex: 1,
    backgroundColor: tokens.colors.light.bgRaised,
    borderRadius: tokens.radii.md,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
    fontSize: 13,
    color: tokens.colors.light.contentPrimary,
    borderWidth: 1,
    borderColor: tokens.colors.light.borderSubtle,
  },
});
