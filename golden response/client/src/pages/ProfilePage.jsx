import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import * as userApi from '../api/user.api';
import { useAuth } from '../hooks/useAuth';
import Spinner from '../components/Spinner';

function ProfilePage() {
  const { logout } = useAuth();
  const [profile, setProfile] = useState({ displayName: '', email: '', avatar: '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [changingPw, setChangingPw] = useState(false);

  // Fetch profile on mount
  useEffect(() => {
    userApi.getProfile()
      .then(({ data }) =>
        setProfile({ displayName: data.displayName, email: data.email, avatar: data.avatar || '' })
      )
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  const handleProfileChange  = (e) => setProfile((p) => ({ ...p, [e.target.name]: e.target.value }));
  const handlePasswordChange = (e) => setPasswords((p) => ({ ...p, [e.target.name]: e.target.value }));

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await userApi.updateProfile(profile);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword.length < 8) {
      return toast.error('New password must be at least 8 characters');
    }
    setChangingPw(true);
    try {
      await userApi.changePassword(passwords);
      toast.success('Password changed!');
      setPasswords({ currentPassword: '', newPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password change failed');
    } finally {
      setChangingPw(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <header className="sticky top-0 z-10 border-b bg-white px-4 py-3 shadow-sm">
        <div className="mx-auto flex max-w-xl items-center justify-between">
          <Link to="/" className="text-sm font-medium text-primary-600 hover:underline">
            ← Tasks
          </Link>
          <h1 className="text-base font-bold text-gray-800">Profile</h1>
          <button onClick={logout} className="text-sm text-gray-400 hover:text-gray-600">
            Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-xl space-y-6 px-4 py-8">
        {/* Avatar header card */}
        <div className="flex items-center gap-4 rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-100 text-xl font-bold text-primary-600">
            {profile.avatar ? (
              <img src={profile.avatar} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              profile.displayName?.[0]?.toUpperCase() || '?'
            )}
          </div>
          <div>
            <p className="font-semibold text-gray-800">{profile.displayName}</p>
            <p className="text-sm text-gray-500">{profile.email}</p>
          </div>
        </div>

        {/* Edit profile */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-gray-700">Edit Profile</h2>
          <form onSubmit={saveProfile} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Display name</label>
              <input
                name="displayName"
                value={profile.displayName}
                onChange={handleProfileChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
              <input
                name="email"
                type="email"
                value={profile.email}
                onChange={handleProfileChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Avatar URL <span className="text-gray-400">(optional)</span>
              </label>
              <input
                name="avatar"
                type="url"
                value={profile.avatar}
                onChange={handleProfileChange}
                placeholder="https://..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-60"
            >
              {saving ? <Spinner size="sm" /> : 'Save changes'}
            </button>
          </form>
        </div>

        {/* Change password */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-gray-700">Change Password</h2>
          <form onSubmit={savePassword} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Current password</label>
              <input
                name="currentPassword"
                type="password"
                required
                value={passwords.currentPassword}
                onChange={handlePasswordChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">New password</label>
              <input
                name="newPassword"
                type="password"
                required
                minLength={8}
                value={passwords.newPassword}
                onChange={handlePasswordChange}
                placeholder="At least 8 characters"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <button
              type="submit"
              disabled={changingPw}
              className="flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-900 disabled:opacity-60"
            >
              {changingPw ? <Spinner size="sm" /> : 'Change password'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default ProfilePage;
