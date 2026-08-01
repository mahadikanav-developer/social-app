#!/bin/bash

# Start the whole FarmSocial app stack for development.
# This launches backend, frontend, and AI service in the background.

set -e

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

if [ ! -d "backend" ] || [ ! -d "client" ] || [ ! -d "ai" ]; then
  echo "Error: This script must be run from the project root."
  exit 1
fi

mkdir -p logs

start_process() {
  local name="$1"
  local cmd="$2"
  local dir="$3"
  local log_file="$ROOT_DIR/logs/${name}.log"
  local pid_file="$ROOT_DIR/logs/${name}.pid"

  echo "Starting ${name}..."
  cd "$dir"
  if pgrep -f "$cmd" >/dev/null 2>&1; then
    echo "  ${name} is already running. Skipping start."
    return
  fi

  nohup bash -lc "$cmd" > "$log_file" 2>&1 &
  echo $! > "$pid_file"
  echo "  ${name} started with PID $(cat "$pid_file")"
  echo "  Log: $log_file"
}

start_process "backend" "npm start" "$ROOT_DIR/backend"
start_process "frontend" "npm start" "$ROOT_DIR/client"
start_process "ai" "python3 app.py" "$ROOT_DIR/ai"

cat <<'EOF'

All services started.
- Backend: http://localhost:5000
- Frontend: http://localhost:3000 (create-react-app default)
- AI service: http://localhost:5001

Use the logs in ./logs/ for output.
To stop, run: pkill -F ./logs/backend.pid; pkill -F ./logs/frontend.pid; pkill -F ./logs/ai.pid
EOF
