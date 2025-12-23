export default function Home() {
    return (
        <section className="bg-gradient-to-b from-slate-50 to-white py-16">
            <div className="max-w-5xl mx-auto px-6 text-center">

                {/* Headline */}
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
                    Certified Safety Training & Assessment Platform
                </h1>

                {/* Sub headline */}
                <p className="mt-6 text-lg text-gray-600 max-w-3xl mx-auto">
                    Industry-aligned safety quizzes designed by
                    <span className="font-medium text-gray-800"> Safety Crew India</span>,
                    powered by
                    <span className="font-medium text-gray-800"> Visa Way Global</span>.
                    Complete assessments and earn verifiable certificates.
                </p>

                {/* CTA */}
                <div className="mt-10 flex justify-center gap-4 flex-wrap">
                    <a
                        href="/quiz/select-category"
                        className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-lg font-medium shadow-md transition"
                    >
                        Start Safety Assessment
                    </a>

                    <button className="px-6 py-3 border border-gray-300 rounded-lg text-lg text-gray-700 hover:bg-gray-100 transition">
                        About the Program
                    </button>
                </div>

            </div>
        </section>
    );
}
