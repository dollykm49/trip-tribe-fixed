import React, { useState } from 'react';
import { 
  PiggyBank, Target, TrendingUp, DollarSign, 
  Calendar, Users, AlertCircle, Calculator 
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

const SavingsBudgetTools = ({ currentUser }) => {
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [showNewGoal, setShowNewGoal] = useState(false);
  
  // Savings Goal Creator
  const SavingsGoalCreator = () => {
    const [goalData, setGoalData] = useState({
      name: '',
      targetAmount: '',
      deadline: '',
      isGroup: false,
      participants: [],
      autoSave: false,
      frequency: 'weekly'
    });

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Create Savings Goal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Goal Name"
                value={goalData.name}
                onChange={(e) => setGoalData({...goalData, name: e.target.value})}
                className="w-full p-2 border rounded"
              />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1">Target Amount</label>
                  <input
                    type="number"
                    value={goalData.targetAmount}
                    onChange={(e) => setGoalData({...goalData, targetAmount: e.target.value})}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Deadline</label>
                  <input
                    type="date"
                    value={goalData.deadline}
                    onChange={(e) => setGoalData({...goalData, deadline: e.target.value})}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={goalData.isGroup}
                  onChange={(e) => setGoalData({...goalData, isGroup: e.target.checked})}
                />
                <label>Group Savings Goal</label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={goalData.autoSave}
                  onChange={(e) => setGoalData({...goalData, autoSave: e.target.checked})}
                />
                <label>Enable Auto-Save</label>
              </div>

              {goalData.autoSave && (
                <select
                  value={goalData.frequency}
                  onChange={(e) => setGoalData({...goalData, frequency: e.target.value})}
                  className="w-full p-2 border rounded"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              )}

              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setSavingsGoals([...savingsGoals, goalData]);
                    setShowNewGoal(false);
                  }}
                  className="flex-1 bg-blue-500 text-white p-2 rounded"
                >
                  Create Goal
                </button>
                <button
                  onClick={() => setShowNewGoal(false)}
                  className="flex-1 border p-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Budget Analyzer
  const BudgetAnalyzer = () => {
    const [selectedCategory, setSelectedCategory] = useState('all');
    
    const categories = [
      { name: 'Transportation', spent: 450, budget: 500 },
      { name: 'Accommodation', spent: 800, budget: 1000 },
      { name: 'Activities', spent: 300, budget: 400 },
      { name: 'Food', spent: 250, budget: 300 }
    ];

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calculator className="mr-2" />
            Budget Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categories.map((category) => (
              <div key={category.name} className="space-y-2">
                <div className="flex justify-between">
                  <span>{category.name}</span>
                  <span className="font-semibold">
                    ${category.spent} / ${category.budget}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      category.spent > category.budget ? 'bg-red-500' : 'bg-blue-500'
                    }`}
                    style={{
                      width: `${Math.min((category.spent / category.budget) * 100, 100)}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Savings Progress
  const SavingsProgress = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Target className="mr-2" />
          Savings Goals
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {savingsGoals.map((goal, index) => (
            <div key={index} className="border rounded p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold">{goal.name}</h3>
                  <p className="text-sm text-gray-600">
                    Target: ${goal.targetAmount}
                  </p>
                </div>
                {goal.isGroup && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    Group Goal
                  </span>
                )}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className="h-2 rounded-full bg-green-500"
                  style={{ width: '45%' }}
                />
              </div>
              <div className="flex justify-between text-sm">
                <span>$450 saved</span>
                <span>{goal.deadline}</span>
              </div>
            </div>
          ))}
          <button
            onClick={() => setShowNewGoal(true)}
            className="w-full p-2 border rounded hover:bg-gray-50"
          >
            + Add New Goal
          </button>
        </div>
      </CardContent>
    </Card>
  );

  // Smart Recommendations
  const SmartRecommendations = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="mr-2" />
          Smart Savings Tips
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Alert>
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              Based on your spending patterns, you could save an extra $150/month
              by adjusting your daily coffee budget.
            </AlertDescription>
          </Alert>
          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-semibold mb-2">Recommended Auto-Save</h3>
            <p className="text-sm text-gray-600">
              Setting aside $50 weekly would help you reach your next trip goal
              2 months faster.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-2xl mx-auto p-4">
      <BudgetAnalyzer />
      <SavingsProgress />
      <SmartRecommendations />
      {showNewGoal && <SavingsGoalCreator />}
    </div>
  );
};

export default SavingsBudgetTools;
