export default function ApplicationLogo(props) {
    const asset = (path) => {
        return `/storage/images/${path}`;
    };
    return <img {...props} src={asset("logo.png")} alt="Application Logo" />;
}
