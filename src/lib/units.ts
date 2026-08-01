import { formatPace } from "@/lib/utils";

/**
 * Distance units.
 *
 * Everything internal stays metric — metres and seconds per kilometre — and
 * conversion happens only at the moment of display. Storing miles would mean
 * every calculation had to know which unit it was in, which is how rounding
 * errors creep into a runner's history.
 */
export type Units = "km" | "mi";

const KM_PER_MILE = 1.609344;

export function isUnits(value: unknown): value is Units {
  return value === "km" || value === "mi";
}

/** Short label for the unit itself. */
export function distanceLabel(units: Units): string {
  return units === "mi" ? "mi" : "km";
}

/** Label for a pace, e.g. "/km" or "/mi". */
export function paceLabel(units: Units): string {
  return units === "mi" ? "/mi" : "/km";
}

/** Metres → the runner's unit, as a number. */
export function toDistance(metres: number, units: Units): number {
  const km = metres / 1000;
  return units === "mi" ? km / KM_PER_MILE : km;
}

/** Metres → a display string, without the unit. */
export function formatDistanceIn(
  metres: number,
  units: Units,
  digits = 2
): string {
  return toDistance(metres, units).toFixed(digits);
}

/** Kilometres in the runner's unit — for goals, which are set in whole units. */
export function fromKm(km: number, units: Units): number {
  return units === "mi" ? km / KM_PER_MILE : km;
}

export function toKm(value: number, units: Units): number {
  return units === "mi" ? value * KM_PER_MILE : value;
}

/** Seconds per kilometre → a pace string in the runner's unit. */
export function formatPaceIn(secondsPerKm: number, units: Units): string {
  if (!isFinite(secondsPerKm) || secondsPerKm <= 0) return "--:--";
  return formatPace(units === "mi" ? secondsPerKm * KM_PER_MILE : secondsPerKm);
}
