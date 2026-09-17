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
import { ArrowUpDown, ArrowUp, ArrowDown, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/useMediaQuery";

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
  // Mobile card rendering:
  mobileCard,
}) => {
  const [internalPage, setInternalPage] = useState(1);
  const [sortConfig, setSortConfig] = useState(initialSort);
  const isMobile = useIsMobile();

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

  // Default mobile card derived from column priorities
  const renderDefaultCard = (row, idx) => {
    const visibleColumns = columns.filter((col) => col.priority !== "hidden-mobile");
    const primaryCol = visibleColumns.find((col) => col.priority === "primary") || visibleColumns[0];
    const secondaryCols = visibleColumns.filter((col) => col !== primaryCol);

    return (
      <div
        data-testid="data-table-mobile-card"
        className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm space-y-3"
      >
        {primaryCol && (
          <div className="flex items-center justify-between gap-2 border-b border-gray-100 dark:border-gray-800/60 pb-2">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              {primaryCol.header}
            </span>
            <div className="font-semibold text-sm text-gray-900 dark:text-gray-100">
              {primaryCol.cell
                ? primaryCol.cell(row, idx)
                : primaryCol.accessorKey
                ? row[primaryCol.accessorKey] ?? "—"
                : null}
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 text-xs">
          {secondaryCols.map((col, cIdx) => {
            const key = col.accessorKey || col.key || cIdx;
            return (
              <div key={key} className="flex flex-col gap-0.5">
                <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                  {col.header}
                </span>
                <div className="text-gray-900 dark:text-gray-200">
                  {col.cell
                    ? col.cell(row, idx)
                    : col.accessorKey
                    ? row[col.accessorKey] ?? "—"
                    : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // --- Mobile card view ---
  const renderMobileCards = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center gap-2 text-gray-500 py-12" data-testid="data-table-loading">
          <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
          <span className="text-xs">Loading data...</span>
        </div>
      );
    }
    if (paginatedData.length === 0) {
      return (
        <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-12" data-testid="data-table-empty">
          {emptyMessage}
        </div>
      );
    }
    return (
      <div className="space-y-3" data-testid="data-table-cards">
        {paginatedData.map((row, idx) => (
          <div key={row._id || row.id || idx}>
            {mobileCard ? mobileCard(row, idx) : renderDefaultCard(row, idx)}
          </div>
        ))}
      </div>
    );
  };

  // --- Pagination UI ---
  const renderPagination = () => {
    if (!(pageSize || manualPagination) || totalPages <= 1) return null;

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-2 text-xs text-gray-600 dark:text-gray-400">
        <div className="hidden sm:block">
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
            className="h-8 text-xs min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4 sm:hidden" />
            <span className="hidden sm:inline">Previous</span>
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
            className="h-8 text-xs min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4 sm:hidden" />
            <span className="hidden sm:inline">Next</span>
          </Button>
        </div>
      </div>
    );
  };

  // --- Desktop table view ---
  const renderDesktopTable = () => (
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
  );

  return (
    <div className={cn("w-full space-y-3", className)}>
      {isMobile ? renderMobileCards() : renderDesktopTable()}
      {renderPagination()}
    </div>
  );
};

export default DataTable;
