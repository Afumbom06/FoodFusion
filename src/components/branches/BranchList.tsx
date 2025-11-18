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
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Plus, 
  Search, 
  LayoutGrid, 
  List, 
  TrendingUp,
  Edit,
  Trash2,
  Users,
  DollarSign,
  ShoppingCart,
  BarChart3,
  MapPinned
} from 'lucide-react';
import { motion } from 'motion/react';
import { Branch } from '../../types';
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

interface BranchListProps {
  onViewDetails: (branch: Branch) => void;
  onEdit: (branch: Branch) => void;
  onAddNew: () => void;
  onViewComparison: () => void;
}

export function BranchList({ onViewDetails, onEdit, onAddNew, onViewComparison }: BranchListProps) {
  const { branches, orders, staff, deleteBranch } = useApp();
  const { user } = useAuth();
  const [viewType, setViewType] = useState<'grid' | 'table'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [cityFilter, setCityFilter] = useState<'all' | string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState<Branch | null>(null);

  // Calculate performance for each branch
  const branchPerformance = useMemo(() => {
    return branches.map(branch => {
      const branchOrders = orders.filter(o => o.branchId === branch.id);
      const branchRevenue = branchOrders
        .filter(o => o.status === 'completed' || o.status === 'served')
        .reduce((sum, o) => sum + o.total, 0);
      const branchStaff = staff.filter(s => s.branchId === branch.id && s.isActive);

      return {
        ...branch,
        totalOrders: branchOrders.length,
        revenue: branchRevenue,
        staffCount: branchStaff.length,
        status: 'active' as const, // In real app, get from branch data
      };
    });
  }, [branches, orders, staff]);

  // Extract unique cities for filter
  const cities = useMemo(() => {
    const citySet = new Set(branches.map(b => b.location.split(',')[0].trim()));
    return Array.from(citySet);
  }, [branches]);

  // Filter branches
  const filteredBranches = useMemo(() => {
    return branchPerformance.filter(branch => {
      const matchesSearch = 
        branch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        branch.location.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || branch.status === statusFilter;
      
      const matchesCity = cityFilter === 'all' || branch.location.includes(cityFilter);
      
      return matchesSearch && matchesStatus && matchesCity;
    });
  }, [branchPerformance, searchQuery, statusFilter, cityFilter]);

  const handleDelete = (branch: Branch) => {
    if (branch.isMain) {
      toast.error('Cannot delete main branch');
      return;
    }
    setBranchToDelete(branch);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (branchToDelete) {
      deleteBranch(branchToDelete.id);
      toast.success(`${branchToDelete.name} has been deleted`);
      setBranchToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1>Branch Management</h1>
          <p className="text-gray-500 mt-1">
            Manage all restaurant branches and monitor performance
          </p>
        </div>
        <div className="flex gap-2">
          {user?.role === 'admin' && (
            <>
              <Button 
                variant="outline" 
                onClick={onViewComparison}
                className="flex items-center gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                Compare
              </Button>
              <Button 
                onClick={onAddNew}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Branch
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Filters & Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search branches by name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by city" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {cities.map(city => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2">
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

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Branches</p>
                <div className="text-2xl mt-1">{branches.length}</div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <MapPinned className="w-6 h-6 text-blue-600" />
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
                  {branchPerformance.reduce((sum, b) => sum + b.revenue, 0).toLocaleString()}
                </div>
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
                <p className="text-sm text-gray-600">Total Orders</p>
                <div className="text-2xl mt-1">
                  {branchPerformance.reduce((sum, b) => sum + b.totalOrders, 0)}
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Staff</p>
                <div className="text-2xl mt-1">
                  {branchPerformance.reduce((sum, b) => sum + b.staffCount, 0)}
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Branch Display */}
      {filteredBranches.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-gray-500">
              <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No branches found matching your criteria</p>
            </div>
          </CardContent>
        </Card>
      ) : viewType === 'grid' ? (
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredBranches.map(branch => (
            <motion.div key={branch.id} variants={item}>
              <Card className="hover:shadow-lg transition-all duration-300 h-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {branch.name}
                        {branch.isMain && (
                          <Badge className="bg-blue-600">Main</Badge>
                        )}
                      </CardTitle>
                    </div>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      Active
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">{branch.location}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <div className="text-sm">{branch.phone}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <div className="text-sm truncate">{branch.email}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <div className="text-sm">{branch.operatingHours}</div>
                    </div>
                  </div>

                  <div className="pt-4 border-t space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Today's Orders</span>
                      <span>{branch.totalOrders}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Revenue</span>
                      <span className="text-green-600">{branch.revenue.toLocaleString()} FCFA</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Active Staff</span>
                      <span>{branch.staffCount}</span>
                    </div>
                  </div>

                  <div className="pt-2 flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => onViewDetails(branch)}
                    >
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Details
                    </Button>
                    {user?.role === 'admin' && (
                      <>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => onEdit(branch)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => handleDelete(branch)}
                          disabled={branch.isMain}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Branch Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Staff</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBranches.map(branch => (
                    <TableRow key={branch.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {branch.name}
                          {branch.isMain && <Badge className="bg-blue-600 text-xs">Main</Badge>}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3 h-3 text-gray-500 flex-shrink-0" />
                          <span className="truncate text-sm">{branch.location}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{branch.phone}</TableCell>
                      <TableCell>{branch.totalOrders}</TableCell>
                      <TableCell className="text-green-600">
                        {branch.revenue.toLocaleString()} FCFA
                      </TableCell>
                      <TableCell>{branch.staffCount}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Active
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => onViewDetails(branch)}
                          >
                            View
                          </Button>
                          {user?.role === 'admin' && (
                            <>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => onEdit(branch)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => handleDelete(branch)}
                                disabled={branch.isMain}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
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
            <AlertDialogTitle>Delete Branch</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{branchToDelete?.name}</strong>? 
              This action cannot be undone and will affect all associated data.
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
