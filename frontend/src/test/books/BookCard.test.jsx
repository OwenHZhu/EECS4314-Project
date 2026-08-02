
/**
 * Frontend tests for the BookCard component.
 *
 * These tests verify:
 * - The book title, author, cover, genre, and rating render correctly.
 * - The first genre is displayed when genres are stored in an array.
 * - Legacy genre keys are converted into readable labels.
 * - Library statistics are preferred for the displayed rating.
 * - The component falls back to the older book.rating value.
 * - A missing cover image displays the book title instead.
 * - Clicking the card calls the provided click handler.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";

import { BookCard } from "../../components/books/BookCard.jsx";

/**
 * Replaces the generic Icon component with a simple span.
 *
 * The visual Material Symbols implementation is not part of BookCard's
 * behaviour, so the mock keeps these tests focused on the card itself.
 */
vi.mock("../../components/generic/Icon.jsx", () => ({
  default: ({ children }) => <span>{children}</span>,
}));

/**
 * Representative book returned by the Book Service.
 */
const book = {
  id: "book-1",
  title: "Dune",
  author: "Frank Herbert",
  cover_image: "https://example.com/dune.jpg",
  genre: ["Science Fiction", "Adventure"],
  library_stats: {
    ratings: {
      average: 4.4,
    },
  },
};

describe("BookCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Verifies that the main Book Service information is displayed.
   */
  it("renders the title, author, cover image, genre, and rating", () => {
    render(<BookCard book={book} onClick={vi.fn()} />);

    expect(screen.getByText("Dune")).toBeInTheDocument();
    expect(screen.getByText("Frank Herbert")).toBeInTheDocument();
    expect(screen.getByText("Science Fiction")).toBeInTheDocument();
    expect(screen.getByText("4.4")).toBeInTheDocument();

    const cover = screen.getByRole("img", {
      name: "Dune cover",
    });

    expect(cover).toBeInTheDocument();
    expect(cover).toHaveAttribute(
      "src",
      "https://example.com/dune.jpg",
    );

    expect(
      screen.getByRole("img", {
        name: "Average rating 4.4 out of 5",
      }),
    ).toBeInTheDocument();
  });

  /**
   * When Book Service genres are stored in an array, only the first genre
   * should be shown on the compact card.
   */
  it("displays only the first array-based genre", () => {
    render(<BookCard book={book} onClick={vi.fn()} />);

    expect(
      screen.getByText("Science Fiction"),
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Adventure"),
    ).not.toBeInTheDocument();
  });

  /**
   * Older frontend data can store a genre key instead of an array. BookCard
   * should use the readable label supplied by GENRE_LABELS.
   */
  it("displays a legacy string genre", () => {
  const legacyBook = {
    ...book,
    genre: "science_fiction",
  };

  render(
    <BookCard
      book={legacyBook}
      onClick={vi.fn()}
    />,
  );

  expect(
    screen.getByText("science_fiction"),
  ).toBeInTheDocument();
});

  /**
   * The average rating calculated from library statistics should take
   * priority over the older rating property.
   */
  it("prefers the library statistics rating", () => {
    const bookWithTwoRatings = {
      ...book,
      rating: 2.1,
      library_stats: {
        ratings: {
          average: 4.8,
        },
      },
    };

    render(
      <BookCard
        book={bookWithTwoRatings}
        onClick={vi.fn()}
      />,
    );

    expect(screen.getByText("4.8")).toBeInTheDocument();
    expect(screen.queryByText("2.1")).not.toBeInTheDocument();

    expect(
      screen.getByRole("img", {
        name: "Average rating 4.8 out of 5",
      }),
    ).toBeInTheDocument();
  });

  /**
   * BookCard should continue supporting the older book.rating property when
   * library statistics are unavailable.
   */
  it("falls back to the book rating", () => {
    const bookWithoutLibraryStats = {
      ...book,
      library_stats: undefined,
      rating: 3.7,
    };

    render(
      <BookCard
        book={bookWithoutLibraryStats}
        onClick={vi.fn()}
      />,
    );

    expect(screen.getByText("3.7")).toBeInTheDocument();

    expect(
      screen.getByRole("img", {
        name: "Average rating 3.7 out of 5",
      }),
    ).toBeInTheDocument();
  });

  /**
   * A book without any rating information should display the component's
   * zero-rating fallback.
   */
  it("displays zero when no rating is available", () => {
    const unratedBook = {
      ...book,
      library_stats: undefined,
      rating: undefined,
    };

    render(
      <BookCard book={unratedBook} onClick={vi.fn()} />,
    );

    expect(screen.getByText("0.0")).toBeInTheDocument();

    expect(
      screen.getByRole("img", {
        name: "Average rating 0 out of 5",
      }),
    ).toBeInTheDocument();
  });

  /**
   * When no cover image is available, the card should use the book title as
   * a visible fallback instead of rendering a broken image.
   */
  it("displays the title as a fallback when the cover is missing", () => {
    const bookWithoutCover = {
      ...book,
      cover_image: "",
    };

    render(
      <BookCard
        book={bookWithoutCover}
        onClick={vi.fn()}
      />,
    );

    expect(
      screen.queryByRole("img", {
        name: "Dune cover",
      }),
    ).not.toBeInTheDocument();

    expect(screen.getAllByText("Dune")).toHaveLength(2);
  });

  /**
   * The card is an interactive button. Clicking anywhere on it should call
   * the handler supplied by the Discover page.
   */
  it("calls onClick when the card is clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<BookCard book={book} onClick={onClick} />);

    await user.click(
      screen.getByRole("button", {
        name: /Dune/i,
      }),
    );

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

