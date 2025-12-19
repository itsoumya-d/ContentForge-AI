"use client";

import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "./theme-provider";

interface ProvidersProps {
    children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
        >
            {children}
            <Toaster position="bottom-right" richColors />
        </ThemeProvider>
    );
}
