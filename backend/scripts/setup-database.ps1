# Database setup script for NeuroWealth deposit detection feature
# This script creates the database and runs migrations

$ErrorActionPreference = "Stop"

Write-Host "NeuroWealth Database Setup" -ForegroundColor Green
Write-Host "================================"
Write-Host ""

# Check if PostgreSQL is installed
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psqlPath) {
    Write-Host "Error: PostgreSQL is not installed" -ForegroundColor Red
    Write-Host "Please install PostgreSQL first:"
    Write-Host "  Download from https://www.postgresql.org/download/"
    exit 1
}

# Get database configuration from environment or use defaults
$DB_NAME = if ($env:DB_NAME) { $env:DB_NAME } else { "neurowealth" }
$DB_USER = if ($env:DB_USER) { $env:DB_USER } else { "postgres" }
$DB_HOST = if ($env:DB_HOST) { $env:DB_HOST } else { "localhost" }
$DB_PORT = if ($env:DB_PORT) { $env:DB_PORT } else { "5432" }

Write-Host "Database Configuration:"
Write-Host "  Host: $DB_HOST"
Write-Host "  Port: $DB_PORT"
Write-Host "  Database: $DB_NAME"
Write-Host "  User: $DB_USER"
Write-Host ""

# Set PostgreSQL password environment variable if provided
if ($env:DB_PASSWORD) {
    $env:PGPASSWORD = $env:DB_PASSWORD
}

# Check if database exists
$dbExists = psql -h $DB_HOST -p $DB_PORT -U $DB_USER -lqt | Select-String -Pattern "\b$DB_NAME\b"

if ($dbExists) {
    Write-Host "Warning: Database '$DB_NAME' already exists" -ForegroundColor Yellow
    $response = Read-Host "Do you want to drop and recreate it? (y/N)"
    if ($response -eq 'y' -or $response -eq 'Y') {
        Write-Host "Dropping database..."
        dropdb -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME
        Write-Host "✓ Database dropped" -ForegroundColor Green
        $dbExists = $null
    } else {
        Write-Host "Skipping database creation"
    }
}

# Create database if it doesn't exist
if (-not $dbExists) {
    Write-Host "Creating database..."
    createdb -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME
    Write-Host "✓ Database created" -ForegroundColor Green
}

# Run migrations
Write-Host ""
Write-Host "Running migrations..."
Write-Host ""

Write-Host "1. Creating users table..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f ..\migrations\001_create_users_table.sql
Write-Host "✓ Users table created" -ForegroundColor Green

Write-Host "2. Creating deposits table..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f ..\migrations\002_create_deposits_table.sql
Write-Host "✓ Deposits table created" -ForegroundColor Green

Write-Host ""
Write-Host "Database setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:"
Write-Host "  1. Copy .env.example to .env and configure your environment variables"
Write-Host "  2. Generate a wallet encryption key:"
Write-Host "     node -e `"console.log(require('crypto').randomBytes(32).toString('hex'))`""
Write-Host "  3. Install dependencies: npm install"
Write-Host "  4. Start the server: npm run dev"
Write-Host ""
