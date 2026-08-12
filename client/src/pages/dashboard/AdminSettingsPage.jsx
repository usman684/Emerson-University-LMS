import { useEffect, useState } from "react";
import { Save, ShieldCheck } from "lucide-react";
import Card from "../../components/ui/Card";

const AdminSettingsPage = () => {
  const [settings, setSettings] = useState({ universityName: "Emerson University", email: "admin@emerson.edu", maintenance: false, emailNotifications: true });
  const [saved, setSaved] = useState(false);
  useEffect(()=>{ try { const s=localStorage.getItem("emerson_admin_settings"); if(s) setSettings(JSON.parse(s)); } catch {} },[]);
  const save=()=>{ localStorage.setItem("emerson_admin_settings", JSON.stringify(settings)); setSaved(true); setTimeout(()=>setSaved(false),1800); };
  const set=(key,value)=>setSettings(s=>({...s,[key]:value}));
  return <div className="flex flex-col gap-6"><div><h1 className="text-2xl font-bold text-slate-900 dark:text-white">System Settings</h1><p className="mt-1 text-sm text-slate-500">Configure the LMS experience for your university.</p></div><Card className="p-6"><div className="mb-6 flex items-center gap-3"><div className="rounded-xl bg-brand-50 p-3 text-brand-600"><ShieldCheck/></div><div><h2 className="font-semibold">General settings</h2><p className="text-sm text-slate-500">These settings are saved for this browser.</p></div></div><div className="grid gap-5 md:grid-cols-2"><label className="text-sm font-medium">University name<input value={settings.universityName} onChange={e=>set("universityName",e.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"/></label><label className="text-sm font-medium">Support email<input value={settings.email} onChange={e=>set("email",e.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"/></label></div><div className="mt-6 space-y-3"><label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={settings.emailNotifications} onChange={e=>set("emailNotifications",e.target.checked)}/> Enable email notifications</label><label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={settings.maintenance} onChange={e=>set("maintenance",e.target.checked)}/> Maintenance mode</label></div><div className="mt-6 flex items-center gap-3"><button onClick={save} className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 font-medium text-white"><Save size={17}/> Save settings</button>{saved&&<span className="text-sm text-emerald-600">Saved successfully.</span>}</div></Card></div>;
};
export default AdminSettingsPage;
