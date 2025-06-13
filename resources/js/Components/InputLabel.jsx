export default function InputLabel({
    value,
    className = "",
    children,
    ...props
}) {
    return (
        <label
            {...props}
            className={
                `block text-sm font-medium text-gray-700 sr-only` + className
            }
        >
            {value ? value : children}
        </label>
    );
}
