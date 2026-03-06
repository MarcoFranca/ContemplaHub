type EmptyStateProps = {
    message: string;
};

export function EmptyState({ message }: EmptyStateProps) {
    return (
        <p className="text-center text-muted-foreground col-span-full">
            {message}
        </p>
    );
}