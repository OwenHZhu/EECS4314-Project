/**
 * Icon.jsx
 *
 * Renders a Google Material Symbol (Material Symbols Outlined) with responsive
 * optical size settings. Accepts any icon name as children.
 *
 * Props:
 * @param {string} children - The Material Symbol name to render (e.g., "account_circle").
 * @param {string} [className] - Optional additional CSS classes for styling.
 * @param {...any} props - Additional props forwarded to the <span> element.
 *
 * Dependencies:
 * - cn: Utility for merging class names.
 *
 * Notes:
 * - Uses Google Material Symbols Outlined font.
 * - Optical size (opsz) adjusts automatically based on screen size.
 */

import { cn } from "../../utils/utils"

export default function Icon({
    children,
    className = "",
    ...props
}) {
    return (
        <span
            {...props}
            className={cn(
                "material-symbols-outlined cursor-pointer \
                [font-variation-settings:'opsz'_20] \
                sm:[font-variation-settings:'opsz'_24] \
                md:[font-variation-settings:'opsz'_32] \
                lg:[font-variation-settings:'opsz'_40]",
                className
            )}
        >
            {children}
        </span>
    )
}