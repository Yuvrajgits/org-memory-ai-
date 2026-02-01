import * as React from "react"
import { ChatMessage } from "./ChatMessage"
import { ChatInput } from "./ChatInput"

export function ChatContainer({ messages, isLoading, onSend }) {
    const messagesEndRef = React.useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    React.useEffect(() => {
        scrollToBottom()
    }, [messages])

    return (
        <div className="flex flex-col h-full w-full">
            <div className="flex-1 overflow-y-auto w-full">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                        <h2 className="text-2xl font-bold mb-2 text-foreground">Org Memory AI</h2>
                        <p>Ask anything about your organization's documents.</p>
                    </div>
                ) : (
                    <div className="flex flex-col pb-32">
                        {messages.map((msg, index) => (
                            <ChatMessage key={index} message={msg} />
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            <div className="dark:bg-transparent absolute bottom-0 left-0 w-full bg-gradient-to-t from-background via-background to-transparent pt-10 pb-6">
                {/* Uses absolute positioning to float above chat */}
                <ChatInput isLoading={isLoading} onSend={onSend} />
            </div>
        </div>
    )
}
