import { RiBarChartBoxLine, RiUserLine, RiMoneyDollarCircleLine, RiPieChartLine } from 'react-icons/ri';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function Analytics() {
  // Dummy data for statistics
  const stats = {
    totalSales: "₱24.5M",
    clientsAcquired: 48,
    conversionRate: "68%",
    avgDealTime: "45 days"
  };

  // Dummy data for monthly performance chart
  const monthlyData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Sales (in millions ₱)',
        data: [3.2, 4.8, 3.9, 4.5, 5.2, 2.9],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  // Dummy data for conversion funnel
  const conversionData = {
    labels: ['Leads', 'Meetings', 'Proposals', 'Closed'],
    datasets: [{
      data: [100, 65, 40, 25],
      backgroundColor: [
        'rgba(99, 102, 241, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(147, 51, 234, 0.8)',
        'rgba(236, 72, 153, 0.8)'
      ],
      borderColor: 'transparent'
    }]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      },
    },
    cutout: '60%'
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Performance Analytics</h2>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card bg-base-100 shadow-lg border border-base-200">
          <div className="card-body">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <RiMoneyDollarCircleLine className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="text-sm text-base-content/70">Total Sales</div>
                <div className="text-xl font-bold">{stats.totalSales}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-lg border border-base-200">
          <div className="card-body">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-secondary/10 rounded-lg">
                <RiUserLine className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <div className="text-sm text-base-content/70">Clients Acquired</div>
                <div className="text-xl font-bold">{stats.clientsAcquired}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-lg border border-base-200">
          <div className="card-body">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-accent/10 rounded-lg">
                <RiPieChartLine className="w-6 h-6 text-accent" />
              </div>
              <div>
                <div className="text-sm text-base-content/70">Conversion Rate</div>
                <div className="text-xl font-bold">{stats.conversionRate}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-lg border border-base-200">
          <div className="card-body">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-info/10 rounded-lg">
                <RiBarChartBoxLine className="w-6 h-6 text-info" />
              </div>
              <div>
                <div className="text-sm text-base-content/70">Avg. Deal Time</div>
                <div className="text-xl font-bold">{stats.avgDealTime}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card bg-base-100 shadow-lg border border-base-200 p-6">
          <h3 className="text-lg font-bold mb-4">Monthly Performance</h3>
          <Line data={monthlyData} options={chartOptions} />
        </div>
        <div className="card bg-base-100 shadow-lg border border-base-200 p-6">
          <h3 className="text-lg font-bold mb-4">Client Conversion Funnel</h3>
          <Doughnut data={conversionData} options={doughnutOptions} />
        </div>
      </div>
    </div>
  );
}

export default Analytics;