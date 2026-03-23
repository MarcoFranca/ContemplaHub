type ContratoPdfUploadFieldProps = {
    cotaId?: string;
    contratoId?: string;
    initialFileName?: string | null;
    initialFileUrl?: string | null;
    disabled?: boolean;
    onUploaded?: (file: { fileName: string; fileUrl: string }) => void;
};