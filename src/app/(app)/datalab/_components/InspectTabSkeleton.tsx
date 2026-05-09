import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function MetaStripSkeleton() {
    return (
        <div className="flex items-stretch gap-px bg-border border border-border flex-wrap">
            {["name", "format", "storage", "rows", "columns"].map((cell) => (
                <div key={cell} className="bg-background px-4 py-2.5 flex flex-col gap-2 flex-1 min-w-25">
                    <Skeleton className="h-3 w-16 rounded-none" />
                    <Skeleton className="h-3.5 w-24 rounded-none" />
                </div>
            ))}
        </div>
    );
}

export function InspectTabSkeleton() {
    return (
        <div className="space-y-4">
            <MetaStripSkeleton />
            <Card className="rounded-none shadow-sm overflow-hidden">
                <CardHeader className="px-5 py-3 border-b">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-20 rounded-none" />
                        <Skeleton className="h-3.5 w-28 rounded-none" />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-muted/50 border-b">
                                {(["column:w-28", "dtype:w-16", "non-null:w-14", "unique:w-14", "nulls:w-12", "null-pct:w-14"] as const).map((col) => {
                                    const [key, w] = col.split(":");
                                    const right = ["non-null", "unique", "nulls", "null-pct"].includes(key);
                                    return (
                                        <th key={key} className="px-5 py-2.5">
                                            <Skeleton className={`h-3 ${w} rounded-none ${right ? "ml-auto" : ""}`} />
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {["r1", "r2", "r3", "r4", "r5", "r6", "r7", "r8"].map((row) => (
                                <tr key={row} className="border-b border-border/50">
                                    <td className="px-5 py-3">
                                        <Skeleton className="h-3.5 w-32 rounded-none" />
                                    </td>
                                    <td className="px-5 py-2">
                                        <Skeleton className="h-6 w-16 rounded-none" />
                                    </td>
                                    <td className="px-5 py-3">
                                        <Skeleton className="h-3.5 w-12 rounded-none ml-auto" />
                                    </td>
                                    <td className="px-5 py-3">
                                        <Skeleton className="h-3.5 w-12 rounded-none ml-auto" />
                                    </td>
                                    <td className="px-5 py-3">
                                        <Skeleton className="h-3.5 w-10 rounded-none ml-auto" />
                                    </td>
                                    <td className="px-5 py-3">
                                        <Skeleton className="h-3.5 w-12 rounded-none ml-auto" />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    );
}
