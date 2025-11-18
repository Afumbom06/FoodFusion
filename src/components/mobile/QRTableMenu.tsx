import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { QrCode, Search, ShoppingCart, ChevronRight } from 'lucide-react';
import { MenuItem } from '../../types';

interface QRTableMenuProps {
  tableNumber: string;
  branchId: string;
  menuItems: MenuItem[];
  onAddToOrder?: (item: MenuItem) => void;
}

export function QRTableMenu({ tableNumber, branchId, menuItems, onAddToOrder }: QRTableMenuProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [cart, setCart] = useState<{ item: MenuItem; quantity: number }[]>([]);

  // Filter menu items by branch and availability
  const availableItems = useMemo(() => {
    return menuItems.filter(item => 
      item.branchId === branchId && item.available
    );
  }, [menuItems, branchId]);

  // Get categories
  const categories = useMemo(() => {
    const cats = new Set(availableItems.map(item => item.category));
    return ['all', ...Array.from(cats)];
  }, [availableItems]);

  // Filter items
  const filteredItems = useMemo(() => {
    let items = availableItems;

    if (selectedCategory !== 'all') {
      items = items.filter(item => item.category === selectedCategory);
    }

    if (searchQuery) {
      items = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return items;
  }, [availableItems, selectedCategory, searchQuery]);

  const addToCart = (item: MenuItem) => {
    const existingItem = cart.find(c => c.item.id === item.id);
    if (existingItem) {
      setCart(cart.map(c =>
        c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
      ));
    } else {
      setCart([...cart, { item, quantity: 1 }]);
    }
    if (onAddToOrder) {
      onAddToOrder(item);
    }
  };

  const cartTotal = cart.reduce((sum, c) => sum + (c.item.price * c.quantity), 0);
  const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 sticky top-0 z-10 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <QrCode className="w-6 h-6" />
            <span className="text-sm opacity-90">Table {tableNumber}</span>
          </div>
          <h1 className="text-2xl mb-4">Our Menu</h1>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60"
            />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="sticky top-[180px] z-10 bg-white border-b overflow-x-auto">
        <div className="max-w-4xl mx-auto px-4 py-3 flex gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat === 'all' ? 'All Items' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      <div className="max-w-4xl mx-auto p-4 pb-24">
        <div className="grid gap-4">
          {filteredItems.map(item => (
            <Card
              key={item.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedItem(item)}
            >
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {item.image && (
                    <div className="w-24 h-24 rounded-lg bg-gray-200 flex-shrink-0 overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                          {item.description}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="text-lg font-semibold text-blue-600">
                        {item.price.toLocaleString()} FCFA
                      </div>
                      {item.category && (
                        <Badge variant="outline" className="text-xs">
                          {item.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredItems.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No items found
            </div>
          )}
        </div>
      </div>

      {/* Cart Button */}
      {cartCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 max-w-4xl mx-auto z-20">
          <Button className="w-full h-14 text-lg shadow-lg" size="lg">
            <ShoppingCart className="w-5 h-5 mr-2" />
            View Cart ({cartCount}) • {cartTotal.toLocaleString()} FCFA
          </Button>
        </div>
      )}

      {/* Item Details Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedItem?.name}</DialogTitle>
            <DialogDescription>
              View item details and add to your order
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedItem?.image && (
              <div className="w-full h-48 rounded-lg bg-gray-200 overflow-hidden">
                <img
                  src={selectedItem.image}
                  alt={selectedItem.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <p className="text-gray-600">{selectedItem?.description}</p>
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-2xl font-semibold text-blue-600">
                {selectedItem?.price.toLocaleString()} FCFA
              </div>
              <Button onClick={() => {
                if (selectedItem) addToCart(selectedItem);
                setSelectedItem(null);
              }}>
                Add to Order
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
