import { Link } from 'react-router-dom';

function Navbar(){
    return(
          <nav className="navbar bg-base-300 shadow-md sticky top-0 z-50">

            <div className="container mx-auto">

                <div className="flex justify-between w-full items-center">

                    
                    {/* logo left side*/}
                     <div className="navbar-start flex-1">
                        <img src="/src/assets/logo/2-Photoroom (1).png" alt="RealiTech Logo" className='w-[150px] h-[48px] object-contain ml-5'/>
                        
                    </div>


                    {/* links center */}
                    <div className="navbar-end hidden lg:flex flex-[2] justify-center ">
                        <ul className="menu menu-horizontal px-1 space-x-1">    

                            <li><a href="#Home">Home</a></li>
                            <li><a href="#AboutUs">About Us</a></li>
                            <li><a href="#VerifyProperty">Solution</a></li>
                          
                            
                        </ul>

                    </div>

                    {/* right side */}
                    <div className="navbar-end hidden lg:flex flex-1">
                        <a className="btn btn-primary" to="/login">Login/Register</a>
                    </div>
                    


                    {/* Mobile Dropdown */}
                    <div className="dropdown dropdown-end lg:hidden">
                        <label tabIndex={0} className="btn btn-ghost btn-circle">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
                                viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </label>

                        <ul tabIndex={0} className="menu dropdown-content mt-3 z-[1] p-2 shadow bg-base-200 rounded-box w-52">
                            
                            <li><a href="#Home">Home</a></li>
                            <li><a href="#AboutUs">About Us</a></li>
                            <li><a href="#VerifyProperty">Solution</a></li>
                            <li><a className="btn btn-sm btn-primary mt-2" to="/login">Login/Register</a></li>


                        </ul>
                       

                    </div>


                </div>

            </div>
        </nav>

    )
   


}

export default Navbar