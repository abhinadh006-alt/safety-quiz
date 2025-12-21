import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

// Default export React component (Tailwind-first design)
// Uses an uploaded image as decorative hero background. File URL (local upload):
// /mnt/data/Screenshot 2025-11-18 022741.png

export default function SafetyQuizUI() {
    // Mock quiz data (replace with real API)
    const questions = [
        {
            id: 1,
            q: 'What is the safe way to lift a heavy object?',
            choices: [
                'Bend your back and lift quickly',
                'Keep knees bent, back straight, lift with legs',
                'Twist while lifting to get leverage',
                'Ask someone else to do it all the time',
            ],
            answer: 1,
            time: 30,
        },
        {
            id: 2,
            q: 'Which fire extinguisher is for electrical fires?',
            choices: ['Water', 'Foam', 'CO2', 'Wet chemical'],
            answer: 2,
            time: 20,
        },
    ]

    const [index, setIndex] = useState(0)
    const [selected, setSelected] = useState(null)
    const [score, setScore] = useState(0)
    const [timeLeft, setTimeLeft] = useState(questions[0].time)
    const [showSummary, setShowSummary] = useState(false)

    useEffect(() => {
        setSelected(null)
        setTimeLeft(questions[index].time)
    }, [index])

    useEffect(() => {
        if (showSummary) return
        if (timeLeft <= 0) {
            handleNext()
            return
        }
        const t = setInterval(() => setTimeLeft((s) => s - 1), 1000)
        return () => clearInterval(t)
    }, [timeLeft, showSummary])

    function handleSelect(i) {
        setSelected(i)
    }

    function handleNext() {
        const q = questions[index]
        if (selected === q.answer) setScore((s) => s + 1)
        if (index + 1 < questions.length) setIndex((i) => i + 1)
        else setShowSummary(true)
    }

    function handleRestart() {
        setIndex(0)
        setSelected(null)
        setScore(0)
        setShowSummary(false)
        setTimeLeft(questions[0].time)
    }

    // UI pieces
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            {/* Top nav */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button className="p-2 rounded-md hover:bg-slate-100">☰</button>
                        <div className="text-lg font-semibold">Safety Quiz</div>
                        <div className="hidden md:block text-sm text-slate-500">Clean, fast safety training for frontline teams</div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-sm text-slate-600">Candidate: <span className="font-medium">Abhinadh</span></div>
                        <button className="bg-indigo-600 text-white px-3 py-1 rounded-md text-sm">Profile</button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Left column — sidebar */}
                <aside className="md:col-span-3">
                    <div className="rounded-2xl overflow-hidden shadow bg-white">
                        <div className="relative h-36">
                            <img src="/mnt/data/Screenshot 2025-11-18 022741.png" alt="hero" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                            <div className="absolute bottom-3 left-4 text-white">
                                <div className="font-semibold">Safety Crew India</div>
                                <div className="text-xs opacity-90">Quiz: Electrical Safety — Beginner</div>
                            </div>
                        </div>

                        <div className="p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-xs text-slate-500">Progress</div>
                                    <div className="text-lg font-medium">{index + 1} / {questions.length}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-slate-500">Score</div>
                                    <div className="text-lg font-semibold">{score}</div>
                                </div>
                            </div>

                            <div>
                                <div className="text-xs text-slate-500">Time for this question</div>
                                <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
                                    <div className="bg-emerald-500 h-2 rounded-full transition-all" style={{ width: `${(timeLeft / questions[index].time) * 100}%` }} />
                                </div>
                                <div className="mt-2 text-xs text-slate-600">{timeLeft}s remaining</div>
                            </div>

                            <div className="pt-2">
                                <button onClick={() => setShowSummary(true)} className="w-full py-2 px-3 rounded-md border border-slate-200 text-sm">End Quiz</button>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 p-3 rounded-lg bg-white shadow">
                        <h4 className="text-sm font-semibold mb-2">Tips</h4>
                        <ul className="text-sm text-slate-600 space-y-2">
                            <li>Read question carefully.</li>
                            <li>Use the timer — each question has a limit.</li>
                            <li>Correct answers increase score.</li>
                        </ul>
                    </div>
                </aside>

                {/* Right column — quiz area */}
                <section className="md:col-span-9">
                    {!showSummary ? (
                        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-white shadow p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <div className="text-xs text-slate-500">Question</div>
                                    <h2 className="text-xl font-semibold">{questions[index].q}</h2>
                                </div>
                                <div className="text-sm text-slate-500">Question ID: {questions[index].id}</div>
                            </div>

                            <div className="grid gap-3">
                                {questions[index].choices.map((c, i) => {
                                    const isSelected = selected === i
                                    return (
                                        <button key={i} onClick={() => handleSelect(i)} className={`text-left p-4 rounded-lg border ${isSelected ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-white'} hover:shadow`}>
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-600'}`}>{String.fromCharCode(65 + i)}</div>
                                                <div className="text-sm">{c}</div>
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>

                            <div className="mt-6 flex items-center justify-between">
                                <div className="text-sm text-slate-600">Selected: {selected !== null ? String.fromCharCode(65 + selected) : '—'}</div>
                                <div className="flex items-center gap-3">
                                    <button onClick={handleNext} className="px-4 py-2 bg-emerald-600 text-white rounded-md">Next</button>
                                    <button onClick={() => { setSelected(null) }} className="px-3 py-2 border rounded-md">Clear</button>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl bg-white shadow p-6">
                            <h3 className="text-lg font-semibold mb-2">Quiz Summary</h3>
                            <div className="text-sm text-slate-600 mb-4">You scored <span className="font-semibold">{score}</span> out of {questions.length}</div>

                            <div className="space-y-3">
                                {questions.map((q) => (
                                    <div key={q.id} className="p-3 border rounded-md">
                                        <div className="text-sm font-medium">{q.q}</div>
                                        <div className="mt-2 text-sm text-slate-600">Correct: {String.fromCharCode(65 + q.answer)}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 flex gap-3">
                                <button onClick={handleRestart} className="px-4 py-2 bg-indigo-600 text-white rounded-md">Restart</button>
                                <button className="px-4 py-2 border rounded-md">Download Results</button>
                            </div>
                        </motion.div>
                    )}
                </section>
            </main>

            <footer className="max-w-7xl mx-auto px-4 py-6 text-sm text-slate-500">Built with care • Safety Crew India</footer>
        </div>
    )
}
