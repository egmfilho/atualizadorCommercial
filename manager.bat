@REM @Author: egmfilho
@REM @Date:   2017-08-22 14:49:44
@REM @Last Modified by:   egmfilho
@REM Modified time: 2017-08-24 13:32:20

@ECHO Initializing manager
@ECHO Opening program...

@CALL "update.exe" -s

@IF %ERRORLEVEL% == 0 @GOTO no_error

@ECHO Errors encountered during execution. Exited with status: %ERRORLEVEL%
@EXIT /b %ERRORLEVEL%

:no_error
@DEL "update.exe"
@ECHO Update successful!
@EXIT /b 0