<?php

namespace App\Http\Controllers;

use App\Models\Chat;
use App\Models\Organization;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;

class ChatController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Organization $organization, Chat $chat)
    {
        // Fetch chats belonging to the organization
        $chats = Chat::where('organization_id', $organization->id)->with('user')->whereNull('parent_id')->with('replies')->orderBy('created_at', 'desc')->get();

        return Inertia::render('Chats/Index', [
            'chats' => $chats,
            'organization' => $organization,
        ]);
    }


    public function show(Organization $organization, Chat $chat)
    {
        // Ensure the chat belongs to the organization
        if ($chat->organization_id !== $organization->id) {
            abort(404);
        }

        return Inertia::render('Chats/Show', [
            'chat' => $chat,
            'organization' => $organization,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, Organization $organization)
    {
        $validated = $request->validate([
            'message' => 'required|string|max:255',
        ]);

        $chat = new Chat();
        $chat->message = $validated['message'];
        $chat->user_id = Auth::id();
        $chat->organization_id = $organization->id;
        $chat->save();

        return redirect()->route('organizations.chats.index', ['organization' => $organization->id])
            ->with('status', 'Chat created successfully.');
    }

    public function storeReply(Request $request, Organization $organization, Chat $chat)
    {
        $validated = $request->validate([
            'message' => 'required|string',
        ]);

        $reply = new Chat();
        $reply->message = $validated['message'];
        $reply->user_id = Auth::id();
        $reply->organization_id = $organization->id;
        $reply->parent_id = $chat->id;
        $reply->save();

        return redirect()->route('organizations.chats.index', $organization);
    }


    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Chat $chat)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Chat $chat)
    {

        if ($chat->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'message' => 'required|string|max:255',
        ]);

        $chat->message = $validated['message'];
        $chat->save();

        return redirect()->route('organizations.chats.index', ['organization' => $chat->organization_id, 'chat' => $chat->id])
            ->with('status', 'Chat updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Chat $chat): RedirectResponse
    {
        if ($chat->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }

        $chat->delete();

        return redirect()->route('organizations.chats.index', ['organization' => $chat->organization_id, 'chat' => $chat->id])
            ->with('status', 'Chat deleted successfully.');
    }
}
