
function Footer(){
    return(
    
        <footer className="bg-gray-900 text-white px-6 py-10">
            <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                
                {/* Column 1: RealiTech Info */}
                <div>
                    <h2 className="text-white font-semibold mb-3">REALITECH</h2>
                    <p className="text-sm text-gray-300">
                        RealiTech is a real estate tech solution that bridges buyers and property sellers through transparency and innovation.
                    </p>
                </div>

                {/* Column 2: Solutions */}
                <div>
                    <h4 className="text-white font-semibold mb-3">Our Solutions</h4>
                    <ul className="space-y-2 text-sm text-gray-300">
                        <li><a href="#" className="hover:underline hover:text-blue-400 transition">DevTrackr</a></li>
                        <li><a href="#" className="hover:underline hover:text-blue-400 transition">BuySmart PH</a></li>
                        <li><a href="#" className="hover:underline hover:text-blue-400 transition">RealtyConnect</a></li>
                    </ul>
                </div>

                {/* Column 3: Social Media */}
                <div>
                    <h4 className="text-white font-semibold mb-3">Social Media</h4>
                    <ul className="space-y-2 text-sm text-gray-300">
                        <li><a href="#" className="hover:underline hover:text-blue-400 transition">Facebook</a></li>
                        <li><a href="#" className="hover:underline hover:text-blue-400 transition">Instagram</a></li>
                        <li><a href="#" className="hover:underline hover:text-blue-400 transition">LinkedIn</a></li>
                    </ul>
                </div>

            </div>

            {/* Footer Bottom */}
            <div className="border-t border-gray-700 mt-8 pt-4 text-center text-sm text-gray-500">
                &copy; {new Date().getFullYear()} RealiTech. All Rights Reserved.
            </div>
        </footer>


    )
   

}

export default Footer