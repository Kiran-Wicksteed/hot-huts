<?php
// app/Mail/WelcomeMail.php
namespace App\Mail;

use App\Models\User;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class WelcomeMail extends Mailable
{
    public function __construct(public User $user) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Welcome to HotHuts 👋');
    }

    public function content(): Content
    {
        $logoCid = null;
        $this->withSymfonyMessage(function ($message) use (&$logoCid) {
            $logoCid = $message->embedFromPath(
                storage_path('app/public/images/hot-huts-logo.png'),
                'hothuts-logo'
            );
        });

        return new Content(
            markdown: 'emails.welcome',
            with: ['user' => $this->user, 'logoCid' => $logoCid]
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
