import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Help — screen 8.
 *
 * Layout derived from `mockups/FAQs.png`. The Figma frame for this screen
 * couldn't be pinned down in the brief search (it lives in the same lane as
 * Rules `77:3630` but isn't on a clean +N step), so dimensions are matched
 * visually from the mockup against the same conventions as Rules:
 *
 *   - Header at top:60  — back arrow on the left, "HELP & FAQS" title
 *                         centered (DIN Bold 20px uppercase, dark-on-teal).
 *   - Card at top:110, 311 wide, opaque navy with cyan glow. Auto height
 *     so it grows and shrinks with the accordion state. Internal scroll
 *     kicks in if everything expands on a short viewport.
 *
 * Accordion behaviour:
 *   - Multi-open: any combination of items can be expanded at once.
 *     Comparing answers side-by-side is the more common FAQ interaction;
 *     single-open accordions force the user to close one to read another.
 *   - Mockup shows "How do transfers work?" expanded on load, so we open
 *     it by default and let the user collapse/expand others.
 *   - Chevron is a single SVG rotated 90° clockwise when expanded (right ▶
 *     → down ▼). One DOM node, smooth `transition-transform` instead of a
 *     swap-out.
 *   - Body reveal uses CSS Grid `grid-template-rows: 0fr → 1fr` so the
 *     animation respects the answer's actual content height without us
 *     measuring it. Supported by every browser the prototype targets
 *     (Safari 17.4+, Chrome 117+).
 *
 * Content note: the mockup specifies the answer for the "How do transfers
 * work?" item. The other two ("When is the deadline?" and "How are points
 * calculated?") were collapsed in the mockup, so the answers below are
 * authored to match the actual prototype's rules — Rules.tsx is the source
 * of truth for scoring, and the deadline matches `deadlineFor` in
 * `src/data/matches.ts`.
 */

interface Faq {
  id: string;
  question: string;
  answer: string;
}

const FAQS: ReadonlyArray<Faq> = [
  {
    id: 'transfers',
    question: 'How do transfers work?',
    answer:
      'You get 1 transfer per Match Week. Unused transfers roll over up to max 3.',
  },
  {
    id: 'deadline',
    question: 'When is the deadline?',
    answer:
      "The lineup deadline is 1 hour before kickoff each Match Week. After the deadline, your team is locked and you can't make changes until the next Match Week starts.",
  },
  {
    id: 'points',
    question: 'How are points calculated?',
    answer:
      'Each player earns points from their on-pitch performance — minutes played, goals, assists, clean sheets, and disciplinary actions. See Rules for the full scoring breakdown.',
  },
];

export default function Help() {
  const navigate = useNavigate();
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set(['transfers']));

  function toggle(id: string) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <main className="relative w-full min-h-screen overflow-hidden animate-fade-in pb-[20px]">
      {/* Header: back arrow on the left, title centered. Same pattern as Rules. */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        aria-label="Back"
        className="absolute left-[21px] top-[60px] w-[32px] h-[32px] flex items-center justify-center text-on-accent active:opacity-70"
      >
        <svg viewBox="0 0 24 24" className="w-[20px] h-[20px]" aria-hidden="true">
          <path
            d="M15 6 L9 12 L15 18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <h1 className="absolute left-1/2 -translate-x-1/2 top-[76px] -translate-y-1/2 font-body font-bold text-[20px] leading-none uppercase text-on-accent text-center whitespace-nowrap">
        Help &amp; FAQs
      </h1>

      {/* FAQ accordion card. Auto height with a comfortable padding inside,
          so the card hugs the content as items expand/collapse. */}
      <section className="absolute left-1/2 -translate-x-1/2 top-[110px] w-[311px] bg-surface rounded-card shadow-accent-glow overflow-hidden">
        <ul>
          {FAQS.map((faq, idx) => {
            const isOpen = openIds.has(faq.id);
            return (
              <li
                key={faq.id}
                className={idx > 0 ? 'border-t border-white/10' : ''}
              >
                <button
                  type="button"
                  onClick={() => toggle(faq.id)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-${faq.id}-answer`}
                  className="w-full px-[15px] py-[16px] flex items-center justify-between text-left active:opacity-90"
                >
                  <span className="font-body font-bold text-[17px] leading-tight text-brand-accent pr-[12px]">
                    {faq.question}
                  </span>
                  <svg
                    viewBox="0 0 24 24"
                    className={`w-[14px] h-[14px] text-brand-accent flex-shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-90' : ''
                    }`}
                    aria-hidden="true"
                  >
                    <path
                      d="M9 6 L15 12 L9 18"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {/* Answer wrapper. Grid-rows trick: the inner div is the
                    grid item, and animating the row track from 0fr to 1fr
                    smoothly reveals/hides it without us measuring height. */}
                <div
                  id={`faq-${faq.id}-answer`}
                  className={`grid transition-[grid-template-rows] duration-200 ease-out ${
                    isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="font-body text-[14px] leading-[1.5] text-on-surface px-[15px] pb-[16px]">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}
