import React from "react";

interface StatTableProps {
  id: string;
  title: string;
  // header, cells
  rows: Record<string, Array<any>>;
  autoRefresh: number;
}

export const StatTable: React.FC<StatTableProps> = ({
  title,
  rows,
  id,
  autoRefresh,
}) => {
  return (
    <div>
      <h2>{title}</h2>
      <table>
        <colgroup>
          {Object.keys(rows).map((_r, i) => (
            <col key={`${id}-col-${i}`} />
          ))}
        </colgroup>
        <thead>
          <tr>
            <th colSpan={Object.keys(rows).length}>
              Stats auto refresh every {autoRefresh} seconds
            </th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(rows).map((r, i) => (
            <tr key={`${id}-row-${i}`}>
              <th>{r}</th>
              {rows[r].map((d, i) => (
                <td key={`${id}-cell-${i}`}>{d}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
