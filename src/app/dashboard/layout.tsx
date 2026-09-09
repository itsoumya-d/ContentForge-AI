import { redirect } from "next/navigation";
import { getSession } from "@/lib/firebase/server";
import { DashboardLayout } from "@/components/dashboard";

export default async function DashboardRootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }

    return (
        <DashboardLayout
            user={{
                name: session.name || session.email?.split("@")[0],
                email: session.email,
                avatarUrl: session.picture,
            }}
        >
            {children}
        </DashboardLayout>
    );
}
