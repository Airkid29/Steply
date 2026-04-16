import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { LogOut, Sun, Moon, Briefcase, Shield, Bell, Lock, Trash2, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { getTheme, setTheme } from "@/lib/theme";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function Settings() {
  const [user, setUser] = useState(null);
  const [dark, setDark] = useState(() => getTheme() === "dark");
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);

  useEffect(() => { mockClient.auth.me().then(setUser); }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    setTheme(next ? "dark" : "light");
  };

  const saveNotificationSettings = () => {
    // Save to user profile or localStorage
    localStorage.setItem("steply_email_notifs", emailNotifs.toString());
    localStorage.setItem("steply_push_notifs", pushNotifs.toString());
  };

  useEffect(() => {
    setEmailNotifs(localStorage.getItem("steply_email_notifs") !== "false");
    setPushNotifs(localStorage.getItem("steply_push_notifs") !== "false");
  }, []);

  return (
    <div className="space-y-6 animate-fade-in pb-20 lg:pb-0">
      <div>
        <h1 className="text-2xl font-display font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your account preferences</p>
      </div>

      {/* Account */}
      <section className="bg-card rounded-xl border border-border p-5 space-y-4">
        <h2 className="font-semibold text-sm">Account</h2>
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-medium">{user?.full_name || "—"}</p>
            <p className="text-xs text-muted-foreground">{user?.email || "—"}</p>
          </div>
        </div>
        <div className="pt-2 border-t border-border">
          <Button variant="outline" className="rounded-xl gap-2 text-destructive hover:text-destructive">
            <Trash2 className="w-4 h-4" />
            Delete account
          </Button>
        </div>
      </section>

      {/* Notifications */}
      <section className="bg-card rounded-xl border border-border p-5 space-y-4">
        <h2 className="font-semibold text-sm">Notifications</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-primary" />
              <div>
                <Label className="text-sm font-medium">Email notifications</Label>
                <p className="text-xs text-muted-foreground">Receive updates via email</p>
              </div>
            </div>
            <Switch checked={emailNotifs} onCheckedChange={setEmailNotifs} />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4 text-primary" />
              <div>
                <Label className="text-sm font-medium">Push notifications</Label>
                <p className="text-xs text-muted-foreground">Receive in-app notifications</p>
              </div>
            </div>
            <Switch checked={pushNotifs} onCheckedChange={setPushNotifs} />
          </div>
        </div>
        <Button onClick={saveNotificationSettings} className="rounded-xl w-full">Save preferences</Button>
      </section>

      {/* Appearance */}
      <section className="bg-card rounded-xl border border-border p-5 space-y-4">
        <h2 className="font-semibold text-sm">Appearance</h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {dark ? <Moon className="w-4 h-4 text-primary" /> : <Sun className="w-4 h-4 text-primary" />}
            <div>
              <p className="text-sm font-medium">{dark ? "Dark mode" : "Light mode"}</p>
              <p className="text-xs text-muted-foreground">Change the appearance of the app</p>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className={`w-11 h-6 rounded-full transition-colors ${dark ? "bg-primary" : "bg-border"} relative`}
          >
            <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${dark ? "left-5" : "left-0.5"}`} />
          </button>
        </div>
      </section>

      {/* Privacy */}
      <section className="bg-card rounded-xl border border-border p-5 space-y-4">
        <h2 className="font-semibold text-sm">Privacy</h2>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Control how your data is used and shared.</p>
          <div className="flex items-center gap-3">
            <Lock className="w-4 h-4 text-primary" />
            <div>
              <p className="text-sm font-medium">Data sharing</p>
              <p className="text-xs text-muted-foreground">Your profile is only visible to recruiters when you apply</p>
            </div>
          </div>
        </div>
      </section>

      {/* Recruiter */}
      <section className="bg-card rounded-xl border border-border p-5 space-y-3">
        <h2 className="font-semibold text-sm">Recruiter Portal</h2>
        <p className="text-sm text-muted-foreground">Are you a recruiter? Post your opportunities and reach thousands of qualified students.</p>
        <Link to="/post-opportunity">
          <Button variant="outline" className="rounded-xl gap-2">
            <Briefcase className="w-4 h-4" />
            Post an opportunity
          </Button>
        </Link>
      </section>

      {/* Admin */}
      {user?.role === "admin" && (
        <section className="bg-card rounded-xl border border-border p-5 space-y-3">
          <h2 className="font-semibold text-sm">Administration</h2>
          <p className="text-sm text-muted-foreground">Manage opportunities, users, and platform data.</p>
          <Link to="/admin">
            <Button variant="outline" className="rounded-xl gap-2">
              <Shield className="w-4 h-4" />
              Open Back Office
            </Button>
          </Link>
        </section>
      )}

      {/* About */}
      <section className="bg-card rounded-xl border border-border p-5 space-y-4">
        <h2 className="font-semibold text-sm">About</h2>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10" />
          <div>
            <p className="text-sm font-medium">Steply</p>
            <p className="text-xs text-muted-foreground">AI career agent for students & graduates · v2.0</p>
          </div>
        </div>
      </section>

      <Button
        variant="outline"
        onClick={() => mockClient.auth.logout("/")}
        className="rounded-xl w-full text-destructive hover:text-destructive border-destructive/20 hover:bg-destructive/5"
      >
        <LogOut className="w-4 h-4 mr-2" />
        Sign out
      </Button>
    </div>
  );
}