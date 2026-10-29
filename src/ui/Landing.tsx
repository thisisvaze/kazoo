import { useEffect, useRef, useState } from 'react';
import getStroke from 'perfect-freehand';
import { WatercolorButton } from '@/components/ui/watercolor-button';
import { SkuzicLogo } from '@/components/SkuzicLogo';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import type { Theme } from './Settings';
import { INK_ALPHA, PENCIL, makeGrainTile, outlinePath, seeded } from './DrawCanvas';
import './landing.css';

const GITHUB = 'https://github.com/thisisvaze/skuzic';
const REPO_API = 'https://api.github.com/repos/thisisvaze/skuzic';

/** The studio's own pencil colours (DrawCanvas), without its black, grey and brown. */
const INKS = ['#2d7dd2', '#e2711d', '#7c3aed', '#6a994e', '#e26d9e', '#1b998b', '#d1495b', '#f0a202', '#3d348b'];
const [BLUE, ORANGE, , , , TEAL, RED, AMBER, INDIGO] = INKS;
const BROWN = '#8b5a2b';

/** The painted action and what to know before pressing it. */
function Start({
  onStart,
  returning,
  demo,
}: {
  onStart?: () => void;
  returning: boolean;
  demo: boolean;
}) {
  return (
    <div className="experiment-start">
      {onStart ? (
        <WatercolorButton onClick={onStart}>
          {returning ? 'Back to studio' : 'Open studio'}
        </WatercolorButton>
      ) : (
        <p className="experiment-note">The studio opens on a desktop or laptop.</p>
      )}
    </div>
  );
}

/**
 * GitHub, with the live star count. The amber star draws itself and shines
 * once, then fills and shines again under the pointer: a quiet ask for a star.
 */
function GitHubStar() {
  const [stars, setStars] = useState<number | null>(null);
  useEffect(() => {
    // No token: 60 calls an hour per visitor, each cached a minute. A failure just leaves the count off.
    fetch(REPO_API)
      .then((r) => r.json())
      .then((repo) => typeof repo.stargazers_count === 'number' && setStars(repo.stargazers_count))
      .catch(() => {});
  }, []);
  return (
    <a
      href={GITHUB}
      target="_blank"
      rel="noreferrer"
      className="experiment-github"
      aria-label={`Star skuzic on GitHub${stars === null ? '' : `, ${stars} ${stars === 1 ? 'star' : 'stars'}`}`}
    >
      <svg viewBox="0 0 16 16" aria-hidden="true" fill="currentColor">
        <path d="M6.766 11.328c-2.063-.25-3.516-1.734-3.516-3.656 0-.781.281-1.625.75-2.188-.203-.515-.172-1.609.063-2.062.625-.078 1.468.25 1.968.703.594-.187 1.219-.281 1.985-.281.765 0 1.39.094 1.953.265.484-.437 1.344-.765 1.969-.687.218.422.25 1.515.046 2.047.5.593.766 1.39.766 2.203 0 1.922-1.453 3.375-3.547 3.64.531.344.89 1.094.89 1.954v1.625c0 .468.391.734.86.547C13.781 14.359 16 11.53 16 8.03 16 3.61 12.406 0 7.984 0 3.563 0 0 3.61 0 8.031a7.88 7.88 0 0 0 5.172 7.422c.422.156.828-.125.828-.547v-1.25c-.219.094-.5.156-.75.156-1.031 0-1.64-.562-2.078-1.609-.172-.422-.36-.672-.719-.719-.187-.015-.25-.093-.25-.187 0-.188.313-.328.625-.328.453 0 .844.281 1.25.86.313.452.64.655 1.031.655s.641-.14 1-.5c.266-.265.47-.5.657-.656" />
      </svg>
      Star
      <svg viewBox="0 0 24 24" aria-hidden="true" className="experiment-github-star">
        <path
          pathLength={1}
          d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"
        />
        <path className="experiment-github-shine" d="M2.8 2.8 0 0M12-2v-4M21.2 2.8 24 0" />
      </svg>
      <span className="experiment-github-count">
        {stars !== null && new Intl.NumberFormat('en', { notation: 'compact' }).format(stars)}
      </span>
    </a>
  );
}

/** Backdrop blurs in px, weakest first. Each starts a step higher up the fade, and behind the bar they all stack. */
const FROST = [1, 2, 4, 8, 16];

/**
 * The name and the link stay at the top. Once the page moves, whatever passes
 * under them goes soft, softer toward the edge: a progressive blur, each layer
 * masked to its own band, with the paper fading in over it (`.frost`).
 */
function Header({ theme, onThemeChange }: {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}) {
  return (
    <header className="experiment-header sticky top-0 z-20 h-0">
      <div aria-hidden="true" className="frost pointer-events-none absolute inset-x-0 top-0 h-28 *:absolute *:inset-0">
        {FROST.map((px, i) => {
          // The fade is the bottom 45% of the strip, in five steps.
          const band = `linear-gradient(to top, transparent ${i * 9}%, #000 ${i * 9 + 9}%)`;
          return (
            <div
              key={px}
              style={{ backdropFilter: `blur(${px}px)`, WebkitBackdropFilter: `blur(${px}px)`, maskImage: band, WebkitMaskImage: band }}
            />
          );
        })}
        <div className="experiment-frost-tint" />
      </div>
      <div className="landing-pass relative mx-auto flex max-w-6xl items-center justify-between px-gutter pt-6 lg:pt-8">
        <SkuzicLogo />
        <nav aria-label="About skuzic" className="flex items-center gap-3 text-[0.9375rem] font-medium sm:gap-6">
          <GitHubStar />
          <ThemeSwitcher value={theme} onChange={onThemeChange} />
        </nav>
      </div>
    </header>
  );
}

function Hero({ onStart, returning, demo }: {
  onStart?: () => void;
  returning: boolean;
  demo: boolean;
}) {
  return (
    <main className="experiment-main" aria-labelledby="experiment-title">
      <div className="experiment-playground">
        <div className="experiment-paper">
          <figure className="experiment-sketch">
            <HandSketch />
          </figure>
        </div>
      </div>

      <div className="experiment-invitation">
        <h1 id="experiment-title" className="experiment-title">Make art with music.</h1>
        <p className="experiment-description">You draw. The music follows. See where it takes you.</p>
        <Start onStart={onStart} returning={returning} demo={demo} />
      </div>
    </main>
  );
}

/** A smooth line through hand-placed points (Catmull-Rom), the way a pen joins them up. */
function through(anchors: number[][], per = 6): number[][] {
  const out: number[][] = [];
  for (let i = 0; i < anchors.length - 1; i++) {
    const [p0, p1, p2, p3] = [anchors[i - 1] ?? anchors[i], anchors[i], anchors[i + 1], anchors[i + 2] ?? anchors[i + 1]];
    for (let k = 0; k < per; k++) {
      const t = k / per;
      out.push(
        [0, 1].map(
          (d) =>
            0.5 *
            (2 * p1[d] +
              (p2[d] - p0[d]) * t +
              (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * t * t +
              (3 * p1[d] - p0[d] - 3 * p2[d] + p3[d]) * t * t * t),
        ),
      );
    }
  }
  out.push(anchors[anchors.length - 1]);
  return out;
}

interface Mark {
  color: string;
  /** [x, y, pressure] in a 420 by 330 box, in the order the hand draws them. */
  points: number[][];
  /** How far the nib takes to press in and lift off. Any taper ends in a point, so short dashes keep round ends. */
  taper: [start: number, end: number];
}

/**
 * A sun over the sea the way a hand draws it: a lopsided loop that runs past
 * its start, uneven rays, two gulls, a leaning mast, loose waves. The wobble is
 * seeded, so it's the same drawing on every visit.
 */
const SEA: Mark[] = (() => {
  const rand = seeded(20261007);
  const j = (n: number) => (rand() - 0.5) * 2 * n;
  const marks: [color: string, anchors: number[][]][] = [];
  marks.push([
    AMBER,
    Array.from({ length: 12 }, (_, i) => {
      const a = -2.4 + (i / 11) * (Math.PI * 2 + 0.55);
      const r = 37 + j(3) + i * 0.35;
      return [300 + r * 1.06 * Math.cos(a), 86 + r * Math.sin(a)];
    }),
  ]);
  for (let k = 0; k < 10; k++) {
    const a = -Math.PI / 2 + (k / 10) * Math.PI * 2 + j(0.14);
    const r0 = 49 + j(3);
    const r1 = r0 + 19 + j(5);
    marks.push([
      ORANGE,
      [
        [300 + r0 * Math.cos(a), 86 + r0 * Math.sin(a)],
        [300 + r1 * Math.cos(a + j(0.06)), 86 + r1 * Math.sin(a + j(0.06))],
      ],
    ]);
  }
  marks.push([INDIGO, [[118, 64], [125, 56], [133, 56], [139, 63], [146, 55], [154, 56], [160, 64]]]);
  marks.push([INDIGO, [[176, 42], [181, 37], [186, 37], [190, 42], [194, 36], [199, 37], [203, 43]]]);
  marks.push([BROWN, [[157, 214], [156, 172], [153, 127]]]);
  marks.push([RED, [[155, 131], [177, 150], [191, 177], [160, 204]]]);
  marks.push([BROWN, [[105, 213], [152, 216], [206, 210]]]);
  marks.push([BROWN, [[108, 215], [121, 233], [149, 240], [180, 237], [201, 213]]]);
  for (const [x0, x1, y, color] of [
    [18, 402, 262, BLUE],
    [46, 398, 288, TEAL],
    [78, 352, 314, BLUE],
  ] as const) {
    const humps: number[][] = [];
    for (let x = x0, up = true; x <= x1; x += 15 + j(3), up = !up) humps.push([x, y + (up ? -5 : 5) + j(1.8)]);
    marks.push([color, humps]);
  }

  return marks.map(([color, anchors]) => {
    const line = through(anchors);
    const phase = rand() * 6;
    let length = 0;
    for (let i = 1; i < line.length; i++) length += Math.hypot(line[i][0] - line[i - 1][0], line[i][1] - line[i - 1][1]);
    return {
      color,
      points: line.map(([x, y], i) => [x + j(0.4), y + j(0.4), 0.5 + 0.14 * Math.sin(i / 5 + phase)]),
      taper: (length < 40 ? [0, 0] : [8, 14]) as [number, number],
    };
  });
})();

/** The sun over the sea in the studio's own pencil. */
function HandSketch() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const paint = () => {
      const width = canvas.clientWidth;
      const d = window.devicePixelRatio || 1;
      const [w, h] = [Math.round(width * d), Math.round(width * (330 / 420) * d)];
      if (canvas.width !== w || canvas.height !== h) [canvas.width, canvas.height] = [w, h];
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.setTransform((width / 420) * d, 0, 0, (width / 420) * d, 0, 0);
      ctx.globalAlpha = INK_ALPHA;
      for (const { color, points, taper } of SEA) {
        ctx.fillStyle = color;
        ctx.fill(
          outlinePath(
            getStroke(points, {
              ...PENCIL,
              size: 5,
              simulatePressure: false,
              start: { taper: taper[0] },
              end: { taper: taper[1] },
            }),
          ),
        );
      }
    };
    paint();
    const observer = new ResizeObserver(paint);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label="A coloured pencil drawing of a sun, two birds and a sailboat over three waves"
      className="pencil block aspect-[420/330] w-full"
    />
  );
}

function Footer() {
  return (
    <footer className="experiment-footer">
      <p>An experiment by Aaditya Vaze.</p>
      <nav aria-label="Project">
        <a href={GITHUB} target="_blank" rel="noreferrer">
          GitHub
        </a>
      </nav>
    </footer>
  );
}

export function Landing({
  onStart,
  returning,
  demo,
  theme,
  onThemeChange,
}: {
  /** Asks for a key first if there isn't one yet. Absent on phones and tablets, which get no studio. */
  onStart?: () => void;
  /** The shared demo key plays, so nobody needs one of their own. */
  demo: boolean;
  /** A session is already open behind this page. */
  returning: boolean;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}) {
  // The studio's paper tooth, made once and used as a mask by everything drawn here.
  const [grain] = useState(() => `url(${makeGrainTile().toDataURL()})`);

  return (
    <div
      className="landing experiment fixed inset-0 z-50 overflow-y-auto"
      style={{ '--grain': grain } as React.CSSProperties}
    >
      <div className="experiment-sheet">
        <Header theme={theme} onThemeChange={onThemeChange} />
        <Hero onStart={onStart} returning={returning} demo={demo} />
        <Footer />
      </div>
    </div>
  );
}
