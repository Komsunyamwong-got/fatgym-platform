"use client";

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

interface DataTableProps<T> {
  columns: {
    header: string;
    accessorKey: keyof T;
    cell?: (item: T) => React.ReactNode;
  }[];
  data: T[];
  mobileRender: (item: T) => React.ReactNode;
  onRowClick?: (item: T) => void;
}

export function ResponsiveDataTable<T>({
  columns,
  data,
  mobileRender,
  onRowClick,
}: DataTableProps<T>) {
  return (
    <div className="w-full">
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
            {data.map((item, i) => (
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
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="sm:hidden space-y-4">
        {data.map((item, i) => (
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
    </div>
  );
}
