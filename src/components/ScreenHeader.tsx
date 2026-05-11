/**
 * The "Fantasy Football" / "Build Your Dream Team" header used on every
 * screen after Welcome.
 *
 * The Figma frame is 375×812 with the heading at top:152 / subhead at
 * top:203.5, but iPhone WebViews in the field are typically 600–720px tall
 * after the host app's chrome (status bar, nav bar, home indicator). With
 * the Figma coordinates the cards that follow this header end up clipped
 * at the bottom of the screen. We shift the entire stack up 92px from the
 * Figma anchors (heading 152→60, subhead 203.5→111.5) and every screen's
 * card uses the matching shifted top value.
 *
 * Designer nudged the heading from 152→155 between TeamName and Select-Team
 * frames; we use 60 here as a single consistent value rather than tracking
 * the per-screen 3px jitter.
 */
export default function ScreenHeader() {
  return (
    <>
      <h1 className="absolute left-1/2 -translate-x-1/2 top-[60px] w-[82.9%] font-display text-[35px] leading-[35px] uppercase text-on-accent text-center">
        Fantasy Football
      </h1>

      <p className="absolute left-1/2 -translate-x-1/2 top-[111.5px] -translate-y-1/2 font-display text-[19px] uppercase text-on-surface whitespace-nowrap">
        Build Your Dream Team
      </p>
    </>
  );
}
