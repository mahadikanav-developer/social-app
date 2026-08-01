# FarmSocial Windows Setup

Use this path for Windows development:

```powershell
C:\farmapp\project
```

Avoid OneDrive, Desktop, Downloads, and deep folders. This project has many files and Windows works better with a short path.

## 1. Install Required Apps

- Node.js LTS
- Python 3 for Windows, with `python.exe` added to PATH
- MongoDB Community Server for Windows
- Git for Windows, recommended for VS Code development
- VS Code

Redis is optional for local development because caching is disabled in the current backend `.env`.

## 2. Rebuild Dependencies For Windows

Open PowerShell in `C:\farmapp\project` and run:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\setup-windows.ps1 -Clean
```

The `-Clean` option removes Linux/old dependency folders:

- `backend\node_modules`
- `client\node_modules`
- `client\build`
- `ai\venv`
- `ai\.venv`

Then it reinstalls:

- backend Node packages
- frontend Node packages
- AI Python packages in `ai\.venv`

## 3. Start MongoDB

Make sure MongoDB is running locally:

```text
mongodb://127.0.0.1:27017/farmsocial
```

The backend `.env` already points to this local database.

## 4. Run The App

```powershell
.\start-windows.ps1
```

It opens three PowerShell windows:

- Backend: `http://localhost:5000`
- Frontend: `http://localhost:3000`
- AI service: `http://localhost:5001`

## 5. VS Code Workflow

Open this folder in VS Code:

```powershell
code C:\farmapp\project
```

Use the integrated terminal for commands. If `git` is not recognized, reinstall Git for Windows and select the option that adds Git to PATH.

