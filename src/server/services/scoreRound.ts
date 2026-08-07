import "server-only";

import type { Guess, Question, RoundResult } from "@/domain/types";
import { haversineM } from "@/domain/geo";
import { scoreLocation, scorePrice } from "@/domain/scoring";
import { locationVerdict, priceVerdict } from "@/domain/verdicts";
import { requireCentre } from "../repository/centres";

/**
 * Turns a guess into a result. The only place a Question's answer fields are
 * read — everything else in the app sees PublicRound or RoundResult.
 */
export function scoreRound(
  question: Question,
  index: number,
  guess: Guess,
): RoundResult {
  const centre = requireCentre(question.centreId);
  const truth = {
    centreName: centre.name,
    region: centre.region,
    lat: centre.lat,
    lng: centre.lng,
    stall: question.stall,
  };
  const imageAttribution =
    question.imageCredit && question.imageLicense && question.imageSourceUrl
      ? {
          credit: question.imageCredit,
          license: question.imageLicense,
          sourceUrl: question.imageSourceUrl,
        }
      : undefined;

  if (question.kind === "LOCATION") {
    if (guess.kind !== "LOCATION") {
      throw new Error(`Round ${index} expects a LOCATION guess`);
    }
    const distanceM = haversineM(guess, centre);
    const points = scoreLocation(distanceM);
    return {
      index,
      points,
      distanceM,
      guess,
      truth,
      imageAttribution,
      fact: question.fact,
      verdict: locationVerdict(points, Math.round(distanceM)),
    };
  }

  if (guess.kind !== "PRICE") {
    throw new Error(`Round ${index} expects a PRICE guess`);
  }
  const actual = question.answerPriceCents!;
  return {
    index,
    points: scorePrice(guess.cents, actual),
    offByCents: guess.cents - actual,
    guess,
    truth: { ...truth, priceCents: actual },
    imageAttribution,
    fact: question.fact,
    verdict: priceVerdict(guess.cents, actual),
  };
}
