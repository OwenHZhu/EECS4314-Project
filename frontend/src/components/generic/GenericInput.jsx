/**
 * ./components/generic/GenericInput.jsx
 *
 * A reusable input component that provides consistent styling across
 * user‑input areas in the application.
 *
 * Ensures visual consistency while still allowing page‑specific
 * overrides through the `className` prop.
 *
 * Props:
 * @param {string} variant
 *   Determines the visual style of the input. Must match one of the keys
 *   in the `variants` object (e.g., "auth"). Defaults to "auth".
 *
 * @param {string} className
 *   Optional TailwindCSS classes merged with the default variant styling
 *   using `cn()`. Useful for adjusting spacing, width, or responsive
 *   behaviour.
 *
 * @param {object} props
 *   Additional props (e.g., type, placeholder, value, onChange) are
 *   passed directly to the underlying <input> element. 
 *
 * Behaviour:
 * - Applies consistent base styling for background, text, placeholder,
 *   rounding, and focus states using the selected variant.
 * - Allows responsive or contextual overrides through `className`,
 *   enabling pages like Login and Register to adjust padding or layout
 *   without duplicating core input styles.
 */
import { cn } from "../../utils/utils";

const variants = {
    auth: "rounded-lg bg-input-bg text-input placeholder-input-placeholder focus:ring-2 focus:ring-input-border focus:outline-none text-xs sm:text-sm"
}

export default function GenericInput({
    variant = "auth",
    className = "",
    ...props
}) {
    return (
        <input
            {...props}
            className={cn(
                "transition-colors",
                variants[variant],
                className
            )}
        />
    );
}