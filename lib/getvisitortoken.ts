// // lib/getvisitortoken.ts

// export async function getVisitorTokenFromBackend(refreshToken?: string) {
//   const url = "https://www.wixapis.com/oauth2/token";

//   // Case 1: If we already have a refresh token → refresh the access token
//   if (refreshToken) {
//     const res = await fetch(url, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         grantType: "refresh_token",
//         refresh_token: refreshToken,
//       }),
//     });

//     if (!res.ok) {
//       console.error("❌ Failed refreshing visitor token", await res.text());
//       throw new Error("Failed to refresh visitor token");
//     }

//     const data = await res.json();
//     return {
//       access_token: data.access_token,
//       refresh_token: data.refresh_token,
//       expires_in: data.expires_in,
//     };
//   }

//   // Case 2: First-time — create an anonymous visitor token
//   const res = await fetch(url, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({
//       grantType: "anonymous",
//       clientId: "9d6c0efd-5a3a-46f5-b3de-4cde8ded7c57", // 👈 site clientId
//     }),
//   });

//   if (!res.ok) {
//     console.error("❌ Failed generating anonymous token", await res.text());
//     throw new Error("Failed to generate anonymous visitor token");
//   }

//   const data = await res.json();

//   return {
//     access_token: data.access_token,
//     refresh_token: data.refresh_token,
//     expires_in: data.expires_in,
//   };
// }
