import HeroSection from '../components/HeroSection';
import UserInfoSection from '../components/UserInfoSection';
import FeaturesSection from '../components/FeaturesSection';
import ProcessSection from '../components/ProcessSection';
import InfoSection from '../components/InfoSection';

const HomePage: React.FC = () => {
    return (
        <div className="min-h-screen">
            <HeroSection />
            <FeaturesSection />
            <ProcessSection />
            <UserInfoSection />
            <InfoSection />
        </div>
    );
};

export default HomePage;
