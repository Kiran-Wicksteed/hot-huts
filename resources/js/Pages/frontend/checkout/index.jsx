import InvoiceDetails from "@/Components/checkout/InvoiceDetails";
import Footer from "@/Layouts/Footer";
import Menu from "@/Layouts/Menu";

export default function CheckoutPage() {
    return (
        <>
            <Menu />
            <InvoiceDetails />
            <Footer />
        </>
    );
}
