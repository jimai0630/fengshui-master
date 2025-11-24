

const EnergyForecastSection: React.FC = () => {
    return (
        <section className="min-h-screen py-20 px-4 sm:px-6 lg:px-8 flex items-center bg-background-light dark:bg-background-dark" id="page4">
            <div className="max-w-7xl mx-auto w-full">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold font-display text-gray-800 dark:text-white">Your Energy Forecast</h2>
                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">A glimpse into your personal energy shifts for the coming years.</p>
                </div>
                <div className="bg-white dark:bg-gray-900/50 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-0">
                        <div className="p-8 sm:p-10 flex flex-col items-center justify-center">
                            <h3 className="text-xl font-semibold text-center text-gray-900 dark:text-white mb-6">2025 vs 2026 Energy Comparison</h3>
                            <div className="relative w-full max-w-sm aspect-square">
                                <div className="pentagon">
                                    <svg viewBox="0 0 100 95.1">
                                        <polygon className="dark:stroke-gray-700" fill="none" points="50,0 100,34.55 80.9,95.1 19.1,95.1 0,34.55" stroke="#E5E7EB" strokeWidth="0.5"></polygon>
                                        <polygon className="dark:stroke-gray-700" fill="none" points="50,19.02 80.9,43.77 72.72,76.08 27.28,76.08 19.1,43.77" stroke="#E5E7EB" strokeWidth="0.5"></polygon>
                                        <polygon className="dark:stroke-gray-700" fill="#F3F4F6" points="50,38.04 61.8,53 64.54,57.06 35.46,57.06 38.2,53" stroke="#E5E7EB" strokeWidth="0.5"></polygon>
                                        <line className="dark:stroke-gray-700" stroke="#E5E7EB" strokeWidth="0.5" x1="50" x2="19.1" y1="0" y2="95.1"></line>
                                        <line className="dark:stroke-gray-700" stroke="#E5E7EB" strokeWidth="0.5" x1="50" x2="80.9" y1="0" y2="95.1"></line>
                                        <line className="dark:stroke-gray-700" stroke="#E5E7EB" strokeWidth="0.5" x1="0" x2="100" y1="34.55" y2="34.55"></line>
                                        <line className="dark:stroke-gray-700" stroke="#E5E7EB" strokeWidth="0.5" x1="0" x2="80.9" y1="34.55" y2="95.1"></line>
                                        <line className="dark:stroke-gray-700" stroke="#E5E7EB" strokeWidth="0.5" x1="100" x2="19.1" y1="34.55" y2="95.1"></line>
                                        <polygon fill="rgba(217, 119, 6, 0.2)" points="50,10 90,34.55 75,90 25,90 10,34.55" stroke="#D97706" strokeWidth="1.5"></polygon>
                                        <polygon fill="rgba(59, 130, 246, 0.2)" points="50,25 80,45 65,85 35,85 20,45" stroke="#3B82F6" strokeWidth="1.5"></polygon>
                                    </svg>
                                    <div className="pentagon-label text-sm font-medium" style={{ top: '-5%', left: '50%' }}>Love</div>
                                    <div className="pentagon-label text-sm font-medium" style={{ top: '34.55%', left: '105%' }}>Wealth</div>
                                    <div className="pentagon-label text-sm font-medium" style={{ top: '95.1%', left: '85%' }}>Career</div>
                                    <div className="pentagon-label text-sm font-medium" style={{ top: '95.1%', left: '15%' }}>Health</div>
                                    <div className="pentagon-label text-sm font-medium" style={{ top: '34.55%', left: '-5%' }}>Luck</div>
                                </div>
                            </div>
                            <div className="mt-6 flex justify-center space-x-6">
                                <div className="flex items-center">
                                    <span className="w-4 h-4 rounded-full bg-primary mr-2"></span>
                                    <span>2025</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="w-4 h-4 rounded-full bg-blue-500 mr-2"></span>
                                    <span>2026</span>
                                </div>
                            </div>
                        </div>
                        <div className="p-8 sm:p-10 bg-gray-50 dark:bg-gray-800/60 lg:border-l border-gray-200 dark:border-gray-700">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Brief Interpretation</h3>
                            <div className="space-y-6">
                                <div>
                                    <h4 className="font-semibold text-primary">Love</h4>
                                    <p className="text-gray-600 dark:text-gray-400 mt-1">A slight dip is forecasted, suggesting a focus on communication and patience in relationships.</p>
                                    <button className="mt-3 text-sm font-medium text-white bg-primary/80 hover:bg-primary px-4 py-2 rounded-md transition-colors w-full sm:w-auto">Unlock Full Insight</button>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-primary">Wealth</h4>
                                    <p className="text-gray-600 dark:text-gray-400 mt-1">Stable in 2025 with an upward trend. A good time for long-term financial planning.</p>
                                    <button className="mt-3 text-sm font-medium text-white bg-primary/80 hover:bg-primary px-4 py-2 rounded-md transition-colors w-full sm:w-auto">Unlock Full Insight</button>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-primary">Career</h4>
                                    <p className="text-gray-600 dark:text-gray-400 mt-1">Significant growth potential in 2026. Prepare for new opportunities and responsibilities.</p>
                                    <button className="mt-3 text-sm font-medium text-white bg-primary/80 hover:bg-primary px-4 py-2 rounded-md transition-colors w-full sm:w-auto">Unlock Full Insight</button>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-primary">Health</h4>
                                    <p className="text-gray-600 dark:text-gray-400 mt-1">Energy levels are strong. Focus on maintaining balance through mindful practices.</p>
                                    <button className="mt-3 text-sm font-medium text-white bg-primary/80 hover:bg-primary px-4 py-2 rounded-md transition-colors w-full sm:w-auto">Unlock Full Insight</button>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-primary">Luck</h4>
                                    <p className="text-gray-600 dark:text-gray-400 mt-1">General luck sees a steady increase, indicating a period of positive flow and serendipity.</p>
                                    <button className="mt-3 text-sm font-medium text-white bg-primary/80 hover:bg-primary px-4 py-2 rounded-md transition-colors w-full sm:w-auto">Unlock Full Insight</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-12 text-center">
                    <button className="bg-primary text-white font-bold py-4 px-10 rounded-full text-lg shadow-lg hover:bg-amber-700 transition-transform duration-300 ease-in-out hover:scale-105" type="button">
                        View Annual Fortune & Adjustment Plan Report
                    </button>
                    <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Choose to download or send to your email after payment.</p>
                </div>
            </div>
        </section>
    );
};

export default EnergyForecastSection;
