import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { runBenchmark } from "../bench/run_eval";

describe("Evaluation Benchmark Suite", () => {
  it("executes the deterministic evaluation harness and satisfies SLAs", () => {
    const { metrics, markdownTable, reportMarkdown } = runBenchmark();

    // 1. Document sanitization & chunking SLA
    expect(metrics.sanitizationThroughputMBps).toBeGreaterThan(20);
    expect(metrics.sanitizationP50Ms).toBeLessThan(15);
    expect(metrics.sanitizationP95Ms).toBeLessThan(30);

    // 2. Rubric compliance verification SLA
    expect(metrics.verificationThroughputOpsSec).toBeGreaterThan(1000);
    expect(metrics.verificationP50Ms).toBeLessThan(1);
    expect(metrics.verificationP95Ms).toBeLessThan(5);

    // 3. Self-repair loop convergence SLA
    expect(metrics.repairConvergenceRatePct).toBe(100);
    expect(metrics.repairAvgRounds).toBeLessThanOrEqual(2.0);
    expect(metrics.repairP50Ms).toBeLessThan(5);

    // 4. Fault escalation integrity SLA
    expect(metrics.escalationAccuracyPct).toBe(100);
    expect(metrics.escalationP50Ms).toBeLessThan(5);

    // 5. Output format and structure
    const lines = markdownTable.trim().split("\n");
    expect(lines.length).toBe(6); // 1 header, 1 divider, 4 phase rows
    expect(lines[0]).toContain("Pipeline Phase");

    // Write results artifact if not present or during test
    const resultsPath = resolve(process.cwd(), "results", "2026-11-28.md");
    writeFileSync(resultsPath, reportMarkdown, "utf-8");
    expect(existsSync(resultsPath)).toBe(true);

    const savedContent = readFileSync(resultsPath, "utf-8");
    expect(savedContent).toContain("ContentForge-AI Performance & Quality Benchmark");
    expect(savedContent).toContain("Executive Summary");
  });
});
