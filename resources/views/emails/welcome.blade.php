{{-- resources/views/emails/welcome.blade.php --}}
@component('mail::message')


# Welcome, {{ $user->name }}!

Thanks for joining Hot Huts. You can now book saunas, view events, and manage your profile.

@component('mail::button', ['url' => url('/')])
Go to HotHuts
@endcomponent

If you need help, just reply to this email.

— The Hot Huts Team
@endcomponent