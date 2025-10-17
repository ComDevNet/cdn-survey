#!/bin/bash
# =======================================================
# S3 Sync Script for the cdn-survey Project
# This script is designed to run on the production server.
# =======================================================

# --- Configuration ---
# The source directory on the SERVER where the app saves response files.
SOURCE_DIR="/opt/lampp/htdocs/cdn-survey/survey/data"

# The final, production S3 bucket name.
S3_BUCKET="cdn-survey-main"

# The location of the log file on the SERVER.
LOG_FILE="/opt/lampp/htdocs/cdn-survey/scripts/upload_log.txt"

# --- Script Logic ---
touch "$LOG_FILE"
log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

log_message "--- Starting S3 Sync Check ---"
if [ ! -d "$SOURCE_DIR" ]; then
    log_message "ERROR: Source directory not found: $SOURCE_DIR"
    exit 1
fi

if ping -c 1 8.8.8.8 &> /dev/null; then
    log_message "✓ Internet connection detected."
    # Use 'aws sts get-caller-identity' to verify credentials without needing sudo
    if ! aws sts get-caller-identity &> /dev/null; then
        log_message "ERROR: AWS CLI credentials invalid. Run 'aws configure' on the server."
        exit 1
    fi
    log_message "Syncing CSV files to s3://$S3_BUCKET ..."
    aws s3 sync "$SOURCE_DIR" "s3://$S3_BUCKET" --exclude "*" --include "*.csv"
    if [ $? -eq 0 ]; then
        log_message "✓ SUCCESS: CSV sync complete."
    else
        log_message "✗ FAILED: S3 sync error occurred."
    fi
else
    log_message "✗ No internet. Files will be uploaded on next attempt."
fi
log_message "--- Sync Check Finished ---"

