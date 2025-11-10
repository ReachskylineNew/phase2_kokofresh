// app/ServerNavigation.tsx
import { Navigation } from "@/components/navigation";
import { getUser } from "@/lib/get-user";

export default async function ServerNavigation() {
  const user = await getUser(); // safe here
  return <Navigation user={user} />;
}
