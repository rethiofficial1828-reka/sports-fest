import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import HeroBanner from "@/frontend/shared/components/home/HeroBanner";
import StatsBar from "@/frontend/shared/components/home/StatsBar";
import SportsCategoryGrid from "@/frontend/shared/components/home/SportsCategoryGrid";
import FeaturedEvents from "@/frontend/shared/components/home/FeaturedEvents";
import UpcomingEvents from "@/frontend/shared/components/home/UpcomingEvents";
import CollegeMarquee from "@/frontend/shared/components/home/CollegeMarquee";

export default async function HomePage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="page-enter">
      <HeroBanner />
      <StatsBar />
      <SportsCategoryGrid />
      <FeaturedEvents />
      <UpcomingEvents />
      <CollegeMarquee />
    </div>
  );
}
