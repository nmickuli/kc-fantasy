import { useNavigate } from 'react-router-dom';

/**
 * Welcome — entry screen.
 *
 * Layout uses absolute px coordinates derived from the 375×812 Figma frame
 * `77:423`, shifted up 92px from the Figma anchors so the card and button
 * stay on-screen in iPhone WebViews (typically 600–720px tall after host
 * app chrome). The app's 420px max-width container is wider than the
 * Figma's 375px frame, so percentage-based widths would inflate the design
 * (an `inset-x-[8.5%]` card on max-w-[420px] becomes 348px wide instead of
 * Figma's 311px). Fixed px widths keep the card and button at their
 * designed dimensions regardless of container width.
 *
 *   - Photo: full-bleed across the entire viewport (fixed inset-0, not bound
 *     by the 420px design column). The `welcome-bg.png` bitmap is a single
 *     composited image of the brand swirl + player; using `fixed` makes it
 *     cover the side margins on desktop where the body's separate
 *     `bg-pattern.png` would otherwise show through. On the Welcome route
 *     this photo is the only visible background.
 *   - Card: top 226px (Figma 318 minus 92), 311×182px centered. Translucent
 *     navy with white glow so the photo bleeds through behind it.
 *   - Crest: absolute inside card, top -33px so its top edge sits ~33px
 *     above card top, matching Figma. 82×98px shield, horizontally centered.
 *   - Heading + subhead: flex column inside the card with pt-[76px] gap-[9px]
 *     so heading top sits 76px below card top and subhead center lands ~149.5
 *     inside the card — matching Figma.
 *   - Button: top 520px, 173×39px centered, dark surface. We tried a
 *     bottom-anchored pattern (40px + safe-area-inset-bottom) at first, but
 *     on iPhones with tallish Safari viewports (~830px web area) that
 *     pinned the button right above the Safari toolbar, which read as "way
 *     below the card" — the card-to-button gap blew up to ~350px. Going
 *     back to a fixed top puts the button ~112px below the card bottom
 *     across every WebView (the photo continues below the button to fill
 *     remaining space). Value chosen so the button stays visible on
 *     viewports down to ~560px (iPhone SE 1st gen in Safari).
 *
 * State interaction: none. Single navigate() call on button tap.
 */
export default function Welcome() {
  const navigate = useNavigate();

  return (
    <main className="relative w-full min-h-screen overflow-hidden animate-fade-in">
      {/* Player photo — fixed to the viewport so it covers the side margins
          outside the 420px design column on desktop. Solid teal-deep fallback
          if welcome-bg.png hasn't been pulled yet. */}
      <div
        role="presentation"
        className="fixed inset-0 -z-10 bg-cover bg-center bg-brand-teal-deep"
        style={{ backgroundImage: "url('/assets/welcome-bg.png')" }}
      />

      {/* Welcome card — translucent navy with white glow, fixed 311×182 to
          match Figma exactly (decoupled from the 420px container width).
          top:226 = Figma's 318 minus the universal 92px shift-up for iPhone
          WebView fit. */}
      <section className="absolute left-1/2 -translate-x-1/2 top-[226px] w-[311px] h-[182px] bg-surface-translucent rounded-card shadow-card-glow">
        {/* Crest — shield shape, extends above card top edge */}
        <img
          src="/assets/kc-crest.png"
          alt="KC Current crest"
          className="absolute -top-[33px] left-1/2 -translate-x-1/2 w-[82px] h-[98px]"
          onError={(e) => {
            const img = e.currentTarget;
            if (!img.src.endsWith('.svg')) img.src = '/assets/kc-crest.svg';
          }}
        />

        {/* Content — flex column anchored to the top of the card so the crest
            (which overhangs by 33px and occupies the upper 65px inside the
            card) has its 11px breathing room before the heading. pt-[76px]
            matches Figma's heading-top distance from card-top. gap-[9px]
            matches the Figma heading-to-subhead gap. */}
        <div className="absolute inset-0 flex flex-col items-center pt-[76px] gap-[9px] px-4">
          <h1
            className="font-display text-[25px] leading-[28px] uppercase text-center max-w-[253px]"
            style={{ textShadow: '0 1px 6px rgba(34, 34, 34, 0.62)' }}
          >
            Welcome to KC Current Fantasy Football
          </h1>
          <p className="font-display text-[14px] uppercase text-brand-accent whitespace-nowrap">
            Build Your Dream Team
          </p>
        </div>
      </section>

      {/* CTA — narrow centered, dark navy with white text. Explicit padding +
          flex centering mirror the Figma button structure (`77:433`). With
          DIN 2014 Bold now loaded (--font-body), the text fits comfortably
          inside the 131px content area inside the 173px button.
          Fixed top:520 keeps the button visually grouped with the card
          regardless of viewport height — on a 600px WebView it's 41px from
          the bottom; on an 830px Safari viewport it's 271px from the
          bottom with the swirl/player photo continuing below it. */}
      <button
        type="button"
        onClick={() => navigate('/team-name')}
        className="absolute left-1/2 -translate-x-1/2 top-[520px] flex items-center justify-center w-[173px] h-[39px] px-[21px] py-[10px] bg-surface text-on-surface rounded-button font-body font-bold text-[14px] capitalize whitespace-nowrap active:opacity-90"
      >
        Create your own team
      </button>
    </main>
  );
}
