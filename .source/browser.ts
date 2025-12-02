// @ts-nocheck
import { browser } from 'fumadocs-mdx/runtime/browser';
import type * as Config from '../source.config';

const create = browser<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>();
const browserCollections = {
  docs: create.doc("docs", {"index.mdx": () => import("../content/docs/index.mdx?collection=docs"), "awbrowse/index.mdx": () => import("../content/docs/awbrowse/index.mdx?collection=docs"), "awbrowse/installation.mdx": () => import("../content/docs/awbrowse/installation.mdx?collection=docs"), "awfixeros/index.mdx": () => import("../content/docs/awfixeros/index.mdx?collection=docs"), "awfixeros/installation.mdx": () => import("../content/docs/awfixeros/installation.mdx?collection=docs"), "developer/index.mdx": () => import("../content/docs/developer/index.mdx?collection=docs"), "guides/index.mdx": () => import("../content/docs/guides/index.mdx?collection=docs"), "modded-android/index.mdx": () => import("../content/docs/modded-android/index.mdx?collection=docs"), }),
};
export default browserCollections;