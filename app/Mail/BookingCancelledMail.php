<?php

namespace App\Mail;

use App\Models\Booking;
use App\Models\Coupon;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class BookingCancelledMail extends Mailable
{
    use Queueable, SerializesModels;

    public Booking $booking;
    public ?Coupon $coupon;

    public function __construct(Booking $booking, ?Coupon $coupon = null)
    {
        $this->booking = $booking;
        $this->coupon = $coupon;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Booking Cancelled - Hot Huts',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.booking-cancelled',
            with: [
                'booking' => $this->booking,
                'coupon' => $this->coupon,
                'bookingRef' => 'HH-' . str_pad($this->booking->id, 6, '0', STR_PAD_LEFT),
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
