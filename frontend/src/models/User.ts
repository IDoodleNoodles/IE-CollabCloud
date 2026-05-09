// User model based on CollabCloud Class Diagram
export interface User {
    userID: string
    name: string
    email: string
    password: string
    role: string
}

export class UserModel implements User {
    userID: string
    name: string
    email: string
    password: string
    role: string

    constructor(userID: string, email: string, password: string, name: string = '', role: string = 'User') {
        this.userID = userID
        this.name = name
        this.email = email
        this.password = password
        this.role = role
    }

    getUserID(): string {
        return this.userID
    }

    setUserID(userID: string): void {
        this.userID = userID
    }

    getName(): string {
        return this.name
    }

    setName(name: string): void {
        this.name = name
    }

    getEmail(): string {
        return this.email
    }

    setEmail(email: string): void {
        this.email = email
    }

    getPassword(): string {
        return this.password
    }

    setPassword(password: string): void {
        this.password = password
    }

    getRole(): string {
        return this.role
    }

    setRole(role: string): void {
        this.role = role
    }

    validateAccount(): boolean {
        return this.email.length > 0 && this.password.length >= 6
    }

    updateProfile(name: string, email: string): void {
        this.name = name
        this.email = email
    }
}
