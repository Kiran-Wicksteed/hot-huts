<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\SaunaController;
use App\Http\Controllers\SaunaScheduleController;
use App\Http\Controllers\AdminController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;


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
        });










        Route::middleware(['auth', 'admin', 'verified'])->get('admin/users', [AdminController::class, 'index'])->name('admin.users');
    }
);

Route::get('/pending-approval', function () {
    return Inertia::render('PendingApproval');
})->name('pending-approval');


Route::middleware(['auth', 'admin'])
    ->group(function () {
        Route::get('locations',        [LocationController::class, 'index'])->name('locations.index');
        Route::post('locations',       [LocationController::class, 'store'])->name('locations.store');
        Route::put('locations/{location}', [LocationController::class, 'update'])->name('locations.update');
        Route::delete('locations/{location}', [LocationController::class, 'destroy'])->name('locations.destroy');
    });

Route::middleware(['auth', 'admin'])
    ->group(function () {
        Route::get('saunas',        [SaunaController::class, 'index'])->name('saunas.index');
        Route::post('saunas',       [SaunaController::class, 'store'])->name('saunas.store');
        Route::put('saunas/{sauna}', [SaunaController::class, 'update'])->name('saunas.update');
        Route::delete('saunas/{sauna}', [SaunaController::class, 'destroy'])->name('saunas.destroy');
        Route::get('saunas/{sauna}/schedules',  [SaunaScheduleController::class, 'index'])
            ->name('saunas.schedules.index');

        Route::post('saunas/{sauna}/schedules', [SaunaScheduleController::class, 'store'])
            ->name('saunas.schedules.store');

        Route::delete(
            'saunas/{sauna}/schedules/{schedule}',
            [SaunaScheduleController::class, 'destroy']
        )
            ->name('saunas.schedules.destroy');

        Route::post(
            'saunas/{sauna}/weekday-wizard',
            [SaunaScheduleController::class, 'bulkWeekday']
        )->name('saunas.schedules.bulkWeekday');
    });

require __DIR__ . '/auth.php';
