import React, { useState, useEffect } from 'react';
import { 
  Search, Map, Users, Shield, Calendar, Hotel, 
  MessageCircle, CreditCard, Camera, Star 
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const RoadTripPlanner = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [trips, setTrips] = useState([]);
  const [compatibleTrips, setCompatibleTrips] = useState([]);
  const [activeTab, setActiveTab] = useState('search');
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [messages, setMessages] = useState([]);
  
  // Form states
  const [startPoint, setStartPoint] = useState('');
  const [destination, setDestination] = useState('');
  const [tripDetails, setTripDetails] = useState({
    startDate: '',
    duration: 1,
    maxParticipants: 2,
    estimatedCost: 0,
    requirements: ''
  });

  // Authentication
  const handleLogin = async (credentials) => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      });
      const data = await response.json();
      setCurrentUser(data.user);
      localStorage.setItem('token', data.token);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  // Trip Management
  const createTrip = async () => {
    try {
      const response = await fetch('/api/create-trip', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          startPoint,
          destination,
          ...tripDetails
        })
      });
      const newTrip = await response.json();
      setTrips([...trips, newTrip]);
    } catch (error) {
      console.error('Failed to create trip:', error);
    }
  };

  // Route Planning Interface
  const RouteSearch = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Map className="mr-2" />
          Plan Your Route
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Starting Point"
              value={startPoint}
              onChange={(e) => setStartPoint(e.target.value)}
              className="p-2 border rounded"
            />
            <input
              type="text"
              placeholder="Destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="p-2 border rounded"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="date"
              value={tripDetails.startDate}
              onChange={(e) => setTripDetails({...tripDetails, startDate: e.target.value})}
              className="p-2 border rounded"
            />
            <input
              type="number"
              placeholder="Duration (days)"
              value={tripDetails.duration}
              onChange={(e) => setTripDetails({...tripDetails, duration: e.target.value})}
              className="p-2 border rounded"
            />
          </div>
          <button 
            onClick={createTrip}
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Create Trip
          </button>
        </div>
      </CardContent>
    </Card>
  );

  // Trip Bulletin Board
  const BulletinBoard = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2" />
            Available Trips
          </CardTitle>
        </CardHeader>
        <CardContent>
          {compatibleTrips.map((trip, index) => (
            <div key={index} className="border-b p-4 last:border-b-0">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{trip.creator_info.username}'s Trip</h3>
                  <p className="text-sm text-gray-600">
                    {trip.trip.start_point} → {trip.trip.destination}
                  </p>
                  <div className="flex items-center mt-1">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="ml-1 text-sm">{trip.creator_info.rating}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">
                    ${trip.trip.estimated_cost}/person
                  </p>
                  <p className="text-sm text-gray-600">
                    {trip.trip.duration} days
                  </p>
                </div>
              </div>
              <div className="mt-2 flex space-x-2">
                <button className="bg-blue-500 text-white px-3 py-1 rounded text-sm">
                  Request to Join
                </button>
                <button className="border border-blue-500 text-blue-500 px-3 py-1 rounded text-sm">
                  Message
                </button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );

  // Messaging System
  const MessageCenter = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageCircle className="mr-2" />
          Messages
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div key={index} className="border-b last:border-b-0 p-2">
              <div className="flex items-start space-x-2">
                <div className="w-8 h-8 bg-gray-200 rounded-full" />
                <div>
                  <p className="font-semibold">{message.sender}</p>
                  <p className="text-sm text-gray-600">{message.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  // Navigation
  const Navigation = () => (
    <div className="flex space-x-2 mb-6">
      {['search', 'bulletin', 'messages', 'profile'].map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`px-4 py-2 rounded ${
            activeTab === tab ? 'bg-blue-500 text-white' : 'bg-gray-100'
          }`}
        >
          {tab.charAt(0).toUpperCase() + tab.slice(1)}
        </button>
      ))}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Navigation />
      
      {!currentUser ? (
        <Alert>
          <AlertTitle>Welcome to Road Trip Planner</AlertTitle>
          <AlertDescription>
            Please log in or register to start planning your trip.
          </AlertDescription>
        </Alert>
      ) : (
        <div>
          {activeTab === 'search' && <RouteSearch />}
          {activeTab === 'bulletin' && <BulletinBoard />}
          {activeTab === 'messages' && <MessageCenter />}
        </div>
      )}
    </div>
  );
};

export default RoadTripPlanner;
