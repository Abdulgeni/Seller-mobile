import React from "react";
import { StyleProp, Text, TextStyle } from "react-native";

function createMockIcon(family: string) {
  return function MockIcon(props: { name: string; size?: number; color?: string; style?: StyleProp<TextStyle> }) {
    const { style, name } = props;
    return React.createElement(Text, { style, testID: name }, `[${family}:${name}]`);
  };
}

export const Ionicons = createMockIcon("Ionicons");
export const Feather = createMockIcon("Feather");
export const MaterialCommunityIcons = createMockIcon("MaterialCommunityIcons");
export default { Ionicons, Feather, MaterialCommunityIcons };
