import rubricData from "@/config/rubric.json";

export interface RubricCheck {
  id: string;
  name: string;
  weight: number;
  mechanical: boolean;
  description: string;
}

export interface RubricConfig {
  version: string;
  minPassScore: number;
  checks: RubricCheck[];
}

export interface VerificationFailure {
  id: string;
  name: string;
  reason: string;
  mechanical: boolean;
}

export interface VerificationResult {
  score: number;
  passed: boolean;
  failures: VerificationFailure[];
  checksEvaluated: number;
}

export interface ContentPayload {
  twitter?: string[];
  linkedin?: string;
  instagram?: string;
  factualDiscrepancy?: boolean;
}

export function getRubric(): RubricConfig {
  return rubricData as RubricConfig;
}

export function verifyContent(
  content: ContentPayload,
  customRubric?: RubricConfig
): VerificationResult {
  const rubric = customRubric || getRubric();
  const failures: VerificationFailure[] = [];

  for (const check of rubric.checks) {
    switch (check.id) {
      case "thread_non_empty":
        if (content.twitter) {
          const hasEmpty = content.twitter.some(
            (tweet) => !tweet || tweet.trim().length === 0
          );
          if (hasEmpty || content.twitter.length === 0) {
            failures.push({
              id: check.id,
              name: check.name,
              reason: "Twitter thread contains empty or blank items",
              mechanical: check.mechanical,
            });
          }
        }
        break;

      case "whitespace_trimmed": {
        let untrimmed = false;
        if (content.twitter) {
          untrimmed = content.twitter.some(
            (t) => t !== t.trim() || t.includes("   ")
          );
        }
        if (
          content.linkedin &&
          (content.linkedin !== content.linkedin.trim() ||
            content.linkedin.includes("   "))
        ) {
          untrimmed = true;
        }
        if (
          content.instagram &&
          (content.instagram !== content.instagram.trim() ||
            content.instagram.includes("   "))
        ) {
          untrimmed = true;
        }
        if (untrimmed) {
          failures.push({
            id: check.id,
            name: check.name,
            reason: "Detected untrimmed leading/trailing whitespace or irregular spacing",
            mechanical: check.mechanical,
          });
        }
        break;
      }

      case "hashtag_formatting": {
        let invalidTags = false;
        const checkText = (text: string) => {
          const words = text.split(/\s+/);
          for (const word of words) {
            if (word.startsWith("tag:") || word.startsWith("hash_")) {
              invalidTags = true;
            }
          }
        };
        if (content.twitter) content.twitter.forEach(checkText);
        if (content.linkedin) checkText(content.linkedin);
        if (content.instagram) checkText(content.instagram);

        if (invalidTags) {
          failures.push({
            id: check.id,
            name: check.name,
            reason: "Malformed hashtag prefix (e.g., tag: or hash_ instead of #)",
            mechanical: check.mechanical,
          });
        }
        break;
      }

      case "factual_context_relevance":
        if (content.factualDiscrepancy) {
          failures.push({
            id: check.id,
            name: check.name,
            reason: "Potential hallucination or semantic departure from source reference",
            mechanical: check.mechanical,
          });
        }
        break;

      default:
        break;
    }
  }

  const failedWeight = failures.reduce((sum, f) => {
    const matched = rubric.checks.find((c) => c.id === f.id);
    return sum + (matched ? matched.weight : 25);
  }, 0);

  const score = Math.max(0, Math.min(100, 100 - failedWeight));
  const passed = score >= rubric.minPassScore && failures.length === 0;

  return {
    score,
    passed,
    failures,
    checksEvaluated: rubric.checks.length,
  };
}
