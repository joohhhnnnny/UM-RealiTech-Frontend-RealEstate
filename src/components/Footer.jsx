import { useNavigate, useLocation } from "react-router-dom";

function Footer(){
    const navigate = useNavigate();
    const location = useLocation();

    const handleNotImplemented = (e) => {
        e.preventDefault();
        navigate('/error', {
            state: {
                from: {
                    pathname: location.pathname,
                    hash: '#footer'
                }
            }
        }); 
    }
    

    return(
        
        <footer id="footer" className="bg-gradient-to-b from-gray-900 to-gray-950 text-white px-6 py-12">
            <div className="max-w-7xl mx-auto">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
                    
                    {/* Column 1: RealiTech Info */}
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                            REALITECH
                        </h2>
                        <p className="text-gray-300 leading-relaxed">
                            RealiTech is a real estate tech solution that bridges buyers and property sellers through transparency and innovation.
                        </p>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-gray-300">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                </svg>
                                <a href="mailto:contact@realitech.com" className="hover:text-blue-400 transition-colors duration-300">
                                    contact@realitech.com
                                </a>
                            </div>
                            <div className="flex items-center gap-2 text-gray-300">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                </svg>
                                <a href="tel:+1234567890" className="hover:text-blue-400 transition-colors duration-300">
                                    +63 (912) 345-6789
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Column 2: Solutions */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-white">Our Solutions</h4>
                        <ul className="space-y-3">
                            {['DevTrackr', 'BuySmart PH', 'RealtyConnect', 'PropGuard'].map((solution) => (
                                <li key={solution}>
                                    <a 
                                        href="#" 
                                        onClick={handleNotImplemented}
                                        className="text-gray-300 hover:text-blue-400 transition-colors duration-300 flex items-center gap-2"
                                    >
                                        <span className="h-1 w-1 bg-blue-400 rounded-full"></span>
                                        {solution}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>


                    {/* Column 3: Social Media */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-white">Connect With Us</h4>
                        <div className="flex gap-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-gray-800 hover:bg-blue-600 flex items-center justify-center transition-colors duration-300">
                                <i className="fab fa-facebook-f text-gray-300 hover:text-white"></i>
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-gray-800 hover:bg-blue-600 flex items-center justify-center transition-colors duration-300">
                                <i className="fab fa-instagram text-gray-300 hover:text-white"></i>
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-gray-800 hover:bg-blue-600 flex items-center justify-center transition-colors duration-300">
                                <i className="fab fa-linkedin-in text-gray-300 hover:text-white"></i>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Footer Bottom */}
                <div className="mt-12 pt-8 border-t border-gray-800">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-gray-400">
                            &copy; {new Date().getFullYear()} RealiTech. All Rights Reserved.
                        </p>
                        <div className="flex gap-6 text-sm text-gray-400">
                            <a href="#" className="hover:text-blue-400 transition-colors duration-300">Privacy Policy</a>
                            <a href="#" className="hover:text-blue-400 transition-colors duration-300">Terms of Service</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
        

    )
}

export default Footer