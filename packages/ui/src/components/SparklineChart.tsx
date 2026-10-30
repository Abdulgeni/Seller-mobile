import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { tokens } from "../tokens";

export interface SparklinePoint {
  value: number;
  label?: string;
}

export interface SparklineChartProps {
  data: SparklinePoint[];
  height?: number;
}

export function SparklineChart({
  data,
  height = 54,
}: SparklineChartProps): React.JSX.Element {
  if (data.length === 0) {
    return <View style={{ height }} />;
  }

  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const peakIndex = values.indexOf(max);

  return (
    <View style={[styles.container, { height }]}>
      <View style={styles.barsContainer}>
        {data.map((point, idx) => {
          const ratio = (point.value - min) / range;
          const barHeight = Math.max(6, ratio * (height - 18));
          const isPeak = idx === peakIndex;

          return (
            <View key={idx} style={styles.barWrapper}>
              {isPeak && <View style={styles.peakDot} />}
              <View
                style={[
                  styles.bar,
                  {
                    height: barHeight,
                    backgroundColor: isPeak
                      ? tokens.colors.light.accent
                      : tokens.colors.light.borderStrong,
                  },
                ]}
              />
              {point.label && <Text style={styles.barLabel}>{point.label}</Text>}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    justifyContent: "flex-end",
  },
  barsContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: "100%",
    paddingTop: 8,
  },
  barWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    position: "relative",
  },
  peakDot: {
    width: 6,
    height: 6,
    borderRadius: tokens.radii.full,
    backgroundColor: tokens.colors.light.accent,
    marginBottom: 2,
  },
  bar: {
    width: 6,
    borderRadius: tokens.radii.sm,
  },
  barLabel: {
    fontSize: 9,
    color: tokens.colors.light.contentSecondary,
    marginTop: 4,
  },
});
