import { Sidebar } from "./Sidebar"

export function MainLayout({ children }) {
    return (
        <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
            <div className="hidden md:flex flex-col">
                <Sidebar className="h-full" />
            </div>
            <main className="flex-1 w-full h-full flex flex-col overflow-hidden relative">
                {children}
            </main>
        </div>
    )
}
