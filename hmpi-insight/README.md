# Omni Agent - Universal Agentic AI System

![Omni Agent Logo](https://img.shields.io/badge/Omni%20Agent-v1.0.0-blue)
![Python](https://img.shields.io/badge/Python-3.11+-green)
![FastAPI](https://img.shields.io/badge/FastAPI-Latest-teal)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 🌊 Overview

**Omni Agent** is a universal agentic AI system designed for autonomous multi-domain task execution. It combines advanced NLU, dynamic task planning, multi-agent collaboration, and self-learning capabilities to handle complex, real-world scenarios across various domains.

## 🚀 Features

### Core Capabilities
- **Natural Language Understanding**: Advanced goal interpretation using LLMs
- **Dynamic Task Planning**: Intelligent task graph generation and optimization  
- **Multi-Agent Collaboration**: Distributed problem-solving with agent communication
- **Tool Integration**: Seamless orchestration of APIs, databases, IoT devices, and cloud services
- **Self-Learning**: Reinforcement learning with performance monitoring and optimization
- **Enterprise Security**: Authentication, encryption, and secure API access

### Architecture Components
- **Agent Framework**: Core reasoning and execution engine
- **Task Graph System**: Dynamic planning and dependency management
- **Collaboration Protocol**: Agent-to-agent communication and coordination
- **Tool Orchestrator**: Universal tool and service integration
- **Vector Database**: Knowledge storage and retrieval (Pinecone, ChromaDB, Weaviate)
- **Learning System**: Adaptive optimization using ML techniques
- **Security Layer**: Comprehensive authentication and authorization
- **REST API**: FastAPI-based web service with full documentation

## 🏗️ Architecture

```
hmpi-insight/
├── backend/                 # Node.js/Express API server
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API endpoints
│   ├── controllers/        # Business logic
│   ├── services/           # External services
│   ├── utils/              # HMPI calculator & utilities
│   └── jobs/               # Scheduled tasks
├── frontend/               # React/TypeScript application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── services/      # API services
│   │   └── utils/         # Helper functions
├── database/               # Database scripts
├── ai-models/             # Machine learning models
└── docs/                  # Documentation
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16+ recommended)
- MongoDB (v4.4+)
- npm or yarn package manager

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/hmpi-insight.git
cd hmpi-insight
```

2. **Install dependencies**
```bash
npm run install-all
```

3. **Set up environment variables**

Create `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hmpi-insight
JWT_SECRET=your_jwt_secret_key
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
```

4. **Start MongoDB**
```bash
mongod
```

5. **Run the application**

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm run build
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📱 Usage

### For Citizens
1. Visit the homepage
2. Enter your PIN code or use GPS location
3. View instant water safety status
4. Access educational resources

### For Scientists/Researchers
1. Register/Login to access advanced features
2. Upload contamination data (CSV/Excel)
3. Generate HMPI calculations
4. View trends and predictions
5. Download detailed reports

### For Policymakers
1. Access the policy dashboard
2. View regional/national statistics
3. Generate policy reports
4. Set up automated alerts

## 🔬 HMPI Calculation Formula

The platform uses WHO/BIS standards for heavy metal limits:

```
HMPI = Σ(Wi × Ci/Si) / ΣWi

Where:
- Wi = Weight factor for metal i
- Ci = Concentration of metal i
- Si = Standard permissible limit for metal i
```

### Categorization:
- **Safe** (HMPI ≤ 1): Water safe for drinking
- **Moderate** (1 < HMPI ≤ 2): Monitoring required
- **High** (2 < HMPI ≤ 5): Treatment required
- **Critical** (HMPI > 5): Immediate action needed

## 🔒 Security Features

- JWT-based authentication
- Rate limiting on API endpoints
- Input validation and sanitization
- HTTPS enforcement in production
- Environment variable protection
- SQL injection prevention

## 🌍 Supported Languages

- English (en)
- Hindi (हिंदी)
- Tamil (தமிழ்)
- Telugu (తెలుగు)

## 📊 API Documentation

### Authentication
```http
POST /api/auth/register
POST /api/auth/login
```

### HMPI Calculations
```http
POST /api/hmpi/calculate
POST /api/hmpi/bulk-upload
GET /api/hmpi/history
GET /api/hmpi/statistics
```

### GIS Data
```http
GET /api/gis/heatmap-data
GET /api/gis/region/:regionId
```

### Alerts
```http
GET /api/alerts
POST /api/alerts/subscribe
DELETE /api/alerts/:id
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📈 Performance Optimization

- Lazy loading of React components
- Database indexing for faster queries
- Redis caching for frequently accessed data
- CDN integration for static assets
- Image optimization
- Code splitting

## 🧪 Testing

Run tests:
```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Development Team** - Full-stack development
- **Data Scientists** - AI/ML models
- **GIS Specialists** - Mapping and visualization
- **Domain Experts** - Water quality standards

## 📞 Support

For support, email support@hmpi-insight.com or raise an issue in the GitHub repository.

## 🙏 Acknowledgments

- WHO/BIS for water quality standards
- OpenStreetMap for mapping data
- TensorFlow team for ML framework
- React and Node.js communities

## 🚦 Project Status

✅ Core Features Complete
🔄 AI Models in Training
📅 Planned: Mobile App Development

---

**Made with ❤️ for ensuring safe groundwater and protecting public health**
