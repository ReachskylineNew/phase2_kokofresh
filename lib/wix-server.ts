// app/utillity/wixclient.ts
// import { createClient, OAuthStrategy } from "@wix/sdk";
// import { members } from "@wix/members";

// export function createWixClient(tokens?: any) {
//   return createClient({
//     modules: { members },
//     auth: OAuthStrategy({
//       clientId: process.env.NEXT_PUBLIC_WIX_CLIENT_ID!,
//       tokens, // optional: pass tokens (for server-side calls)
//     }),
//   });
// }




import { createClient, ApiKeyStrategy, OAuthStrategy } from "@wix/sdk";
import {members} from "@wix/members"
import {currentCart} from "@wix/ecom"
import {collections} from "@wix/stores"
import {products} from "@wix/stores"
import Cookies from "js-cookie"

import {cookies} from "next/headers"

export const wixClientServer=async()=>{

    let refreshToken;
    let accessToken;

try{
    const cookieStore= cookies();

refreshToken=JSON.parse(cookieStore.get("refreshToken")?.value || "{}")
accessToken=JSON.parse(cookieStore.get("refreshToken")?.value || "{}")
}catch(e){

}

const wixClient= createClient({
    modules:{
      products,
      collections,
      currentCart,
      members
    },

    auth: OAuthStrategy({
      clientId:"2656201f-a899-4ec4-8b24-d1132bcf5405",
      tokens: {
        accessToken,
        refreshToken
      }
    })
})

return wixClient
}