import { FlaskConical } from "lucide-react";

export default function DataLabNotFound() {
    return (
        <div className="flex flex-col items-center justify-center py-32 gap-3">
            <FlaskConical className="h-8 w-8 text-muted-foreground/30" strokeWidth={1} />
            <p className="text-sm font-semibold text-muted-foreground">Dataset not found.</p>
        </div>
    );
}
