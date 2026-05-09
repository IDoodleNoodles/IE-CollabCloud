// Comment model based on CollabCloud Class Diagram
export interface Comment {
    commentID: string
    content: string
    timestamp: Date
}

export class CommentModel implements Comment {
    commentID: string
    content: string
    timestamp: Date
    email: string
    author: string

    constructor(commentID: string, content: string, author: string, email: string = '') {
        this.commentID = commentID
        this.content = content
        this.timestamp = new Date()
        this.author = author
        this.email = email
    }

    getCommentID(): string {
        return this.commentID
    }

    setCommentID(id: string): void {
        this.commentID = id
    }

    getAuthor(): string {
        return this.author
    }

    setAuthor(author: string): void {
        this.author = author
    }

    getEmail(): string {
        return this.email
    }

    setEmail(email: string): void {
        this.email = email
    }

    getContent(): string {
        return this.content
    }

    setContent(content: string): void {
        this.content = content
    }

    getTimestamp(): Date {
        return this.timestamp
    }

    setTimestamp(date: Date): void {
        this.timestamp = date
    }
}
