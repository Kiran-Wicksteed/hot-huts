// Build the "pricing" and normalised DraftItem from your current formData/copy.

export function chosenAddons(servicesForm, catalogue) {
    return catalogue
        .filter(
            (s) => s.category === "addon" && (servicesForm[s.code] ?? 0) > 0
        )
        .map((s) => {
            const unit = Number(s.price);
            const qty = servicesForm[s.code];
            return { code: s.code, name: s.name, unit, qty, line: unit * qty };
        });
}

export function priceFromForm(formData, catalogue, sessionService) {
    const isEvent = formData.booking_type === "event";

    if (isEvent) {
        const baseLineRands = Number((formData.event_price ?? 0) / 100); // already the event bundle price
        const addons = []; // usually none for event, but keep shape consistent
        const addonsSum = addons.reduce((t, a) => t + a.line, 0);
        return {
            currency: "ZAR",
            baseUnit: baseLineRands, // treat bundle price as the "unit"
            baseLine: baseLineRands,
            addons,
            total: baseLineRands + addonsSum,
        };
    }

    // Sauna-only
    const people = formData.services?.people ?? 1;
    const baseUnit = Number(sessionService.price); // rands
    const baseLine = baseUnit * people;

    const addons = chosenAddons(formData.services || {}, catalogue);
    const addonsSum = addons.reduce((t, a) => t + a.line, 0);

    return {
        currency: "ZAR",
        baseUnit,
        baseLine,
        addons,
        total: baseLine + addonsSum,
    };
}

export function draftFromForm(formData, catalogue, sessionService) {
    const isEvent = formData.booking_type === "event";
    const pricing = priceFromForm(formData, catalogue, sessionService);

    return {
        id: undefined, // assigned by context
        kind: isEvent ? "event" : "sauna",
        location: { id: formData.location?.id, name: formData.location?.name },
        date: isEvent ? formData.event_date : formData.date,
        timeRange: isEvent
            ? formData.event_time_range
            : formData.time || formData.sauna_time,
        timeslot_id: isEvent ? undefined : formData.timeslot_id,
        event_occurrence_id: isEvent ? formData.event_occurrence_id : undefined,
        people: isEvent
            ? formData.event_people
            : formData.services?.people ?? 1,
        addons: isEvent
            ? {} // typically none; keep empty record
            : Object.fromEntries(
                  (catalogue || [])
                      .filter((s) => s.category === "addon")
                      .map((s) => [s.code, formData.services?.[s.code] ?? 0])
              ),
        pricing,
    };
}

export function humanDate(iso) {
    // "2025-09-07" -> "7 September 2025"
    try {
        const d = new Date(iso + "T00:00:00");
        return d.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    } catch {
        return iso;
    }
}
