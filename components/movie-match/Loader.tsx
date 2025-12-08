import React, { useState, useEffect } from "react";

const Loader: React.FC = () => {
    const messages = [
        "Analyzing your all-time favorites...",
        "Searching the galaxy of movies...",
        "Finding your next favorite movie...",
        "Almost there, picking the perfect flick..."
    ];

    const [currentMessage, setCurrentMessage] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentMessage((prev) => (prev + 1) % messages.length);
        }, 5000); // Change message every 2.5 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-t-violet-500 border-slate-600 rounded-full animate-spin"></div>
            <p className="text-slate-400 text-center">{messages[currentMessage]}</p>
        </div>
    );
};

export default Loader;
