
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { CalendarEvent, EventType, ProcessingState } from './types';
import { parseEventsFromTranscript } from './services/geminiService';
import Calendar from './components/Calendar';
import { 
  Mic, 
  Calendar as CalendarIcon, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Download,
  X,
  MessageSquare,
  Clock,
  Bell,
  UserPlus,
  Users
} from 'lucide-react';

const DEFAULT_TRANSCRIPT = `Um, hi. Thank you again so much for agreeing to help me sort out my calendar for the next month... So, uh, in July, I actually have, um, holiday planned in July from, uh, July 20th until, uh, July 25th... And then on the 28th of July, I have a huge meeting at 3:00 PM... Um, on the 4th of July, that is a holiday... On the 12th and the 16th, I have a huge, huge meeting with Sarah. From Amazon... at 12 noon... Also on the 16th at um, 9:00 AM I actually have a dentist appointment... On the 1st of July... I have a eye appointment... at 4:00 PM... On the 11th of July. We have the company, uh, the company party... 7:00 PM at the Hilton Hotel downtown... Can you just add a reminder before my holiday that I need to, um, book the hotel and book the flights the week before...`;

const TASK_INSTRUCTIONS = `a. Open your Google Calendar and switch to the Month view.
b. Create a new event scheduled on the second Thursday of the current month, then set it to repeat monthly on the same weekday and position (third Wednesday).
c. Adjust the recurrence settings so the event automatically ends after four occurrences.
d. Title the event “Team Meeting” and select the correct time slot.
e. Set the event duration to 30 minutes, ensuring the start and end times are accurate.
f. In the event description, insert a bullet-point agenda that includes: Introduction, Last Meeting’s Minutes, New Business, Additional Updates, Open Discussion.
g. Change the event color to purple.
h. Add two notifications: One email reminder 24 hours before the event, One notification 10 minutes before the event.`;

const App: React.FC = () => {
  const [inputText, setInputText] = useState(DEFAULT_TRANSCRIPT);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [processing, setProcessing] = useState<ProcessingState>({ status: 'IDLE' });
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [activeTab, setActiveTab] = useState<'VOICE' | 'TASK'>('VOICE');
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [viewYear, setViewYear] = useState(new Date().getFullYear());

  const handleProcess = useCallback(async (textOverride?: string) => {
    const textToProcess = textOverride || inputText;
    if (!textToProcess.trim()) return;

    setProcessing({ status: 'PROCESSING' });
    try {
      const result = await parseEventsFromTranscript(textToProcess, activeTab === 'TASK');
      setEvents(prev => [...prev, ...result]);
      
      // If result has dates, move view to first event's month
      if (result.length > 0) {
        const firstDate = new Date(result[0].startDate);
        setViewMonth(firstDate.getMonth());
        setViewYear(firstDate.getFullYear());
      }
      
      setProcessing({ status: 'SUCCESS' });
    } catch (error) {
      setProcessing({ 
        status: 'ERROR', 
        message: "Failed to process transcript. Please check your API Key and try again." 
      });
    }
  }, [inputText, activeTab]);

  const handleDownload = async () => {
    // @ts-ignore
    if (typeof window.html2canvas !== 'undefined') {
        const element = document.body; // Full screen as requested
        try {
            // @ts-ignore
            const canvas = await window.html2canvas(element, { 
              scale: 2,
              useCORS: true,
              backgroundColor: '#f3f4f6'
            });
            const link = document.createElement('a');
            const firstName = "Calendar"; 
            const lastName = "Assistant";
            link.download = `Calendar-${firstName}-${lastName}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (e) {
            alert("Error creating screenshot");
        }
    } else {
        alert("Screenshot library not loaded.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-200">
              <CalendarIcon size={24} />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-800">Gemini PA</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Intelligent Organizer</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex gap-4">
               <button 
                onClick={() => { setActiveTab('VOICE'); setInputText(DEFAULT_TRANSCRIPT); }}
                className={`text-sm font-semibold transition-colors ${activeTab === 'VOICE' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
               >
                 Voice Transcripts
               </button>
               <button 
                onClick={() => { setActiveTab('TASK'); setInputText(TASK_INSTRUCTIONS); }}
                className={`text-sm font-semibold transition-colors ${activeTab === 'TASK' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
               >
                 Communication Tasks
               </button>
            </div>
            <button 
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-all font-bold text-xs"
            >
              <Download size={14} />
              SAVE SCREENSHOT
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Inputs */}
        <div className="lg:col-span-4 space-y-6">
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                {activeTab === 'VOICE' ? <Mic size={16} className="text-indigo-500" /> : <MessageSquare size={16} className="text-indigo-500" />}
                {activeTab === 'VOICE' ? 'Input Transcript' : 'Task Instructions'}
              </h2>
            </div>
            <div className="p-5">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full h-64 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm leading-relaxed text-slate-600 resize-none font-medium"
                placeholder={activeTab === 'VOICE' ? "Paste voice transcript..." : "Paste task instructions..."}
              />
              <button
                onClick={() => handleProcess()}
                disabled={processing.status === 'PROCESSING'}
                className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-white shadow-xl shadow-indigo-200 bg-indigo-600 hover:bg-indigo-700 transition-all disabled:opacity-50"
              >
                {processing.status === 'PROCESSING' ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                {processing.status === 'PROCESSING' ? 'Analyzing...' : `Generate ${activeTab === 'TASK' ? 'Recurring Series' : 'Schedule'}`}
              </button>
              
              {processing.status === 'ERROR' && (
                <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl flex items-start gap-3 text-xs font-semibold">
                  <AlertCircle size={16} className="shrink-0" />
                  {processing.message}
                </div>
              )}
            </div>
          </section>

          {/* Stats/Legend */}
          <section className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Calendar Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-slate-500">Total Events</span>
                <span className="text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">{events.length}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-slate-500">Next Month</span>
                <span className="text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                  {events.filter(e => new Date(e.startDate).getMonth() === (viewMonth + 1) % 12).length}
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* Right Side: Calendar */}
        <div className="lg:col-span-8 space-y-6">
          <Calendar 
            id="calendar-main-view"
            events={events} 
            month={viewMonth} 
            year={viewYear} 
            onEventClick={setSelectedEvent}
          />
        </div>
      </main>

      {/* Modern Event Modal (mimicking Google Calendar reference) */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100">
            {/* Header / Banner */}
            <div className="h-24 w-full relative" style={{ backgroundColor: selectedEvent.color || '#4f46e5' }}>
              <button 
                onClick={() => setSelectedEvent(null)}
                className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 transition-all"
              >
                <X size={20} />
              </button>
              <div className="absolute -bottom-6 left-8 bg-white p-3 rounded-2xl shadow-xl border border-slate-100">
                <CalendarIcon className="text-indigo-600" size={32} />
              </div>
            </div>

            <div className="p-8 pt-10">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  {selectedEvent.type}
                </span>
                {selectedEvent.isRecurring && (
                   <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-[10px] font-black uppercase tracking-widest text-indigo-500">
                    Recurring Series
                  </span>
                )}
              </div>
              
              <h3 className="text-2xl font-black text-slate-900 leading-tight mb-4">
                {selectedEvent.title}
              </h3>

              <div className="space-y-6">
                {/* Date & Time */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                    <Clock size={20} />
                  </div>
                  <div>
                    <p className="text-slate-900 font-bold">
                      {new Date(selectedEvent.startDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                    <p className="text-slate-500 text-sm font-medium">
                      {selectedEvent.time || 'All Day'} • {selectedEvent.duration ? `${selectedEvent.duration} minutes` : 'No duration set'}
                    </p>
                  </div>
                </div>

                {/* Guests (Highlighted Request from Screenshot) */}
                <div className="flex items-start gap-4 p-4 rounded-2xl border-2 border-dashed border-slate-200 hover:border-indigo-300 transition-colors cursor-pointer group">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-indigo-500 transition-colors">
                    <UserPlus size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-900 font-bold">Add guests</p>
                    {selectedEvent.guests && selectedEvent.guests.length > 0 ? (
                      <div className="flex -space-x-2 mt-2">
                        {selectedEvent.guests.map((g, i) => (
                          <div key={i} title={g} className="w-8 h-8 rounded-full border-2 border-white bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-700">
                            {g.charAt(0).toUpperCase()}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-400 text-sm font-medium">Invite colleagues or clients</p>
                    )}
                  </div>
                </div>

                {/* Agenda / Description */}
                {selectedEvent.description && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                      <MessageSquare size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="text-slate-900 font-bold mb-2">Agenda</p>
                      <div className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                        {selectedEvent.description}
                      </div>
                    </div>
                  </div>
                )}

                {/* Notifications */}
                {selectedEvent.notifications && selectedEvent.notifications.length > 0 && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                      <Bell size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="text-slate-900 font-bold mb-2">Reminders</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedEvent.notifications.map((n, i) => (
                          <span key={i} className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-[10px] font-bold flex items-center gap-1 border border-amber-100">
                            <Clock size={10} />
                            {n.timeBefore >= 1440 ? `${n.timeBefore / 1440} day(s)` : `${n.timeBefore} mins`} before
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 bg-slate-50 flex justify-end gap-3">
              <button 
                onClick={() => setSelectedEvent(null)}
                className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Close
              </button>
              <button 
                className="px-6 py-2.5 bg-indigo-600 rounded-xl text-sm font-bold text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
