import "./globals.css";

export const metadata = {
  title: "Auryx Admin",
  description: "Auryx Logistics Platform - Admin Panel",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
