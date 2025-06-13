// app/layout.js (or layout.tsx)

import "./globals.css";
import Footer from "@/Components/Footer/Footer";

export const metadata = {
  title: "Solx - A Solana Dapp",
  description: "Solana Dapp",
  icons: {
    icon: "/Solana_logo.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Footer />
      </body>
    </html>
  );
}
