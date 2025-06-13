export default function Checkbox({ className = "", ...props }) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                "rounded border-gray-300 text-hh-orange shadow-sm focus:ring-hh-orange " +
                className
            }
        />
    );
}
