import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Label } from '../ui/label';
import { Star, MessageSquare, TrendingUp, AlertCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { CustomerFeedback } from '../../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface FeedbackManagementProps {
  feedback: CustomerFeedback[];
  onRespond: (id: string, response: string) => void;
  onMarkAddressed: (id: string) => void;
}

export function FeedbackManagement({
  feedback,
  onRespond,
  onMarkAddressed,
}: FeedbackManagementProps) {
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedFeedback, setSelectedFeedback] = useState<CustomerFeedback | null>(null);
  const [responseText, setResponseText] = useState('');
  const [showResponseModal, setShowResponseModal] = useState(false);

  // Filter feedback
  const filteredFeedback = useMemo(() => {
    let items = feedback;

    if (categoryFilter !== 'all') {
      items = items.filter(f => f.category === categoryFilter);
    }

    if (statusFilter !== 'all') {
      items = items.filter(f => f.status === statusFilter);
    }

    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [feedback, categoryFilter, statusFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    const avgRating = feedback.length > 0
      ? (feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length).toFixed(1)
      : '0';
    const pending = feedback.filter(f => f.status === 'pending').length;
    const addressed = feedback.filter(f => f.status === 'addressed').length;

    return { avgRating, total: feedback.length, pending, addressed };
  }, [feedback]);

  // Category breakdown for chart
  const categoryData = useMemo(() => {
    const categories = feedback.reduce((acc, f) => {
      acc[f.category] = (acc[f.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categories).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      count: value,
    }));
  }, [feedback]);

  // Rating trend (mock data)
  const ratingTrend = [
    { month: 'Jan', rating: 4.2 },
    { month: 'Feb', rating: 4.4 },
    { month: 'Mar', rating: 4.3 },
    { month: 'Apr', rating: 4.6 },
    { month: 'May', rating: 4.5 },
    { month: 'Jun', rating: 4.7 },
  ];

  const handleRespond = (item: CustomerFeedback) => {
    setSelectedFeedback(item);
    setResponseText(item.response || '');
    setShowResponseModal(true);
  };

  const submitResponse = () => {
    if (!selectedFeedback || !responseText.trim()) {
      toast.error('Please enter a response');
      return;
    }

    onRespond(selectedFeedback.id, responseText);
    toast.success('Response submitted successfully');
    setShowResponseModal(false);
    setSelectedFeedback(null);
    setResponseText('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl">Feedback & Ratings</h2>
        <p className="text-gray-500 mt-1">Monitor customer satisfaction and respond to feedback</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Rating</p>
                <div className="text-2xl mt-1">{stats.avgRating}</div>
              </div>
              <Star className="w-8 h-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Feedback</p>
                <div className="text-2xl mt-1">{stats.total}</div>
              </div>
              <MessageSquare className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <div className="text-2xl text-amber-600 mt-1">{stats.pending}</div>
              </div>
              <AlertCircle className="w-8 h-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Addressed</p>
                <div className="text-2xl text-green-600 mt-1">{stats.addressed}</div>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rating Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Rating Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={ratingTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="rating" stroke="#3b82f6" strokeWidth={2} name="Avg Rating" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Feedback by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Feedback Table */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Feedback</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex gap-3">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="food">Food</SelectItem>
                <SelectItem value="service">Service</SelectItem>
                <SelectItem value="delivery">Delivery</SelectItem>
                <SelectItem value="overall">Overall</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="addressed">Addressed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Feedback List */}
          <div className="space-y-3">
            {filteredFeedback.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No feedback found</p>
              </div>
            ) : (
              filteredFeedback.map(item => (
                <Card key={item.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-medium">{item.customerName}</span>
                          <Badge variant="outline" className="capitalize">{item.category}</Badge>
                          <Badge className={item.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}>
                            {item.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm text-gray-600">Order #{item.orderId}</span>
                          <span className="text-gray-300">•</span>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${i < item.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                        </div>
                        {item.message && (
                          <p className="text-gray-700 mb-3">{item.message}</p>
                        )}
                        {item.response && (
                          <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm">
                            <div className="font-medium text-blue-900 mb-1">Your Response:</div>
                            <p className="text-blue-800">{item.response}</p>
                            <div className="text-xs text-blue-600 mt-1">
                              {item.responseDate && new Date(item.responseDate).toLocaleDateString()}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 ml-4">
                        {new Date(item.date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRespond(item)}
                      >
                        {item.response ? 'Edit Response' : 'Respond'}
                      </Button>
                      {item.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            onMarkAddressed(item.id);
                            toast.success('Marked as addressed');
                          }}
                        >
                          Mark Addressed
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Response Modal */}
      <Dialog open={showResponseModal} onOpenChange={setShowResponseModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Respond to Feedback</DialogTitle>
            <DialogDescription>
              Send a response to {selectedFeedback?.customerName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Your Response</Label>
              <Textarea
                placeholder="Type your response..."
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                rows={5}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowResponseModal(false)}>
              Cancel
            </Button>
            <Button onClick={submitResponse} className="bg-blue-600 hover:bg-blue-700">
              Send Response
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
