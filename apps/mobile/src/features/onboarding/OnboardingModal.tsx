import React, { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Badge, Button, Card, hapticFeedback, tokens } from "@repo/ui";
import { useSettingsStore } from "../settings/settingsStore";

interface OnboardingStep {
  stepNumber: number;
  badge: string;
  symbol: string;
  title: string;
  subtitle: string;
  description: string;
  highlights: string[];
}

const STEPS: OnboardingStep[] = [
  {
    stepNumber: 1,
    badge: "CRAFT & SPEED",
    symbol: "✦",
    title: "AI Studio & Luxury Artisan Catalogue",
    subtitle: "Habesha textiles, highland leather & specialty coffee",
    description:
      "Capture high-resolution product photos with automated sub-200KB compression. Retouch in AI Studio with studio, marble, and velvet backdrops, rendered in FlashList at 60 FPS.",
    highlights: [
      "Curated Ethiopian artisan collection with high-res matched photography",
      "3 AI-powered studio backdrops with instant compare toggle",
      "Dynamic variant matrix generation & bulk batch operations",
    ],
  },
  {
    stepNumber: 2,
    badge: "RESILIENCE & PAYMENTS",
    symbol: "⚡",
    title: "Offline Sync & Telebirr, CBE, M-Pesa",
    subtitle: "Complete Ethiopian digital payment integration",
    description:
      "All inventory updates and order transitions queue offline with UUID v4 idempotency keys and settle in the background. Full support for Telebirr, CBE Birr, and M-Pesa.",
    highlights: [
      "Integrated Telebirr, CBE Birr & Safaricom M-Pesa Ethiopia flows",
      "Official transaction receipts with verified provider reference hashes",
      "Persistent FIFO mutation pipeline with ambient sync filament",
    ],
  },
  {
    stepNumber: 3,
    badge: "COMMAND & CARE",
    symbol: "⌘",
    title: "Global ⌘K & Customer Inquiries",
    subtitle: "Complete control at your fingertips",
    description:
      "Navigate orders, products, and ops instantly via the Command Palette. Resolve buyer questions directly within the order timeline and export official packing slips.",
    highlights: [
      "Instant fuzzy search across products, orders, and actions",
      "Order-linked customer messaging with canned replies",
      "Official dispatch packing slips with one-tap native share",
    ],
  },
];

export function OnboardingModal(): React.JSX.Element | null {
  const { isOnboardingOpen, completeOnboarding } = useSettingsStore();
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [notificationsPrimed, setNotificationsPrimed] = useState(true);
  const [cameraPrimed, setCameraPrimed] = useState(true);

  if (!isOnboardingOpen) {
    return null;
  }

  const step: OnboardingStep = STEPS[currentStepIdx] ?? (STEPS[0] as OnboardingStep);
  const isLastStep = currentStepIdx === STEPS.length - 1;

  const handleNext = () => {
    hapticFeedback.selection();
    if (isLastStep) {
      completeOnboarding();
      hapticFeedback.success();
    } else {
      setCurrentStepIdx((prev) => prev + 1);
    }
  };

  const handleSkip = () => {
    hapticFeedback.selection();
    completeOnboarding();
  };

  return (
    <Modal visible={isOnboardingOpen} animationType="slide">
      <View style={styles.container}>
        {/* Top Header */}
        <View style={styles.headerBar}>
          <Text style={styles.headerBrand}>✦ ATELIER · WELCOME TOUR</Text>
          <Pressable onPress={handleSkip} style={styles.skipBtn}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Progress Indicators */}
          <View style={styles.progressRow}>
            {STEPS.map((s, idx) => (
              <View
                key={s.stepNumber}
                style={[
                  styles.progressDot,
                  idx === currentStepIdx && styles.progressDotActive,
                  idx < currentStepIdx && styles.progressDotDone,
                ]}
              />
            ))}
          </View>

          {/* Step Hero Visual */}
          <View style={styles.heroBox}>
            <View style={styles.emblemBadge}>
              <Text style={styles.emblemText}>{step.symbol}</Text>
            </View>
            <Badge label={step.badge} variant="warning" size="sm" />
          </View>

          {/* Step Content */}
          <Card style={styles.stepCard}>
            <Text style={styles.stepTitle}>{step.title}</Text>
            <Text style={styles.stepSubtitle}>{step.subtitle}</Text>
            <Text style={styles.stepDescription}>{step.description}</Text>

            <View style={styles.divider} />

            <Text style={styles.highlightsHeader}>SIGNATURE CAPABILITIES</Text>
            <View style={styles.highlightsList}>
              {step.highlights.map((hl) => (
                <View key={hl} style={styles.highlightRow}>
                  <Text style={styles.checkIcon}>✓</Text>
                  <Text style={styles.highlightText}>{hl}</Text>
                </View>
              ))}
            </View>
          </Card>

          {/* Contextual Permission Priming on Final Step */}
          {isLastStep && (
            <Card style={styles.primingCard}>
              <Text style={styles.primingHeader}>PERMISSION PRIMING</Text>
              <Text style={styles.primingNotice}>
                Atelier only requests permissions that directly power your merchant experience:
              </Text>

              <Pressable
                style={styles.primeOption}
                onPress={() => {
                  hapticFeedback.selection();
                  setNotificationsPrimed(!notificationsPrimed);
                }}
              >
                <Text style={styles.primeCheck}>
                  {notificationsPrimed ? "☑" : "☐"}
                </Text>
                <View style={styles.primeTextGroup}>
                  <Text style={styles.primeTitle}>Live Order Notifications</Text>
                  <Text style={styles.primeSub}>
                    Receive instant alerts when buyers place high-value orders
                  </Text>
                </View>
              </Pressable>

              <Pressable
                style={styles.primeOption}
                onPress={() => {
                  hapticFeedback.selection();
                  setCameraPrimed(!cameraPrimed);
                }}
              >
                <Text style={styles.primeCheck}>
                  {cameraPrimed ? "☑" : "☐"}
                </Text>
                <View style={styles.primeTextGroup}>
                  <Text style={styles.primeTitle}>Camera & Studio Access</Text>
                  <Text style={styles.primeSub}>
                    Snap products directly into the AI Studio retouch lightbox
                  </Text>
                </View>
              </Pressable>
            </Card>
          )}

          {/* Actions */}
          <View style={styles.actionRow}>
            <Button
              title={isLastStep ? "Enter Atelier Studio ✦" : "Next Step →"}
              variant="gold"
              onPress={handleNext}
            />
            {currentStepIdx > 0 && (
              <Button
                title="← Back"
                variant="outline"
                onPress={() => {
                  hapticFeedback.selection();
                  setCurrentStepIdx((prev) => prev - 1);
                }}
              />
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.light.bgCanvas,
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
  headerBrand: {
    fontSize: 11,
    fontWeight: "700",
    color: tokens.colors.light.gold,
    letterSpacing: 1.5,
  },
  skipBtn: {
    padding: tokens.spacing.xs,
  },
  skipText: {
    fontSize: 12,
    fontWeight: "600",
    color: tokens.colors.light.contentSecondary,
  },
  scrollContent: {
    padding: tokens.spacing.lg,
    gap: tokens.spacing.lg,
    paddingBottom: 60,
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: tokens.spacing.sm,
    marginTop: tokens.spacing.sm,
  },
  progressDot: {
    width: 24,
    height: 4,
    borderRadius: 2,
    backgroundColor: tokens.colors.light.borderSubtle,
  },
  progressDotActive: {
    backgroundColor: tokens.colors.light.gold,
    width: 36,
  },
  progressDotDone: {
    backgroundColor: tokens.colors.light.accent,
  },
  heroBox: {
    alignItems: "center",
    gap: tokens.spacing.sm,
    marginVertical: tokens.spacing.sm,
  },
  emblemBadge: {
    width: 64,
    height: 64,
    borderRadius: tokens.radii.lg,
    backgroundColor: tokens.colors.light.bgSurface,
    borderWidth: 1.5,
    borderColor: tokens.colors.light.gold,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: tokens.colors.light.contentPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: tokens.elevation.light.card.elevation,
  },
  emblemText: {
    fontSize: 26,
    color: tokens.colors.light.gold,
  },
  stepCard: {
    padding: tokens.spacing.lg,
    gap: tokens.spacing.sm,
    backgroundColor: tokens.colors.light.bgSurface,
    borderColor: tokens.colors.light.borderStrong,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: tokens.colors.light.contentPrimary,
    letterSpacing: 0.3,
  },
  stepSubtitle: {
    fontSize: 13,
    fontWeight: "600",
    color: tokens.colors.light.accent,
  },
  stepDescription: {
    fontSize: 13,
    lineHeight: 20,
    color: tokens.colors.light.contentSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: tokens.colors.light.borderSubtle,
    marginVertical: tokens.spacing.xs,
  },
  highlightsHeader: {
    fontSize: 10,
    fontWeight: "700",
    color: tokens.colors.light.contentMuted,
    letterSpacing: 1,
  },
  highlightsList: {
    gap: tokens.spacing.xs,
  },
  highlightRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: tokens.spacing.sm,
  },
  checkIcon: {
    fontSize: 12,
    fontWeight: "800",
    color: tokens.colors.light.accent,
  },
  highlightText: {
    flex: 1,
    fontSize: 12,
    color: tokens.colors.light.contentPrimary,
    lineHeight: 18,
  },
  primingCard: {
    padding: tokens.spacing.md,
    gap: tokens.spacing.sm,
    backgroundColor: tokens.colors.light.bgRaised,
    borderColor: tokens.colors.light.borderSubtle,
  },
  primingHeader: {
    fontSize: 10,
    fontWeight: "700",
    color: tokens.colors.light.gold,
    letterSpacing: 1,
  },
  primingNotice: {
    fontSize: 11,
    color: tokens.colors.light.contentSecondary,
    marginBottom: tokens.spacing.xs,
  },
  primeOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing.sm,
    paddingVertical: tokens.spacing.xs,
  },
  primeCheck: {
    fontSize: 20,
    color: tokens.colors.light.accent,
  },
  primeTextGroup: {
    flex: 1,
  },
  primeTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: tokens.colors.light.contentPrimary,
  },
  primeSub: {
    fontSize: 10,
    color: tokens.colors.light.contentSecondary,
  },
  actionRow: {
    gap: tokens.spacing.sm,
    marginTop: tokens.spacing.md,
  },
});
