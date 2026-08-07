@echo off
powershell -ExecutionPolicy Bypass -File scripts\merge-i18n.ps1
REM For older versions of Windows without IPv6 support use the following line instead:
REM set ip_address_string="IP Address"
set ip_address_string="IPv4 Address"

REM Detect IP Address with ipconfig
for /f "usebackq tokens=2 delims=:" %%a in (`ipconfig ^| findstr /r /c:%ip_address_string%`) do set IP=%%a
set IP=%IP: =%
hugo server --disableFastRender --bind 0.0.0.0 --baseURL http://%IP%:1313/smartrisk/