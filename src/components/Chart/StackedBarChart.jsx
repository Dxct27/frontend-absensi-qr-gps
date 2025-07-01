import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const StackedBarChart = ({ data }) => {
  const chartWidth = Math.max(data.length * 100, 500);
  return (
    <ResponsiveContainer width={chartWidth} height={300}>
      <BarChart
        data={data}
        width={chartWidth}
        height={300}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Legend align="left"/>
        <Bar dataKey="hadir" stackId="a" fill="#4ade80" />
        <Bar dataKey="izin" stackId="a" fill="#c084fc" />
        {/* <Bar dataKey="izin" stackId="a" fill="#facc15" /> */}
        {/* <Bar dataKey="sakit" stackId="a" fill="#a3a3a3x" /> */}
        <Bar dataKey="sakit" stackId="a" fill="#facc15" />
        <Bar dataKey="alpha" stackId="a" fill="#f87171" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default StackedBarChart;
