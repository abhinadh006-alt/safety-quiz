// top of file (near other imports)
const API_BASE = import.meta.env.VITE_API_BASE ?? ''; // will be '' (same origin) if not set

useEffect(() => {
    // Use relative path if no VITE_API_BASE, else use the env var
    const base = API_BASE || '';
    fetch(`${base}/api/questions`)
        .then(r => {
            if (!r.ok) throw new Error('Failed to fetch questions: ' + r.status);
            return r.json();
        })
        .then(setQuestions)
        .catch(err => {
            console.error('Questions fetch error', err);
            // optional: show UI message
        });
}, []);
