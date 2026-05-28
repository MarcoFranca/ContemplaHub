"use client";

import * as React from "react";
import { createPortal } from "react-dom";

type Props = {
    children: React.ReactNode;
    targetId?: string;
};

export function HeaderActionsPortal({
    children,
    targetId = "app-header-actions-slot",
}: Props) {
    const [target, setTarget] = React.useState<HTMLElement | null>(null);

    React.useEffect(() => {
        setTarget(document.getElementById(targetId));
    }, [targetId]);

    if (!target) return null;
    return createPortal(children, target);
}
