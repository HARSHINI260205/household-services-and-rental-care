param([string]$baseDir)
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$entityDir = "$baseDir\entity"
$repoDir = "$baseDir\repository"
$dtoDir = "$baseDir\dto"
$secDir = "$baseDir\security"
$servDir = "$baseDir\service"
$servImplDir = "$baseDir\service\impl"
$ctrlDir = "$baseDir\controller"

New-Item -ItemType Directory -Path $entityDir, $repoDir, $dtoDir, $secDir, $servDir, $servImplDir, $ctrlDir -Force | Out-Null

Write-Output "Generating JPA Entities..."