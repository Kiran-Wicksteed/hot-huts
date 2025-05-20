<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Log;

class TeamInvitation extends Notification implements ShouldQueue
{
    use Queueable;

    public $invitationLink;
    public $sender;

    /**
     * Create a new notification instance.
     */
    public function __construct($invitationLink, $sender)
    {
        $this->invitationLink = $invitationLink;
        $this->sender = $sender;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {

        Log::info('TeamInvitation sender Org:', ['sender' => $this->sender->organization->orgName]);

        return (new MailMessage)
            ->subject("You’re Invited to Join the {$this->sender->organization->orgName} Team")
            ->greeting('Hello!')
            ->line("{$this->sender->name} has invited you to join the {$this->sender->organization->orgName} team on our platform.")
            ->action('Accept Invitation', $this->invitationLink)
            ->line('We’re excited to have you onboard!')
            ->salutation('Best regards, DANCOR FOUNDATION');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            //
        ];
    }
}
