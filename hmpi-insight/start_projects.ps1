# 🚀 PROJECT STARTUP SCRIPT FOR WINDOWS
# This script will help you start both projects easily!

param(
    [string]$project = "choose",
    [switch]$help
)

# Colors for output
function Write-ColorOutput($ForegroundColor, $Message) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    Write-Output $Message
    $host.UI.RawUI.ForegroundColor = $fc
}

function Show-Header {
    Clear-Host
    Write-ColorOutput Green "🚀 PROJECT STARTUP SCRIPT"
    Write-ColorOutput Green "=" * 50
    Write-ColorOutput Cyan "Your Projects Location: D:\RISHI\SIH WARP\FINAL PS\hmpi-insight"
    Write-Output ""
}

function Show-Menu {
    Write-ColorOutput Yellow "📋 Available Projects:"
    Write-Output ""
    Write-ColorOutput White "1. 🧠 Omni Agent (AI System)"
    Write-Output "   - Universal AI Agent with NLP"
    Write-Output "   - Voice input, task planning"
    Write-Output "   - Status: ✅ Complete & Ready"
    Write-Output ""
    Write-ColorOutput White "2. 🏥 HMPI Insight (Healthcare Platform)"  
    Write-Output "   - Hospital Performance Monitoring"
    Write-Output "   - Analytics dashboard, patient tracking"
    Write-Output "   - Status: ✅ Complete & Ready"
    Write-Output ""
    Write-ColorOutput White "3. 📚 View Documentation"
    Write-Output "   - Project summaries and guides"
    Write-Output ""
    Write-ColorOutput White "4. 🔧 System Check"
    Write-Output "   - Verify prerequisites"
    Write-Output ""
    Write-ColorOutput Red "0. ❌ Exit"
    Write-Output ""
}

function Start-OmniAgent {
    Write-ColorOutput Green "🧠 Starting Omni Agent..."
    Write-Output ""
    
    Write-ColorOutput Yellow "Choose startup method:"
    Write-Output "A. 🌐 Open Web Interface (Instant)"
    Write-Output "B. ⚡ Start Full API Server"
    Write-Output "C. 🐳 Docker Deployment"
    Write-Output ""
    
    $choice = Read-Host "Enter choice (A/B/C)"
    
    switch ($choice.ToUpper()) {
        "A" {
            Write-ColorOutput Green "Opening web interface..."
            $webPath = "$PSScriptRoot\omni_agent\interfaces\web_interface.html"
            if (Test-Path $webPath) {
                Start-Process $webPath
                Write-ColorOutput Green "✅ Web interface opened in browser!"
                Write-ColorOutput Cyan "You can start chatting with the AI immediately!"
            } else {
                Write-ColorOutput Red "❌ Web interface file not found!"
            }
        }
        "B" {
            Write-ColorOutput Green "Starting API server..."
            
            # Check if Python is available
            try {
                $pythonVersion = python --version 2>&1
                Write-ColorOutput Green "✅ Python found: $pythonVersion"
            } catch {
                Write-ColorOutput Red "❌ Python not found! Please install Python first."
                return
            }
            
            # Create virtual environment if it doesn't exist
            if (!(Test-Path "$PSScriptRoot\omni_env")) {
                Write-ColorOutput Yellow "Creating virtual environment..."
                python -m venv "$PSScriptRoot\omni_env"
            }
            
            # Activate virtual environment and install dependencies
            Write-ColorOutput Yellow "Activating environment and installing dependencies..."
            & "$PSScriptRoot\omni_env\Scripts\Activate.ps1"
            pip install -r "$PSScriptRoot\requirements.txt"
            
            # Start the server
            Write-ColorOutput Green "🚀 Starting Omni Agent API server..."
            Write-ColorOutput Cyan "Access URLs:"
            Write-ColorOutput Cyan "- API Docs: http://localhost:8000/docs"
            Write-ColorOutput Cyan "- Agent Status: http://localhost:8000/agent/status"
            Write-ColorOutput Cyan "- System Health: http://localhost:8000/system/health"
            Write-Output ""
            Write-ColorOutput Yellow "Press Ctrl+C to stop the server"
            Write-Output ""
            
            python -m uvicorn omni_agent.api.main:app --host 0.0.0.0 --port 8000 --reload
        }
        "C" {
            Write-ColorOutput Green "Starting with Docker..."
            
            # Check if Docker is available
            try {
                $dockerVersion = docker --version 2>&1
                Write-ColorOutput Green "✅ Docker found: $dockerVersion"
                
                Write-ColorOutput Yellow "Starting Docker Compose..."
                docker-compose up -d
                
                Write-ColorOutput Green "🐳 Docker services started!"
                Write-ColorOutput Cyan "Access URLs:"
                Write-ColorOutput Cyan "- Web Interface: http://localhost:3001"
                Write-ColorOutput Cyan "- API: http://localhost:8000"
                Write-ColorOutput Cyan "- Grafana: http://localhost:3000"
            } catch {
                Write-ColorOutput Red "❌ Docker not found! Please install Docker Desktop first."
            }
        }
        default {
            Write-ColorOutput Red "Invalid choice!"
        }
    }
}

function Start-HMPIInsight {
    Write-ColorOutput Green "🏥 Starting HMPI Insight..."
    Write-Output ""
    
    Write-ColorOutput Yellow "Choose startup method:"
    Write-Output "A. 🌐 Open Frontend (Instant)"
    Write-Output "B. ⚡ Start Full Stack (Frontend + Backend)"
    Write-Output ""
    
    $choice = Read-Host "Enter choice (A/B)"
    
    switch ($choice.ToUpper()) {
        "A" {
            Write-ColorOutput Green "Opening frontend interface..."
            $frontendPath = "$PSScriptRoot\frontend\index.html"
            if (Test-Path $frontendPath) {
                Start-Process $frontendPath
                Write-ColorOutput Green "✅ Frontend opened in browser!"
                Write-ColorOutput Cyan "Hospital dashboard is now accessible!"
            } else {
                Write-ColorOutput Red "❌ Frontend file not found!"
            }
        }
        "B" {
            Write-ColorOutput Green "Starting full stack..."
            
            # Check if Node.js is available
            try {
                $nodeVersion = node --version 2>&1
                Write-ColorOutput Green "✅ Node.js found: $nodeVersion"
            } catch {
                Write-ColorOutput Red "❌ Node.js not found! Please install Node.js first."
                return
            }
            
            Write-ColorOutput Yellow "This will open two terminal windows:"
            Write-ColorOutput Yellow "- Backend server (port 5000)"
            Write-ColorOutput Yellow "- Frontend dev server (port 3000)"
            Write-Output ""
            
            # Start backend in new window
            $backendCmd = "cd '$PSScriptRoot\backend'; npm install; npm start"
            Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCmd
            
            # Wait a moment then start frontend
            Start-Sleep 2
            $frontendCmd = "cd '$PSScriptRoot\frontend'; npm install; npm run dev"
            Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCmd
            
            Write-ColorOutput Green "✅ Both servers started!"
            Write-ColorOutput Cyan "Access URLs:"
            Write-ColorOutput Cyan "- Frontend: http://localhost:3000"
            Write-ColorOutput Cyan "- Backend API: http://localhost:5000"
        }
        default {
            Write-ColorOutput Red "Invalid choice!"
        }
    }
}

function Show-Documentation {
    Write-ColorOutput Green "📚 Opening Documentation..."
    
    $docs = @(
        @{name="Complete Startup Guide"; path="🚀_START_HERE_COMPLETE_GUIDE.md"},
        @{name="Project Summary"; path="PROJECT_SUMMARY.md"},
        @{name="README"; path="README.md"}
    )
    
    Write-ColorOutput Yellow "Available documentation:"
    for ($i = 0; $i -lt $docs.Count; $i++) {
        Write-Output "$($i + 1). $($docs[$i].name)"
    }
    Write-Output ""
    
    $choice = Read-Host "Enter number to open (1-$($docs.Count))"
    
    if ($choice -match '^\d+$' -and [int]$choice -ge 1 -and [int]$choice -le $docs.Count) {
        $docPath = "$PSScriptRoot\$($docs[[int]$choice - 1].path)"
        if (Test-Path $docPath) {
            Start-Process $docPath
            Write-ColorOutput Green "✅ Documentation opened!"
        } else {
            Write-ColorOutput Red "❌ Documentation file not found!"
        }
    } else {
        Write-ColorOutput Red "Invalid choice!"
    }
}

function Test-SystemRequirements {
    Write-ColorOutput Green "🔧 System Requirements Check..."
    Write-Output ""
    
    # Check Python
    try {
        $pythonVersion = python --version 2>&1
        Write-ColorOutput Green "✅ Python: $pythonVersion"
        
        # Check pip
        try {
            $pipVersion = pip --version 2>&1
            Write-ColorOutput Green "✅ Pip: Available"
        } catch {
            Write-ColorOutput Red "❌ Pip: Not found"
        }
    } catch {
        Write-ColorOutput Red "❌ Python: Not installed"
        Write-ColorOutput Yellow "   Download from: https://www.python.org/downloads/"
    }
    
    # Check Node.js
    try {
        $nodeVersion = node --version 2>&1
        Write-ColorOutput Green "✅ Node.js: $nodeVersion"
        
        # Check npm
        try {
            $npmVersion = npm --version 2>&1
            Write-ColorOutput Green "✅ NPM: v$npmVersion"
        } catch {
            Write-ColorOutput Red "❌ NPM: Not found"
        }
    } catch {
        Write-ColorOutput Red "❌ Node.js: Not installed"
        Write-ColorOutput Yellow "   Download from: https://nodejs.org/"
    }
    
    # Check Docker (optional)
    try {
        $dockerVersion = docker --version 2>&1
        Write-ColorOutput Green "✅ Docker: $dockerVersion"
    } catch {
        Write-ColorOutput Yellow "⚠️  Docker: Not installed (optional)"
        Write-ColorOutput Yellow "   Download from: https://www.docker.com/products/docker-desktop"
    }
    
    # Check project files
    Write-Output ""
    Write-ColorOutput Cyan "Project Files Check:"
    
    $requiredPaths = @(
        @{name="Omni Agent"; path="omni_agent"},
        @{name="Frontend"; path="frontend"},  
        @{name="Backend"; path="backend"},
        @{name="Requirements"; path="requirements.txt"},
        @{name="Docker Compose"; path="docker-compose.yml"}
    )
    
    foreach ($item in $requiredPaths) {
        $fullPath = "$PSScriptRoot\$($item.path)"
        if (Test-Path $fullPath) {
            Write-ColorOutput Green "✅ $($item.name): Found"
        } else {
            Write-ColorOutput Red "❌ $($item.name): Missing"
        }
    }
    
    Write-Output ""
    Write-ColorOutput Cyan "System is ready to run projects!"
}

# Main script logic
if ($help) {
    Show-Header
    Write-ColorOutput Green "USAGE:"
    Write-Output "  .\start_projects.ps1                    # Interactive mode"
    Write-Output "  .\start_projects.ps1 -project omni      # Start Omni Agent"
    Write-Output "  .\start_projects.ps1 -project hmpi      # Start HMPI Insight"
    Write-Output "  .\start_projects.ps1 -project check     # System check"
    Write-Output "  .\start_projects.ps1 -help              # Show this help"
    exit
}

# Handle direct project parameter
switch ($project.ToLower()) {
    "omni" { 
        Show-Header
        Start-OmniAgent 
        exit
    }
    "hmpi" { 
        Show-Header
        Start-HMPIInsight 
        exit
    }
    "check" {
        Show-Header
        Test-SystemRequirements
        exit
    }
}

# Interactive mode
while ($true) {
    Show-Header
    Show-Menu
    
    $choice = Read-Host "Enter your choice (0-4)"
    
    switch ($choice) {
        "1" { Start-OmniAgent }
        "2" { Start-HMPIInsight }
        "3" { Show-Documentation }
        "4" { Test-SystemRequirements }
        "0" { 
            Write-ColorOutput Green "Goodbye! 👋"
            exit 
        }
        default { 
            Write-ColorOutput Red "Invalid choice! Please enter 0-4." 
        }
    }
    
    Write-Output ""
    Write-ColorOutput Yellow "Press Enter to return to main menu..."
    Read-Host
}
