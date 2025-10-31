// src/components/icons/BrandIcons.tsx
"use client";
import * as React from "react";
import { cn } from "@/lib/utils"; // se você tiver um util de classnames; senão remova o cn e use className direto

export function IconGoogle({ className }: { className?: string }) {
    // Google "G" colorido — proporção e paths oficiais simplificados
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={cn("h-4 w-4", className)}>
            <path d="M21.35 11.1H12v2.9h5.3c-.23 1.5-1.78 4.4-5.3 4.4a5.9 5.9 0 1 1 0-11.8 5.3 5.3 0 0 1 3.75 1.47l2-1.94A8.2 8.2 0 1 0 12 20.2c4.72 0 8.1-3.32 8.1-8 0-.54-.06-1.02-.15-1.1Z" fill="#4285F4"/>
            <path d="M3.53 7.7l2.38 1.75A5.9 5.9 0 0 1 12 6.6c1.62 0 2.98.56 4.06 1.47l2.02-1.96A8.2 8.2 0 0 0 12 3.8c-3.3 0-6.12 1.87-7.46 3.9Z" fill="#34A853"/>
            <path d="M12 21.2c3.4 0 6.25-2.24 7.22-5.39l-2.88-1.45c-.55 1.66-2.02 3.05-4.34 3.05a5.9 5.9 0 0 1-5.59-4.08l-2.4 1.84A8.2 8.2 0 0 0 12 21.2Z" fill="#FBBC05"/>
            <path d="M20.76 12.04c0-.4-.04-.79-.11-1.15H12v2.9h4.98c-.23 1.13-.92 2.1-1.94 2.77l2.88 1.45c1.68-1.56 2.84-3.86 2.84-5.97Z" fill="#EA4335"/>
        </svg>
    );
}

export function IconFacebook({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" aria-hidden className={cn("h-4 w-4", className)}>
            <path fill="#1877F2" d="M22 12A10 10 0 1 0 10.9 21.9V14.9H8.2V12h2.7V9.8c0-2.7 1.6-4.2 4-4.2 1.2 0 2.4.2 2.4.2v2.6h-1.4c-1.3 0-1.7.8-1.7 1.6V12h3l-.5 2.9h-2.5v7A10 10 0 0 0 22 12Z"/>
            <path fill="#fff" d="M15.5 14.9 16 12h-3v-1.9c0-.8.4-1.6 1.7-1.6H16V6c0 0-1.2-.2-2.4-.2-2.4 0-4 1.5-4 4.2V12H7v2.9h2.7v7c.9.1 1.7.1 2.6 0v-7h2.2Z"/>
        </svg>
    );
}
