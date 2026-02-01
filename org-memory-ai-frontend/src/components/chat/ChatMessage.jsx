import Markdown from "react-markdown"
import { User, Sparkles, Copy, ThumbsUp, ThumbsDown } from "lucide-react"
import { cn } from "../../lib/utils"
import { Button } from "../ui/Button"

export function ChatMessage({ message }) {
    const isUser = message.role === "user"

    return (
        <div className={cn(
            "group w-full text-gray-800 dark:text-gray-100 border-b border-black/5 dark:border-white/5",
            isUser ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-[#444654]"
        )}>
            <div className="text-base gap-4 md:gap-6 md:max-w-2xl lg:max-w-[38rem] xl:max-w-3xl p-4 md:py-6 flex lg:px-0 m-auto">
                <div className="w-[30px] flex flex-col relative items-end">
                    <div className={cn(
                        "relative h-[30px] w-[30px] p-1 rounded-sm text-white flex items-center justify-center shadow-sm",
                        isUser ? "bg-zinc-700" : "bg-green-600"
                    )}>
                        {isUser ? <User className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
                    </div>
                </div>
                <div className="relative flex-1 overflow-hidden">
                    <div className="prose prose-zinc dark:prose-invert min-w-full leading-relaxed break-words">
                        {!isUser && !message.content ? (
                            <span className="animate-pulse flex gap-1 items-center font-medium text-muted-foreground">Thinking...</span>
                        ) : (
                            <Markdown components={{
                                pre: ({ node, ...props }) => <div className="overflow-auto w-full my-2 bg-black/10 dark:bg-black/30 p-2 rounded-lg" {...props} />,
                                code: ({ node, inline, ...props }) =>
                                    inline
                                        ? <code className="bg-black/10 dark:bg-black/30 py-0.5 px-1 rounded-md font-mono text-sm" {...props} />
                                        : <code className="block bg-transparent p-0 text-sm font-mono" {...props} />
                            }}>
                                {message.content}
                            </Markdown>
                        )}
                    </div>
                    {!isUser && !message.error && message.content && (
                        <div className="flex items-center justify-between mt-2 pt-2">
                            {message.confidence && (
                                <div className="text-xs text-muted-foreground flex items-center gap-2">
                                    <span className="font-medium">Confidence:</span>
                                    <span className={cn(
                                        "px-1.5 py-0.5 rounded text-[10px] font-bold uppercase",
                                        message.confidence === "High" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                                            message.confidence === "Medium" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" :
                                                "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                    )}>
                                        {message.confidence}
                                    </span>
                                    {message.sources && message.sources.length > 0 && (
                                        <>
                                            <span className="text-muted-foreground/40">|</span>
                                            <span className="font-medium">Sources: {message.sources.length} refs</span>
                                        </>
                                    )}
                                </div>
                            )}
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground">
                                    <Copy className="h-3 w-3" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground">
                                    <ThumbsUp className="h-3 w-3" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground">
                                    <ThumbsDown className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                    )}
                    {message.error && (
                        <div className="mt-2 text-red-500 text-sm font-medium">
                            Error: {message.error}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
