#!/bin/bash
set -euo pipefail

# Log function
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Error handler
error_handler() {
    log "Error occurred in script at line: ${1}"
    exit 1
}

trap 'error_handler ${LINENO}' ERR

log "Creating directory structure..."

# Create directories
directories=(
    ".github/workflows"
    "src/modules"
    "src/utils"
    "data/posts"
    "data/logs"
    "data/trends"
    "docs/css"
    "docs/js"
    "docs/posts"
    "docs/img"
)

for dir in "${directories[@]}"; do
    mkdir -p "$dir"
    touch "$dir/.gitkeep"
    log "Created $dir"
done

# Create placeholder files
placeholder_files=(
    "docs/index.html"
    "docs/css/style.css"
    "docs/js/dashboard.js"
    "src/index.js"
    "src/config.js"
)

for file in "${placeholder_files[@]}"; do
    touch "$file"
    log "Created placeholder file: $file"
done

log "Directory structure setup completed successfully"
