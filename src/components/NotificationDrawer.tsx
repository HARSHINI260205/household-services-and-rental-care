import React from 'react';
import { NotificationItem } from '../types';
import { Bell, CheckCheck, X, Wrench, Calendar, DollarSign, Shield } from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllAsRead: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Notifications</h3>
                <span className="text-[11px] text-slate-500">Live booking & lease events</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onMarkAllAsRead}
                className="text-xs font-semibold text-amber-700 hover:text-amber-800 p-1 flex items-center gap-1"
                title="Mark all as read"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Mark Read</span>
              </button>
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 text-xs">
            {notifications.map(item => (
              <div
                key={item.id}
                className={`p-3.5 rounded-xl transition-colors ${
                  item.read ? 'bg-white opacity-80' : 'bg-amber-50/40 font-medium'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-1.5 rounded-md bg-slate-100 text-slate-700 shrink-0">
                    {item.type === 'BOOKING' && <Calendar className="w-3.5 h-3.5 text-blue-600" />}
                    {item.type === 'RENTAL' && <Wrench className="w-3.5 h-3.5 text-amber-600" />}
                    {item.type === 'PAYMENT' && <DollarSign className="w-3.5 h-3.5 text-emerald-600" />}
                    {item.type === 'ADMIN' && <Shield className="w-3.5 h-3.5 text-purple-600" />}
                    {item.type === 'SYSTEM' && <Bell className="w-3.5 h-3.5 text-slate-600" />}
                  </div>

                  <div className="space-y-0.5 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{item.title}</span>
                      <span className="text-[10px] text-slate-400 font-normal">{item.timestamp}</span>
                    </div>
                    <p className="text-slate-600 text-xs leading-relaxed">{item.message}</p>
                  </div>
                </div>
              </div>
            ))}

            {notifications.length === 0 && (
              <div className="p-8 text-center text-slate-400">
                No new notifications.
              </div>
            )}
          </div>

          {/* Footer note */}
          <div className="p-4 border-t border-slate-100 bg-slate-50 text-[11px] text-slate-500 text-center">
            Craft & Care automated event dispatch
          </div>

        </div>
      </div>
    </div>
  );
};
