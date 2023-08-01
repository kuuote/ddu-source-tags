import { ActionData } from "../@ddu-kinds/tag.ts";
import * as stdpath from "https://deno.land/std@0.196.0/path/mod.ts";
import {
  BaseSource,
  GatherArguments,
} from "https://deno.land/x/ddu_vim@v3.4.4/base/source.ts";
import { Item } from "https://deno.land/x/ddu_vim@v3.4.4/types.ts";
import * as u from "https://deno.land/x/unknownutil@v3.4.0/mod.ts";

type Never = Record<never, never>;

async function collectTag(path: string): Promise<ActionData[]> {
  const text = await Deno.readTextFile(path);
  const records = text.split("\n")
    .map((line) => line.split("\t"))
    .filter((record) => 3 <= record.length)
    .map((record) => ({
      name: record[0],
      filename: stdpath.join(stdpath.dirname(path), record[1]),
      cmd: record[2],
    }));
  return records;
}

export class Source extends BaseSource<Never> {
  override kind = "tag";

  gather(args: GatherArguments<Never>): ReadableStream<Item<ActionData>[]> {
    return new ReadableStream({
      start: async (controller) => {
        try {
          const tagfiles = await args.denops.eval(
            `[win_execute(${args.context.winId}, 'let l:ret = tagfiles()'), l:ret][1]`,
          );
          u.assert(tagfiles, u.isArrayOf(u.isString));

          const items = await Promise.all(tagfiles.map(collectTag))
            .then((tags) =>
              tags
                .flat()
                .map((tag) => ({
                  action: tag,
                  word: tag.name,
                }))
            );

          controller.enqueue(items);
        } finally {
          controller.close();
        }
      },
    });
  }

  params(): Never {
    return {};
  }
}
