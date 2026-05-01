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
import { getSortLabel, getFilterLabel } from "../_lib";

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
            <div className="relative w-full sm:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                <Input
                    placeholder="search datasets..."
                    className="pl-10 rounded-none h-8 border-border bg-background hover:bg-muted transition-colors text-xs font-medium placeholder:text-muted-foreground/40 shadow-none"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>

            {/* Sort, filter, count */}
            <div className="flex flex-wrap items-center gap-2.5">
                {showCount && (
                    <span className="text-xs font-semibold text-muted-foreground hidden sm:block mr-3 lowercase italic opacity-60">
                        {countLabel}
                    </span>
                )}

                {/* Sort */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            className="rounded-none h-8 px-4 border-border bg-background hover:bg-muted font-bold text-xs transition-all shadow-none lowercase"
                        >
                            <ArrowUpDown className="mr-2.5 h-4 w-4" />
                            {getSortLabel(sortBy)}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-none border-border shadow-none min-w-45 p-1.5">
                        <DropdownMenuRadioGroup value={sortBy} onValueChange={onSortChange}>
                            <DropdownMenuRadioItem className="rounded-none text-xs font-semibold h-8 lowercase" value="newest">newest first</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem className="rounded-none text-xs font-semibold h-8 lowercase" value="oldest">oldest first</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem className="rounded-none text-xs font-semibold h-8 lowercase" value="name_asc">name (a–z)</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem className="rounded-none text-xs font-semibold h-8 lowercase" value="name_desc">name (z–a)</DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Filter */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            className="rounded-none h-8 px-4 border-border bg-background hover:bg-muted font-bold text-xs transition-all shadow-none lowercase"
                        >
                            <Filter className="mr-2.5 h-4 w-4" />
                            {getFilterLabel(filterType)}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-none border-border shadow-none min-w-455">
                        <DropdownMenuRadioGroup value={filterType} onValueChange={onFilterChange}>
                            <DropdownMenuRadioItem className="rounded-none text-xs font-semibold h-8 lowercase" value="all">all formats</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem className="rounded-none text-xs font-semibold h-8 lowercase" value="csv">csv</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem className="rounded-none text-xs font-semibold h-8 lowercase" value="json">json</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem className="rounded-none text-xs font-semibold h-8 lowercase" value="xlsx">xlsx</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem className="rounded-none text-xs font-semibold h-8 lowercase" value="parquet">parquet</DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </motion.div>
    );
}
