import { useState } from "react";
import { Building2, Plus, Trash2 } from "lucide-react";
import { useCreateDepartmentMutation, useDeleteDepartmentMutation, useGetDepartmentsQuery } from "../../features/departments/departmentApiSlice";
import Card from "../../components/ui/Card";

const AdminDepartmentsPage = () => {
  const { data, isLoading } = useGetDepartmentsQuery();
  const [createDepartment, { isLoading: creating }] = useCreateDepartmentMutation();
  const [deleteDepartment] = useDeleteDepartmentMutation();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const departments = data?.data?.departments || [];
  const add = async (e) => { e.preventDefault(); if (!name.trim()) return; await createDepartment({ name: name.trim(), code: code.trim().toUpperCase() || undefined }); setName(""); setCode(""); };
  return <div className="flex flex-col gap-6"><div><h1 className="text-2xl font-bold text-slate-900 dark:text-white">Departments</h1><p className="mt-1 text-sm text-slate-500">Create and manage academic departments.</p></div>
    <Card className="p-5"><form onSubmit={add} className="flex flex-col gap-3 sm:flex-row"><input value={name} onChange={e=>setName(e.target.value)} placeholder="Department name" className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none dark:border-slate-700 dark:bg-slate-900"/><input value={code} onChange={e=>setCode(e.target.value)} placeholder="Code (e.g. CS)" className="rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none dark:border-slate-700 dark:bg-slate-900"/><button disabled={creating} className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2 font-medium text-white"><Plus size={17}/> Add department</button></form></Card>
    <Card className="overflow-hidden"><div className="divide-y divide-slate-100 dark:divide-slate-800">{isLoading?<div className="p-6">Loading…</div>:departments.map(d=><div key={d._id} className="flex items-center justify-between p-4"><div className="flex items-center gap-3"><Building2 size={18} className="text-brand-600"/><div><p className="font-medium">{d.name}</p>{d.code&&<p className="text-xs text-slate-500">{d.code}</p>}</div></div><button onClick={()=>deleteDepartment(d._id)} className="rounded-lg p-2 text-red-600 hover:bg-red-50"><Trash2 size={16}/></button></div>)}{!departments.length&&!isLoading&&<div className="p-8 text-center text-slate-500">No departments yet.</div>}</div></Card>
  </div>;
};
export default AdminDepartmentsPage;
