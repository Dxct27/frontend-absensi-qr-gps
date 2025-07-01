import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const SimpleLineChart = ({ data }) => {
  const chartWidth = Math.max(data.length * 100, 500);
    return(
        <ResponsiveContainer width={chartWidth} height={300}>
        <LineChart
          width={chartWidth}
          height={300}
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          {/* <Legend /> */}
          <Line type="monotone" dataKey="hadir" stroke="#16a34a" activeDot={{ r: 6 }} />
          <Line type="monotone" dataKey="uv" stroke="#82ca9d" />
        </LineChart>
      </ResponsiveContainer>
    );
}

export default SimpleLineChart;