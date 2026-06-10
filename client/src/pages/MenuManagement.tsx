import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit2, Trash2, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

export default function MenuManagement() {
  const { user } = useAuth();
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null);
  const [newItemForm, setNewItemForm] = useState({ name: "", description: "", price: "", categoryId: "" });

  // Mock data for demonstration
  const categories = [
    { id: 1, name: "Burgers", description: "Delicious burgers", displayOrder: 1 },
    { id: 2, name: "Pizzas", description: "Fresh pizzas", displayOrder: 2 },
    { id: 3, name: "Drinks", description: "Beverages", displayOrder: 3 },
  ];

  const menuItems = [
    { id: 1, categoryId: 1, name: "Chicken Burger", description: "Grilled chicken with sauce", price: 1500 },
    { id: 2, categoryId: 1, name: "Beef Burger", description: "Juicy beef patty", price: 1800 },
    { id: 3, categoryId: 2, name: "Margherita Pizza", description: "Classic cheese pizza", price: 2500 },
    { id: 4, categoryId: 3, name: "Coca Cola", description: "Cold soft drink", price: 500 },
  ];

  // Group items by category
  const itemsByCategory = categories.map((cat) => ({
    ...cat,
    items: menuItems.filter((item) => item.categoryId === cat.id),
  }));

  const handleAddItem = async () => {
    if (!newItemForm.name || !newItemForm.price || !newItemForm.categoryId) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      // In production, this would call the actual API
      toast.success("Item added successfully");
      setNewItemForm({ name: "", description: "", price: "", categoryId: "" });
    } catch (error) {
      toast.error("Failed to add item");
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      toast.success("Item deleted successfully");
    } catch (error) {
      toast.error("Failed to delete item");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Menu Management</h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-orange-600 hover:bg-orange-700 flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Menu Item</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Item Name *</label>
                  <Input
                    placeholder="e.g., Chicken Burger"
                    value={newItemForm.name}
                    onChange={(e) => setNewItemForm({ ...newItemForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Input
                    placeholder="Item description"
                    value={newItemForm.description}
                    onChange={(e) => setNewItemForm({ ...newItemForm, description: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Category *</label>
                  <select
                    className="w-full border rounded px-3 py-2"
                    value={newItemForm.categoryId}
                    onChange={(e) => setNewItemForm({ ...newItemForm, categoryId: e.target.value })}
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Price (ZWL) *</label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    value={newItemForm.price}
                    onChange={(e) => setNewItemForm({ ...newItemForm, price: e.target.value })}
                  />
                </div>
                <Button onClick={handleAddItem} className="w-full bg-orange-600 hover:bg-orange-700">
                  Add Item
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Categories and Items */}
        <div className="space-y-4">
          {itemsByCategory.map((category) => (
            <Card key={category.id}>
              <CardHeader
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ChevronDown
                      className={`h-5 w-5 transition-transform ${
                        expandedCategory === category.id ? "rotate-180" : ""
                      }`}
                    />
                    <CardTitle>{category.name}</CardTitle>
                    <Badge>{category.items.length} items</Badge>
                  </div>
                </div>
              </CardHeader>

              {expandedCategory === category.id && (
                <CardContent>
                  {category.items.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No items in this category</p>
                  ) : (
                    <div className="space-y-3">
                      {category.items.map((item: any) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded border"
                        >
                          <div className="flex-1">
                            <h4 className="font-semibold">{item.name}</h4>
                            {item.description && (
                              <p className="text-sm text-gray-600">{item.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-bold text-orange-600">
                              ZWL {(item.price / 100).toFixed(2)}
                            </span>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteItem(item.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {itemsByCategory.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No categories found</p>
            <p className="text-gray-500">Create categories first to add menu items</p>
          </div>
        )}
      </div>
    </div>
  );
}
