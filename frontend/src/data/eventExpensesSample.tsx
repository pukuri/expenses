import type { EventExpense } from '@/types';

export const eventExpensesSample: EventExpense[] = [
  // Event 1: Saturday Date Night
  {
    id: 1,
    eventId: 1,
    amount: 450000,
    description: "Dinner at fancy restaurant"
  },
  {
    id: 2,
    eventId: 1,
    amount: 300000,
    description: "Movie tickets and popcorn"
  },
  {
    id: 3,
    eventId: 1,
    amount: 100000,
    description: "Parking fee"
  },
  // Event 2: Weekend Groceries
  {
    id: 4,
    eventId: 2,
    amount: 320000,
    description: "Supermarket - fresh produce and dairy"
  },
  {
    id: 5,
    eventId: 2,
    amount: 150000,
    description: "Meat from butcher shop"
  },
  {
    id: 6,
    eventId: 2,
    amount: 50000,
    description: "Bakery - fresh bread"
  },
  // Event 3: Birthday Party
  {
    id: 7,
    eventId: 3,
    amount: 600000,
    description: "Birthday cake from premium bakery"
  },
  {
    id: 8,
    eventId: 3,
    amount: 350000,
    description: "Party decorations and balloons"
  },
  {
    id: 9,
    eventId: 3,
    amount: 200000,
    description: "Gift for mom"
  },
  {
    id: 10,
    eventId: 3,
    amount: 100000,
    description: "Extra food and drinks"
  },
  // Event 4: Car Maintenance
  {
    id: 11,
    eventId: 4,
    amount: 400000,
    description: "Oil change and filter replacement"
  },
  {
    id: 12,
    eventId: 4,
    amount: 250000,
    description: "Tire rotation and balancing"
  },
  {
    id: 13,
    eventId: 4,
    amount: 100000,
    description: "Car wash and interior cleaning"
  }
];

// Helper function to get expenses by event ID
export const getEventExpensesByEventId = (eventId: number): EventExpense[] => {
  return eventExpensesSample.filter(expense => expense.eventId === eventId);
};