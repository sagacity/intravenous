@echo off 
set InNuSpec=nuget\Package.nuspec
set OutNuSpec=output\Package.nuspec
set InNpmSpec=npm\package.json
set OutNpmSpec=output\package.json
set InNpmIgnore=npm\.npmignore
set OutNpmIgnore=output\.npmignore
set OutDebugFile=output\intravenous-latest.debug.js
set OutMinFile=output\intravenous-latest.js
set OutNpmFile=output\lib\intravenous.js
set AllFiles=
for /f "eol=] skip=1 delims=' " %%i in (fragments\source-references.js) do set Filename=%%i& call :Concatenate 

if not exist output md output
if not exist output\lib md output\lib

goto :Combine
:Concatenate 
    if /i "%AllFiles%"=="" ( 
        set AllFiles=..\%Filename:/=\%
    ) else ( 
        set AllFiles=%AllFiles% ..\%Filename:/=\%
    ) 
goto :EOF 

:Combine
type fragments\amd-pre.js         > %OutDebugFile%.temp
type %AllFiles%                   >> %OutDebugFile%.temp
type fragments\amd-post.js        >> %OutDebugFile%.temp

@rem Now call Google Closure Compiler to produce a minified version
tools\curl -d output_info=compiled_code -d output_format=text -d compilation_level=ADVANCED_OPTIMIZATIONS --data-urlencode "js_code=/**@const*/var DEBUG=false;" --data-urlencode js_code@%OutDebugFile%.temp "http://closure-compiler.appspot.com/compile" > %OutMinFile%.temp

@rem Finalise each file by prefixing with version header and surrounding in function closure
copy /y fragments\version-header.js %OutDebugFile%
echo (function(window,undefined){>> %OutDebugFile%
echo var DEBUG=true;>> %OutDebugFile%
type %OutDebugFile%.temp                            >> %OutDebugFile%
echo })(typeof window !== "undefined" ? window : global);>> %OutDebugFile%
del %OutDebugFile%.temp

copy /y fragments\version-header.js %OutMinFile%
echo (function(window,undefined){>> %OutMinFile%
type %OutMinFile%.temp                              >> %OutMinFile%
echo })(typeof window !== "undefined" ? window : global);>> %OutMinFile%
del %OutMinFile%.temp

@rem Inject the version number string
set /p Version= <fragments\version.txt
cscript tools\searchReplace.js "##VERSION##" %VERSION% %OutDebugFile% %OutMinFile%
cscript tools\searchReplace.js "\r\n" "\n" %OutDebugFile%  %OutMinFile%

@rem Nuget stuff
copy /y %InNuSpec% %OutNuSpec%
cscript tools\searchReplace.js "##VERSION##" %VERSION% %OutNuSpec%
nuget pack %OutNuSpec% -OutputDirectory output

@rem NPM stuff
copy /y %InNpmSpec% %OutNpmSpec%
copy /y %InNpmIgnore% %OutNpmIgnore%
cscript tools\searchReplace.js "##VERSION##" %VERSION% %OutNpmSpec%
copy /y %OutDebugFile% %OutNpmFile%