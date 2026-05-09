// Project model based on CollabCloud Class Diagram
import { FileModel } from './File'

export interface Project {
    projectID: string
    name: string
    description: string
    createdDate: Date
}

export class ProjectModel implements Project {
    projectID: string
    name: string
    description: string
    createdDate: Date
    files: FileModel[]

    constructor(projectID: string, name: string, description: string = '') {
        this.projectID = projectID
        this.name = name
        this.description = description
        this.createdDate = new Date()
        this.files = []
    }

    getProjectID(): string {
        return this.projectID
    }

    setProjectID(id: string): void {
        this.projectID = id
    }

    getProjectName(): string {
        return this.name
    }

    setProjectName(name: string): void {
        this.name = name
    }

    setDescription(desc: string): void {
        this.description = desc
    }

    getDescription(): string {
        return this.description
    }

    addFile(file: FileModel): void {
        this.files.push(file)
    }

    removeFile(fileID: string): void {
        this.files = this.files.filter(f => f.fileID !== fileID)
    }

    getCreatedDate(): Date {
        return this.createdDate
    }
}
