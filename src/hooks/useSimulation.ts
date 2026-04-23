import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';

export type EventType = 'Deposit' | 'Withdrawal' | 'Rebalancing';

export interface AppEvent {
  id: string;
  type: EventType;
  amount?: number;
  apy?: number;
  timestamp: string;
  status: 'Completed' | 'Processing';
  protocol?: string;
}

export interface ChartData {
  time: string;
  balance: number;
}

export function useSimulation() {
  const [isRunning, setIsRunning] = useState(false);
  const [balance, setBalance] = useState(10000);
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([
    { time: new Date().toLocaleTimeString(), balance: 10000 }
  ]);
  const [totalYield, setTotalYield] = useState(0);

  const currentBalance = useRef(balance);
  const currentEvents = useRef(events);
  
  useEffect(() => {
    currentBalance.current = balance;
    currentEvents.current = events;
  }, [balance, events]);

  const addEvent = useCallback((event: Omit<AppEvent, 'id' | 'timestamp'>) => {
    const newEvent: AppEvent = {
      ...event,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString(),
    };
    
    setEvents(prev => [newEvent, ...prev].slice(0, 50));

    // Show toast for important events
    if (event.type === 'Deposit') {
      toast.success(`Deposit Detected`, {
        description: `Successfully deposited $${event.amount?.toFixed(2)}`,
      });
    } else if (event.type === 'Withdrawal') {
      toast.info(`Withdrawal Requested`, {
        description: `Withdrew $${event.amount?.toFixed(2)} to your wallet`,
      });
    } else if (event.type === 'Rebalancing') {
      toast('Agent Rebalancing', {
        description: `Funds moved to ${event.protocol} for ${event.apy}% APY`,
        icon: '🤖',
      });
    }
  }, []);

  const start = () => setIsRunning(true);
  const stop = () => setIsRunning(false);
  const reset = () => {
    setIsRunning(false);
    setBalance(10000);
    setTotalYield(0);
    setEvents([]);
    setChartData([{ time: new Date().toLocaleTimeString(), balance: 10000 }]);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning) {
      interval = setInterval(() => {
        // Decide what happens every 3 seconds
        const rand = Math.random();
        
        let newBalance = currentBalance.current;
        
        if (rand < 0.2) {
          // 20% chance of deposit
          const amount = Math.floor(Math.random() * 900) + 100;
          newBalance += amount;
          addEvent({ type: 'Deposit', amount, status: 'Completed' });
        } else if (rand < 0.3) {
          // 10% chance of withdrawal
          const amount = Math.floor(Math.random() * 500) + 50;
          if (newBalance >= amount) {
            newBalance -= amount;
            addEvent({ type: 'Withdrawal', amount, status: 'Completed' });
          }
        } else if (rand < 0.45) {
          // 15% chance of rebalancing
          const protocols = ['Blend Lending', 'Stellar DEX', 'Aquarius'];
          const newApy = (Math.random() * 8 + 4).toFixed(1); // 4% to 12%
          addEvent({ 
            type: 'Rebalancing', 
            status: 'Completed',
            protocol: protocols[Math.floor(Math.random() * protocols.length)],
            apy: parseFloat(newApy)
          });
        }
        
        // Every tick, small yield growth
        const yieldAmount = currentBalance.current * 0.0001;
        newBalance += yieldAmount;
        setTotalYield(prev => prev + yieldAmount);
        
        setBalance(newBalance);
        setChartData(prev => {
          const updated = [...prev, { time: new Date().toLocaleTimeString(), balance: parseFloat(newBalance.toFixed(2)) }];
          return updated.length > 20 ? updated.slice(updated.length - 20) : updated;
        });
        
      }, 3000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, addEvent]);

  return {
    isRunning,
    balance,
    events,
    chartData,
    totalYield,
    start,
    stop,
    reset
  };
}
