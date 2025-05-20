<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Notifications\TeamInvitation;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Notifications\AnonymousNotifiable;


use Illuminate\Http\Request;

class TeamInvitationController extends Controller
{
    public function sendInvite(Request $request)
    {


        // Validate the email
        $request->validate([
            'email' => 'required|email',
        ]);

        $email = $request->input('email');
        $invitationLink = route('register', ['invite' => encrypt($email)]);
        $sender = User::with('organization')->find(Auth::id());



        // Send the email
        $anonymousNotifiable = new AnonymousNotifiable();
        $anonymousNotifiable->route('mail', $email);
        $anonymousNotifiable->notify(new TeamInvitation($invitationLink, $sender));

        return redirect()->route('dashboard')->with('status', 'Invite sent successfully.');
    }
}
