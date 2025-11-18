<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\SaunaController;
use App\Http\Controllers\SaunaScheduleController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\TimeSlotController;
use App\Http\Controllers\BookingFormController;
use App\Http\Controllers\AvailabilityController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\OpeningController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\UserDashboardController;
use App\Http\Controllers\BookingAdminController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\EventOccurrenceController;
use App\Http\Controllers\CouponController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\Admin\AdminCustomerController;
use App\Http\Controllers\Admin\MembershipController;
use App\Http\Controllers\Loyalty\LoyaltyRewardController;
use Illuminate\Support\Facades\Auth;

Route::get('/welcome', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::middleware(['auth', 'verified'])->group(function () {
    // Event templates
    Route::resource('events', EventController::class);

    // Nested occurrences
    Route::prefix('events/{event}')->group(function () {
        Route::resource('occurrences', EventOccurrenceController::class)
            ->except(['show', 'create']) // handled by modal
            ->names('events.occurrences');
    });
});


Route::middleware(['auth'])->group(function () {
    Route::post('/loyalty/rewards/apply',  [LoyaltyRewardController::class, 'apply'])->name('loyalty.rewards.apply');
    Route::delete('/loyalty/rewards/remove', [LoyaltyRewardController::class, 'remove'])->name('loyalty.rewards.remove');
    
    // Booking cancellation routes
    Route::get('/bookings/{booking}/cancel/preview', [\App\Http\Controllers\BookingCancellationController::class, 'preview'])
        ->name('bookings.cancel.preview');
    
    Route::post('/bookings/{booking}/cancel', [\App\Http\Controllers\BookingCancellationController::class, 'cancel'])
        ->name('bookings.cancel');
    
    // Coupon routes
    Route::get('/my-coupons', [CouponController::class, 'index'])->name('coupons.index');
    Route::post('/coupons/apply', [CouponController::class, 'apply'])->name('coupons.apply');
    Route::post('/coupons/remove', [CouponController::class, 'remove'])->name('coupons.remove');
    Route::post('/coupons/validate', [CouponController::class, 'validate'])->name('coupons.validate');
});

//Admin Register Route
Route::middleware(['auth', 'verified'])->group(function () {
    Route::post('/customers', [AdminCustomerController::class, 'store'])
        ->name('customers.store');
});
Route::middleware(['auth', 'verified'])->group(function () {
    Route::delete('/customers/{user}', [AdminCustomerController::class, 'destroy'])
        ->name('customers.destroy');
});
Route::middleware(['auth',  'admin'])
    ->group(function () {
        Route::put('/customers/{user}', [AdminCustomerController::class, 'update'])
            ->name('customers.update');
    });

Route::middleware(['auth',  'admin'])
    ->group(function () {
        Route::get('/customers/export', [AdminCustomerController::class, 'export'])
            ->name('customers.export');
    });



Route::middleware(['auth', 'verified'])
    ->prefix('admin')
    ->group(function () {
        Route::get('/customers/{user}', [AdminCustomerController::class, 'show'])
            ->name('customers.show');
        Route::post('/customers/{user}/loyalty-points', [AdminCustomerController::class, 'adjustLoyaltyPoints'])
            ->name('customers.adjustLoyaltyPoints');

        Route::post('/users/{user}/memberships', [MembershipController::class, 'store'])
            ->name('admin.users.memberships.store');
        Route::delete('/users/{user}/memberships', [MembershipController::class, 'destroy'])
            ->name('admin.users.memberships.destroy');
        Route::post('/users/{user}/memberships/suspend', [MembershipController::class, 'suspend'])
            ->name('admin.users.memberships.suspend');
        Route::post('/users/{user}/memberships/unsuspend', [MembershipController::class, 'unsuspend'])
            ->name('admin.users.memberships.unsuspend');
    });

//Admin Search Customers Route
Route::middleware(['auth', 'can:manage-bookings'])
    ->get('/admin/users/search', [\App\Http\Controllers\Admin\UserSearchController::class, 'index'])
    ->name('admin.users.search');



//Payment Routes
Route::get('/pay', [PaymentController::class, 'pay'])->name('pay');
Route::get('/pay/post', [PaymentController::class, 'post'])->name('post.pay');
Route::match(['get', 'post'], '/order/callback{slash?}', [PaymentController::class, 'handlePaymentCallback'])
    ->where('slash', '/?')
    ->name('payment.callback');
Route::get('/order/success', [PaymentController::class, 'paymentSuccess'])->name('payment.success');
Route::get('/order/failed', [PaymentController::class, 'paymentFailed'])->name('payment.failed');
Route::get('/order/pending', [PaymentController::class, 'paymentPending'])->name('payment.pending');

//Public routes
Route::get('/services', [ServiceController::class, 'index'])->name('services.index');
Route::get('/', [BookingFormController::class, 'index'])->middleware('auth')->name('index');
Route::get(
    'availability',
    [AvailabilityController::class, 'index']
)->name('availability');
Route::get(
    'availability/all',
    [AvailabilityController::class, 'all']
)->name('availability.all');

Route::get('/availability/by-period', [\App\Http\Controllers\AvailabilityController::class, 'byPeriod'])
    ->name('availability.byPeriod');

Route::get('schedules-by-day', [AvailabilityController::class, 'byDayOfWeek'])
    ->name('schedules.byDay');

Route::get('openings/all', [OpeningController::class, 'all'])
    ->name('openings.all');
Route::get('openings', [OpeningController::class, 'index'])
    ->name('openings');





Route::post('/bookings',  [BookingController::class, 'store'])
    ->name('bookings.store');

//should be an admin route


Route::get('/bookings/check-member-eligibility', [BookingController::class, 'checkMemberEligibility'])->name('bookings.checkMemberEligibility');
Route::get('/bookings/{booking}', [BookingController::class, 'show'])
    ->name('bookings.show');

// routes/web.php
Route::post('/bookings/preflight', [BookingController::class, 'preflight'])->name('bookings.preflight');


Route::post('/admin-bookings',  [BookingController::class, 'storeAdmin'])
    ->name('admin.bookings.store');

Route::delete('/admin/bookings/{booking}', [BookingAdminController::class, 'destroy'])
    ->name('admin.bookings.destroy');

Route::put('/admin/bookings/{booking}', [\App\Http\Controllers\BookingAdminController::class, 'update'])
    ->name('admin.bookings.update');

Route::post('/admin/bookings/{booking}/cancel', [\App\Http\Controllers\BookingCancellationController::class, 'adminCancel'])
    ->middleware(['auth', 'admin'])
    ->name('admin.bookings.cancel');

Route::post('/admin/bookings/{booking}/retail-items', [BookingAdminController::class, 'addRetailItems'])
    ->middleware(['auth', 'admin'])
    ->name('admin.bookings.retail-items.add');

Route::delete('/admin/bookings/{booking}/retail-items/{retailItem}', [BookingAdminController::class, 'removeRetailItem'])
    ->middleware(['auth', 'admin'])
    ->name('admin.bookings.retail-items.remove');

Route::post('/admin/retail-sales', [BookingAdminController::class, 'recordRetailSale'])
    ->middleware(['auth', 'admin'])
    ->name('admin.retail-sales.store');

Route::delete('/admin/retail-sales/{retailSale}', [BookingAdminController::class, 'deleteRetailSale'])
    ->middleware(['auth', 'admin'])
    ->name('admin.retail-sales.destroy');

Route::get('/events/{event}/occurrences/{occurrence}/bookings', [BookingAdminController::class, 'byOccurrence'])
    ->name('events.occurrences.bookings');


Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::post('profile/photo', [ProfileController::class, 'uploadPhoto'])->name('profile.photo.upload');
});





Route::middleware(['auth'])->group(
    function () {


        Route::get('/dashboard', function () {
            if (! Auth::user()->is_admin) {
                return redirect('/');
            }

            return Inertia::render('Dashboard');
        })->middleware(['auth'])->name('dashboard');

        Route::middleware(['auth', 'admin'])->group(
            function () {
                Route::get('/bookings', [BookingAdminController::class, 'index'])
                    ->name('bookings.index');
            }
        );



        Route::middleware(['auth'])->get('/payments', [\App\Http\Controllers\PaymentAdminController::class, 'index'])->name('payments.index');
        // routes/web.php
        Route::get('/payments/export', [\App\Http\Controllers\PaymentAdminController::class, 'export'])->name('payments.export');

        Route::middleware(['auth', 'admin'])->group(function () {
            Route::get('/customers', [CustomerController::class, 'index'])->name('customers.index');
        });


        Route::get('/locations', function () {
            return Inertia::render('locations/index');
        })->name('locations.index');

        // Route::get('/my-bookings', [UserDashboardController::class, 'index'])->name('user.dashboard');

        Route::middleware(['auth'])->group(function () {
            Route::post('/profile/change-organization', [ProfileController::class, 'changeUserOrganization'])->name('profile.change-organization.update');
        });

        Route::middleware(['auth', 'admin'])->group(function () {
            Route::delete('users/{user}', [ProfileController::class, 'destroyUser'])->name('users.destroy');
        });
    }
);

Route::middleware('auth')->group(function () {
    Route::get('/my-bookings', [UserDashboardController::class, 'index'])
        ->name('user.dashboard');



    Route::get('/bookings/{booking}/reschedule', [UserDashboardController::class, 'reschedule'])
        ->name('my-bookings.reschedule');

    Route::get('/bookings/{booking}/reschedule/options', [UserDashboardController::class, 'rescheduleOptions'])
        ->name('my-bookings.reschedule.options');

    Route::post('/bookings/{booking}/reschedule', [UserDashboardController::class, 'rescheduleStore'])
        ->name('my-bookings.reschedule.store');

    Route::get('/loyalty', [UserDashboardController::class, 'loyaltyIndex'])
        ->name('loyalty.index');

    Route::get('/loyalty', [UserDashboardController::class, 'loyaltyIndex'])->name('loyalty.index');
    Route::post('/loyalty/redeem', [UserDashboardController::class, 'loyaltyRedeem'])->name('loyalty.redeem');
});

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

        Route::post('/schedules/{schedule}/update-capacity', [SaunaScheduleController::class, 'updateCapacity'])
            ->name('schedules.update-capacity');


        Route::delete('/services/{service}', [ServiceController::class, 'destroy'])
            ->name('services.destroy');
        Route::post('services',       [ServiceController::class, 'store'])->name('services.store');
        Route::put('services/{service}', [ServiceController::class, 'update'])->name('services.update');

        Route::post('retail-items', [\App\Http\Controllers\RetailItemController::class, 'store'])->name('retail-items.store');
        Route::put('retail-items/{retailItem}', [\App\Http\Controllers\RetailItemController::class, 'update'])->name('retail-items.update');
        Route::delete('retail-items/{retailItem}', [\App\Http\Controllers\RetailItemController::class, 'destroy'])->name('retail-items.destroy');
        Route::post('retail-items/{retailItem}/restore', [\App\Http\Controllers\RetailItemController::class, 'restore'])->name('retail-items.restore');
        Route::delete('retail-items/{retailItem}/force', [\App\Http\Controllers\RetailItemController::class, 'forceDestroy'])->name('retail-items.force-destroy');

        Route::delete('/timeslots/{timeslot}', [TimeslotController::class, 'destroy'])
            ->name('timeslots.destroy');
    });




require __DIR__ . '/auth.php';
