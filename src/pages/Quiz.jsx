// src/pages/Quiz.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function Quiz() {
    const [loading, setLoading] = useState(true);
    const [questions, setQuestions] = useState([]);
    const [index, setIndex] = useState(0);
    const [selected, setSelected] = useState(null);
    const [score, setScore] = useState(0);
    const [finished, setFinished] = useState(false);
    const [revealed, setRevealed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // focus ref for first option (keyboard friendliness)
    const firstOptionRef = useRef(null);

    // Get or create a per-session seed (so shuffle is reproducible for this visitor during this session)
    const seedRef = useRef(null);
    if (seedRef.current === null) {
        const existing = localStorage.getItem('quiz_seed');
        if (existing) seedRef.current = Number(existing) || Date.now();
        else {
            seedRef.current = Date.now() ^ Math.floor(Math.random() * 0xFFFFFF);
            try { localStorage.setItem('quiz_seed', String(seedRef.current)); } catch (e) { /* ignore */ }
        }
    }

    function vibrate(pattern) {
        if (typeof navigator !== "undefined" && navigator.vibrate) {
            navigator.vibrate(pattern);
        }
    }

    // read query params (category_id and level_id) to fetch filtered questions
    function getQsParams() {
        const q = new URLSearchParams(location.search);
        return {
            category_id: q.get('category_id'),
            level_id: q.get('level_id') || q.get('level_number')
        };
    }

    // -------------------------
    // Seeded random + shuffle utilities (LCG)
    // -------------------------
    function makeSeededRng(seed) {
        // simple LCG - deterministic for the same seed
        let t = seed % 2147483647;
        if (t <= 0) t += 2147483646;
        return function rnd() {
            t = (t * 48271) % 2147483647;
            return (t - 1) / 2147483646;
        };
    }

    // Fisher-Yates but optionally seeded (does not mutate incoming array)
    function shuffleArray(arr, seed = undefined) {
        const a = Array.isArray(arr) ? arr.slice() : [];
        if (typeof seed === 'number') {
            const rnd = makeSeededRng(seed);
            for (let i = a.length - 1; i > 0; i--) {
                const j = Math.floor(rnd() * (i + 1));
                [a[i], a[j]] = [a[j], a[i]];
            }
            return a;
        }
        // unseeded random
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    // rotate array (non-mutating)
    function rotateArray(arr, n) {
        const a = Array.isArray(arr) ? arr.slice() : [];
        if (!a.length) return a;
        const r = ((n % a.length) + a.length) % a.length;
        return a.slice(r).concat(a.slice(0, r));
    }

    // Shuffle options inside a question while preserving correct answer index
    function shuffleQuestionOptions(question, seedOffset = 0) {
        // defensive clone
        const opts = Array.isArray(question.options) ? question.options.slice() : [];
        const correctIdx = Number(question.answer ?? 0);

        // pair option text with flag if it is correct
        const paired = opts.map((text, i) => ({
            text,
            isCorrect: i === correctIdx
        }));

        // derive a per-question seed using base seed + question id/index + offset
        const baseSeed = seedRef.current || Date.now();
        // convert id to number for seed stability if possible
        const idNum = typeof question.id === 'number' ? question.id : (String(question.id).split('').reduce((s, c) => s + c.charCodeAt(0), 0) || 0);
        const qSeed = baseSeed + idNum + seedOffset;

        const shuffledPaired = shuffleArray(paired, qSeed);

        const newOptions = shuffledPaired.map(p => p.text);
        const newCorrectIndex = shuffledPaired.findIndex(p => p.isCorrect);

        return {
            ...question,
            options: newOptions,
            answer: newCorrectIndex === -1 ? 0 : newCorrectIndex
        };
    }

    useEffect(() => {
        async function load() {
            setLoading(true);

            // reset quiz state when params change
            setIndex(0);
            setSelected(null);
            setScore(0);
            setFinished(false);
            setRevealed(false);

            try {
                const { category_id, level_id } = getQsParams();

                // call server endpoint with query params if available
                const qparams = new URLSearchParams();
                // request limit and server shuffle (server may still return deterministic or non-deterministic)
                qparams.set('limit', '100');
                qparams.set('shuffle', '1');
                if (category_id) qparams.set('category_id', category_id);
                if (level_id) qparams.set('level_id', level_id);

                const url = `/api/questions?${qparams.toString()}`;

                const res = await fetch(url, {
                    credentials: "include"
                });

                if (!res.ok) {
                    const txt = await res.text().catch(() => '');
                    throw new Error(txt || `HTTP ${res.status}`);
                }
                const body = await res.json();
                const rows = Array.isArray(body) ? body : (Array.isArray(body?.questions) ? body.questions : []);

                const normalized = rows.map((q) => {
                    let opts = q.choices;
                    if (!Array.isArray(opts)) {
                        try { opts = opts ? JSON.parse(opts) : []; } catch (err) { opts = []; }
                    }
                    return {
                        id: q.id_uuid ?? q.id ?? (q.id_old ?? null),
                        title: q.q_text ?? q.title ?? q.question ?? 'Untitled question',
                        options: opts || [],
                        // ensure integer
                        answer: Number(q.correct_index ?? q.answer ?? 0),
                        explanation: q.explanation ?? '',
                    };
                });

                // Detect pathological data: all questions have the same correct index (commonly 0)
                const allSameIndex = normalized.length > 0 && normalized.every(q => Number(q.answer ?? 0) === Number(normalized[0].answer ?? 0));

                let preprocessed = normalized;

                if (allSameIndex) {
                    // deterministic per-question small rotation to move correct option away from the same slot
                    const baseSeed = seedRef.current || Date.now();
                    const rnd = makeSeededRng(baseSeed + 1234567);
                    preprocessed = normalized.map((q, idx) => {
                        const opts = Array.isArray(q.options) ? q.options.slice() : [];
                        if (!opts.length) return q;
                        // create paired to preserve correct flag
                        const paired = opts.map((text, i) => ({ text, isCorrect: i === Number(q.answer ?? 0) }));
                        // choose rotation deterministically
                        const rotation = Math.floor(rnd() * opts.length);
                        const rotatedPaired = rotateArray(paired, rotation);
                        const newOptions = rotatedPaired.map(p => p.text);
                        const newCorrect = rotatedPaired.findIndex(p => p.isCorrect);
                        return { ...q, options: newOptions, answer: newCorrect === -1 ? 0 : newCorrect };
                    });
                }

                // shuffle question order deterministically for this session using the seed
                const seed = seedRef.current || Date.now();
                const shuffledQuestions = shuffleArray(preprocessed, seed);

                // shuffle each question's options using a small offset so each question uses different subseed
                const seededQuestions = shuffledQuestions.map((qq, idx) => shuffleQuestionOptions(qq, idx + 1));

                setQuestions(seededQuestions);

                // after questions are loaded, focus the first option (small delay for DOM)
                setTimeout(() => {
                    if (firstOptionRef.current && typeof firstOptionRef.current.focus === 'function') {
                        firstOptionRef.current.focus();
                    }
                }, 50);

            } catch (err) {
                console.error('Quiz load error', err);
                setQuestions([]);
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [location.search]);

    function chooseOption(i) {
        if (revealed) return;
        setSelected(i);
    }

    async function submitResultToSupabase(username, scoreVal, total) {
        try {
            const score = Number(scoreVal);
            const totalQ = Number(total);
            const percentage = Math.round((score / totalQ) * 100);
            const result = percentage >= 60 ? "PASS" : "FAIL";

            const payload = {
                username: username || "guest",
                score,
                total: totalQ,
                percentage,
                result
            };

            const res = await fetch("/api/submit-result", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const txt = await res.text().catch(() => "");
                console.error("submit-result failed", res.status, txt);
                return { ok: false, error: txt || `HTTP ${res.status}` };
            }

            const json = await res.json();

            return {
                ok: true,
                certificateId: json.id || (json.row && json.row.id)
            };

        } catch (err) {
            console.error("submitResultToSupabase error", err);
            return { ok: false, error: err.message || String(err) };
        }
    }


    async function next() {
        if (selected == null) return;
        const q = questions[index];

        if (!revealed) {
            if (q && selected === q.answer) {
                setScore(s => s + 1);
                vibrate(40);              // ✅ correct answer haptic
            } else {
                vibrate([20, 30, 20]);    // ✅ wrong answer haptic
            }

            setRevealed(true);
            return;
        }

        setSelected(null);
        setRevealed(false);

        // move to next question
        if (index + 1 >= questions.length) {
            setFinished(true);

            let username = localStorage.getItem("username") || "guest";
            const resultResp = await submitResultToSupabase(username, score, questions.length);

            const certificateId = resultResp?.certificateId || "local";

            navigate(
                `/certificate` +
                `?score=${score}` +
                `&total=${questions.length}` +
                `&username=${encodeURIComponent(username)}`
            );


            return;
        }

        setIndex(i => {
            const nextIndex = i + 1;
            setTimeout(() => {
                if (firstOptionRef.current?.focus) {
                    firstOptionRef.current.focus();
                }
            }, 40);
            return nextIndex;
        });
    }

    if (loading) return <div className="p-8">Loading questions...</div>;
    if (!questions.length) return <div className="p-8">No questions found for this selection.</div>;

    const q = questions[index];

    return (
        <div className="max-w-3xl mx-auto p-6">
            <AnimatePresence mode="wait">
                <motion.div
                    key={q.id || index}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="bg-white rounded-xl shadow-sm border"
                >
                    {/* PROGRESS BAR */}
                    <div className="h-2 w-full bg-gray-100 rounded-t-xl overflow-hidden">
                        <div
                            className="h-full bg-brand-500 transition-all duration-300"
                            style={{
                                width: `${((index + 1) / questions.length) * 100}%`
                            }}
                        />
                    </div>

                    <div className="p-6">
                        {/* QUESTION META */}
                        <div className="flex justify-between items-center mb-4">
                            <div className="text-sm text-gray-500">
                                Question {index + 1} of {questions.length}
                            </div>
                            <div className="text-sm font-medium text-gray-600">
                                Score: {score}
                            </div>
                        </div>

                        {/* QUESTION */}
                        <h3 className="text-xl font-semibold text-gray-900 mb-6 leading-snug">
                            {q.title}
                        </h3>

                        {/* OPTIONS */}
                        <div className="space-y-3">
                            {q.options.map((opt, i) => {
                                const isSelected = selected === i;
                                const isCorrect = q.answer === i;

                                let classes =
                                    "block w-full text-left px-5 py-4 rounded-lg border transition focus:outline-none focus:ring-2 focus:ring-brand-500";

                                if (!revealed) {
                                    classes += isSelected
                                        ? " bg-brand-500 text-white border-brand-500"
                                        : " bg-gray-50 hover:bg-gray-100";
                                } else {
                                    if (isCorrect) {
                                        classes +=
                                            " bg-green-50 text-green-800 border-green-300";
                                    } else if (isSelected) {
                                        classes +=
                                            " bg-red-50 text-red-800 border-red-300";
                                    } else {
                                        classes += " bg-gray-50";
                                    }
                                }

                                return (
                                    <button
                                        key={`${q.id ?? index}-${i}`}
                                        ref={i === 0 ? firstOptionRef : null}
                                        onClick={() => {
                                            vibrate(10);       // light tap feedback
                                            chooseOption(i);
                                        }}
                                        disabled={revealed}
                                        className={`
    w-full text-left px-5 py-4 rounded-lg border transition-all
    active:scale-[0.98]

    ${!revealed
                                                ? selected === i
                                                    ? "border-brand-500 bg-brand-50"
                                                    : "border-gray-200 bg-white hover:bg-gray-50"
                                                : i === q.answer
                                                    ? "border-green-500 bg-green-50 text-green-800"
                                                    : selected === i
                                                        ? "border-red-500 bg-red-50 text-red-800"
                                                        : "border-gray-200 bg-gray-50"
                                            }
  `}
                                    >
                                        <div className="flex items-center gap-3">
                                            {/* Radio indicator */}
                                            <span
                                                className={`
        h-4 w-4 rounded-full border flex-shrink-0
        ${!revealed
                                                        ? selected === i
                                                            ? "bg-brand-500 border-brand-500"
                                                            : "border-gray-300"
                                                        : i === q.answer
                                                            ? "bg-green-500 border-green-500"
                                                            : selected === i
                                                                ? "bg-red-500 border-red-500"
                                                                : "border-gray-300"
                                                    }
      `}
                                            />

                                            {/* Option text */}
                                            <span className="font-medium">{opt}</span>
                                        </div>
                                    </button>

                                );
                            })}
                        </div>

                        {/* EXPLANATION */}
                        {revealed && q.explanation && (
                            <div className="mt-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
                                <div className="font-semibold text-blue-900 mb-1">
                                    Explanation
                                </div>
                                <p className="text-blue-800 text-sm leading-relaxed">
                                    {q.explanation}
                                </p>
                            </div>
                        )}

                        {/* ACTION */}
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={next}
                                disabled={selected == null}
                                className="px-6 py-2.5 rounded-lg bg-brand-500 text-white font-medium hover:bg-brand-600 disabled:opacity-50"
                            >
                                {!revealed
                                    ? index + 1 >= questions.length
                                        ? "Finish"
                                        : "Reveal Answer"
                                    : index + 1 >= questions.length
                                        ? "View Result"
                                        : "Next Question"}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
