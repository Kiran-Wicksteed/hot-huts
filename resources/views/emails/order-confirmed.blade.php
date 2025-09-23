@php
$money = fn(int $cents) => 'R' . number_format($cents / 100, 2);
@endphp

@component('mail::message')

# Thanks, {{ $user->name }} — your booking is confirmed!

**Order:** {{ $summary['order'] ?? '—' }}
**Items:** {{ $summary['count'] }}
**Total paid:** **{{ $money((int) $summary['grand_total_cents']) }}**

@foreach($items as $b)
### Booking #{{ $b['id'] }}
**Status:** {{ ucfirst($b['status']) }}
@if($b['location_name'])
**Location:** {{ $b['location_name'] }}
@endif
@if($b['starts_at'])
**Starts:** {{ \Carbon\Carbon::parse($b['starts_at'])->format('D, d M Y H:i') }}
@endif
@if($b['ends_at'])
**Ends:** {{ \Carbon\Carbon::parse($b['ends_at'])->format('H:i') }}
@endif

@component('mail::table')
| Item | Qty | Unit | Line |
|:-----|:---:|-----:|-----:|
@foreach($b['lines'] as $line)
| {{ $line['name'] ?? 'Item' }} | {{ $line['qty'] }} | {{ $money((int)$line['unit_cents']) }} | {{ $money((int)$line['line_cents']) }} |
@endforeach
@endcomponent

**Booking total:** {{ $money((int)$b['total_cents']) }}

@endforeach


If you didn’t make this booking or have questions, reply to this email and we’ll help.

— The Hot Huts Team
@endcomponent