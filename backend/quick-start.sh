#!/bin/bash

echo "🚀 School Management System - Quick Start"
echo "========================================"
echo ""

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL not found. Please install PostgreSQL 15 or 16."
    echo "   Ubuntu/Debian: sudo apt install postgresql postgresql-contrib"
    echo "   macOS: brew install postgresql@15"
    echo ""
    echo "After installation, run this script again."
    exit 1
fi

echo "✅ PostgreSQL found"

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "✅ .env file created"
else
    echo "✅ .env file exists"
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed"
fi

echo ""
echo "📋 Next Steps:"
echo "=============="
echo ""
echo "1. Set up PostgreSQL database:"
echo "   sudo -u postgres psql"
echo "   CREATE DATABASE school_db;"
echo "   CREATE USER postgres WITH PASSWORD 'postgres';"
echo "   GRANT ALL PRIVILEGES ON DATABASE school_db TO postgres;"
echo "   \\q"
echo ""
echo "2. Update .env file with your database credentials"
echo ""
echo "3. Start the development server:"
echo "   npm run start:dev"
echo ""
echo "4. Test the Students API:"
echo "   See STUDENTS_MODULE.md for API documentation"
echo ""
echo "5. Access the API at: http://localhost:3000/api"
echo ""
