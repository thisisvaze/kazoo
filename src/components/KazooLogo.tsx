import { cn } from '@/lib/utils';

/** The Kazoo mark, a bold scribble running into three bars, in the studio's orange, pink and violet pencils on paper. */
export function KazooLogo({
  compact = false,
  className,
}: {
  /** Keep the mark visible and hide the name on small studio headers. */
  compact?: boolean;
  className?: string;
}) {
  return (
    <span
      role="img"
      aria-label="Kazoo"
      className={cn('inline-flex shrink-0 items-center gap-2.5', className)}
    >
      <img
        src="/brand/kazoo-mark-pencil.svg"
        width="38"
        height="28"
        alt=""
        aria-hidden="true"
        draggable={false}
        className="pencil h-7 w-[2.377rem] shrink-0"
      />
      <span
        aria-hidden="true"
        className={cn('font-display text-[1.375rem] leading-none font-normal tracking-[-0.01em]', compact && 'hidden sm:inline')}
      >
        kazoo
      </span>
    </span>
  );
}
