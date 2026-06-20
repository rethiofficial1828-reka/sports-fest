export const INDIAN_CITIES = [
  // Tamil Nadu
  { city: "Chennai", state: "Tamil Nadu" },
  { city: "Coimbatore", state: "Tamil Nadu" },
  { city: "Madurai", state: "Tamil Nadu" },
  { city: "Tiruchirappalli", state: "Tamil Nadu" },
  { city: "Vellore", state: "Tamil Nadu" },
  // Maharashtra
  { city: "Mumbai", state: "Maharashtra" },
  { city: "Pune", state: "Maharashtra" },
  { city: "Nagpur", state: "Maharashtra" },
  // Karnataka
  { city: "Bengaluru", state: "Karnataka" },
  { city: "Mysuru", state: "Karnataka" },
  { city: "Manipal", state: "Karnataka" },
  // Delhi / NCR
  { city: "New Delhi", state: "Delhi" },
  { city: "Noida", state: "Uttar Pradesh" },
  { city: "Gurgaon", state: "Haryana" },
  // Telangana
  { city: "Hyderabad", state: "Telangana" },
  { city: "Warangal", state: "Telangana" },
  // Andhra Pradesh
  { city: "Visakhapatnam", state: "Andhra Pradesh" },
  { city: "Vijayawada", state: "Andhra Pradesh" },
  // Kerala
  { city: "Thiruvananthapuram", state: "Kerala" },
  { city: "Kochi", state: "Kerala" },
  { city: "Kozhikode", state: "Kerala" },
  // Gujarat
  { city: "Ahmedabad", state: "Gujarat" },
  { city: "Surat", state: "Gujarat" },
  { city: "Vadodara", state: "Gujarat" },
  // West Bengal
  { city: "Kolkata", state: "West Bengal" },
  { city: "Siliguri", state: "West Bengal" },
  // Rajasthan
  { city: "Jaipur", state: "Rajasthan" },
  { city: "Jodhpur", state: "Rajasthan" },
  // Punjab & Haryana
  { city: "Chandigarh", state: "Punjab" },
  { city: "Amritsar", state: "Punjab" },
  // MP & CG
  { city: "Bhopal", state: "Madhya Pradesh" },
  { city: "Indore", state: "Madhya Pradesh" },
  { city: "Raipur", state: "Chhattisgarh" },
  // Bihar & Jharkhand
  { city: "Patna", state: "Bihar" },
  { city: "Ranchi", state: "Jharkhand" },
  // Odisha
  { city: "Bhubaneswar", state: "Odisha" },
  // Assam
  { city: "Guwahati", state: "Assam" },
  // Uttarakhand
  { city: "Dehradun", state: "Uttarakhand" },
  { city: "Roorkee", state: "Uttarakhand" },
];

export const STATES = [...new Set(INDIAN_CITIES.map((c) => c.state))].sort();
