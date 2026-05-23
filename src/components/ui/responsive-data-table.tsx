"use client";

import { useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DataTableProps<T> {
  columns: {
    header: string;
    accessorKey: keyof T;
    cell?: (item: T) => React.ReactNode;
  }[];
  data: T[];
  mobileRender: (item: T) => React.ReactNode;
  onRowClick?: (item: T) => void;
  itemsPerPage?: number;
}

export function ResponsiveDataTable<T>({
  columns,
  data,
  mobileRender,
  onRowClick,
  itemsPerPage = 10,
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(data.length / itemsPerPage));
  
  if (currentPage > totalPages) {
    setCurrentPage(totalPages);
  }

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = data.slice(startIndex, startIndex + itemsPerPage);
  const emptyRowsCount = itemsPerPage - paginatedData.length;

  return (
    <div className="w-full space-y-4">
      {/* Desktop/Tablet Table */}
      <div className="hidden sm:block overflow-hidden rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              {columns.map((column, i) => (
                <TableHead key={i} className="font-bold text-foreground">
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((item, i) => (
              <TableRow
                key={i}
                className={cn(
                  "cursor-pointer hover:bg-muted/30 transition-colors",
                  onRowClick && "active:bg-muted"
                )}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((column, j) => (
                  <TableCell key={j}>
                    {column.cell ? column.cell(item) : (item[column.accessorKey] as React.ReactNode)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
            {emptyRowsCount > 0 && data.length > 0 && Array.from({ length: emptyRowsCount }).map((_, i) => {
              const referenceItem = data[0];
              return (
                <TableRow 
                  key={`empty-${i}`} 
                  className="hover:bg-transparent border-transparent opacity-0 pointer-events-none"
                  aria-hidden="true"
                >
                  {columns.map((column, j) => (
                    <TableCell key={j}>
                      {column.cell ? column.cell(referenceItem) : (referenceItem[column.accessorKey] as React.ReactNode)}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="sm:hidden space-y-4">
        {paginatedData.map((item, i) => (
          <Card 
            key={i} 
            className="overflow-hidden border-none shadow-sm active:scale-[0.98] transition-transform"
            onClick={() => onRowClick?.(item)}
          >
            <CardContent className="p-0">
              {mobileRender(item)}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between px-2 py-4 gap-4">
          <p className="text-sm text-muted-foreground text-center sm:text-left">
            Showing <span className="font-medium text-foreground">{data.length === 0 ? 0 : startIndex + 1}</span> to <span className="font-medium text-foreground">{Math.min(startIndex + itemsPerPage, data.length)}</span> of <span className="font-medium text-foreground">{data.length}</span> entries
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-8"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Prev
            </Button>
            <div className="text-sm font-medium px-4 py-1.5 bg-muted rounded-md border">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="h-8"
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
