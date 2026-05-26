'use client';

import { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, Check } from 'lucide-react';
import Button from '@/app/components/Button';
import { authService } from '@/lib/api-services';

const PasswordField = ({
  label,
  name,
  value,
  visible,
  onToggle,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  visible: boolean;
  onToggle: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <div className="relative">
      <input
        type={visible ? 'text' : 'password'}
        name={name}
        value={value}
        onChange={onChange}
        required
        className="w-full border border-[#E2E3E5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#870BD6] focus:ring-2 focus:ring-[#870BD6]/10 pr-11 bg-white"
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
      >
        {visible ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  </div>
);

const Security = ({ setShowSelectedTab }: { setShowSelectedTab: (val: boolean) => void }) => {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [show, setShow] = useState({ current: false, new: false, confirm: false });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmNewPassword) {
      setError('New passwords do not match.');
      return;
    }
    if (form.newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await authService.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
        confirmNewPassword: form.confirmNewPassword,
      });
      setSuccess(true);
      setForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err: unknown) {
      setError((err as Error)?.message ?? 'Failed to change password. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <ArrowLeft className="lg:hidden mb-4 cursor-pointer" stroke="#60666B" onClick={() => setShowSelectedTab(false)} />
      <h2 className="text-2xl font-bold mb-2">Privacy & Security</h2>
      <p className="text-sm text-[#60666B] mb-8">Update your password to keep your account secure.</p>

      <form onSubmit={handleSubmit} className="w-full lg:w-[40%] space-y-5">
        <PasswordField
          label="Current password"
          name="currentPassword"
          value={form.currentPassword}
          visible={show.current}
          onToggle={() => setShow((s) => ({ ...s, current: !s.current }))}
          onChange={handleChange}
        />
        <PasswordField
          label="New password"
          name="newPassword"
          value={form.newPassword}
          visible={show.new}
          onToggle={() => setShow((s) => ({ ...s, new: !s.new }))}
          onChange={handleChange}
        />
        <PasswordField
          label="Confirm new password"
          name="confirmNewPassword"
          value={form.confirmNewPassword}
          visible={show.confirm}
          onToggle={() => setShow((s) => ({ ...s, confirm: !s.confirm }))}
          onChange={handleChange}
        />

        {error && (
          <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
        )}
        {success && (
          <p className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg flex items-center gap-2">
            <Check size={14} /> Password changed successfully.
          </p>
        )}

        <div className="pt-2">
          <Button
            type="submit"
            loading={saving}
            disabled={saving || !form.currentPassword || !form.newPassword || !form.confirmNewPassword}
            customClass="w-full h-[58px] text-white"
          >
            Change Password
          </Button>
        </div>
      </form>
    </>
  );
};

export default Security;
