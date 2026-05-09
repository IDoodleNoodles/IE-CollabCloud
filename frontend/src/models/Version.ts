// Version model based on CollabCloud Class Diagram
export interface Version {
    versionID: string
    commitMessage: string
    timestamp: Date
}

export class VersionModel implements Version {
    versionID: string
    commitMessage: string
    timestamp: Date
    content: string
    author: string
    projectID: string
    fileID: string

    constructor(
        versionID: string, 
        projectID: string,
        fileID: string,
        content: string, 
        commitMessage: string, 
        author: string
    ) {
        this.versionID = versionID
        this.projectID = projectID
        this.fileID = fileID
        this.commitMessage = commitMessage
        this.timestamp = new Date()
        this.content = content
        this.author = author
    }

    getVersionID(): string {
        return this.versionID
    }

    setVersionID(id: string): void {
        this.versionID = id
    }

    getCommitMessage(): string {
        return this.commitMessage
    }

    setCommitMessage(message: string): void {
        this.commitMessage = message
    }

    getTimestamp(): Date {
        return this.timestamp
    }

    setTimestamp(date: Date): void {
        this.timestamp = date
    }

    getFileID(): string {
        return this.fileID
    }

    getProjectID(): string {
        return this.projectID
    }

    getContent(): string {
        return this.content
    }

    getAuthor(): string {
        return this.author
    }
}
