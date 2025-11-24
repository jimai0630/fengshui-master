

const UserInfoSection: React.FC = () => {
    return (
        <section className="min-h-screen py-20 px-4 sm:px-6 lg:px-8 flex items-center bg-background-light dark:bg-background-dark" id="page2">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                <div className="text-center lg:text-left">
                    <img
                        alt="Abstract flowing colors representing energy fields"
                        className="w-full h-auto object-cover rounded-xl shadow-2xl mb-8"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAl5XRnn_m5n7tSCvAouQP-Jj0KabC1BiIrzuYAnPzivNJKg7j-3zIQRiBAZd2ueVjjBgp3JD1DfL9gHtoN7mMpyqRL4wwGnnmttYwYVujrtEvSm7CNXjSZbfeUSIrvGvWMN794QqrUu7aAWK7cXUJcWsx_omicPqT9S5Y3BpYX90JsjSxIYZUTEPOWI-bszKC3iocOYeKHyPbFdNNHIxujr5jopdLV4KPV5HKm47TDrcJ6O16e4wHoDWk0Ha28_6LldZz3dg2PVO3V"
                    />
                    <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-400">
                        Every year, environments and energy fields change. Any adjustment not centered on your energy is meaningless. All we do is guide simple shifts for your love, health and abundance.
                    </p>
                </div>
                <div className="bg-white dark:bg-gray-900/50 p-8 sm:p-10 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold font-display text-gray-800 dark:text-white mb-4">First, let us know you</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-8">We will show your energy in the past year and the next year for FREE.</p>
                    <form action="#" className="space-y-6" method="POST">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="nickname">Nickname</label>
                                <input className="mt-1 block w-full rounded border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:text-white" id="nickname" name="nickname" type="text" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="birth_year">Birth Year</label>
                                <input className="mt-1 block w-full rounded border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:text-white" id="birth_year" name="birth_year" placeholder="YYYY" type="number" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="gender">Gender</label>
                                <select className="mt-1 block w-full rounded border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:text-white" id="gender" name="gender">
                                    <option>Female</option>
                                    <option>Male</option>
                                    <option>Other</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="email">Email Address</label>
                            <input className="mt-1 block w-full rounded border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:text-white" id="email" name="email" type="email" />
                        </div>
                        <div>
                            <a className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors" href="#page3">
                                Submit
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default UserInfoSection;
