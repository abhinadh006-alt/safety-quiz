import { useNavigate } from "react-router-dom";

export default function Header() {
    const navigate = useNavigate();

    async function handleDevLogin() {
        try {
            const res = await fetch("/api/dev-login", {
                method: "POST",
                credentials: "include", // IMPORTANT
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Dev login failed");

            navigate("/quiz/select-category");
        } catch (err) {
            console.error(err);
            alert("Dev login failed");
        }
    }

    return (
        <header className="bg-white shadow-sm">
            <div className="max-w-6xl mx-auto p-4 flex justify-between items-center">
                <h1 className="font-bold">Safety Quiz</h1>

                <button
                    onClick={handleDevLogin}
                    className="px-4 py-2 rounded bg-orange-500 text-white"
                >
                    DEV LOGIN
                </button>
            </div>
        </header>
    );
}
