import { API_BASE } from "./config";

async function handleLogin() {
    const res = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, phone, experience })
    });

    const data = await res.json();
    localStorage.setItem("token", data.token);

    navigate("/quiz");
}
