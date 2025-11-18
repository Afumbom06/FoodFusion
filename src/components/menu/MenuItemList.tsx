import React, { useState, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Image as ImageIcon,
  LayoutGrid,
  List,
  Filter,
  TrendingUp,
  AlertCircle,
  Copy,
  Eye,
  BarChart3,
  FolderTree
} from 'lucide-react';
import { MenuItem } from '../../types';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { motion } from 'motion/react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { toast } from 'sonner@2.0.3';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Switch } from '../ui/switch';

interface MenuItemListProps {
  onViewDetails: (item: MenuItem) => void;
  onEdit: (item: MenuItem) => void;
  onAddNew: () => void;
  onViewCategories: () => void;
  onViewAnalytics: () => void;
}

export function MenuItemList({ 
  onViewDetails, 
  onEdit, 
  onAddNew, 
  onViewCategories,
  onViewAnalytics 
}: MenuItemListProps) {
  const { menuItems, selectedBranch, deleteMenuItem, updateMenuItem, inventory } = useApp();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewType, setViewType] = useState<'grid' | 'table'>('grid');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'out'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'popular'>('name');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = Array.from(new Set(menuItems.map(item => item.category)));
    return cats.sort();
  }, [menuItems]);

  // Calculate category stats
  const categoryStats = useMemo(() => {
    return categories.map(cat => ({
      name: cat,
      count: menuItems.filter(item => item.category === cat).length,
      available: menuItems.filter(item => item.category === cat && item.available).length,
    }));
  }, [categories, menuItems]);

  // Filter and sort menu items
  const filteredItems = useMemo(() => {
    let items = menuItems;

    // Filter by branch
    if (selectedBranch !== 'all') {
      items = items.filter(item => !item.branchId || item.branchId === selectedBranch);
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      items = items.filter(item => item.category === selectedCategory);
    }

    // Filter by availability
    if (availabilityFilter === 'available') {
      items = items.filter(item => item.available);
    } else if (availabilityFilter === 'out') {
      items = items.filter(item => !item.available);
    }

    // Filter by search query
    if (searchQuery) {
      items = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort items
    items = [...items].sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'price') {
        return b.price - a.price;
      } else {
        // popular - mock popularity score
        return 0;
      }
    });

    return items;
  }, [menuItems, selectedBranch, selectedCategory, availabilityFilter, searchQuery, sortBy]);

  // Check ingredient availability
  const checkIngredientAvailability = (item: MenuItem) => {
    if (!item.ingredients || item.ingredients.length === 0) return { available: true, lowStock: [] };
    
    const lowStock = item.ingredients.filter(ingredientName => {
      const inventoryItem = inventory.find(inv => 
        inv.name.toLowerCase() === ingredientName.toLowerCase()
      );
      return inventoryItem && inventoryItem.quantity < inventoryItem.minStock;
    });

    return { 
      available: lowStock.length === 0, 
      lowStock 
    };
  };

  const handleDelete = (item: MenuItem) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      deleteMenuItem(itemToDelete.id);
      toast.success(`${itemToDelete.name} has been deleted`);
      setItemToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleDuplicate = (item: MenuItem) => {
    // In real app, would call API
    toast.success(`${item.name} duplicated (feature in development)`);
  };

  const handleToggleAvailability = (item: MenuItem) => {
    updateMenuItem(item.id, { available: !item.available });
    toast.success(`${item.name} marked as ${!item.available ? 'available' : 'out of stock'}`);
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const cardItem = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1>Menu Management</h1>
          <p className="text-gray-500 mt-1">
            Manage your restaurant menu items and pricing
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={onViewAnalytics}
            className="flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            Analytics
          </Button>
          <Button 
            variant="outline" 
            onClick={onViewCategories}
            className="flex items-center gap-2"
          >
            <FolderTree className="w-4 h-4" />
            Categories
          </Button>
          {(user?.role === 'admin' || user?.role === 'manager') && (
            <Button 
              onClick={onAddNew}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Items</p>
                <div className="text-2xl mt-1">{filteredItems.length}</div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <LayoutGrid className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Available</p>
                <div className="text-2xl mt-1 text-green-600">
                  {filteredItems.filter(i => i.available).length}
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Out of Stock</p>
                <div className="text-2xl mt-1 text-red-600">
                  {filteredItems.filter(i => !i.available).length}
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Categories</p>
                <div className="text-2xl mt-1">{categories.length}</div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <FolderTree className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-4 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="md:col-span-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Select value={availabilityFilter} onValueChange={(v: any) => setAvailabilityFilter(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Items</SelectItem>
                  <SelectItem value="available">Available Only</SelectItem>
                  <SelectItem value="out">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Sort by Name</SelectItem>
                  <SelectItem value="price">Sort by Price</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2 flex gap-2">
              <Button
                variant={viewType === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewType('grid')}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewType === 'table' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewType('table')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Menu Items Display */}
      {filteredItems.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No menu items found matching your criteria</p>
          </CardContent>
        </Card>
      ) : viewType === 'grid' ? (
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          {filteredItems.map(item => {
            const ingredientCheck = checkIngredientAvailability(item);
            return (
              <motion.div key={item.id} variants={cardItem}>
                <Card className="hover:shadow-lg transition-all duration-300 overflow-hidden h-full flex flex-col">
                  <div className="relative h-40 bg-gray-200">
                    {item.image ? (
                      <ImageWithFallback
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                        <ImageIcon className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <Badge variant={item.available ? 'default' : 'secondary'} className={item.available ? 'bg-green-600' : ''}>
                        {item.available ? 'Available' : 'Out of Stock'}
                      </Badge>
                    </div>
                    {!ingredientCheck.available && (
                      <div className="absolute top-2 left-2">
                        <Badge variant="destructive" className="text-xs">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Low Stock
                        </Badge>
                      </div>
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle className="line-clamp-1">{item.name}</CardTitle>
                    <Badge variant="outline" className="w-fit">{item.category}</Badge>
                  </CardHeader>
                  <CardContent className="space-y-4 flex-1 flex flex-col">
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {item.description}
                    </p>
                    <div className="text-xl text-blue-600">
                      {item.price.toLocaleString()} FCFA
                    </div>
                    {item.variations && item.variations.length > 0 && (
                      <div className="text-xs text-gray-500">
                        {item.variations.length} variations available
                      </div>
                    )}
                    {item.ingredients && item.ingredients.length > 0 && (
                      <div className="text-xs text-gray-500">
                        <span className="font-medium">Ingredients: </span>
                        {item.ingredients.slice(0, 3).join(', ')}
                        {item.ingredients.length > 3 && '...'}
                      </div>
                    )}
                    <div className="flex gap-2 pt-2 mt-auto">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => onViewDetails(item)}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                      {(user?.role === 'admin' || user?.role === 'manager') && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => onEdit(item)}
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDelete(item)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ingredients</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map(item => {
                    const ingredientCheck = checkIngredientAvailability(item);
                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                              {item.image ? (
                                <ImageWithFallback
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <ImageIcon className="w-5 h-5 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-medium">{item.name}</div>
                              <div className="text-sm text-gray-500 line-clamp-1">
                                {item.description}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.category}</Badge>
                        </TableCell>
                        <TableCell className="text-blue-600">
                          {item.price.toLocaleString()} FCFA
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={item.available}
                              onCheckedChange={() => handleToggleAvailability(item)}
                              disabled={user?.role !== 'admin' && user?.role !== 'manager'}
                            />
                            <span className="text-sm">
                              {item.available ? 'Available' : 'Out'}
                            </span>
                            {!ingredientCheck.available && (
                              <Badge variant="destructive" className="text-xs">
                                Low Stock
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {item.ingredients?.length || 0} items
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => onViewDetails(item)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {(user?.role === 'admin' || user?.role === 'manager') && (
                              <>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => onEdit(item)}
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => handleDuplicate(item)}
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => handleDelete(item)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Menu Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{itemToDelete?.name}</strong>? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
