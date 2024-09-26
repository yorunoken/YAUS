import Login from "@/components/pages/login";
import Shortener from "@/components/pages/shortener";
import { BACKEND_URL } from "@/lib";
import { authOptions } from "@/lib/auth";
import { UrlInsert, UserGet } from "@/types/db";
import { Message } from "@/types/message";
import { getServerSession } from "next-auth";

export default async function Home() {
    const session = await getServerSession(authOptions);

    async function insertUrl(url: string): Promise<UrlInsert> {
        "use server";

        const response = await fetch(`${BACKEND_URL}/api/url`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ url, discordId: session?.user.id }),
        });

        if (response.status !== 200) {
            console.log(await response.text());
            throw new Error("Error while getting response");
        }

        return await response.json();
    }

    async function getUser(userId: string): Promise<Array<UserGet> | null> {
        "use server";

        const response = await fetch(
            `${BACKEND_URL}/api/user/${userId}/details`,
        );

        if (response.status !== 200) {
            console.log(await response.text());
            return null;
        }

        return await response.json();
    }

    async function deleteUrl(shortCode: string): Promise<Message> {
        "use server";

        const response = await fetch(`${BACKEND_URL}/api/url/${shortCode}`, {
            method: "DELETE",
        });

        if (response.status !== 200) {
            console.log(await response.text());
            throw new Error("Error while deleting short URL");
        }

        return await response.json();
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <header className="text-center mb-8">
                <h1 className="text-3xl font-bold">YAUS</h1>
                <p className="text-sm text-muted-foreground">
                    yet-another-url-shortener.
                </p>
            </header>
            <div className="w-full max-w-4xl flex flex-col md:flex-row gap-8">
                <Login
                    session={session}
                    getUser={getUser}
                    deleteUrl={deleteUrl}
                />
                <Shortener session={session} insertUrl={insertUrl} />
            </div>
        </div>
    );
}
