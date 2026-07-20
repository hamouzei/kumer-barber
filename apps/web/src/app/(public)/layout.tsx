import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PublicMobileNav } from "@/components/layout/public-mobile-nav";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <PublicMobileNav />
      <Footer />
    </>
  );
}
