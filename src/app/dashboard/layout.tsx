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
                name: (session as any).name || (session as any).email?.split("@")[0],
                email: (session as any).email,
                avatarUrl: (session as any).picture,
            }}
        >
            {children}
        </DashboardLayout>
    );
}
