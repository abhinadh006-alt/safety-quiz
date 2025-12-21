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

    // read query params (category_id and level_id) to fetch filtered questions
    function getQsParams() {
        const q = new URLSearchParams(location.search);
        return {
            category_id: q.get('category_id'),
            level_id: q.get('level_id')
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
            const payload = { username: username || 'guest', score: Number(scoreVal), total: Number(total) };
            const res = await fetch('/api/submit-result', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!res.ok) {
                const txt = await res.text().catch(() => '');
                console.error('submit-result failed', res.status, txt);
                return { ok: false, error: txt || `HTTP ${res.status}` };
            }
            const json = await res.json();
            return { ok: true, id: json.id || (json.row && json.row.id) };
        } catch (err) {
            console.error('submitResultToSupabase error', err);
            return { ok: false, error: err.message || String(err) };
        }
    }

    async function next() {
        if (selected == null) return;
        const q = questions[index];

        if (!revealed) {
            if (q && selected === q.answer) setScore(s => s + 1);
            setRevealed(true);
            return;
        }

        setSelected(null);
        setRevealed(false);

        // move to next question
        if (index + 1 >= questions.length) {
            setFinished(true);
            let username = localStorage.getItem('username') || 'guest';
            const resultResp = await submitResultToSupabase(username, score, questions.length);
            if (resultResp && resultResp.ok && resultResp.id) {
                navigate(`/certificate?id=${encodeURIComponent(resultResp.id)}`);
            } else {
                navigate(`/certificate?score=${score}&total=${questions.length}&username=${encodeURIComponent(username)}`);
            }
            return;
        }

        setIndex(i => {
            const nextIndex = i + 1;
            // focus first option of next question (after small delay to allow render)
            setTimeout(() => {
                if (firstOptionRef.current && typeof firstOptionRef.current.focus === 'function') {
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
        <div className="max-w-3xl mx-auto p-8">
            <AnimatePresence mode="wait">
                <motion.div
                    key={q.id || index}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.28 }}
                    className="bg-white p-6 rounded shadow"
                >
                    <div className="text-sm text-gray-500 mb-3">Question {index + 1} / {questions.length}</div>
                    <h3 className="text-xl font-semibold mb-6 text-gray-900">{q.title}</h3>

                    <div className="space-y-3" role="list">
                        {q.options.map((opt, i) => {
                            const isSelected = selected === i;
                            const isCorrect = q.answer === i;
                            let classes = 'block w-full text-left p-4 rounded border transition-colors focus:outline-none';
                            if (!revealed) {
                                classes += isSelected
                                    ? ' bg-brand-500 text-white border-brand-500'
                                    : ' bg-gray-50 text-gray-900 hover:bg-gray-100';
                            } else {
                                if (isCorrect) {
                                    classes += ' bg-green-100 text-green-800 border-green-200';
                                } else if (isSelected && !isCorrect) {
                                    classes += ' bg-red-100 text-red-800 border-red-200';
                                } else {
                                    classes += ' bg-gray-50 text-gray-900';
                                }
                            }

                            // attach ref to first option for focus management
                            const btnRef = (i === 0) ? firstOptionRef : null;

                            return (
                                <button
                                    key={`${q.id ?? index}-${i}`}
                                    ref={btnRef}
                                    onClick={() => chooseOption(i)}
                                    className={classes}
                                    disabled={revealed}
                                    aria-pressed={isSelected}
                                    aria-label={`Option ${i + 1}`}
                                >
                                    {opt}
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={next}
                            className="px-4 py-2 rounded bg-brand-500 text-white disabled:opacity-60"
                            disabled={selected == null}
                        >
                            {!revealed ? (index + 1 >= questions.length ? 'Finish (reveal)' : 'Next (reveal)') : (index + 1 >= questions.length ? 'Finish' : 'Continue')}
                        </button>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
