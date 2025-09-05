{{-- resources/views/emails/welcome.blade.php --}}
@component('mail::message')


# Welcome, {{ $user->name }}!

Thanks for joining HotHuts. You can now book saunas, view events, and manage your profile.

@component('mail::button', ['url' => url('/')])
Go to HotHuts
@endcomponent

If you need help, just reply to this email.

— The HotHuts Team
@endcomponent