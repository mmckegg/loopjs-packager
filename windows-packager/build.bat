heat dir "..\build\Loop Drop-win32" -o directory.wxs -cg Content -sfrag -gg -g1 -dr APPLICATIONROOTDIRECTORY -t ".\transform.xslt"
candle main.wxs directory.wxs -ext WixUIExtension -ext WixUtilExtension
light main.wixobj directory.wixobj -b "..\build\Loop Drop-win32" -o "Loop Drop.msi"
del *.wixobj *.wixpdb directory.wxs
@pause