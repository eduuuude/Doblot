@echo off
setlocal EnableDelayedExpansion
set MAX_TRIES_DOBLOT=%1
rem Populate the array with existent files in folder
set h=0
for /L %%c in (1, 1, %MAX_TRIES_DOBLOT%) do (                                                                             
   for /f "tokens=2 delims==; " %%c in (' wmic process call create "node.exe D:\Users\es_95\Documents\GitHub\Doblot\Doblot doblot.js -n Doblot%%c -p Human%%c" ^| find "ProcessId" ') do (
      set /A h+=1
      set listDoblots[!h!]=%%c
   )
)
set PIDListDoblots=%h%

rem Display array elements
for /L %%h in (1,1,%PIDListDoblots%) do echo node %%h: "!listDoblots[%%h]!"

pause

for /L %%h in (1,1,%PIDListDoblots%) do taskkill /F /PID "!listDoblots[%%h]!"
rem echo notepad %%i: "!list[%%i]!"