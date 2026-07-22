'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { userService } from '@/lib/api-services';
import Button from '@/app/components/Button';
import Toast from '@/app/components/Toast';

type Theme = 'light' | 'dark' | 'system';
type TextSize = 'small' | 'medium' | 'large';

// ── Segmented control ─────────────────────────────────────────────────────────

function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string; icon?: React.ReactNode }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-2 p-1 bg-[#F3EEF8] dark:bg-[#252830] rounded-2xl">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              active
                ? 'bg-white dark:bg-[#181A1F] text-[#870BD6] shadow-sm'
                : 'text-[#60666B] dark:text-[#9CA3AF] hover:text-[#180426] dark:hover:text-white'
            }`}
          >
            {opt.icon}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// ── Toggle switch ─────────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer flex-shrink-0 ${
        checked ? 'bg-[#870BD6]' : 'bg-[#D2D9DF]'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="py-5 border-b border-[#E3E8EF] dark:border-[#2D313A] last:border-0">
      <div className="mb-3">
        <p className="text-[15px] font-semibold text-[#180426] dark:text-white">{title}</p>
        {description && <p className="text-sm text-[#60666B] dark:text-[#9CA3AF] mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

const DisplayPreference = ({
  setShowSelectedTab,
}: {
  setShowSelectedTab: (val: boolean) => void;
}) => {
  const { user, refreshUser } = useAuth();
  const [theme, setTheme] = useState<Theme>('system');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('07:00');
  const [textSize, setTextSize] = useState<TextSize>('medium');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (user?.preferences) {
      setTheme((user.preferences.theme as Theme) ?? 'system');
      if (user.preferences.prayerReminderTime) {
        setReminderEnabled(true);
        setReminderTime(user.preferences.prayerReminderTime);
      } else {
        setReminderEnabled(false);
      }
      setTextSize((user.preferences.textSize as TextSize) ?? 'medium');
    }
  }, [user?.preferences]);

  const applyThemeLocally = (t: Theme) => {
    const html = document.documentElement;
    if (t === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      html.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      html.setAttribute('data-theme', t);
    }
  };

  const applyTextSizeLocally = (size: TextSize) => {
    const scale = size === 'small' ? '0.875' : size === 'large' ? '1.125' : '1';
    document.documentElement.style.setProperty('--breed-text-scale', scale);
  };

  const handleThemeChange = (t: Theme) => {
    setTheme(t);
    applyThemeLocally(t);
  };

  const handleTextSizeChange = (size: TextSize) => {
    setTextSize(size);
    applyTextSizeLocally(size);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await userService.updatePreferences({
        theme,
        prayerReminderTime: reminderEnabled ? reminderTime : null,
        textSize,
      });
      await refreshUser();
      setToast({ message: 'Preferences saved!', type: 'success' });
    } catch {
      setToast({ message: 'Failed to save. Please try again.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}

      <ArrowLeft
        className="lg:hidden mb-4 cursor-pointer"
        stroke="#60666B"
        onClick={() => setShowSelectedTab(false)}
      />

      <h2 className="text-2xl font-bold mb-1">Display & Preferences</h2>
      <p className="text-sm text-[#60666B] dark:text-[#9CA3AF] mb-6">Customise your app appearance and experience.</p>

      <div className="w-full">
        {/* Theme */}
        <Section
          title="Theme"
          description="Choose how Breed looks on your device."
        >
          <SegmentedControl<Theme>
            value={theme}
            onChange={handleThemeChange}
            options={[
              {
                value: 'light',
                label: 'Light',
                icon: (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/>
                    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
                    <line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/>
                    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
                  </svg>
                ),
              },
              {
                value: 'dark',
                label: 'Dark',
                icon: (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"/>
                  </svg>
                ),
              },
              {
                value: 'system',
                label: 'System',
                icon: (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
                  </svg>
                ),
              },
            ]}
          />
          <p className="text-xs text-[#9CA3AF] mt-2">
            {theme === 'system'
              ? 'Matches your device setting automatically.'
              : theme === 'dark'
              ? 'Dark theme is always on.'
              : 'Light theme is always on.'}
          </p>
        </Section>

        {/* Daily Prayer Reminder */}
        <Section
          title="Daily Prayer Reminder"
          description="Get a gentle nudge to pray at a time you choose."
        >
          <div className="flex items-center justify-between gap-4 mb-3">
            <span className="text-sm font-medium text-[#180426] dark:text-white">
              {reminderEnabled ? 'Reminder on' : 'Reminder off'}
            </span>
            <Toggle checked={reminderEnabled} onChange={setReminderEnabled} />
          </div>

          {reminderEnabled && (
            <div className="mt-3">
              <label className="block text-xs font-semibold text-[#60666B] dark:text-[#9CA3AF] mb-2">
                Reminder time
              </label>
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="w-full h-11 border border-[#D2D9DF] dark:border-[#2D313A] rounded-xl px-3 text-sm text-[#180426] dark:text-white bg-white dark:bg-[#252830] focus:outline-none focus:border-[#870BD6] focus:ring-2 focus:ring-[#870BD6]/10 cursor-pointer"
              />
              <p className="text-xs text-[#9CA3AF] mt-1.5">
                You will receive a daily push notification at this time.
              </p>
            </div>
          )}
        </Section>

        {/* Text Size */}
        <Section
          title="Text Size"
          description="Adjust the reading text size for devotionals and Buildup content."
        >
          <SegmentedControl<TextSize>
            value={textSize}
            onChange={handleTextSizeChange}
            options={[
              {
                value: 'small',
                label: 'Small',
                icon: <span className="text-[11px] font-bold leading-none">A</span>,
              },
              {
                value: 'medium',
                label: 'Medium',
                icon: <span className="text-[14px] font-bold leading-none">A</span>,
              },
              {
                value: 'large',
                label: 'Large',
                icon: <span className="text-[18px] font-bold leading-none">A</span>,
              },
            ]}
          />
          <div
            className="mt-3 px-4 py-3 bg-[#F3EEF8] dark:bg-[#252830] rounded-xl text-[#180426] dark:text-white"
            style={{ fontSize: `calc(${textSize === 'small' ? '13px' : textSize === 'large' ? '17px' : '15px'})` }}
          >
            <p className="font-medium mb-0.5" style={{ fontFamily: 'var(--font-almarai, serif)' }}>
              For I know the plans I have for you…
            </p>
            <p className="text-[#60666B] dark:text-[#9CA3AF]" style={{ fontSize: 'inherit', lineHeight: '1.6' }}>
              Preview how your reading content will appear.
            </p>
          </div>
        </Section>

        <div className="pt-5">
          <Button
            onClick={handleSave}
            loading={saving}
            disabled={saving}
            customClass="w-full h-[58px] text-white"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </>
  );
};

export default DisplayPreference;
