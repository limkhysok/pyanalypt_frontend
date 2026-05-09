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

export function DescribeTabSkeleton() {
    return (
        <div className="space-y-4">
            <MetaStripSkeleton />
            <Card className="rounded-none shadow-sm overflow-hidden">
                <CardHeader className="px-5 py-3 border-b">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-28 rounded-none" />
                        <Skeleton className="h-3.5 w-16 rounded-none" />
                    </div>
                </CardHeader>
                <div className="border-b px-5 py-2">
                    <Skeleton className="h-3.5 w-36 rounded-none" />
                </div>
                <CardContent className="p-0">
                    {/* Numeric section */}
                    <div className="px-5 py-2 bg-muted/30 border-b border-border/40">
                        <Skeleton className="h-3 w-16 rounded-none" />
                    </div>
                    <table className="border-collapse w-full">
                        <thead>
                            <tr className="bg-muted/20 border-b">
                                <th className="px-5 py-3 border-r border-border/40">
                                    <Skeleton className="h-3 w-8 rounded-none" />
                                </th>
                                {["c1", "c2", "c3", "c4"].map((c) => (
                                    <th key={c} className="px-5 py-3">
                                        <Skeleton className="h-3.5 w-20 rounded-none" />
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {["count", "mean", "std", "min", "25", "50", "75", "max"].map((row) => (
                                <tr key={row} className="border-b border-border/50">
                                    <td className="px-5 py-2.5 border-r border-border/40">
                                        <Skeleton className="h-3 w-10 rounded-none" />
                                    </td>
                                    {["c1", "c2", "c3", "c4"].map((c) => (
                                        <td key={c} className="px-5 py-2.5">
                                            <Skeleton className="h-3.5 w-14 rounded-none ml-auto" />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {/* Categorical section */}
                    <div className="px-5 py-2 bg-muted/30 border-b border-border/40 border-t">
                        <Skeleton className="h-3 w-32 rounded-none" />
                    </div>
                    <table className="border-collapse w-full">
                        <thead>
                            <tr className="bg-muted/20 border-b">
                                <th className="px-5 py-3 border-r border-border/40">
                                    <Skeleton className="h-3 w-8 rounded-none" />
                                </th>
                                {["c1", "c2"].map((c) => (
                                    <th key={c} className="px-5 py-3">
                                        <Skeleton className="h-3.5 w-20 rounded-none" />
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {["count", "unique", "top", "freq"].map((row) => (
                                <tr key={row} className="border-b border-border/50">
                                    <td className="px-5 py-2.5 border-r border-border/40">
                                        <Skeleton className="h-3 w-10 rounded-none" />
                                    </td>
                                    {["c1", "c2"].map((c) => (
                                        <td key={c} className="px-5 py-2.5">
                                            <Skeleton className="h-3.5 w-14 rounded-none ml-auto" />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    );
}
