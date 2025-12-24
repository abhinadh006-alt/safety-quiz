// src/lib/supabase.js
import { createClient } from "@supabase/supabase-js";

const URL = import.meta.env.VITE_SUPABASE_URL;
const ANON = import.meta.env.VITE_SUPABASE_ANON;

/**
 * Chainable query object used as a stub. Methods return the same object
 * so calls like supabase.from(...).select(...).order(...).limit(...) work.
 * The actual execution happens when `.execute()` or `.then()` is used,
 * returning a promise that resolves to { data: [], error: null }.
 */
function makeChainableStub() {
    const q = {
        _table: null,
        _ops: [],

        from(table) {
            this._table = table;
            return this;
        },
        select(/* columns */) {
            this._ops.push({ op: "select", args: Array.from(arguments) });
            return this;
        },
        order(/* ...args */) {
            this._ops.push({ op: "order", args: Array.from(arguments) });
            return this;
        },
        limit(n) {
            this._ops.push({ op: "limit", args: [n] });
            return this;
        },
        match(obj) {
            this._ops.push({ op: "match", args: [obj] });
            return this;
        },
        ilike(col, pattern) {
            this._ops.push({ op: "ilike", args: [col, pattern] });
            return this;
        },
        eq(col, val) {
            this._ops.push({ op: "eq", args: [col, val] });
            return this;
        },
        insert(payload) {
            this._ops.push({ op: "insert", args: [payload] });
            return this;
        },
        update(payload) {
            this._ops.push({ op: "update", args: [payload] });
            return this;
        },
        delete() {
            this._ops.push({ op: "delete", args: [] });
            return this;
        },

        // Promise compatibility: allow await or .then usage
        then(resolve) {
            const result = { data: [], error: null };
            return Promise.resolve(result).then(resolve);
        },
        catch() {
            return Promise.resolve({ data: [], error: null });
        },

        // explicit execution if code calls .execute()
        async execute() {
            return { data: [], error: null };
        },
    };

    return q;
}

const stubQuery = makeChainableStub();

const stubClient = {
    from: (table) => stubQuery.from(table),
    rpc: async () => ({ data: null, error: null }),
    auth: {
        // keep API shape similar to real client so callers don't crash
        signIn: async () => ({ data: null, error: new Error("auth not available (missing env)") }),
        signOut: async () => ({ error: null }),
    },
    __isStub: true,
};

let supabase;

if (!URL || !ANON) {
    // Warn developer; do not throw — use the stub so UI doesn't crash
    // eslint-disable-next-line no-console
    console.error(
        "Supabase client: VITE_SUPABASE_URL or VITE_SUPABASE_ANON is missing. " +
        "Create a .env.local file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON and restart the dev server."
    );
    supabase = stubClient;
} else {
    supabase = createClient(URL, ANON);
}

// static export (ESM)
export { supabase };
export default supabase;
