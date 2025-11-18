import React, { useState } from 'react';
import { TableFloorPlan } from './tables/TableFloorPlan';
import { TableList } from './tables/TableList';
import { ReservationCalendar } from './tables/ReservationCalendar';
import { ReservationList } from './tables/ReservationList';
import { ReservationForm } from './tables/ReservationForm';
import { ReservationDetails } from './tables/ReservationDetails';
import { TableForm } from './tables/TableForm';
import { Table, Reservation } from '../types';

type ViewMode = 
  | 'floor-plan' 
  | 'table-list' 
  | 'calendar' 
  | 'reservation-list' 
  | 'reservation-form' 
  | 'reservation-details'
  | 'table-form';

export function TablesReservations() {
  const [viewMode, setViewMode] = useState<ViewMode>('floor-plan');
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  const handleViewFloorPlan = () => {
    setViewMode('floor-plan');
  };

  const handleViewTableList = () => {
    setViewMode('table-list');
  };

  const handleViewCalendar = () => {
    setViewMode('calendar');
  };

  const handleViewReservationList = () => {
    setViewMode('reservation-list');
  };

  const handleNewReservation = (date?: string, time?: string) => {
    setEditingReservation(null);
    setViewMode('reservation-form');
  };

  const handleEditReservation = (reservation: Reservation) => {
    setEditingReservation(reservation);
    setViewMode('reservation-form');
  };

  const handleViewReservationDetails = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setViewMode('reservation-details');
  };

  const handleNewTable = () => {
    setSelectedTable(null);
    setViewMode('table-form');
  };

  const handleEditTable = (table: Table) => {
    setSelectedTable(table);
    setViewMode('table-form');
  };

  const handleBack = () => {
    setSelectedReservation(null);
    setEditingReservation(null);
    setSelectedTable(null);
    setViewMode('floor-plan');
  };

  // Render based on view mode
  if (viewMode === 'reservation-form') {
    return (
      <ReservationForm 
        reservation={editingReservation}
        onBack={handleBack}
      />
    );
  }

  if (viewMode === 'reservation-details' && selectedReservation) {
    return (
      <ReservationDetails 
        reservation={selectedReservation}
        onBack={handleBack}
        onEdit={() => handleEditReservation(selectedReservation)}
      />
    );
  }

  if (viewMode === 'table-form') {
    return (
      <TableForm 
        table={selectedTable}
        onBack={handleBack}
      />
    );
  }

  if (viewMode === 'table-list') {
    return (
      <TableList 
        onBack={handleViewFloorPlan}
        onViewFloorPlan={handleViewFloorPlan}
        onNewTable={handleNewTable}
        onEditTable={handleEditTable}
      />
    );
  }

  if (viewMode === 'calendar') {
    return (
      <ReservationCalendar 
        onBack={handleViewFloorPlan}
        onNewReservation={handleNewReservation}
        onViewReservation={handleViewReservationDetails}
      />
    );
  }

  if (viewMode === 'reservation-list') {
    return (
      <ReservationList 
        onBack={handleViewFloorPlan}
        onNewReservation={handleNewReservation}
        onViewDetails={handleViewReservationDetails}
        onEditReservation={handleEditReservation}
      />
    );
  }

  return (
    <TableFloorPlan 
      onViewTableList={handleViewTableList}
      onViewCalendar={handleViewCalendar}
      onViewReservationList={handleViewReservationList}
      onNewReservation={handleNewReservation}
      onNewTable={handleNewTable}
      onEditTable={handleEditTable}
    />
  );
}
