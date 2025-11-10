"use server"

import { wixClientServer } from "./wix-server"

export interface WixProfile {
  id?: string
  loginEmail?: string
  emails?: string[]
  firstName?: string
  lastName?: string
  nickname?: string
  profilePhoto?: {
    id?: string
    url?: string
  }
  createdDate?: string
  lastLoginDate?: string
  status?: "ACTIVE" | "BLOCKED" | "PENDING"
}


export async function getUser(){  try {
     const member =(await(await wixClientServer()).members.getCurrentMember())
          console.log("member:",member)
     return member;

  } catch (e) {
    console.error("getUser error:", e)
    return null
  }
}
