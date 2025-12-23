// src/pages/SelectLevel.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

export default function SelectLevel() {
    const q = useQuery();
    const category_id = q.get("category_id");
    const category_name = q.get("category_name") || "";
    const navigate = useNavigate();

    const [levels, setLevels] = useState([]);
    const [loading, setLoading] = useState(true);

    if (!category_id) {
        return <div className="p-8">Invalid category.</div>;
    }

    useEffect(() => {
        let mounted = true;

        async function load() {
            setLoading(true);
            try {
                const res = await fetch(`/api/levels?category_id=${category_id}`);
                const json = await res.json();

                if (!res.ok || !json.ok) {
                    throw new Error(json?.error || "Failed to load levels");
                }

                if (mounted) setLevels(json.levels || []);
            } catch (err) {
                console.error("load levels:", err);
                if (mounted) setLevels([]);
            } finally {
                if (mounted) setLoading(false);
            }
        }

        load();
        return () => (mounted = false);
    }, [category_id]);


    function start(level) {
        const params = new URLSearchParams({
            category_id: String(category_id),
            level_id: String(level.id)
        });
        navigate(`/quiz?${params.toString()}`);
    }

    const container = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.06 } }
    };

    const item = {
        hidden: { opacity: 0, y: 8 },
        show: {
            opacity: 1,
            y: 0,
            transition: { type: "spring", stiffness: 260, damping: 20 }
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-8">
            <div className="bg-white p-8 rounded-xl shadow">
                <h1 className="text-3xl font-bold mb-1">Pick a level</h1>
                <div className="text-gray-600 mb-6">
                    Category: <span className="font-semibold">{category_name}</span>
                </div>

                {loading && <div className="text-gray-500 mb-4">Loading levels…</div>}

                {!loading && (
                    <motion.div
                        className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                        variants={container}
                        initial="hidden"
                        animate="show"
                    >
                        {levels.map((lev) => (
                            <motion.div
                                key={lev.id}
                                variants={item}
                                className="p-4 rounded-lg border bg-white"
                            >
                                <div className="font-semibold text-lg">{lev.name}</div>
                                <div className="mt-4 flex justify-between items-center">
                                    <button
                                        onClick={() => start(lev)}
                                        className="px-3 py-2 rounded bg-brand-500 text-white"
                                    >
                                        Start
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                <div className="mt-8 flex justify-between">
                    <button
                        className="px-4 py-2 rounded border"
                        onClick={() => navigate("/quiz/select-category")}
                    >
                        Back
                    </button>
                    <button
                        className="px-4 py-2 rounded border"
                        onClick={() => navigate("/")}
                    >
                        Home
                    </button>
                </div>
            </div>
        </div>
    );
}
