import { ReactNode } from "react";

interface Column {
  key: string;
  label: string;
  mobileLabel?: string;
  render: (item: any) => ReactNode;
}

interface ResponsiveTableProps {
  columns: Column[];
  data: any[];
  mobileCardRender: (item: any) => ReactNode;
}

export function ResponsiveTable({ columns, data, mobileCardRender }: ResponsiveTableProps) {
  return (
    <>
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#F8FAFC] border-b border-[#E5E7EB]">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {data.map((item, index) => (
              <tr key={item.id || index} className="hover:bg-[#F8FAFC] transition-colors">
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                    {column.render(item)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden divide-y divide-[#E5E7EB]">
        {data.map((item, index) => (
          <div key={item.id || index}>
            {mobileCardRender(item)}
          </div>
        ))}
      </div>
    </>
  );
}
