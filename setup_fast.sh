#!/bin/bash

# PaloCheck Auto-Setup Script
echo "--- Iniciando Setup do PaloCheck ---"

# 1. Backend Setup
echo "Configurando Backend..."
cd backend
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
cd ..

# 2. Frontend Setup
echo "Configurando Frontend..."
cd frontend
npm install
cd ..

echo "--- Setup Concluído! ---"
echo "Para rodar o sistema:"
echo "1. No terminal 1 (Backend): cd backend && source venv/bin/activate && uvicorn main:app --reload"
echo "2. No terminal 2 (Frontend): cd frontend && npm run dev"
