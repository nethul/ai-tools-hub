import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Password Generator | AI Tool Verse",
    description: "Free secure password generator. Create strong, random passwords with customizable length, character types, and security options. All processing happens locally.",
    keywords: ["password generator", "random password", "secure password", "strong password", "password creator", "passphrase generator", "online password generator"],
};

export default function PasswordGeneratorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
