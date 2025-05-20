<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class UserApprovedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $user;
    public $approvedBy;
    /**
     * Create a new notification instance.
     */
    public function __construct($user, $approvedBy)
    {
        $this->user = $user;
        $this->approvedBy = $approvedBy;
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
        return (new MailMessage)
            ->subject('Account Approved')
            ->greeting('Hello!')
            ->line("Hi {$this->user->name}. Your account has been approved on the dashboard by an admin.")
            ->action('Log in to the dashboard to get started', url('/dashboard'))
            ->line('Thank you for using our application!')
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
