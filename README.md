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
