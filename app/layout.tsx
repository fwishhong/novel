import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "小说创作工作室",
  description: "AI 辅助的长篇网络小说创作平台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
