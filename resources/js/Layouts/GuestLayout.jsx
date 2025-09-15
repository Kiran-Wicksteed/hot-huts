import styles from "../../styles";

export default function GuestLayout({ children }) {
    return <div className="grid grid-cols-1 lg:grid-cols-3 h-screen">{children}</div>;
}
