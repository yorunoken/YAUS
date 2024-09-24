import Shortener from "@/components/pages/main";
import { BACKEND_URL } from "@/lib";

export default function Home() {
    async function inputUrl(url: string): Promise<{ code: string }> {
        "use server";

        console.log(`${BACKEND_URL}/api/url/shorten`);
        console.log(process.env.BACKEND_PORT);

        const response = await fetch(`${BACKEND_URL}/api/url/shorten`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ url }),
        });

        if (response.status !== 200) {
            throw new Error("Error while getting response");
        }

        const data: { code: string } = await response.json();

        return data;
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <Shortener inputUrl={inputUrl} />
        </div>
    );
}
