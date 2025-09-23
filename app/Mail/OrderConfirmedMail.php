<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderConfirmedMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * @param  \App\Models\User  $user           The purchaser (for greeting + email)
     * @param  \Illuminate\Support\Collection|array  $items  Display array for all bookings in this order (like your $display)
     * @param  array{order:string|null, count:int, grand_total_cents:int}  $summary
     */
    public function __construct(
        public User $user,
        public $items,
        public array $summary
    ) {}

    public function envelope(): Envelope
    {
        $order = $this->summary['order'] ?? '—';
        return new Envelope(subject: "Your HotHuts booking is confirmed ✅ (#{$order})");
    }

    public function content(): Content
    {


        return new Content(
            markdown: 'emails.order-confirmed',
            with: [
                'user'    => $this->user,
                'items'   => collect($this->items),
                'summary' => $this->summary,

            ]
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
