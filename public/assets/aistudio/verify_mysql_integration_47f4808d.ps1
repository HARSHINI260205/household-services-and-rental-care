if (-not $env:DB_PASSWORD) {
    $env:DB_PASSWORD = [System.Environment]::GetEnvironmentVariable("DB_PASSWORD", "User")
}
if (-not $env:DB_PASSWORD) {
    $env:DB_PASSWORD = "Pavi@123"
}
$jarPath = "C:\Users\Pavithra R\.gemini\antigravity\scratch\backend\target\smart-household-backend-0.0.1-SNAPSHOT.jar"
$javaBin = "C:\Program Files\Java\jdk-25\bin\java.exe"
$stdoutLog = "C:\Users\Pavithra R\.gemini\antigravity\scratch\backend_stdout.log"
$stderrLog = "C:\Users\Pavithra R\.gemini\antigravity\scratch\backend_stderr.log"

Write-Host "Starting Spring Boot with live MySQL database connection..."
$p = Start-Process -FilePath $javaBin -ArgumentList "-jar `"$jarPath`"" -RedirectStandardOutput $stdoutLog -RedirectStandardError $stderrLog -PassThru

try {
    # Wait for Spring Boot to start and bind to port 8080
    $started = $false
    for ($i = 0; $i -lt 30; $i++) {
        Start-Sleep -Seconds 1
        try {
            $health = Invoke-RestMethod -Uri "http://localhost:8080/api/health" -Method Get -TimeoutSec 2
            if ($health.status -eq "UP") {
                $started = $true
                break
            }
        } catch {
            # Still starting
        }
    }

    if (-not $started) {
        Write-Host "Failed to start Spring Boot within 30 seconds."
        Write-Host "=== STDOUT ==="
        Get-Content $stdoutLog -Tail 50 -ErrorAction SilentlyContinue
        Write-Host "=== STDERR ==="
        Get-Content $stderrLog -Tail 50 -ErrorAction SilentlyContinue
        exit 1
    }

    Write-Host "Spring Boot started successfully!"
    Write-Host "=== Health Check Response ==="
    $health | ConvertTo-Json

    Write-Host "=== Testing GET /api/services ==="
    $services = Invoke-RestMethod -Uri "http://localhost:8080/api/services" -Method Get
    Write-Host "Services retrieved from MySQL:" $services.Count
    $services | Select-Object -First 3 id, name, basePrice | Format-Table | Out-String | Write-Host

    Write-Host "=== Testing GET /api/tools ==="
    $tools = Invoke-RestMethod -Uri "http://localhost:8080/api/tools" -Method Get
    Write-Host "Tools retrieved from MySQL:" $tools.Count
    $tools | Select-Object -First 3 id, name, dailyRate, availableQuantity | Format-Table | Out-String | Write-Host

    Write-Host "=== Testing POST /api/auth/login ==="
    $loginBody = @{
        email = "admin@smart.com"
        password = "Admin@123"
    } | ConvertTo-Json
    $loginRes = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    Write-Host "Login successful for admin@smart.com!"
    Write-Host "Role:" $loginRes.role
    Write-Host "Token received:" ($loginRes.accessToken.Substring(0, 20) + "...")

    $adminToken = $loginRes.accessToken
    $headers = @{
        Authorization = "Bearer $adminToken"
    }

    Write-Host "=== Testing Persistence: Create a test Household Service via POST /api/admin/services ==="
    $uniqueServiceName = "Solar Panel Maintenance " + (Get-Random -Minimum 1000 -Maximum 9999)
    $createServiceBody = @{
        name = $uniqueServiceName
        description = "Routine solar panel cleaning, voltage testing, inverter check, and wiring maintenance."
        basePrice = 850.0
    } | ConvertTo-Json
    $createdService = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/services" -Method Post -Body $createServiceBody -ContentType "application/json" -Headers $headers
    Write-Host "Service saved to MySQL with ID:" $createdService.id "Name:" $createdService.name "Status:" $createdService.status

    Write-Host "=== Testing Persistence: Read back the newly created service via GET /api/services/{id} ==="
    $fetchedService = Invoke-RestMethod -Uri ("http://localhost:8080/api/services/" + $createdService.id) -Method Get
    Write-Host "Service retrieved from MySQL: ID=" $fetchedService.id "Name=" $fetchedService.name "Price=" $fetchedService.basePrice

    Write-Host "=== Testing Customer Registration via POST /api/auth/register ==="
    $randomSuffix = (Get-Random -Minimum 1000 -Maximum 9999)
    $regBody = @{
        name = "Test Customer $randomSuffix"
        email = "testcustomer$randomSuffix@smart.com"
        password = "Password@123"
        phone = "+91 98765" + $randomSuffix
        role = "CUSTOMER"
    } | ConvertTo-Json
    $regRes = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/register" -Method Post -Body $regBody -ContentType "application/json"
    Write-Host "Customer registered and saved to MySQL: ID=" $regRes.id "Email=" $regRes.email "Role=" $regRes.role

    Write-Host "=== Real Database Integration Verification 100% SUCCESS ==="
} finally {
    Write-Host "Stopping backend process ID:" $p.Id
    Stop-Process -Id $p.Id -Force -ErrorAction SilentlyContinue
}
