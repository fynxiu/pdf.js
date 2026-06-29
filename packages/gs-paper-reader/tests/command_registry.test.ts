import { describe, expect, it } from "vitest";
import { CommandRegistry, createDefaultCommands } from "../src/command_registry.js";
import { MockViewerAdapter } from "../src/testing/index.js";

describe("CommandRegistry", () => {
  it("registers and runs commands", async () => {
    const registry = new CommandRegistry();
    const viewer = new MockViewerAdapter();

    registry.register({
      id: "test.nextPage",
      title: "Next page",
      run: ({ viewer }) => viewer.nextPage(),
    });

    await registry.run("test.nextPage", { viewer });

    expect(viewer.currentPage).toBe(2);
  });

  it("filters disabled commands", () => {
    const registry = new CommandRegistry();
    const viewer = new MockViewerAdapter();
    registry.register({ id: "enabled", title: "Enabled", run: () => undefined });
    registry.register({ id: "disabled", title: "Disabled", run: () => undefined, isEnabled: () => false });

    expect(registry.list({ viewer }).map(command => command.id)).toEqual(["enabled"]);
  });
});

describe("createDefaultCommands", () => {
  it("includes viewer navigation commands", async () => {
    const registry = new CommandRegistry();
    const viewer = new MockViewerAdapter();
    for (const command of createDefaultCommands()) {
      registry.register(command);
    }

    await registry.run("viewer.nextPage", { viewer });
    await registry.run("viewer.zoomIn", { viewer });

    expect(viewer.currentPage).toBe(2);
    expect(viewer.zoomInCalls).toBe(1);
  });
});
