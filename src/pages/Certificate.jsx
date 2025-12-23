// src/pages/Certificate.jsx
import React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function Certificate() {
    const [params] = useSearchParams();
    const navigate = useNavigate();

    const score = Number(params.get("score"));
    const total = Number(params.get("total"));
    const username = params.get("username") || "Guest";

    if (!Number.isFinite(score) || !Number.isFinite(total)) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow text-center">
                    <h2 className="text-xl font-bold mb-2">No Score Data Available</h2>
                    <p className="text-gray-600 mb-4">
                        This certificate link does not contain result data.
                    </p>
                    <button
                        onClick={() => navigate("/")}
                        className="px-4 py-2 bg-brand-500 text-white rounded"
                    >
                        Back Home
                    </button>
                </div>
            </div>
        );
    }

    const percentage = Math.round((score / total) * 100);
    const result = percentage >= 60 ? "PASS" : "FAIL";

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-8">
                <h1 className="text-3xl font-extrabold mb-2 text-center">
                    Certificate of Completion
                </h1>

                <p className="text-center text-gray-600 mb-6">
                    This certifies that
                </p>

                <p className="text-center text-2xl font-semibold mb-8">
                    {username}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="p-4 bg-gray-50 rounded text-center">
                        <div className="text-sm text-gray-500">Score</div>
                        <div className="text-xl font-bold">{score} / {total}</div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded text-center">
                        <div className="text-sm text-gray-500">Percentage</div>
                        <div className="text-xl font-bold">{percentage}%</div>
                    </div>

                    <div className={`p-4 rounded text-center ${result === "PASS" ? "bg-green-50" : "bg-red-50"
                        }`}>
                        <div className="text-sm text-gray-500">Result</div>
                        <div className={`text-xl font-bold ${result === "PASS" ? "text-green-700" : "text-red-700"
                            }`}>
                            {result}
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-center gap-4">
                    <button
                        onClick={() => navigate("/quiz")}
                        className="px-4 py-2 border rounded"
                    >
                        Take Another Quiz
                    </button>
                    <button
                        onClick={() => navigate("/")}
                        className="px-4 py-2 border rounded"
                    >
                        Home
                    </button>
                </div>
            </div>
        </div>
    );



    return (
        <div ref={containerRef} className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <button onClick={onHome} className="text-sm text-brand-600 hover:underline">← Home</button>
                    <div className="flex items-center gap-3">
                        <button onClick={onCopyLink} className="px-3 py-2 rounded bg-white border shadow-sm text-sm">Copy link</button>
                        <button onClick={onPrint} className="px-4 py-2 rounded bg-gradient-to-r from-rose-400 to-orange-400 text-white shadow">Print / Save PDF</button>
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                    className="bg-white rounded-2xl shadow-lg p-8"
                >
                    <div className="grid md:grid-cols-3 gap-6 items-center">
                        {/* Badge / visual */}
                        <div className="flex flex-col items-center md:items-start">
                            <div className="rounded-full w-32 h-32 flex items-center justify-center bg-gradient-to-tr from-rose-400 to-orange-300 shadow-lg">
                                <div className="bg-white rounded-full w-28 h-28 flex items-center justify-center">
                                    <div className="text-3xl font-bold text-rose-500">✓</div>
                                </div>
                            </div>
                            <div className="mt-4 text-gray-600 text-sm">Certificate ID</div>
                            <div className="text-xs break-all text-gray-800 mt-1">{id || (row && row.id) || "—"}</div>
                        </div>

                        {/* Main info */}
                        <div className="md:col-span-2">
                            <h1 className="text-3xl font-extrabold text-gray-900">Certificate of Completion</h1>
                            <div className="text-gray-600 mt-2">This certifies that</div>
                            <div className="mt-4 text-2xl font-semibold">{username}</div>

                            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="p-4 bg-gray-50 rounded">
                                    <div className="text-sm text-gray-500">Score</div>
                                    <div className="text-xl font-semibold">{score != null && total != null ? `${score} / ${total}` : "—"}</div>
                                </div>

                                <div className="p-4 bg-gray-50 rounded">
                                    <div className="text-sm text-gray-500">Percentage</div>
                                    <div className="text-xl font-semibold">{percent != null ? `${percent}%` : "—"}</div>
                                </div>

                                <div className={`p-4 rounded ${passed === null ? "bg-gray-50" : passed ? "bg-green-50" : "bg-red-50"}`}>
                                    <div className="text-sm text-gray-500">Result</div>
                                    <div className={`text-xl font-semibold ${passed ? "text-green-700" : "text-red-700"}`}>{passed === null ? "—" : passed ? "PASS" : "NOT PASS"}</div>
                                </div>
                            </div>

                            {/* animated progress */}
                            <div className="mt-6">
                                <div className="text-sm text-gray-500 mb-2">Progress</div>
                                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                                    <motion.div
                                        className={`h-3 ${passed ? "bg-gradient-to-r from-green-400 to-green-600" : "bg-gradient-to-r from-rose-300 to-orange-400"}`}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${percent || 0}%` }}
                                        transition={{ duration: 1.1, ease: "easeOut" }}
                                    />
                                </div>
                            </div>

                            <div className="mt-6 text-sm text-gray-500">
                                {createdAt ? `Issued: ${niceDate(createdAt)}` : "Issued: —"}
                            </div>
                        </div>
                    </div>

                    {/* explanation / next actions */}
                    <div className="mt-8 border-t pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="text-sm text-gray-600">
                            {passed === null
                                ? "No score data available."
                                : passed
                                    ? "Congratulations — you have passed this section."
                                    : "You did not reach the pass threshold. Review the course and try again."}
                        </div>

                        <div className="flex gap-2">
                            <button onClick={() => navigate("/quiz")} className="px-4 py-2 rounded border bg-white">Take another quiz</button>
                            <button onClick={() => navigate("/")} className="px-4 py-2 rounded border bg-white">Home</button>
                        </div>
                    </div>
                </motion.div>

                {/* hidden container for confetti anchor */}
                <div ref={confettiRef} className="pointer-events-none fixed inset-0 z-40 overflow-hidden"></div>
            </div>

            {/* confetti styles (scoped) */}
            <style>{`
        .confetti-paper {
          position: absolute;
          top: 0;
          z-index: 9999;
          opacity: 0.9;
          will-change: transform, opacity;
          border-radius: 2px;
          transform-origin: center;
          left: 50%;
        }
        @media print {
          .confetti-paper { display: none !important; }
          button { display: none !important; }
        }
      `}</style>
        </div>
    );
}
