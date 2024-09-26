"use client";

import { useEffect, useState } from "react";
import { signIn, signOut } from "next-auth/react";
import { Session } from "next-auth";
import { BsDiscord } from "react-icons/bs";
import {
    Copy,
    ExternalLink,
    Link as LinkIcon,
    LogOut,
    Trash2,
} from "lucide-react";
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
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { UserGet } from "@/types/db";
import { Message } from "@/types/message";

interface NormalProps {
    getUser: (userId: string) => Promise<Array<UserGet> | null>;
    deleteUrl: (url: string) => Promise<Message>;
}

interface LoginProps extends NormalProps {
    session: Session | null;
}

interface PassingProps extends NormalProps {
    session: Session;
}

export default function Login({
    session,
    getUser,
    deleteUrl,
}: LoginProps & { session: Session | null }) {
    return session ? (
        <LoggedIn session={session} getUser={getUser} deleteUrl={deleteUrl} />
    ) : (
        <LoggedOut />
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

function LoggedIn({ session, getUser, deleteUrl }: PassingProps) {
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
                <ShortenedURLsCard
                    getUser={getUser}
                    session={session}
                    deleteUrl={deleteUrl}
                />
                <LogoutButton />
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

function ShortenedURLsCard({ session, getUser, deleteUrl }: PassingProps) {
    const [isUrlsDialogOpen, setIsUrlsDialogOpen] = useState(false);
    const [refresh, setRefresh] = useState(false);
    const [user, setUser] = useState<Array<UserGet> | null>(null);

    const userId = session.user.id;
    const { toast } = useToast();

    useEffect(() => {
        async function fetchUser() {
            try {
                const userData = await getUser(userId);
                setUser(userData);
            } catch (error) {
                console.error("Failed to fetch user data:", error);
                toast({
                    title: "Error",
                    description: "Failed to fetch user data. Please try again.",
                    variant: "destructive",
                });
            }
        }
        console.log("fetched");

        if (userId && isUrlsDialogOpen) {
            fetchUser();
        }
        setRefresh(false);
    }, [userId, getUser, refresh, isUrlsDialogOpen, toast]);

    function handleCopy(url: string) {
        navigator.clipboard.writeText(url);
        toast({ description: "URL copied to clipboard.", duration: 2000 });
    }

    function handleOpen(open: boolean) {
        setIsUrlsDialogOpen(open);
        if (open) {
            setRefresh(true);
        }
    }

    async function handleDelete(urlId: string) {
        try {
            await deleteUrl(urlId);
            setRefresh(true);
            toast({ description: "URL deleted successfully.", duration: 2000 });
        } catch (error) {
            console.error("Failed to delete URL:", error);
            toast({
                title: "Error",
                description: "Failed to delete URL. Please try again.",
                variant: "destructive",
            });
        }
    }

    return (
        <Dialog open={isUrlsDialogOpen} onOpenChange={handleOpen}>
            <DialogTrigger asChild>
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                    <LinkIcon className="mr-2 h-4 w-4" />
                    View Shortened URLs
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center mb-4">
                        Your Shortened URLs
                    </DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-[300px] pr-4">
                    <div className="space-y-4">
                        {!user || user.length === 0 ? (
                            <div className="flex justify-center text-muted-foreground">
                                No URLs here...
                            </div>
                        ) : (
                            user.map((userItem, index) => (
                                <ShortenedURLItem
                                    key={index}
                                    user={userItem}
                                    onCopy={handleCopy}
                                    onDelete={handleDelete}
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
    onDelete,
}: {
    user: UserGet;
    onCopy: (url: string) => void;
    onDelete: (urlId: string) => Promise<void>;
}) {
    const shortUrl = `https://${window.location.hostname}/${user.short_code}`;

    return (
        <div className="border rounded-lg p-4 space-y-3 bg-card text-card-foreground shadow-sm">
            <div className="flex items-start justify-between text-sm">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="flex-1 mr-2 break-all line-clamp-2 hover:line-clamp-none transition-all duration-200">
                                {user.original_url}
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="max-w-xs">{user.original_url}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <div className="flex items-center space-x-2 flex-shrink-0">
                    <a
                        href={user.original_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-600"
                    >
                        <ExternalLink className="h-4 w-4" />
                    </a>
                    <Button
                        onClick={() => onDelete(user.short_code)}
                        size="sm"
                        variant="destructive"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            <div className="flex items-center">
                <input
                    type="text"
                    value={shortUrl}
                    readOnly
                    className="flex-1 border rounded-md rounded-r-none py-2 px-3 text-sm focus:outline-none focus:ring-2 bg-background"
                />
                <Button
                    onClick={() => onCopy(shortUrl)}
                    className="rounded-l-none"
                    variant="secondary"
                >
                    Copy
                    <Copy className="ml-2 h-4 w-4" />
                </Button>
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
