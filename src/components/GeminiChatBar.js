"use client";

import { useState } from "react";
import { Send, Sparkles } from "lucide-react";

export default function GeminiChatBar({
    initialPrompt = "",
    placeholder = "Ask Gemini...",
    suggestions = [],
    onPrompt
}) {
    const [prompt, setPrompt] = useState(initialPrompt);

    const handleSend = () => {
        if (onPrompt) {
            onPrompt(prompt);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            handleSend();
        }
    };

    return (
        <div className="w-full max-w-3xl mx-auto">
            <div className="relative">
                <div className="absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.2),transparent_70%)] blur-xl" />
                <div className="relative flex flex-wrap items-center gap-3 rounded-3xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 shadow-lg">
                    <span className="flex h-10 w-10 min-w-[40px] items-center justify-center rounded-full bg-[var(--surface-strong)] text-[var(--accent)]">
                        <Sparkles size={18} />
                    </span>
                    <input
                        value={prompt}
                        onChange={(event) => setPrompt(event.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        className="min-w-[140px] flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--page-muted)]"
                    />
                    <button
                        type="button"
                        onClick={handleSend}
                        className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[var(--accent-strong)]"
                    >
                        <Send size={14} /> Prompt
                    </button>
                </div>
            </div>
            {suggestions.length > 0 && (
                <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs text-[var(--page-muted)]">
                    {suggestions.map((suggestion) => (
                        <button
                            key={suggestion}
                            onClick={() => setPrompt(suggestion)}
                            className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 hover:bg-[var(--surface-muted)] transition-colors"
                        >
                            {suggestion}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
