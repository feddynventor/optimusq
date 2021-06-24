@echo off
pushd %~dp0

echo Installando Python
python-3.9.2.exe /quiet InstallAllUsers=1 PrependPath=1
echo Installando Librerie
pip install PyQt5==5.15.4 PyQtWebEngine==5.15.4

mkdir %appdata%\EliminaCodeCassa
copy * %appdata%\EliminaCodeCassa\*

:--------------------------------------

echo Set oWS = WScript.CreateObject("WScript.Shell") > CreateShortcut.vbs
echo sLinkFile = "%appdata%\Microsoft\Windows\Start Menu\Programs\Startup\code_cassa.lnk" >> CreateShortcut.vbs
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> CreateShortcut.vbs
echo oLink.TargetPath = "%appdata%\EliminaCodeCassa\cassa.exe" >> CreateShortcut.vbs
echo oLink.WindowStyle = 7 >> CreateShortcut.vbs
echo oLink.Save >> CreateShortcut.vbs
cscript CreateShortcut.vbs
del CreateShortcut.vbs