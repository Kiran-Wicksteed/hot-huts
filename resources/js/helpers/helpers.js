// resources/js/helpers.js
export function asset(path) {
    return `${process.env.MIX_APP_URL}/${path}`;
}
