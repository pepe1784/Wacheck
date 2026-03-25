@echo off
chcp 65001 >nul
echo.
echo  Restaurando api/.env de PRODUCCION...
if exist "api\.env.prod" (
    copy "api\.env.prod" "api\.env" >nul
    echo  OK — api/.env restaurado (InfinityFree / produccion)
) else (
    echo  No se encontro api/.env.prod. Nada que restaurar.
)
echo.
pause
