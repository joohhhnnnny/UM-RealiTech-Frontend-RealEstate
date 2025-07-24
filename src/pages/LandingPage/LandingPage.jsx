import Navbar from '/src/components/Navbar.jsx';
import Homepage from './Homepage.jsx';
import Solutions from './Solutions.jsx';
import Footer from '/src/components/Footer.jsx'

function LandingPage(){

    return(
        <>
            {/* Para clean siya and mafollow. */}
            <Navbar />
            <Homepage />
            <Solutions/>
            <Footer />
        
        </>


    );


}

export default LandingPage