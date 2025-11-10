import { NextRequest, NextResponse } from "next/server"
import { getWixAdminClient } from "../../utillity/wixadminclient"

export async function PATCH(req: NextRequest) {
  try {
    const { contactId, info } = await req.json()
    if (!contactId) {
      return NextResponse.json({ error: "Missing contactId" }, { status: 400 })
    }

    const wixAdminClient = getWixAdminClient()

    // 1. Fetch existing contact (to get revision + existing structure)
    const contact = await wixAdminClient.contacts.getContact(contactId)
    if (!contact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 })
    }

    // ✅ Start with current info
    let updatedInfo = { ...contact.info }

    // 2a. Update addresses
    if (info?.addresses?.items?.length) {
      updatedInfo.addresses = {
        items: info.addresses.items.map((formAddr: any, i: number) => ({
          tag: formAddr.tag || (i === 0 ? "SHIPPING" : "BILLING"),
          address: {
            addressLine1: formAddr.address.addressLine1,
            city: formAddr.address.city,
            subdivision: formAddr.address.subdivision,
            postalCode: formAddr.address.postalCode,
            country: formAddr.address.country,
            countryFullname: formAddr.address.countryFullname,
            formatted: `${formAddr.address.addressLine1}\n${formAddr.address.city}, ${formAddr.address.subdivision} ${formAddr.address.postalCode}\n${formAddr.address.countryFullname}`,
          },
        })),
      }
    }

    // 2b. Update phones
    if (info?.phones?.items?.length) {
      const formPhone = info.phones.items[0]

      // ⚡ Wix expects plain digits or dashed format, not "+91..."
      const digits = formPhone.phone.replace(/\D/g, "")

      updatedInfo.phones = {
        items: [
          {
            countryCode: formPhone.countryCode || "IN",
            phone: digits, // ← leave as digits, Wix builds e164Phone itself
            primary: true,
            tag: formPhone.tag || "MOBILE",
          },
        ],
      }
    }

    // 2c. Update emails
    if (info?.emails?.items?.length) {
      const formEmail = info.emails.items[0]

      updatedInfo.emails = {
        items: [
          {
            email: formEmail.email,
            primary: true,
            tag: formEmail.tag || "UNTAGGED",
          },
        ],
      }
    }

    // 3. Call Wix API with doc-compliant signature
    const updated = await wixAdminClient.contacts.updateContact(
      contactId,
      updatedInfo,        // ✅ just info object
      contact.revision    // ✅ revision
    )

    console.log("📞 After update:", updated.contact.primaryInfo)

    // 4. Return trimmed response
    return NextResponse.json({
      contact: {
        _id: updated.contact._id,
        revision: updated.contact.revision,
        primaryInfo: updated.contact.primaryInfo,
        info: {
          emails: updated.contact.info?.emails,
          phones: updated.contact.info?.phones,
          addresses: updated.contact.info?.addresses,
        },
      },
    })
  } catch (err: any) {
    console.error("❌ Update Contact Error:", err?.response?.data || err)
    return NextResponse.json({ error: err.message || "Failed to update" }, { status: 500 })
  }
}
