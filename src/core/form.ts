import palette from '../vision/palette.json';
import type { ConfigLocks, MixConfig, Track } from './types';

/**
 * Lyria remembers about ten seconds, so left alone the music never builds or
 * changes: a piece with no sections. This gives it some. After a phrase of
 * full music, a rest of the pen lets it take a breath: the drums drop out, it
 * thins, and the second instrument comes to the front. The pen coming back
 * brings it all back, a few bars on, the way a band comes back in. While the
 * pen keeps drawing, the drawing is the form, and there is no breath.
 *
 * Applied only on the way out to the engine, so the mixer, the planner and
 * Gemini all see the mix as set, never the breath.
 */
export const FULL_BARS = 16;
export const BREATH_BARS = 8;
/** How long the pen must rest before a breath, so a pause to think doesn't cue one. */
export const REST_BARS = 4;
/** The least a breath lasts once begun, so it's heard as a section, not a flicker. */
export const MIN_BREATH_BARS = 4;
/** How much a breath thins the music, on the 0..1 energy dial. */
const THINNER = 0.25;

export interface Form {
  breath: boolean;
  /** When this section began, ms. */
  since: number;
}

/** The section after `now`, given when the pen was last on the paper and how long a bar lasts. */
export function nextForm(form: Form, now: number, penAt: number, bar: number): Form {
  const bars = (now - form.since) / bar;
  if (!form.breath) {
    return bars >= FULL_BARS && (now - penAt) / bar >= REST_BARS ? { breath: true, since: now } : form;
  }
  const back = bars >= BREATH_BARS || (penAt > form.since && bars >= MIN_BREATH_BARS);
  return back ? { breath: false, since: now } : form;
}

/** A breath's knobs: no drums and less energy, unless the artist locked them. */
export function breathConfig(config: MixConfig, locks: ConfigLocks): MixConfig {
  return {
    ...config,
    muteDrums: locks.muteDrums ? config.muteDrums : true,
    density: locks.density ? config.density : Math.max(0, config.density - THINNER),
  };
}

const INSTRUMENTS = new Set(palette.instruments.map((i) => i.label));

/** A breath's layers: the first two instruments heard trade weights, so the second leads. */
export function breathTracks(tracks: Track[]): Track[] {
  const [lead, second] = tracks.filter((t) => !t.muted && INSTRUMENTS.has(t.label));
  if (!second) return tracks;
  return tracks.map((t) =>
    t === lead ? { ...t, volume: second.volume } : t === second ? { ...t, volume: lead.volume } : t,
  );
}
