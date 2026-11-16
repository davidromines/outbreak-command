# Keeps Windows awake while the simulator runs (stops when runs\keepawake.flag is deleted). Does not change any settings.
param([string]$Flag)
$sig = '[DllImport("kernel32.dll")] public static extern uint SetThreadExecutionState(uint esFlags);'
$k = Add-Type -MemberDefinition $sig -Name Power -Namespace Win32 -PassThru
while (Test-Path $Flag) { $k::SetThreadExecutionState([uint32]"0x80000001") | Out-Null; Start-Sleep -Seconds 30 }
$k::SetThreadExecutionState([uint32]"0x80000000") | Out-Null
