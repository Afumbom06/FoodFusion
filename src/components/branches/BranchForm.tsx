import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select';
import { ArrowLeft, Save, MapPin, Phone, Mail, Clock, Building, Users, Upload, Loader2 } from 'lucide-react';
import { Branch } from '../../types';
import { toast } from 'sonner@2.0.3';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';

interface BranchFormProps {
  branch: Branch | null;
  onClose: () => void;
  onBack: () => void;
}

export function BranchForm({ branch, onClose, onBack }: BranchFormProps) {
  const { addBranch, updateBranch, staff } = useApp();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    name: branch?.name || '',
    location: branch?.location || '',
    phone: branch?.phone || '',
    email: branch?.email || '',
    operatingHours: branch?.operatingHours || '8:00 AM - 10:00 PM',
    description: '',
    latitude: branch?.latitude || 4.0511,
    longitude: branch?.longitude || 9.7679,
    isMain: branch?.isMain || false,
    status: 'active' as 'active' | 'inactive',
    managers: [] as string[],
    assignedStaff: [] as string[],
  });

  // Available managers
  const availableManagers = staff.filter(s => s.role === 'manager');
  const availableStaff = staff.filter(s => s.role === 'staff');

  // Cameroon cities
  const cameroonCities = [
    'Douala',
    'Yaoundé',
    'Garoua',
    'Bamenda',
    'Bafoussam',
    'Ngaoundéré',
    'Bertoua',
    'Buea',
    'Limbe',
    'Kribi',
  ];

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Branch name is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+237 \d{1} \d{2} \d{2} \d{2} \d{2}$/.test(formData.phone)) {
      newErrors.phone = 'Phone must be in format: +237 6 12 34 56 78';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.operatingHours.trim()) {
      newErrors.operatingHours = 'Operating hours are required';
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

      const branchData: Branch = {
        id: branch?.id || String(Date.now()),
        name: formData.name,
        location: formData.location,
        phone: formData.phone,
        email: formData.email,
        operatingHours: formData.operatingHours,
        isMain: formData.isMain,
        latitude: formData.latitude,
        longitude: formData.longitude,
      };

      if (branch) {
        updateBranch(branchData);
        toast.success('Branch updated successfully');
      } else {
        addBranch(branchData);
        toast.success('Branch added successfully');
      }

      onClose();
    } catch (error) {
      toast.error('Failed to save branch');
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSearch = () => {
    // Simulate geocoding - in real app, use Google Maps Geocoding API
    const mockCoordinates = {
      'Douala': { lat: 4.0511, lng: 9.7679 },
      'Yaoundé': { lat: 3.8480, lng: 11.5021 },
      'Garoua': { lat: 9.3012, lng: 13.3969 },
      'Bamenda': { lat: 5.9631, lng: 10.1591 },
      'Bafoussam': { lat: 5.4781, lng: 10.4178 },
    };

    const city = formData.location.split(',')[0].trim();
    const coords = mockCoordinates[city as keyof typeof mockCoordinates];

    if (coords) {
      setFormData(prev => ({
        ...prev,
        latitude: coords.lat,
        longitude: coords.lng,
      }));
      toast.success('Coordinates updated');
    } else {
      toast.info('Using default coordinates');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1>{branch ? 'Edit Branch' : 'Add New Branch'}</h1>
          <p className="text-gray-500 mt-1">
            {branch ? 'Update branch information and settings' : 'Create a new branch location'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Information</TabsTrigger>
            <TabsTrigger value="location">Location & Hours</TabsTrigger>
            <TabsTrigger value="staff">Staff Assignment</TabsTrigger>
          </TabsList>

          {/* Basic Information Tab */}
          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Branch Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Branch Name <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        id="name"
                        placeholder="Downtown Restaurant"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={`pl-10 ${errors.name ? 'border-red-500' : ''}`}
                        disabled={loading}
                      />
                    </div>
                    {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      Phone Number <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        id="phone"
                        placeholder="+237 6 12 34 56 78"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className={`pl-10 ${errors.phone ? 'border-red-500' : ''}`}
                        disabled={loading}
                      />
                    </div>
                    {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Email Address <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="branch@restaurant.cm"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                        disabled={loading}
                      />
                    </div>
                    {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Branch Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                      disabled={loading}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description about this branch..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    disabled={loading}
                    rows={3}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Switch
                      id="isMain"
                      checked={formData.isMain}
                      onCheckedChange={(checked) => setFormData({ ...formData, isMain: checked })}
                      disabled={loading}
                    />
                    <div>
                      <Label htmlFor="isMain" className="cursor-pointer">
                        Set as Main Branch
                      </Label>
                      <p className="text-xs text-gray-600">
                        Main branch will be the primary location for the restaurant
                      </p>
                    </div>
                  </div>
                  {formData.isMain && <Badge className="bg-blue-600">Main Branch</Badge>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Location & Hours Tab */}
          <TabsContent value="location" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Location & Operating Hours</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="location">
                    Full Address <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      id="location"
                      placeholder="Douala, Bonanjo, Rue de la Joie"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className={`pl-10 ${errors.location ? 'border-red-500' : ''}`}
                      disabled={loading}
                    />
                  </div>
                  {errors.location && <p className="text-sm text-red-500">{errors.location}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="0.0001"
                      placeholder="4.0511"
                      value={formData.latitude}
                      onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="0.0001"
                      placeholder="9.7679"
                      value={formData.longitude}
                      onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                      disabled={loading}
                    />
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleLocationSearch}
                  disabled={loading}
                  className="w-full"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Auto-detect Coordinates from Address
                </Button>

                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      Coordinates: {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Map preview (Google Maps integration in production)
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="operatingHours">
                    Operating Hours <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      id="operatingHours"
                      placeholder="8:00 AM - 10:00 PM"
                      value={formData.operatingHours}
                      onChange={(e) => setFormData({ ...formData, operatingHours: e.target.value })}
                      className={`pl-10 ${errors.operatingHours ? 'border-red-500' : ''}`}
                      disabled={loading}
                    />
                  </div>
                  {errors.operatingHours && <p className="text-sm text-red-500">{errors.operatingHours}</p>}
                  <p className="text-xs text-gray-500">Example: 8:00 AM - 10:00 PM or 24/7</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Staff Assignment Tab */}
          <TabsContent value="staff" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Assign Staff & Managers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <AlertDescription>
                    Assign managers and staff to this branch. They will have access to branch-specific data and operations.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label>Branch Managers</Label>
                  <div className="border rounded-lg p-4 space-y-2">
                    {availableManagers.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">
                        No managers available for assignment
                      </p>
                    ) : (
                      availableManagers.map(manager => (
                        <div key={manager.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center">
                              {manager.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <div className="text-sm">{manager.name}</div>
                              <div className="text-xs text-gray-500">{manager.phone}</div>
                            </div>
                          </div>
                          <Switch
                            checked={formData.managers.includes(manager.id)}
                            onCheckedChange={(checked) => {
                              setFormData(prev => ({
                                ...prev,
                                managers: checked
                                  ? [...prev.managers, manager.id]
                                  : prev.managers.filter(id => id !== manager.id)
                              }));
                            }}
                            disabled={loading}
                          />
                        </div>
                      ))
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {formData.managers.length} manager(s) selected
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Branch Staff</Label>
                  <div className="border rounded-lg p-4 space-y-2 max-h-[300px] overflow-y-auto">
                    {availableStaff.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">
                        No staff available for assignment
                      </p>
                    ) : (
                      availableStaff.slice(0, 10).map(member => (
                        <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <div className="text-sm">{member.name}</div>
                              <div className="text-xs text-gray-500">{member.phone}</div>
                            </div>
                          </div>
                          <Switch
                            checked={formData.assignedStaff.includes(member.id)}
                            onCheckedChange={(checked) => {
                              setFormData(prev => ({
                                ...prev,
                                assignedStaff: checked
                                  ? [...prev.assignedStaff, member.id]
                                  : prev.assignedStaff.filter(id => id !== member.id)
                              }));
                            }}
                            disabled={loading}
                          />
                        </div>
                      ))
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {formData.assignedStaff.length} staff member(s) selected
                  </p>
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
                    {branch ? 'Update Branch' : 'Create Branch'}
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
