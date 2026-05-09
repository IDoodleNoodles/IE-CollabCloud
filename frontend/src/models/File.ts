// File model based on CollabCloud Class Diagram
export interface File {
    fileID: string
    fileName: string
    fileType: string
    uploadDate: Date
}

export class FileModel implements File {
    fileID: string
    fileName: string
    fileType: string
    uploadDate: Date
    content: string
    dataUrl?: string

    constructor(fileID: string, fileName: string, fileType: string, dataUrl?: string) {
        this.fileID = fileID
        this.fileName = fileName
        this.fileType = fileType
        this.uploadDate = new Date()
        this.content = ''
        this.dataUrl = dataUrl
    }

    getFileID(): string {
        return this.fileID
    }

    setFileID(id: string): void {
        this.fileID = id
    }

    getFileName(): string {
        return this.fileName
    }

    setFileName(name: string): void {
        this.fileName = name
    }

    getFileType(): string {
        return this.fileType
    }

    setFileType(type: string): void {
        this.fileType = type
    }

    getUploadDate(): Date {
        return this.uploadDate
    }

    setUploadDate(date: Date): void {
        this.uploadDate = date
    }

    getContent(): string {
        return this.content
    }

    setContent(content: string): void {
        this.content = content
    }
}
