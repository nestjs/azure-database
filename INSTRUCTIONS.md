# Development Instructions

This document provides comprehensive instructions for setting up, developing, and testing the NestJS Azure Database integration.

## 📋 Prerequisites

- **Node.js** 18.x or 20.x LTS
- **npm** 7.x or higher
- **PowerShell** 5.1+ (Windows) or PowerShell Core 7+ (cross-platform)
- **Azure Cosmos DB** account or emulator
- **Azure Storage** account (for Table Storage features)
- **Git** for version control

## 🪟 Windows Setup (Important!)

### PowerShell Execution Policy Issues

Windows users often encounter PowerShell execution policy restrictions that prevent npm scripts from running. This is a common issue that affects `npm run`, `npm test`, and other script commands.

#### Quick Fix (Recommended)

Run our automated setup script that handles all PowerShell configuration:

```powershell
# Open PowerShell as Administrator (recommended)
# Or open PowerShell as regular user for current-user-only setup

# Navigate to the repository root
cd C:\path\to\azure-database

# Set execution policy manually
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope LocalMachine

# For current user only (no admin required)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

This will:
- ✅ Check your current execution policy
- ✅ Configure RemoteSigned policy for script execution
- ✅ Verify Node.js and npm installations
- ✅ Test npm script execution
- ✅ Provide troubleshooting guidance

#### Manual Setup

If you prefer manual configuration:

```powershell
# Option 1: System-wide (requires Administrator)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope LocalMachine

# Option 2: Current user only (no admin required)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Option 3: Temporary for current session
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
```

#### Verification

Test that PowerShell scripts work correctly:

```powershell
# This should work without errors
npm run test --version

# Should show execution policy as RemoteSigned
Get-ExecutionPolicy -List
```

#### Troubleshooting

**Error: "Scripts is disabled on this system"**
- Run `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`
- Restart your terminal/VS Code

**Error: "Cannot load Windows PowerShell snap-in"**
- Use PowerShell Core (pwsh) instead of Windows PowerShell
- Or run: `powershell.exe -ExecutionPolicy Bypass -File script.ps1`

**Corporate/Restricted Environment**
- Contact your IT administrator
- Use `Scope CurrentUser` instead of `LocalMachine`
- Consider using WSL2 with Linux environment

**PowerShell Fix**: Run `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser` in PowerShell as Administrator.

## 🚀 Quick Start

### 1. Repository Setup

```bash
# Clone the repository
git clone <repository-url>
cd azure-database

# Windows users: fix PowerShell first!
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Install dependencies
npm install

# Verify installation
npm test
```

### 2. Environment Configuration

Create environment files for different components:

**Main library (optional):**
```bash
# Copy from template
cp env.sample .env

# Edit with your settings
AZURE_COSMOS_DB_NAME=your-database-name
AZURE_COSMOS_DB_ENDPOINT=https://your-account.documents.azure.com:443/
AZURE_COSMOS_DB_KEY=your-primary-key
AZURE_STORAGE_CONNECTION_STRING=your-connection-string
```

**Search sample application:**
```bash
cd samples/cosmos-db-search
cp .env.example .env

# Configure for local development (Cosmos DB Emulator)
AZURE_COSMOS_DB_NAME=SampleSearchDB
AZURE_COSMOS_DB_ENDPOINT=https://localhost:8081
AZURE_COSMOS_DB_KEY=C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw/Jw==
PORT=3000
LOG_LEVEL=info
```

### 3. Database Setup

**Option A: Azure Cosmos DB Emulator (Local Development)**
```bash
# Using Docker (recommended)
cd samples/cosmos-db-search
npm run cosmos:emulator

# Or download the official emulator:
# https://docs.microsoft.com/azure/cosmos-db/local-emulator
```

**Option B: Azure Cosmos DB Cloud Instance**
1. Create a Cosmos DB account in Azure Portal
2. Note the endpoint and primary key
3. Update your .env files with the connection details

## 🔍 Exploring Search Features

### Try the Complete Search Sample

The `samples/cosmos-db-search/` directory contains a complete NestJS application demonstrating all search capabilities:

```bash
# Navigate to the search sample
cd samples/cosmos-db-search

# Install dependencies
npm install

# Start Cosmos DB emulator (if using local development)
npm run cosmos:emulator

# Seed the database with sample articles
npm run seed

# Start the application
npm run start:dev
```

**Available endpoints:**
- **API Documentation**: http://localhost:3000/api/docs
- **Health Check**: http://localhost:3000/api/v1/health
- **Vector Search**: POST http://localhost:3000/api/v1/articles/search/vector
- **Full-Text Search**: POST http://localhost:3000/api/v1/articles/search/text
- **Hybrid Search**: POST http://localhost:3000/api/v1/articles/search/hybrid

### Sample Search Requests

**Vector Search Example:**
```bash
curl -X POST http://localhost:3000/api/v1/articles/search/vector \
  -H "Content-Type: application/json" \
  -d '{
    "vector": [0.1, 0.2, 0.3, /* ... 1536 dimensions */],
    "limit": 5,
    "distanceFunction": "cosine"
  }'
```

**Full-Text Search Example:**
```bash
curl -X POST http://localhost:3000/api/v1/articles/search/text \
  -H "Content-Type: application/json" \
  -d '{
    "searchText": "machine learning azure",
    "searchFields": ["title", "content"],
    "highlightFields": ["title"],
    "limit": 10
  }'
```

**Hybrid Search Example:**
```bash
curl -X POST http://localhost:3000/api/v1/articles/search/hybrid \
  -H "Content-Type: application/json" \
  -d '{
    "vectorSearch": {
      "vector": [/* embedding vector */],
      "vectorPath": "/embedding"
    },
    "fullTextSearch": {
      "searchText": "kubernetes azure cloud",
      "searchFields": ["title", "content"]
    },
    "vectorWeight": 0.6,
    "textWeight": 0.4,
    "limit": 8
  }'
```

## 🧪 Running Tests

### Test Categories

**Unit Tests:**
```bash
# Run all unit tests
npm test

# Run with coverage
npm run test:cov

# Watch mode for development
npm run test:watch
```

**Integration Tests:**
```bash
# Run integration tests (requires Cosmos DB)
npm run test:integration

# Run specific integration test file
npm run test:integration -- search.integration-spec.ts
```

**End-to-End Tests:**
```bash
# Run e2e tests
npm run test:e2e

# Run e2e tests for specific module
npm run test:e2e -- --testNamePattern="CosmosDB"
```

### Test Setup Requirements

**For Integration Tests:**
1. **Start Cosmos DB emulator** or configure cloud connection
2. **Ensure test database access** - tests create temporary containers
3. **Seed test data** (handled automatically by test setup)

**For Search Integration Tests:**
```bash
# Navigate to search sample
cd samples/cosmos-db-search

# Install dependencies
npm install

# Start Cosmos DB emulator
npm run cosmos:emulator

# Seed sample data
npm run seed

# Run comprehensive search tests
npm run test:integration
```

**Test Data:**
Integration tests use isolated test containers and clean up automatically. The search sample includes realistic test data with:
- 6 sample articles with generated embeddings
- Various categories and tags
- Different content types and lengths
- Proper vector and text search indexes

### Debugging Tests

**Enable Debug Logging:**
```bash
# Set environment variable
export LOG_LEVEL=debug

# Or in Windows PowerShell
$env:LOG_LEVEL="debug"

# Run tests with debug output
npm run test:integration
```

**Test Specific Components:**
```bash
# Test only vector search
npm test -- --testNamePattern="vector search"

# Test only Cosmos DB integration
npm test -- lib/cosmos-db/

# Test with verbose output
npm test -- --verbose
```

## 🔧 Development Workflow

### 1. Making Changes

```bash
# Create a feature branch
git checkout -b feature/your-feature-name

# Make your changes
# ... edit files ...

# Run tests to ensure nothing is broken
npm test
npm run test:integration
```

### 2. Testing Your Changes

```bash
# Unit tests for quick feedback
npm test

# Integration tests for database features
npm run test:integration

# Test the search sample with your changes
cd samples/cosmos-db-search
npm install
npm run start:dev
```

### 3. Code Quality

```bash
# Lint your code
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Check TypeScript compilation
npm run build

# Format code
npm run format
```

### 4. Submitting Changes

```bash
# Ensure all tests pass
npm test
npm run test:integration
npm run test:e2e

# Build successfully
npm run build

# Commit your changes
git add .
git commit -m "feat: add new search feature"

# Push and create pull request
git push origin feature/your-feature-name
```

## 📊 Performance Testing

### Benchmarking Search Operations

The integration tests include performance benchmarks:

```bash
# Run performance tests
npm run test:integration -- --testNamePattern="performance"

# Monitor RU consumption
export COSMOS_DB_MONITOR_RU=true
npm run test:integration
```

**Typical performance expectations:**
- **Vector Search**: 10-50ms for 1000 documents
- **Full-Text Search**: 20-100ms depending on index size
- **Hybrid Search**: 30-150ms (combines both operations)

### Optimization Tips

1. **Vector Index Configuration**:
   - Use `quantizedFlat` for balanced performance
   - Use `diskANN` for high-scale scenarios
   - Monitor index build times and storage

2. **Search Parameter Tuning**:
   - Limit result sets (`limit` parameter)
   - Use pre-filters to reduce search space
   - Adjust vector similarity thresholds

3. **Request Units (RU) Optimization**:
   - Monitor RU consumption in logs
   - Use appropriate consistency levels
   - Batch operations when possible

## 🐛 Troubleshooting

### Common Issues

**PowerShell Script Errors (Windows)**
```
Error: Scripts is disabled on this system
Solution: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Cosmos DB Connection Failures**
```
Error: Unable to connect to Cosmos DB
Solutions:
1. Check if emulator is running on port 8081
2. Verify endpoint and key in .env file
3. Check firewall settings
4. Ensure container/database exists
```

**Search Operations Failing**
```
Error: Vector search failed
Solutions:
1. Verify vector index configuration
2. Check vector dimensions match
3. Ensure container has proper indexing policy
4. Validate vector format (array of numbers)
```

**High RU Consumption**
```
Warning: High request units consumed
Solutions:
1. Add filters to reduce search scope
2. Use smaller result limits
3. Optimize vector index type
4. Consider query caching
```

**Test Failures**
```
Error: Integration tests failing
Solutions:
1. Ensure Cosmos DB emulator is running
2. Check if sample data is seeded
3. Verify environment variables
4. Clear test containers and re-run
```

### Getting Help

1. **Check the logs**: Enable debug logging with `LOG_LEVEL=debug`
2. **Review test output**: Integration tests provide detailed error information
3. **Check Azure Portal**: Monitor RU usage and connection status
4. **GitHub Issues**: Report bugs with reproduction steps
5. **Documentation**: Review README and sample code

### Debug Configuration

**Enable comprehensive debugging:**
```bash
# Environment variables for debugging
export LOG_LEVEL=debug
export COSMOS_DB_DEBUG=true
export COSMOS_DB_MONITOR_RU=true

# Run with debug output
npm run test:integration 2>&1 | tee debug.log
```

**Analyze performance:**
```bash
# Enable RU monitoring
export COSMOS_DB_MONITOR_RU=true

# Run performance-specific tests
npm run test:integration -- --testNamePattern="performance|benchmark"
```

## 📚 Additional Resources

- **Azure Cosmos DB Documentation**: https://docs.microsoft.com/azure/cosmos-db/
- **Vector Search Guide**: https://docs.microsoft.com/azure/cosmos-db/nosql/vector-search
- **NestJS Documentation**: https://docs.nestjs.com/
- **Azure SDK for JavaScript**: https://github.com/Azure/azure-sdk-for-js
- **PowerShell Execution Policies**: https://docs.microsoft.com/powershell/module/microsoft.powershell.core/about/about_execution_policies

---

**Happy Developing!** 🚀✨
