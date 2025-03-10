import { useMemo } from "react";
import { useReactTable, getCoreRowModel } from "@tanstack/react-table";

const statusColors = {
  hadir: "bg-green-200",
  terlambat: "bg-yellow-200",
  izin: "bg-blue-200",
  sakit: "bg-purple-200",
  absen: "bg-red-200",
  empty: "bg-gray-100",
};

const AttendanceHistoryTable = ({
  attendanceData,
  users,
  days,
  filterType,
}) => {
  console.log("Users in Table:", users);
  console.log("Attendance Data:", attendanceData);
  console.log("Days Range:", days);

  const mergedData = useMemo(() => {
    const attendanceMap = new Map();

    attendanceData.forEach((record) => {
      if (!record.user) {
        console.warn("Missing user data in record:", record);
        return;
      }

      if (!attendanceMap.has(record.user.id)) {
        attendanceMap.set(record.user.id, {
          ...record.user,
          attendance: {},
        });
      }

      const existing = attendanceMap.get(record.user.id);
      const formattedDate = record.date; // Ensure date is correctly formatted from backend
      existing.attendance[formattedDate] = record.status || "-";
    });

    return users
      .map((user) => ({
        id: user.id,
        name: user.name,
        nip: user.nip,
        attendance: attendanceMap.get(user.id)?.attendance || {},
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [attendanceData, users]);

  const statusTypes = ["hadir", "izin", "sakit", "absen"];

const columns = useMemo(() => {
  let baseColumns = [
    { accessorKey: "name", header: "Employee Name" },
    { accessorKey: "nip", header: "NIP" },
  ];

  if (filterType === "daily") {
    baseColumns.push({
      accessorKey: "attendance",
      header: "Status",
      cell: ({ row }) => {
        const status = Object.values(row.original.attendance)[0] || "-";
        return (
          <div
            className={`px-2 py-1 text-xs rounded ${
              statusColors[status] || "bg-gray-100"
            }`}
          >
            {status.charAt(0).toUpperCase()}
          </div>
        );
      },
    });
  } else {
    baseColumns.push(
      ...days.map((day, index) => ({
        accessorKey: day.toISOString().split("T")[0], // YYYY-MM-DD
        header: (
          <span
            className={`font-bold ${
              index === 5 || index === 6
                ? "text-red-500"
                : index === 4
                ? "text-green-500"
                : "text-gray-700"
            }`}
          >
            {day.toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "short",
            })}
          </span>
        ),
        cell: ({ row }) => {
          const status =
            row.original.attendance[day.toISOString().split("T")[0]] || "-";

          return (
            <div className="flex flex-wrap justify-center gap-1">
              {status.split(",").map((s, i) => (
                <div
                  key={i}
                  className={`px-2 py-1 text-xs rounded ${
                    statusColors[s.trim()] || "bg-gray-100"
                  }`}
                >
                  {s.trim().charAt(0).toUpperCase()}
                </div>
              ))}
            </div>
          );
        },
      }))
    );

    // **Separate Summary Columns for Each Status**
    statusTypes.forEach((status) => {
      baseColumns.push({
        accessorKey: `summary_${status}`,
        header: status.charAt(0).toUpperCase(),
        cell: ({ row }) => {
          let count = 0;

          // Count occurrences of this status
          Object.values(row.original.attendance).forEach((s) => {
            s.split(",").forEach((item) => {
              if (item.trim() === status) {
                count++;
              }
            });
          });

          return (
            <div
              className={`px-2 py-1 text-xs rounded ${
                statusColors[status] || "bg-gray-100"
              }`}
            >
              {count}
            </div>
          );
        },
      });
    });
  }

  return baseColumns;
}, [days, filterType]);


  const table = useReactTable({
    data: mergedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="w-full overflow-auto">
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="border p-2">
                  {header.column.columnDef.header}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="border p-2">
                  {cell.column.columnDef.cell
                    ? cell.column.columnDef.cell(cell.getContext())
                    : cell.getValue()}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AttendanceHistoryTable;
