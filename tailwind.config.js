import defaultTheme from "tailwindcss/defaultTheme";
import forms from "@tailwindcss/forms";

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php",
        "./storage/framework/views/*.php",
        "./resources/views/**/*.blade.php",
        "./resources/js/**/*.jsx",
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ["Montserrat", ...defaultTheme.fontFamily.sans],
            },
            colors: {
                "d-blue-dark": "#3B4559",
                "d-blue-medium": "#4D5F80",
                "d-blue-light": "#72829F",
                "d-gray": "#D0D3D4",
                "d-accent-green": "#C6DCDA",
                "d-accent-blue-light": "#B7C9D3",
                "d-accent-blue-medium": "#9099BA",
                "d-accent-purple": "#B1B5CE",
                "hh-orange": "#FF7022",
            },
        },
    },

    plugins: [forms],
};
