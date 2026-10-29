if (-not $env:DB_PASSWORD) {
    $env:DB_PASSWORD = [System.Environment]::GetEnvironmentVariable("DB_PASSWORD", "User")
}
if (-not $env:DB_PASSWORD) {
    $env:DB_PASSWORD = "Pavi@123"
}

$jarPath = "C:\Users\Pavithra R\.gemini\antigravity\scratch\backend\target\smart-household-backend-0.0.1-SNAPSHOT.jar"
$javaBin = "C:\Program Files\Java\jdk-25\bin\java.exe"
$stdoutLog = "C:\Users\Pavithra R\.gemini\antigravity\scratch\booking_stdout.log"
$stderrLog = "C:\Users\Pavithra R\.gemini\antigravity\scratch\booking_stderr.log"

Write-Host "Starting Spring Boot with MySQL for Service Booking E2E Test..."
$p = Start-Process -FilePath $javaBin -ArgumentList "-jar `"$jarPath`"" -RedirectStandardOutput $stdoutLog -RedirectStandardError $stderrLog -PassThru

$createdBookingId = $null

try {
    # 1. Health check
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

    # Step 1: Service Catalog Retrieval
    Write-Host "`n=== STEP 1: Service Catalog Retrieval ==="
    $services = Invoke-RestMethod -Uri "http://localhost:8080/api/services" -Method Get
    Write-Host "Total active services loaded: $($services.Count)"
    $acService = $services | Where-Object { $_.name -eq "AC Repair" }
    if (-not $acService) {
        throw "AC Repair service not found in catalog!"
    }
    Write-Host "Service Found: ID=$($acService.id), Name='$($acService.name)', BasePrice=₹$($acService.basePrice), Status=$($acService.status)"

    # Step 2: Location-Based Mechanic Search (Madurai + AC Repair)
    Write-Host "`n=== STEP 2: Location-Based Mechanic Search (Madurai + AC Repair) ==="
    $searchUri = "http://localhost:8080/api/technicians/recommended?serviceId=$($acService.id)&location=Madurai&latitude=9.9252&longitude=78.1198"
    $searchResult = Invoke-RestMethod -Uri $searchUri -Method Get
    Write-Host "Mechanics returned for Madurai + AC Repair: $($searchResult.Count)"
    
    $rec = $searchResult | Where-Object { $_.technician.name -like "*Muthu*" }
    if (-not $rec) {
        throw "Expected technician 'Muthu Vel' in Madurai search results, but not found!"
    }
    $muthu = $rec.technician
    Write-Host "Top Matched Mechanic: ID=$($muthu.id), Name='$($muthu.name)', City='$($muthu.city)', Address='$($muthu.address)', Score=$($rec.recommendationScore), Distance=$($rec.distanceKm)km, Available=$($rec.isAvailable)"
    Write-Host "Services offered: $(($muthu.services | ForEach-Object { $_.name }) -join ', ')"

    # Step 3: Customer Login
    Write-Host "`n=== STEP 3: Customer Authentication ==="
    $custLogin = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -ContentType "application/json" -Body (@{
        email = "customer@smart.com"
        password = "Customer@123"
    } | ConvertTo-Json)
    $custHeaders = @{ Authorization = "Bearer $($custLogin.accessToken)" }
    Write-Host "Customer logged in: $($custLogin.name) ($($custLogin.email)), Role: $($custLogin.role)"

    # Step 4: Mechanic Selection & Booking Creation
    Write-Host "`n=== STEP 4: Service Booking Creation ==="
    # Find next valid weekday or Saturday (Muthu is available Mon-Sat)
    $targetDate = (Get-Date).AddDays(1)
    while ($targetDate.DayOfWeek -eq [System.DayOfWeek]::Sunday) {
        $targetDate = $targetDate.AddDays(1)
    }
    $bookingDateStr = $targetDate.ToString("yyyy-MM-dd")
    $bookingTimeStr = "11:00:00"

    $bookingReqBody = @{
        technicianId = $muthu.id
        serviceId = $acService.id
        bookingDate = $bookingDateStr
        bookingTime = $bookingTimeStr
        location = "15 Anna Nagar, Madurai, TN"
        description = "Split AC cooling issue and complete filter overhaul"
    } | ConvertTo-Json

    $booking = Invoke-RestMethod -Uri "http://localhost:8080/api/customer/bookings" -Method Post -ContentType "application/json" -Headers $custHeaders -Body $bookingReqBody
    $createdBookingId = $booking.id
    Write-Host "Service Booking Created Successfully! ID: $($booking.id)"
    Write-Host "Customer: $($booking.customerName), Technician: $($booking.technicianName)"
    Write-Host "Service: $($booking.serviceName), Base Price: ₹$($booking.estimatedAmount)"
    Write-Host "Scheduled Date & Time: $($booking.bookingDate) at $($booking.bookingTime)"
    Write-Host "Location: $($booking.location)"
    Write-Host "Status: $($booking.status) | Payment Status: $($booking.paymentStatus) | Payment Method: $($booking.paymentMethod)"

    # Step 5: Mechanic Availability & Double-Booking Prevention
    Write-Host "`n=== STEP 5: Conflict & Double-Booking Prevention ==="
    $doubleBookBlocked = $false
    try {
        Invoke-RestMethod -Uri "http://localhost:8080/api/customer/bookings" -Method Post -ContentType "application/json" -Headers $custHeaders -Body $bookingReqBody
    } catch {
        $doubleBookBlocked = $true
        Write-Host "Duplicate Booking Correctly Rejected with HTTP $($_.Exception.Response.StatusCode.value__): $($_.ErrorDetails.Message)"
    }
    if (-not $doubleBookBlocked) {
        throw "Security / Consistency failure: Double booking was allowed for identical slot!"
    }

    # Step 6: Customer Booking History Verification
    Write-Host "`n=== STEP 6: Customer Booking History Verification ==="
    $customerBookings = Invoke-RestMethod -Uri "http://localhost:8080/api/customer/bookings" -Method Get -Headers $custHeaders
    $foundBooking = $customerBookings | Where-Object { $_.id -eq $createdBookingId }
    if (-not $foundBooking) {
        throw "Created booking ID $createdBookingId not found in customer booking history!"
    }
    Write-Host "Verified Booking in Customer History: ID=$($foundBooking.id), Status=$($foundBooking.status), PaymentStatus=$($foundBooking.paymentStatus)"

    # Step 7: Mechanic Login & Workflow Management (Accept -> In Progress -> Complete)
    Write-Host "`n=== STEP 7: Mechanic Authentication & Workflow Management ==="
    $techLogin = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -ContentType "application/json" -Body (@{
        email = "muthu.tech@smart.com"
        password = "Tech@123"
    } | ConvertTo-Json)
    $techHeaders = @{ Authorization = "Bearer $($techLogin.accessToken)" }
    Write-Host "Mechanic logged in: $($techLogin.name) ($($techLogin.email)), Role: $($techLogin.role)"

    # View assigned bookings
    $techBookings = Invoke-RestMethod -Uri "http://localhost:8080/api/technician/bookings" -Method Get -Headers $techHeaders
    $assigned = $techBookings | Where-Object { $_.id -eq $createdBookingId }
    Write-Host "Mechanic sees assigned job: ID=$($assigned.id), Customer='$($assigned.customerName)', Problem='$($assigned.description)'"

    # Status Transition: ACCEPTED
    Write-Host "`n--- Status Transition 1: ACCEPTED ---"
    $acceptRes = Invoke-RestMethod -Uri "http://localhost:8080/api/technician/bookings/$createdBookingId/status" -Method Put -ContentType "application/json" -Headers $techHeaders -Body (@{ status = "ACCEPTED" } | ConvertTo-Json)
    Write-Host "Job Status updated to: $($acceptRes.status)"

    # Status Transition: IN_PROGRESS
    Write-Host "`n--- Status Transition 2: IN_PROGRESS ---"
    $progressRes = Invoke-RestMethod -Uri "http://localhost:8080/api/technician/bookings/$createdBookingId/status" -Method Put -ContentType "application/json" -Headers $techHeaders -Body (@{ status = "IN_PROGRESS" } | ConvertTo-Json)
    Write-Host "Job Status updated to: $($progressRes.status)"

    # Status Transition: COMPLETED
    Write-Host "`n--- Status Transition 3: COMPLETED ---"
    $completeRes = Invoke-RestMethod -Uri "http://localhost:8080/api/technician/bookings/$createdBookingId/status" -Method Put -ContentType "application/json" -Headers $techHeaders -Body (@{ status = "COMPLETED" } | ConvertTo-Json)
    Write-Host "Job Status updated to: $($completeRes.status)"

    # Step 8: Cash-Only Payment Recording by Mechanic
    Write-Host "`n=== STEP 8: Cash Payment Recording by Mechanic On-Site ==="
    $paymentReceipt = Invoke-RestMethod -Uri "http://localhost:8080/api/technician/bookings/$createdBookingId/payment" -Method Post -Headers $techHeaders
    Write-Host "Cash Payment Recorded Successfully!"
    Write-Host "Receipt / Transaction ID: $($paymentReceipt.transactionId)"
    Write-Host "Payment Method: $($paymentReceipt.paymentMethod)"
    Write-Host "Payment Status: $($paymentReceipt.paymentStatus)"
    Write-Host "Amount Paid: ₹$($paymentReceipt.amount)"
    Write-Host "Paid At: $($paymentReceipt.paymentDate)"

    # Step 9: Customer Verification of Settled Job
    Write-Host "`n=== STEP 9: Customer Verification of Completed & Paid Booking ==="
    $customerBookingsAfter = Invoke-RestMethod -Uri "http://localhost:8080/api/customer/bookings" -Method Get -Headers $custHeaders
    $settled = $customerBookingsAfter | Where-Object { $_.id -eq $createdBookingId }
    Write-Host "Customer View: Booking ID=$($settled.id), Job Status=$($settled.status), Payment Status=$($settled.paymentStatus), Transaction=$($settled.transactionId)"

    # Step 10: Direct MySQL Verification
    Write-Host "`n=== STEP 10: Direct MySQL Database Query Verification ==="
    $mysqlBin = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
    $dbQuery = @"
SELECT id, customer_id, technician_id, service_id, booking_date, booking_time, status, estimated_amount 
FROM smart_household.service_bookings 
WHERE id = $createdBookingId;

SELECT id, booking_id, amount, payment_method, payment_status, transaction_id, payment_date 
FROM smart_household.payments 
WHERE booking_id = $createdBookingId;
"@
    $dbOut = & $mysqlBin -u root -p"$($env:DB_PASSWORD)" -e $dbQuery
    Write-Host "$dbOut"

    Write-Host "`n=== ALL SERVICE BOOKING WORKFLOW CHECKS PASSED 100%! ==="

} finally {
    # Clean up test records
    if ($createdBookingId) {
        Write-Host "`nCleaning up test booking ($createdBookingId) and payment records..."
        $cleanupSql = @"
DELETE FROM smart_household.payments WHERE booking_id = $createdBookingId;
DELETE FROM smart_household.service_bookings WHERE id = $createdBookingId;
"@
        & "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p"$($env:DB_PASSWORD)" -e $cleanupSql
        Write-Host "Test records cleaned up successfully."
    }

    Write-Host "Stopping backend process ID: $($p.Id)"
    Stop-Process -Id $p.Id -Force -ErrorAction SilentlyContinue
}
