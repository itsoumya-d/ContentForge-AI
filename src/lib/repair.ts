import { ContentPayload, VerificationResult, verifyContent } from "./verify";

export interface LedgerEntry {
  round: number;
  score: number;
  passed: boolean;
  repaired: string[];
  reported: string[];
  timestamp: string;
}

export interface RepairResult {
  content: ContentPayload;
  score: number;
  passed: boolean;
  rounds: number;
  ledger: LedgerEntry[];
  escalatedFaults: string[];
}

export function repairContent(
  initialContent: ContentPayload,
  maxRounds: number = 3
): RepairResult {
  const currentContent: ContentPayload = JSON.parse(JSON.stringify(initialContent));
  const ledger: LedgerEntry[] = [];
  const escalatedFaults: string[] = [];
  let finalResult: VerificationResult = verifyContent(currentContent);

  for (let round = 1; round <= maxRounds; round++) {
    const verification = verifyContent(currentContent);
    const repairedThisRound: string[] = [];
    const reportedThisRound: string[] = [];

    if (verification.passed) {
      ledger.push({
        round,
        score: verification.score,
        passed: true,
        repaired: [],
        reported: [],
        timestamp: new Date().toISOString(),
      });
      finalResult = verification;
      break;
    }

    for (const failure of verification.failures) {
      if (!failure.mechanical) {
        reportedThisRound.push(failure.reason);
        if (!escalatedFaults.includes(failure.reason)) {
          escalatedFaults.push(failure.reason);
        }
        continue;
      }

      switch (failure.id) {
        case "thread_non_empty":
          if (currentContent.twitter) {
            currentContent.twitter = currentContent.twitter
              .map((t) => t.trim())
              .filter((t) => t.length > 0);
            repairedThisRound.push("filtered_empty_tweets");
          }
          break;

        case "whitespace_trimmed":
          if (currentContent.twitter) {
            currentContent.twitter = currentContent.twitter.map((t) =>
              t.trim().replace(/\s{2,}/g, " ")
            );
          }
          if (currentContent.linkedin) {
            currentContent.linkedin = currentContent.linkedin
              .trim()
              .replace(/\s{2,}/g, " ");
          }
          if (currentContent.instagram) {
            currentContent.instagram = currentContent.instagram
              .trim()
              .replace(/\s{2,}/g, " ");
          }
          repairedThisRound.push("normalized_whitespace");
          break;

        case "hashtag_formatting": {
          const normalizeTags = (text: string) =>
            text
              .replace(/\btag:([a-zA-Z0-9_]+)/g, "#$1")
              .replace(/\bhash_([a-zA-Z0-9_]+)/g, "#$1");

          if (currentContent.twitter) {
            currentContent.twitter = currentContent.twitter.map(normalizeTags);
          }
          if (currentContent.linkedin) {
            currentContent.linkedin = normalizeTags(currentContent.linkedin);
          }
          if (currentContent.instagram) {
            currentContent.instagram = normalizeTags(currentContent.instagram);
          }
          repairedThisRound.push("normalized_hashtags");
          break;
        }

        default:
          break;
      }
    }

    const postRepairVerification = verifyContent(currentContent);
    finalResult = postRepairVerification;

    ledger.push({
      round,
      score: postRepairVerification.score,
      passed: postRepairVerification.passed,
      repaired: repairedThisRound,
      reported: reportedThisRound,
      timestamp: new Date().toISOString(),
    });

    if (postRepairVerification.passed) {
      break;
    }
  }

  return {
    content: currentContent,
    score: finalResult.score,
    passed: finalResult.passed,
    rounds: ledger.length,
    ledger,
    escalatedFaults,
  };
}
