import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { UtensilsCrossed, MapPin, Phone, Clock, Search, ChevronRight } from 'lucide-react';
import { mockBranches } from '../data/mockData';
import { Badge } from './ui/badge';

export function BranchSelection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const { selectBranch, user } = useAuth();

  // Load last selected branch from localStorage
  useEffect(() => {
    const lastSelected = localStorage.getItem('rms_last_selected_branch');
    if (lastSelected) {
      setSelectedBranchId(lastSelected);
    }
  }, []);

  const filteredBranches = mockBranches.filter(branch =>
    branch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    branch.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectBranch = (branchId: string) => {
    selectBranch(branchId);
    localStorage.setItem('rms_last_selected_branch', branchId);
  };

  const handleContinue = () => {
    if (selectedBranchId) {
      handleSelectBranch(selectedBranchId);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <Card className="w-full max-w-3xl">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <UtensilsCrossed className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl">Welcome, {user?.name}!</CardTitle>
          <CardDescription className="text-lg">
            Select the branch you want to access
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search branches by name or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Branch List */}
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {filteredBranches.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No branches found matching "{searchQuery}"
              </div>
            ) : (
              filteredBranches.map((branch) => (
                <Card
                  key={branch.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedBranchId === branch.id
                      ? 'border-2 border-blue-600 bg-blue-50'
                      : 'border hover:border-blue-300'
                  }`}
                  onClick={() => setSelectedBranchId(branch.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg">{branch.name}</h3>
                          {branch.isMain && (
                            <Badge className="bg-blue-600">Main Branch</Badge>
                          )}
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{branch.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            <span>{branch.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{branch.operatingHours}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {selectedBranchId === branch.id && (
                          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Continue Button */}
          <Button
            onClick={handleContinue}
            disabled={!selectedBranchId}
            className="w-full bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            Continue to Dashboard
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>

          {/* Info Note */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-xs text-blue-900">
              <strong>Note:</strong> Your last selected branch will be remembered for next time. 
              You can always switch branches from the dashboard settings.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
