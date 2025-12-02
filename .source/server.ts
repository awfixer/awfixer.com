// @ts-nocheck
import * as __fd_glob_8 from "../content/docs/modded-android/index.mdx?collection=docs"
import * as __fd_glob_7 from "../content/docs/guides/index.mdx?collection=docs"
import * as __fd_glob_6 from "../content/docs/developer/index.mdx?collection=docs"
import * as __fd_glob_5 from "../content/docs/awfixeros/installation.mdx?collection=docs"
import * as __fd_glob_4 from "../content/docs/awfixeros/index.mdx?collection=docs"
import * as __fd_glob_3 from "../content/docs/awbrowse/installation.mdx?collection=docs"
import * as __fd_glob_2 from "../content/docs/awbrowse/index.mdx?collection=docs"
import * as __fd_glob_1 from "../content/docs/index.mdx?collection=docs"
import { default as __fd_glob_0 } from "../content/docs/meta.json?collection=docs"
import { server } from 'fumadocs-mdx/runtime/server';
import type * as Config from '../source.config';

const create = server<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>({"doc":{"passthroughs":["extractedReferences"]}});

export const docs = await create.docs("docs", "content/docs", {"meta.json": __fd_glob_0, }, {"index.mdx": __fd_glob_1, "awbrowse/index.mdx": __fd_glob_2, "awbrowse/installation.mdx": __fd_glob_3, "awfixeros/index.mdx": __fd_glob_4, "awfixeros/installation.mdx": __fd_glob_5, "developer/index.mdx": __fd_glob_6, "guides/index.mdx": __fd_glob_7, "modded-android/index.mdx": __fd_glob_8, });