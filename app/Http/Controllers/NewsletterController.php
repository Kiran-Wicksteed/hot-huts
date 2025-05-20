<?php

namespace App\Http\Controllers;

use App\Models\Newsletter;
use Illuminate\Http\Request;
use App\Models\Organization;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;


class NewsletterController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Organization $organization, Newsletter $newsletter)
    {

        $newsletters = Newsletter::with('user')->orderBy('created_at', 'desc')->get();

        return Inertia::render('Newsletters/Index', [
            'newsletters' => $newsletters,
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
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'content' => 'required|string',
        ]);

        $policy = new Newsletter();
        $policy->title = $validated['title'];
        $policy->description = $validated['description'];
        $policy->content = $validated['content'];
        $policy->user_id = Auth::id();
        $policy->save();

        return redirect()->route('newsletters.index')->with('status', 'Newsletter created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Newsletter $newsletter)
    {
        return Inertia::render('Newsletters/Show', [
            'newsletter' => $newsletter,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Newsletter $newsletter)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Newsletter $newsletter)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Newsletter $newsletter)
    {
        //
    }
}
