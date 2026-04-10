#!/bin/bash

# Omni Agent Startup Script
# This script sets up and starts the Omni Agent system

set -e

echo "🚀 Starting Omni Agent Setup..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}$1${NC}"
}

# Check if .env file exists
if [ ! -f .env ]; then
    print_warning ".env file not found. Creating from template..."
    if [ -f .env.example ]; then
        cp .env.example .env
        print_status "Created .env file from template. Please edit it with your configuration."
        echo
        echo "⚠️  IMPORTANT: Please edit the .env file with your API keys and configuration before continuing."
        echo "   Required: OPENAI_API_KEY, and optionally PINECONE_API_KEY"
        echo
        read -p "Press Enter after you've configured .env file..."
    else
        print_error ".env.example file not found!"
        exit 1
    fi
fi

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check dependencies
print_header "🔍 Checking Dependencies..."

if ! command_exists python3; then
    print_error "Python 3 is required but not installed."
    exit 1
fi

if ! command_exists pip; then
    print_error "pip is required but not installed."
    exit 1
fi

if ! command_exists docker; then
    print_warning "Docker not found. You'll need to install it for full functionality."
fi

if ! command_exists docker-compose; then
    print_warning "Docker Compose not found. You'll need to install it for easy deployment."
fi

print_status "Dependencies check completed!"

# Setup Python virtual environment
print_header "🐍 Setting up Python Environment..."

if [ ! -d "venv" ]; then
    print_status "Creating virtual environment..."
    python3 -m venv venv
fi

print_status "Activating virtual environment..."
source venv/bin/activate

print_status "Upgrading pip..."
pip install --upgrade pip

print_status "Installing Python dependencies..."
pip install -r requirements.txt

print_status "Python environment setup completed!"

# Create necessary directories
print_header "📁 Creating Directories..."

mkdir -p logs
mkdir -p data
mkdir -p models
mkdir -p chroma_db
mkdir -p backups

print_status "Directories created!"

# Initialize the vector database (if using ChromaDB)
print_header "🗃️ Initializing Vector Database..."

python3 -c "
import asyncio
from omni_agent.database.vector_store import VectorStore

async def init_db():
    store = VectorStore()
    success = await store.initialize()
    if success:
        print('✅ Vector database initialized successfully!')
        
        # Add some sample knowledge
        await store.add_knowledge('Omni Agent is a universal AI system for multi-domain task execution.', {'type': 'system_info'})
        await store.add_knowledge('The system uses advanced NLU, task planning, and multi-agent collaboration.', {'type': 'features'})
        
        print('📚 Added sample knowledge to database!')
    else:
        print('❌ Failed to initialize vector database!')

asyncio.run(init_db())
"

print_status "Vector database initialization completed!"

# Function to start in development mode
start_dev() {
    print_header "🚀 Starting Omni Agent in Development Mode..."
    
    export PYTHONPATH=$PWD
    uvicorn omni_agent.api.main:app --reload --host 0.0.0.0 --port 8000
}

# Function to start with Docker
start_docker() {
    print_header "🐳 Starting Omni Agent with Docker..."
    
    if command_exists docker-compose; then
        docker-compose up -d
        print_status "Services started with Docker Compose!"
        print_status "API Documentation: http://localhost:8000/docs"
        print_status "Health Check: http://localhost:8000/system/health"
        
        if docker-compose ps | grep -q "grafana"; then
            print_status "Grafana Dashboard: http://localhost:3000 (admin/admin)"
        fi
        
        if docker-compose ps | grep -q "web-ui"; then
            print_status "Web UI: http://localhost:3001"
        fi
    else
        print_warning "Docker Compose not available, building and running single container..."
        docker build -t omni-agent .
        docker run -d --name omni-agent -p 8000:8000 --env-file .env omni-agent
        print_status "Omni Agent container started!"
        print_status "API Documentation: http://localhost:8000/docs"
    fi
}

# Function to show status
show_status() {
    print_header "📊 System Status"
    
    if command_exists docker; then
        echo "Docker containers:"
        docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    fi
    
    echo
    echo "Service URLs:"
    echo "  • API Documentation: http://localhost:8000/docs"
    echo "  • Health Check: http://localhost:8000/system/health"
    echo "  • Grafana (if running): http://localhost:3000"
    echo "  • Web UI (if running): http://localhost:3001"
}

# Function to stop services
stop_services() {
    print_header "🛑 Stopping Omni Agent Services..."
    
    if command_exists docker-compose; then
        docker-compose down
        print_status "Docker Compose services stopped!"
    fi
    
    # Stop any running Docker containers
    if docker ps | grep -q "omni-agent"; then
        docker stop omni-agent
        docker rm omni-agent
        print_status "Omni Agent container stopped!"
    fi
}

# Function to run tests
run_tests() {
    print_header "🧪 Running Tests..."
    
    source venv/bin/activate
    export PYTHONPATH=$PWD
    
    if command_exists pytest; then
        pytest tests/ -v --cov=omni_agent
    else
        print_error "pytest not installed. Installing..."
        pip install pytest pytest-cov
        pytest tests/ -v --cov=omni_agent
    fi
}

# Function to show help
show_help() {
    echo "Omni Agent Startup Script"
    echo
    echo "Usage: $0 [command]"
    echo
    echo "Commands:"
    echo "  dev       Start in development mode (default)"
    echo "  docker    Start with Docker Compose"
    echo "  status    Show system status"
    echo "  stop      Stop all services"
    echo "  test      Run tests"
    echo "  help      Show this help message"
    echo
    echo "Examples:"
    echo "  $0              # Start in development mode"
    echo "  $0 docker       # Start with Docker"
    echo "  $0 status       # Check status"
}

# Main execution
case "${1:-dev}" in
    "dev")
        start_dev
        ;;
    "docker")
        start_docker
        ;;
    "status")
        show_status
        ;;
    "stop")
        stop_services
        ;;
    "test")
        run_tests
        ;;
    "help")
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac
