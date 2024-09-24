"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { AlertCircle, Link as LinkIcon, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

export default function Shortener({
    inputUrl,
}: {
    inputUrl: (url: string) => Promise<{ code: string }>;
}) {
    const { toast } = useToast();
    const [longUrl, setLongUrl] = useState("");
    const [shortUrl, setShortUrl] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setShortUrl("");

        try {
            const response = await inputUrl(longUrl);

            const shortened = `https://${
                window.location.hostname
            }/${response.code}`;
            setShortUrl(shortened);
            setIsLoading(false);
        } catch (e) {
            console.error(e);
            setError("Failed to shorten URL.");
            setIsLoading(false);
        }
    }

    function handleCopy() {
        navigator.clipboard.writeText(shortUrl);
        toast({
            title: "Success!",
            description: "Copied short URL to clipboard.",
        });
    }

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>URL Shortener</CardTitle>
                <CardDescription>
                    Enter a long URL to get a shortened version
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="longUrl">Long URL</Label>
                        <Input
                            id="longUrl"
                            type="url"
                            placeholder="https://example.com/very/long/url"
                            value={longUrl}
                            onChange={(e) => setLongUrl(e.target.value)}
                            required
                        />
                    </div>
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading}
                    >
                        {isLoading ? "Shortening..." : "Shorten URL"}
                    </Button>
                </form>

                {error && (
                    <Alert variant="destructive" className="mt-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {shortUrl && (
                    <div className="relative">
                        <X
                            className="text-red top-1 right-0 absolute hover:cursor-pointer"
                            onClick={() => setShortUrl("")}
                        />
                        <div className="mt-4 p-4 border-t rounded-md">
                            <div className="flex items-center space-x-2">
                                <LinkIcon className="h-4 w-4 text-green-500" />
                                <Label>Shortened URL:</Label>
                            </div>
                            <div className="mt-2 flex items-center space-x-2">
                                <Input value={shortUrl} readOnly />
                                <Button onClick={handleCopy} variant="outline">
                                    Copy
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
