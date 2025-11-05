#!/bin/bash

# Function to run a command in the specified directory
run_command_in_directory() {
    cd "$1" || exit 1 # Change to the specified directory
    eval "$2" &       # Run the provided command in the background
}

# Function to open a directory in VS Code
open_in_vscode() {
    code "$1" &
    sleep 5 # Wait for VS Code to open (adjust this delay if needed)
}

# Function to open URLs in Google Chrome or default browser
open_in_chrome() {
    google-chrome "$1" &
}

# Ask the user for the mode
echo "Choose a script to run:"
echo "1. Focus mode"
echo "2. CRM Web Admin"
echo "3. Portfollio"
read -p "Enter mode (1 for focus mode): " mode


# Define URLs for both modes
focus_url="http://localhost:3000/"
crm_url="http://localhost:3000/"
portfollio_url="http://localhost:5173/"


# Define directory paths
focus_mode_dir="/home/inifinity/Desktop/focus-mode"
crm_dir="/home/infinity/Desktop/crm-web-admin"
portfollio_dir="/home/infinity/Desktop/AI Projects/portfollio"

if [ "$mode" == "1" ]; then
    open_in_vscode "$focus_mode_dir"
    sleep 3
    run_command_in_directory "$focus_mode_dir" "nvm use v20"
    sleep 2
    run_command_in_directory "$focus_mode_dir" "npm run dev"
    sleep 5 # Wait for npm to start (adjust this delay if needed)
    open_in_chrome "$focus_url"
elif [ "$mode" == "2" ]; then
    open_in_vscode "$crm_dir"
    run_command_in_directory "$crm_dir" "npm start"
    sleep 5 # Wait for npm to start (adjust this delay if needed)
    open_in_chrome "$crm_url"
elif [ "$mode" == "3" ]; then
    open_in_vscode "$portfollio_dir"
    run_command_in_directory "$portfollio_dir" "npm run dev"
    sleep 5 # Wait for npm to start (adjust this delay if needed)
    open_in_chrome "$portfollio_url"
else
    echo "Invalid mode entered. Please enter 1 for focus mode, 2 for CRM."
fi

