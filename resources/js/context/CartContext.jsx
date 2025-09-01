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
    cartKey: null, // persisted idempotency key (one per “open” cart)
};

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

function safeNumber(n, fallback = 0) {
    const v = Number(n);
    return Number.isFinite(v) ? v : fallback;
}

function load() {
    try {
        const raw = localStorage.getItem(LS_KEY);
        const parsed = raw ? JSON.parse(raw) : initialState;
        // Backward-compat: carts saved before cartKey existed
        if (!parsed.cartKey) parsed.cartKey = genKey();
        if (!Array.isArray(parsed.items)) parsed.items = [];
        return parsed;
    } catch {
        // SSR or storage disabled
        return { ...initialState, cartKey: genKey() };
    }
}

function save(state) {
    try {
        localStorage.setItem(LS_KEY, JSON.stringify(state));
    } catch {}
}

function uuid() {
    if (typeof crypto !== "undefined" && crypto.randomUUID)
        return crypto.randomUUID();
    return "xxxx-4xxx-yxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

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
            // note: we intentionally keep the cartKey (same “shopping session”)
            return { ...state, items: [] };
        }
        case "REGENERATE_CART_KEY": {
            // call this after a successful checkout to prevent idempotency clashes
            return { ...state, cartKey: genKey() };
        }
        default:
            return state;
    }
}

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const [state, dispatch] = useReducer(reducer, undefined, load);

    useEffect(() => save(state), [state]);

    // Derived helpers
    const count = state.items.length;
    const grandTotal = state.items.reduce(
        (t, it) => t + safeNumber(it.lineTotal, 0),
        0
    );

    // Convert current cart to the backend payload shape expected by bookings.store
    // -> { cart_key, items: [{ kind, timeslot_id, event_occurrence_id, people, addons:[{code,qty}] }]}
    const toCheckoutPayload = () => ({
        cart_key: state.cartKey,
        items: state.items.map((it) => ({
            kind: it.kind, // "sauna" | "event"
            timeslot_id: it.timeslot_id ?? null,
            event_occurrence_id: it.event_occurrence_id ?? null,
            people: it.people,
            addons: (it.addons ?? []).map((a) => ({
                code: a.code,
                qty: a.qty,
            })),
        })),
    });

    const api = useMemo(
        () => ({
            // state
            items: state.items,
            cartKey: state.cartKey,
            count,
            grandTotal, // number (in rands, based on your item.lineTotal inputs)

            // actions
            addItem: (item) => dispatch({ type: "ADD_ITEM", payload: item }),
            updateItem: (id, patch) =>
                dispatch({ type: "UPDATE_ITEM", payload: { id, patch } }),
            removeItem: (id) => dispatch({ type: "REMOVE_ITEM", payload: id }),
            clearCart: () => dispatch({ type: "CLEAR" }),

            // idempotency lifecycle
            regenerateCartKey: () => dispatch({ type: "REGENERATE_CART_KEY" }),

            // selectors/utilities
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
