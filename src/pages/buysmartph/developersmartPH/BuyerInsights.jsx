import { motion } from "framer-motion";
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
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

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
  Filler
);

function BuyerInsights({ buyerInsights }) {
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

  // Define vibrant colors that work well in both light and dark modes
  const chartColors = [
    { fill: 'rgba(56, 189, 248, 0.2)', line: 'rgb(56, 189, 248)', dark: 'rgba(56, 189, 248, 0.3)' }, // Sky
    { fill: 'rgba(168, 85, 247, 0.2)', line: 'rgb(168, 85, 247)', dark: 'rgba(168, 85, 247, 0.3)' }, // Purple
    { fill: 'rgba(251, 146, 60, 0.2)', line: 'rgb(251, 146, 60)', dark: 'rgba(251, 146, 60, 0.3)' }, // Orange
    { fill: 'rgba(52, 211, 153, 0.2)', line: 'rgb(52, 211, 153)', dark: 'rgba(52, 211, 153, 0.3)' }  // Emerald
  ];

  const preferences = {
    labels: buyerInsights.map(insight => insight.segment),
    datasets: [
      {
        label: 'Buyer Segment Distribution',
        data: buyerInsights.map(insight => insight.percentage),
        backgroundColor: 'rgba(56, 189, 248, 0.2)',
        borderColor: 'rgb(56, 189, 248)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgb(56, 189, 248)',
        pointBorderColor: 'rgb(56, 189, 248)',
        pointHoverBackgroundColor: 'white',
        pointHoverBorderColor: 'rgb(56, 189, 248)',
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  };

  const priceAnalysis = {
    labels: buyerInsights.map(insight => insight.segment),
    datasets: [
      {
        label: 'Average Budget Distribution',
        data: buyerInsights.map(insight => parseFloat(insight.avgBudget.replace(/[^0-9.]/g, ''))),
        backgroundColor: buyerInsights.map((_, index) => chartColors[index % chartColors.length].line),
        borderRadius: 8,
        borderWidth: 1,
        borderColor: buyerInsights.map((_, index) => chartColors[index % chartColors.length].line),
        hoverBackgroundColor: buyerInsights.map((_, index) => chartColors[index % chartColors.length].dark)
      }
    ]
  };

  const chartOptions = {
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
        bodyFont: {
          family: "'Inter', sans-serif"
        },
        titleFont: {
          family: "'Inter', sans-serif",
          weight: 600
        },
        displayColors: true,
        boxWidth: 8,
        boxHeight: 8
      }
    },
    scales: {
      x: {
        grid: {
          color: getThemeColors().gridColor,
          drawBorder: false,
          lineWidth: 0.5
        },
        border: {
          display: false
        },
        ticks: {
          color: getThemeColors().textColor,
          font: {
            family: "'Inter', sans-serif",
            size: 11,
            weight: 500
          },
          padding: 8
        }
      },
      y: {
        grid: {
          color: getThemeColors().gridColor,
          drawBorder: false,
          lineWidth: 0.5
        },
        border: {
          display: false
        },
        ticks: {
          color: getThemeColors().textColor,
          font: {
            family: "'Inter', sans-serif",
            size: 11,
            weight: 500
          },
          padding: 8,
          callback: function(value) {
            return value + '%';
          }
        }
      }
    }
  };
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Buyer Insights & Analytics</h2>
      
      {/* Buyer Segments */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {buyerInsights.map((insight, index) => (
          <motion.div
            key={insight.segment}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`card bg-gradient-to-br ${insight.bgColor} shadow-lg border ${insight.borderColor}`}
          >
            <div className="card-body p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`font-bold ${insight.color}`}>{insight.segment}</h3>
                <div className={`text-2xl font-bold ${insight.color}`}>{insight.percentage}%</div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-base-content/70">Avg Budget:</span>
                  <span className="font-medium">{insight.avgBudget}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-base-content/70">Top Location:</span>
                  <span className="font-medium">{insight.topLocation}</span>
                </div>
              </div>

              {/* Progress bar showing segment percentage */}
              <div className="mt-4">
                <div className="w-full h-2 bg-base-200/50 rounded-full">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${insight.color.replace('text-', 'bg-')}`}
                    style={{ width: `${insight.percentage}%` }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card bg-base-100 shadow-lg border border-base-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <RiLineChartLine className="text-primary" />
              Buyer Preferences Trend
            </h3>
            <div className="badge badge-primary badge-outline">Live Data</div>
          </div>
          <div className="h-64 relative">
            <Line 
              data={preferences}
              options={chartOptions}
              className="rounded-lg"
            />
          </div>
          <div className="mt-4 text-sm text-base-content/70 text-center">
            Distribution of buyer segments over time
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card bg-base-100 shadow-lg border border-base-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <RiLineChartLine className="text-primary" />
              Price Sensitivity Analysis
            </h3>
            <div className="badge badge-primary badge-outline">Live Data</div>
          </div>
          <div className="h-64 relative">
            <Bar 
              data={priceAnalysis}
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  tooltip: {
                    ...chartOptions.plugins.tooltip,
                    callbacks: {
                      label: function(context) {
                        return `Budget: ₱${context.parsed.y}M`;
                      }
                    }
                  }
                }
              }}
              className="rounded-lg"
            />
          </div>
          <div className="mt-4 text-sm text-base-content/70 text-center">
            Average budget distribution across segments
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default BuyerInsights;