import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select';
import { ArrowLeft, Save, Upload, X, Plus, Loader2, AlertCircle } from 'lucide-react';
import { MenuItem } from '../../types';
import { toast } from 'sonner@2.0.3';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';

interface MenuItemFormProps {
  item: MenuItem | null;
  onClose: () => void;
  onBack: () => void;
}

export function MenuItemForm({ item, onClose, onBack }: MenuItemFormProps) {
  const { addMenuItem, updateMenuItem, inventory, branches, selectedBranch } = useApp();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imagePreview, setImagePreview] = useState(item?.image || '');
  const [loadingImage, setLoadingImage] = useState(false);

  const [formData, setFormData] = useState({
    name: item?.name || '',
    description: item?.description || '',
    category: item?.category || 'Main Course',
    price: item?.price || 0,
    available: item?.available ?? true,
    image: item?.image || '',
    ingredients: item?.ingredients || [],
    variations: item?.variations || [],
    branchId: item?.branchId || selectedBranch !== 'all' ? selectedBranch : undefined,
    syncAcrossBranches: false,
    portion: 'Medium',
    spiceLevel: 'Mild',
    preparationTime: 15,
    calories: 0,
  });

  const [newVariation, setNewVariation] = useState({ name: '', price: 0 });
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>(item?.ingredients || []);

  const categories = [
    'Appetizers',
    'Main Course',
    'Desserts',
    'Drinks',
    'Salads',
    'Soups',
    'Sides',
    'Specials',
    'Breakfast',
  ];

  const portions = ['Small', 'Medium', 'Large', 'Extra Large'];
  const spiceLevels = ['Mild', 'Medium', 'Hot', 'Extra Hot'];

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Item name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    setLoading(true);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const menuItemData: MenuItem = {
        id: item?.id || String(Date.now()),
        name: formData.name,
        description: formData.description,
        category: formData.category,
        price: formData.price,
        available: formData.available,
        image: formData.image || imagePreview,
        ingredients: selectedIngredients,
        variations: formData.variations,
        branchId: formData.syncAcrossBranches ? undefined : formData.branchId,
      };

      if (item) {
        updateMenuItem(menuItemData.id, menuItemData);
        toast.success('Menu item updated successfully');
      } else {
        addMenuItem(menuItemData);
        toast.success('Menu item added successfully');
      }

      onClose();
    } catch (error) {
      toast.error('Failed to save menu item');
    } finally {
      setLoading(false);
    }
  };

  const handleImageSearch = async () => {
    if (!formData.name) {
      toast.error('Please enter item name first');
      return;
    }

    setLoadingImage(true);
    try {
      // Using placeholder images for now
      // In production, integrate with Unsplash API
      const placeholderImages = [
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
        'https://images.unsplash.com/photo-1598103442097-8b74394b95c6',
        'https://images.unsplash.com/photo-1547592166-23ac45744acd',
        'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2',
      ];
      const imageUrl = placeholderImages[Math.floor(Math.random() * placeholderImages.length)];
      setImagePreview(imageUrl);
      setFormData({ ...formData, image: imageUrl });
      toast.success('Image loaded successfully');
    } catch (error) {
      toast.error('Failed to load image');
    } finally {
      setLoadingImage(false);
    }
  };

  const handleImageUrlChange = (url: string) => {
    setFormData({ ...formData, image: url });
    setImagePreview(url);
  };

  const handleIngredientToggle = (ingredientName: string) => {
    setSelectedIngredients(prev =>
      prev.includes(ingredientName)
        ? prev.filter(i => i !== ingredientName)
        : [...prev, ingredientName]
    );
  };

  const handleAddVariation = () => {
    if (newVariation.name && newVariation.price > 0) {
      setFormData({
        ...formData,
        variations: [...formData.variations, { ...newVariation, id: String(Date.now()) }],
      });
      setNewVariation({ name: '', price: 0 });
    }
  };

  const handleRemoveVariation = (index: number) => {
    setFormData({
      ...formData,
      variations: formData.variations.filter((_, i) => i !== index),
    });
  };

  // Check ingredient stock
  const getIngredientStatus = (ingredientName: string) => {
    const inventoryItem = inventory.find(inv =>
      inv.name.toLowerCase() === ingredientName.toLowerCase()
    );
    
    if (!inventoryItem) return 'unknown';
    if (inventoryItem.quantity < inventoryItem.minStock) return 'low';
    return 'available';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1>{item ? 'Edit Menu Item' : 'Add New Menu Item'}</h1>
          <p className="text-gray-500 mt-1">
            {item ? 'Update menu item information' : 'Create a new dish for your menu'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="pricing">Pricing & Variations</TabsTrigger>
            <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          {/* Basic Information Tab */}
          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="name">
                      Item Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      placeholder="e.g., Grilled Chicken with Rice"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={errors.name ? 'border-red-500' : ''}
                      disabled={loading}
                    />
                    {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="description">
                      Description <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the dish, ingredients, and preparation..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className={errors.description ? 'border-red-500' : ''}
                      disabled={loading}
                      rows={4}
                    />
                    {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">
                      Category <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                      disabled={loading}
                    >
                      <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="preparationTime">Preparation Time (minutes)</Label>
                    <Input
                      id="preparationTime"
                      type="number"
                      min="1"
                      value={formData.preparationTime}
                      onChange={(e) => setFormData({ ...formData, preparationTime: parseInt(e.target.value) })}
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="portion">Default Portion Size</Label>
                    <Select
                      value={formData.portion}
                      onValueChange={(value) => setFormData({ ...formData, portion: value })}
                      disabled={loading}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {portions.map(size => (
                          <SelectItem key={size} value={size}>{size}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="spiceLevel">Spice Level</Label>
                    <Select
                      value={formData.spiceLevel}
                      onValueChange={(value) => setFormData({ ...formData, spiceLevel: value })}
                      disabled={loading}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {spiceLevels.map(level => (
                          <SelectItem key={level} value={level}>{level}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Switch
                      id="available"
                      checked={formData.available}
                      onCheckedChange={(checked) => setFormData({ ...formData, available: checked })}
                      disabled={loading}
                    />
                    <div>
                      <Label htmlFor="available" className="cursor-pointer">
                        Available for Orders
                      </Label>
                      <p className="text-xs text-gray-600">
                        Item will be visible in POS and online menu
                      </p>
                    </div>
                  </div>
                  {formData.available ? (
                    <Badge className="bg-green-600">Available</Badge>
                  ) : (
                    <Badge variant="secondary">Out of Stock</Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Image Upload */}
            <Card>
              <CardHeader>
                <CardTitle>Item Image</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setImagePreview('');
                        setFormData({ ...formData, image: '' });
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-sm text-gray-600 mb-4">No image uploaded</p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleImageSearch}
                      disabled={loadingImage || !formData.name}
                    >
                      {loadingImage ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Search Image
                        </>
                      )}
                    </Button>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Or paste image URL</Label>
                  <Input
                    id="imageUrl"
                    placeholder="https://example.com/image.jpg"
                    value={formData.image}
                    onChange={(e) => handleImageUrlChange(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pricing & Variations Tab */}
          <TabsContent value="pricing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Base Price</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="price">
                    Price (FCFA) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    placeholder="5000"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                    className={errors.price ? 'border-red-500' : ''}
                    disabled={loading}
                  />
                  {errors.price && <p className="text-sm text-red-500">{errors.price}</p>}
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Display Price:</span>
                    <span className="text-xl text-blue-600">
                      {formData.price.toLocaleString()} FCFA
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Price Variations</CardTitle>
                <p className="text-sm text-gray-500">Add different sizes or options with custom pricing</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.variations.length > 0 && (
                  <div className="space-y-2">
                    {formData.variations.map((variation, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium">{variation.name}</div>
                          <div className="text-sm text-blue-600">{variation.price.toLocaleString()} FCFA</div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveVariation(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1">
                    <Input
                      placeholder="Variation name"
                      value={newVariation.name}
                      onChange={(e) => setNewVariation({ ...newVariation, name: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-1">
                    <Input
                      type="number"
                      placeholder="Price"
                      value={newVariation.price || ''}
                      onChange={(e) => setNewVariation({ ...newVariation, price: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="md:col-span-1">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddVariation}
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ingredients Tab */}
          <TabsContent value="ingredients" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ingredients</CardTitle>
                <p className="text-sm text-gray-500">
                  Select ingredients from your inventory
                </p>
              </CardHeader>
              <CardContent>
                {inventory.length === 0 ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      No ingredients found in inventory. Add items to inventory first.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                    {inventory.slice(0, 20).map(ingredient => {
                      const status = getIngredientStatus(ingredient.name);
                      return (
                        <div
                          key={ingredient.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <Checkbox
                              checked={selectedIngredients.includes(ingredient.name)}
                              onCheckedChange={() => handleIngredientToggle(ingredient.name)}
                            />
                            <div className="flex-1">
                              <div className="text-sm">{ingredient.name}</div>
                              <div className="text-xs text-gray-500">
                                {ingredient.quantity} {ingredient.unit} available
                              </div>
                            </div>
                          </div>
                          {status === 'low' && (
                            <Badge variant="destructive" className="text-xs">
                              Low Stock
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {selectedIngredients.length > 0 && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-sm font-medium mb-2">
                      Selected Ingredients ({selectedIngredients.length}):
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedIngredients.map(ingredient => (
                        <Badge key={ingredient} variant="outline">
                          {ingredient}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Branch Synchronization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Switch
                      id="syncBranches"
                      checked={formData.syncAcrossBranches}
                      onCheckedChange={(checked) => setFormData({ ...formData, syncAcrossBranches: checked })}
                      disabled={loading}
                    />
                    <div>
                      <Label htmlFor="syncBranches" className="cursor-pointer">
                        Sync Across All Branches
                      </Label>
                      <p className="text-xs text-gray-600">
                        Item will be available at all restaurant branches
                      </p>
                    </div>
                  </div>
                </div>

                {!formData.syncAcrossBranches && (
                  <div className="space-y-2">
                    <Label>Specific Branch</Label>
                    <Select
                      value={formData.branchId || 'none'}
                      onValueChange={(value) => setFormData({ ...formData, branchId: value === 'none' ? undefined : value })}
                      disabled={loading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select branch" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">All branches</SelectItem>
                        {branches.map(branch => (
                          <SelectItem key={branch.id} value={branch.id}>
                            {branch.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="calories">Estimated Calories (optional)</Label>
                  <Input
                    id="calories"
                    type="number"
                    min="0"
                    placeholder="500"
                    value={formData.calories || ''}
                    onChange={(e) => setFormData({ ...formData, calories: parseInt(e.target.value) || 0 })}
                    disabled={loading}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {item ? 'Update Item' : 'Create Item'}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
