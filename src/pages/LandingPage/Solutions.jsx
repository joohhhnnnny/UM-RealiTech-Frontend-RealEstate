import { BuildingOffice2Icon, UserGroupIcon, SparklesIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

// Background pattern component
const SolutionsBackground = () => (
  <div className="absolute inset-0 overflow-hidden">
    {/* Geometric pattern */}
    <div className="absolute inset-0 opacity-3">
      <svg width="100%" height="100%" viewBox="0 0 800 600" className="w-full h-full">
        <defs>
          <pattern id="grid" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
            <circle cx="40" cy="40" r="2" fill="currentColor" opacity="0.1"/>
            <circle cx="0" cy="0" r="1" fill="currentColor" opacity="0.05"/>
            <circle cx="80" cy="0" r="1" fill="currentColor" opacity="0.05"/>
            <circle cx="0" cy="80" r="1" fill="currentColor" opacity="0.05"/>
            <circle cx="80" cy="80" r="1" fill="currentColor" opacity="0.05"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" className="text-base-content"/>
      </svg>
    </div>
    
    {/* Gradient overlays */}
    <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
    <div className="absolute bottom-0 right-0 w-80 h-80 bg-secondary/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1.5s'}}></div>
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '3s'}}></div>
    
    {/* Subtle lines */}
    <div className="absolute inset-0 opacity-10">
      <svg className="w-full h-full" viewBox="0 0 1200 800">
        <path d="M0,400 Q300,200 600,400 T1200,400" fill="none" stroke="currentColor" strokeWidth="1" className="text-primary"/>
        <path d="M0,500 Q300,300 600,500 T1200,500" fill="none" stroke="currentColor" strokeWidth="1" className="text-secondary"/>
        <path d="M0,300 Q300,100 600,300 T1200,300" fill="none" stroke="currentColor" strokeWidth="1" className="text-accent"/>
      </svg>
    </div>
  </div>
);

function Solutions() {
    const solutions = [
        {
            title: "BuySmart PH",
            description: "AI-Powered Home Buying Process",
            icon: SparklesIcon,
            bgColor: "bg-gradient-to-br from-teal-500 to-teal-600",
        },
        {
            title: "BuildSafe",
            description: "Trust-Building Construction Oversight Platform",
            icon: BuildingOffice2Icon,
            bgColor: "bg-gradient-to-br from-blue-500 to-blue-600",
        },
        {
            title: "RealtyConnect",
            description: "Fair Commission and Accreditation System for Agents",
            icon: UserGroupIcon,
            bgColor: "bg-gradient-to-br from-purple-500 to-purple-600",
        },
        {
            title: "PropGuard",
            description: "Property Fraud Detection and Verification Tool",
            icon: ShieldCheckIcon,
            bgColor: "bg-gradient-to-br from-rose-500 to-rose-600",
        }
    ];

    return (
        <section id="solutions" className="relative scroll-mt-28 pb-16 pt-16 transition-colors duration-300 bg-base-100 overflow-hidden">
            <SolutionsBackground />
            
            <div className="relative z-10">
                <div className="mb-16 text-center">
                    <h2 className="text-4xl font-bold mb-4 text-base-content">
                        Streamline Your Real Estate Experience
                    </h2>
                    <p className="text-lg mx-auto max-w-2xl text-base-content/70">
                        Say goodbye to paperwork. Say hello to smart real estate.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-8 px-4 md:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
                    {solutions.map((solution, index) => (
                        <div
                            key={index}
                            className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl 
                                     transition-all duration-300 transform hover:-translate-y-1 bg-base-100"
                        >
                            <div className={`${solution.bgColor} p-6 h-full`}>
                                <div className="flex justify-center mb-6">
                                    <solution.icon className="w-14 h-14 text-white/90" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-3">
                                    {solution.title}
                                </h3>
                                <p className="text-white/80 text-sm leading-relaxed">
                                    {solution.description}
                                </p>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent 
                                          opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default Solutions;