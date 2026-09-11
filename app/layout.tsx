import type { Metadata, Viewport } from "next";
import { Sora, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const sora = Sora({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-sora" });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-inter" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-jetbrains" });

export const metadata: Metadata = {
  title: "Workforce Attrition Intelligence — HR Analytics",
  description:
    "Interactive HR analytics dashboard for workforce attrition — KPIs, department and satisfaction signals, a live logistic-regression risk predictor, model performance and a searchable employee data explorer.",
  keywords: ["HR analytics", "employee attrition", "workforce intelligence", "attrition prediction", "logistic regression"],
};

export const viewport: Viewport = {
  themeColor: "#0a0f1c",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-bg">
      <body className={`${sora.variable} ${inter.variable} ${jetbrains.variable}`}>{children}</body>
    </html>
  );
}
