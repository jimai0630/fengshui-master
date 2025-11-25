
import HeroSection from './components/HeroSection';
import Navbar from './components/Navbar';
import UserInfoSection from './components/UserInfoSection';
import HouseDetailsSection from './components/HouseDetailsSection';
import EnergyForecastSection from './components/EnergyForecastSection';

function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <UserInfoSection />
      <HouseDetailsSection />
      <EnergyForecastSection />
    </div>
  );
}

export default App;
