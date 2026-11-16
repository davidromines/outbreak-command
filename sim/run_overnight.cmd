@echo off
rem Outbreak Command balance simulator - one night of runs. Double-click before bed; it stops starting new runs at 07:00.
cd /d "%~dp0"
set PY="%LOCALAPPDATA%\Programs\Python\Python312\python.exe"
for /f %%d in ('powershell -NoProfile -Command "Get-Date -Format yyyy-MM-dd"') do set D=%%d
set NIGHT=%~dp0runs\%D%
if not exist "%NIGHT%" mkdir "%NIGHT%"
echo running > "%NIGHT%\keepawake.flag"
start "" /min powershell -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "%~dp0keepawake.ps1" -Flag "%NIGHT%\keepawake.flag"
node build_core.js > "%NIGHT%\log.txt" 2>&1
if not exist "%NIGHT%\jobs.jsonl" %PY% make_jobs.py "%NIGHT%\jobs.jsonl" >> "%NIGHT%\log.txt" 2>&1
node pool.js "%NIGHT%\jobs.jsonl" "%NIGHT%\results.jsonl" --until 07:00 --packs packs >> "%NIGHT%\log.txt" 2>&1
%PY% analyze.py "%NIGHT%\results.jsonl" "%NIGHT%\jobs.jsonl" "%NIGHT%\report.html" >> "%NIGHT%\log.txt" 2>&1
del "%NIGHT%\keepawake.flag"
echo done >> "%NIGHT%\log.txt"
