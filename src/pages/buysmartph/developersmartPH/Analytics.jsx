import { RiLineChartLine } from 'react-icons/ri';
import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
);

function Analytics() {
  const [currentTheme, setCurrentTheme] = useState(document.documentElement.getAttribute('data-theme'));

  // Function to get theme-aware colors
  const getThemeColors = () => {
    const isDarkMode = currentTheme === 'dark';
    return {
      gridColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      textColor: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)'
    };
  };

  // Watch for theme changes
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
          setCurrentTheme(document.documentElement.getAttribute('data-theme'));
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    return () => observer.disconnect();
  }, []);

  // Chart colors with opacity variations
  const chartColors = [
    { primary: 'rgb(56, 189, 248)', fill: 'rgba(56, 189, 248, 0.1)' },  // Sky
    { primary: 'rgb(168, 85, 247)', fill: 'rgba(168, 85, 247, 0.1)' },  // Purple
    { primary: 'rgb(251, 146, 60)', fill: 'rgba(251, 146, 60, 0.1)' },  // Orange
    { primary: 'rgb(52, 211, 153)', fill: 'rgba(52, 211, 153, 0.1)' }   // Emerald
  ];

  // Common chart options
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: getThemeColors().textColor,
          font: {
            family: "'Inter', sans-serif",
            size: 12,
            weight: 500
          },
          usePointStyle: true,
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: getThemeColors().textColor.replace('0.8', '0.95'),
        titleColor: getThemeColors().textColor,
        bodyColor: getThemeColors().textColor,
        borderColor: getThemeColors().gridColor.replace('0.1', '0.5'),
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        bodyFont: { family: "'Inter', sans-serif" },
        titleFont: { family: "'Inter', sans-serif", weight: 600 }
      }
    },
    scales: {
      x: {
        grid: {
          color: getThemeColors().gridColor,
          drawBorder: false,
          lineWidth: 0.5
        },
        border: { display: false },
        ticks: {
          color: getThemeColors().textColor,
          font: { family: "'Inter', sans-serif", size: 11, weight: 500 }
        }
      },
      y: {
        grid: {
          color: getThemeColors().gridColor,
          drawBorder: false,
          lineWidth: 0.5
        },
        border: { display: false },
        ticks: {
          color: getThemeColors().textColor,
          font: { family: "'Inter', sans-serif", size: 11, weight: 500 }
        }
      }
    }
  };

  // Sample data for Revenue Trends
  const revenueData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Revenue (₱M)',
      data: [4.5, 5.2, 4.8, 5.9, 6.1, 7.2],
      borderColor: chartColors[0].primary,
      backgroundColor: chartColors[0].fill,
      tension: 0.4,
      fill: true
    }]
  };

  // Sample data for Market Performance
  const marketData = {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    datasets: [{
      label: 'Market Share (%)',
      data: [25, 30, 28, 35],
      backgroundColor: chartColors.map(color => color.primary),
      borderRadius: 8
    }]
  };

  // Sample data for Sales Velocity
  const velocityData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [{
      label: 'Units Sold',
      data: [12, 19, 15, 25],
      borderColor: chartColors[2].primary,
      backgroundColor: chartColors[2].fill,
      tension: 0.4,
      fill: true
    }]
  };

  // Sample data for Buyer Journey
  const journeyData = {
    labels: ['Inquiry', 'Viewing', 'Negotiation', 'Closing'],
    datasets: [{
      data: [40, 30, 20, 10],
      backgroundColor: chartColors.map(color => color.primary),
      borderWidth: 0
    }]
  };
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Business Analytics</h2>
      
      <div className="alert alert-info">
        <RiLineChartLine className="w-6 h-6" />
        <div>
          <h3 className="font-bold">Advanced Analytics Dashboard</h3>
          <div className="text-sm">Comprehensive business intelligence and market analysis tools.</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card bg-base-100 shadow-lg border border-base-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Revenue Trends</h3>
            <div className="badge badge-primary badge-outline">Monthly</div>
          </div>
          <div className="h-64 relative">
            <Line
              data={revenueData}
              options={{
                ...commonOptions,
                plugins: {
                  ...commonOptions.plugins,
                  tooltip: {
                    ...commonOptions.plugins.tooltip,
                    callbacks: {
                      label: (context) => `Revenue: ₱${context.parsed.y}M`
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        <div className="card bg-base-100 shadow-lg border border-base-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Market Performance</h3>
            <div className="badge badge-primary badge-outline">Quarterly</div>
          </div>
          <div className="h-64 relative">
            <Bar
              data={marketData}
              options={{
                ...commonOptions,
                plugins: {
                  ...commonOptions.plugins,
                  tooltip: {
                    ...commonOptions.plugins.tooltip,
                    callbacks: {
                      label: (context) => `Market Share: ${context.parsed.y}%`
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        <div className="card bg-base-100 shadow-lg border border-base-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Sales Velocity</h3>
            <div className="badge badge-primary badge-outline">Weekly</div>
          </div>
          <div className="h-64 relative">
            <Line
              data={velocityData}
              options={{
                ...commonOptions,
                plugins: {
                  ...commonOptions.plugins,
                  tooltip: {
                    ...commonOptions.plugins.tooltip,
                    callbacks: {
                      label: (context) => `Units Sold: ${context.parsed.y}`
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        <div className="card bg-base-100 shadow-lg border border-base-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Buyer Journey Analytics</h3>
            <div className="badge badge-primary badge-outline">Current</div>
          </div>
          <div className="h-64 relative">
            <Doughnut
              data={journeyData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                    labels: {
                      color: getThemeColors().textColor,
                      font: {
                        family: "'Inter', sans-serif",
                        size: 11,
                        weight: 500
                      },
                      usePointStyle: true,
                      padding: 20
                    }
                  },
                  tooltip: {
                    backgroundColor: getThemeColors().textColor.replace('0.8', '0.95'),
                    titleColor: getThemeColors().textColor,
                    bodyColor: getThemeColors().textColor,
                    borderColor: getThemeColors().gridColor.replace('0.1', '0.5'),
                    callbacks: {
                      label: (context) => `${context.label}: ${context.parsed}%`
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;