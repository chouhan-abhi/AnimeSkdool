   export const Badge = ({ children, className = "" }) => (
        <span
            className={`border border-[var(--primary-color)] text-center px-2 py-1 rounded-lg transition hover:bg-[var(--primary-color)] cursor-pointer ${className}`}
        >
            {children}
        </span>
    );

export default Badge;