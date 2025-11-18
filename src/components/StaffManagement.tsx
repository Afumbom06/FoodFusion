import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Users, UserCheck, Calendar, MessageSquare } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Staff, Attendance, Shift, Announcement } from '../types';
import { StaffDashboard } from './staff/StaffDashboard';
import { StaffForm } from './staff/StaffForm';
import { AttendanceTracking } from './staff/AttendanceTracking';
import { ShiftScheduling } from './staff/ShiftScheduling';
import { StaffCommunication } from './staff/StaffCommunication';

export function StaffManagement() {
  const {
    staff,
    selectedBranch,
    branches,
    attendance,
    shifts,
    announcements,
    addStaff,
    updateStaff,
    deleteStaff,
    addAttendance,
    updateAttendance,
    addShift,
    updateShift,
    deleteShift,
    addAnnouncement,
    updateAnnouncement,
  } = useApp();

  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);

  // Handle Add/Edit Staff
  const handleSaveStaff = (staffData: Partial<Staff>) => {
    if (selectedStaff) {
      // Update existing staff
      updateStaff(selectedStaff.id, staffData);
      toast.success('Staff member updated successfully');
    } else {
      // Add new staff
      const newStaff: Staff = {
        id: Date.now().toString(),
        name: staffData.name!,
        email: staffData.email!,
        phone: staffData.phone!,
        role: staffData.role!,
        branchId: staffData.branchId!,
        isActive: staffData.status === 'active',
        gender: staffData.gender,
        address: staffData.address,
        salary: staffData.salary,
        shiftStart: staffData.shiftStart,
        shiftEnd: staffData.shiftEnd,
        status: staffData.status,
        username: staffData.username,
        dateJoined: staffData.dateJoined,
        avatar: staffData.avatar,
        performanceScore: 85, // Default
        totalShifts: 0,
        ordersServed: 0,
        customerRating: 4.5,
      };
      addStaff(newStaff);
      toast.success('Staff member added successfully');
    }
    setShowStaffForm(false);
    setSelectedStaff(null);
  };

  // Handle Delete Staff
  const handleDeleteStaff = (id: string) => {
    if (confirm('Are you sure you want to delete this staff member?')) {
      deleteStaff(id);
      toast.success('Staff member deleted');
    }
  };

  // Handle Edit Staff
  const handleEditStaff = (staff: Staff) => {
    setSelectedStaff(staff);
    setShowStaffForm(true);
  };

  // Handle View Staff
  const handleViewStaff = (staff: Staff) => {
    setSelectedStaff(staff);
    setShowStaffForm(true);
  };

  // Handle Add Staff
  const handleAddStaff = () => {
    setSelectedStaff(null);
    setShowStaffForm(true);
  };

  // Handle Check In
  const handleCheckIn = (staffId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const time = new Date().toTimeString().split(' ')[0].substring(0, 5);
    const staffMember = staff.find(s => s.id === staffId);

    if (!staffMember) return;

    const existingAttendance = attendance.find(
      a => a.staffId === staffId && a.date === today
    );

    if (existingAttendance) {
      toast.error('Already checked in for today');
      return;
    }

    addAttendance({
      staffId,
      staffName: staffMember.name,
      date: today,
      checkInTime: time,
      status: 'present',
      branchId: staffMember.branchId,
    });
  };

  // Handle Check Out
  const handleCheckOut = (staffId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const time = new Date().toTimeString().split(' ')[0].substring(0, 5);
    
    const existingAttendance = attendance.find(
      a => a.staffId === staffId && a.date === today
    );

    if (!existingAttendance) {
      toast.error('No check-in record found');
      return;
    }

    if (existingAttendance.checkOutTime) {
      toast.error('Already checked out');
      return;
    }

    // Calculate hours worked
    const checkIn = new Date(`${today}T${existingAttendance.checkInTime}`);
    const checkOut = new Date(`${today}T${time}`);
    const hoursWorked = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);

    updateAttendance(existingAttendance.id, {
      checkOutTime: time,
      hoursWorked: Math.max(0, hoursWorked),
    });
  };

  // Handle Mark Attendance
  const handleMarkAttendance = (attendanceData: Partial<Attendance>) => {
    const existingAttendance = attendance.find(
      a => a.staffId === attendanceData.staffId && a.date === attendanceData.date
    );

    if (existingAttendance) {
      updateAttendance(existingAttendance.id, attendanceData);
    } else {
      addAttendance({
        ...attendanceData,
        id: Date.now().toString(),
      } as Attendance);
    }
  };

  // Handle Add Shift
  const handleAddShift = (shiftData: Partial<Shift>) => {
    addShift(shiftData);
  };

  // Handle Update Shift
  const handleUpdateShift = (id: string, shiftData: Partial<Shift>) => {
    updateShift(id, shiftData);
  };

  // Handle Delete Shift
  const handleDeleteShift = (id: string) => {
    deleteShift(id);
  };

  // Handle Post Announcement
  const handlePostAnnouncement = (announcementData: Partial<Announcement>) => {
    const newAnnouncement: Announcement = {
      id: Date.now().toString(),
      title: announcementData.title!,
      content: announcementData.content!,
      type: announcementData.type!,
      authorId: announcementData.authorId!,
      authorName: announcementData.authorName!,
      date: announcementData.date!,
      reactions: [],
      comments: [],
    };
    addAnnouncement(newAnnouncement);
  };

  // Handle React to Announcement
  const handleReact = (announcementId: string, userId: string, reaction: string) => {
    const announcement = announcements.find(a => a.id === announcementId);
    if (!announcement) return;

    const reactions = announcement.reactions || [];
    const existingReaction = reactions.find(r => r.userId === userId);

    if (existingReaction) {
      // Remove reaction
      updateAnnouncement(announcementId, {
        reactions: reactions.filter(r => r.userId !== userId),
      });
    } else {
      // Add reaction
      updateAnnouncement(announcementId, {
        reactions: [...reactions, { userId, type: reaction }],
      });
    }
  };

  // Handle Add Comment
  const handleAddComment = (announcementId: string, userId: string, userName: string, text: string) => {
    const announcement = announcements.find(a => a.id === announcementId);
    if (!announcement) return;

    const newComment = {
      userId,
      userName,
      text,
      date: new Date().toISOString(),
    };

    const updatedComments = [...(announcement.comments || []), newComment];
    updateAnnouncement(announcementId, {
      comments: updatedComments,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1>Staff & User Management</h1>
        <p className="text-gray-500 mt-1">
          Manage employees, attendance, shifts, and internal communication
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto">
          <TabsTrigger value="dashboard" className="gap-2">
            <Users className="w-4 h-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="attendance" className="gap-2">
            <UserCheck className="w-4 h-4" />
            Attendance
          </TabsTrigger>
          <TabsTrigger value="shifts" className="gap-2">
            <Calendar className="w-4 h-4" />
            Shift Scheduling
          </TabsTrigger>
          <TabsTrigger value="communication" className="gap-2">
            <MessageSquare className="w-4 h-4" />
            Communication
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="mt-6">
          <StaffDashboard
            staff={staff}
            attendance={attendance}
            selectedBranch={selectedBranch}
            onAddStaff={handleAddStaff}
            onEditStaff={handleEditStaff}
            onDeleteStaff={handleDeleteStaff}
            onViewStaff={handleViewStaff}
          />
        </TabsContent>

        {/* Attendance Tab */}
        <TabsContent value="attendance" className="mt-6">
          <AttendanceTracking
            attendance={attendance}
            staff={staff}
            selectedBranch={selectedBranch}
            onCheckIn={handleCheckIn}
            onCheckOut={handleCheckOut}
            onMarkAttendance={handleMarkAttendance}
          />
        </TabsContent>

        {/* Shifts Tab */}
        <TabsContent value="shifts" className="mt-6">
          <ShiftScheduling
            shifts={shifts}
            staff={staff}
            selectedBranch={selectedBranch}
            onAddShift={handleAddShift}
            onUpdateShift={handleUpdateShift}
            onDeleteShift={handleDeleteShift}
          />
        </TabsContent>

        {/* Communication Tab */}
        <TabsContent value="communication" className="mt-6">
          <StaffCommunication
            announcements={announcements}
            userName={user?.name || 'Unknown'}
            userId={user?.id || '1'}
            onPostAnnouncement={handlePostAnnouncement}
            onReact={handleReact}
            onAddComment={handleAddComment}
          />
        </TabsContent>
      </Tabs>

      {/* Staff Form Modal */}
      <StaffForm
        open={showStaffForm}
        onClose={() => {
          setShowStaffForm(false);
          setSelectedStaff(null);
        }}
        onSave={handleSaveStaff}
        staff={selectedStaff}
        branchId={selectedBranch}
        branches={branches.map(b => ({ id: b.id, name: b.name }))}
      />
    </div>
  );
}
