import { useEffect, useState } from "react";
import { trpc } from "@/utils/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit2, Trash2, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { DialogClose } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";

export default function MenuManagement() {
  const { user } = useAuth();
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null);
  const [newItemForm, setNewItemForm] = useState({ name: "", description: "", price: "", categoryId: "" });
  const [editingItem, setEditingItem] = useState<any | null>(null);

  const handleEditItemChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditingItem((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [restaurantId, setRestaurantId] = useState<number | null>(null);

  useEffect(() => {
    if (user?.restaurantIds && user.restaurantIds.length > 0) {
      setRestaurantId(user.restaurantIds[0]);
    }
  }, [user]);

  const { data: menuData, isLoading, refetch } = trpc.menu.getByRestaurant.useQuery(
    { restaurantId: restaurantId! },
    { enabled: !!restaurantId }
  );

  const categories = menuData?.categories || [];
  const menuItems = menuData?.items || [];

  const itemsByCategory = categories.map((cat) => ({
    ...cat,
    items: menuItems.filter((item) => item.categoryId === cat.id),
  }));

  const createItemMutation = trpc.menu.createItem.useMutation();
  const updateItemMutation = trpc.menu.updateItem.useMutation();
  const deleteItemMutation = trpc.menu.deleteItem.useMutation();

  const createCategoryMutation = trpc.menu.createCategory.useMutation();
  const updateCategoryMutation = trpc.menu.updateCategory.useMutation();
  const deleteCategoryMutation = trpc.menu.deleteCategory.useMutation();

  const handleAddItem = async () => {
    if (!restaurantId) {
      toast.error("Restaurant not loaded.");
      return;
    }
    if (!newItemForm.name || !newItemForm.price || !newItemForm.categoryId) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      await createItemMutation.mutateAsync({
        restaurantId: restaurantId,
        categoryId: parseInt(newItemForm.categoryId),
        name: newItemForm.name,
        description: newItemForm.description,
        price: parseFloat(newItemForm.price) * 100, // Convert to cents
      });
      toast.success("Item added successfully");
      setNewItemForm({ name: "", description: "", price: "", categoryId: "" });
      refetch();
    } catch (error) {
      toast.error("Failed to add item");
      console.error("Failed to add item:", error);
    }
  };

  const handleUpdateItem = async () => {
    if (!editingItem || !restaurantId) {
      toast.error("No item selected for editing or restaurant not loaded.");
      return;
    }
    if (!editingItem.name || !editingItem.price || !editingItem.categoryId) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      await updateItemMutation.mutateAsync({
        itemId: editingItem.id,
        name: editingItem.name,
        description: editingItem.description,
        price: parseFloat(editingItem.price) * 100, // Convert to cents
        categoryId: parseInt(editingItem.categoryId),
      });
      toast.success("Item updated successfully");
      setEditingItem(null);
      refetch();
    } catch (error) {
      toast.error("Failed to update item");
      console.error("Failed to update item:", error);
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      await deleteItemMutation.mutateAsync({ itemId });
      toast.success("Item deleted successfully");
      refetch();
    } catch (error) {
      toast.error("Failed to delete item");
      console.error("Failed to delete item:", error);
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
                <DialogClose asChild>
                  <Button onClick={handleAddItem} className="w-full bg-orange-600 hover:bg-orange-700">
                    Add Item
                  </Button>
                </DialogClose>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Edit Item Dialog */}
        {editingItem && (
          <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Menu Item</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Item Name *</label>
                  <Input
                    name="name"
                    placeholder="e.g., Chicken Burger"
                    value={editingItem.name}
                    onChange={handleEditItemChange}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Input
                    name="description"
                    placeholder="Item description"
                    value={editingItem.description}
                    onChange={handleEditItemChange}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Category *</label>
                  <select
                    name="categoryId"
                    className="w-full border rounded px-3 py-2"
                    value={editingItem.categoryId}
                    onChange={handleEditItemChange}
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
                    name="price"
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    value={editingItem.price}
                    onChange={handleEditItemChange}
                  />
                </div>
                <DialogClose asChild>
                  <Button onClick={handleUpdateItem} className="w-full bg-orange-600 hover:bg-orange-700">
                    Save Changes
                  </Button>
                </DialogClose>
              </div>
            </DialogContent>
          </Dialog>
        )}

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
                                onClick={() => setEditingItem({ ...item, price: (item.price / 100).toFixed(2) })}
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
