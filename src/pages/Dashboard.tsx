import React from 'react'
import { Link } from 'react-router-dom'

export default function Dashboard() {
    return (
        <div>
            <h2>CollabCloud — Dashboard</h2>
            <p>Welcome to the CollabCloud demo front-end. Use the navigation to explore features.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="card">
                    <h3>Projects</h3>
                    <p>Upload and manage project files.</p>
                    <Link to="/projects"><button>Open Projects</button></Link>
                </div>
                <div className="card">
                    <h3>Editor & Versions</h3>
                    <p>Edit text files and track versions.</p>
                    <Link to="/versions"><button>See Versions</button></Link>
                </div>
            </div>
        </div>
    )
}
