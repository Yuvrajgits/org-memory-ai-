import * as React from "react"
import { Send, Loader2 } from "lucide-react"
import { Textarea } from "../ui/Textarea"
import { Button } from "../ui/Button"

export function ChatInput({ isLoading, onSend }) {
    const [input, setInput] = React.useState("")
    const textareaRef = React.useRef(null)

    const handleSend = () => {
        if (input.trim() && !isLoading) {
            onSend(input)
            setInput("")
            // Reset height
            if (textareaRef.current) {
                textareaRef.current.style.height = "auto"
            }
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const handleInput = (e) => {
        setInput(e.target.value);
        // Auto-resize
        e.target.style.height = 'auto';
        e.target.style.height = e.target.scrollHeight + 'px';
    }

    return (
        <div className="max-w-3xl mx-auto w-full p-4 md:p-0">
            <div className="relative flex items-end w-full p-2 bg-background border rounded-xl shadow-md ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                <Textarea
                    ref={textareaRef}
                    tabIndex={0}
                    rows={1}
                    value={input}
                    onChange={handleInput}
                    onKeyDown={handleKeyDown}
                    placeholder="Send a message..."
                    className="min-h-[40px] max-h-[200px] w-full resize-none border-0 bg-transparent p-3 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none scrollbar-hide text-base"
                    disabled={isLoading}
                />
                <Button
                    disabled={isLoading || !input.trim()}
                    size="icon"
                    onClick={handleSend}
                    className="mb-1 mr-1 shrink-0"
                >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
            </div>
            <div className="px-2 py-2 text-center text-xs text-muted-foreground">
                AI can make mistakes. Please check important information.
            </div>
        </div>
    )
}
