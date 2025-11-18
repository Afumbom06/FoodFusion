import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ArrowLeft, Edit, Calendar, Clock, Users, Phone, Mail, MapPin, FileText, CheckCircle, XCircle } from 'lucide-react';
import { Reservation } from '../../types';
import { toast } from 'sonner@2.0.3';

interface ReservationDetailsProps {
  reservation: Reservation;
  onBack: () => void;
  onEdit: () => void;
}

export function ReservationDetails({ reservation, onBack, onEdit }: ReservationDetailsProps) {
  const { updateReservation, tables } = useApp();

  const assignedTable = tables.find(t => t.id === reservation.tableId);

  const handleConfirm = () => {
    updateReservation(reservation.id, { status: 'confirmed' });
    toast.success('Reservation confirmed');
  };

  const handleComplete = () => {
    updateReservation(reservation.id, { status: 'completed' });
    toast.success('Reservation completed');
  };

  const handleCancel = () => {
    updateReservation(reservation.id, { status: 'cancelled' });
    toast.success('Reservation cancelled');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1>Reservation Details</h1>
            <p className="text-gray-500 mt-1">{reservation.customerName}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onEdit}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Reservation Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-600">Date</div>
                    <div className="font-medium">
                      {new Date(reservation.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-600">Time</div>
                    <div className="font-medium">{reservation.time}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-600">Party Size</div>
                    <div className="font-medium">{reservation.guests} guests</div>
                  </div>
                </div>

                {assignedTable && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-500" />
                    <div>
                      <div className="text-sm text-gray-600">Table</div>
                      <div className="font-medium">Table {assignedTable.number}</div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-gray-500" />
                <div>
                  <div className="text-sm text-gray-600">Name</div>
                  <div className="font-medium">{reservation.customerName}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-500" />
                <div>
                  <div className="text-sm text-gray-600">Phone</div>
                  <div className="font-medium">{reservation.customerPhone}</div>
                </div>
              </div>

              {reservation.customerEmail && (
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-600">Email</div>
                    <div className="font-medium">{reservation.customerEmail}</div>
                  </div>
                </div>
              )}

              {reservation.notes && (
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-600">Special Requests</div>
                    <div className="font-medium">{reservation.notes}</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Badge 
                    className="text-sm"
                    variant={
                      reservation.status === 'confirmed' ? 'default' :
                      reservation.status === 'completed' ? 'secondary' :
                      reservation.status === 'cancelled' ? 'destructive' :
                      'outline'
                    }
                  >
                    {reservation.status}
                  </Badge>
                </div>

                <div>
                  <div className="text-sm text-gray-600">Type</div>
                  <Badge variant="outline" className="mt-1">
                    {reservation.type === 'online' ? '🌐 Online' : '🚶 Walk-in'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {reservation.status === 'pending' && (
                <>
                  <Button 
                    onClick={handleConfirm}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirm Reservation
                  </Button>
                  <Button 
                    onClick={handleCancel}
                    variant="destructive"
                    className="w-full"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Cancel Reservation
                  </Button>
                </>
              )}

              {reservation.status === 'confirmed' && (
                <>
                  <Button 
                    onClick={handleComplete}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark as Completed
                  </Button>
                  <Button 
                    onClick={handleCancel}
                    variant="outline"
                    className="w-full"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Cancel Reservation
                  </Button>
                </>
              )}

              <Button 
                onClick={onEdit}
                variant="outline"
                className="w-full"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Details
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
