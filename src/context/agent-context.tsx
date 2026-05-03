"use client";

import React, { createContext, useContext, useState } from "react";

interface AgentContextType {
    isOpen: boolean;
    toggle: () => void;
    open: () => void;
    close: () => void;
    width: number;
    setWidth: (width: number) => void;
}

const AgentContext = createContext<AgentContextType | undefined>(undefined);

export function AgentProvider({ children }: Readonly<{ children: React.ReactNode }>) {
    const [isOpen, setIsOpen] = useState(false);
    const [width, setWidth] = useState(400);

    const toggle = React.useCallback(() => setIsOpen(prev => !prev), []);
    const open = React.useCallback(() => setIsOpen(true), []);
    const close = React.useCallback(() => setIsOpen(false), []);

    const value = React.useMemo(() => ({
        isOpen, toggle, open, close, width, setWidth
    }), [isOpen, toggle, open, close, width]);

    return (
        <AgentContext.Provider value={value}>
            {children}
        </AgentContext.Provider>
    );
}

export function useAgent() {
    const context = useContext(AgentContext);
    if (context === undefined) {
        throw new Error("useAgent must be used within an AgentProvider");
    }
    return context;
}
