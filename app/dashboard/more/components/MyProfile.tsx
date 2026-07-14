'use client';

import Button from "@/app/components/Button";
import Input from "@/app/components/Input";
import Toast from "@/app/components/Toast";
import { useAuth } from "@/context/AuthContext";
import { userService } from "@/lib/api-services";
import { ArrowLeft, Camera, ChevronDown, Loader2, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useUpload } from "@/app/hooks/useUpload";

type GenderValue = '' | 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';

// ── Country code data ─────────────────────────────────────────────────────────

interface CountryDial { code: string; name: string; dial: string }

const flag = (iso: string) =>
  iso.toUpperCase().split('').map(c => String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65)).join('');

const COUNTRY_DIALS: CountryDial[] = [
  { code: 'NG', name: 'Nigeria',              dial: '+234' },
  { code: 'GH', name: 'Ghana',                dial: '+233' },
  { code: 'KE', name: 'Kenya',                dial: '+254' },
  { code: 'ZA', name: 'South Africa',         dial: '+27'  },
  { code: 'ET', name: 'Ethiopia',             dial: '+251' },
  { code: 'TZ', name: 'Tanzania',             dial: '+255' },
  { code: 'UG', name: 'Uganda',               dial: '+256' },
  { code: 'RW', name: 'Rwanda',               dial: '+250' },
  { code: 'CM', name: 'Cameroon',             dial: '+237' },
  { code: 'SN', name: 'Senegal',              dial: '+221' },
  { code: 'CI', name: "Côte d'Ivoire",        dial: '+225' },
  { code: 'CD', name: 'DR Congo',             dial: '+243' },
  { code: 'ZM', name: 'Zambia',               dial: '+260' },
  { code: 'ZW', name: 'Zimbabwe',             dial: '+263' },
  { code: 'US', name: 'United States',        dial: '+1'   },
  { code: 'CA', name: 'Canada',               dial: '+1'   },
  { code: 'GB', name: 'United Kingdom',       dial: '+44'  },
  { code: 'IE', name: 'Ireland',              dial: '+353' },
  { code: 'AU', name: 'Australia',            dial: '+61'  },
  { code: 'NZ', name: 'New Zealand',          dial: '+64'  },
  { code: 'IN', name: 'India',                dial: '+91'  },
  { code: 'PK', name: 'Pakistan',             dial: '+92'  },
  { code: 'BD', name: 'Bangladesh',           dial: '+880' },
  { code: 'AE', name: 'UAE',                  dial: '+971' },
  { code: 'SA', name: 'Saudi Arabia',         dial: '+966' },
  { code: 'QA', name: 'Qatar',                dial: '+974' },
  { code: 'DE', name: 'Germany',              dial: '+49'  },
  { code: 'FR', name: 'France',               dial: '+33'  },
  { code: 'IT', name: 'Italy',                dial: '+39'  },
  { code: 'ES', name: 'Spain',                dial: '+34'  },
  { code: 'NL', name: 'Netherlands',          dial: '+31'  },
  { code: 'BR', name: 'Brazil',               dial: '+55'  },
  { code: 'MX', name: 'Mexico',               dial: '+52'  },
  { code: 'CN', name: 'China',                dial: '+86'  },
  { code: 'JP', name: 'Japan',                dial: '+81'  },
  { code: 'SG', name: 'Singapore',            dial: '+65'  },
];

function parseStoredPhone(stored: string | undefined): { dial: string; local: string } {
  if (!stored) return { dial: '+234', local: '' };
  // Match longest prefix first to avoid e.g. "+1" matching "+11..."
  const sorted = [...COUNTRY_DIALS].sort((a, b) => b.dial.length - a.dial.length);
  for (const c of sorted) {
    if (stored.startsWith(c.dial)) {
      return { dial: c.dial, local: stored.slice(c.dial.length) };
    }
  }
  return { dial: '+234', local: stored };
}

// ── CountryCodeSelector ───────────────────────────────────────────────────────

function CountryCodeSelector({
  value, onChange, disabled,
}: { value: string; onChange: (dial: string) => void; disabled: boolean }) {
  const [open, setOpen]     = useState(false);
  const [query, setQuery]   = useState('');
  const ref                 = useRef<HTMLDivElement>(null);

  const selected = COUNTRY_DIALS.find(c => c.dial === value) ?? COUNTRY_DIALS[0];
  const filtered = query
    ? COUNTRY_DIALS.filter(c =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.dial.includes(query))
    : COUNTRY_DIALS;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(o => !o)}
        className={`w-full h-[48px] flex items-center gap-1.5 px-3 rounded-[10px] text-sm font-medium transition-colors ${
          disabled
            ? 'bg-[#d9d9d93d] text-[#60666B] cursor-default'
            : 'border border-[#B9C2CA] bg-white text-[#180426] hover:border-[#870BD6] cursor-pointer'
        }`}
      >
        <span className="text-lg leading-none">{flag(selected.code)}</span>
        <span className="flex-1 text-left">{selected.dial}</span>
        {!disabled && <ChevronDown size={14} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />}
      </button>

      {open && (
        <div className="absolute z-50 top-[52px] left-0 w-64 bg-white border border-[#E3E8EF] rounded-2xl shadow-xl overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-[#E3E8EF]">
            <div className="flex items-center gap-2 px-2 py-1.5 bg-gray-50 rounded-xl">
              <Search size={13} className="text-gray-400 shrink-0" />
              <input
                autoFocus
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search country…"
                className="flex-1 text-xs bg-transparent outline-none text-[#180426] placeholder:text-gray-400"
              />
            </div>
          </div>
          {/* List */}
          <ul className="max-h-52 overflow-y-auto py-1">
            {filtered.length === 0 && (
              <li className="px-4 py-3 text-xs text-gray-400 text-center">No results</li>
            )}
            {filtered.map(c => (
              <li key={`${c.code}-${c.dial}`}>
                <button
                  type="button"
                  onClick={() => { onChange(c.dial); setOpen(false); setQuery(''); }}
                  className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-purple-50 transition-colors text-left cursor-pointer ${
                    c.dial === value ? 'bg-purple-50 font-semibold text-[#870BD6]' : 'text-[#180426]'
                  }`}
                >
                  <span className="text-base leading-none">{flag(c.code)}</span>
                  <span className="flex-1 truncate">{c.name}</span>
                  <span className="text-xs text-gray-400 shrink-0">{c.dial}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

const MyProfile = ({ setShowSelectedTab }: { setShowSelectedTab: (val: boolean) => void }) => {
  const { user, refreshUser } = useAuth();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const { upload, uploading: avatarUploading } = useUpload();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneCountryCode: "+234",
    phoneNumber: "",
    bio: "",
    dateOfBirth: "",
    gender: "" as GenderValue,
    country: "",
    city: "",
    churchName: "",
  });

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    try {
      const result = await upload(file, 'avatar') as { url: string };
      await userService.setAvatarUrl(result.url);
      await refreshUser();
      setToast({ message: 'Profile picture updated!', type: 'success' });
    } catch {
      setAvatarPreview(null);
      setToast({ message: 'Failed to upload picture. Please try again.', type: 'error' });
    }
  };

  useEffect(() => {
    if (user) {
      const { dial, local } = parseStoredPhone(user.phone ?? undefined);
      setFormData({
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        email: user.email ?? "",
        phoneCountryCode: dial,
        phoneNumber: local,
        bio: user.bio ?? "",
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.slice(0, 10) : "",
        gender: (user.gender ?? "") as GenderValue,
        country: user.country ?? "",
        city: user.city ?? "",
        churchName: user.churchName ?? "",
      });
    }
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      await userService.updateProfile({
        firstName: formData.firstName || undefined,
        lastName: formData.lastName || undefined,
        bio: formData.bio || undefined,
        phone: formData.phoneNumber
          ? `${formData.phoneCountryCode}${formData.phoneNumber}`
          : undefined,
        country: formData.country || undefined,
        city: formData.city || undefined,
        churchName: formData.churchName || undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
        gender: (formData.gender || undefined) as 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY' | undefined,
      });
      await refreshUser();
      setIsEditing(false);
      setToast({ message: 'Profile updated!', type: 'success' });
    } catch (err: unknown) {
      setSaveError((err as Error)?.message ?? 'Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const inputVariant = (isEditing ? "outlined" : "primary") as "outlined" | "primary";
  const selectClass = `w-full h-[48px] px-4 text-sm text-[#60666B] rounded-[10px] outline-none ${
    isEditing ? "border border-[#B9C2CA] bg-white" : "bg-[#d9d9d93d]"
  }`;
  const textareaClass = `w-full px-4 py-3 text-sm text-[#60666B] rounded-[10px] outline-none resize-none ${
    isEditing ? "border border-[#B9C2CA]" : "bg-[#d9d9d93d]"
  }`;

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
      <ArrowLeft className="lg:hidden mb-4 cursor-pointer" stroke='#60666B' onClick={() => setShowSelectedTab(false)} />
      <h2 className="text-[24px] font-bold mb-8">Profile</h2>

      <div className="w-full">
        {/* Avatar */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="relative w-24 h-24 rounded-full mb-2 cursor-pointer group"
            onClick={() => avatarInputRef.current?.click()}
          >
            <div className="w-full h-full rounded-full border border-gray-300 overflow-hidden flex items-center justify-center bg-[#F5EBFF]">
              {avatarPreview || user?.avatarUrl ? (
                <img
                  src={avatarPreview ?? user!.avatarUrl!}
                  alt={user?.firstName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <path d="M20 20C24.1421 20 27.5 16.6421 27.5 12.5C27.5 8.35786 24.1421 5 20 5C15.8579 5 12.5 8.35786 12.5 12.5C12.5 16.6421 15.8579 20 20 20Z" stroke="#870BD6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M33.75 35C33.75 28.7868 27.7132 23.75 20 23.75C12.2868 23.75 6.25 28.7868 6.25 35" stroke="#870BD6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
              {avatarUploading ? (
                <Loader2 size={20} className="text-white animate-spin" />
              ) : (
                <Camera size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </div>
            <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#870BD6] border-2 border-white flex items-center justify-center">
              <Camera size={13} className="text-white" />
            </div>
          </div>
          <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          {!isEditing && (
            <p className="text-lg font-medium mt-1">
              {(formData.firstName || formData.lastName)
                ? `${formData.firstName} ${formData.lastName}`.trim()
                : "—"}
            </p>
          )}
        </div>

        {/* Form */}
        <div className="space-y-5">
          {/* First + Last name — only shown when editing */}
          {isEditing && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First name</label>
                <Input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First name" variant="outlined" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last name</label>
                <Input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last name" variant="outlined" />
              </div>
            </div>
          )}

          {/* Email — always read-only */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
            <Input type="email" id="email" name="email" value={formData.email} onChange={() => {}} placeholder="Email" isDisabled={true} variant="primary" />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium mb-1">Phone number</label>
            <div className="flex gap-2">
              <div className="w-[30%]">
                <CountryCodeSelector
                  value={formData.phoneCountryCode}
                  onChange={(dial) => setFormData(prev => ({ ...prev, phoneCountryCode: dial }))}
                  disabled={!isEditing}
                />
              </div>
              <div className="flex-1">
                <Input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => {
                    // Strip any leading + or country code digits the user might paste
                    const digits = e.target.value.replace(/[^\d]/g, '');
                    setFormData(prev => ({ ...prev, phoneNumber: digits }));
                  }}
                  placeholder="8012345678"
                  isDisabled={!isEditing}
                  variant={inputVariant}
                />
              </div>
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us a bit about yourself"
              rows={3}
              disabled={!isEditing}
              className={textareaClass}
            />
          </div>

          {/* Date of Birth + Gender */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of birth</label>
              <Input type="date" id="dateOfBirth" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} placeholder="" isDisabled={!isEditing} variant={inputVariant} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                disabled={!isEditing}
                className={selectClass}
              >
                <option value="">Select gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </div>
          </div>

          {/* Country + City */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <Input type="text" id="country" name="country" value={formData.country} onChange={handleChange} placeholder="Country" isDisabled={!isEditing} variant={inputVariant} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <Input type="text" id="city" name="city" value={formData.city} onChange={handleChange} placeholder="City" isDisabled={!isEditing} variant={inputVariant} />
            </div>
          </div>

          {/* Church */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Church</label>
            <Input type="text" id="churchName" name="churchName" value={formData.churchName} onChange={handleChange} placeholder="Your church name" isDisabled={!isEditing} variant={inputVariant} />
          </div>

          {saveError && (
            <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{saveError}</p>
          )}

          <div className="pt-2">
            {isEditing ? (
              <div className="flex gap-3">
                <button
                  onClick={() => setIsEditing(false)}
                  disabled={saving}
                  className="flex-1 h-[58px] border border-[#D2D9DF] rounded-full text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  Cancel
                </button>
                <Button
                  onClick={handleSaveChanges}
                  loading={saving}
                  disabled={saving}
                  customClass="flex-1 h-[58px] text-white"
                >
                  Save Changes
                </Button>
              </div>
            ) : (
              <Button onClick={() => setIsEditing(true)} customClass="w-full py-3 text-white h-[58px]">
                <svg className="mr-2" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M14.1667 2.5C14.3856 2.28113 14.6454 2.10752 14.9314 1.98906C15.2175 1.87061 15.5238 1.80976 15.8334 1.80976C16.1429 1.80976 16.4493 1.87061 16.7353 1.98906C17.0214 2.10752 17.2812 2.28113 17.5 2.5C17.7189 2.71887 17.8925 2.97871 18.011 3.26474C18.1294 3.55077 18.1903 3.85714 18.1903 4.16669C18.1903 4.47624 18.1294 4.78261 18.011 5.06864C17.8925 5.35467 17.7189 5.61451 17.5 5.83335L6.25002 17.0834L1.66669 18.3334L2.91669 13.75L14.1667 2.5Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Edit
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MyProfile;
