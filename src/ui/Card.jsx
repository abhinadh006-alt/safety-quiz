export default function Card({ children, className = "" }) {
    return (
        <div className={"bg-white rounded-lg p-4 shadow-sm " + className}>
            {children}
        </div>
    );
}
