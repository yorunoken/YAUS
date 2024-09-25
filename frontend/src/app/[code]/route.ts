import { BACKEND_URL } from "@/lib";
import { UserGet } from "@/types/db";
import { notFound, redirect } from "next/navigation";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    const code = request.nextUrl.pathname.slice(1);

    const response = await fetch(`${BACKEND_URL}/api/url/${code}/get`);

    if (response.status !== 200) {
        notFound();
    }

    const data: UserGet = await response.json();

    redirect(`${data.original_url}`);
}
