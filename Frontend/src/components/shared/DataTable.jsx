import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ArrowUp, ArrowDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const DataTable = ({
  columns = [],
  data = [],
  caption,
  isLoading = false,
  emptyMessage = "No records found.",
  pageSize = null,
  // Controlled pagination props:
  manualPagination = false,
  page: controlledPage = 1,
  totalPages: controlledTotalPages = 1,
  totalCount: controlledTotalCount = null,
  onPageChange,
  // Sorting props:
  initialSort = { key: null, direction: null },
  onSortChange,
  className = "",
  tableClassName = "",
}) => {
  const [internalPage, setInternalPage] = useState(1);
  const [sortConfig, setSortConfig] = useState(initialSort);

  const isControlledPage = manualPagination && onPageChange !== undefined;
  const currentPage = isControlledPage ? controlledPage : internalPage;

  const handleSort = (key) => {
    if (!key) return;
    let newDirection = "asc";
    if (sortConfig.key === key) {
      if (sortConfig.direction === "asc") newDirection = "desc";
      else if (sortConfig.direction === "desc") newDirection = null;
    }

    const nextSort = { key: newDirection ? key : null, direction: newDirection };
    setSortConfig(nextSort);
    if (onSortChange) {
      onSortChange(nextSort.key, nextSort.direction);
    }
  };

  // Client-side sorting when not manually handled
  const sortedData = useMemo(() => {
    if (onSortChange || !sortConfig.key || !sortConfig.direction) {
      return data;
    }
    const { key, direction } = sortConfig;
    return [...data].sort((a, b) => {
      let aVal = a[key];
      let bVal = b[key];

      if (typeof aVal === "string") aVal = aVal.toLowerCase();
      if (typeof bVal === "string") bVal = bVal.toLowerCase();

      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (direction === "asc") {
        return aVal < bVal ? -1 : 1;
      } else {
        return aVal > bVal ? -1 : 1;
      }
    });
  }, [data, sortConfig, onSortChange]);

  // Client-side pagination if pageSize is passed and not manually paginated
  const totalItems = manualPagination && controlledTotalCount !== null ? controlledTotalCount : sortedData.length;
  const totalPages = manualPagination
    ? controlledTotalPages
    : pageSize
    ? Math.max(1, Math.ceil(sortedData.length / pageSize))
    : 1;

  const paginatedData = useMemo(() => {
    if (manualPagination || !pageSize) {
      return sortedData;
    }
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, manualPagination, pageSize, currentPage]);

  const handlePageClick = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    if (isControlledPage) {
      onPageChange(newPage);
    } else {
      setInternalPage(newPage);
    }
  };

  return (
    <div className={cn("w-full space-y-3", className)}>
      <div className="w-full overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <Table className={tableClassName}>
          {caption && <TableCaption>{caption}</TableCaption>}
          <TableHeader>
            <TableRow>
              {columns.map((col, idx) => {
                const key = col.accessorKey || col.key || idx;
                const isSortable = !!col.sortable && !!col.accessorKey;
                const isSorted = sortConfig.key === col.accessorKey;
                const sortDir = isSorted ? sortConfig.direction : null;

                return (
                  <TableHead key={key} className={cn("whitespace-nowrap", col.headerClassName)}>
                    {isSortable ? (
                      <button
                        type="button"
                        onClick={() => handleSort(col.accessorKey)}
                        className="flex items-center gap-1 font-semibold text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white"
                      >
                        <span>{col.header}</span>
                        {sortDir === "asc" ? (
                          <ArrowUp className="w-3.5 h-3.5 text-purple-600" />
                        ) : sortDir === "desc" ? (
                          <ArrowDown className="w-3.5 h-3.5 text-purple-600" />
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 opacity-60" />
                        )}
                      </button>
                    ) : (
                      col.header
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-gray-500">
                    <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                    <span className="text-xs">Loading data...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : paginatedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-sm text-gray-500 dark:text-gray-400 py-8"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, rowIdx) => (
                <TableRow key={row._id || row.id || rowIdx}>
                  {columns.map((col, colIdx) => {
                    const key = col.accessorKey || col.key || colIdx;
                    return (
                      <TableCell key={key} className={col.className}>
                        {col.cell
                          ? col.cell(row, rowIdx)
                          : col.accessorKey
                          ? row[col.accessorKey] ?? "—"
                          : null}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {(pageSize || manualPagination) && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-2 text-xs text-gray-600 dark:text-gray-400">
          <div>
            Showing{" "}
            <span className="font-semibold text-gray-900 dark:text-gray-200">
              {totalItems === 0 ? 0 : (currentPage - 1) * (pageSize || 10) + 1}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-gray-900 dark:text-gray-200">
              {Math.min(currentPage * (pageSize || 10), totalItems)}
            </span>{" "}
            of <span className="font-semibold text-gray-900 dark:text-gray-200">{totalItems}</span> entries
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={currentPage <= 1 || isLoading}
              onClick={() => handlePageClick(currentPage - 1)}
              className="h-8 text-xs"
            >
              Previous
            </Button>
            <span className="text-xs">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages || isLoading}
              onClick={() => handlePageClick(currentPage + 1)}
              className="h-8 text-xs"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
