import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

const META_CELLS = ["name", "format", "storage", "rows", "columns"];

const COLUMNS = [
    { id: "index", w: "w-8" },
    { id: "col-a", w: "w-24" },
    { id: "col-b", w: "w-20" },
    { id: "col-c", w: "w-20" },
    { id: "col-d", w: "w-16" },
    { id: "col-e", w: "w-20" },
];

const ROWS = ["r1", "r2", "r3", "r4", "r5", "r6", "r7", "r8", "r9", "r10"];

function MetaStripSkeleton() {
    return (
        <div className="flex items-stretch gap-px bg-border border border-border flex-wrap">
            {META_CELLS.map((cell) => (
                <div key={cell} className="bg-background px-4 py-2.5 flex flex-col gap-2 flex-1 min-w-25">
                    <Skeleton className="h-2 w-14 rounded-none" />
                    <Skeleton className="h-3 w-20 rounded-none" />
                </div>
            ))}
        </div>
    );
}

export function PreviewTabSkeleton() {
    return (
        <div className="space-y-4">
            <MetaStripSkeleton />
            <Card className="rounded-none shadow-sm overflow-hidden">
                <CardContent className="p-0">
                    <ScrollArea className="w-full">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-muted/50 border-b">
                                    {COLUMNS.map(({ id, w }) => (
                                        <th key={id} className="px-4 py-2.5">
                                            <Skeleton className={`h-2.5 ${w} rounded-none`} />
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {ROWS.map((row) => (
                                    <tr key={row} className="border-b border-border/50">
                                        {COLUMNS.map(({ id, w }) => (
                                            <td key={id} className="px-4 py-2">
                                                <Skeleton className={`h-2.5 ${w} rounded-none`} />
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
}
