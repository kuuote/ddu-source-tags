import { BaseKind } from "https://deno.land/x/ddu_vim@v3.4.4/base/kind.ts";
import {
  ActionFlags,
  Actions,
} from "https://deno.land/x/ddu_vim@v3.4.4/types.ts";
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
}
