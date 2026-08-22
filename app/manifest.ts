import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mah Buddy — Your AI Study Companion",
    short_name: "Mah Buddy",
    description: "A friendly AI study companion for learning, revision, quizzes, flashcards, and voice conversation.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f7f7f5",
    theme_color: "#f7f7f5",
    orientation: "portrait-primary",
    categories: ["education", "productivity"],
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
