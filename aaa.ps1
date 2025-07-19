#!powershell
function Invoke-Check {
  param($Command)
  Write-Host "> $Command" -ForegroundColor Cyan
  Invoke-Expression $Command
  if ($LASTEXITCODE -ne 0) {
    throw "Error: $Command"
  }
}

function Build {
  Remove-Item -Recurse -Force -ErrorAction SilentlyContinue ./.vitepress/dist
  Invoke-Check "pnpm build"
}

function Site {
  Build
  Copy-Item ./README.md ./.vitepress/dist
  Set-Location ./.vitepress/dist
  Invoke-Check "git init"
  Invoke-Check "git remote add origin git@github.com:161043261/161043261.github.io.git"
  Invoke-Check "git add -A"
  Invoke-Check "git commit -m 'feat: Introduce new features'"
  Invoke-Check "git push -f origin main --set-upstream"
  Set-Location ../..
}

function Get-CommitMessage {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Type,
    [Parameter(Mandatory = $true)]
    [string]$Message
  )
  $dateStamp = Get-Date -Format "yyyy-MM-dd HH:mm"
  return "${Type}: ${Message} ($dateStamp)"
}

function GitCommit {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Type,
    [Parameter(Mandatory = $true)]
    [string]$Message
  )
  $fullMessage = Get-CommitMessage $Type $Message
  Invoke-Check "git add -A"
  Invoke-Check "git commit -m '$fullMessage'"
  Invoke-Check "git push origin main"
}

function Chore {
  GitCommit "chore" "Regular code maintenance"
}

function Feat {
  GitCommit "feat" "Introduce new features"
}

function Fix {
  GitCommit "fix" "Fix some bugs"
}

function Style {
  GitCommit "style" "Update styling"
}

function Refactor {
  GitCommit "refactor" "Refactor code"
}

function Test {
  GitCommit "test" "Create/Update testing"
}

function Docs {
  GitCommit "docs" "Create/Update docs"
}

function Perf {
  GitCommit "perf" "Performance optimization"
}

function Init {
  Remove-Item -Recurse -Force -ErrorAction SilentlyContinue ./.git
  Invoke-Check "git init"
  Invoke-Check "git remote add origin git@github.com:161043261/tiancheng.git"
  Invoke-Check "git add -A"
  Invoke-Check "git commit -m 'Initial commit'"
  Invoke-Check "git push -f origin main --set-upstream"
}

function Show-Help {
  @"
Phony:
  Build    - Vitepress build
  Site     - Site deploy
  Chore    - Regular code maintenance
  Feat     - Introduce new features
  Fix      - Fix some bugs
  Style    - Update styling
  Refactor - Refactor code
  Test     - Create/Update testing
  Docs     - Create/Update documentation
  Perf     - Performance optimization
  Init     - Initial commit

Example:
  .\deploy.ps1 build
"@ | Write-Host -ForegroundColor Yellow
}

if ($args.Count -eq 0) {
  Show-Help
  exit 1
}

$command = $args[0]
if ($command -eq "Help") {
  Show-Help
}
elseif (Get-Command $command -ErrorAction SilentlyContinue) {
  & $command
}
else {
  Write-Host "Invalid command: $command" -ForegroundColor Red
  Show-Help
  exit 1
}
