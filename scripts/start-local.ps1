param([switch]$NoBrowser)
$ErrorActionPreference = 'Stop'
$projectPath = Split-Path -Parent $PSScriptRoot
$localUrl = 'http://localhost:5173/'
function Test-HeaderLocal {
    try {
        $response = Invoke-WebRequest -Uri $localUrl -UseBasicParsing -TimeoutSec 2
        return $response.StatusCode -eq 200 -and $response.Content -match 'Header'
    } catch { return $false }
}
if (-not (Test-HeaderLocal)) {
    if (-not (Test-Path -LiteralPath (Join-Path $projectPath 'node_modules'))) {
        throw 'Instale as dependencias com npm ci na pasta do Header antes de iniciar.'
    }
    $nodePath = (Get-Command node -ErrorAction Stop).Source
    $server = Start-Process -FilePath $nodePath -ArgumentList 'scripts/run-framework.mjs','dev' -WorkingDirectory $projectPath -WindowStyle Hidden -RedirectStandardOutput (Join-Path $projectPath 'dev-server.log') -RedirectStandardError (Join-Path $projectPath 'dev-server-error.log') -PassThru
    $deadline = (Get-Date).AddSeconds(45)
    while (-not (Test-HeaderLocal)) {
        if ($server.HasExited -or (Get-Date) -gt $deadline) {
            throw 'Nao foi possivel iniciar. Consulte dev-server-error.log na pasta do Header.'
        }
        Start-Sleep -Milliseconds 400
    }
}
Write-Host "Header disponivel em $localUrl"
if (-not $NoBrowser) { Start-Process $localUrl }
