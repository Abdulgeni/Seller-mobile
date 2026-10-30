import React from "react";
import { describe, expect, it } from "vitest";
import { CommandPaletteModal } from "../CommandPaletteModal";
import { useCommandPaletteStore } from "../commandStore";

describe("Loop 4: Global Command Palette (⌘K)", () => {
  it("controls palette open and close state via command store", () => {
    expect(useCommandPaletteStore.getState().isOpen).toBe(false);

    useCommandPaletteStore.getState().open();
    expect(useCommandPaletteStore.getState().isOpen).toBe(true);

    useCommandPaletteStore.getState().close();
    expect(useCommandPaletteStore.getState().isOpen).toBe(false);

    useCommandPaletteStore.getState().toggle();
    expect(useCommandPaletteStore.getState().isOpen).toBe(true);

    useCommandPaletteStore.getState().close();
  });

  it("exports CommandPaletteModal component definition", () => {
    expect(CommandPaletteModal).toBeDefined();
    expect(typeof CommandPaletteModal).toBe("function");

    const element = React.createElement(CommandPaletteModal);
    expect(element).toBeDefined();
  });
});
