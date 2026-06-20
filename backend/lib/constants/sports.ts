export const SPORTS = [
  { name: "Cricket", slug: "cricket", icon: "🏏", color: "#2ECC71", type: "Outdoor", team: true },
  { name: "Football", slug: "football", icon: "⚽", color: "#3498DB", type: "Outdoor", team: true },
  { name: "Basketball", slug: "basketball", icon: "🏀", color: "#E67E22", type: "Indoor/Outdoor", team: true },
  { name: "Volleyball", slug: "volleyball", icon: "🏐", color: "#9B59B6", type: "Indoor/Outdoor", team: true },
  { name: "Badminton", slug: "badminton", icon: "🏸", color: "#1ABC9C", type: "Indoor", team: false },
  { name: "Table Tennis", slug: "table-tennis", icon: "🏓", color: "#E74C3C", type: "Indoor", team: false },
  { name: "Chess", slug: "chess", icon: "♟️", color: "#9B59B6", type: "Indoor", team: false },
  { name: "Athletics", slug: "athletics", icon: "🏃", color: "#E74C3C", type: "Outdoor", team: false },
  { name: "Swimming", slug: "swimming", icon: "🏊", color: "#27AEF5", type: "Pool", team: false },
  { name: "Kabaddi", slug: "kabaddi", icon: "🤼", color: "#F39C12", type: "Outdoor", team: true },
  { name: "Tennis", slug: "tennis", icon: "🎾", color: "#1ABC9C", type: "Outdoor", team: false },
  { name: "Throwball", slug: "throwball", icon: "🏐", color: "#FF5722", type: "Outdoor", team: true },
  { name: "Handball", slug: "handball", icon: "🤾", color: "#8E44AD", type: "Indoor/Outdoor", team: true },
  { name: "Kho-Kho", slug: "kho-kho", icon: "🏃", color: "#D35400", type: "Outdoor", team: true },
  { name: "Boxing", slug: "boxing", icon: "🥊", color: "#C0392B", type: "Indoor", team: false },
  { name: "Wrestling", slug: "wrestling", icon: "🤼", color: "#7F8C8D", type: "Indoor", team: false },
  { name: "Cycling", slug: "cycling", icon: "🚴", color: "#27AE60", type: "Outdoor", team: false },
  { name: "Archery", slug: "archery", icon: "🏹", color: "#2C3E50", type: "Outdoor", team: false },
] as const;

export const SPORTS_GRID = SPORTS.slice(0, 12); // Top 12 for home grid
