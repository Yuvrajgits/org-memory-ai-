import { MainLayout } from "../components/layout/MainLayout"
import { ChatContainer } from "../components/chat/ChatContainer"
import { useChat } from "../hooks/useChat"

export function ChatPage() {
    const { messages, isLoading, ask } = useChat()

    return (
        <MainLayout>
            <ChatContainer
                messages={messages}
                isLoading={isLoading}
                onSend={ask}
            />
        </MainLayout>
    )
}
