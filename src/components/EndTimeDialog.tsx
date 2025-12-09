import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';

interface EndTimeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  startTime?: string;
  onConfirm: (endTime: string) => void;
  resourceName?: string;
  resourceType?: 'aircraft' | 'instructor';
}

export function EndTimeDialog({ 
  open, 
  onOpenChange, 
  startTime, 
  onConfirm,
  resourceName,
  resourceType
}: EndTimeDialogProps) {
  const [endTime, setEndTime] = useState('');

  // Generate available end times (at least 30 minutes after start, up to 10:00 PM)
  const generateEndTimes = () => {
    if (!startTime) return [];
    
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const startTotalMinutes = startHours * 60 + startMinutes;
    
    const times = [];
    // Start from 30 minutes after the start time
    for (let minutes = startTotalMinutes + 30; minutes <= 22 * 60; minutes += 30) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      const timeString = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
      times.push(timeString);
    }
    return times;
  };

  const formatTimeDisplay = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
  };

  const handleConfirm = () => {
    if (endTime) {
      onConfirm(endTime);
      setEndTime('');
    }
  };

  const endTimes = generateEndTimes();

  if (!startTime || !resourceName || !resourceType) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl" style={{ fontFamily: 'inherit' }}>Select End Time</DialogTitle>
          <DialogDescription>
            {resourceType === 'aircraft' ? 'Aircraft' : 'Instructor'}: <span className="font-semibold">{resourceName}</span>
            <br />
            Start Time: <span className="font-semibold">{formatTimeDisplay(startTime)}</span>
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="endTime">End Time</Label>
            <select
              id="endTime"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#CFB991] focus:border-transparent"
            >
              <option value="">Select end time...</option>
              {endTimes.map((time) => (
                <option key={time} value={time}>
                  {formatTimeDisplay(time)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setEndTime('');
              onOpenChange(false);
            }}
            className="border-black hover:bg-slate-100"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!endTime}
            className="bg-[#CFB991] hover:bg-[#B8A57E] text-black border-2 border-black disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}