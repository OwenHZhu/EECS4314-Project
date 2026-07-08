/**
 * ./hooks/useLocalStorage.js
 *
 * A custom React hook that synchronizes a piece of state with
 * `localStorage`. This allows values (such as auth tokens or user data)
 * to persist across page reloads.
 *
 * Arguments:
 * @param {string} key - The localStorage key to read/write.
 * @param {*} initialValue - The default value used when no stored value exists.
 *
 * Returns:
 * @returns {[any, Function]}
 *   - value: The current state value (parsed from localStorage if available).
 *   - setValue: Setter function that updates both React state and localStorage.
 *
 * Behavior:
 * - On initialization:
 *   - Attempts to read from localStorage.
 *   - If the key exists, parses JSON and uses that value.
 *   - If parsing fails or key is missing, falls back to initialValue.
 *
 * - On value change:
 *   - If value is null: remove the key from localStorage.
 *   - Otherwise: store the JSON‑stringified value.
 *
 * Notes:
 * - This hook gracefully handles JSON parsing errors.
 * - It ensures localStorage always stays in sync with React state.
 */
import { useState, useEffect } from "react";

export function useLocalStorage(key, initialValue = null) {
    // Initialize state from localStorage (with error handling)
    const [value, setValue] = useState(() => {
        try {
            const item = localStorage.getItem(key);

            // If nothing stored, use the initial value
            if (item === null) {
                return initialValue;
            }

            // Attempt to parse stored JSON
            return JSON.parse(item);
        }
        catch {
            // If parsing fails, fall back to initial value
            return initialValue;
        }
    });

    useEffect(() => {
        // If value is null, remove the key entirely
        if (value === null) {
            localStorage.removeItem(key);
        }
        else {
            // Otherwise, store the updated value
            localStorage.setItem(key, JSON.stringify(value));
        }

    }, [value, key]);

    // Return state and setter (same API as useState)
    return [value, setValue];
}