/**
 * Frontend tests for LibraryProvider.
 *
 * These tests verify:
 * - Logged-out users have no Authorization header or library data.
 * - Logged-in users receive a Bearer token header.
 * - The library is fetched when a token becomes available.
 * - Fetched entries are stored through useLocalStorage.
 * - Add, update, and delete actions call the service correctly.
 * - The library is refreshed after successful mutations.
 * - Failed requests do not crash the provider.
 */

import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import {
  act,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";

import LibraryProvider from "../../context/library/LibraryProvider.jsx";
import { LibraryContext } from "../../context/library/LibraryContext.jsx";
import { useContext } from "react";

/**
 * Shared mocks are created with vi.hoisted because vi.mock declarations
 * are moved to the top of the test module by Vitest.
 */
const mocks = vi.hoisted(() => ({
  token: null,
  library: null,
  setLibrary: vi.fn(),
  getLibrary: vi.fn(),
  addEntry: vi.fn(),
  updateEntry: vi.fn(),
  deleteEntry: vi.fn(),
}));

/**
 * Mock authenticated-user state.
 *
 * Individual tests can change mocks.token before rendering the provider.
 */
vi.mock("../../hooks/auth/useAuth.js", () => ({
  useAuth: () => ({
    token: mocks.token,
  }),
}));

/**
 * Mock useLocalStorage so the test can inspect state updates without relying
 * on the browser's real localStorage implementation.
 */
vi.mock("../../hooks/useLocalStorage.js", () => ({
  useLocalStorage: () => [
    mocks.library,
    mocks.setLibrary,
  ],
}));

/**
 * Mock all library API service functions.
 */
vi.mock("../../api/library/libraryService.js", () => ({
  getLibrary: mocks.getLibrary,
  addEntry: mocks.addEntry,
  updateEntry: mocks.updateEntry,
  deleteEntry: mocks.deleteEntry,
}));

/**
 * Provide a controllable Axios-like client object.
 */
vi.mock("../../api/library/libraryClient.js", () => ({
  default: {
    defaults: {
      headers: {
        common: {},
      },
    },
  },
}));

/**
 * Import the mocked client after its module declaration.
 */
import libraryClient from "../../api/library/libraryClient.js";

/**
 * Consumer component used to access the context exposed by LibraryProvider.
 */
function LibraryConsumer() {
  const {
    library,
    getLibraryEntries,
    addLibraryEntry,
    updateLibraryEntry,
    deleteLibraryEntry,
  } = useContext(LibraryContext);

  return (
    <div>
      <p data-testid="library-value">
        {library === null
          ? "null"
          : JSON.stringify(library)}
      </p>

      <button
        type="button"
        onClick={() => getLibraryEntries()}
      >
        Fetch library
      </button>

      <button
        type="button"
        onClick={() =>
          addLibraryEntry(
            "book-1",
            "reading",
            false,
            null
          )
        }
      >
        Add entry
      </button>

      <button
        type="button"
        onClick={() =>
          updateLibraryEntry(
            "book-1",
            "read",
            true,
            5
          )
        }
      >
        Update entry
      </button>

      <button
        type="button"
        onClick={() =>
          deleteLibraryEntry("book-1")
        }
      >
        Delete entry
      </button>
    </div>
  );
}

/**
 * Helper for rendering LibraryProvider with a context consumer.
 */
function renderProvider() {
  return render(
    <LibraryProvider>
      <LibraryConsumer />
    </LibraryProvider>
  );
}

const sampleLibrary = [
  {
    id: 1,
    book_id: "book-1",
    status: "reading",
    is_favourite: false,
    rating: null,
    book: {
      title: "Dune",
      author: "Frank Herbert",
    },
  },
];

describe("LibraryProvider authentication behavior", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.token = null;
    mocks.library = null;

    mocks.getLibrary.mockResolvedValue({
      data: sampleLibrary,
    });

    mocks.addEntry.mockResolvedValue({
      data: {},
    });

    mocks.updateEntry.mockResolvedValue({
      data: {},
    });

    mocks.deleteEntry.mockResolvedValue({
      data: {},
    });

    delete libraryClient.defaults.headers.common[
      "Authorization"
    ];
  });

  /**
   * A logged-out user should not retain an Authorization header.
   */
  it("removes the Authorization header when there is no token", () => {
    libraryClient.defaults.headers.common[
      "Authorization"
    ] = "Bearer old-token";

    renderProvider();

    expect(
      libraryClient.defaults.headers.common[
        "Authorization"
      ]
    ).toBeUndefined();
  });

  /**
   * Logging out should clear any stored library data.
   */
  it("clears the library when there is no token", () => {
    mocks.library = sampleLibrary;

    renderProvider();

    expect(mocks.setLibrary).toHaveBeenCalledWith(
      null
    );
  });

  /**
   * The provider should not request protected library data while logged out.
   */
  it("does not fetch the library when there is no token", () => {
    renderProvider();

    expect(mocks.getLibrary).not.toHaveBeenCalled();
  });

  /**
   * A valid token should be attached as a Bearer token.
   */
  it("sets the Authorization header when a token exists", async () => {
    mocks.token = "test-jwt-token";

    renderProvider();

    expect(
      libraryClient.defaults.headers.common[
        "Authorization"
      ]
    ).toBe("Bearer test-jwt-token");

    await waitFor(() => {
      expect(mocks.getLibrary).toHaveBeenCalled();
    });
  });

  /**
   * Authentication should trigger an automatic library fetch.
   */
  it("fetches the library when a token exists", async () => {
    mocks.token = "test-jwt-token";

    renderProvider();

    await waitFor(() => {
      expect(mocks.getLibrary).toHaveBeenCalledTimes(
        1
      );
    });
  });

  /**
   * The API response data should be persisted through useLocalStorage.
   */
  it("stores fetched library entries", async () => {
    mocks.token = "test-jwt-token";

    renderProvider();

    await waitFor(() => {
      expect(mocks.setLibrary).toHaveBeenCalledWith(
        sampleLibrary
      );
    });
  });

  /**
   * The current library value should be exposed through context.
   */
  it("provides the current library to consumers", () => {
    mocks.token = null;
    mocks.library = sampleLibrary;

    renderProvider();

    expect(
      screen.getByTestId("library-value")
    ).toHaveTextContent(
      JSON.stringify(sampleLibrary)
    );
  });
});

describe("LibraryProvider fetching behavior", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.token = null;
    mocks.library = null;

    mocks.getLibrary.mockResolvedValue({
      data: sampleLibrary,
    });

    vi.stubGlobal("alert", vi.fn());
  });

  /**
   * Consumers should be able to fetch the library manually.
   */
  it("exposes a function for fetching library entries", async () => {
    const user = userEvent.setup();

    renderProvider();

    await user.click(
      screen.getByRole("button", {
        name: "Fetch library",
      })
    );

    expect(mocks.getLibrary).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(mocks.setLibrary).toHaveBeenCalledWith(
        sampleLibrary
      );
    });
  });

  /**
   * Failed fetches should be caught and reported through alert.
   */
  it("handles library fetch failures", async () => {
    const user = userEvent.setup();

    const error = {
      response: "Unable to fetch library",
    };

    mocks.getLibrary.mockRejectedValue(error);

    renderProvider();

    await user.click(
      screen.getByRole("button", {
        name: "Fetch library",
      })
    );

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        "Unable to fetch library"
      );
    });

    expect(mocks.setLibrary).not.toHaveBeenCalledWith(
      sampleLibrary
    );
  });
});

describe("LibraryProvider CRUD actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.token = null;
    mocks.library = sampleLibrary;

    mocks.getLibrary.mockResolvedValue({
      data: sampleLibrary,
    });

    mocks.addEntry.mockResolvedValue({
      data: { success: true },
    });

    mocks.updateEntry.mockResolvedValue({
      data: { success: true },
    });

    mocks.deleteEntry.mockResolvedValue({
      data: { success: true },
    });

    vi.spyOn(console, "log").mockImplementation(
      () => {}
    );
  });

  /**
   * Adding an entry should pass all supplied values to the service.
   */
  it("adds a library entry with the correct values", async () => {
    const user = userEvent.setup();

    renderProvider();

    await user.click(
      screen.getByRole("button", {
        name: "Add entry",
      })
    );

    expect(mocks.addEntry).toHaveBeenCalledWith(
      "book-1",
      "reading",
      false,
      null
    );
  });

  /**
   * A successful addition should trigger a fresh library fetch.
   */
  it("refreshes the library after adding an entry", async () => {
    const user = userEvent.setup();

    renderProvider();

    await user.click(
      screen.getByRole("button", {
        name: "Add entry",
      })
    );

    await waitFor(() => {
      expect(mocks.getLibrary).toHaveBeenCalledTimes(
        1
      );
    });
  });

  /**
   * Updating should forward status, favourite, and rating values.
   */
  it("updates a library entry with the correct values", async () => {
    const user = userEvent.setup();

    renderProvider();

    await user.click(
      screen.getByRole("button", {
        name: "Update entry",
      })
    );

    expect(mocks.updateEntry).toHaveBeenCalledWith(
      "book-1",
      "read",
      true,
      5
    );
  });

  /**
   * A successful update should trigger a fresh library fetch.
   */
  it("refreshes the library after updating an entry", async () => {
    const user = userEvent.setup();

    renderProvider();

    await user.click(
      screen.getByRole("button", {
        name: "Update entry",
      })
    );

    await waitFor(() => {
      expect(mocks.getLibrary).toHaveBeenCalledTimes(
        1
      );
    });
  });

  /**
   * Deleting should pass the selected book ID to the service.
   */
  it("deletes the selected library entry", async () => {
    const user = userEvent.setup();

    renderProvider();

    await user.click(
      screen.getByRole("button", {
        name: "Delete entry",
      })
    );

    expect(mocks.deleteEntry).toHaveBeenCalledWith(
      "book-1"
    );
  });

  /**
   * A successful deletion should trigger a fresh library fetch.
   */
  it("refreshes the library after deleting an entry", async () => {
    const user = userEvent.setup();

    renderProvider();

    await user.click(
      screen.getByRole("button", {
        name: "Delete entry",
      })
    );

    await waitFor(() => {
      expect(mocks.getLibrary).toHaveBeenCalledTimes(
        1
      );
    });
  });

  /**
   * Failed additions should be caught and should not refresh the library.
   */
  it("handles add failures without refreshing", async () => {
    const user = userEvent.setup();

    const error = new Error("Add failed");

    mocks.addEntry.mockRejectedValue(error);

    renderProvider();

    await user.click(
      screen.getByRole("button", {
        name: "Add entry",
      })
    );

    await waitFor(() => {
      expect(console.log).toHaveBeenCalledWith(
        error
      );
    });

    expect(mocks.getLibrary).not.toHaveBeenCalled();
  });

  /**
   * Failed updates should be caught and should not refresh the library.
   */
  it("handles update failures without refreshing", async () => {
    const user = userEvent.setup();

    const error = new Error("Update failed");

    mocks.updateEntry.mockRejectedValue(error);

    renderProvider();

    await user.click(
      screen.getByRole("button", {
        name: "Update entry",
      })
    );

    await waitFor(() => {
      expect(console.log).toHaveBeenCalledWith(
        error
      );
    });

    expect(mocks.getLibrary).not.toHaveBeenCalled();
  });

  /**
   * Failed deletions should be caught and should not refresh the library.
   */
  it("handles delete failures without refreshing", async () => {
    const user = userEvent.setup();

    const error = new Error("Delete failed");

    mocks.deleteEntry.mockRejectedValue(error);

    renderProvider();

    await user.click(
      screen.getByRole("button", {
        name: "Delete entry",
      })
    );

    await waitFor(() => {
      expect(console.log).toHaveBeenCalledWith(
        error
      );
    });

    expect(mocks.getLibrary).not.toHaveBeenCalled();
  });
});