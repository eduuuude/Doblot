@echo off
setlocal EnableDelayedExpansion
set MAX_TRIES_HUMAN=%1
rem Populate the array with existent files in folder
set i=0
for /L %%a in (1, 1, %MAX_TRIES_HUMAN%) do (                                                                             
   for /f "tokens=2 delims==; " %%b in (' wmic process call create "node.exe D:\Users\es_95\Documents\GitHub\Doblot\Human_emulation human_emulation.js -n Human%%a" ^| find "ProcessId" ') do (
      set /A i+=1
      set list[!i!]=%%b
   )
)
set PIDListHumans=%i%

rem Display array elements
for /L %%i in (1,1,%PIDListHumans%) do echo node %%i: "!list[%%i]!"

pause

for /L %%i in (1,1,%PIDListHumans%) do taskkill /F /PID "!list[%%i]!"
rem echo notepad %%i: "!list[%%i]!"