import React, { useState } from 'react';
import { CreditCard, DollarSign, Users, Receipt, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const PaymentSystem = ({ tripData, currentUser }) => {
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [expenseItems, setExpenseItems] = useState([]);
  const [showAddExpense, setShowAddExpense] = useState(false);
  
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    splitType: 'equal',
    paidBy: currentUser?.id
  });

  // Payment Methods UI
  const PaymentMethodSelection = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCard className="mr-2" />
          Payment Method
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            onClick={() => setPaymentMethod('card')}
            className={`p-4 border rounded cursor-pointer hover:border-blue-500 ${
              paymentMethod === 'card' ? 'border-blue-500 bg-blue-50' : ''
            }`}
          >
            <div className="flex items-center space-x-3">
              <CreditCard />
              <div>
                <h3 className="font-semibold">Credit/Debit Card</h3>
                <p className="text-sm text-gray-600">Secure payment via Stripe</p>
              </div>
            </div>
          </div>

          <div
            onClick={() => setPaymentMethod('split')}
            className={`p-4 border rounded cursor-pointer hover:border-blue-500 ${
              paymentMethod === 'split' ? 'border-blue-500 bg-blue-50' : ''
            }`}
          >
            <div className="flex items-center space-x-3">
              <Users />
              <div>
                <h3 className="font-semibold">Split Payment</h3>
                <p className="text-sm text-gray-600">Share expenses with group</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Expense Tracking UI
  const ExpenseTracker = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Receipt className="mr-2" />
            Expense Tracker
          </div>
          <button
            onClick={() => setShowAddExpense(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded text-sm"
          >
            Add Expense
          </button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {expenseItems.length > 0 ? (
          <div className="space-y-4">
            {expenseItems.map((expense, index) => (
              <div key={index} className="flex justify-between items-center p-3 border rounded">
                <div>
                  <h4 className="font-semibold">{expense.description}</h4>
                  <p className="text-sm text-gray-600">
                    Paid by: {expense.paidBy === currentUser?.id ? 'You' : 'Other'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${expense.amount}</p>
                  <p className="text-sm text-gray-600">{expense.splitType} split</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-600">No expenses added yet</p>
        )}

        {showAddExpense && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Add New Expense</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Description"
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                    className="w-full p-2 border rounded"
                  />
                  <input
                    type="number"
                    placeholder="Amount"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                    className="w-full p-2 border rounded"
                  />
                  <select
                    value={newExpense.splitType}
                    onChange={(e) => setNewExpense({...newExpense, splitType: e.target.value})}
                    className="w-full p-2 border rounded"
                  >
                    <option value="equal">Split Equally</option>
                    <option value="percentage">Split by Percentage</option>
                    <option value="custom">Custom Split</option>
                  </select>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setExpenseItems([...expenseItems, newExpense]);
                        setShowAddExpense(false);
                        setNewExpense({
                          description: '',
                          amount: '',
                          splitType: 'equal',
                          paidBy: currentUser?.id
                        });
                      }}
                      className="bg-blue-500 text-white px-4 py-2 rounded"
                    >
                      Add Expense
                    </button>
                    <button
                      onClick={() => setShowAddExpense(false)}
                      className="border border-gray-300 px-4 py-2 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );

  // Payment Summary UI
  const PaymentSummary = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <DollarSign className="mr-2" />
          Payment Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between p-2 bg-gray-50 rounded">
            <span>Total Trip Cost</span>
            <span className="font-semibold">
              ${expenseItems.reduce((sum, item) => sum + Number(item.amount), 0)}
            </span>
          </div>
          <div className="flex justify-between p-2 bg-gray-50 rounded">
            <span>Your Share</span>
            <span className="font-semibold">
              ${(expenseItems.reduce((sum, item) => sum + Number(item.amount), 0) / tripData?.participants?.length || 1).toFixed(2)}
            </span>
          </div>
          
          <Alert>
            <AlertCircle className="w-4 h-4" />
            <AlertTitle>Secure Payments</AlertTitle>
            <AlertDescription>
              All payments are processed securely through our payment provider. Your financial information is never stored on our servers.
            </AlertDescription>
          </Alert>

          <button
            onClick={() => {/* Implement payment processing */}}
            className="w-full bg-blue-500 text-white p-3 rounded font-semibold hover:bg-blue-600"
          >
            Process Payment
          </button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <PaymentMethodSelection />
      <ExpenseTracker />
      <PaymentSummary />
    </div>
  );
};

export default PaymentSystem;
