   export const Badge = ({ children, className = "" }) => (
        <span
            className={`bg-gray-700 text-gray-200 px-2 py-1 rounded-full text-xs ${className}`}
        >
            {children}
        </span>
    );
