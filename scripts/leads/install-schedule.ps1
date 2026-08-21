# Register the lead pipeline as scheduled Windows tasks.
#
#   powershell -ExecutionPolicy Bypass -File scripts\leads\install-schedule.ps1
#
# Two tasks, deliberately separate so a slow sweep can never delay the digest
# and a failed digest never looks like a failed sweep:
#
#   QE lead sweep    Monday 07:00  - discover, enrich, score, store
#   QE lead digest   Monday 09:00  - email the week's grade A and B to the factory
#
# Secrets are read with --env-file at run time. A scheduled task inherits no
# shell session, so nothing here depends on an exported variable.
#
# Remove with:  schtasks /delete /tn "QE lead sweep" /f

param(
  [string]$Repo   = "C:\qualityenterprises",
  [string]$EnvFile = "C:\qe-leads-dashboard\.env",
  [string]$SweepAt = "07:00",
  [string]$DigestAt = "09:00",
  [string]$Day = "MON"
)

$ErrorActionPreference = "Stop"

foreach ($p in @($Repo, $EnvFile)) {
  if (-not (Test-Path $p)) { throw "Not found: $p" }
}
$node = (Get-Command node).Source
$log  = Join-Path $env:TEMP "qe-leads.log"

function Register-QeTask($name, $script, $extra, $at) {
  # cmd /c so stdout and stderr can be appended to one log the user can read.
  $cmd = "cmd /c `"cd /d $Repo && `"$node`" --env-file=`"$EnvFile`" $script $extra >> `"$log`" 2>&1`""
  schtasks /create /tn $name /sc weekly /d $Day /st $at /f /tr $cmd | Out-Null
  if ($LASTEXITCODE -ne 0) { throw "Failed to register $name" }
  Write-Host "  registered  $name  ($Day $at)"
}

Write-Host "`nRegistering scheduled tasks:"
Register-QeTask "QE lead sweep"  "scripts\leads\run.mjs"    "--quiet"            $SweepAt
Register-QeTask "QE lead digest" "scripts\leads\digest.mjs" "--days 8"           $DigestAt

Write-Host "`nLog: $log"
Write-Host "Run one now to test:  schtasks /run /tn `"QE lead sweep`""
Write-Host "The sweep never contacts anyone. The digest emails the factory only.`n"
