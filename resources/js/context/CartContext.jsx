// /resources/js/context/CartContext.jsx
import React, {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useReducer,
} from "react";

const LS_KEY = "hh_cart_v1";

const initialState = {
    items: [], // array of cart items (sauna|event)
    cartKey: null, // idempotency key for this cart session
};

/* ---------------- helpers ---------------- */

function genKey() {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    // tiny fallback
    return "xxxx-4xxx-yxxx-xxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

function uuid() {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return "xxxx-4xxx-yxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

function safeNumber(n, fallback = 0) {
    const v = Number(n);
    return Number.isFinite(v) ? v : fallback;
}

function load() {
    try {
        const raw = localStorage.getItem(LS_KEY);
        const parsed = raw ? JSON.parse(raw) : initialState;
        if (!parsed.cartKey) parsed.cartKey = genKey(); // back-compat
        if (!Array.isArray(parsed.items)) parsed.items = [];
        return parsed;
    } catch {
        // SSR or storage disabled → start fresh with a key
        return { ...initialState, cartKey: genKey() };
    }
}

function save(state) {
    try {
        localStorage.setItem(LS_KEY, JSON.stringify(state));
    } catch {}
}

/* ---------------- reducer ---------------- */

function reducer(state, action) {
    switch (action.type) {
        case "ADD_ITEM": {
            const item = { ...action.payload, id: action.payload.id || uuid() };
            return { ...state, items: [...state.items, item] };
        }
        case "UPDATE_ITEM": {
            const { id, patch } = action.payload;
            return {
                ...state,
                items: state.items.map((it) =>
                    it.id === id ? { ...it, ...patch } : it
                ),
            };
        }
        case "REMOVE_ITEM": {
            return {
                ...state,
                items: state.items.filter((it) => it.id !== action.payload),
            };
        }
        case "CLEAR": {
            // keeps the current cartKey
            return { ...state, items: [] };
        }
        case "REGENERATE_CART_KEY": {
            return { ...state, cartKey: genKey() };
        }
        case "SET_STATE": {
            // internal: replace parts of state after we've pre-saved to LS
            return { ...state, ...action.payload };
        }
        default:
            return state;
    }
}

/* ---------------- context ---------------- */

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const [state, dispatch] = useReducer(reducer, undefined, load);

    // normal async persistence (covers typical add/remove/update flows)
    useEffect(() => save(state), [state]);

    // derived
    const count = state.items.length;
    const grandTotal = state.items.reduce(
        (t, it) => t + safeNumber(it.lineTotal, 0),
        0
    );

    // Build backend payload; includes client_id so preflight can echo per-item errors
    const toCheckoutPayload = () => ({
        cart_key: state.cartKey,
        items: state.items.map((it) => ({
            client_id: it.id,
            kind: it.kind, // "sauna" | "event"
            timeslot_id: it.timeslot_id ?? null,
            event_occurrence_id: it.event_occurrence_id ?? null,
            people: it.people,
            addons: (it.addons ?? [])
                .filter((a) => Number(a.qty) > 0)
                .map((a) => ({ code: a.code, qty: Number(a.qty) })),
        })),
    });

    // **Synchronous** clear & rekey to avoid race when navigating away
    const clearCart = (opts = { rekey: true }) => {
        const next = {
            items: [],
            cartKey: opts.rekey ? genKey() : state.cartKey,
        };
        save(next); // write BEFORE dispatch/navigate
        dispatch({ type: "SET_STATE", payload: next });
    };

    const regenerateCartKey = () => {
        const next = { ...state, cartKey: genKey() };
        save(next); // write BEFORE dispatch/navigate
        dispatch({ type: "SET_STATE", payload: next });
    };

    const api = useMemo(
        () => ({
            /* state */
            items: state.items,
            cartKey: state.cartKey,
            count,
            grandTotal,

            /* actions */
            addItem: (item) => dispatch({ type: "ADD_ITEM", payload: item }),
            updateItem: (id, patch) =>
                dispatch({ type: "UPDATE_ITEM", payload: { id, patch } }),
            removeItem: (id) => dispatch({ type: "REMOVE_ITEM", payload: id }),

            // keep for non-critical flows (still persisted by effect)
            clearCartAsync: () => dispatch({ type: "CLEAR" }),

            /* idempotency lifecycle */
            clearCart, // sync + optional rekey (default true)
            regenerateCartKey, // sync

            /* helpers */
            toCheckoutPayload,
        }),
        [state.items, state.cartKey, count, grandTotal]
    );

    return <CartContext.Provider value={api}>{children}</CartContext.Provider>;
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCart must be used within CartProvider");
    return ctx;
}
