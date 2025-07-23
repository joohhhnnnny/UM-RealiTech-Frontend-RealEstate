
function Solutions(){
 const solutions = [
    //For reusable purposes kay para optimize ni siya OKAAAY! hahhahaha
        {
            title: "DevTrackr",
            description: "Transparency Platform for Developers",
            icon: "/src/assets/icons/devtrackr.png", // kung naay icon hala ichange lang
        },
        {
            title: "RealtyConnect",
            description: "Fair Commission and Accreditation System for Agents",
            icon: "/src/assets/icons/realtyconnect.png", // kung naay icon hala ichange lang
        },
        {
            title: "BuySmart PH",
            description: "AI-Powered Home Buying Process",
            icon: "/src/assets/icons/buysmart.png", // kung naay icon hala ichange lang
        }

    ];


    return (

        <section className="bg-gray-100 py-16">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-semibold text-gray-800">Our Tech Solutions</h2>
                <p className="mt-2 text-gray-600 max-w-xl mx-auto">
                    Three innovative platforms addressing the core challenges in the Philippine real estate market
                </p>
            </div>

            <div className="flex flex-col lg:flex-row justify-center items-center gap-8 px-4 lg:px-0">

                {solutions.map((solution, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-lg shadow-md p-6 w-full max-w-xs text-center"
                    >
                        <div className="flex justify-center mb-4">
                            <img src={solution.icon} alt={solution.title} className="w-12 h-12 object-contain" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">{solution.title}</h3>
                        <p className="text-gray-600 text-sm mt-2">{solution.description}</p>
                        <button className="mt-4 btn btn-primary px-4 py-2 rounded hover:btn-[#0b5ed7] transition duration-200">
                            Explore
                        </button>
                    </div>

                ))}

            </div>
        </section>

    )

}

export default Solutions