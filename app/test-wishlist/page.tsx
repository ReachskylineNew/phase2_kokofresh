"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useUser } from "../../context/user-context"
import { useWishlist } from "../../context/wishlist-context"
import { toast } from "sonner"

export default function TestWishlistPage() {
  const { contact } = useUser()
  const { addToWishlist, wishlist, loading } = useWishlist()
  const [testing, setTesting] = useState(false)
  const [testResults, setTestResults] = useState<any>(null)

  const testWishlistAPI = async () => {
    setTesting(true)
    try {
      const response = await fetch("/api/wishlist-test")
      const data = await response.json()
      setTestResults(data)
      console.log("🧪 Test results:", data)
    } catch (error) {
      console.error("❌ Test failed:", error)
      setTestResults({ error: error.message })
    } finally {
      setTesting(false)
    }
  }

  const testAddToWishlist = async () => {
    if (!contact) {
      toast.error("Please sign in first")
      return
    }

    const mockCartItem = {
      id: "test-item-123",
      catalogReference: {
        appId: "215238eb-22a5-4c36-9e7b-e7c08025e04e",
        catalogItemId: "test-product-456"
      },
      productName: { original: "Test Product" },
      price: { amount: "299.00", formattedAmount: "₹299.00" },
      image: { url: "/placeholder.svg" },
      quantity: 1
    }

    console.log("🧪 Testing addToWishlist with:", mockCartItem)
    
    try {
      const success = await addToWishlist(mockCartItem)
      if (success) {
        toast.success("Test item added to wishlist!")
      } else {
        toast.error("Failed to add test item")
      }
    } catch (error) {
      console.error("❌ Test addToWishlist failed:", error)
      toast.error("Test failed - check console")
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Wishlist Debug Page</h1>
        
        <div className="space-y-6">
          {/* User Status */}
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">User Status</h2>
            <p><strong>Contact ID:</strong> {contact?._id || "Not logged in"}</p>
            <p><strong>Contact Email:</strong> {contact?.primaryInfo?.email || "Not available"}</p>
          </div>

          {/* Wishlist Status */}
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Wishlist Status</h2>
            <p><strong>Loading:</strong> {loading ? "Yes" : "No"}</p>
            <p><strong>Items Count:</strong> {wishlist?.length || 0}</p>
            {wishlist?.length > 0 && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">Current Items:</h3>
                <ul className="list-disc list-inside space-y-1">
                  {wishlist.map((item: any) => (
                    <li key={item._id} className="text-sm">
                      {item.productName} - {item.price?.formattedAmount}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* API Test */}
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">API Test</h2>
            <Button 
              onClick={testWishlistAPI} 
              disabled={testing}
              className="mb-4"
            >
              {testing ? "Testing..." : "Test Wishlist API"}
            </Button>
            
            {testResults && (
              <div className="mt-4 p-4 bg-muted rounded">
                <h3 className="font-medium mb-2">Test Results:</h3>
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(testResults, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Functionality Test */}
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Functionality Test</h2>
            <Button 
              onClick={testAddToWishlist}
              disabled={!contact}
              className="mb-4"
            >
              Test Add to Wishlist
            </Button>
            <p className="text-sm text-muted-foreground">
              This will add a test item to your wishlist to verify the functionality works.
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h2 className="text-xl font-semibold mb-4 text-blue-900">Instructions</h2>
            <ol className="list-decimal list-inside space-y-2 text-blue-800">
              <li>Make sure you're logged in (check User Status above)</li>
              <li>Click "Test Wishlist API" to check if the backend is working</li>
              <li>Click "Test Add to Wishlist" to test the functionality</li>
              <li>Check browser console (F12) for detailed error messages</li>
              <li>If tests fail, check the WISHLIST_SETUP.md file for solutions</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
