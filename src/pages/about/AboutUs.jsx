import Navbar from '/src/components/Navbar.jsx'
import InfoPage from './InfoPage';
import Developers from './Developers';
import Footer from '/src/components/Footer.jsx'


function AboutUs(){

    return(
       <>
            <Navbar />
            <InfoPage/>
            <Developers/>
            <Footer/>
       </>
    );

}

export default AboutUs