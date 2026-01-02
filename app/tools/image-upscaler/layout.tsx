import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "AI Image Upscaler | AI Tool Verse",
    description: "Free online AI image upscaler powered by WebGPU. Upscale images 2x-4x locally in your browser with GPU acceleration. No upload required.",
    keywords: ["image upscaler", "ai upscaling", "webgpu image processing", "client side upscaling", "free photo enhancer", "image resolution enhancer", "bicubic interpolation"],
};

export default function ImageUpscalerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
