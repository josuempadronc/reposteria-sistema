@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ========================================================
echo   GENERADOR DE APK ANDROID - SISTEMA REPOSTERIA POS
echo ========================================================
echo.
echo [1/3] Sincronizando archivos de la aplicacion en carpeta www...
node sync-www.js

if not exist "android" (
  echo [2/3] Instalando Capacitor Android y creando proyecto nativo...
  call npm install @capacitor/core @capacitor/cli @capacitor/android
  call npx cap add android
) else (
  echo [2/3] Actualizando proyecto nativo Android...
  call npx cap sync android
)

echo [3/3] Verificando Java JDK y Android SDK para compilar APK...
where java >nul 2>nul
if %errorlevel% neq 0 (
  echo.
  echo [AVISO] El proyecto nativo Android fue generado en la carpeta "android\".
  echo Para compilar el archivo .apk localmente necesitas tener instalado Java JDK 17+ y Android SDK,
  echo o puedes abrir la carpeta "android" en Android Studio y elegir: Build -^> Build APK(s).
  echo.
  echo RECOMENDACION RAPIDA SIN INSTALAR NADA:
  echo Abre http://localhost:8080, haz clic en el boton "App / APK" arriba a la derecha
  echo y escanea el Codigo QR con tu celular Android para instalar la App al instante por Wi-Fi.
  pause
  exit /b 0
)

cd android
call gradlew.bat assembleDebug
if exist "app\build\outputs\apk\debug\app-debug.apk" (
  copy /Y "app\build\outputs\apk\debug\app-debug.apk" "..\DulceReposteria_POS.apk" >nul
  echo.
  echo [EXITO] APK generada en: %~dp0DulceReposteria_POS.apk
)
pause

