// src/pages/SelectCategory.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function SelectCategory() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        let mounted = true;
        async function load() {
            setLoading(true);
            try {
                const res = await fetch("/api/categories");

                const json = await res.json();

                if (!res.ok) {
                    throw new Error(json?.error || "Failed to load categories");
                }

                // API returns array directly
                if (mounted) setCategories(Array.isArray(json) ? json : []);

            } catch (err) {
                console.error("load categories:", err);
                if (mounted) setCategories([]);
            } finally {
                if (mounted) setLoading(false);
            }
        }
        load();
        return () => { mounted = false; };
    }, []);

    function handleSelect(cat) {
        // go to level selection with category id and name
        const params = new URLSearchParams({ category_id: String(cat.id), category_name: cat.name });
        navigate(`/quiz/select-level?${params.toString()}`);
    }

    // framer motion variants
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.06 }
        }
    };
    const item = {
        hidden: { opacity: 0, y: 8, scale: 0.98 },
        show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 260, damping: 20 } }
    };

    return (
        <div className="max-w-6xl mx-auto p-8">
            <div className="bg-white p-8 rounded-xl shadow">
                <h1 className="text-3xl font-bold mb-2">Choose a category</h1>
                <p className="text-gray-600 mb-6">Select the topic you want to be quizzed on.</p>

                <div className="mb-6">
                    {loading && <div className="text-gray-500">Loading categories…</div>}
                </div>

                {!loading && (
                    <>
                        <motion.div
                            className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                            variants={container}
                            initial="hidden"
                            animate="show"
                        >
                            {categories.map((c) => (
                                <motion.button
                                    key={c.id}
                                    variants={item}
                                    onClick={() => handleSelect(c)}
                                    className="text-left p-4 rounded-lg border hover:shadow-lg hover:scale-[1.01] transition-transform bg-white flex flex-col justify-between"
                                    style={{ borderColor: "#eef2f6" }}
                                >
                                    <div>
                                        <div className="font-semibold text-lg text-gray-800">{c.name}</div>
                                        {c.description || c.summary ? (
                                            <div className="text-sm text-gray-500 mt-2">{c.description || c.summary}</div>
                                        ) : null}
                                    </div>

                                    <div className="mt-4 text-right">
                                        <span className="text-sm text-brand-500 font-medium">Select →</span>
                                    </div>
                                </motion.button>
                            ))}
                        </motion.div>

                        {/* bottom controls */}
                        <div className="mt-8 flex items-center justify-between">
                            <button className="px-4 py-2 rounded border" onClick={() => window.history.back()}>
                                Back
                            </button>
                            <div className="text-sm text-gray-500">
                                {categories.length} categories available
                            </div>
                        </div>
                    </>
                )}

                {!loading && !categories.length && (
                    <div className="text-gray-500">No categories found.</div>
                )}
            </div>
        </div>
    );
}
