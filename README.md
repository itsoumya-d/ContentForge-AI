This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Chat and transformation reliability checks

Use Node.js 22 or 24, then run:

```bash
npm ci
npm test
npm run lint
npm run build
```

The regression suite uses local byte streams and mocked persistence/provider
boundaries. It does not require Firebase credentials, a Gemini API key, network
requests, or paid model calls. CI runs these tests before the existing lint and
build checks on both supported Node versions.

The chat tests cover UTF-8 characters split across chunks, missing/empty bodies,
HTTP and mid-stream failures, same-tick repeated submits, stop/retry, unmount and
chat changes, and retrying a failed save without regenerating a reply. The API
adapter forwards cancellation to the provider and surfaces failures as stream
errors. Partial replies remain visibly marked as incomplete and are not saved
as completed answers or reused in later model history within the current chat.

Social transformations validate model output before rendering it. Twitter threads
must be nonempty arrays of nonblank strings; LinkedIn and Instagram results must
be nonblank text. Failed platforms produce explicit errors, while valid results
from the same request remain available. Retrying selected platforms preserves
other drafts only when the source text and tone are unchanged; controls are
disabled while generation is pending. Total failure never produces a success
notification or substitute error text presented as generated content.

These are component and boundary regression tests, not live-provider or full
browser end-to-end tests. Firestore writes already in flight cannot be cancelled;
a failed write with an uncertain server outcome is not an exactly-once guarantee.

Stopping a response aborts the client-side SDK request. It does not guarantee
that the model service stops processing or that provider usage charges stop.

### Document analysis limitations

File upload currently stores files and metadata only; it does not extract PDF,
DOCX, or text content. New registrations are therefore `unprocessed`, not
`completed`. The former filename-only analysis has been removed. Existing
summaries without server-side content-analysis provenance are not displayed or
used by the document detail chat, and hard-coded tone/sentiment insights have
been removed. Upload success is not analysis success.

A future extraction pipeline must obtain the actual authorized file content,
await and validate analysis, then set `analysisVersion: 1` with `completed` only
on success. Registration explicitly ignores caller-provided summaries, tags,
status and provenance. Provider errors, missing configuration, malformed JSON,
and empty analysis now fail explicitly rather than becoming summary text.
These changes do not implement extraction or migrate legacy document records.


## Verify-and-Repair Quality Loop

ContentForge-AI incorporates a closed verify-and-repair quality evaluation loop (`src/lib/verify.ts` and `src/lib/repair.ts`) governed by an evaluation rubric stored in `src/config/rubric.json`. Generated artifacts are scored against mechanical and non-mechanical standards from 0 to 100 with a passing threshold of 80.

### Rubric Criteria

| Check ID | Name | Weight | Mechanical | Threshold / Requirement |
|---|---|---|---|---|
| `thread_non_empty` | Twitter Thread Non-Empty | 25 | Yes | All tweets in thread must contain non-blank text. |
| `whitespace_trimmed` | Whitespace Cleanliness | 25 | Yes | No untrimmed leading/trailing spaces or irregular gaps. |
| `hashtag_formatting` | Hashtag Normalization | 25 | Yes | Hashtags must start with `#` without malformed prefixes. |
| `factual_context_relevance` | Factual Context Relevance | 25 | No | Grounded alignment with source; deviations escalated to humans. |

### Before & After Repair Example

**Input (Score: 25 / 100 - Failed):**
```json
{
  "twitter": ["  Initial finding overview   ", "", "Follow up tag:innovation  "],
  "linkedin": "  Executive overview with hash_research and    irregular spacing. "
}
```

**Repair Rounds & Ledger:**
* Round 1: Identified mechanical faults: whitespace, empty thread item, malformed tags. Repaired leading/trailing whitespace and normalized tags (`#innovation`, `#research`). Score: 75 / 100.
* Round 2: Filtered empty thread item. Re-evaluated against rubric: all mechanical checks pass. Score: 100 / 100.

**Output (Score: 100 / 100 - Passed):**
```json
{
  "twitter": ["Initial finding overview", "Follow up #innovation"],
  "linkedin": "Executive overview with #research and irregular spacing."
}
```

## Evaluation & Performance Benchmarks (2026-11-28)

Deterministic evaluation benchmarks measuring document sanitization throughput, rubric verification latency, self-repair convergence rate, and fault escalation safety across 1,000+ synthetic payloads.

| Pipeline Phase | Operations / Workload | Latency (P50 / P95) | Throughput / Accuracy | Status |
|:---|:---|:---|:---|:---|
| Document Sanitization & Chunking | 100KB synthetic corpus (100 iters) | 0.91 ms / 1.67 ms | 95.2 MB/s | PASS |
| Rubric Compliance Verification | 1,000 social payloads (100 pts max) | 0.003 ms / 0.005 ms | 282642 evals/s | PASS |
| Self-Repair Loop Convergence | 500 defect payloads (whitespace, tags) | 0.01 ms / 0.03 ms | 100% repair (≤2 rds) | PASS |
| Fault Escalation Integrity | 250 factual discrepancy payloads | 0.01 ms / 0.02 ms | 100% escalated (0 leaks) | PASS |

Run the benchmark suite locally with:

```bash
npm run bench
```

