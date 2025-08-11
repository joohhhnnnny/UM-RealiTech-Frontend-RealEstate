import Navbar from '/src/components/Navbar.jsx'
import InfoPage from './InfoPage';
import Developers from './Developers';
import Footer from '/src/components/Footer.jsx'

function AboutUs() {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow relative overflow-hidden bg-base-100 from-base-100/30 via-base-100 to-base-100/50 dark:from-base-100/20 dark:via-base-100 dark:to-base-100/30 min-h-screen">
                {/* Shared background elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/5 dark:bg-blue-400/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl"></div>
                </div>
                
                <InfoPage />
                <Developers />
            </main>
            <Footer />
        </div>
    );
}

export default AboutUs;