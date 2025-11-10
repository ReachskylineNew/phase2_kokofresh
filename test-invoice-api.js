// Test script for invoice generation API
// Run with: node test-invoice-api.js

const testInvoiceGeneration = async () => {
  try {
    console.log("🧪 Testing invoice generation API...")
    
    // You'll need to replace this with an actual order ID from your system
    const testOrderId = "test-order-id"
    
    const response = await fetch("http://localhost:3000/api/invoice-generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderId: testOrderId,
      }),
    })
    
    if (response.ok) {
      const blob = await response.blob()
      console.log("✅ Invoice generated successfully!")
      console.log(`📄 PDF size: ${blob.size} bytes`)
      console.log(`📄 Content type: ${blob.type}`)
    } else {
      const error = await response.json()
      console.error("❌ Error:", error)
    }
  } catch (error) {
    console.error("❌ Test failed:", error.message)
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  testInvoiceGeneration()
}

module.exports = { testInvoiceGeneration }
