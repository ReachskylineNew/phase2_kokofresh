import { NextRequest, NextResponse } from "next/server";

/**
 * Validate shipping address
 * Uses a simple validation - can be enhanced with Google Maps API or similar
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { address } = body;

    if (!address) {
      return NextResponse.json(
        { error: "Address is required" },
        { status: 400 }
      );
    }

    const { line1, city, region, postalCode, country } = address;

    // Basic validation
    const errors: string[] = [];

    if (!line1 || line1.trim().length < 5) {
      errors.push("Address line 1 must be at least 5 characters");
    }

    if (!city || city.trim().length < 2) {
      errors.push("City is required");
    }

    if (!region || region.trim().length < 2) {
      errors.push("State/Region is required");
    }

    if (!postalCode || !/^\d{5,10}$/.test(postalCode.replace(/\s/g, ""))) {
      errors.push("Postal code must be 5-10 digits");
    }

    if (!country || country.trim().length < 2) {
      errors.push("Country is required");
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { valid: false, errors },
        { status: 400 }
      );
    }

    // Format address for display
    const formattedAddress = {
      line1: line1.trim(),
      line2: address.line2?.trim() || "",
      city: city.trim(),
      region: region.trim(),
      postalCode: postalCode.replace(/\s/g, ""),
      country: country.trim(),
    };

    return NextResponse.json({
      valid: true,
      formattedAddress,
      message: "Address is valid",
    });
  } catch (error: any) {
    console.error("❌ Address validation error:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to validate address",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

