

const HouseDetailsSection: React.FC = () => {
    return (
        <section className="min-h-screen py-20 px-4 sm:px-6 lg:px-8 flex items-center bg-gray-50 dark:bg-gray-900" id="page3">
            <div className="max-w-4xl mx-auto w-full">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold font-display text-gray-800 dark:text-white">Your Home's Energy Blueprint</h2>
                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">Provide details about your living space to create a personalized energy map.</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-8 sm:p-10 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 space-y-8">
                    <div>
                        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Family Members</h3>
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <input className="block w-full rounded border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:text-white" placeholder="Relationship (e.g., Partner)" type="text" />
                            <input className="block w-full rounded border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:text-white" placeholder="Birth Year (YYYY)" type="number" />
                        </div>
                        <button className="mt-3 text-sm font-medium text-primary hover:text-amber-700 dark:hover:text-amber-500" type="button">+ Add another member</button>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
                        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">House Floor Plan</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Upload a floor plan with cardinal directions from a professional source.</p>
                        <div className="mt-4 flex justify-center rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 px-6 pt-5 pb-6">
                            <div className="space-y-1 text-center">
                                <span className="material-icons-outlined text-5xl text-gray-400">upload_file</span>
                                <div className="flex text-sm text-gray-600 dark:text-gray-400">
                                    <label className="relative cursor-pointer rounded-md font-medium text-primary hover:text-amber-700 focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 dark:ring-offset-gray-800" htmlFor="file-upload">
                                        <span>Upload a file</span>
                                        <input className="sr-only" id="file-upload" name="file-upload" type="file" />
                                    </label>
                                    <p className="pl-1">or drag and drop</p>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-500">PNG, JPG, PDF up to 10MB</p>
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
                        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Photos of Key Areas</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Upload 1-2 photos for each relevant area.</p>
                        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 text-center">
                            <button className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors" type="button">
                                <span className="material-icons-outlined text-3xl mb-1">sensor_door</span>
                                <span className="text-sm">Entrance</span>
                            </button>
                            <button className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors" type="button">
                                <span className="material-icons-outlined text-3xl mb-1">living</span>
                                <span className="text-sm">Living Room</span>
                            </button>
                            <button className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors" type="button">
                                <span className="material-icons-outlined text-3xl mb-1">bed</span>
                                <span className="text-sm">Bedroom</span>
                            </button>
                            <button className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors" type="button">
                                <span className="material-icons-outlined text-3xl mb-1">balcony</span>
                                <span className="text-sm">Balcony</span>
                            </button>
                            <button className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors" type="button">
                                <span className="material-icons-outlined text-3xl mb-1">add_circle_outline</span>
                                <span className="text-sm">Other</span>
                            </button>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6">
                        <button className="w-full sm:w-auto flex justify-center py-3 px-6 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors" type="button">
                            Upload
                        </button>
                        <a className="w-full sm:w-auto flex justify-center py-3 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors" href="#page4">
                            Review & Confirm
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HouseDetailsSection;
