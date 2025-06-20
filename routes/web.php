<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\SaunaController;
use App\Http\Controllers\SaunaScheduleController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\TimeSlotController;
use App\Http\Controllers\BookingFormController;
use App\Http\Controllers\AvailabilityController;
use App\Http\Controllers\OpeningController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\UserDashboardController;
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

//Public routes
Route::get('/services', [ServiceController::class, 'index'])->name('services.index');
Route::get('/', [BookingFormController::class, 'index'])->name('index');
Route::get(
    'availability',
    [AvailabilityController::class, 'index']
)->name('availability');

Route::get('openings/all', function () {
    return \App\Models\LocationOpening::with('location:id,name')
        ->get()
        ->map(fn($row) => [
            'location_id' => $row->location_id,
            'location'    => $row->location->name,
            'weekday'     => $row->weekday,         // 0 = Sun … 6 = Sat
            'periods'     => $row->periods,         // ['morning','evening']
        ]);
})->name('openings.all');;
Route::get('openings', [OpeningController::class, 'index'])
    ->name('openings');



Route::middleware(['auth'])->group(function () {
    Route::post('/bookings',  [BookingController::class, 'store'])
        ->name('bookings.store');

    Route::get('/bookings/{booking}', [BookingController::class, 'show'])
        ->name('bookings.show');        // <- Confirmed page
});



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

        Route::get('/locations', function () {
            return Inertia::render('locations/index');
        })->name('locations.index');

        Route::get('/my-bookings', [UserDashboardController::class, 'index'])->name('user.dashboard');

        Route::middleware(['auth', 'verified'])->group(function () {
            Route::post('/profile/change-organization', [ProfileController::class, 'changeUserOrganization'])->name('profile.change-organization.update');
        });

        Route::middleware(['auth', 'admin', 'verified'])->group(function () {
            Route::delete('users/{user}', [ProfileController::class, 'destroyUser'])->name('users.destroy');
        });
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
        Route::get(
            'saunas/{sauna}/schedules/{schedule}/slots',
            [TimeslotController::class, 'index']
        )->name('saunas.schedules.slots');

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

        Route::post(
            'saunas/{sauna}/schedules/generate',
            [SaunaScheduleController::class, 'generate']
        )->name('saunas.schedules.generate');


        Route::delete('/services/{service}', [ServiceController::class, 'destroy'])
            ->name('services.destroy');
        Route::post('services',       [ServiceController::class, 'store'])->name('services.store');
        Route::put('services/{service}', [ServiceController::class, 'update'])->name('services.update');
    });

require __DIR__ . '/auth.php';
