import { useState, useRef } from "react";
import {
  Settings as SettingsIcon,
  Building2,
  IndianRupee,
  Bell,
  Shield,
  Save,
  Database,
  Download,
  Upload,
  Trash2,
  Cloud,
  HardDrive,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useStorage, StorageMode } from "@/lib/storage/StorageContext";
import { localStorageBackup } from "@/lib/storage/localStorage";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

export default function Settings() {
  const { mode, setMode, isCloudAvailable } = useStorage();
  const [restaurantName, setRestaurantName] = useState("FoodTrack Restaurant");
  const [address, setAddress] = useState("Koramangala, Bangalore");
  const [phone, setPhone] = useState("+91 98765 43210");
  const [email, setEmail] = useState("contact@foodtrack.com");
  const [currency, setCurrency] = useState("INR");
  const [notifications, setNotifications] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    toast.success("Settings saved successfully");
  };

  const handleExportData = () => {
    const data = localStorageBackup.exportAll();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `foodtrack-backup-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Data exported successfully");
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const success = localStorageBackup.importAll(content);
      if (success) {
        toast.success("Data imported successfully. Please refresh the page.");
      } else {
        toast.error("Failed to import data. Invalid file format.");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClearData = () => {
    localStorageBackup.clearAll();
    toast.success("All local data cleared. Please refresh the page.");
  };

  const handleStorageModeChange = (newMode: StorageMode) => {
    setMode(newMode);
    toast.success(`Switched to ${newMode === "cloud" ? "Cloud" : "Local"} storage`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your restaurant configuration
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Storage Mode */}
          <div className="stat-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                <Database className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-lg">Storage Mode</h3>
                <p className="text-sm text-muted-foreground">Choose where to store your data</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant={mode === "cloud" ? "default" : "secondary"}>
                  {mode === "cloud" ? (
                    <>
                      <Cloud className="h-3 w-3 mr-1" />
                      Cloud Storage Active
                    </>
                  ) : (
                    <>
                      <HardDrive className="h-3 w-3 mr-1" />
                      Local Storage Active
                    </>
                  )}
                </Badge>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Button
                  variant={mode === "local" ? "default" : "outline"}
                  className="h-auto py-4 flex-col gap-2"
                  onClick={() => handleStorageModeChange("local")}
                >
                  <HardDrive className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-semibold">Local Storage</div>
                    <div className="text-xs opacity-80">Store data in browser</div>
                  </div>
                </Button>

                <Button
                  variant={mode === "cloud" ? "default" : "outline"}
                  className="h-auto py-4 flex-col gap-2"
                  onClick={() => handleStorageModeChange("cloud")}
                  disabled={!isCloudAvailable}
                >
                  <Cloud className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-semibold">Cloud Storage</div>
                    <div className="text-xs opacity-80">
                      {isCloudAvailable ? "Sync across devices" : "Not configured"}
                    </div>
                  </div>
                </Button>
              </div>

              <p className="text-xs text-muted-foreground mt-2">
                {mode === "local"
                  ? "Data is stored in your browser. Export regularly for backup."
                  : "Data is synced to the cloud and accessible from any device."}
              </p>
            </div>
          </div>

          {/* Data Backup (Local mode) */}
          <div className="stat-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                <Download className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-lg">Data Backup</h3>
                <p className="text-sm text-muted-foreground">Export and import your local data</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Button variant="outline" className="gap-2" onClick={handleExportData}>
                  <Download className="h-4 w-4" />
                  Export Data
                </Button>

                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleImportData}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4" />
                    Import Data
                  </Button>
                </div>
              </div>

              <Separator />

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    Clear All Local Data
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear all local data?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. All locally stored data will be permanently
                      deleted. Make sure to export a backup first if needed.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearData}>
                      Yes, clear all data
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          {/* Restaurant Info */}
          <div className="stat-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-lg">Restaurant Information</h3>
                <p className="text-sm text-muted-foreground">Basic details about your restaurant</p>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Restaurant Name</Label>
                <Input
                  id="name"
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={2}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Billing Settings */}
          <div className="stat-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                <IndianRupee className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-lg">Billing Settings</h3>
                <p className="text-sm text-muted-foreground">Configure currency and billing options</p>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">Indian Rupee (₹)</SelectItem>
                    <SelectItem value="USD">US Dollar ($)</SelectItem>
                    <SelectItem value="EUR">Euro (€)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="stat-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-lg">Notifications</h3>
                <p className="text-sm text-muted-foreground">Manage notification preferences</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications for new transactions
                  </p>
                </div>
                <Switch
                  checked={notifications}
                  onCheckedChange={setNotifications}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="stat-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display font-semibold">Storage Status</h3>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {isCloudAvailable
                ? "Cloud storage is available and configured."
                : "Running in local-only mode. Host your own frontend and all data stays in the browser."}
            </p>
            <Badge variant={isCloudAvailable ? "default" : "secondary"} className="w-full justify-center py-2">
              {isCloudAvailable ? "Cloud Available" : "Local Only Mode"}
            </Badge>
          </div>

          <div className="stat-card">
            <h3 className="font-display font-semibold mb-2">Self-Hosting</h3>
            <p className="text-sm text-muted-foreground mb-4">
              This app works fully offline. Export your data, host the frontend anywhere, and all
              data will be stored locally in your browser.
            </p>
            <Button variant="secondary" className="w-full" onClick={handleExportData}>
              <Download className="h-4 w-4 mr-2" />
              Quick Backup
            </Button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg" className="gap-2">
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}
