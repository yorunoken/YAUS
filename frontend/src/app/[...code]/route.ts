import { BACKEND_URL } from "@/lib";
import { notFound, redirect } from "next/navigation";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    const code = request.nextUrl.pathname.slice(1);

    console.log(`${BACKEND_URL}/api/get/${code}`);

    const response = await fetch(`${BACKEND_URL}/api/get/${code}`);

    if (response.status !== 200) {
        notFound();
    }

    const data: {
        id: string;
        short_code: string;
        original_url: string;
        created_at: string;
    } = await response.json();

    redirect(`${data.original_url}`);
}
