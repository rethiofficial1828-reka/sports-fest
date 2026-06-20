import Navbar from "@/frontend/shared/components/layout/Navbar";
import Footer from "@/frontend/shared/components/layout/Footer";
import MobileFAB from "@/frontend/shared/components/layout/MobileFAB";
import CancellationAnnouncements from "@/frontend/shared/components/layout/CancellationAnnouncements";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <CancellationAnnouncements />
      <main className="min-h-screen">{children}</main>
      <MobileFAB />
      <Footer />
    </>
  );
}
