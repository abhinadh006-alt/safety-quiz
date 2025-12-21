// src/pages/Leaderboard.jsx
import React, { useEffect, useState } from 'react';

export default function Leaderboard() {
    const [loading, setLoading] = useState(true);
    const [rows, setRows] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function load() {
            setLoading(true);
            try {
                const res = await fetch('/api/leaderboard');
                if (!res.ok) {
                    const txt = await res.text();
                    throw new Error(txt || `HTTP ${res.status}`);
                }
                const data = await res.json();
                const results = Array.isArray(data?.results) ? data.results : (Array.isArray(data) ? data : []);
                setRows(results);
            } catch (err) {
                console.error('Leaderboard fetch error', err);
                setError(err.message || 'Failed to load leaderboard');
                setRows([]);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    if (loading) return <div className="p-8">Loading leaderboard...</div>;
    if (error) return <div className="p-8 text-red-600">Error: {error}</div>;
    if (!rows.length) return <div className="p-8">No leaderboard entries yet.</div>;

    return (
        <div className="p-8 max-w-3xl mx-auto">
            <ol className="space-y-2">
                {rows.map((r, i) => (
                    <li key={r.id || i} className="bg-white p-4 rounded shadow">
                        <div className="flex justify-between">
                            <div>{r.username}</div>
                            <div>{r.score}/{r.total}</div>
                        </div>
                    </li>
                ))}
            </ol>
        </div>
    );
}
