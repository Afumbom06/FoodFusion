import React, { useState, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ArrowLeft, Plus, Search, Edit2, Users, Grid } from 'lucide-react';
import { Table } from '../../types';
import { Table as TableUI, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

interface TableListProps {
  onBack: () => void;
  onViewFloorPlan: () => void;
  onNewTable: () => void;
  onEditTable: (table: Table) => void;
}

export function TableList({ onBack, onViewFloorPlan, onNewTable, onEditTable }: TableListProps) {
  const { tables, updateTable, selectedBranch } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredTables = useMemo(() => {
    let filtered = tables;

    if (selectedBranch !== 'all') {
      filtered = filtered.filter(t => t.branchId === selectedBranch);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(t => t.status === statusFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(t =>
        t.number.toString().includes(searchQuery)
      );
    }

    return filtered.sort((a, b) => a.number - b.number);
  }, [tables, selectedBranch, statusFilter, searchQuery]);

  const stats = useMemo(() => ({
    total: filteredTables.length,
    available: filteredTables.filter(t => t.status === 'available').length,
    occupied: filteredTables.filter(t => t.status === 'occupied').length,
    reserved: filteredTables.filter(t => t.status === 'reserved').length,
  }), [filteredTables]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1>Table Management</h1>
            <p className="text-gray-500 mt-1">Manage restaurant tables</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onViewFloorPlan}>
            <Grid className="w-4 h-4 mr-2" />
            Floor Plan
          </Button>
          <Button onClick={onNewTable} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Table
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.available}</div>
            <div className="text-sm text-gray-600">Available</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.occupied}</div>
            <div className="text-sm text-gray-600">Occupied</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.reserved}</div>
            <div className="text-sm text-gray-600">Reserved</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search table number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="occupied">Occupied</SelectItem>
                <SelectItem value="reserved">Reserved</SelectItem>
                <SelectItem value="cleaning">Cleaning</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <TableUI>
            <TableHeader>
              <TableRow>
                <TableHead>Table #</TableHead>
                <TableHead>Seats</TableHead>
                <TableHead>Shape</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTables.map(table => (
                <TableRow key={table.id}>
                  <TableCell className="font-medium">Table {table.number}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {table.seats}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {table.shape || 'Standard'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      table.status === 'available' ? 'default' :
                      table.status === 'occupied' ? 'destructive' :
                      table.status === 'reserved' ? 'secondary' :
                      'outline'
                    }>
                      {table.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {table.location || 'Main area'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Select
                        value={table.status}
                        onValueChange={(v) => updateTable(table.id, { status: v as any })}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="occupied">Occupied</SelectItem>
                          <SelectItem value="reserved">Reserved</SelectItem>
                          <SelectItem value="cleaning">Cleaning</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button size="sm" variant="ghost" onClick={() => onEditTable(table)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </TableUI>
        </CardContent>
      </Card>
    </div>
  );
}
