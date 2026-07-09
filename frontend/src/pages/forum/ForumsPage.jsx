/**
 * ./pages/ForumsPage.jsx
 *
 * Displays a list of community forum threads related to books. This page
 * provides:
 *
 * 1. **Thread listing**
 *    - Pulls thread data from `FORUMS` (mock user data).
 *    - Each thread is associated with a book via `bookId`.
 *    - Displays category, book title, thread title, author, replies, views,
 *      and last active time.
 *
 * 2. **Category badges**
 *    - Uses `CATEGORY_STYLES` to style category labels (spoilers, questions,
 *      theories).
 *    - Each category has custom background, text, border colors, and a label.
 *
 * 3. **Book indicators**
 *    - Each thread shows a small colored dot using the book’s `spineColor`.
 *    - Helps visually connect threads to their respective books.
 *
 * 4. **Empty or future features**
 *    - Includes a placeholder section indicating that thread creation will be
 *      available once backend support is implemented.
 *
 * Dependencies:
 * - `BOOKS`: Full mock book catalog.
 * - `FORUMS`: Array of forum thread objects.
 * - `CATEGORY_STYLES`: Local style map for category badges.
 *
 * Behaviour:
 * - No user interaction or navigation.
 */

import { BOOKS } from "../../data/mockBook";
import { FORUMS } from "../../data/mockUser";
import ForumItem from "./ForumItem.jsx";
import GenericButton from "../../components/generic/GenericButton.jsx";

// Style presets for each forum category
const CATEGORY_STYLES = {
  spoilers: {
    label: "Spoilers",
  },
  questions: {
    label: "Questions",
  },
  theories: {
    label: "Theories",
  },
};

export default function ForumsPage() {
  const getBook = (id) => BOOKS.find((b) => b.id === id);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <title>Forums & Discussions | BookAtlas</title>

      {/* Header section */}
      <div className="mb-10">
        <p className="text-[11px] tracking-[0.2em] uppercase text-[#444] mb-2">
          Community
        </p>
        <h1 className="text-[40px] font-semibold tracking-tight text-[#f0f0f0]">
          Forums
        </h1>
        <p className="text-[14px] text-[#444] mt-2">
          Discuss, theorize, and ask questions about your favourite books.
        </p>
      </div>

      {/* Category badges */}
      {/* TO-DO: Make category badges filter the results */}
      <div className="flex gap-3 mb-8">
        <GenericButton
          variant="spoilers"
          className="px-2 py-1 font-medium"
        >
          Spoilers
        </GenericButton>

        <GenericButton
          variant="questions"
          className="px-2 py-1 font-medium"
        >
          Questions
        </GenericButton>

        <GenericButton
          variant="theories"
          className="px-2 py-1 font-medium"
        >
          Theories
        </GenericButton>
      </div>

      {/* Forum thread list */}
      <div className="space-y-2">
        {FORUMS.map((thread) => {
          const book = getBook(thread.bookId);
          const cat = CATEGORY_STYLES[thread.category];

          return (
            <ForumItem
              key={thread.id}
              thread={thread}
              book={book}
              cat={cat}
            />
          );
        })}
      </div>
    </div>
  );
}