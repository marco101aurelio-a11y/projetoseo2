@echo off
cd /d "%~dp0olist-analytics-local\src"
..\..\.venv\Scripts\python.exe -m uvicorn main_api:app --reload --host 127.0.0.1 --port 8000
