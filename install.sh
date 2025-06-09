#!/bin/bash

# Exit on any error
set -e

# Load environment variables from .env file if it exists
if [ -f .env ]; then
    print_status "Loading environment variables from .env file..."
    set -a
    source .env
    set +a
else
    print_status "Warning: .env file not found. Using default environment variables."
fi

# Function to print status messages
print_status() {
    echo -e "\n[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a service is running
is_service_running() {
    systemctl is-active --quiet "$1"
}

# Step 1: Docker Installation and Setup
print_status "Step 1: Checking Docker installation..."

if ! command_exists docker; then
    print_status "Docker not found. Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh ./get-docker.sh
    rm get-docker.sh
else
    print_status "Docker is already installed."
fi

# Add user to docker group if not already added
if ! groups | grep -q docker; then
    print_status "Adding user to docker group..."
    sudo usermod -aG docker $USER
    print_status "Please log out and log back in for group changes to take effect."
fi

# Check and start Docker service
if ! is_service_running docker; then
    print_status "Starting Docker service..."
    sudo systemctl start docker
fi

# Verify Docker is working
if ! docker info >/dev/null 2>&1; then
    print_status "Error: Docker is not running properly. Please check the installation."
    exit 1
fi

print_status "Docker is installed and running."

# Step 2: Sysbox Installation and Setup
print_status "Step 2: Checking Sysbox installation..."

if ! command_exists sysbox-runc; then
    print_status "Sysbox not found. Installing Sysbox..."
    # stop docker containers
    docker rm $(docker ps -a -q) -f

    # Download and install Sysbox
    wget https://downloads.nestybox.com/sysbox/releases/v0.6.7/sysbox-ce_0.6.7-0.linux_amd64.deb
    sha256sum ./sysbox-ce_0.6.7-0.linux_amd64.deb

    # make the file executable
    chmod +x ./sysbox-ce_0.6.7-0.linux_amd64.deb

    # Install jq a tool required for the installation
    sudo apt-get install jq -y
    sudo apt-get install ./sysbox-ce_0.6.7-0.linux_amd64.deb -y

    rm sysbox-ce_0.6.7-0.linux_amd64.deb
else
    print_status "Sysbox is already installed."
fi

# Check Sysbox services
SYSBOX_SERVICES=("sysbox" "sysbox-mgr" "sysbox-fs")
for service in "${SYSBOX_SERVICES[@]}"; do
    if ! is_service_running "$service"; then
        print_status "Starting $service service..."
        sudo systemctl start "$service"
    fi
done

print_status "Sysbox is installed and running."

# Step 3: Start Docker Compose and monitor services
print_status "Step 3: Starting services with Docker Compose..."

# Start docker-compose in the background
docker compose up -d

# Function to check if all services are running
check_services() {
    # Check if backend server is reachable
    if ! wget --spider --quiet http://localhost:8000/api/v1/health-check/; then
        print_status "Backend server is not reachable. Please check the installation."
        return 1
    fi

    # TODO: Check if frontend server is reachable. When frontend is ready.

    return 0
}

# Monitor services
print_status "Monitoring services..."
attempts=0
max_attempts=10  # 10 minutes maximum wait time

while [ $attempts -lt $max_attempts ]; do
    if check_services; then
        print_status "All services are running successfully!"
        break
    fi
    
    attempts=$((attempts + 1))
    if [ $attempts -eq $max_attempts ]; then
        print_status "Warning: Some services may not be running properly. Please check manually."
        docker compose ps
        exit 1
    fi
    
    print_status "Waiting for services to start... (Attempt $attempts/$max_attempts)"
    sleep 30
done

print_status "Installation completed successfully!"

# Clean up environment variables loaded from .env
if [ -f .env ]; then
    print_status "Cleaning up environment variables..."
    # Get list of variables from .env file
    while IFS='=' read -r key value; do
        # Skip comments and empty lines
        [[ $key =~ ^#.*$ ]] && continue
        [[ -z $key ]] && continue
        # Remove the variable
        unset "$key"
    done < .env
fi
