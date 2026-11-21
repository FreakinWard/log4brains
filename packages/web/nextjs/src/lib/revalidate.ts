/**
 * Incremental Static Regeneration settings for getStaticProps().
 * Preview mode serves the pages with `next start`: they are regenerated every second,
 * and on demand when an ADR file changes (see pages/api/revalidate.ts).
 * The static export (`log4brains build`) does not support ISR.
 */
export const isrProps: { revalidate?: number } = process.env
  .NEXT_PUBLIC_LOG4BRAINS_STATIC
  ? {}
  : { revalidate: 1 };
