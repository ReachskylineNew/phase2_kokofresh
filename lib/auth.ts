export async function registerUser(
  email: string,
  password: string,
  nickname?: string
) {
  const res = await fetch("/api/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",  // ✅ must be JSON
    },
    body: JSON.stringify({ email, password, nickname }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Registration failed");
  }
  return data;
}
