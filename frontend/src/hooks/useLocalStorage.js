import { useEffect, useState } from "react";

export function useLocalStorage(key, initialValue = null) {
    const [value, setValue] = useState(() => {
        try {
            const item = localStorage.getItem(key);
            if (item === null) {
                return initialValue;
            }
            return JSON.parse(item);
        }
        catch {
            return initialValue;
        }

    });

    useEffect(() => {
        if (value === null) {
            localStorage.removeItem(key);
        }
        else {
            localStorage.setItem(key, JSON.stringify(value))
        }

    }, [value, key]);

    return [value, setValue];
}