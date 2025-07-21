<form action="{{route('post.pay')}}" method="get">
    @csrf
    <input type="hidden" name="amount" value="10">
    <button type="submit" class="btn btn-primary">Pay Now</button>
</form>