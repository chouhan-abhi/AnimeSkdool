import React from "react";

const skeletonCards = Array.from({ length: 6 });

export default function PageLoader() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen  px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-4xl">
                {skeletonCards.map((_, idx) => (
                    <div
                        key={idx}
                        className="bg-gray-600 rounded-lg shadow-md p-4 animate-pulse flex flex-col"
                    >
                        <div className="h-40 bg-gray-700 rounded mb-4"></div>
                        <div className="h-6 bg-gray-800 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-900 rounded w-1/2"></div>
                    </div>
                ))}
            </div>
        </div>
    );
}