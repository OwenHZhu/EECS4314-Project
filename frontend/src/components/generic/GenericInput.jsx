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