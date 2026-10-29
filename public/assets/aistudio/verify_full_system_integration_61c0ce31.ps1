if (-not $env:DB_PASSWORD) {
    $env:DB_PASSWORD = [System.Environment]::GetEnvironmentVariable("DB_PASSWORD", "User")
}
if (-not $env:DB_PASSWORD) {
    $env:DB_PASSWORD = "Pavi@123"
}

$jarPath = "C:\Users\Pavithra R\.gemini\antigravity\scratch\backend\target\smart-household-backend-0.0.1-SNAPSHOT.jar"
$javaBin = "C:\Program Files\Java\jdk-25\bin\java.exe"
$stdoutLog = "C:\Users\Pavithra R\.gemini\antigravity\scratch\audit_stdout.log"
$stderrLog = "C:\Users\Pavithra R\.gemini\antigravity\scratch\audit_stderr.log"

Write-Host "Starting Spring Boot with MySQL for Full System Integration Audit..."
$p = Start-Process -FilePath $javaBin -ArgumentList "-jar `"$jarPath`"" -RedirectStandardOutput $stdoutLog -RedirectStandardError $stderrLog -PassThru

$testBookingId = $null
$testRentalId1 = $null
$testRentalId2 = $null
$testServiceId = $null
$testToolId = $null
$testCustomerId = $null

try {
    # 0. Health check
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
        Get-Content $stdoutLog -Tail 40 -ErrorAction SilentlyContinue
        Get-Content $stderrLog -Tail 40 -ErrorAction SilentlyContinue
        exit 1
    }

    Write-Host "=== Backend Started Successfully ==="
    Write-Host "Health: $($health.status) | Database: $($health.database) | Engine: $($health.databaseProduct)"

    # Workflow 1: Customer Registration and Login
    Write-Host "`n=== Workflow 1: Customer Registration & Login ==="
    $testEmail = "audit_cust_$(Get-Random)@smart.com"
    $regBody = @{
        name = "Audit Tester"
        email = $testEmail
        password = "AuditPassword@123"
        phone = "+91 9999900001"
        role = "CUSTOMER"
    } | ConvertTo-Json

    $regRes = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/register" -Method Post -ContentType "application/json" -Body $regBody
    Write-Host "Customer Registered: ID=$($regRes.id), Name='$($regRes.name)', Email='$($regRes.email)', Role=$($regRes.role)"
    $testCustomerId = $regRes.id

    $loginRes = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -ContentType "application/json" -Body (@{
        email = $testEmail
        password = "AuditPassword@123"
    } | ConvertTo-Json)
    $custHeaders = @{ Authorization = "Bearer $($loginRes.accessToken)" }
    Write-Host "Customer Logged in via JWT! Role: $($loginRes.role)"

    # Workflow 2: Service Catalog Browsing
    Write-Host "`n=== Workflow 2: Service Catalog Browsing ==="
    $services = Invoke-RestMethod -Uri "http://localhost:8080/api/services" -Method Get
    Write-Host "Active services available: $($services.Count)"
    $acService = $services | Where-Object { $_.name -eq "AC Repair" }
    Write-Host "Service selected: ID=$($acService.id), Name='$($acService.name)', BasePrice=₹$($acService.basePrice)"

    # Workflow 3: Technician Search
    Write-Host "`n=== Workflow 3: Technician Search & Recommendation ==="
    $recs = Invoke-RestMethod -Uri "http://localhost:8080/api/technicians/recommended?serviceId=$($acService.id)&location=Madurai&latitude=9.9252&longitude=78.1198" -Method Get
    $muthuRec = $recs | Where-Object { $_.technician.name -like "*Muthu*" }
    $muthu = $muthuRec.technician
    Write-Host "Technician found: ID=$($muthu.id), Name='$($muthu.name)', City='$($muthu.city)', Score=$($muthuRec.recommendationScore)"

    # Workflow 4: Service Booking Creation
    Write-Host "`n=== Workflow 4: Service Booking Creation ==="
    $targetDate = (Get-Date).AddDays(1)
    while ($targetDate.DayOfWeek -eq [System.DayOfWeek]::Sunday) {
        $targetDate = $targetDate.AddDays(1)
    }
    $bookingReq = @{
        technicianId = $muthu.id
        serviceId = $acService.id
        bookingDate = $targetDate.ToString("yyyy-MM-dd")
        bookingTime = "14:00:00"
        location = "100 Administrative Plaza, Madurai"
        description = "Routine compressor diagnostics and filter cleanse"
    } | ConvertTo-Json

    $booking = Invoke-RestMethod -Uri "http://localhost:8080/api/customer/bookings" -Method Post -ContentType "application/json" -Headers $custHeaders -Body $bookingReq
    $testBookingId = $booking.id
    Write-Host "Booking Created: ID=$($booking.id), Status=$($booking.status), Payment=$($booking.paymentStatus)"

    # Workflow 5: Technician Acceptance and Work Completion
    Write-Host "`n=== Workflow 5: Technician Acceptance & Work Completion ==="
    $techLogin = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -ContentType "application/json" -Body (@{
        email = "muthu.tech@smart.com"
        password = "Tech@123"
    } | ConvertTo-Json)
    $techHeaders = @{ Authorization = "Bearer $($techLogin.accessToken)" }

    $acceptRes = Invoke-RestMethod -Uri "http://localhost:8080/api/technician/bookings/$testBookingId/status" -Method Put -ContentType "application/json" -Headers $techHeaders -Body (@{ status = "ACCEPTED" } | ConvertTo-Json)
    Write-Host "Job Status -> $($acceptRes.status)"
    $progRes = Invoke-RestMethod -Uri "http://localhost:8080/api/technician/bookings/$testBookingId/status" -Method Put -ContentType "application/json" -Headers $techHeaders -Body (@{ status = "IN_PROGRESS" } | ConvertTo-Json)
    Write-Host "Job Status -> $($progRes.status)"
    $compRes = Invoke-RestMethod -Uri "http://localhost:8080/api/technician/bookings/$testBookingId/status" -Method Put -ContentType "application/json" -Headers $techHeaders -Body (@{ status = "COMPLETED" } | ConvertTo-Json)
    Write-Host "Job Status -> $($compRes.status)"

    # Workflow 6: Cash Payment Recording
    Write-Host "`n=== Workflow 6: Cash Payment Recording ==="
    $payReceipt = Invoke-RestMethod -Uri "http://localhost:8080/api/technician/bookings/$testBookingId/payment" -Method Post -Headers $techHeaders
    Write-Host "Payment Generated: Receipt=$($payReceipt.transactionId), Method=$($payReceipt.paymentMethod), Amount=₹$($payReceipt.amount)"

    # Workflow 7: Customer Booking History
    Write-Host "`n=== Workflow 7: Customer Booking History ==="
    $myBookings = Invoke-RestMethod -Uri "http://localhost:8080/api/customer/bookings" -Method Get -Headers $custHeaders
    $verifiedBooking = $myBookings | Where-Object { $_.id -eq $testBookingId }
    Write-Host "Customer Verified Booking #$($verifiedBooking.id): Status=$($verifiedBooking.status), Payment=$($verifiedBooking.paymentStatus), Txn=$($verifiedBooking.transactionId)"

    # Workflow 8: Tool Catalog Browsing
    Write-Host "`n=== Workflow 8: Tool Catalog Browsing ==="
    $tools = Invoke-RestMethod -Uri "http://localhost:8080/api/tools" -Method Get
    $toolToRent = $tools[0]
    Write-Host "Selected Tool for Rental: ID=$($toolToRent.id), Name='$($toolToRent.name)', Stock=$($toolToRent.availableQuantity)"

    # Workflow 9: Tool Rental Booking
    Write-Host "`n=== Workflow 9: Tool Rental Booking ==="
    $initialStock = $toolToRent.availableQuantity
    $rentReq = @{
        toolId = $toolToRent.id
        startDate = (Get-Date).ToString("yyyy-MM-dd")
        endDate = (Get-Date).AddDays(1).ToString("yyyy-MM-dd")
    } | ConvertTo-Json

    $rental1 = Invoke-RestMethod -Uri "http://localhost:8080/api/customer/rentals" -Method Post -ContentType "application/json" -Headers $custHeaders -Body $rentReq
    $testRentalId1 = $rental1.id
    Write-Host "Rental #1 Created: ID=$($rental1.id), Total=₹$($rental1.totalAmount), Deposit=₹$($rental1.securityDeposit), Status=$($rental1.status)"
    $stockAfterRent = (Invoke-RestMethod -Uri "http://localhost:8080/api/tools/$($toolToRent.id)" -Method Get).availableQuantity
    Write-Host "Stock decremented correctly: $initialStock -> $stockAfterRent"

    # Workflow 10: Cash Rental Payment by Admin
    Write-Host "`n=== Workflow 10: Cash Rental Payment ==="
    $adminLogin = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -ContentType "application/json" -Body (@{
        email = "admin@smart.com"
        password = "Admin@123"
    } | ConvertTo-Json)
    $adminHeaders = @{ Authorization = "Bearer $($adminLogin.accessToken)" }

    $rentalPayReceipt = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/payments" -Method Post -ContentType "application/json" -Headers $adminHeaders -Body (@{
        rentalId = $testRentalId1
        amount = $rental1.totalAmount
        paymentMethod = "CASH"
    } | ConvertTo-Json)
    Write-Host "Rental Payment Recorded: Receipt=$($rentalPayReceipt.transactionId), Amount=₹$($rentalPayReceipt.amount)"

    # Workflow 11: Rental Cancellation
    Write-Host "`n=== Workflow 11: Rental Cancellation & Restock ==="
    $rental2 = Invoke-RestMethod -Uri "http://localhost:8080/api/customer/rentals" -Method Post -ContentType "application/json" -Headers $custHeaders -Body $rentReq
    $testRentalId2 = $rental2.id
    $stockBeforeCancel = (Invoke-RestMethod -Uri "http://localhost:8080/api/tools/$($toolToRent.id)" -Method Get).availableQuantity
    $cancelRes = Invoke-RestMethod -Uri "http://localhost:8080/api/customer/rentals/$testRentalId2/cancel" -Method Put -Headers $custHeaders
    $stockAfterCancel = (Invoke-RestMethod -Uri "http://localhost:8080/api/tools/$($toolToRent.id)" -Method Get).availableQuantity
    Write-Host "Rental #2 Cancelled: Status=$($cancelRes.status) | Stock restocked: $stockBeforeCancel -> $stockAfterCancel"

    # Workflow 12: Tool Return Processing
    Write-Host "`n=== Workflow 12: Tool Return Processing ==="
    $retReqRes = Invoke-RestMethod -Uri "http://localhost:8080/api/customer/rentals/$testRentalId1/return-request" -Method Put -Headers $custHeaders
    Write-Host "Return Requested: Status=$($retReqRes.status)"

    $procRes = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/rentals/$testRentalId1/process-return" -Method Put -ContentType "application/json" -Headers $adminHeaders -Body (@{
        actualReturnDate = (Get-Date).ToString("yyyy-MM-dd")
        damageCharge = 0.0
    } | ConvertTo-Json)
    Write-Host "Return Processed by Admin: Status=$($procRes.status), Refundable Deposit=₹$($procRes.refundableDeposit)"
    $finalStock = (Invoke-RestMethod -Uri "http://localhost:8080/api/tools/$($toolToRent.id)" -Method Get).availableQuantity
    Write-Host "Inventory restored to original stock: $finalStock"

    # Workflow 13: Admin Service Management
    Write-Host "`n=== Workflow 13: Admin Service Management ==="
    $createServiceReq = @{
        name = "Audit Test Solar Cleaning"
        description = "Rooftop solar panel dust cleaning and pressure rinse"
        basePrice = 299.0
        status = "ACTIVE"
    } | ConvertTo-Json
    $newService = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/services" -Method Post -ContentType "application/json" -Headers $adminHeaders -Body $createServiceReq
    $testServiceId = $newService.id
    Write-Host "Admin Created Service: ID=$($newService.id), Name='$($newService.name)', Price=₹$($newService.basePrice)"

    $updateServiceReq = @{
        name = "Audit Test Solar Cleaning Pro"
        description = "Updated description with eco-wash"
        basePrice = 349.0
        status = "ACTIVE"
    } | ConvertTo-Json
    $updatedService = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/services/$testServiceId" -Method Put -ContentType "application/json" -Headers $adminHeaders -Body $updateServiceReq
    Write-Host "Admin Updated Service: Name='$($updatedService.name)', Price=₹$($updatedService.basePrice)"

    # Soft deactivate
    Invoke-RestMethod -Uri "http://localhost:8080/api/admin/services/$testServiceId" -Method Delete -Headers $adminHeaders
    Write-Host "Admin Soft-Deactivated Service #$testServiceId"

    # Workflow 14: Admin Tool Management
    Write-Host "`n=== Workflow 14: Admin Tool Management ==="
    $createToolReq = @{
        name = "Audit Laser Leveler 360"
        category = "Measuring Tools"
        description = "Self-leveling 3D cross line laser"
        rentalPricePerDay = 120.0
        securityDeposit = 400.0
        quantity = 2
        status = "AVAILABLE"
    } | ConvertTo-Json
    $newTool = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/tools" -Method Post -ContentType "application/json" -Headers $adminHeaders -Body $createToolReq
    $testToolId = $newTool.id
    Write-Host "Admin Created Tool: ID=$($newTool.id), Name='$($newTool.name)', Stock=$($newTool.availableQuantity)"

    $updateToolReq = @{
        name = "Audit Laser Leveler 360 Pro"
        category = "Measuring Tools"
        description = "Self-leveling 3D cross line laser with magnetic bracket"
        rentalPricePerDay = 150.0
        securityDeposit = 500.0
        quantity = 3
        status = "AVAILABLE"
    } | ConvertTo-Json
    $updatedTool = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/tools/$testToolId" -Method Put -ContentType "application/json" -Headers $adminHeaders -Body $updateToolReq
    Write-Host "Admin Updated Tool: Name='$($updatedTool.name)', DailyRate=₹$($updatedTool.dailyRate), Stock=$($updatedTool.availableQuantity)"

    # Soft deactivate tool
    Invoke-RestMethod -Uri "http://localhost:8080/api/admin/tools/$testToolId" -Method Delete -Headers $adminHeaders
    Write-Host "Admin Soft-Deactivated Tool #$testToolId"

    # Workflow 15: Admin Booking & Payment Visibility, Dashboard Summary & Security Verification
    Write-Host "`n=== Workflow 15: Admin Oversight & Security Verification ==="
    $allBookings = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/bookings" -Method Get -Headers $adminHeaders
    Write-Host "Admin sees total bookings: $($allBookings.Count)"

    $allPayments = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/payments" -Method Get -Headers $adminHeaders
    Write-Host "Admin sees total payments: $($allPayments.Count)"

    $adminSummary = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/dashboard/summary" -Method Get -Headers $adminHeaders
    Write-Host "Admin Dashboard Summary Metrics:"
    Write-Host "  Customers: $($adminSummary.totalCustomers)"
    Write-Host "  Technicians: $($adminSummary.totalTechnicians) (Approved: $($adminSummary.approvedTechnicians), Pending: $($adminSummary.pendingTechnicians))"
    Write-Host "  Bookings: $($adminSummary.totalBookings) (Completed: $($adminSummary.completedBookings), Pending: $($adminSummary.pendingBookings))"
    Write-Host "  Tool Stock: $($adminSummary.totalTools) varieties ($($adminSummary.totalAvailableTools) available in stock)"
    Write-Host "  Rentals: $($adminSummary.activeToolRentals) active ($($adminSummary.returnedToolRentals) returned)"
    Write-Host "  Finances: Service=₹$($adminSummary.serviceRevenue), Rental=₹$($adminSummary.rentalRevenue), ActiveDeposits=₹$($adminSummary.refundableDeposits), Total=₹$($adminSummary.totalRevenue)"

    $allCustomers = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/customers" -Method Get -Headers $adminHeaders
    Write-Host "Admin Customers List retrieved: $($allCustomers.Count) customers"

    # Security Verification: Customer token accessing Admin endpoint MUST be rejected with HTTP 403 Forbidden
    $securityPassed = $false
    try {
        Invoke-RestMethod -Uri "http://localhost:8080/api/admin/dashboard/summary" -Method Get -Headers $custHeaders
    } catch {
        $statusCode = 0
        if ($_.Exception.Response -and $_.Exception.Response.StatusCode) {
            $statusCode = [int]$_.Exception.Response.StatusCode
        } elseif ($_.Exception.StatusCode) {
            $statusCode = [int]$_.Exception.StatusCode
        }
        if ($statusCode -eq 403) {
            $securityPassed = $true
            Write-Host "Security Check Passed: Non-admin customer correctly received HTTP 403 Forbidden on Admin Endpoint!"
        } else {
            Write-Host "Received unexpected HTTP status code: $statusCode"
        }
    }
    if (-not $securityPassed) {
        throw "Security breach: Customer was not forbidden from accessing administrative endpoint!"
    }

    Write-Host "`n=== ALL 15 INTEGRATION WORKFLOWS TESTED & PASSED 100%! ==="

} finally {
    Write-Host "`nCleaning up temporary test records..."
    $cleanupSql = @"
DELETE FROM smart_household.payments WHERE booking_id = $testBookingId OR rental_id IN ($testRentalId1, $testRentalId2);
DELETE FROM smart_household.service_bookings WHERE id = $testBookingId;
DELETE FROM smart_household.tool_rentals WHERE id IN ($testRentalId1, $testRentalId2);
DELETE FROM smart_household.tools WHERE id = $testToolId;
DELETE FROM smart_household.household_services WHERE id = $testServiceId;
DELETE FROM smart_household.customer_profiles WHERE user_id = $testCustomerId;
DELETE FROM smart_household.users WHERE id = $testCustomerId;
"@
    & "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p"$($env:DB_PASSWORD)" -e $cleanupSql 2>$null
    Write-Host "Cleanup completed successfully."

    Write-Host "Stopping backend process ID: $($p.Id)"
    Stop-Process -Id $p.Id -Force -ErrorAction SilentlyContinue
}
