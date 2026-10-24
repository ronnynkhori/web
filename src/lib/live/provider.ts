import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { demoFeedEnabled } from "./demo-mode";
import { demoBaseline, DemoResultsProvider } from "./mock-provider";
import { getStoreSnapshot } from "./store-provider";
import type { LiveSnapshot, ResultsProvider } from "./types";

const demo = new DemoResultsProvider();

function emptySnapshot(status: LiveSnapshot["status"]): LiveSnapshot {
  return { updatedAt: null, status, isDemo: false, matches: [], medals: [], results: [] };
}

/** A database outage must degrade to an honest "unavailable" state, never a crashed page. */
async function readStore(): Promise<LiveSnapshot | null | "error"> {
  try {
    return await getStoreSnapshot();
  } catch (error) {
    console.error("[live] results store unavailable", error);
    return "error";
  }
}

const store: ResultsProvider = {
  id: "store",
  async getSnapshot() {
    const snap = await readStore();
    if (snap === "error") return emptySnapshot("error");
    return snap ?? emptySnapshot("ok");
  },
};

/**
 * Automatic: Control Room results once any have been entered. Before that, the
 * labelled demo feed (unless DEMO_DATA=0, which shows an empty state).
 */
const auto: ResultsProvider = {
  id: "auto",
  async getSnapshot() {
    const snap = await readStore();
    if (snap === "error") return emptySnapshot("error");
    if (snap) return snap;
    return demoFeedEnabled() ? demo.getSnapshot() : emptySnapshot("ok");
  },
};

/**
 * RESULTS_PROVIDER=store | demo forces a source. A future official timing feed
 * implements ResultsProvider and is selected here; UI code never changes.
 */
export function getResultsProvider(): ResultsProvider {
  const choice = process.env.RESULTS_PROVIDER;
  if (choice === "demo") return demo;
  if (choice === "store") return store;
  return auto;
}

/** First paint for the hub and hero; the browser then polls /api/live. */
export async function getLiveBaseline(): Promise<LiveSnapshot> {
  "use cache";
  cacheLife("minutes");
  cacheTag("live");
  const choice = process.env.RESULTS_PROVIDER;
  if (choice === "demo") return demoBaseline;
  const snap = await readStore();
  if (snap === "error") return emptySnapshot("error");
  if (snap) return snap;
  return choice !== "store" && demoFeedEnabled() ? demoBaseline : emptySnapshot("ok");
}
