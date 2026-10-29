if (-not $env:DB_PASSWORD) {
    $env:DB_PASSWORD = [System.Environment]::GetEnvironmentVariable("DB_PASSWORD", "User")
}
if (-not $env:DB_PASSWORD) {
    $env:DB_PASSWORD = "Pavi@123"
}

$mysqlBin = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
$cleanupQuery = @"
DELETE FROM smart_household.notifications WHERE user_id IN (7, 8);
DELETE FROM smart_household.customer_profiles WHERE user_id IN (7, 8);
DELETE FROM smart_household.users WHERE id IN (7, 8);
SELECT id, name, email, role, status FROM smart_household.users;
"@

& $mysqlBin -u root -p"$($env:DB_PASSWORD)" -e $cleanupQuery
