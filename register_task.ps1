# タスクスケジューラ登録用スクリプト

# パスの設定
$project_dir = "C:\Users\hiros\OneDrive\デスクトップ\Antigravity\HighYield\weekly-icebreak-email"
$script_path = Join-Path $project_dir "index.js"
$node_path = (Get-Command node).Source

$task_name = "WeeklyIcebreakEmailer"
$description = "毎週のアイスブレイク用スライド画像を生成し、エンジニア向けにメール配信します。"

# アクション (Node.js 実行)
$action = New-ScheduledTaskAction -Execute $node_path -Argument "`"$script_path`"" -WorkingDirectory $project_dir

# トリガー (毎週月曜 09:00 AM)
$trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Monday -At 9:00AM

# 登録 (既存があれば削除)
if (Get-ScheduledTask -TaskName $task_name -ErrorAction SilentlyContinue) {
    Unregister-ScheduledTask -TaskName $task_name -Confirm:$false
}

Register-ScheduledTask -TaskName $task_name -Action $action -Trigger $trigger -Description $description
Write-Host "Task '$task_name' registered successfully!" -ForegroundColor Green
