!macro customHeader
    RequestExecutionLevel admin
!macroend
!macro customInstall
  File /oname=$PLUGINSDIR\rawprint.exe "${BUILD_RESOURCES_DIR}\rawprint.exe"
  nsExec::ExecToStack  'cmd /c setx /M PATH "%PATH%;${BUILD_RESOURCES_DIR}"'
!macroend