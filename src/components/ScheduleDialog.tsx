import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { CalendarIcon } from 'lucide-react';
import type { Flight, Aircraft, Instructor } from '../App';

interface ScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSchedule: (flight: Flight) => void;
  aircraft: Aircraft[];
  instructors: Instructor[];
  existingFlights: Flight[];
  preselectedDate?: Date;
  preselectedTime?: string;
  preselectedEndTime?: string;
  preselectedAircraft?: string;
  preselectedInstructor?: string;
  filteredAircraftIds?: string[];
  filteredInstructorIds?: string[];
}

export function ScheduleDialog({ 
  open, 
  onOpenChange, 
  onSchedule, 
  aircraft, 
  instructors,
  existingFlights,
  preselectedDate,
  preselectedTime,
  preselectedEndTime,
  preselectedAircraft,
  preselectedInstructor,
  filteredAircraftIds = [],
  filteredInstructorIds = []
}: ScheduleDialogProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedAircraft, setSelectedAircraft] = useState<string>('');
  const [selectedInstructor, setSelectedInstructor] = useState<string>('');
  const [flightCategory, setFlightCategory] = useState<string>('standard');

  const startTime = preselectedTime || '09:00';
  const endTime = preselectedEndTime || '11:00';

  // Calculate duration from start and end times
  const calculateDuration = (start: string, end: string) => {
    const [startHours, startMinutes] = start.split(':').map(Number);
    const [endHours, endMinutes] = end.split(':').map(Number);
    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;
    const durationMinutes = endTotalMinutes - startTotalMinutes;
    return (durationMinutes / 60).toFixed(1);
  };

  const duration = calculateDuration(startTime, endTime);

  // Format time for display (e.g., "09:00" -> "9:00 AM")
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
  };

  // Update date when preselected
  useEffect(() => {
    if (preselectedDate) {
      setDate(preselectedDate);
    }
  }, [preselectedDate]);

  // Auto-select aircraft if preselected
  useEffect(() => {
    if (preselectedAircraft && open) {
      setSelectedAircraft(preselectedAircraft);
    }
  }, [preselectedAircraft, open]);

  // Auto-select instructor if preselected
  useEffect(() => {
    if (preselectedInstructor && open) {
      setSelectedInstructor(preselectedInstructor);
    }
  }, [preselectedInstructor, open]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setSelectedAircraft('');
      setSelectedInstructor('');
      setFlightCategory('standard');
    }
  }, [open]);

  const handleSchedule = () => {
    if (!date || !selectedAircraft || !selectedInstructor) {
      alert('Please fill in all required fields');
      return;
    }

    const newFlight: Flight = {
      id: Date.now().toString(),
      date,
      startTime,
      endTime,
      aircraft: selectedAircraft,
      instructor: selectedInstructor,
      student: 'You',
      type: 'dual',
      status: 'scheduled',
      flightCategory: flightCategory as any,
    };

    onSchedule(newFlight);
  };

  // Determine if we're selecting aircraft or instructor
  const isSelectingInstructor = preselectedAircraft !== undefined;
  const isSelectingAircraft = preselectedInstructor !== undefined;
  
  // Check if this is from filtered availability view (simplified mode)
  // When booking from filtered view, we have: aircraft + time + instructors all preselected
  const isFromFilteredView = preselectedAircraft !== undefined && 
                              preselectedTime !== undefined && 
                              preselectedEndTime !== undefined &&
                              filteredInstructorIds.length > 0;

  // Get available instructors (filtered by time availability)
  const availableInstructors = isFromFilteredView
    ? instructors.filter(i => filteredInstructorIds.includes(i.id))
    : filteredInstructorIds.length > 0
    ? instructors.filter(i => filteredInstructorIds.includes(i.id))
    : instructors.filter(i => i.available);

  // Get available aircraft (filtered by time availability)
  // Note: In filtered view mode, aircraft is preselected so we don't need this check
  const availableAircraft = isFromFilteredView
    ? aircraft.filter(a => a.registration === preselectedAircraft)
    : filteredAircraftIds.length > 0
    ? aircraft.filter(a => filteredAircraftIds.includes(a.registration))
    : aircraft.filter(a => a.available);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col" aria-describedby="schedule-dialog-description">
        <DialogHeader>
          <DialogTitle>Schedule a Flight</DialogTitle>
          <DialogDescription id="schedule-dialog-description">
            Book your flight training session
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 px-1">
          <div className="space-y-6 py-4">
            {/* Blue info box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-900">Selected Time Block:</span>
                  <span className="text-sm font-semibold text-blue-700">
                    {formatTime(startTime)} - {formatTime(endTime)}
                  </span>
                </div>
                {preselectedAircraft && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-900">Selected Aircraft:</span>
                    <span className="text-sm font-semibold text-blue-700">
                      {preselectedAircraft}
                    </span>
                  </div>
                )}
                {isFromFilteredView && availableInstructors.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-blue-900">Available Instructors:</span>
                    <div className="mt-1 text-sm text-blue-700">
                      {availableInstructors.map(i => i.name).join(', ')}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Flight Category */}
            <div className="space-y-2">
              <Label>Flight Category</Label>
              <Select value={flightCategory} onValueChange={setFlightCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="h6-operations">H6 Operations</SelectItem>
                  <SelectItem value="new-student">New Students</SelectItem>
                  <SelectItem value="photo-flight">Photo Flight</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="unavailable">Temporarily Unavailable</SelectItem>
                  <SelectItem value="ground-instruction">Ground Instruction</SelectItem>
                  <SelectItem value="aircraft-checkout">Aircraft Checkout</SelectItem>
                  <SelectItem value="down-time">Down Time</SelectItem>
                  <SelectItem value="in-office">In Office</SelectItem>
                  <SelectItem value="checkride-category">Checkride</SelectItem>
                  <SelectItem value="groundschool">Groundschool</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="bfr">BFR</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="spin-training">Spin Training</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? date.toLocaleDateString() : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Start Time, End Time, Duration - Display Only */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <div className="border rounded-md px-3 py-2 bg-gray-50">
                  {formatTime(startTime)}
                </div>
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <div className="border rounded-md px-3 py-2 bg-gray-50">
                  {formatTime(endTime)}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Duration</Label>
                <div className="border rounded-md px-3 py-2 bg-gray-50">
                  {duration} hours
                </div>
              </div>
            </div>

            {/* Instructor or Aircraft Selector */}
            {/* In filtered view mode, ONLY show instructor selector */}
            {isFromFilteredView && (
              <div className="space-y-2">
                <Label>Available Instructors</Label>
                <Select value={selectedInstructor} onValueChange={setSelectedInstructor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an instructor" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableInstructors.map(i => (
                      <SelectItem key={i.id} value={i.name}>
                        {i.name} - {i.certifications.join(', ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {availableInstructors.length === 0 && (
                  <p className="text-sm text-amber-600">No instructors currently available</p>
                )}
              </div>
            )}

            {/* Normal mode: show instructor or aircraft selector based on what's preselected */}
            {!isFromFilteredView && isSelectingInstructor && (
              <div className="space-y-2">
                <Label>Available Instructors</Label>
                <Select value={selectedInstructor} onValueChange={setSelectedInstructor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an instructor" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableInstructors.map(i => (
                      <SelectItem key={i.id} value={i.name}>
                        {i.name} - {i.certifications.join(', ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {availableInstructors.length === 0 && (
                  <p className="text-sm text-amber-600">No instructors currently available</p>
                )}
              </div>
            )}

            {!isFromFilteredView && isSelectingAircraft && (
              <div className="space-y-2">
                <Label>Available Aircrafts</Label>
                <Select value={selectedAircraft} onValueChange={setSelectedAircraft}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an aircraft" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableAircraft.map(a => (
                      <SelectItem key={a.id} value={a.registration}>
                        {a.registration} - {a.type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {availableAircraft.length === 0 && (
                  <p className="text-sm text-amber-600">No aircraft currently available</p>
                )}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSchedule} className="bg-amber-500 hover:bg-amber-600">
            Schedule Flight
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}