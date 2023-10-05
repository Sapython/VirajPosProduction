!macro customHeader
    RequestExecutionLevel admin
!macroend
!macro customInstall
	CreateDirectory $INSTDIR\utilities
	File /oname=$PLUGINSDIR\rawprint.exe "${BUILD_RESOURCES_DIR}\rawprint.exe"
	CopyFiles $PLUGINSDIR\rawprint.exe $INSTDIR\utilities\rawprint.exe
	${ifNot} ${isUpdated}
		EnVar::SetHKLM
		EnVar::AddValue "path" $INSTDIR\utilities
		Pop $0
		DetailPrint "EnVar::AddValue returned=|$0|"
	${endIf}
!macroend