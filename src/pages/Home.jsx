export default function Home() {
    return (
        <section className="bg-gradient-to-b from-white to-slate-50">

            <div className="max-w-5xl mx-auto px-5 py-10 md:py-16 text-center">

                {/* Headline */}
                <h1 className="text-2xl md:text-5xl font-extrabold text-gray-900 leading-tight">
                    Certified Safety Training & Assessment Platform
                </h1>

                {/* Sub headline */}
                <p className="mt-4 md:mt-6 text-sm md:text-lg text-gray-600 max-w-3xl mx-auto">
                    Industry-aligned safety quizzes designed by{" "}
                    <span className="font-semibold text-gray-800">Safety Crew India</span>,
                    powered by{" "}
                    <span className="font-semibold text-gray-800">Visa Way Global</span>.
                    Complete assessments and earn verifiable certificates.
                </p>

                {/* Trust highlights (NEW – critical for mobile) */}
                <div className="mt-5 md:mt-6 text-xs md:text-sm text-gray-500 space-y-1">
                    <div>✔ Industry-aligned safety standards</div>
                    <div>✔ 10,000-question professional assessments</div>
                    <div>✔ Verifiable certificate after completion</div>
                </div>

                {/* CTA */}
                <div className="mt-7 md:mt-10 flex flex-col sm:flex-row justify-center gap-4">

                    <a
                        href="/quiz/select-category"
                        className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-base md:text-lg font-semibold shadow-md transition"
                    >
                        Start Safety Assessment
                    </a>

                    <button className="px-6 py-3 border border-gray-300 rounded-lg text-base md:text-lg text-gray-700 hover:bg-gray-100 transition">
                        About the Program
                    </button>

                </div>

            </div>
        </section>
    );
}
