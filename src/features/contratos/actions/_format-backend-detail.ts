export function formatBackendDetail(
    detail: unknown,
    fallback: string,
) {
    if (typeof detail === "string" && detail.trim()) {
        return detail;
    }

    if (Array.isArray(detail) && detail.length) {
        return (
            detail
                .map((item) => {
                    if (!item || typeof item !== "object") return null;

                    const message =
                        "msg" in item && typeof item.msg === "string"
                            ? item.msg
                            : null;

                    const location =
                        "loc" in item && Array.isArray(item.loc)
                            ? (item.loc as unknown[])
                                .filter(
                                    (part): part is string | number =>
                                        typeof part === "string" || typeof part === "number",
                                )
                                .join(".")
                            : null;

                    if (message && location) {
                        return `${location}: ${message}`;
                    }

                    return message;
                })
                .filter((value): value is string => Boolean(value))
                .join(" | ") || fallback
        );
    }

    return fallback;
}