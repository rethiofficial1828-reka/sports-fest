import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function test() {
  console.log("Testing signInWithOtp with shouldCreateUser explicitly true...");
  const { data, error } = await supabase.auth.signInWithOtp({
    email: "rethiofficial1828@gmail.com",
    options: {
      shouldCreateUser: true
    }
  });
  
  if (error) {
    console.error("❌ ERROR:", error);
  } else {
    console.log("✅ SUCCESS:", data);
  }
}

test();
