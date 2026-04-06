import { useState, useEffect } from "react";

export function useSidebar() {
    // Start with a nullish state to handle SSR gracefully
    const [collapsed, setCollapsed] = useState<boolean>(false);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        // Load initial state from localStorage or window width
        const stored = localStorage.getItem("sidebar_collapsed");
        if (stored === null) {
            // Default if nothing stored
            const initialCollapsed = window.innerWidth < 1024;
            setCollapsed(initialCollapsed);
            localStorage.setItem("sidebar_collapsed", String(initialCollapsed));
        } else {
            setCollapsed(stored === "true");
        }
        setIsInitialized(true);

        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setCollapsed(true);
            }
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const toggleSidebar = () => {
        setCollapsed((prev) => {
            const newState = !prev;
            localStorage.setItem("sidebar_collapsed", String(newState));
            return newState;
        });
    };

    return { collapsed, toggleSidebar, isInitialized };
}
