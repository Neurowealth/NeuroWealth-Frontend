#!/bin/bash

# Database setup script for NeuroWealth deposit detection feature
# This script creates the database and runs migrations

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}NeuroWealth Database Setup${NC}"
echo "================================"
echo ""

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo -e "${RED}Error: PostgreSQL is not installed${NC}"
    echo "Please install PostgreSQL first:"
    echo "  - macOS: brew install postgresql"
    echo "  - Ubuntu: sudo apt-get install postgresql"
    echo "  - Windows: Download from https://www.postgresql.org/download/"
    exit 1
fi

# Get database configuration from environment or use defaults
DB_NAME=${DB_NAME:-neurowealth}
DB_USER=${DB_USER:-postgres}
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}

echo "Database Configuration:"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo ""

# Check if database exists
if psql -h $DB_HOST -p $DB_PORT -U $DB_USER -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
    echo -e "${YELLOW}Warning: Database '$DB_NAME' already exists${NC}"
    read -p "Do you want to drop and recreate it? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Dropping database..."
        dropdb -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME
        echo -e "${GREEN}✓ Database dropped${NC}"
    else
        echo "Skipping database creation"
    fi
fi

# Create database if it doesn't exist
if ! psql -h $DB_HOST -p $DB_PORT -U $DB_USER -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
    echo "Creating database..."
    createdb -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME
    echo -e "${GREEN}✓ Database created${NC}"
fi

# Run migrations
echo ""
echo "Running migrations..."
echo ""

echo "1. Creating users table..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f ../migrations/001_create_users_table.sql
echo -e "${GREEN}✓ Users table created${NC}"

echo "2. Creating deposits table..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f ../migrations/002_create_deposits_table.sql
echo -e "${GREEN}✓ Deposits table created${NC}"

echo ""
echo -e "${GREEN}Database setup complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Copy .env.example to .env and configure your environment variables"
echo "  2. Generate a wallet encryption key:"
echo "     node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
echo "  3. Install dependencies: npm install"
echo "  4. Start the server: npm run dev"
echo ""
