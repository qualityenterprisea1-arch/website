# Register the lead pipeline as scheduled Windows tasks.
#
#   powershell -ExecutionPolicy Bypass -File C:\qualityenterprises\scripts\leads\install-schedule.ps1
#
# Use the full path. Running it as `scripts\leads\...` only works if the shell
# happens to be sitting in the repo, which a fresh PowerShell window is not.
#
# Two tasks, deliberately separate so a slow sweep can never delay the digest
# and a failed digest never looks like a failed sweep:
#
#   QE lead sweep    Monday 07:00  - discover, enrich, find buyers, score, store
#   QE lead digest   Monday 09:00  - email the week's grade A and B to the factory
#
# Secrets are read with --env-file at run time. A scheduled task inherits no
# shell session, so nothing here depends on an exported variable.
#
# Remove with:  Unregister-ScheduledTask -TaskName "QE lead sweep" -Confirm:$false

param(
  [string]$Repo     = "C:\qualityenterprises",
  [string]$EnvFile  = "C:\qe-leads-dashboard\.env",
  [string]$SweepAt  = "07:00",
  [string]$DigestAt = "09:00",
  [string]$Day      = "Monday"
)

$ErrorActionPreference = "Stop"

foreach ($p in @($Repo, $EnvFile)) {
  if (-not (Test-Path $p)) { throw "Not found: $p" }
}
$node = (Get-Command node).Source
$log  = Join-Path $env:TEMP "qe-leads.log"

<# Register-ScheduledTask rather than schtasks.exe: the /tr string has to carry
   a full command line, and schtasks parses flags out of it. `cd /d <repo>` made
   it fail with "'/d' option is not allowed more than 1 time(s)", because it read
   the cd's own switch as its day-of-week flag. The API takes the arguments as
   data and never re-parses them. #>
function Register-QeTask {
  param([string]$Name, [string]$Script, [string[]]$Extra, [string]$At)

  $scriptPath = Join-Path $Repo $Script
  if (-not (Test-Path $scriptPath)) { throw "Not found: $scriptPath" }

  # Redirect through cmd so both streams land in one readable log.
  $inner = @("--env-file=`"$EnvFile`"", "`"$scriptPath`"") + $Extra -join " "
  $action = New-ScheduledTaskAction -Execute "cmd.exe" `
    -Argument "/c `"`"$node`" $inner >> `"$log`" 2>&1`"" `
    -WorkingDirectory $Repo

  $trigger  = New-ScheduledTaskTrigger -Weekly -DaysOfWeek $Day -At $At
  # Do not start a sweep on battery, and do not kill it at the 3-day default.
  $settings = New-ScheduledTaskSettingsSet -StartWhenAvailable `
    -DontStopIfGoingOnBatteries -AllowStartIfOnBatteries `
    -ExecutionTimeLimit (New-TimeSpan -Hours 3)

  Register-ScheduledTask -TaskName $Name -Action $action -Trigger $trigger `
    -Settings $settings -Description "Quality Enterprises lead pipeline" -Force | Out-Null
  Write-Host "  registered  $Name  ($Day $At)"
}

Write-Host "`nRegistering scheduled tasks:"
Register-QeTask -Name "QE lead sweep"  -Script "scripts\leads\run.mjs"    -Extra @("--quiet") -At $SweepAt
Register-QeTask -Name "QE lead digest" -Script "scripts\leads\digest.mjs" -Extra @("--days","8") -At $DigestAt

Write-Host "`nLog: $log"
Write-Host "Run one now to test:  Start-ScheduledTask -TaskName 'QE lead sweep'"
Write-Host "The sweep never contacts anyone. The digest emails the factory only.`n"
