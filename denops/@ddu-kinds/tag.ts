import {
  BaseKind,
  GetPreviewerArguments,
} from "https://deno.land/x/ddu_vim@v3.5.0/base/kind.ts";
import {
  ActionFlags,
  Actions,
  Previewer,
} from "https://deno.land/x/ddu_vim@v3.5.0/types.ts";

import * as u from "https://deno.land/x/unknownutil@v3.4.0/mod.ts";
type Never = Record<never, never>;

export type ActionData = {
  name: string;
  filename: string;
  cmd: string;
};

export class Kind extends BaseKind<Never> {
  actions: Actions<Never> = {
    jump: async (args) => {
      const cmd = u.maybe(
        args.actionParams,
        u.isObjectOf({
          command: u.isString,
        }),
      )?.command ?? "tag";

      for (const item of args.items) {
        const data = item.action as ActionData;
        await args.denops.cmd([cmd, data.name].join(" "));
      }

      return ActionFlags.None;
    },
  };

  params(): Never {
    return {};
  }

  getPreviewer(args: GetPreviewerArguments): Promise<Previewer | undefined> {
    const data = args.item.action as ActionData;
    const cmd = data.cmd;
    const lineNr = parseInt(cmd);
    if (!isNaN(lineNr)) {
      return Promise.resolve({
        kind: "buffer",
        path: data.filename,
        lineNr,
      });
    }
    if (cmd[0] === "/") {
      return Promise.resolve({
        kind: "buffer",
        path: data.filename,
        pattern: cmd.slice(1),
      });
    }
    return Promise.resolve(void 0);
  }
}
