import React, { useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  ArrowLeft, 
  Edit, 
  Clock,
  Flame,
  AlertCircle,
  TrendingUp,
  ShoppingCart,
  DollarSign,
  Package
} from 'lucide-react';
import { MenuItem } from '../../types';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface MenuItemDetailsProps {
  item: MenuItem;
  onBack: () => void;
  onEdit: () => void;
}

export function MenuItemDetails({ item, onBack, onEdit }: MenuItemDetailsProps) {
  const { orders, inventory } = useApp();

  // Calculate sales data for this item
  const itemSalesData = useMemo(() => {
    const itemOrders = orders.filter(order =>
      order.items.some(orderItem => orderItem.name === item.name)
    );

    const totalSold = itemOrders.reduce((sum, order) => {
      const itemInOrder = order.items.find(i => i.name === item.name);
      return sum + (itemInOrder?.quantity || 0);
    }, 0);

    const totalRevenue = itemOrders.reduce((sum, order) => {
      const itemInOrder = order.items.find(i => i.name === item.name);
      return sum + (itemInOrder ? itemInOrder.quantity * itemInOrder.price : 0);
    }, 0);

    const avgOrderValue = totalSold > 0 ? totalRevenue / totalSold : 0;

    // Mock daily sales for last 7 days
    const dailySales = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        sales: Math.floor(Math.random() * 20) + 5,
        revenue: Math.floor(Math.random() * 50000) + 10000,
      };
    });

    return {
      totalSold,
      totalRevenue,
      avgOrderValue,
      dailySales,
      totalOrders: itemOrders.length,
    };
  }, [item, orders]);

  // Check ingredient availability
  const ingredientStatus = useMemo(() => {
    if (!item.ingredients || item.ingredients.length === 0) {
      return { allAvailable: true, lowStock: [], outOfStock: [] };
    }

    const lowStock: string[] = [];
    const outOfStock: string[] = [];

    item.ingredients.forEach(ingredientName => {
      const inventoryItem = inventory.find(inv =>
        inv.name.toLowerCase() === ingredientName.toLowerCase()
      );

      if (!inventoryItem || inventoryItem.quantity === 0) {
        outOfStock.push(ingredientName);
      } else if (inventoryItem.quantity < inventoryItem.minStock) {
        lowStock.push(ingredientName);
      }
    });

    return {
      allAvailable: lowStock.length === 0 && outOfStock.length === 0,
      lowStock,
      outOfStock,
    };
  }, [item.ingredients, inventory]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="mb-0">{item.name}</h1>
              <Badge variant={item.available ? 'default' : 'secondary'} className={item.available ? 'bg-green-600' : ''}>
                {item.available ? 'Available' : 'Out of Stock'}
              </Badge>
            </div>
            <p className="text-gray-500 mt-1">Detailed menu item information and analytics</p>
          </div>
        </div>
        <Button onClick={onEdit} className="bg-blue-600 hover:bg-blue-700">
          <Edit className="w-4 h-4 mr-2" />
          Edit Item
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Item Info */}
        <div className="space-y-6">
          {/* Item Image & Basic Info */}
          <Card>
            <CardContent className="p-0">
              <div className="aspect-square bg-gray-200 rounded-t-lg overflow-hidden">
                {item.image ? (
                  <ImageWithFallback
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                    <Package className="w-24 h-24 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <div className="text-sm text-gray-600">Category</div>
                  <Badge variant="outline" className="mt-1">{item.category}</Badge>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Price</div>
                  <div className="text-3xl text-blue-600 mt-1">
                    {item.price.toLocaleString()} FCFA
                  </div>
                </div>
                {item.description && (
                  <div>
                    <div className="text-sm text-gray-600">Description</div>
                    <p className="text-sm mt-1">{item.description}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Variations */}
          {item.variations && item.variations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Price Variations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {item.variations.map((variation, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm">{variation.name}</span>
                    <span className="text-sm font-medium text-blue-600">
                      {variation.price.toLocaleString()} FCFA
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Ingredients */}
          <Card>
            <CardHeader>
              <CardTitle>Ingredients</CardTitle>
            </CardHeader>
            <CardContent>
              {!item.ingredients || item.ingredients.length === 0 ? (
                <p className="text-sm text-gray-500">No ingredients specified</p>
              ) : (
                <div className="space-y-2">
                  {item.ingredients.map((ingredient, index) => {
                    const inventoryItem = inventory.find(inv =>
                      inv.name.toLowerCase() === ingredient.toLowerCase()
                    );
                    const isLowStock = inventoryItem && inventoryItem.quantity < inventoryItem.minStock;
                    const isOutOfStock = !inventoryItem || inventoryItem.quantity === 0;

                    return (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm">{ingredient}</span>
                        <div className="flex items-center gap-2">
                          {inventoryItem && (
                            <span className="text-xs text-gray-500">
                              {inventoryItem.quantity} {inventoryItem.unit}
                            </span>
                          )}
                          {isOutOfStock ? (
                            <Badge variant="destructive" className="text-xs">Out</Badge>
                          ) : isLowStock ? (
                            <Badge variant="secondary" className="text-xs">Low</Badge>
                          ) : inventoryItem ? (
                            <Badge variant="outline" className="text-xs text-green-600 border-green-600">OK</Badge>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {(ingredientStatus.lowStock.length > 0 || ingredientStatus.outOfStock.length > 0) && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <div className="font-medium text-red-900 mb-1">Stock Alerts</div>
                      {ingredientStatus.outOfStock.length > 0 && (
                        <div className="text-red-700">
                          Out of stock: {ingredientStatus.outOfStock.join(', ')}
                        </div>
                      )}
                      {ingredientStatus.lowStock.length > 0 && (
                        <div className="text-red-700">
                          Low stock: {ingredientStatus.lowStock.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Analytics */}
        <div className="lg:col-span-2 space-y-6">
          {/* Performance KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Sold</p>
                    <div className="text-2xl mt-1">{itemSalesData.totalSold}</div>
                    <p className="text-xs text-gray-500 mt-1">All time</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                    <ShoppingCart className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Revenue</p>
                    <div className="text-2xl mt-1">
                      {(itemSalesData.totalRevenue / 1000).toFixed(0)}K
                    </div>
                    <p className="text-xs text-gray-500 mt-1">FCFA</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Avg. Order Value</p>
                    <div className="text-2xl mt-1">
                      {itemSalesData.avgOrderValue.toLocaleString()}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">FCFA per order</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sales Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Sales Trend (Last 7 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={itemSalesData.dailySales}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="sales"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Units Sold"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Revenue (FCFA)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Daily Sales Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Sales Volume</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={itemSalesData.dailySales}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="sales" fill="#1e3a8a" name="Units Sold" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <Clock className="w-5 h-5 text-gray-600" />
                  <div>
                    <div className="text-sm text-gray-600">Prep Time</div>
                    <div className="font-medium">15 mins</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <Flame className="w-5 h-5 text-gray-600" />
                  <div>
                    <div className="text-sm text-gray-600">Spice Level</div>
                    <div className="font-medium">Medium</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <Package className="w-5 h-5 text-gray-600" />
                  <div>
                    <div className="text-sm text-gray-600">Portion Size</div>
                    <div className="font-medium">Medium</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <ShoppingCart className="w-5 h-5 text-gray-600" />
                  <div>
                    <div className="text-sm text-gray-600">Total Orders</div>
                    <div className="font-medium">{itemSalesData.totalOrders}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {itemSalesData.totalSold > 100 && (
                <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-green-900">Top Seller</div>
                    <div className="text-sm text-green-700">
                      This item is performing exceptionally well with {itemSalesData.totalSold} units sold
                    </div>
                  </div>
                </div>
              )}

              {!ingredientStatus.allAvailable && (
                <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-yellow-900">Ingredient Alert</div>
                    <div className="text-sm text-yellow-700">
                      Some ingredients are low or out of stock. Consider restocking or marking item as unavailable.
                    </div>
                  </div>
                </div>
              )}

              {itemSalesData.avgOrderValue > item.price * 1.2 && (
                <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <DollarSign className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-blue-900">High Value Item</div>
                    <div className="text-sm text-blue-700">
                      Customers frequently order multiple servings of this item
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
