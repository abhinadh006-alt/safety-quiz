// src/pages/Certificate.jsx
import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

/**
 * Certificate page
 *
 * - Accepts ?id=<result_id> OR ?score=<n>&total=<m>&username=<name>
 * - Tries to fetch /api/result?id=... (server endpoint) if id provided.
 * - Provides print/export button (use browser Print -> Save as PDF).
 * - Small, dependency-free confetti animation runs when score >= passThreshold.
 */

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

function niceDate(ts) {
    try {
        const d = new Date(ts);
        return d.toLocaleString();
    } catch (e) {
        return String(ts);
    }
}

function smallConfetti(containerEl, count = 80) {
    if (!containerEl) return;
    // create lightweight confetti particles as <span> elements
    const particles = [];
    for (let i = 0; i < count; i++) {
        const el = document.createElement("span");
        el.className = "confetti-paper";
        // randomize
        const size = 6 + Math.floor(Math.random() * 10);
        el.style.width = `${size}px`;
        el.style.height = `${size * 1.4}px`;
        el.style.left = `${Math.random() * 100}%`;
        el.style.background = [
            "#FF7A59",
            "#FFD166",
            "#4ADE80",
            "#60A5FA",
            "#A78BFA",
            "#FB7185",
        ][Math.floor(Math.random() * 6)];
        el.style.opacity = String(0.9 + Math.random() * 0.2);
        const delay = Math.random() * 0.6;
        el.style.transition = `transform 1.6s ${delay}s cubic-bezier(.17,.67,.3,1), opacity 1.6s ${delay}s`;
        containerEl.appendChild(el);
        particles.push(el);

        // trigger transform in next tick
        requestAnimationFrame(() => {
            const tx = -50 + Math.random() * 100; // horizontal drift
            const ty = 200 + Math.random() * 300; // fall
            const rz = -720 + Math.random() * 1440; // rotate
            el.style.transform = `translate(${tx}px, ${ty}px) rotate(${rz}deg)`;
            el.style.opacity = "0";
        });
    }

    // cleanup after animation
    setTimeout(() => {
        particles.forEach((p) => p.remove());
    }, 2600);
}

export default function Certificate() {
    const q = useQuery();
    const navigate = useNavigate();
    const containerRef = useRef(null);
    const confettiRef = useRef(null);

    const id = q.get("id");
    const qpScore = q.get("score");
    const qpTotal = q.get("total");
    const qpName = q.get("username") || q.get("name");

    const [loading, setLoading] = useState(Boolean(id));
    const [row, setRow] = useState(null);
    const [error, setError] = useState(null);

    // default pass threshold (you can vary per level)
    const passThreshold = 60;

    useEffect(() => {
        async function fetchRow() {
            if (!id) return setLoading(false);
            setLoading(true);
            try {
                const res = await fetch(`/api/result?id=${encodeURIComponent(id)}`);
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                }
                const json = await res.json();
                // server may return { row } or raw object
                const r = json?.row ?? json;
                setRow(r || null);
            } catch (err) {
                console.warn("Certificate fetch failed", err);
                setError("Could not fetch certificate data (server). Showing fallback.");
                setRow(null);
            } finally {
                setLoading(false);
            }
        }
        fetchRow();
    }, [id]);

    // determine data to present (row from server preferred)
    const username = row?.username || qpName || "Guest";
    const score = row?.score != null ? Number(row.score) : qpScore ? Number(qpScore) : null;
    const total = row?.total != null ? Number(row.total) : qpTotal ? Number(qpTotal) : null;
    const createdAt = row?.created_at || row?.createdAt || (row?.created ? row.created : null);

    const percent = (score != null && total) ? Math.round((score / total) * 100) : null;
    const passed = percent != null ? percent >= passThreshold : null;

    // confetti when certificate loads and passed
    useEffect(() => {
        if (percent != null && passed) {
            // use container element for confetti anchors
            const el = confettiRef.current || containerRef.current;
            smallConfetti(el, 80);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [percent, passed]);

    function onPrint() {
        window.print();
    }

    function onCopyLink() {
        const url = window.location.href;
        navigator.clipboard?.writeText(url).then(() => {
            // tiny visual confirmation
            alert("Certificate link copied to clipboard");
        }).catch(() => {
            alert("Copy failed — please select and copy the URL manually.");
        });
    }

    function onHome() {
        navigate("/");
    }

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
