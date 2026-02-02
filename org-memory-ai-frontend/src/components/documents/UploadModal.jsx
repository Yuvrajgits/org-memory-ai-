import * as React from "react"
import { X, Upload, FileText, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "../ui/Button"
import { cn } from "../../lib/utils"
import { uploadDocument } from "../../api/backend"

export function UploadModal({ isOpen, onClose }) {
    const [file, setFile] = React.useState(null)
    const [adminKey, setAdminKey] = React.useState("")
    const [status, setStatus] = React.useState("idle") // idle, uploading, success, error
    const [message, setMessage] = React.useState("")

    React.useEffect(() => {
        if (isOpen) {
            setFile(null)
            setAdminKey("")
            setStatus("idle")
            setMessage("")
        }
    }, [isOpen])

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
            setStatus("idle")
            setMessage("")
        }
    }

    const handleUpload = async () => {
        if (!file) return

        if (!adminKey.trim()) {
            setStatus("error")
            setMessage("Admin key is required")
            return
        }

        setStatus("uploading")
        try {
            await uploadDocument(file, adminKey)
            setStatus("success")
            setMessage("Document uploaded successfully!")
            setTimeout(() => {
                onClose()
            }, 1500)
        } catch (error) {
            console.error(error)
            setStatus("error")
            setMessage(error.message || "Failed to upload document")
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-background rounded-lg shadow-lg border p-6 m-4 animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Upload Document</h2>
                    <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <div className="space-y-4">
                    <div className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-accent/50 transition-colors relative">
                        <input
                            type="file"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            accept=".txt,.md,.pdf"
                        />
                        <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground pointer-events-none">
                            <Upload className="h-8 w-8 mb-2" />
                            <p className="text-sm font-medium">{file ? file.name : "Click or drag to select a file"}</p>
                            <p className="text-xs">Supported: PDF, TXT, MD</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="admin-key" className="text-sm font-medium">
                            Admin Key <span className="text-destructive">*</span>
                        </label>
                        <input
                            id="admin-key"
                            type="password"
                            value={adminKey}
                            onChange={(e) => setAdminKey(e.target.value)}
                            placeholder="Enter admin key"
                            className="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                    </div>

                    {status === "error" && (
                        <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-md">
                            <AlertCircle className="h-4 w-4" />
                            <span>{message}</span>
                        </div>
                    )}

                    {status === "success" && (
                        <div className="flex items-center gap-2 text-green-600 text-sm bg-green-100 dark:bg-green-900/30 p-3 rounded-md">
                            <CheckCircle className="h-4 w-4" />
                            <span>{message}</span>
                        </div>
                    )}

                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={onClose} disabled={status === "uploading"}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpload} disabled={!file || status === "uploading"}>
                            {status === "uploading" ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                "Upload"
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
