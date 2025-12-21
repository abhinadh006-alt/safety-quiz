export default function Button({ children, className = "", ...props }) {
    return (
        <button
            {...props}
            className={
                "inline-flex items-center justify-center px-4 py-2 rounded-md font-medium shadow-sm " +
                "bg-gradient-to-r from-rose-400 to-orange-400 text-white " +
                className
            }
        >
            {children}
        </button>
    );
}
