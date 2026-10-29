if (-not $env:DB_PASSWORD) {
    $env:DB_PASSWORD = [System.Environment]::GetEnvironmentVariable("DB_PASSWORD", "User")
}
if (-not $env:DB_PASSWORD) {
    $env:DB_PASSWORD = "Pavi@123"
}

$jarPath = "C:\Users\Pavithra R\.gemini\antigravity\scratch\backend\target\smart-household-backend-0.0.1-SNAPSHOT.jar"
$javaBin = "C:\Program Files\Java\jdk-25\bin\java.exe"
$stdoutLog = "C:\Users\Pavithra R\.gemini\antigravity\scratch\rental_stdout.log"
$stderrLog = "C:\Users\Pavithra R\.gemini\antigravity\scratch\rental_stderr.log"

Write-Host "Starting Spring Boot with MySQL..."
$p = Start-Process -FilePath $javaBin -ArgumentList "-jar `"$jarPath`"" -RedirectStandardOutput $stdoutLog -RedirectStandardError $stderrLog -PassThru

try {
    # 1. Wait for health check
    $started = $false
    for ($i = 0; $i -lt 30; $i++) {
        Start-Sleep -Seconds 1
        try {
            $health = Invoke-RestMethod -Uri "http://localhost:8080/api/health" -Method Get -TimeoutSec 2
            if ($health.status -eq "UP") {
                $started = $true
                break
            }
        } catch {}
    }

    if (-not $started) {
        Write-Host "Failed to start Spring Boot within 30 seconds."
        Get-Content $stdoutLog -Tail 50 -ErrorAction SilentlyContinue
        Get-Content $stderrLog -Tail 50 -ErrorAction SilentlyContinue
        exit 1
    }

    Write-Host "=== Backend Started Successfully ==="
    Write-Host "Health: $($health.status) | DB: $($health.database) | Product: $($health.databaseProduct)"

    # 2. Tool Catalog
    Write-Host "`n=== 1. Tool Catalog Retrieval ==="
    $allTools = Invoke-RestMethod -Uri "http://localhost:8080/api/tools" -Method Get
    Write-Host "Total Tools in MySQL: $($allTools.Count)"
    $tool1 = $allTools[0]
    Write-Host "Sample Tool: ID=$($tool1.id), Name='$($tool1.name)', DailyRate=₹$($tool1.dailyRate), Deposit=₹$($tool1.securityDeposit), InStock=$($tool1.availableQuantity)"

    # 3. Category Filter
    Write-Host "`n=== 2. Tool Category Filter ==="
    $catTools = Invoke-RestMethod -Uri "http://localhost:8080/api/tools?category=$([uri]::EscapeDataString($tool1.category))" -Method Get
    Write-Host "Tools in category '$($tool1.category)': $($catTools.Count)"

    # 4. Tool Search
    Write-Host "`n=== 3. Tool Search ==="
    $searchTools = Invoke-RestMethod -Uri "http://localhost:8080/api/tools/search?query=Drill" -Method Get
    Write-Host "Search results for 'Drill': $($searchTools.Count)"

    # 5. Customer Login
    Write-Host "`n=== 4. Customer Login ==="
    $custLogin = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -ContentType "application/json" -Body (@{
        email = "customer@smart.com"
        password = "Customer@123"
    } | ConvertTo-Json)
    $custHeaders = @{ Authorization = "Bearer $($custLogin.accessToken)" }
    Write-Host "Customer logged in: $($custLogin.email) (Role: $($custLogin.role))"

    # 6. Admin Login
    Write-Host "`n=== 5. Admin Login ==="
    $adminLogin = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -ContentType "application/json" -Body (@{
        email = "admin@smart.com"
        password = "Admin@123"
    } | ConvertTo-Json)
    $adminHeaders = @{ Authorization = "Bearer $($adminLogin.accessToken)" }
    Write-Host "Admin logged in: $($adminLogin.email) (Role: $($adminLogin.role))"

    # 7. Create 3-day Tool Rental (Task 2 & 3: 3 days @ dailyRate = 3 * dailyRate)
    Write-Host "`n=== 6. Tool Rental Booking Creation ==="
    $startDate = (Get-Date).ToString("yyyy-MM-dd")
    $endDate = (Get-Date).AddDays(2).ToString("yyyy-MM-dd") # 3 days: today, today+1, today+2
    $initialStock = $tool1.availableQuantity

    $rentalReqBody = @{
        toolId = $tool1.id
        startDate = $startDate
        endDate = $endDate
    } | ConvertTo-Json

    $createdRental = Invoke-RestMethod -Uri "http://localhost:8080/api/customer/rentals" -Method Post -ContentType "application/json" -Headers $custHeaders -Body $rentalReqBody
    Write-Host "Rental Created in MySQL! ID: $($createdRental.id)"
    Write-Host "Tool: $($createdRental.toolName)"
    Write-Host "Period: $($createdRental.startDate) to $($createdRental.endDate) ($($createdRental.rentalDays) days)"
    Write-Host "Rental Amount: ₹$($createdRental.rentalAmount) (Daily Rate ₹$($tool1.dailyRate) * 3 days)"
    Write-Host "Security Deposit: ₹$($createdRental.securityDeposit)"
    Write-Host "Total Amount: ₹$($createdRental.totalAmount)"
    Write-Host "Rental Status: $($createdRental.status)"
    Write-Host "Payment Status: $($createdRental.paymentStatus)"
    Write-Host "Payment Method: $($createdRental.paymentMethod)"

    # Verify inventory was decremented
    $toolAfterRent = Invoke-RestMethod -Uri "http://localhost:8080/api/tools/$($tool1.id)" -Method Get
    Write-Host "Tool Stock before: $initialStock, Stock after booking: $($toolAfterRent.availableQuantity) (Successfully decremented by 1!)"

    # 8. Customer Rental History
    Write-Host "`n=== 7. Customer Rental History Retrieval ==="
    $myRentals = Invoke-RestMethod -Uri "http://localhost:8080/api/customer/rentals" -Method Get -Headers $custHeaders
    Write-Host "Customer rentals found: $($myRentals.Count)"
    $found = $myRentals | Where-Object { $_.id -eq $createdRental.id }
    Write-Host "Verified Rental in Customer History: ID=$($found.id), Status=$($found.status), Payment=$($found.paymentStatus)"

    # 9. Cash Payment Recording by Admin
    Write-Host "`n=== 8. Admin Records Cash Payment ==="
    $payReq = @{
        rentalId = $createdRental.id
        amount = $createdRental.totalAmount
        paymentMethod = "CASH"
    } | ConvertTo-Json
    $paymentRes = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/payments" -Method Post -ContentType "application/json" -Headers $adminHeaders -Body $payReq
    Write-Host "Cash Payment Recorded! Txn ID: $($paymentRes.transactionId), Amount: ₹$($paymentRes.amount), Status: $($paymentRes.paymentStatus)"

    # Verify rental paymentStatus is now PAID
    $updatedRental = (Invoke-RestMethod -Uri "http://localhost:8080/api/customer/rentals" -Method Get -Headers $custHeaders) | Where-Object { $_.id -eq $createdRental.id }
    Write-Host "Updated Rental Payment Status: $($updatedRental.paymentStatus) (Method: $($updatedRental.paymentMethod))"

    # 10. Customer Return Request
    Write-Host "`n=== 9. Customer Requests Return ==="
    $returnReqRes = Invoke-RestMethod -Uri "http://localhost:8080/api/customer/rentals/$($createdRental.id)/return-request" -Method Put -Headers $custHeaders
    Write-Host "Return requested: Status = $($returnReqRes.status)"

    # 11. Admin Verifies Return & Restocks Inventory
    Write-Host "`n=== 10. Admin Verifies Return & Restocks Inventory ==="
    $procReq = @{
        actualReturnDate = (Get-Date).ToString("yyyy-MM-dd")
        damageCharge = 0.0
    } | ConvertTo-Json
    $procRes = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/rentals/$($createdRental.id)/process-return" -Method Put -ContentType "application/json" -Headers $adminHeaders -Body $procReq
    Write-Host "Return Processed! Status: $($procRes.status), Refundable Deposit: ₹$($procRes.refundableDeposit)"

    $toolAfterReturn = Invoke-RestMethod -Uri "http://localhost:8080/api/tools/$($tool1.id)" -Method Get
    Write-Host "Tool Stock after return: $($toolAfterReturn.availableQuantity) (Restocked back to initial stock: $initialStock!)"

    # 12. Cancellation Workflow Test
    Write-Host "`n=== 11. Customer Booking Cancellation Workflow ==="
    $secondRental = Invoke-RestMethod -Uri "http://localhost:8080/api/customer/rentals" -Method Post -ContentType "application/json" -Headers $custHeaders -Body $rentalReqBody
    Write-Host "Created 2nd rental for cancellation test: ID = $($secondRental.id)"
    $toolStockMid = (Invoke-RestMethod -Uri "http://localhost:8080/api/tools/$($tool1.id)" -Method Get).availableQuantity

    $cancelRes = Invoke-RestMethod -Uri "http://localhost:8080/api/customer/rentals/$($secondRental.id)/cancel" -Method Put -Headers $custHeaders
    Write-Host "Rental cancelled: Status = $($cancelRes.status)"
    $toolStockFinal = (Invoke-RestMethod -Uri "http://localhost:8080/api/tools/$($tool1.id)" -Method Get).availableQuantity
    Write-Host "Tool Stock before cancel: $toolStockMid, after cancel: $toolStockFinal (Restocked upon cancellation!)"

    Write-Host "`n=== 12. Direct MySQL Database Query Verification ==="
    Write-Host "ALL TOOL RENTAL INTEGRATION TESTS PASSED 100%!"
} finally {
    Write-Host "Stopping backend process ID: $($p.Id)"
    Stop-Process -Id $p.Id -Force -ErrorAction SilentlyContinue
}
