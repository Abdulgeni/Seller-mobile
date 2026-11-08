import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  AIStudioService,
} from "@repo/api";
import {
  AIStudioEnhanceResult,
  StudioBackdropStyle,
  StudioLightingPreset,
} from "@repo/schemas";
import { Button, hapticFeedback, tokens } from "@repo/ui";

export interface AIStudioLightboxModalProps {
  visible: boolean;
  imageUri: string | null;
  onClose: () => void;
  onApply: (enhancedUri: string, result: AIStudioEnhanceResult) => void;
}

const BACKDROPS: { id: StudioBackdropStyle; label: string; desc: string }[] = [
  { id: "clean_studio", label: "Clean Studio", desc: "Seamless white cyclorama with soft shadow" },
  { id: "marble_slab", label: "Carrara Marble", desc: "Polished Italian stone with crisp reflections" },
  { id: "warm_velvet", label: "Warm Velvet", desc: "Deep rich luxury texture with dramatic rim light" },
];

const LIGHTING: { id: StudioLightingPreset; label: string }[] = [
  { id: "soft_ambient", label: "Soft Ambient" },
  { id: "dramatic_spot", label: "Dramatic Spot" },
  { id: "warm_golden", label: "Warm Golden" },
];

export function AIStudioLightboxModal({
  visible,
  imageUri,
  onClose,
  onApply,
}: AIStudioLightboxModalProps): React.JSX.Element | null {
  const [selectedBackdrop, setSelectedBackdrop] = useState<StudioBackdropStyle>("clean_studio");
  const [selectedLighting, setSelectedLighting] = useState<StudioLightingPreset>("soft_ambient");
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewResult, setPreviewResult] = useState<AIStudioEnhanceResult | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);

  if (!visible || !imageUri) {
    return null;
  }

  const handleBackdropSelect = (id: StudioBackdropStyle) => {
    hapticFeedback.selection();
    setSelectedBackdrop(id);
    setPreviewResult(null);
  };

  const handleLightingSelect = (id: StudioLightingPreset) => {
    hapticFeedback.selection();
    setSelectedLighting(id);
    setPreviewResult(null);
  };

  const handleGenerate = async () => {
    setIsProcessing(true);
    hapticFeedback.buttonPress();
    try {
      const res = await AIStudioService.enhancePhoto({
        sourceUri: imageUri,
        backdrop: selectedBackdrop,
        lighting: selectedLighting,
        autoCrop: true,
        shadowElevation: 4,
      });
      setPreviewResult(res);
      hapticFeedback.success();
    } catch {
      hapticFeedback.warning();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyCommit = () => {
    if (previewResult) {
      hapticFeedback.success();
      onApply(previewResult.enhancedUri, previewResult);
      onClose();
    }
  };

  // Determine mockup frame background styling
  const getBackdropStyle = () => {
    if (selectedBackdrop === "marble_slab") {
      return styles.backdropMarble;
    }
    if (selectedBackdrop === "warm_velvet") {
      return styles.backdropVelvet;
    }
    return styles.backdropClean;
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>✦ AI Studio Retouch</Text>
              <Text style={styles.subtitle}>
                Halal Market automated lighting & backdrop staging
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

          {/* Staging Canvas Preview */}
          <View style={[styles.canvasFrame, getBackdropStyle()]}>
            <Image
              source={{ uri: imageUri }}
              style={[
                styles.productImage,
                previewResult && !showOriginal ? styles.enhancedShadow : null,
              ]}
              resizeMode="contain"
            />

            {previewResult && (
              <Pressable
                onPressIn={() => setShowOriginal(true)}
                onPressOut={() => setShowOriginal(false)}
                style={styles.compareBadge}
              >
                <Text style={styles.compareText}>
                  {showOriginal ? "Showing Original" : "Hold to Compare"}
                </Text>
              </Pressable>
            )}

            {isProcessing && (
              <View style={styles.processingCover}>
                <ActivityIndicator size="large" color={tokens.colors.light.accent} />
                <Text style={styles.processingText}>Segmenting subject & staging scene...</Text>
              </View>
            )}
          </View>

          {/* Backdrop Style Selector */}
          <Text style={styles.sectionHeading}>Backdrop Environment</Text>
          <View style={styles.optionsRow}>
            {BACKDROPS.map((b) => (
              <Pressable
                key={b.id}
                onPress={() => handleBackdropSelect(b.id)}
                style={[
                  styles.optionChip,
                  selectedBackdrop === b.id && styles.optionChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.optionChipText,
                    selectedBackdrop === b.id && styles.optionChipTextActive,
                  ]}
                >
                  {b.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Lighting Selector */}
          <Text style={styles.sectionHeading}>Lighting Mood</Text>
          <View style={styles.optionsRow}>
            {LIGHTING.map((l) => (
              <Pressable
                key={l.id}
                onPress={() => handleLightingSelect(l.id)}
                style={[
                  styles.optionChip,
                  selectedLighting === l.id && styles.optionChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.optionChipText,
                    selectedLighting === l.id && styles.optionChipTextActive,
                  ]}
                >
                  {l.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Action Row */}
          <View style={styles.footerRow}>
            {previewResult ? (
              <Button
                title="Save & Apply to Product"
                variant="primary"
                onPress={handleApplyCommit}
              />
            ) : (
              <Button
                title={isProcessing ? "Processing..." : "Generate Preview"}
                variant="primary"
                loading={isProcessing}
                onPress={handleGenerate}
              />
            )}
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
    padding: tokens.spacing.lg,
    maxHeight: "90%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: tokens.spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: tokens.colors.light.contentPrimary,
    letterSpacing: 0.5,
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
  canvasFrame: {
    height: 220,
    width: "100%",
    borderRadius: tokens.radii.lg,
    borderWidth: 1,
    borderColor: tokens.colors.light.borderSubtle,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
    marginBottom: tokens.spacing.md,
  },
  backdropClean: {
    backgroundColor: tokens.colors.light.bgRaised,
  },
  backdropMarble: {
    backgroundColor: tokens.colors.light.bgSurface,
  },
  backdropVelvet: {
    backgroundColor: tokens.colors.light.contentPrimary,
  },
  productImage: {
    width: "75%",
    height: "75%",
  },
  enhancedShadow: {
    shadowColor: tokens.colors.light.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  compareBadge: {
    position: "absolute",
    bottom: tokens.spacing.sm,
    right: tokens.spacing.sm,
    backgroundColor: tokens.colors.light.bgRaised,
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: tokens.spacing.xs,
    borderRadius: tokens.radii.full,
    borderWidth: 1,
    borderColor: tokens.colors.light.borderSubtle,
  },
  compareText: {
    fontSize: 10,
    fontWeight: "600",
    color: tokens.colors.light.contentPrimary,
  },
  processingCover: {
    ...StyleSheet.absoluteFill,
    backgroundColor: tokens.colors.light.bgOverlay,
    alignItems: "center",
    justifyContent: "center",
    gap: tokens.spacing.sm,
  },
  processingText: {
    fontSize: 12,
    fontWeight: "600",
    color: tokens.colors.light.surface,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: "600",
    color: tokens.colors.light.contentSecondary,
    marginBottom: tokens.spacing.xs,
    marginTop: tokens.spacing.xs,
  },
  optionsRow: {
    flexDirection: "row",
    gap: tokens.spacing.xs,
    marginBottom: tokens.spacing.sm,
  },
  optionChip: {
    flex: 1,
    paddingVertical: tokens.spacing.sm,
    paddingHorizontal: tokens.spacing.xs,
    borderRadius: tokens.radii.md,
    backgroundColor: tokens.colors.light.bgRaised,
    borderWidth: 1,
    borderColor: tokens.colors.light.borderSubtle,
    alignItems: "center",
  },
  optionChipActive: {
    borderColor: tokens.colors.light.accent,
    backgroundColor: tokens.colors.light.bgSurface,
  },
  optionChipText: {
    fontSize: 11,
    fontWeight: "500",
    color: tokens.colors.light.contentSecondary,
  },
  optionChipTextActive: {
    color: tokens.colors.light.accent,
    fontWeight: "700",
  },
  footerRow: {
    marginTop: tokens.spacing.md,
  },
});
