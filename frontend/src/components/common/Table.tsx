import React from 'react';
import { cn } from '../../utils/helpers';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export interface Column<T> {
  key: string;
  header?: string | React.ReactNode;
  label?: string | React.ReactNode;
  render?: (value: unknown, item: T, index: number) => React.ReactNode;
  className?: string;
  sortable?: boolean;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string | number;
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  selectedRow?: string | number | null;
  striped?: boolean;
  hoverable?: boolean;
  compact?: boolean;
}

function Table<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  emptyMessage = 'No data available',
  onRowClick,
  selectedRow,
  striped = true,
  hoverable = true,
  compact = false,
}: TableProps<T>) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-secondary-200 overflow-hidden">
        <div className="animate-pulse">
          <div className="h-12 bg-secondary-100 border-b border-secondary-200" />
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-14 border-b border-secondary-100 flex items-center px-6 gap-4"
            >
              <div className="h-4 bg-secondary-200 rounded w-1/4" />
              <div className="h-4 bg-secondary-200 rounded w-1/3" />
              <div className="h-4 bg-secondary-200 rounded w-1/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Helper to get header text (support both header and label)
  const getHeaderText = (column: Column<T>) => column.header ?? column.label ?? '';

  return (
    <div className="bg-white rounded-xl border border-secondary-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-secondary-50 border-b border-secondary-200">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    'text-left text-xs font-semibold text-secondary-600 uppercase tracking-wider',
                    compact ? 'px-4 py-3' : 'px-6 py-4',
                    column.className
                  )}
                >
                  {getHeaderText(column)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary-100">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-12 text-center text-secondary-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item, index) => {
                const key = keyExtractor(item);
                const isSelected = selectedRow === key;

                return (
                  <tr
                    key={key}
                    onClick={() => onRowClick?.(item)}
                    className={cn(
                      'transition-colors duration-150',
                      striped && index % 2 === 1 && 'bg-secondary-50/50',
                      hoverable && onRowClick && 'cursor-pointer hover:bg-primary-50',
                      isSelected && 'bg-primary-100'
                    )}
                  >
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={cn(
                          'text-sm text-secondary-900',
                          compact ? 'px-4 py-3' : 'px-6 py-4',
                          column.className
                        )}
                      >
                        {column.render
                          ? column.render((item as Record<string, unknown>)[column.key], item, index)
                          : (item as Record<string, unknown>)[column.key] as React.ReactNode}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Pagination Component
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage = 10,
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems || 0);

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-secondary-200 rounded-b-xl">
      <div className="text-sm text-secondary-600">
        {totalItems ? (
          <>
            Showing <span className="font-medium">{startItem}</span> to{' '}
            <span className="font-medium">{endItem}</span> of{' '}
            <span className="font-medium">{totalItems}</span> results
          </>
        ) : (
          'No results'
        )}
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg text-secondary-600 hover:bg-secondary-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg text-secondary-600 hover:bg-secondary-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-1 px-2">
          {[...Array(Math.min(5, totalPages))].map((_, i) => {
            let pageNum: number;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }

            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={cn(
                  'min-w-[36px] h-9 rounded-lg text-sm font-medium transition-colors',
                  currentPage === pageNum
                    ? 'bg-primary-600 text-white'
                    : 'text-secondary-600 hover:bg-secondary-100'
                )}
              >
                {pageNum}
              </button>
            );
          })}
        </div>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg text-secondary-600 hover:bg-secondary-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg text-secondary-600 hover:bg-secondary-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronsRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Table;
