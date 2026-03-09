const QUICK_MESSAGES = [
    "hi",
    "balanced",
    "yes",
    "withdraw",
    "all",
    "200",
    "confirm",
    "cancel",
    "help",
];

const BOT_REPLIES = [
    "✅ Withdrawal Complete! 200 USDC sent.",
    "⏳ Processing withdrawal...",
    "❌ Insufficient balance",
];

interface QuickActionsProps {
    onQuickMessage: (text: string) => void;
    onBotReply: (text: string) => void;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <p className="text-[11px] font-semibold text-[#3d6b52] tracking-widest uppercase mb-2.5">
            {children}
        </p>
    );
}

function QuickButton({ label, color, onClick }: { label: string; color: string; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="quick-btn"
            style={{ color }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = color)}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#1e3a2e")}
        >
            {label}
        </button>
    );
}

export function QuickActions({ onQuickMessage, onBotReply }: QuickActionsProps) {
    return (
        <>
            <div className="p-4 border-b border-[#1a2e22]">
                <SectionLabel>Quick Test Messages</SectionLabel>
                {QUICK_MESSAGES.map((cmd) => (
                    <QuickButton key={cmd} label={cmd} color="#86b09a" onClick={() => onQuickMessage(cmd)} />
                ))}
            </div>
            <div className="p-4 border-b border-[#1a2e22]">
                <SectionLabel>Simulate Bot Reply</SectionLabel>
                {BOT_REPLIES.map((reply) => (
                    <QuickButton key={reply} label={reply} color="#4ade80" onClick={() => onBotReply(reply)} />
                ))}
            </div>
        </>
    );
}