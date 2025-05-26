#!/bin/bash

sudo apt-get install -y figlet
sudo apt-get install -y toilet

# Display a heading for the CDN Survey installation
tput setaf 6
toilet -f big "Installing CDN Survey" --gay
tput sgr0

# Define the source and destination
SOURCE="cdnsurvey.service"
DESTINATION="/etc/systemd/system/"

echo "Installing dependencies..."
npm install

npm run build

# Copy the service file to the systemd directory
sudo cp $SOURCE $DESTINATION

# Reload systemd manager configuration
sudo systemctl daemon-reload

# Start the service
sudo systemctl start cdnsurvey.service

# Enable the service to start on boot
sudo systemctl enable cdnsurvey.service

echo "Service cdnsurvey.service has been installed and started."