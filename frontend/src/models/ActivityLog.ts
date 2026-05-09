// ActivityLog model based on CollabCloud Class Diagram
export interface ActivityLog {
    activityID: string
    actionType: string
    timestamp: Date
}

export class ActivityLogModel implements ActivityLog {
    activityID: string
    actionType: string
    timestamp: Date
    userID: string
    actionDetails?: string

    constructor(activityID: string, userID: string, actionType: string, actionDetails?: string) {
        this.activityID = activityID
        this.userID = userID
        this.actionType = actionType
        this.timestamp = new Date()
        this.actionDetails = actionDetails
    }

    getActivityID(): string {
        return this.activityID
    }

    setActivityID(id: string): void {
        this.activityID = id
    }

    getActionType(): string {
        return this.actionType
    }

    setActionType(type: string): void {
        this.actionType = type
    }

    getActionDetails(): string | undefined {
        return this.actionDetails
    }

    setActionDetails(details: string): void {
        this.actionDetails = details
    }

    getTimestamp(): Date {
        return this.timestamp
    }

    setTimestamp(date: Date): void {
        this.timestamp = date
    }
}
