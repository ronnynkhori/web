import { cn } from "@/lib/cn";
import type { MascotPose } from "@/data/mascot";
import { MascotActor } from "./mascot-actor";

/**
 * The mascot peeking over the top edge of a section, as if from behind a wall:
 * the lower part stays hidden, it pops up on scroll, bounces idly, dances on
 * hover and cheers on tap. Place inside a `relative` section.
 */
export function MascotCameo({ pose, className }: { pose: MascotPose; className?: string }) {
  return (
    <div aria-hidden="true" data-mascot-track="" suppressHydrationWarning className={cn("mascot-cameo pointer-events-none absolute bottom-full z-raised aspect-[4/3] h-[clamp(5rem,4rem+4vw,8rem)] overflow-hidden", className)}>
      <MascotActor
        src={pose.src}
        width={pose.width}
        height={pose.height}
        sizes="160px"
        delay={150}
        depth={0.5}
        className="pointer-events-auto absolute top-[6%] left-0 h-[170%]"
        imgClassName="h-full w-auto drop-shadow-[0_10px_16px_rgb(0_0_0/0.25)]"
      />
    </div>
  );
}
