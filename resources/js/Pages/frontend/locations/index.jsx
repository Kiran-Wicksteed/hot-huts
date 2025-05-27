import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import styles from "../../../../styles";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import Menu from "@/Layouts/menu";
import Hero from "@/Components/locations/hero";

export default function LocationPage() {
    return (
        <div>
            <Menu />
            <Hero />
        </div>
    );
}
