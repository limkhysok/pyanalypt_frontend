"use client";

import { Search, ArrowUpDown, Filter } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getSortLabel, getFilterLabel } from "./_lib";

interface DatasetControlsProps {
    searchQuery: string;
    onSearchChange: (value: string) => void;
    sortBy: string;
    onSortChange: (value: string) => void;
    filterType: string;
    onFilterChange: (value: string) => void;
    countLabel: string;
    showCount: boolean;
}

export function DatasetControls({
    searchQuery,
    onSearchChange,
    sortBy,
    onSortChange,
    filterType,
    onFilterChange,
    countLabel,
    showCount,
}: Readonly<DatasetControlsProps>) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.12 }}
            className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between"
        >
            {/* Search */}
            <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                    placeholder="Search datasets..."
                    className="pl-8 rounded-sm h-8 border-border/30 bg-background/60 hover:bg-secondary/30 transition-colors text-sm"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>

            {/* Sort, filter, count */}
            <div className="flex flex-wrap items-center gap-2">
                {showCount && (
                    <span className="text-[11px] font-medium text-muted-foreground hidden sm:block">
                        {countLabel}
                    </span>
                )}

                {/* Sort */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            className="rounded-sm h-8 px-3 border-border/30 bg-background/60 hover:bg-secondary/50 font-medium text-sm transition-all"
                        >
                            <ArrowUpDown className="mr-1.5 h-3.5 w-3.5" />
                            {getSortLabel(sortBy)}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-md">
                        <DropdownMenuRadioGroup value={sortBy} onValueChange={onSortChange}>
                            <DropdownMenuRadioItem value="newest">Newest first</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="oldest">Oldest first</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="name_asc">Name (a–z)</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="name_desc">Name (z–a)</DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Filter */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            className="rounded-sm h-8 px-3 border-border/30 bg-background/60 hover:bg-secondary/50 font-medium text-sm transition-all"
                        >
                            <Filter className="mr-1.5 h-3.5 w-3.5" />
                            {getFilterLabel(filterType)}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-md">
                        <DropdownMenuRadioGroup value={filterType} onValueChange={onFilterChange}>
                            <DropdownMenuRadioItem value="all">All formats</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="csv">CSV</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="json">JSON</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="xlsx">XLSX</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="parquet">Parquet</DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </motion.div>
    );
}
