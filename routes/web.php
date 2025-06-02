<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ResourceController;
use App\Http\Controllers\OrganizationController;
use App\Http\Controllers\PolicyController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\NewsletterController;
use App\Http\Controllers\FamilyGalleryController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\TeamInvitationController;
use App\Http\Middleware\AdminMiddleware;

Route::get('/welcome', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION, 
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/', function () {
    return Inertia::render('Index'); 
})->name('Index'); 

Route::middleware('auth', 'approved')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::post('profile/photo', [ProfileController::class, 'uploadPhoto'])->name('profile.photo.upload');
    Route::get('foundation/companies', [OrganizationController::class, 'displayOrgs'])->name('foundation.companies');
});




Route::middleware(['auth', 'verified', 'approved'])->group(
    function () {

        Route::get('/dashboard', function () {
            return Inertia::render('Dashboard');
        })->middleware(['auth', 'verified'])->name('dashboard');

        Route::get('/bookings', function () {
            return Inertia::render('bookings/index'); 
        })->name('bookings.index');

        Route::get('/payments', function () {
            return Inertia::render('payments/index'); 
        })->name('payments.index');

        Route::get('/customers', function () {
            return Inertia::render('customers/index'); 
        })->name('customers.index');

        Route::get('/services', function () {
            return Inertia::render('services/index'); 
        })->name('services.index');

        Route::get('/locations', function () {
            return Inertia::render('locations/index'); 
        })->name('locations.index');



        Route::get('/my-bookings', function () {
            return Inertia::render('frontend/my-bookings/index'); 
        })->name('frontend.my-bookings.index');

        Route::middleware(['auth', 'verified'])->group(function () {
            Route::post('/profile/change-organization', [ProfileController::class, 'changeUserOrganization'])->name('profile.change-organization.update');
        });

        Route::middleware(['auth', 'admin', 'verified'])->group(function () {
            Route::delete('users/{user}', [ProfileController::class, 'destroyUser'])->name('users.destroy');
            Route::patch('users/{user}/approve', [ProfileController::class, 'changeUserApprovalStatus'])->name('users.approve');
            Route::post('/admin/change-organization/{user}', [ProfileController::class, 'adminChangeUserOrganization'])->name('admin.change-organization.update');
            Route::patch('/admin/change-permissions/{user}', [ProfileController::class, 'changeUserPermissions'])->name('admin.change-permissions.update');
        });

        Route::middleware(['auth', 'family', 'verified'])->group(function () {
            Route::get('family/resources', [ResourceController::class, 'familyIndex'])->name('family.resources.index');
            Route::post('family/resources', [ResourceController::class, 'store'])->name('family.resources.store');
            Route::get('family/gallery', [FamilyGalleryController::class, 'index'])->name('family.gallery.index');
            Route::post('family/gallery', [FamilyGalleryController::class, 'store'])->name('family.gallery.store');
        });

        Route::resource('admin/organizations', OrganizationController::class)
            ->only(['index', 'store', 'destroy'])
            ->names([
                'index' => 'admin.organizations.index',
                'store' => 'admin.organizations.store',
                'destroy' => 'admin.organizations.destroy',
            ])
            ->middleware(['auth', 'admin', 'verified']);

        Route::resource('foundation/newsletters', NewsletterController::class)
            ->only(['index', 'store', 'show', 'destroy'])
            ->names([
                'index' => 'newsletters.index',
                'store' => 'newsletters.store',
                'show' => 'newsletters.show',
                'destroy' => 'newsletters.destroy',
            ])
            ->middleware(['auth', 'verified']);




        Route::middleware(['auth', 'admin', 'verified'])->get('admin/users', [AdminController::class, 'index'])->name('admin.users');


        Route::middleware(['auth', 'verified'])->group(function () {
            Route::get('organizations/{organization}/users', [OrganizationController::class, 'users'])->name('organizations.users.index');
            Route::get('organizations/{organization}/policies', [PolicyController::class, 'index'])->name('organizations.policies.index');
            Route::post('organizations/{organization}/policies', [PolicyController::class, 'store'])->name('organizations.policies.store');
            Route::get('organizations/{organization}/policies/{policy}', [PolicyController::class, 'show'])->name('organizations.policies.show');
            Route::delete('policies/{policy}', [PolicyController::class, 'destroy'])->name('policies.destroy');
            Route::get('organizations/{organization}/policies/{policy}/edit', [PolicyController::class, 'edit'])->name('policies.edit');
            Route::put('organizations/{organization}/policies/{policy}', [PolicyController::class, 'update'])->name('policies.update');
            Route::get('organizations/{organization}/resources', [ResourceController::class, 'index'])->name('organizations.resources.index');
            Route::post('organizations/{organization}/resources', [ResourceController::class, 'store'])->name('organizations.resources.store');
            Route::delete('resources/{resource}', [ResourceController::class, 'destroy'])->name('resources.destroy');
            Route::get('organizations/{organization}/events', [EventController::class, 'index'])->name('organizations.events.index');
            Route::post('organizations/{organization}/events', [EventController::class, 'store'])->name('organizations.events.store');
            Route::delete('events/{event}', [EventController::class, 'destroy'])->name('events.destroy');
            Route::get('organizations/{organization}/chats', [ChatController::class, 'index'])->name('organizations.chats.index');
            Route::get('organizations/{organization}/chats/{chat}', [ChatController::class, 'show'])->name('organizations.chats.show');
            Route::post('organizations/{organization}/chats', [ChatController::class, 'store'])->name('organizations.chats.store');
            Route::post('organizations/{organization}/chats/{chat}/replies', [ChatController::class, 'storeReply'])->name('organizations.chats.replies.store');
            Route::patch('chats/{chat}', [ChatController::class, 'update'])->name('chats.update');
            Route::delete('chats/{chat}', [ChatController::class, 'destroy'])->name('chats.destroy');
            Route::post('/team/invite', [TeamInvitationController::class, 'sendInvite'])->name('team.invite');
        });
    }
);

Route::get('/pending-approval', function () {
    return Inertia::render('PendingApproval');
})->name('pending-approval');

Route::get('api/organizations', [OrganizationController::class, 'getOrganizations'])
    ->name('api.organizations.index');

require __DIR__ . '/auth.php';
