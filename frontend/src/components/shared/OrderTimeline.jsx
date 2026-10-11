import React from 'react';
import { Check, Clock, Package, Truck, CheckCircle2, AlertOctagon } from 'lucide-react';
import { cn } from '@/utils/cn';

const STEPS = [
  { key: 'PENDING', label: 'Order Registered', description: 'Payment recorded & queued for binding', icon: Clock },
  { key: 'CONFIRMED', label: 'Curated & Bound', description: 'Folios hand-checked and packaged', icon: Package },
  { key: 'SHIPPED', label: 'Dispatched via Courier', description: 'In transit with tracked postal dispatch', icon: Truck },
  { key: 'DELIVERED', label: 'Arrived at Desk', description: 'Safely delivered to reader destination', icon: CheckCircle2 },
];

const STATUS_ORDER = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];

export default function OrderTimeline({ status, createdAt, className }) {
  if (status === 'CANCELLED') {
    return (
      <div className={cn('p-4 bg-red-50 border border-red-200 rounded text-red-900 flex items-center gap-3', className)}>
        <AlertOctagon className="w-5 h-5 text-red-600 shrink-0" />
        <div>
          <h4 className="text-xs uppercase tracking-wide-label font-bold text-red-800">Dispatch Order Voided</h4>
          <p className="text-xs text-red-700 mt-0.5">This acquisition was cancelled and inventory was returned to the shelves.</p>
        </div>
      </div>
    );
  }

  const currentIndex = STATUS_ORDER.indexOf(status);

  return (
    <div className={cn('py-4 font-sans', className)}>
      <div className="relative">
        {/* Connecting line for desktop */}
        <div className="hidden sm:block absolute top-5 left-6 right-6 h-0.5 bg-paper-border -z-0" />

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 sm:gap-4 relative z-10">
          {STEPS.map((step, idx) => {
            const isCompleted = currentIndex > idx;
            const isCurrent = currentIndex === idx;
            const isUpcoming = currentIndex < idx;
            const Icon = step.icon;

            return (
              <div key={step.key} className="flex sm:flex-col items-start sm:items-center text-left sm:text-center gap-3 sm:gap-2">
                {/* Node icon circle */}
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors',
                    isCompleted && 'bg-forest text-paper-light border-forest',
                    isCurrent && 'bg-paper-light text-terracotta border-terracotta ring-4 ring-terracotta/20',
                    isUpcoming && 'bg-paper-light text-ink-subtle border-paper-border'
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5 stroke-[2.5]" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>

                {/* Content */}
                <div>
                  <h4
                    className={cn(
                      'text-xs uppercase tracking-wide-label font-bold',
                      isCurrent ? 'text-terracotta' : isCompleted ? 'text-ink' : 'text-ink-subtle'
                    )}
                  >
                    {step.label}
                  </h4>
                  <p className="text-[11px] text-ink-muted leading-tight mt-0.5 max-w-[170px] sm:mx-auto">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
