import React, { useState, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { BranchList } from './branches/BranchList';
import { BranchDetails } from './branches/BranchDetails';
import { BranchForm } from './branches/BranchForm';
import { BranchComparison } from './branches/BranchComparison';
import { Branch } from '../types';

type ViewMode = 'list' | 'details' | 'form' | 'comparison';

export function BranchManagement() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const { user } = useAuth();

  const handleViewDetails = (branch: Branch) => {
    setSelectedBranch(branch);
    setViewMode('details');
  };

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setViewMode('form');
  };

  const handleAddNew = () => {
    setEditingBranch(null);
    setViewMode('form');
  };

  const handleFormClose = () => {
    setEditingBranch(null);
    setViewMode('list');
  };

  const handleBack = () => {
    setSelectedBranch(null);
    setEditingBranch(null);
    setViewMode('list');
  };

  const handleViewComparison = () => {
    setViewMode('comparison');
  };

  // Render based on view mode
  if (viewMode === 'form') {
    return (
      <BranchForm 
        branch={editingBranch} 
        onClose={handleFormClose}
        onBack={handleBack}
      />
    );
  }

  if (viewMode === 'details' && selectedBranch) {
    return (
      <BranchDetails 
        branch={selectedBranch} 
        onBack={handleBack}
        onEdit={() => handleEdit(selectedBranch)}
      />
    );
  }

  if (viewMode === 'comparison') {
    return (
      <BranchComparison onBack={handleBack} />
    );
  }

  return (
    <BranchList 
      onViewDetails={handleViewDetails}
      onEdit={handleEdit}
      onAddNew={handleAddNew}
      onViewComparison={handleViewComparison}
    />
  );
}
