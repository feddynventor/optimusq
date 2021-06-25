@echo off
pushd %~dp0

mkdir %appdata%\EliminaCodeCassa
xcopy /s * %appdata%\EliminaCodeCassa\*

:--------------------------------------

echo Set oWS = WScript.CreateObject("WScript.Shell") > CreateShortcut.vbs
echo sLinkFile = "%appdata%\Microsoft\Windows\Start Menu\Programs\Startup\code_cassa.lnk" >> CreateShortcut.vbs
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> CreateShortcut.vbs
echo oLink.TargetPath = "%windir%\System32\cmd.exe" >> CreateShortcut.vbs
echo oLink.Arguments = "/B cmd /C %appdata%\EliminaCodeCassa\cassa.exe" >> CreateShortcut.vbs
echo oLink.WindowStyle = 7 >> CreateShortcut.vbs
echo oLink.Save >> CreateShortcut.vbs
cscript CreateShortcut.vbs
del CreateShortcut.vbs

echo INSTALLAZIONE COMPLETATA. PREMERE INVIO PER APRIRE IL FILE DI CONFIGURAZIONE.
pause
notepad.exe %appdata%\EliminaCodeCassa\cassa.conf

@REM "%appdata%\EliminaCodeCassa\cassa.exe"