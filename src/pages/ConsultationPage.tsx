import { useEffect } from 'react';
import HouseDetailsSection from '../components/HouseDetailsSection';
import EnergyForecastSection from '../components/EnergyForecastSection';

const ConsultationPage: React.FC = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen">
            <HouseDetailsSection />
            <EnergyForecastSection />
        </div>
    );
};

export default ConsultationPage;
