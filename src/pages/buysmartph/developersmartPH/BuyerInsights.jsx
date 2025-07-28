import { motion } from "framer-motion";
import { RiLineChartLine } from 'react-icons/ri';

function BuyerInsights({ buyerInsights }) {
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
        <div className="card bg-base-100 shadow-lg border border-base-200 p-6">
          <h3 className="text-lg font-bold mb-4">Buyer Preferences Trend</h3>
          <div className="h-64 bg-base-200 rounded-lg flex items-center justify-center">
            <span className="text-base-content/50">Chart: Buyer Preferences Over Time</span>
          </div>
        </div>
        <div className="card bg-base-100 shadow-lg border border-base-200 p-6">
          <h3 className="text-lg font-bold mb-4">Price Sensitivity Analysis</h3>
          <div className="h-64 bg-base-200 rounded-lg flex items-center justify-center">
            <span className="text-base-content/50">Chart: Price vs Demand Correlation</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BuyerInsights;