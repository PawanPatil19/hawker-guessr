import { unverifiedCount } from "@/server/repository/questions";
import { runwayDays } from "@/server/puzzle";

/**
 * Server component. Two things the PRD says will kill this product if they go
 * unwatched: publishing prices nobody checked, and running out of content.
 * Both are visible on the page until they're fixed.
 */
export function ContentWarning() {
  const unverified = unverifiedCount();
  const runway = runwayDays();
  if (unverified === 0 && runway > 30) return null;

  return (
    <p className="warning" role="note">
      <strong>Seed content.</strong>{" "}
      {unverified > 0 &&
        `${unverified} questions are seeded and not yet fact-checked. `}
      {runway <= 30 && `${runway} days of puzzles left before repeats.`}
    </p>
  );
}
