import NavBar from "@/shared/components/nav-bar";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div>
            <NavBar />
            {children}

        </div>
    );
}
