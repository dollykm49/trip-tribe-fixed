import React, { useState } from 'react';
import axios from 'axios';
import { Search, Map, Users, Shield, Calendar, Hotel } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const RoadTripPlanner = () => {
  const [startPoint, setStartPoint] = useState('');
  const [destination, setDestination] = useState('');
  const [selectedRoute, setSelectedRoute] = useState<{ id: number; name: string; duration: string; attractions: string[]; lodging: string[] } | null>(null);
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [isGroup, setIsGroup] = useState(false);
  const [autoSave, setAutoSave] = useState(false);
  const [frequency, setFrequency] = useState('');

  const createSavingsGoal = async () => {
    try {
      const response = await axios.post('/api/savings/create-goal', {
        name: goalName,
        targetAmount: parseFloat(targetAmount),
        deadline,
        isGroup,
        autoSave,
        frequency,
      });
      console.log('Savings goal created:', response.data);
    } catch (error) {
      console.error('Error creating savings goal:', error);
    }
  };

  // Sample routes data - in production this would come from an API
  const sampleRoutes = [
    {
      id: 1,
      name: 'Scenic Route',
      duration: '8 hours',
      attractions: ['Grand Canyon', 'Sedona Red Rocks', 'Petrified Forest'],
      lodging: ['Mountain Lodge', 'Camping Sites', 'Historic Hotels'],
    },
    {
      id: 2,
      name: 'Quick Route',
      duration: '5 hours',
      attractions: ['Historic Downtown', 'State Park', 'Art Museum'],
      lodging: ['City Hotels', 'B&Bs', 'Hostels'],
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Road Trip Planner</h1>
        <p className="text-gray-600">Plan your perfect road trip and find travel companions</p>
      </div>

      {/* Search Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="mr-2" />
            Plan Your Route
          </CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* Savings Goal Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Hotel className="mr-2" />
            Create Savings Goal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Goal Name"
              value={goalName}
              onChange={(e) => setGoalName(e.target.value)}
              className="p-2 border rounded"
            />
            <input
              type="text"
              placeholder="Target Amount"
              value={parseFloat(targetAmount)}
              onChange={(e) => setTargetAmount(e.target.value)}
              className="p-2 border rounded"
            />
            <input
              type="date"
              placeholder="Deadline"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="p-2 border rounded"
            />
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={isGroup}
                onChange={(e) => setIsGroup(e.target.checked)}
                className="mr-2"
              />
              <label>Is Group Goal</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={autoSave}
                onChange={(e) => setAutoSave(e.target.checked)}
                className="mr-2"
              />
              <label>Auto Save</label>
            </div>
            <input
              type="text"
              placeholder="Frequency (daily, weekly, monthly)"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="p-2 border rounded"
            />
            <button onClick={createSavingsGoal} className="p-2 bg-blue-500 text-white rounded">
              Create Goal
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Routes Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {sampleRoutes.map((route) => (
          <Card 
            key={route.id}
            className={`cursor-pointer transition-all ${
              selectedRoute?.id === route.id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setSelectedRoute(route)}
          >
            <CardHeader>
              <CardTitle>{route.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center mb-2">
                <Calendar className="mr-2" size={16} />
                <span>{route.duration}</span>
              </div>
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Attractions:</h3>
                <ul className="list-disc list-inside">
                  {route.attractions.map((attraction, index) => (
                    <li key={index}>{attraction}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Lodging Options:</h3>
                <ul className="list-disc list-inside">
                  {route.lodging.map((lodge, index) => (
                    <li key={index}>{lodge}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bulletin Board Preview */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2" />
            Travel Companions Board
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <Shield className="w-4 h-4" />
            <AlertTitle>Verified Users Only</AlertTitle>
            <AlertDescription>
              All users are verified for your safety. Complete your profile to connect with fellow travelers.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Lodging Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Hotel className="mr-2" />
            Available Lodging
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Select a route to see available lodging options along your journey.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoadTripPlanner;
