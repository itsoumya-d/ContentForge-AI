import { describe, expect, it } from "vitest";
import { verifyContent } from "@/lib/verify";
import { repairContent } from "@/lib/repair";

describe("Verify and Repair Loop", () => {
  it("scores compliant social content at 100 points and marks passed true", () => {
    const cleanContent = {
      twitter: ["First tweet introducing key finding.", "Second tweet explaining methodology."],
      linkedin: "Professional summary of research insights #AI #Engineering",
      instagram: "Visual digest of today's key breakthroughs #Tech",
    };

    const result = verifyContent(cleanContent);
    expect(result.score).toBe(100);
    expect(result.passed).toBe(true);
    expect(result.failures).toHaveLength(0);
  });

  it("mechanically repairs whitespace, empty thread entries, and malformed tags within 2 rounds", () => {
    const unformattedContent = {
      twitter: ["  Leading tweet with whitespace   ", "", "Second tweet tag:innovation  "],
      linkedin: "  Summary with hash_research and    extra spaces. ",
    };

    const initialVerify = verifyContent(unformattedContent);
    expect(initialVerify.passed).toBe(false);
    expect(initialVerify.score).toBeLessThan(80);

    const repairResult = repairContent(unformattedContent, 3);
    expect(repairResult.passed).toBe(true);
    expect(repairResult.score).toBe(100);
    expect(repairResult.rounds).toBeLessThanOrEqual(2);
    expect(repairResult.content.twitter).toEqual([
      "Leading tweet with whitespace",
      "Second tweet #innovation",
    ]);
    expect(repairResult.content.linkedin).toBe("Summary with #research and extra spaces.");
    expect(repairResult.ledger.length).toBeGreaterThanOrEqual(1);
  });

  it("stops repair loop at max 3 rounds and produces exactly 3 ledger entries on persistent error", () => {
    // Custom check failure simulation with permanent unfixable failure
    const brokenContent = {
      twitter: [],
      factualDiscrepancy: true,
    };

    const repairResult = repairContent(brokenContent, 3);
    expect(repairResult.passed).toBe(false);
    expect(repairResult.rounds).toBe(3);
    expect(repairResult.ledger).toHaveLength(3);
    expect(repairResult.escalatedFaults).toContain(
      "Potential hallucination or semantic departure from source reference"
    );
  });

  it("does not guess or hallucinate content for non-mechanical failure and escalates to human review", () => {
    const semanticFault = {
      twitter: ["Valid statement on benchmarks."],
      linkedin: "Claim unsupported by evidence in baseline document.",
      factualDiscrepancy: true,
    };

    const repairResult = repairContent(semanticFault, 3);
    expect(repairResult.passed).toBe(false);
    expect(repairResult.escalatedFaults.length).toBeGreaterThan(0);
    // Non-mechanical text remains unchanged
    expect(repairResult.content.linkedin).toBe(
      "Claim unsupported by evidence in baseline document."
    );
  });

  it("guarantees score is bounded between 0 and 100", () => {
    const multiFailing = {
      twitter: ["", "   "],
      linkedin: "tag:bad hash_invalid    spaced  ",
      factualDiscrepancy: true,
    };

    const result = verifyContent(multiFailing);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });
});
