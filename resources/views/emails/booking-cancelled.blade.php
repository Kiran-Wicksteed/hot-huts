<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Booking Cancelled</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #f97316; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">Hot Huts</h1>
    </div>
    
    <div style="background-color: #f9f9f9; padding: 30px; margin-top: 20px; border-radius: 5px;">
        <h2 style="color: #f97316; margin-top: 0;">Booking Cancelled</h2>
        
        <p>Hello {{ $booking->user->name ?? 'Guest' }},</p>
        
        <p>Your booking has been cancelled as requested.</p>
        
        <div style="background-color: white; padding: 20px; border-left: 4px solid #f97316; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">Booking Details</h3>
            <p><strong>Booking Reference:</strong> {{ $bookingRef }}</p>
            <p><strong>Location:</strong> {{ $booking->timeslot->schedule->location->name ?? 'N/A' }}</p>
            <p><strong>Date & Time:</strong> {{ \Carbon\Carbon::parse($booking->timeslot->starts_at)->format('l, F j, Y \a\t g:i A') }}</p>
            <p><strong>Number of People:</strong> {{ $booking->people }}</p>
            <p><strong>Original Amount:</strong> R{{ number_format($booking->amount, 2) }}</p>
            <p><strong>Cancelled At:</strong> {{ $booking->cancelled_at->format('l, F j, Y \a\t g:i A') }}</p>
        </div>
        
        @if($coupon)
            <div style="background-color: #dcfce7; padding: 20px; border-left: 4px solid #16a34a; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #16a34a;">Refund Coupon Issued</h3>
                <p>A refund coupon has been issued to your account:</p>
                <div style="background-color: white; padding: 15px; margin: 15px 0; text-align: center; border-radius: 5px;">
                    <p style="margin: 0; font-size: 12px; color: #666;">Coupon Code</p>
                    <p style="margin: 5px 0; font-size: 24px; font-weight: bold; color: #16a34a; letter-spacing: 2px;">{{ $coupon->code }}</p>
                </div>
                <p><strong>Coupon Value:</strong> R{{ number_format($coupon->remaining_value, 2) }}</p>
                <p><strong>Expires:</strong> {{ $coupon->expires_at->format('F j, Y') }}</p>
                <p style="margin-top: 15px; font-size: 14px;">
                    <strong>How to use your coupon:</strong><br>
                    • Enter the code at checkout when making your next booking<br>
                    • The coupon can be used partially - any remaining balance will be saved for future bookings<br>
                    • Valid for {{ $coupon->expires_at->diffInMonths(now()) }} months from today
                </p>
            </div>
        @else
            <div style="background-color: #fef3c7; padding: 20px; border-left: 4px solid #f59e0b; margin: 20px 0;">
                <p style="margin: 0;"><strong>Refund:</strong> No refund issued per our cancellation policy.</p>
            </div>
        @endif
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <h3 style="color: #333;">Cancellation Policy Reminder</h3>
            <ul style="font-size: 14px; color: #666;">
                <li><strong>More than 24 hours before session:</strong> Full refund as coupon</li>
                <li><strong>4-24 hours before session:</strong> 50% refund as coupon</li>
                <li><strong>Less than 4 hours before session:</strong> No refund</li>
            </ul>
        </div>
        
        <p style="margin-top: 30px;">We hope to see you again soon at Hot Huts!</p>
        
        <p style="margin-top: 20px;">
            <a href="{{ route('index') }}" style="display: inline-block; background-color: #f97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Book Another Session
            </a>
        </p>
    </div>
    
    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666;">
        <p>Hot Huts - Your Wellness Destination</p>
        <p>If you have any questions, please contact us at support@hothuts.com</p>
    </div>
</body>
</html>
