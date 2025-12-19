import { adminDb } from "@/lib/firebase/admin";
import { getSession } from "@/lib/firebase/server";
import { notFound } from "next/navigation";
import DocumentDetail from "@/components/dashboard/document-detail";
import { DocumentMetadata } from "@/lib/actions/documents";

interface PageProps {
    params: {
        id: string;
    };
    searchParams: {
        chatId?: string;
    };
}

export default async function DocumentPage({ params, searchParams }: PageProps) {
    const session = await getSession();
    if (!session) return notFound();

    const userId = session.uid;
    const docId = params.id;

    const db = adminDb;
    if (!db) return notFound();

    const docRef = db
        .collection("users")
        .doc(userId)
        .collection("documents")
        .doc(docId);

    const docSnapshot = await docRef.get();

    if (!docSnapshot.exists) {
        return notFound();
    }

    const document = {
        id: docSnapshot.id,
        ...(docSnapshot.data() as DocumentMetadata),
    };

    return (
        <div className="container px-0 py-0 max-w-none h-full overflow-hidden">
            <DocumentDetail
                document={document}
                initialChatId={searchParams.chatId}
            />
        </div>
    );
}
