import type { CommandContext, ReaderCommand } from "./types.js";

export class CommandRegistry {
  private readonly commands = new Map<string, ReaderCommand>();

  register(command: ReaderCommand): void {
    if (this.commands.has(command.id)) {
      throw new Error(`Command already registered: ${command.id}`);
    }
    this.commands.set(command.id, command);
  }

  unregister(id: string): void {
    this.commands.delete(id);
  }

  list(context?: CommandContext): ReaderCommand[] {
    const commands = Array.from(this.commands.values());
    if (!context) {
      return commands;
    }
    return commands.filter(command => command.isEnabled?.(context) ?? true);
  }

  async run(id: string, context: CommandContext): Promise<void> {
    const command = this.commands.get(id);
    if (!command) {
      throw new Error(`Command not found: ${id}`);
    }
    if (command.isEnabled && !command.isEnabled(context)) {
      throw new Error(`Command is disabled: ${id}`);
    }
    await command.run(context);
  }
}

export function createDefaultCommands(): ReaderCommand[] {
  return [
    {
      id: "viewer.previousPage",
      title: "Previous page",
      shortcut: "PageUp",
      run: ({ viewer }) => viewer.previousPage(),
    },
    {
      id: "viewer.nextPage",
      title: "Next page",
      shortcut: "PageDown",
      run: ({ viewer }) => viewer.nextPage(),
    },
    {
      id: "viewer.zoomIn",
      title: "Zoom in",
      shortcut: "Mod+=",
      run: ({ viewer }) => viewer.zoomIn(),
    },
    {
      id: "viewer.zoomOut",
      title: "Zoom out",
      shortcut: "Mod+-",
      run: ({ viewer }) => viewer.zoomOut(),
    },
    {
      id: "selection.copyWithCitation",
      title: "Copy selected quote with citation",
      shortcut: "Mod+Shift+C",
      isEnabled: context => Boolean(context.selection?.text),
      run: ({ selection }) => {
        if (!selection?.text) {
          return;
        }
        const citation = `${selection.text}\n\nPage ${selection.pageIndex + 1}`;
        void navigator.clipboard?.writeText(citation);
      },
    },
  ];
}
