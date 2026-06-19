$env:CI = "true"
$env:XDG_CONFIG_HOME = Join-Path $PSScriptRoot "..\.wrangler-config"
pnpm dev
