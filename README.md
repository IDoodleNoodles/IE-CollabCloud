# CollabCloud (Frontend Demo)

This folder contains a small React + Vite TypeScript frontend demo for the CollabCloud functional requirements. It uses localStorage to simulate a backend so you can explore features locally.

Quick start (PowerShell):

```powershell
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

What this implements (demo):
- User register/login (stored in localStorage)
- Project creation by uploading files
- Project listing and file download
- Simple text editor with commit messages and version history
- Commenting list (localStorage, simulated notifications)
- Profile and simple forums pages

Notes:
- This is a frontend-only demo. Replace localStorage code with API calls when adding a backend.
CollabCloud is an online platform inspired by GitHub but created to be more inclusive and user-friendly for everyone, particularly students, beginners, and hobbyists. While GitHub primarily targets software development and version control, CollabCloud supports all kinds of projects—whether they’re code, documents, designs, or even notes—allowing users to easily share, collaborate on, and store their work in one place. The goal is to simplify project sharing and foster a collaborative environment that’s open to all.