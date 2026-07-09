/**
 * ./components/generic/GenericButton.jsx
 *
 * A reusable button component used throughout the application. It provides
 * consistent styling via predefined variants, while still allowing
 * custom Tailwind classes to be merged in through `className`.
 *
 * Props:
 * @param {ReactNode} children
 *   The content displayed inside the button (text, icons, etc.).
 *
 * @param {string} variant
 *   Determines the visual style of the button. Must match one of the keys
 *   in the `variants` object (e.g., "primary", "secondary", "ghost", "spoilers", "questions", "theories").
 *   Defaults to "primary".
 * *
 * @param {string} className
 *   Optional TailwindCSS classes that are merged with the default variant
 *   and size styles. Useful for responsive overrides or page-specific styling.
 *
 * @param {object} props
 *   Any additional props (e.g., onClick, disabled, type) are passed directly
 *   to the underlying <button> element.
 *
 * Behavior:
 * - Styling is composed from:
 *     1. Base button classes
 *     2. The selected variant
 *     3. Any custom classes passed via `className`
 * - All classes are merged using `cn()`, ensuring Tailwind conflicts resolve
 *   predictably (e.g., responsive overrides).
 */

import { cn } from "../../utils/utils";

const variants = {
    primary: "bg-generic-button-primary-fill hover:bg-generic-button-primary-fill-hover",

    secondary: "bg-generic-button-secondary-fill hover:bg-generic-button-secondary-fill-hover",

    ghost: "bg-transparent border-2 border-generic-button-ghost-border hover:border-generic-button-ghost-border-hover hover:bg-generic-button-ghost-fill-hover",

    spoilers: "bg-generic-button-spoilers-fill border border-generic-button-spoilers-border text-generic-button-spoilers-text \
    hover:bg-generic-button-spoilers-fill/70 hover:border-generic-button-spoilers-border/70 hover:text-generic-button-spoilers-text/70",

    questions: "bg-generic-button-questions-fill border border-generic-button-questions-border text-generic-button-questions-text \
    hover:bg-generic-button-questions-fill/70 hover:border-generic-button-questions-border/70 hover:text-generic-button-questions-text/70",

    theories: "bg-generic-button-theories-fill border border-generic-button-theories-border text-generic-button-theories-text \
    hover:bg-generic-button-theories-fill/70 hover:border-generic-button-theories-border/70 hover:text-generic-button-theories-text/70"
};

export default function GenericButton({
    children,
    variant = "primary",
    className = "",
    ...props
}) {
    return (
        <button
            {...props}
            className={cn(
                "text-generic-button-text hover:text-generic-button-text-hover text-xs rounded-full font-medium transition-colors",
                variants[variant],
                className
            )}
        >
            {children}
        </button>
    );
}