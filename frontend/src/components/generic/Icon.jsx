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
                text - 2xl md: text - 3xl \
                [font - variation - settings: 'opsz'_20] \
                sm: [font - variation - settings: 'opsz'_24] \
                md: [font - variation - settings: 'opsz'_32] \
                lg: [font - variation - settings: 'opsz'_40] \
                ", className)

            }
        >
            {children}
        </span>
    )
}