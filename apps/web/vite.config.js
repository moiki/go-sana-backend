import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import {VitePWA} from "vite-plugin-pwa";

export default defineConfig(({mode}) => ({
    plugins: [
        react(),
        VitePWA({
            registerType: "autoUpdate",
            includeAssets: ["favicon.svg", "robots.txt"],
            manifest: {
                name: "Sana POS — Farmacia",
                short_name: "Sana",
                description: "Sistema de punto de venta para farmacia",
                display: "standalone",
                theme_color: "#0F766E",
                background_color: "#0F766E",
                start_url: "/",
                icons: [
                    {src: "favicon.svg", sizes: "any", type: "image/svg+xml", purpose: "any"},
                    {src: "logo192.png", sizes: "192x192", type: "image/png"},
                    {src: "logo512.png", sizes: "512x512", type: "image/png"},
                ],
            },
            workbox: {
                globPatterns: ["**/*.{js,css,html,svg,png,ico}"],
                navigateFallback: "/index.html",
                navigateFallbackDenylist: [/^\/api/],
            },
        }),
    ],
    server: {
        port: 3000,
        proxy: {
            "/api": {
                target: "http://localhost:9000",
                changeOrigin: true,
            },
        },
    },
    build: {
        outDir: "dist",
    },
    define: {
        "process.env.NODE_ENV": JSON.stringify(mode === "production" ? "production" : "development"),
    },
}));