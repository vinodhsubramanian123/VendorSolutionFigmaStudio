import React, { TableHTMLAttributes } from "react";

export const Table: React.FC<TableHTMLAttributes<HTMLTableElement>> = ({
  className = "",
  children,
  ...props
}) => {
  return (
    <div className="overflow-x-auto w-full">
      <table className={`w-full text-left border-collapse ${className}`} {...props}>
        {children}
      </table>
    </div>
  );
};

export const TableHead: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  className = "",
  children,
  ...props
}) => {
  return (
    <thead className={`bg-black/40 border-b border-white/5 ${className}`} {...props}>
      {children}
    </thead>
  );
};

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  className = "",
  children,
  ...props
}) => {
  return (
    <tbody className={`divide-y divide-white/5 ${className}`} {...props}>
      {children}
    </tbody>
  );
};

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({
  className = "",
  children,
  ...props
}) => {
  return (
    <tr className={`hover:bg-white/5 transition-colors ${className}`} {...props}>
      {children}
    </tr>
  );
};

export const TableHeader: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({
  className = "",
  children,
  ...props
}) => {
  return (
    <th
      className={`px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-widest ${className}`}
      {...props}
    >
      {children}
    </th>
  );
};

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({
  className = "",
  children,
  ...props
}) => {
  return (
    <td className={`px-4 py-3 text-sm text-gray-300 font-sans ${className}`} {...props}>
      {children}
    </td>
  );
};
