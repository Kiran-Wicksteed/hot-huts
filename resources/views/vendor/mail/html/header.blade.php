@props(['url'])

<tr>
    <td class="header" style="padding:25px 0; text-align:center;">
        <a href="{{ $url }}" style="display:inline-block;">
            <img
                src="https://starfish-app-vzchi.ondigitalocean.app/storage/images/logo.png"
                alt="{{ config('app.name', 'Hot Huts') }}"
                width="140"
                style="display:block; max-width:140px; height:auto; margin:0 auto;">
        </a>
    </td>
</tr>