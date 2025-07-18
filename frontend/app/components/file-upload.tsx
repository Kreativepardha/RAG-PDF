'use client'
import { FileUpload } from "@/components/ui/file-upload"
import { useState } from "react"



const FileUploadComponent: React.FC = ()  => {
    const [files, setFiles] = useState<File[]>([])
   
    const handleFileUpload = (files: File[]) => {
        const pdfFiles = files.filter(file => file.type === 'application/pdf')
        setFiles(pdfFiles);
        console.log("Files uploaded:", pdfFiles);
    }
    return (
        <div className="w-full max-w-4xl mx-auto min-h-96  justify-center border border-dashed bg-yellow-100 dark:bg-black border-neutral-200 dark:border-neutral-800 rounded-lg">
            <FileUpload onChange={handleFileUpload}  />
        </div>
    )
}


export default FileUploadComponent