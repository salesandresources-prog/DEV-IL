import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  CalendarClock,
  Gamepad2,
  LogOut,
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  UserPlus,
  ShieldCheck,
  CalendarPlus,
} from "lucide-react";
import {
  loadPatients,
  savePatients,
  nextId,
  type Patient,
} from "@/lib/devi-patients";
import {
  loadAppointments,
  saveAppointments,
  nextAppointmentId,
  type Appointment,
} from "@/lib/devi-appointments";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "DEVI · Panel de pacientes" },
      { name: "description", content: "Gestión de pacientes en el panel DEVI." },
      { property: "og:title", content: "DEVI · Panel" },
      { property: "og:description", content: "Gestión de pacientes DEVI." },
    ],
  }),
  component: Dashboard,
});

const empty: Omit<Patient, "id"> = {
  nombre: "",
  telefono: "",
  whatsapp: "",
  direccion: "",
  correo: "",
  fechaIngreso: new Date().toISOString().slice(0, 10),
  encargado: "",
};

const emptyAppt: Omit<Appointment, "id"> = {
  patientId: "",
  patientName: "",
  fecha: new Date().toISOString().slice(0, 10),
  hora: "09:00",
  motivo: "",
  encargado: "",
  estado: "Pendiente",
  notas: "",
};

type Section = "patients" | "appointments";

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<string>("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [query, setQuery] = useState("");
  const [openNew, setOpenNew] = useState(false);
  const [form, setForm] = useState<Omit<Patient, "id">>(empty);
  const [confirmDelete, setConfirmDelete] = useState<Patient | null>(null);
  const [editing, setEditing] = useState<Patient | null>(null);
  const [viewing, setViewing] = useState<Patient | null>(null);

  const [section, setSection] = useState<Section>("patients");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [apptForm, setApptForm] = useState<Omit<Appointment, "id">>(emptyAppt);
  const [openNewAppt, setOpenNewAppt] = useState(false);
  const [editingAppt, setEditingAppt] = useState<Appointment | null>(null);
  const [confirmDeleteAppt, setConfirmDeleteAppt] = useState<Appointment | null>(null);

  useEffect(() => {
    setPatients(loadPatients());
    setAppointments(loadAppointments());
    try {
      setUser(window.localStorage.getItem("devi.user") || "Operador");
    } catch {
      setUser("Operador");
    }
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter(
      (p) =>
        p.nombre.toLowerCase().includes(q) ||
        p.correo.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.encargado.toLowerCase().includes(q),
    );
  }, [patients, query]);

  const totals = useMemo(() => {
    const now = new Date();
    const thisMonth = patients.filter((p) => {
      const d = new Date(p.fechaIngreso);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
    const encargados = new Set(patients.map((p) => p.encargado)).size;
    return { total: patients.length, thisMonth, encargados };
  }, [patients]);

  function handleLogout() {
    try {
      window.localStorage.removeItem("devi.user");
    } catch {}
    navigate({ to: "/" });
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const list = [{ id: nextId(patients), ...form }, ...patients];
    setPatients(list);
    savePatients(list);
    setForm(empty);
    setOpenNew(false);
  }

  function handleDelete(p: Patient) {
    const list = patients.filter((x) => x.id !== p.id);
    setPatients(list);
    savePatients(list);
    setConfirmDelete(null);
  }

  function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    const list = patients.map((p) => (p.id === editing.id ? editing : p));
    setPatients(list);
    savePatients(list);
    // reflect name changes on appointments
    const apList = appointments.map((a) =>
      a.patientId === editing.id ? { ...a, patientName: editing.nombre } : a,
    );
    setAppointments(apList);
    saveAppointments(apList);
    setEditing(null);
  }

  function openCreateAppointmentFor(p?: Patient) {
    setApptForm({
      ...emptyAppt,
      patientId: p?.id ?? "",
      patientName: p?.nombre ?? "",
      encargado: p?.encargado ?? "",
    });
    setOpenNewAppt(true);
  }

  function handleCreateAppt(e: React.FormEvent) {
    e.preventDefault();
    const patient = patients.find((p) => p.id === apptForm.patientId);
    const payload: Appointment = {
      id: nextAppointmentId(appointments),
      ...apptForm,
      patientName: patient?.nombre ?? apptForm.patientName,
    };
    const list = [payload, ...appointments];
    setAppointments(list);
    saveAppointments(list);
    setOpenNewAppt(false);
  }

  function handleUpdateAppt(e: React.FormEvent) {
    e.preventDefault();
    if (!editingAppt) return;
    const patient = patients.find((p) => p.id === editingAppt.patientId);
    const updated = { ...editingAppt, patientName: patient?.nombre ?? editingAppt.patientName };
    const list = appointments.map((a) => (a.id === editingAppt.id ? updated : a));
    setAppointments(list);
    saveAppointments(list);
    setEditingAppt(null);
  }

  function handleDeleteAppt(a: Appointment) {
    const list = appointments.filter((x) => x.id !== a.id);
    setAppointments(list);
    saveAppointments(list);
    setConfirmDeleteAppt(null);
  }

  const filteredAppts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return appointments;
    return appointments.filter(
      (a) =>
        a.patientName.toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q) ||
        a.motivo.toLowerCase().includes(q) ||
        a.encargado.toLowerCase().includes(q),
    );
  }, [appointments, query]);

  return (
    <div className="devi-circuit-bg min-h-screen text-neutral-100">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 border-r border-[#c9a84c]/20 bg-black/60 backdrop-blur-xl md:flex md:flex-col">
          <div className="flex items-center gap-3 border-b border-[#c9a84c]/20 px-5 py-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#c9a84c]/40 bg-neutral-950 shadow-[0_0_20px_-6px_#c9a84c]">
              <Gamepad2 className="h-5 w-5" style={{ color: "#f0d78c" }} />
            </div>
            <div>
              <div
                className="text-lg font-black tracking-[0.3em]"
                style={{ fontFamily: "'Orbitron', sans-serif", color: "#f0d78c" }}
              >
                DEVI
              </div>
              <div className="text-[9px] uppercase tracking-[0.3em] text-neutral-500">
                Control Panel
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-4">
            <div className="mb-2 px-3 text-[10px] uppercase tracking-[0.3em] text-neutral-500">
              Gestión
            </div>
            <button
              onClick={() => setSection("patients")}
              className={
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition " +
                (section === "patients"
                  ? "border border-[#c9a84c]/40 bg-gradient-to-r from-[#c9a84c]/20 to-transparent text-[#f0d78c] shadow-[inset_0_0_20px_-10px_#c9a84c]"
                  : "border border-transparent text-neutral-400 hover:bg-[#c9a84c]/5 hover:text-[#f0d78c]")
              }
              style={{ fontFamily: "'Rajdhani', sans-serif", letterSpacing: "0.08em" }}
            >
              <Users className="h-4 w-4" />
              PACIENTES
            </button>
            <button
              onClick={() => setSection("appointments")}
              className={
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition " +
                (section === "appointments"
                  ? "border border-[#c9a84c]/40 bg-gradient-to-r from-[#c9a84c]/20 to-transparent text-[#f0d78c] shadow-[inset_0_0_20px_-10px_#c9a84c]"
                  : "border border-transparent text-neutral-400 hover:bg-[#c9a84c]/5 hover:text-[#f0d78c]")
              }
              style={{ fontFamily: "'Rajdhani', sans-serif", letterSpacing: "0.08em" }}
            >
              <CalendarClock className="h-4 w-4" />
              CITAS
            </button>
          </nav>

          <div className="border-t border-[#c9a84c]/20 p-4">
            <div className="rounded-lg border border-[#c9a84c]/20 bg-neutral-950/60 p-3 text-xs">
              <div className="mb-1 flex items-center gap-2 text-[#c9a84c]">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span className="uppercase tracking-widest">Modo demo</span>
              </div>
              <p className="text-neutral-500">Datos de ejemplo guardados en tu navegador.</p>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1">
          {/* Header */}
          <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[#c9a84c]/20 bg-black/60 px-6 py-4 backdrop-blur-xl">
            <div>
              <h1
                className="text-2xl font-bold tracking-widest"
                style={{ fontFamily: "'Orbitron', sans-serif", color: "#f0d78c" }}
              >
                {section === "patients" ? "PANEL DE PACIENTES" : "PANEL DE CITAS"}
              </h1>
              <p className="text-xs text-neutral-500">
                {section === "patients"
                  ? "Gestión y seguimiento de clientes DEVI"
                  : "Agenda y control de citas"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <div className="text-xs text-neutral-500">Operador</div>
                <div className="text-sm font-medium text-neutral-200">{user}</div>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#c9a84c]/40 bg-neutral-950 text-sm font-bold" style={{ color: "#f0d78c" }}>
                {user.slice(0, 1).toUpperCase() || "D"}
              </div>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="border-[#c9a84c]/30 bg-transparent text-neutral-200 hover:bg-[#c9a84c]/10 hover:text-[#f0d78c]"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Salir
              </Button>
            </div>
          </header>

          <div className="space-y-6 p-6">
            {/* Stats */}
            {section === "patients" ? (
              <div className="grid gap-4 md:grid-cols-3">
                <StatCard label="Total pacientes" value={totals.total} icon={<Users className="h-5 w-5" />} />
                <StatCard label="Nuevos este mes" value={totals.thisMonth} icon={<UserPlus className="h-5 w-5" />} />
                <StatCard label="Encargados activos" value={totals.encargados} icon={<ShieldCheck className="h-5 w-5" />} />
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-3">
                <StatCard label="Total citas" value={appointments.length} icon={<CalendarClock className="h-5 w-5" />} />
                <StatCard
                  label="Pendientes"
                  value={appointments.filter((a) => a.estado === "Pendiente").length}
                  icon={<CalendarPlus className="h-5 w-5" />}
                />
                <StatCard
                  label="Confirmadas"
                  value={appointments.filter((a) => a.estado === "Confirmada").length}
                  icon={<ShieldCheck className="h-5 w-5" />}
                />
              </div>
            )}

            {/* Toolbar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:max-w-sm">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#c9a84c]/60" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={
                    section === "patients"
                      ? "Buscar por nombre, correo, ID..."
                      : "Buscar cita por paciente, motivo, ID..."
                  }
                  className="border-[#c9a84c]/25 bg-black/50 pl-10 text-neutral-100 placeholder:text-neutral-500 focus-visible:border-[#c9a84c] focus-visible:ring-[#c9a84c]/40"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {section === "patients" ? (
                  <>
                    <Button
                      onClick={() => openCreateAppointmentFor()}
                      variant="outline"
                      className="border-[#c9a84c]/40 bg-transparent text-[#f0d78c] hover:bg-[#c9a84c]/10"
                      style={{ fontFamily: "'Rajdhani', sans-serif", letterSpacing: "0.08em" }}
                    >
                      <CalendarPlus className="mr-2 h-4 w-4" />
                      NUEVA CITA
                    </Button>
                    <Button
                      onClick={() => setOpenNew(true)}
                      className="bg-gradient-to-r from-[#c9a84c] to-[#e6c66a] font-semibold uppercase tracking-widest text-neutral-900 shadow-[0_0_25px_-6px_#c9a84c] transition hover:scale-[1.02] hover:from-[#e6c66a] hover:to-[#c9a84c]"
                      style={{ fontFamily: "'Rajdhani', sans-serif" }}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      NUEVO PACIENTE
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => openCreateAppointmentFor()}
                    className="bg-gradient-to-r from-[#c9a84c] to-[#e6c66a] font-semibold uppercase tracking-widest text-neutral-900 shadow-[0_0_25px_-6px_#c9a84c] transition hover:scale-[1.02] hover:from-[#e6c66a] hover:to-[#c9a84c]"
                    style={{ fontFamily: "'Rajdhani', sans-serif" }}
                  >
                    <CalendarPlus className="mr-2 h-4 w-4" />
                    NUEVA CITA
                  </Button>
                )}
              </div>
            </div>

            {/* Table */}
            {section === "patients" ? (
            <div className="devi-hud-corner overflow-hidden rounded-xl border border-[#c9a84c]/25 bg-neutral-950/60 backdrop-blur">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#c9a84c]/20 hover:bg-transparent">
                      {["ID", "Nombre", "Teléfono", "WhatsApp", "Dirección", "Correo", "Ingreso", "Encargado", ""].map((h) => (
                        <TableHead
                          key={h}
                          className="text-[10px] uppercase tracking-[0.2em] text-[#c9a84c]/80"
                          style={{ fontFamily: "'Rajdhani', sans-serif" }}
                        >
                          {h}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((p, i) => (
                      <TableRow
                        key={p.id}
                        className="devi-fade-up border-[#c9a84c]/10 text-sm text-neutral-200 transition-colors hover:bg-[#c9a84c]/5"
                        style={{ animationDelay: `${i * 30}ms` }}
                      >
                        <TableCell className="font-mono text-xs text-[#f0d78c]">{p.id}</TableCell>
                        <TableCell className="font-medium">{p.nombre}</TableCell>
                        <TableCell className="text-neutral-400">{p.telefono}</TableCell>
                        <TableCell className="text-neutral-400">{p.whatsapp}</TableCell>
                        <TableCell className="max-w-[200px] truncate text-neutral-400">{p.direccion}</TableCell>
                        <TableCell className="text-neutral-400">{p.correo}</TableCell>
                        <TableCell className="text-neutral-400">{p.fechaIngreso}</TableCell>
                        <TableCell className="text-neutral-300">{p.encargado}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <IconBtn label="Crear cita" onClick={() => openCreateAppointmentFor(p)}>
                              <CalendarPlus className="h-3.5 w-3.5" />
                            </IconBtn>
                            <IconBtn label="Ver" onClick={() => setViewing(p)}>
                              <Eye className="h-3.5 w-3.5" />
                            </IconBtn>
                            <IconBtn label="Editar" onClick={() => setEditing({ ...p })}>
                              <Pencil className="h-3.5 w-3.5" />
                            </IconBtn>
                            <IconBtn label="Eliminar" onClick={() => setConfirmDelete(p)} danger>
                              <Trash2 className="h-3.5 w-3.5" />
                            </IconBtn>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filtered.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={9} className="py-10 text-center text-sm text-neutral-500">
                          Sin resultados para "{query}"
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
            ) : (
              <div className="devi-hud-corner overflow-hidden rounded-xl border border-[#c9a84c]/25 bg-neutral-950/60 backdrop-blur">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-[#c9a84c]/20 hover:bg-transparent">
                        {["ID", "Paciente", "Fecha", "Hora", "Motivo", "Encargado", "Estado", ""].map((h) => (
                          <TableHead
                            key={h}
                            className="text-[10px] uppercase tracking-[0.2em] text-[#c9a84c]/80"
                            style={{ fontFamily: "'Rajdhani', sans-serif" }}
                          >
                            {h}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAppts.map((a, i) => (
                        <TableRow
                          key={a.id}
                          className="devi-fade-up border-[#c9a84c]/10 text-sm text-neutral-200 transition-colors hover:bg-[#c9a84c]/5"
                          style={{ animationDelay: `${i * 30}ms` }}
                        >
                          <TableCell className="font-mono text-xs text-[#f0d78c]">{a.id}</TableCell>
                          <TableCell className="font-medium">{a.patientName}</TableCell>
                          <TableCell className="text-neutral-400">{a.fecha}</TableCell>
                          <TableCell className="text-neutral-400">{a.hora}</TableCell>
                          <TableCell className="max-w-[220px] truncate text-neutral-400">{a.motivo}</TableCell>
                          <TableCell className="text-neutral-300">{a.encargado}</TableCell>
                          <TableCell>
                            <span
                              className={
                                "rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-widest " +
                                (a.estado === "Confirmada"
                                  ? "border-emerald-500/40 text-emerald-300"
                                  : a.estado === "Pendiente"
                                  ? "border-[#c9a84c]/50 text-[#f0d78c]"
                                  : a.estado === "Cancelada"
                                  ? "border-red-500/40 text-red-300"
                                  : "border-neutral-600 text-neutral-300")
                              }
                            >
                              {a.estado}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <IconBtn label="Editar" onClick={() => setEditingAppt({ ...a })}>
                                <Pencil className="h-3.5 w-3.5" />
                              </IconBtn>
                              <IconBtn label="Eliminar" onClick={() => setConfirmDeleteAppt(a)} danger>
                                <Trash2 className="h-3.5 w-3.5" />
                              </IconBtn>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredAppts.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={8} className="py-10 text-center text-sm text-neutral-500">
                            Sin citas registradas
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* New patient */}
      <Dialog open={openNew} onOpenChange={setOpenNew}>
        <DialogContent className="max-w-lg border-[#c9a84c]/30 bg-neutral-950 text-neutral-100">
          <DialogHeader>
            <DialogTitle style={{ color: "#f0d78c", fontFamily: "'Rajdhani', sans-serif", letterSpacing: "0.1em" }}>
              NUEVO PACIENTE
            </DialogTitle>
            <DialogDescription className="text-neutral-400">
              Los datos se guardan en tu navegador (demo).
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Nombre" value={form.nombre} onChange={(v) => setForm({ ...form, nombre: v })} required />
            <Field label="Teléfono" value={form.telefono} onChange={(v) => setForm({ ...form, telefono: v })} />
            <Field label="WhatsApp" value={form.whatsapp} onChange={(v) => setForm({ ...form, whatsapp: v })} />
            <Field label="Correo" type="email" value={form.correo} onChange={(v) => setForm({ ...form, correo: v })} />
            <Field label="Dirección" value={form.direccion} onChange={(v) => setForm({ ...form, direccion: v })} className="sm:col-span-2" />
            <Field label="Fecha de ingreso" type="date" value={form.fechaIngreso} onChange={(v) => setForm({ ...form, fechaIngreso: v })} />
            <Field label="Encargado" value={form.encargado} onChange={(v) => setForm({ ...form, encargado: v })} />
            <DialogFooter className="sm:col-span-2">
              <Button type="button" variant="ghost" onClick={() => setOpenNew(false)} className="text-neutral-300 hover:bg-neutral-800">
                Cancelar
              </Button>
              <Button type="submit" className="bg-[#c9a84c] text-neutral-900 hover:bg-[#e6c66a]">
                Guardar paciente
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit patient */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-lg border-[#c9a84c]/30 bg-neutral-950 text-neutral-100">
          <DialogHeader>
            <DialogTitle style={{ color: "#f0d78c", fontFamily: "'Rajdhani', sans-serif", letterSpacing: "0.1em" }}>
              EDITAR PACIENTE · {editing?.id}
            </DialogTitle>
            <DialogDescription className="text-neutral-400">
              Actualiza la información del paciente.
            </DialogDescription>
          </DialogHeader>
          {editing && (
            <form onSubmit={handleUpdate} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Nombre" value={editing.nombre} onChange={(v) => setEditing({ ...editing, nombre: v })} required />
              <Field label="Teléfono" value={editing.telefono} onChange={(v) => setEditing({ ...editing, telefono: v })} />
              <Field label="WhatsApp" value={editing.whatsapp} onChange={(v) => setEditing({ ...editing, whatsapp: v })} />
              <Field label="Correo" type="email" value={editing.correo} onChange={(v) => setEditing({ ...editing, correo: v })} />
              <Field label="Dirección" value={editing.direccion} onChange={(v) => setEditing({ ...editing, direccion: v })} className="sm:col-span-2" />
              <Field label="Fecha de ingreso" type="date" value={editing.fechaIngreso} onChange={(v) => setEditing({ ...editing, fechaIngreso: v })} />
              <Field label="Encargado" value={editing.encargado} onChange={(v) => setEditing({ ...editing, encargado: v })} />
              <DialogFooter className="sm:col-span-2">
                <Button type="button" variant="ghost" onClick={() => setEditing(null)} className="text-neutral-300 hover:bg-neutral-800">
                  Cancelar
                </Button>
                <Button type="submit" className="bg-[#c9a84c] text-neutral-900 hover:bg-[#e6c66a]">
                  Guardar cambios
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* View patient */}
      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="max-w-lg border-[#c9a84c]/30 bg-neutral-950 text-neutral-100">
          <DialogHeader>
            <DialogTitle style={{ color: "#f0d78c", fontFamily: "'Rajdhani', sans-serif", letterSpacing: "0.1em" }}>
              PACIENTE · {viewing?.id}
            </DialogTitle>
          </DialogHeader>
          {viewing && (
            <div className="space-y-2 text-sm">
              <Row k="Nombre" v={viewing.nombre} />
              <Row k="Teléfono" v={viewing.telefono} />
              <Row k="WhatsApp" v={viewing.whatsapp} />
              <Row k="Correo" v={viewing.correo} />
              <Row k="Dirección" v={viewing.direccion} />
              <Row k="Ingreso" v={viewing.fechaIngreso} />
              <Row k="Encargado" v={viewing.encargado} />
              <div className="pt-3">
                <div className="mb-2 text-[10px] uppercase tracking-widest text-[#c9a84c]/70">Citas asociadas</div>
                <div className="max-h-40 space-y-1 overflow-auto">
                  {appointments.filter((a) => a.patientId === viewing.id).map((a) => (
                    <div key={a.id} className="flex items-center justify-between rounded border border-[#c9a84c]/15 bg-black/40 px-2 py-1 text-xs">
                      <span className="font-mono text-[#f0d78c]">{a.id}</span>
                      <span className="text-neutral-300">{a.fecha} · {a.hora}</span>
                      <span className="text-neutral-500">{a.estado}</span>
                    </div>
                  ))}
                  {appointments.filter((a) => a.patientId === viewing.id).length === 0 && (
                    <div className="text-xs text-neutral-500">Sin citas registradas.</div>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              onClick={() => {
                if (viewing) openCreateAppointmentFor(viewing);
                setViewing(null);
              }}
              className="bg-[#c9a84c] text-neutral-900 hover:bg-[#e6c66a]"
            >
              <CalendarPlus className="mr-2 h-4 w-4" />
              Crear cita
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <DialogContent className="border-[#c9a84c]/30 bg-neutral-950 text-neutral-100">
          <DialogHeader>
            <DialogTitle className="text-red-400">Eliminar paciente</DialogTitle>
            <DialogDescription className="text-neutral-400">
              ¿Seguro que quieres eliminar a <span className="text-neutral-100">{confirmDelete?.nombre}</span>? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmDelete(null)} className="text-neutral-300 hover:bg-neutral-800">
              Cancelar
            </Button>
            <Button
              onClick={() => confirmDelete && handleDelete(confirmDelete)}
              className="bg-red-500/90 text-white hover:bg-red-500"
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New appointment */}
      <Dialog open={openNewAppt} onOpenChange={setOpenNewAppt}>
        <DialogContent className="max-w-lg border-[#c9a84c]/30 bg-neutral-950 text-neutral-100">
          <DialogHeader>
            <DialogTitle style={{ color: "#f0d78c", fontFamily: "'Rajdhani', sans-serif", letterSpacing: "0.1em" }}>
              NUEVA CITA
            </DialogTitle>
            <DialogDescription className="text-neutral-400">
              Programa una cita para un paciente.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateAppt} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-[10px] uppercase tracking-widest text-[#c9a84c]/80">Paciente</Label>
              <select
                required
                value={apptForm.patientId}
                onChange={(e) => setApptForm({ ...apptForm, patientId: e.target.value })}
                className="h-9 w-full rounded-md border border-[#c9a84c]/25 bg-black/50 px-3 text-sm text-neutral-100 focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/40"
              >
                <option value="">Selecciona un paciente...</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>{p.id} · {p.nombre}</option>
                ))}
              </select>
            </div>
            <Field label="Fecha" type="date" value={apptForm.fecha} onChange={(v) => setApptForm({ ...apptForm, fecha: v })} required />
            <Field label="Hora" type="time" value={apptForm.hora} onChange={(v) => setApptForm({ ...apptForm, hora: v })} required />
            <Field label="Motivo" value={apptForm.motivo} onChange={(v) => setApptForm({ ...apptForm, motivo: v })} className="sm:col-span-2" required />
            <Field label="Encargado" value={apptForm.encargado} onChange={(v) => setApptForm({ ...apptForm, encargado: v })} />
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-widest text-[#c9a84c]/80">Estado</Label>
              <select
                value={apptForm.estado}
                onChange={(e) => setApptForm({ ...apptForm, estado: e.target.value as Appointment["estado"] })}
                className="h-9 w-full rounded-md border border-[#c9a84c]/25 bg-black/50 px-3 text-sm text-neutral-100 focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/40"
              >
                <option>Pendiente</option>
                <option>Confirmada</option>
                <option>Cancelada</option>
                <option>Realizada</option>
              </select>
            </div>
            <DialogFooter className="sm:col-span-2">
              <Button type="button" variant="ghost" onClick={() => setOpenNewAppt(false)} className="text-neutral-300 hover:bg-neutral-800">
                Cancelar
              </Button>
              <Button type="submit" className="bg-[#c9a84c] text-neutral-900 hover:bg-[#e6c66a]">
                Guardar cita
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit appointment */}
      <Dialog open={!!editingAppt} onOpenChange={(o) => !o && setEditingAppt(null)}>
        <DialogContent className="max-w-lg border-[#c9a84c]/30 bg-neutral-950 text-neutral-100">
          <DialogHeader>
            <DialogTitle style={{ color: "#f0d78c", fontFamily: "'Rajdhani', sans-serif", letterSpacing: "0.1em" }}>
              EDITAR CITA · {editingAppt?.id}
            </DialogTitle>
          </DialogHeader>
          {editingAppt && (
            <form onSubmit={handleUpdateAppt} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-[10px] uppercase tracking-widest text-[#c9a84c]/80">Paciente</Label>
                <select
                  required
                  value={editingAppt.patientId}
                  onChange={(e) => setEditingAppt({ ...editingAppt, patientId: e.target.value })}
                  className="h-9 w-full rounded-md border border-[#c9a84c]/25 bg-black/50 px-3 text-sm text-neutral-100"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>{p.id} · {p.nombre}</option>
                  ))}
                </select>
              </div>
              <Field label="Fecha" type="date" value={editingAppt.fecha} onChange={(v) => setEditingAppt({ ...editingAppt, fecha: v })} required />
              <Field label="Hora" type="time" value={editingAppt.hora} onChange={(v) => setEditingAppt({ ...editingAppt, hora: v })} required />
              <Field label="Motivo" value={editingAppt.motivo} onChange={(v) => setEditingAppt({ ...editingAppt, motivo: v })} className="sm:col-span-2" required />
              <Field label="Encargado" value={editingAppt.encargado} onChange={(v) => setEditingAppt({ ...editingAppt, encargado: v })} />
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-widest text-[#c9a84c]/80">Estado</Label>
                <select
                  value={editingAppt.estado}
                  onChange={(e) => setEditingAppt({ ...editingAppt, estado: e.target.value as Appointment["estado"] })}
                  className="h-9 w-full rounded-md border border-[#c9a84c]/25 bg-black/50 px-3 text-sm text-neutral-100"
                >
                  <option>Pendiente</option>
                  <option>Confirmada</option>
                  <option>Cancelada</option>
                  <option>Realizada</option>
                </select>
              </div>
              <DialogFooter className="sm:col-span-2">
                <Button type="button" variant="ghost" onClick={() => setEditingAppt(null)} className="text-neutral-300 hover:bg-neutral-800">
                  Cancelar
                </Button>
                <Button type="submit" className="bg-[#c9a84c] text-neutral-900 hover:bg-[#e6c66a]">
                  Guardar cambios
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete appointment */}
      <Dialog open={!!confirmDeleteAppt} onOpenChange={(o) => !o && setConfirmDeleteAppt(null)}>
        <DialogContent className="border-[#c9a84c]/30 bg-neutral-950 text-neutral-100">
          <DialogHeader>
            <DialogTitle className="text-red-400">Eliminar cita</DialogTitle>
            <DialogDescription className="text-neutral-400">
              ¿Eliminar la cita <span className="text-neutral-100">{confirmDeleteAppt?.id}</span> de {confirmDeleteAppt?.patientName}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmDeleteAppt(null)} className="text-neutral-300 hover:bg-neutral-800">
              Cancelar
            </Button>
            <Button
              onClick={() => confirmDeleteAppt && handleDeleteAppt(confirmDeleteAppt)}
              className="bg-red-500/90 text-white hover:bg-red-500"
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[#c9a84c]/10 py-1.5">
      <span className="text-[10px] uppercase tracking-widest text-[#c9a84c]/70">{k}</span>
      <span className="text-right text-neutral-200">{v}</span>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="devi-hud-corner devi-fade-up rounded-xl border border-[#c9a84c]/25 bg-neutral-950/60 p-5 backdrop-blur">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">{label}</div>
          <div
            className="mt-2 text-3xl font-bold"
            style={{ fontFamily: "'Orbitron', sans-serif", color: "#f0d78c" }}
          >
            {value.toString().padStart(2, "0")}
          </div>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#c9a84c]/30 bg-black/40 text-[#f0d78c] shadow-[0_0_20px_-8px_#c9a84c]">
          {icon}
        </div>
      </div>
    </div>
  );
}

function IconBtn({
  children,
  label,
  onClick,
  danger,
}: {
  children: React.ReactNode;
  label: string;
  onClick?: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={
        "flex h-7 w-7 items-center justify-center rounded-md border transition " +
        (danger
          ? "border-red-500/30 text-red-400 hover:border-red-500 hover:bg-red-500/10"
          : "border-[#c9a84c]/30 text-[#c9a84c] hover:border-[#c9a84c] hover:bg-[#c9a84c]/10")
      }
    >
      {children}
    </button>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  className = "",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  className?: string;
  required?: boolean;
}) {
  return (
    <div className={"space-y-1.5 " + className}>
      <Label className="text-[10px] uppercase tracking-widest text-[#c9a84c]/80">{label}</Label>
      <Input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="border-[#c9a84c]/25 bg-black/50 text-neutral-100 placeholder:text-neutral-500 focus-visible:border-[#c9a84c] focus-visible:ring-[#c9a84c]/40"
      />
    </div>
  );
}