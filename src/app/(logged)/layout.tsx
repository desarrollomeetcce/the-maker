import { requireAuthCookie } from "@/lib/auth";
import NavBar from "@/shared/components/nav-bar";

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    await requireAuthCookie();
    return (
        <div>
            <NavBar />
            {children}

        </div>
    );
}
