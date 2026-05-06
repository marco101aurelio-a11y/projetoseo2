@echo off
cd "c:\Users\jpsec\Downloads\Projeto antigravty\projetoseo2\olist-analytics-local\src"
..\..\.venv\Scripts\python.exe -m uvicorn main_api:app --reload --host 127.0.0.1 --port 8000
