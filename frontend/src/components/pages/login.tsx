"use client";

import { useEffect, useState } from "react";
import { signIn, signOut } from "next-auth/react";
import { Session } from "next-auth";
import { BsDiscord } from "react-icons/bs";
import { Copy, ExternalLink, Link as LinkIcon, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { UserGet } from "@/types/db";

interface LoginProps {
    session: Session | null;
    getUser: (userId: string) => Promise<Array<UserGet> | null>;
}

export default function Login({ session, getUser }: LoginProps) {
    return session ? (
        <LoggedIn session={session} getUser={getUser} />
    ) : (
        <LoggedOut />
    );
}

function LoggedIn({
    session,
    getUser,
}: {
    session: Session;
    getUser: (userId: string) => Promise<Array<UserGet> | null>;
}) {
    return (
        <Card className="flex-1">
            <CardHeader>
                <CardTitle>Account</CardTitle>
                <CardDescription>
                    Access your shortened URLs and more features
                </CardDescription>
            </CardHeader>
            <CardContent>
                <UserInfo session={session} />
            </CardContent>
            <CardFooter className="flex-col space-y-2">
                <ShortenedURLsCard getUser={getUser} session={session} />
                <LogoutButton />
            </CardFooter>
        </Card>
    );
}

function LoggedOut() {
    return (
        <Card className="flex-1">
            <CardHeader>
                <CardTitle>Login with Discord</CardTitle>
                <CardDescription>
                    Access your shortened URLs and more features
                </CardDescription>
            </CardHeader>
            <CardFooter>
                <LoginButton />
            </CardFooter>
        </Card>
    );
}

function UserInfo({ session }: { session: Session }) {
    return (
        <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20 border-2 border-white">
                <AvatarImage
                    src={session.user.image ?? ""}
                    alt={session.user.name ?? "User"}
                />
            </Avatar>
            <div>
                <h2 className="text-xl font-semibold">{session.user.name}</h2>
                <p className="text-sm text-gray-400">Logged in user</p>
            </div>
        </div>
    );
}

function LoginButton() {
    return (
        <Button
            className="w-full"
            variant="outline"
            onClick={() => signIn("discord")}
        >
            <BsDiscord className="mr-2 h-4 w-4" />
            Login with Discord
        </Button>
    );
}

function LogoutButton() {
    return (
        <Button
            className="w-full bg-red-500 hover:bg-red-600 text-white transition-colors duration-200"
            onClick={() => signOut()}
        >
            <LogOut className="mr-2 h-4 w-4" />
            Log Out
        </Button>
    );
}

function useShortenedUrls(
    getUser: (userId: string) => Promise<Array<UserGet> | null>,
    userId: string,
) {
    const [user, setUser] = useState<Array<UserGet> | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchUser() {
            setIsLoading(true);
            try {
                const userData = await getUser(userId);
                setUser(userData);
            } catch (error) {
                console.error("Failed to fetch user data:", error);
            } finally {
                setIsLoading(false);
            }
        }

        if (userId) {
            fetchUser();
        }
    }, [userId, getUser]);

    return { user, isLoading };
}

function ShortenedURLsCard({
    getUser,
    session,
}: {
    getUser: (userId: string) => Promise<Array<UserGet> | null>;
    session: Session;
}) {
    const [isUrlsDialogOpen, setIsUrlsDialogOpen] = useState(false);
    const { user, isLoading } = useShortenedUrls(getUser, session.user.id);
    const { toast } = useToast();

    function handleCopy(url: string) {
        navigator.clipboard.writeText(url);
        toast({ description: "URL copied to clipboard.", duration: 2000 });
    }

    return (
        <Dialog open={isUrlsDialogOpen} onOpenChange={setIsUrlsDialogOpen}>
            <DialogTrigger asChild>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200">
                    <LinkIcon className="mr-2 h-4 w-4" />
                    View Shortened URLs
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center mb-4">
                        Your Shortened URLs
                    </DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-[300px] pr-4">
                    <div className="space-y-4">
                        {isLoading ? (
                            <div className="flex justify-center">
                                Loading...
                            </div>
                        ) : !user || user.length === 0 ? (
                            <div className="flex justify-center">
                                No URLs yet..
                            </div>
                        ) : (
                            user.map((userItem, index) => (
                                <ShortenedURLItem
                                    key={index}
                                    user={userItem}
                                    onCopy={handleCopy}
                                />
                            ))
                        )}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}

function ShortenedURLItem({
    user,
    onCopy,
}: {
    user: UserGet;
    onCopy: (url: string) => void;
}) {
    const shortUrl = `https://${window.location.hostname}/${user.short_code}`;

    return (
        <div className="border rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
                <span className="flex-1">{user.original_url}</span>
                <a
                    href={user.original_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-blue-500 hover:text-blue-600"
                >
                    <ExternalLink className="h-4 w-4" />
                </a>
            </div>
            <div className="flex items-center">
                <input
                    type="text"
                    value={shortUrl}
                    readOnly
                    className="flex-1 border rounded-md rounded-r-none py-2 px-3 text-sm focus:outline-none focus:ring-2"
                />
                <Button
                    onClick={() => onCopy(shortUrl)}
                    className="rounded-l-none border-0"
                    variant="default"
                >
                    Copy
                    <Copy className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
