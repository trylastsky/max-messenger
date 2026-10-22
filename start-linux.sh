#!/usr/bin/env bash
set -Eeuo pipefail

# Run from the directory containing this script (the project root).
cd "$(dirname "$0")"

echo "========================================"
echo "           MAX Messenger"
echo "========================================"
echo

if ! command -v node >/dev/null 2>&1; then
  echo "[ERROR] Node.js is not installed or is not in PATH."
  echo "Install a supported Node.js LTS release: https://nodejs.org/"
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "[ERROR] npm was not found. Install/reinstall Node.js LTS."
  exit 1
fi

if [[ ! -f package.json ]]; then
  echo "[ERROR] package.json was not found."
  echo "Put this script in the project root, next to package.json."
  exit 1
fi

if [[ ! -d node_modules ]]; then
  echo "Installing project dependencies..."
  npm install
fi

echo
echo "Starting the development server..."
echo "Open the Local URL printed by Vite in your browser."
echo "Press Ctrl+C to stop the server."
echo

npm run dev
