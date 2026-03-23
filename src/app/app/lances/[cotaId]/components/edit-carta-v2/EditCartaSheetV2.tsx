"use client";

import type { EditCartaSheetInitialData } from "./types";
import { CartaSheet } from "@/app/app/lances/components/carta-sheet/CartaSheet";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    data: EditCartaSheetInitialData;
    onSuccess?: () => void;
};

export function EditCartaSheetV2({
                                     open,
                                     onOpenChange,
                                     data,
                                     onSuccess,
                                 }: Props) {
    return (
        <CartaSheet
            open={open}
            onOpenChange={onOpenChange}
            mode="edit"
            data={data}
            onSuccess={() => onSuccess?.()}
        />
    );
}