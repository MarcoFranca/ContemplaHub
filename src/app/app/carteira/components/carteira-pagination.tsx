import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
    currentPage: number;
    pageCount: number;
    totalItems: number;
    pageSize: number;
    buildPageHref: (page: number) => string;
};

function getVisiblePages(currentPage: number, pageCount: number) {
    if (pageCount <= 5) {
        return Array.from({ length: pageCount }, (_, index) => index + 1);
    }

    const pages = new Set<number>([1, pageCount, currentPage - 1, currentPage, currentPage + 1]);
    return [...pages].filter((page) => page >= 1 && page <= pageCount).sort((a, b) => a - b);
}

export function CarteiraPagination({
    currentPage,
    pageCount,
    totalItems,
    pageSize,
    buildPageHref,
}: Props) {
    if (pageCount <= 1) return null;

    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(totalItems, currentPage * pageSize);
    const pages = getVisiblePages(currentPage, pageCount);

    return (
        <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-slate-400">
                Mostrando <span className="font-medium text-slate-200">{start}</span>-
                <span className="font-medium text-slate-200">{end}</span> de{" "}
                <span className="font-medium text-slate-200">{totalItems}</span>
            </p>

            <div className="flex items-center gap-1.5">
                {currentPage <= 1 ? (
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 rounded-lg border-white/10 bg-white/[0.03] px-2"
                        disabled
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                ) : (
                    <Link href={buildPageHref(currentPage - 1)}>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 rounded-lg border-white/10 bg-white/[0.03] px-2"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                )}

                {pages.map((page, index) => {
                    const prev = pages[index - 1];
                    const showGap = prev && page - prev > 1;

                    return (
                        <div key={page} className="flex items-center gap-1.5">
                            {showGap ? (
                                <span className="px-1 text-xs text-slate-500">...</span>
                            ) : null}

                            <Link href={buildPageHref(page)}>
                                <Button
                                    variant={page === currentPage ? "default" : "outline"}
                                    size="sm"
                                    className="h-8 min-w-8 rounded-lg border-white/10 px-2.5"
                                >
                                    {page}
                                </Button>
                            </Link>
                        </div>
                    );
                })}

                {currentPage >= pageCount ? (
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 rounded-lg border-white/10 bg-white/[0.03] px-2"
                        disabled
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                ) : (
                    <Link href={buildPageHref(currentPage + 1)}>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 rounded-lg border-white/10 bg-white/[0.03] px-2"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </Link>
                )}
            </div>
        </div>
    );
}
