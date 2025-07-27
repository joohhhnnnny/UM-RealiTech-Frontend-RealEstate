import {
  RiCalculatorLine,
  RiFileTextLine,
  RiCalendarLine,
  RiNotificationLine,
  RiTeamLine,
  RiBarChartBoxLine
} from 'react-icons/ri';

function Tools() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Agent Tools</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card bg-gradient-to-br from-blue-500/10 to-blue-600/5 shadow-lg border border-blue-500/20">
          <div className="card-body">
            <RiCalculatorLine className="w-8 h-8 text-blue-600 mb-4" />
            <h3 className="text-lg font-bold text-blue-600">Client Loan Calculator</h3>
            <p className="text-sm text-base-content/70 mb-4">Help clients calculate mortgage payments and affordability</p>
            <button className="btn btn-outline btn-sm">Open Tool</button>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 shadow-lg border border-emerald-500/20">
          <div className="card-body">
            <RiFileTextLine className="w-8 h-8 text-emerald-600 mb-4" />
            <h3 className="text-lg font-bold text-emerald-600">Document Tracker</h3>
            <p className="text-sm text-base-content/70 mb-4">Track client document submission progress</p>
            <button className="btn btn-outline btn-sm">Open Tool</button>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-purple-500/10 to-purple-600/5 shadow-lg border border-purple-500/20">
          <div className="card-body">
            <RiCalendarLine className="w-8 h-8 text-purple-600 mb-4" />
            <h3 className="text-lg font-bold text-purple-600">Appointment Scheduler</h3>
            <p className="text-sm text-base-content/70 mb-4">Schedule property viewings and client meetings</p>
            <button className="btn btn-outline btn-sm">Open Tool</button>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-amber-500/10 to-amber-600/5 shadow-lg border border-amber-500/20">
          <div className="card-body">
            <RiNotificationLine className="w-8 h-8 text-amber-600 mb-4" />
            <h3 className="text-lg font-bold text-amber-600">Client Notifications</h3>
            <p className="text-sm text-base-content/70 mb-4">Send automated updates to clients</p>
            <button className="btn btn-outline btn-sm">Open Tool</button>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-rose-500/10 to-rose-600/5 shadow-lg border border-rose-500/20">
          <div className="card-body">
            <RiTeamLine className="w-8 h-8 text-rose-600 mb-4" />
            <h3 className="text-lg font-bold text-rose-600">Lead Management</h3>
            <p className="text-sm text-base-content/70 mb-4">Organize and prioritize client leads</p>
            <button className="btn btn-outline btn-sm">Open Tool</button>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-teal-500/10 to-teal-600/5 shadow-lg border border-teal-500/20">
          <div className="card-body">
            <RiBarChartBoxLine className="w-8 h-8 text-teal-600 mb-4" />
            <h3 className="text-lg font-bold text-teal-600">Market Analytics</h3>
            <p className="text-sm text-base-content/70 mb-4">Access market trends and pricing data</p>
            <button className="btn btn-outline btn-sm">Open Tool</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Tools;