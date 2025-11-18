import React, { useState } from 'react';
import { MenuItem } from '../types';
import { MenuItemList } from './menu/MenuItemList';
import { MenuItemForm } from './menu/MenuItemForm';
import { MenuItemDetails } from './menu/MenuItemDetails';
import { CategoryManagement } from './menu/CategoryManagement';
import { MenuAnalytics } from './menu/MenuAnalytics';

type ViewMode = 'list' | 'form' | 'details' | 'categories' | 'analytics';

export function MenuManagement() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  const handleViewDetails = (item: MenuItem) => {
    setSelectedItem(item);
    setViewMode('details');
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setViewMode('form');
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setViewMode('form');
  };

  const handleFormClose = () => {
    setEditingItem(null);
    setViewMode('list');
  };

  const handleBack = () => {
    setSelectedItem(null);
    setEditingItem(null);
    setViewMode('list');
  };

  const handleViewCategories = () => {
    setViewMode('categories');
  };

  const handleViewAnalytics = () => {
    setViewMode('analytics');
  };

  // Render based on view mode
  if (viewMode === 'form') {
    return (
      <MenuItemForm 
        item={editingItem} 
        onClose={handleFormClose}
        onBack={handleBack}
      />
    );
  }

  if (viewMode === 'details' && selectedItem) {
    return (
      <MenuItemDetails 
        item={selectedItem} 
        onBack={handleBack}
        onEdit={() => handleEdit(selectedItem)}
      />
    );
  }

  if (viewMode === 'categories') {
    return (
      <CategoryManagement onBack={handleBack} />
    );
  }

  if (viewMode === 'analytics') {
    return (
      <MenuAnalytics onBack={handleBack} />
    );
  }

  return (
    <MenuItemList 
      onViewDetails={handleViewDetails}
      onEdit={handleEdit}
      onAddNew={handleAddNew}
      onViewCategories={handleViewCategories}
      onViewAnalytics={handleViewAnalytics}
    />
  );
}
