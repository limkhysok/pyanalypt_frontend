import { Database } from "lucide-react";

export default function DatasetsNotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] gap-3">
            <Database className="h-8 w-8 text-muted-foreground/30" strokeWidth={1} />
            <p className="text-sm font-semibold text-muted-foreground">Dataset not found.</p>
        </div>
    );
}
