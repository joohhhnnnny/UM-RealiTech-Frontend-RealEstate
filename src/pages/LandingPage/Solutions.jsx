import { BuildingOffice2Icon, UserGroupIcon, SparklesIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

function Solutions() {
    const solutions = [
        {
            title: "DevTrackr",
            description: "Transparency Platform for Developers",
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
            title: "BuySmart PH",
            description: "AI-Powered Home Buying Process",
            icon: SparklesIcon,
            bgColor: "bg-gradient-to-br from-teal-500 to-teal-600",
        },
        {
            title: "PropGuard",
            description: "Property Fraud Detection and Verification Tool",
            icon: ShieldCheckIcon,
            bgColor: "bg-gradient-to-br from-rose-500 to-rose-600",
        }
    ];


    return (
        <section id="solutions" className="py-16 transition-colors duration-300 bg-base-100">
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
        </section>
        
    );
}

export default Solutions;
