$origPath = 'c:\Users\camilo\contex360-vue\src\stores\stateStore.ts'

$patchPath = 'c:\Users\camilo\contex360-vue\src\stores\stateStore_patch.txt'
$orig = Get-Content $origPath
$patch = Get-Content $patchPath
$final = $orig[0..1804] + $patch + $orig[1806..($orig.Length-1)]
$final | Set-Content $origPath
