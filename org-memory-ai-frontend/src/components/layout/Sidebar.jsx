import * as React from "react"
import { Plus, MessageSquare, Settings, LogOut, Upload as UploadIcon } from "lucide-react"
import { Button } from "../ui/Button"
import { cn } from "../../lib/utils"
import { UploadModal } from "../documents/UploadModal"

export function Sidebar({ className }) {
    const [isUploadOpen, setIsUploadOpen] = React.useState(false)

    return (
        <>
            <div className={cn("pb-12 h-screen w-64 bg-secondary/20 border-r flex flex-col", className)}>
                <div className="space-y-4 py-4 flex-1">
                    <div className="px-3 py-2 space-y-2">
                        <Button variant="secondary" className="w-full justify-start gap-2 shadow-sm border border-input bg-background hover:bg-accent">
                            <Plus className="h-4 w-4" />
                            New Chat
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full justify-start gap-2 shadow-sm bg-background hover:bg-accent"
                            onClick={() => setIsUploadOpen(true)}
                        >
                            <UploadIcon className="h-4 w-4" />
                            Upload Document
                        </Button>
                    </div>
                    <div className="px-3 py-2">
                        <h2 className="mb-2 px-4 text-xs font-semibold tracking-tight text-muted-foreground uppercase">
                            History
                        </h2>
                        <div className="space-y-1">
                            <Button variant="ghost" className="w-full justify-start gap-2 font-normal truncate">
                                <MessageSquare className="h-4 w-4 shrink-0" />
                                <span className="truncate">Production Readiness Plan</span>
                            </Button>
                            <Button variant="ghost" className="w-full justify-start gap-2 font-normal truncate">
                                <MessageSquare className="h-4 w-4 shrink-0" />
                                <span className="truncate">Explain Quantum Physics</span>
                            </Button>
                        </div>
                    </div>
                </div>
                <div className="p-4 border-t bg-secondary/10">
                    <div className="space-y-1">
                        <Button variant="ghost" className="w-full justify-start gap-2">
                            <Settings className="h-4 w-4" />
                            Settings
                        </Button>
                        <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive">
                            <LogOut className="h-4 w-4" />
                            Sign Out
                        </Button>
                    </div>
                </div>
            </div>
            <UploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
        </>
    )
}
