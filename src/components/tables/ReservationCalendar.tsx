import React, { useState, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Calendar } from '../ui/calendar';
import { ArrowLeft, Plus, Clock, Users } from 'lucide-react';
import { Reservation } from '../../types';

interface ReservationCalendarProps {
  onBack: () => void;
  onNewReservation: (date?: string, time?: string) => void;
  onViewReservation: (reservation: Reservation) => void;
}

export function ReservationCalendar({ 
  onBack, 
  onNewReservation,
  onViewReservation 
}: ReservationCalendarProps) {
  const { reservations, selectedBranch } = useApp();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const timeSlots = [
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00',
    '14:30', '15:00', '18:00', '18:30', '19:00', '19:30', '20:00',
    '20:30', '21:00', '21:30', '22:00'
  ];

  // Get reservations for selected date
  const dateReservations = useMemo(() => {
    const dateString = selectedDate.toISOString().split('T')[0];
    return reservations.filter(r => 
      r.date === dateString &&
      (selectedBranch === 'all' || r.branchId === selectedBranch)
    );
  }, [reservations, selectedDate, selectedBranch]);

  // Get reservations by time slot
  const getReservationsForSlot = (time: string) => {
    return dateReservations.filter(r => r.time === time);
  };

  // Get dates with reservations for calendar highlighting
  const datesWithReservations = useMemo(() => {
    const dates = new Set<string>();
    reservations
      .filter(r => selectedBranch === 'all' || r.branchId === selectedBranch)
      .forEach(r => dates.add(r.date));
    return Array.from(dates).map(d => new Date(d));
  }, [reservations, selectedBranch]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1>Reservation Calendar</h1>
          <p className="text-gray-500 mt-1">View and manage bookings by date</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Select Date</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border"
              modifiers={{
                booked: datesWithReservations
              }}
              modifiersStyles={{
                booked: { 
                  backgroundColor: '#dbeafe',
                  fontWeight: 'bold'
                }
              }}
            />
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-4 h-4 rounded bg-blue-100 border" />
                <span className="text-gray-600">Has reservations</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Time Slots */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  {dateReservations.length} reservation(s)
                </p>
              </div>
              <Button onClick={() => onNewReservation()} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                New Booking
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {timeSlots.map(time => {
                const slotReservations = getReservationsForSlot(time);
                const hasReservations = slotReservations.length > 0;

                return (
                  <div
                    key={time}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      hasReservations 
                        ? 'bg-blue-50 border-blue-200' 
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">{time}</span>
                        </div>
                        {hasReservations && (
                          <Badge>{slotReservations.length} booking(s)</Badge>
                        )}
                      </div>
                      {!hasReservations && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => onNewReservation(
                            selectedDate.toISOString().split('T')[0],
                            time
                          )}
                        >
                          Book
                        </Button>
                      )}
                    </div>

                    {hasReservations && (
                      <div className="mt-3 space-y-2">
                        {slotReservations.map(reservation => (
                          <div
                            key={reservation.id}
                            onClick={() => onViewReservation(reservation)}
                            className="flex items-center justify-between p-2 bg-white rounded border cursor-pointer hover:shadow-md transition-shadow"
                          >
                            <div>
                              <div className="font-medium text-sm">{reservation.customerName}</div>
                              <div className="text-xs text-gray-500 flex items-center gap-2">
                                <Users className="w-3 h-3" />
                                {reservation.guests} guests
                                {reservation.customerPhone && ` • ${reservation.customerPhone}`}
                              </div>
                            </div>
                            <Badge 
                              variant={reservation.status === 'confirmed' ? 'default' : 'secondary'}
                            >
                              {reservation.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
