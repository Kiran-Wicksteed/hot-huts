<?php

namespace App\Listeners;

use App\Events\ChatCreated;
use App\Models\User;
use App\Notifications\NewMessage;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class SendChatCreatedNotifications implements ShouldQueue
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(ChatCreated $event): void
    {

        $organizationId = $event->chat->organization_id;

        foreach (
            User::where('organization_id', $organizationId)
                ->whereNot('id', $event->chat->user_id)
                ->cursor() as $user
        ) {
            $user->notify(new NewMessage($event->chat));
        }
    }
}
