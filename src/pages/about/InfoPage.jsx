
function InfoPage() {
    return (
        <section className="min-h-screen bg-base-200/50">
            <div className="container mx-auto px-4 py-16 max-w-4xl">
                <div className="bg-base-100 rounded-2xl shadow-xl p-8 md:p-12 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-8 text-primary">About Us</h1>
                    
                    <div className="space-y-6 max-w-2xl mx-auto">
                        <p className="text-lg text-base-content/80 leading-relaxed">
                            Welcome to our real estate platform! We are dedicated to connecting buyers, sellers, and renters 
                            with their ideal properties through innovative technology and exceptional service.
                        </p>
                        
                        <p className="text-lg text-base-content/80 leading-relaxed">
                            Our mission is to revolutionize the real estate experience by providing cutting-edge solutions 
                            that make property transactions seamless, transparent, and efficient for everyone involved.
                        </p>

                        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="p-6 bg-base-200 rounded-xl">
                                <h3 className="text-xl font-semibold mb-3 text-primary">Innovation</h3>
                                <p className="text-base-content/70">Leveraging technology to transform real estate</p>
                            </div>
                            <div className="p-6 bg-base-200 rounded-xl">
                                <h3 className="text-xl font-semibold mb-3 text-primary">Trust</h3>
                                <p className="text-base-content/70">Building relationships through transparency</p>
                            </div>
                            <div className="p-6 bg-base-200 rounded-xl">
                                <h3 className="text-xl font-semibold mb-3 text-primary">Excellence</h3>
                                <p className="text-base-content/70">Delivering exceptional service every time</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )   
}
export default InfoPage