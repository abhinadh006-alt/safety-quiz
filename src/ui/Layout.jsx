import Header from "../components/Header";

export default function Layout({ children }) {
    return (
        <div className="app-root min-h-screen bg-gray-50">
            <Header />
            <main className="max-w-5xl mx-auto p-6">{children}</main>
        </div>
    );
}
