import { useState } from "react"
import { askQuestion } from "../api/backend"

export function useChat() {
    const [messages, setMessages] = useState([])
    const [isLoading, setIsLoading] = useState(false)

    const ask = async (question) => {
        if (!question.trim()) return

        setIsLoading(true)
        const userMessage = { role: "user", content: question }
        setMessages((prev) => [...prev, userMessage])

        try {
            const data = await askQuestion(question)

            const aiMessage = {
                role: "assistant",
                content: data.answer,
                confidence: data.confidence,
                sources: data.sources_used
            }
            setMessages((prev) => [...prev, aiMessage])
        } catch (error) {
            console.error(error)
            setMessages((prev) => [...prev, {
                role: "assistant",
                content: "Sorry, I encountered an error while processing your request.",
                error: error.message
            }])
        } finally {
            setIsLoading(false)
        }
    }

    return { messages, isLoading, ask }
}
