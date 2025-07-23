import Navbar from '/src/components/Navbar.jsx'
import Solutions from './Solutions';
import Footer from '/src/components/Footer.jsx'


function Home(){

    return(
        <>
            <Navbar />
           
            <section id="hero" className="flex items-center justify-center px-4 lg:px-24 py-10 lg:py-20 ">
                <div className="flex flex-col lg:flex-row-reverse items-center gap-12 w-full max-w-7xl">

                   
                    <div className=" animate-fade-in-up">
                    

                    {/* Dummy picture rani kay kapoy naaa just change it okaaay... hahahhaha */}
                        <img
                            src="https://img.daisyui.com/images/stock/photo-1635805737707-575885ab0820.webp"
                            className="w-[18em] max-w-sm rounded-lg shadow-2xl"
                            alt="Smart Property Search"

                        />
                    
                    </div>


                    {/* LEFT: Hero Contents ni siya */}
                    <div className="flex-1  text-center lg:text-left">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-800 leading-tight ">
                            Revolutionizing Real State
                        </h2>

                        <p className="mt-6 text-gray-600 text-base md:text-lg max-w-xl mx-auto lg:mx-0 ">
                            Tech-driven solutions to simplify property management and enhance the home buying process in the Philippines
                        </p>

                        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                            <button className="btn btn-primary">Get Started</button>

                        </div>
                    </div>


                </div>
            </section>


            <Solutions/>

            <Footer />

        </>
       
    );

}

export default Home