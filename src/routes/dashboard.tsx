import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
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
  MessageCircle,
  ClipboardList,
} from "lucide-react";
import {
  loadPatients,
  addPatient,
  updatePatient,
  deletePatient,
  type Patient,
} from "@/lib/devi-patients";
import {
  loadAppointments,
  addAppointment,
  updateAppointment,
  deleteAppointment,
  type Appointment,
  type EnrichedAppointment,
} from "@/lib/devi-appointments";
import {
  loadHistorias,
  addHistoria,
  deleteHistoria,
  type HistoriaClinica,
} from "@/lib/devi-historias";
import {
  getUser,
  logout as authLogout,
  isAuthenticated,
} from "@/lib/devi-auth";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSwipe } from "@/hooks/use-swipe";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "DEVI · Panel de pacientes" },
      {
        name: "description",
        content: "Gestión de pacientes en el panel DEVI.",
      },
      { property: "og:title", content: "DEVI · Panel" },
      { property: "og:description", content: "Gestión de pacientes DEVI." },
    ],
  }),
  component: Dashboard,
});

/* ─── Defaults ──────────────────────────────────────────────── */

const emptyPatient: Omit<Patient, "id"> = {
  nombre: "",
  cedula: "",
  telefono: "",
  whatsapp: "",
  direccion: "",
  correo: "",
  fechaIngreso: new Date().toISOString().slice(0, 10),
  encargado: "",
};

const emptyAppt: Omit<Appointment, "id"> = {
  cedula: "",
  fecha: new Date().toISOString().slice(0, 10),
  hora: "09:00",
  motivo: "",
  encargado: "",
  estado: "Pendiente",
};

const emptyHistoria: Omit<HistoriaClinica, "id"> = {
  paciente_id: "",
  fecha_consulta: new Date().toISOString().slice(0, 10),
  motivo_consulta: "",
  od_esfera: "",
  od_cilindro: "",
  od_eje: "",
  oi_esfera: "",
  oi_cilindro: "",
  oi_eje: "",
  dip: "",
  diagnostico: "",
  recomendaciones: "",
  proxima_cita: "",
};

type Section = "patients" | "appointments" | "historias";

/* ─── Dashboard ─────────────────────────────────────────────── */

function Dashboard() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [user, setUser] = useState("");
  const [section, setSection] = useState<Section>("patients");
  const [query, setQuery] = useState("");

  // Data
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [historias, setHistorias] = useState<HistoriaClinica[]>([]);

  // Patient dialogs
  const [form, setForm] = useState<Omit<Patient, "id">>(emptyPatient);
  const [openNew, setOpenNew] = useState(false);
  const [editing, setEditing] = useState<Patient | null>(null);
  const [viewing, setViewing] = useState<Patient | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Patient | null>(null);

  // Appointment dialogs
  const [apptForm, setApptForm] = useState<Omit<Appointment, "id">>(emptyAppt);
  const [openNewAppt, setOpenNewAppt] = useState(false);
  const [editingAppt, setEditingAppt] = useState<Appointment | null>(null);
  const [confirmDeleteAppt, setConfirmDeleteAppt] =
    useState<EnrichedAppointment | null>(null);

  // Historias dialogs
  const [histForm, setHistForm] =
    useState<Omit<HistoriaClinica, "id">>(emptyHistoria);
  const [openNewHist, setOpenNewHist] = useState(false);
  const [viewingHist, setViewingHist] = useState<HistoriaClinica | null>(null);
  const [confirmDeleteHist, setConfirmDeleteHist] =
    useState<HistoriaClinica | null>(null);

  // Swipe navigation
  const goNext = useCallback(() => {
    setSection((s) =>
      s === "patients"
        ? "appointments"
        : s === "appointments"
          ? "historias"
          : "historias",
    );
  }, []);
  const goPrev = useCallback(() => {
    setSection((s) =>
      s === "historias"
        ? "appointments"
        : s === "appointments"
          ? "patients"
          : "patients",
    );
  }, []);
  const swipeHandlers = useSwipe(goNext, goPrev);

  /* ─── Load data ─── */

  useEffect(() => {
    // Verificar autenticación
    if (!isAuthenticated()) {
      navigate({ to: "/" });
      return;
    }

    async function initData() {
      const [pData, aData, hData] = await Promise.all([
        loadPatients(),
        loadAppointments(),
        loadHistorias(),
      ]);
      setPatients(pData);
      setAppointments(aData);
      setHistorias(hData);

      const sessionUser = getUser();
      setUser(sessionUser?.username || "Operador");
    }
    initData();
  }, [navigate]);

  /* ─── Enriched appointments (resolve patient name by cedula) ─── */

  const enrichedAppts: EnrichedAppointment[] = useMemo(() => {
    return appointments.map((a) => {
      const patient = patients.find(
        (p) => a.cedula && p.cedula === String(a.cedula),
      );
      return {
        ...a,
        patientName: patient?.nombre || "—",
        _phone: patient?.whatsapp || patient?.telefono || "",
      };
    });
  }, [appointments, patients]);

  /* ─── Filters ─── */

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    if (!q) return patients;
    return patients.filter(
      (p) =>
        p.nombre?.toLowerCase().includes(q) ||
        p.cedula?.toString().toLowerCase().includes(q) ||
        p.correo?.toLowerCase().includes(q),
    );
  }, [patients, query]);

  const filteredAppts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return enrichedAppts;
    return enrichedAppts.filter((a) => {
      const fields = [
        a.patientName,
        a.id,
        a.motivo,
        a.encargado,
        a.cedula || "",
      ];
      return fields.some((f) => f.toLowerCase().includes(q));
    });
  }, [enrichedAppts, query]);

  const filteredHistorias = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return historias;
    return historias.filter((h) => {
      const fields = [h.paciente_id, h.motivo_consulta, h.diagnostico];
      return fields.some((f) => f?.toLowerCase().includes(q));
    });
  }, [historias, query]);

  /* ─── Stats ─── */

  const totals = useMemo(() => {
    const now = new Date();
    const thisMonth = patients.filter((p) => {
      const d = new Date(p.fechaIngreso);
      return (
        d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      );
    }).length;
    const encargados = new Set(patients.map((p) => p.encargado)).size;
    return { total: patients.length, thisMonth, encargados };
  }, [patients]);

  // apiPost removed as we are using direct Supabase calls

  async function refreshPatients() {
    setPatients(await loadPatients());
  }

  async function refreshAppointments() {
    setAppointments(await loadAppointments());
  }

  async function refreshHistorias() {
    setHistorias(await loadHistorias());
  }

  /* ─── Patient CRUD ─── */

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      await addPatient(form);
      setForm(emptyPatient);
      setOpenNew(false);
      await refreshPatients();
    } catch (error: any) {
      alert("Error al crear paciente: " + error.message);
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    try {
      await updatePatient(editing);
      setEditing(null);
      await refreshPatients();
    } catch (error: any) {
      alert("Error al actualizar paciente: " + error.message);
    }
  }

  async function handleDelete(p: Patient) {
    try {
      await deletePatient(p.id);
      await refreshPatients();
      setConfirmDelete(null);
    } catch (error: any) {
      console.error("Error al eliminar:", error);
      alert("No se pudo eliminar el paciente.");
    }
  }

  /* ─── Appointment CRUD ─── */

  function openCreateAppointmentFor(p?: Patient) {
    setApptForm({
      ...emptyAppt,
      cedula: p?.cedula ?? "",
      encargado: p?.encargado ?? "",
    });
    setOpenNewAppt(true);
  }

  async function handleCreateAppt(e: React.FormEvent) {
    e.preventDefault();
    try {
      await addAppointment({
        cedula: apptForm.cedula,
        fecha: apptForm.fecha,
        hora: apptForm.hora,
        motivo: apptForm.motivo,
        encargado: apptForm.encargado,
        estado: apptForm.estado,
      });
      setOpenNewAppt(false);
      setApptForm(emptyAppt);
      await refreshAppointments();
    } catch (error: any) {
      alert("Error al crear cita: " + error.message);
    }
  }

  async function handleUpdateAppt(e: React.FormEvent) {
    e.preventDefault();
    if (!editingAppt) return;

    try {
      await updateAppointment(editingAppt);
      setEditingAppt(null);
      await refreshAppointments();
    } catch (error: any) {
      console.error("Error actualizando cita:", error);
      alert("Error al actualizar cita: " + error.message);
    }
  }

  async function handleDeleteAppt(a: Appointment) {
    try {
      await deleteAppointment(a.id);
      setConfirmDeleteAppt(null);
      await refreshAppointments();
    } catch (error: any) {
      alert("Error al eliminar cita: " + error.message);
    }
  }

  /* ─── Historias CRUD ─── */

  function openCreateHistoriaFor(p?: Patient) {
    setHistForm({
      ...emptyHistoria,
      paciente_id: p?.cedula ?? p?.id ?? "",
    });
    setOpenNewHist(true);
  }

  async function handleCreateHistoria(e: React.FormEvent) {
    e.preventDefault();
    try {
      await addHistoria(histForm);
      setOpenNewHist(false);
      setHistForm(emptyHistoria);
      await refreshHistorias();
    } catch (error: any) {
      alert("Error al guardar historia: " + error.message);
    }
  }

  async function handleDeleteHistoria(h: HistoriaClinica) {
    try {
      await deleteHistoria(h.id);
      setConfirmDeleteHist(null);
      await refreshHistorias();
    } catch (error: any) {
      alert("Error al eliminar historia: " + error.message);
    }
  }

  /* ─── Logout ─── */

  function handleLogout() {
    authLogout();
    navigate({ to: "/" });
  }

  /* ─── Render ──────────────────────────────────────────────── */

  return (
    <div className="devi-circuit-bg min-h-screen bg-neutral-950 text-neutral-100">
      <div className="flex min-h-screen">
        {/* ── Sidebar (desktop) ── */}
        <aside className="hidden w-64 shrink-0 border-r border-[#c9a84c]/20 bg-black/60 backdrop-blur-xl md:flex md:flex-col">
          <div className="flex items-center gap-3 border-b border-[#c9a84c]/20 px-5 py-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#c9a84c]/40 bg-neutral-950 shadow-[0_0_20px_-6px_#c9a84c]">
              <Gamepad2 className="h-5 w-5" style={{ color: "#f0d78c" }} />
            </div>
            <div>
              <div
                className="text-lg font-black tracking-[0.3em]"
                style={{
                  fontFamily: "'Orbitron', sans-serif",
                  color: "#f0d78c",
                }}
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
            <SidebarBtn
              active={section === "patients"}
              onClick={() => setSection("patients")}
              icon={<Users className="h-4 w-4" />}
              label="PACIENTES"
            />
            <SidebarBtn
              active={section === "appointments"}
              onClick={() => setSection("appointments")}
              icon={<CalendarClock className="h-4 w-4" />}
              label="CITAS"
            />
            <SidebarBtn
              active={section === "historias"}
              onClick={() => setSection("historias")}
              icon={<ClipboardList className="h-4 w-4" />}
              label="HISTORIAS CLÍNICAS"
            />
          </nav>
        </aside>

        {/* ── Main ── */}
        <main
          className="flex-1 min-w-0 overflow-x-hidden pb-20 md:pb-0"
          {...swipeHandlers}
        >
          {/* Header */}
          <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[#c9a84c]/20 bg-black/60 px-4 py-3 backdrop-blur-xl sm:px-6 sm:py-4">
            <div>
              <h1
                className="text-lg font-bold tracking-widest sm:text-2xl"
                style={{
                  fontFamily: "'Orbitron', sans-serif",
                  color: "#f0d78c",
                }}
              >
                {section === "patients"
                  ? "PANEL DE PACIENTES"
                  : section === "appointments"
                    ? "PANEL DE CITAS"
                    : "HISTORIAS CLÍNICAS"}
              </h1>
              <p className="text-xs text-neutral-500">
                {section === "patients"
                  ? "Gestión y seguimiento de clientes DEVI"
                  : section === "appointments"
                    ? "Agenda y control de citas"
                    : "Registro de optometrías y consultas"}
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden text-right sm:block">
                <div className="text-xs text-neutral-500">Operador</div>
                <div className="text-sm font-medium text-neutral-200">
                  {user}
                </div>
              </div>
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#c9a84c]/40 bg-neutral-950 text-sm font-bold"
                style={{ color: "#f0d78c" }}
              >
                {user.slice(0, 1).toUpperCase() || "D"}
              </div>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="border-[#c9a84c]/30 bg-transparent text-neutral-200 hover:bg-[#c9a84c]/10 hover:text-[#f0d78c]"
              >
                <LogOut className="mr-1 h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Salir</span>
              </Button>
            </div>
          </header>

          <div className="space-y-6 p-4 sm:p-6">
            {/* Stats */}
            {section === "patients" ? (
              <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
                <StatCard
                  label="Total pacientes"
                  value={totals.total}
                  icon={<Users className="h-5 w-5" />}
                />
                <StatCard
                  label="Nuevos este mes"
                  value={totals.thisMonth}
                  icon={<UserPlus className="h-5 w-5" />}
                />
                <StatCard
                  label="Encargados activos"
                  value={totals.encargados}
                  icon={<ShieldCheck className="h-5 w-5" />}
                  className="col-span-2 md:col-span-1"
                />
              </div>
            ) : section === "appointments" ? (
              <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
                <StatCard
                  label="Total citas"
                  value={enrichedAppts.length}
                  icon={<CalendarClock className="h-5 w-5" />}
                />
                <StatCard
                  label="Pendientes"
                  value={
                    enrichedAppts.filter((a) => a.estado === "Pendiente").length
                  }
                  icon={<CalendarPlus className="h-5 w-5" />}
                />
                <StatCard
                  label="Confirmadas"
                  value={
                    enrichedAppts.filter((a) => a.estado === "Confirmada")
                      .length
                  }
                  icon={<ShieldCheck className="h-5 w-5" />}
                  className="col-span-2 md:col-span-1"
                />
              </div>
            ) : (
              <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
                <StatCard
                  label="Total historias"
                  value={historias.length}
                  icon={<ClipboardList className="h-5 w-5" />}
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
                      ? "Buscar por nombre, cédula, correo..."
                      : section === "appointments"
                        ? "Buscar cita por paciente, motivo..."
                        : "Buscar historia por cédula o diagnóstico..."
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
                      style={{
                        fontFamily: "'Rajdhani', sans-serif",
                        letterSpacing: "0.08em",
                      }}
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
                ) : section === "appointments" ? (
                  <Button
                    onClick={() => openCreateAppointmentFor()}
                    className="bg-gradient-to-r from-[#c9a84c] to-[#e6c66a] font-semibold uppercase tracking-widest text-neutral-900 shadow-[0_0_25px_-6px_#c9a84c] transition hover:scale-[1.02] hover:from-[#e6c66a] hover:to-[#c9a84c]"
                    style={{ fontFamily: "'Rajdhani', sans-serif" }}
                  >
                    <CalendarPlus className="mr-2 h-4 w-4" />
                    NUEVA CITA
                  </Button>
                ) : (
                  <Button
                    onClick={() => openCreateHistoriaFor()}
                    className="bg-gradient-to-r from-[#c9a84c] to-[#e6c66a] font-semibold uppercase tracking-widest text-neutral-900 shadow-[0_0_25px_-6px_#c9a84c] transition hover:scale-[1.02] hover:from-[#e6c66a] hover:to-[#c9a84c]"
                    style={{ fontFamily: "'Rajdhani', sans-serif" }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    NUEVA HISTORIA
                  </Button>
                )}
              </div>
            </div>

            {/* ── Table: Patients ── */}
            {section === "patients" ? (
              <div className="devi-hud-corner rounded-xl border border-[#c9a84c]/25 bg-neutral-950/60 backdrop-blur min-w-0">
                <div className="overflow-x-auto devi-touch-scroll">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-[#c9a84c]/20 hover:bg-transparent">
                        {[
                          "ID",
                          "Nombre",
                          "Cédula",
                          "Teléfono",
                          "Ingreso",
                          "Encargado",
                          "Acciones",
                        ].map((h) => (
                          <TableHead
                            key={h}
                            className="text-[10px] uppercase tracking-[0.2em] text-[#c9a84c]/80 whitespace-nowrap"
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
                          <TableCell className="font-mono text-xs text-[#f0d78c]">
                            {p.id}
                          </TableCell>
                          <TableCell className="font-medium whitespace-nowrap">
                            {p.nombre}
                          </TableCell>
                          <TableCell className="font-medium">
                            {p.cedula}
                          </TableCell>
                          <TableCell className="text-neutral-400">
                            {p.telefono}
                          </TableCell>
                          <TableCell className="text-neutral-400">
                            {p.fechaIngreso}
                          </TableCell>
                          <TableCell className="text-neutral-300">
                            {p.encargado}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <IconBtn
                                label="Crear cita"
                                onClick={() => openCreateAppointmentFor(p)}
                              >
                                <CalendarPlus className="h-3.5 w-3.5" />
                              </IconBtn>
                              <IconBtn
                                label="Ver"
                                onClick={() => setViewing(p)}
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </IconBtn>
                              <IconBtn
                                label="Editar"
                                onClick={() => setEditing({ ...p })}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </IconBtn>
                              <IconBtn
                                label="Eliminar"
                                onClick={() => setConfirmDelete(p)}
                                danger
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </IconBtn>
                              <WhatsAppLink
                                phone={p.whatsapp || p.telefono}
                                message={`Hola ${(p.nombre || "Cliente").split(" ")[0]},`}
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filtered.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={7}
                            className="py-10 text-center text-sm text-neutral-500"
                          >
                            Sin resultados para "{query}"
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : section === "appointments" ? (
              /* ── Table: Appointments ── */
              <div className="devi-hud-corner rounded-xl border border-[#c9a84c]/25 bg-neutral-950/60 backdrop-blur min-w-0">
                <div className="overflow-x-auto devi-touch-scroll">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-[#c9a84c]/20 hover:bg-transparent">
                        {[
                          "ID",
                          "Cédula",
                          "Paciente",
                          "Fecha",
                          "Hora",
                          "Motivo",
                          "Encargado",
                          "Estado",
                          "",
                        ].map((h) => (
                          <TableHead
                            key={h || "actions"}
                            className="text-[10px] uppercase tracking-[0.2em] text-[#c9a84c]/80 whitespace-nowrap"
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
                          <TableCell className="font-mono text-xs text-[#f0d78c]">
                            {a.id}
                          </TableCell>
                          <TableCell className="font-medium text-neutral-400 text-sm">
                            {a.cedula}
                          </TableCell>
                          <TableCell className="font-medium whitespace-nowrap">
                            {a.patientName}
                          </TableCell>
                          <TableCell className="text-neutral-400">
                            {a.fecha}
                          </TableCell>
                          <TableCell className="text-neutral-400">
                            {a.hora}
                          </TableCell>
                          <TableCell className="max-w-[220px] truncate text-neutral-400">
                            {a.motivo}
                          </TableCell>
                          <TableCell className="text-neutral-300">
                            {a.encargado}
                          </TableCell>
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
                              <IconBtn
                                label="Editar"
                                onClick={() =>
                                  setEditingAppt({
                                    id: a.id,
                                    cedula: a.cedula,
                                    fecha: a.fecha,
                                    hora: a.hora,
                                    motivo: a.motivo,
                                    encargado: a.encargado,
                                    estado: a.estado,
                                  })
                                }
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </IconBtn>
                              <IconBtn
                                label="Eliminar"
                                onClick={() => setConfirmDeleteAppt(a)}
                                danger
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </IconBtn>
                              <WhatsAppLink
                                phone={a._phone}
                                message={`Hola ${(a.patientName || "Cliente").split(" ")[0]}, te recordamos tu cita el ${a.fecha} a las ${a.hora} para ${a.motivo}.`}
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredAppts.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={9}
                            className="py-10 text-center text-sm text-neutral-500"
                          >
                            Sin citas registradas
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : (
              /* ── Table: Historias ── */
              <div className="devi-hud-corner rounded-xl border border-[#c9a84c]/25 bg-neutral-950/60 backdrop-blur min-w-0">
                <div className="overflow-x-auto devi-touch-scroll">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-[#c9a84c]/20 hover:bg-transparent">
                        {[
                          "ID",
                          "Paciente",
                          "Fecha",
                          "Motivo",
                          "Diagnóstico",
                          "DIP",
                          "Acciones",
                        ].map((h) => (
                          <TableHead
                            key={h || "actions"}
                            className="text-[10px] uppercase tracking-[0.2em] text-[#c9a84c]/80 whitespace-nowrap"
                            style={{ fontFamily: "'Rajdhani', sans-serif" }}
                          >
                            {h}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredHistorias.map((h, i) => {
                        const pName =
                          patients.find(
                            (p) =>
                              p.cedula === h.paciente_id ||
                              p.id === h.paciente_id,
                          )?.nombre || h.paciente_id;
                        return (
                          <TableRow
                            key={h.id}
                            className="devi-fade-up border-[#c9a84c]/10 text-sm text-neutral-200 transition-colors hover:bg-[#c9a84c]/5"
                            style={{ animationDelay: `${i * 30}ms` }}
                          >
                            <TableCell className="font-mono text-xs text-[#f0d78c]">
                              {h.id}
                            </TableCell>
                            <TableCell className="font-medium whitespace-nowrap">
                              {pName}
                            </TableCell>
                            <TableCell className="text-neutral-400">
                              {h.fecha_consulta}
                            </TableCell>
                            <TableCell className="max-w-[150px] truncate text-neutral-400">
                              {h.motivo_consulta}
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate text-neutral-400">
                              {h.diagnostico}
                            </TableCell>
                            <TableCell className="text-neutral-400">
                              {h.dip}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <IconBtn
                                  label="Ver"
                                  onClick={() => setViewingHist(h)}
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </IconBtn>
                                <IconBtn
                                  label="Eliminar"
                                  onClick={() => setConfirmDeleteHist(h)}
                                  danger
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </IconBtn>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {filteredHistorias.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={7}
                            className="py-10 text-center text-sm text-neutral-500"
                          >
                            Sin historias registradas
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

      {/* ── Mobile bottom nav ── */}
      {isMobile && (
        <nav className="devi-mobile-nav fixed bottom-0 left-0 right-0 z-20 flex items-center justify-around border-t border-[#c9a84c]/20 bg-black/90 backdrop-blur-xl md:hidden">
          <MobileNavBtn
            active={section === "patients"}
            onClick={() => setSection("patients")}
            icon={<Users className="h-5 w-5" />}
            label="Pacientes"
          />
          <MobileNavBtn
            active={section === "appointments"}
            onClick={() => setSection("appointments")}
            icon={<CalendarClock className="h-5 w-5" />}
            label="Citas"
          />
          <MobileNavBtn
            active={section === "historias"}
            onClick={() => setSection("historias")}
            icon={<ClipboardList className="h-5 w-5" />}
            label="Historias"
          />
        </nav>
      )}

      {/* ═══ DIALOGS ═══════════════════════════════════════════ */}

      {/* Historias Dialogs */}

      <Dialog open={openNewHist} onOpenChange={setOpenNewHist}>
        <DialogContent className="max-w-3xl border-[#c9a84c]/30 bg-neutral-950 text-neutral-100 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle
              style={{
                color: "#f0d78c",
                fontFamily: "'Rajdhani', sans-serif",
                letterSpacing: "0.1em",
              }}
            >
              NUEVA HISTORIA CLÍNICA
            </DialogTitle>
            <DialogDescription className="text-neutral-400">
              Registrar nueva optometría.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={handleCreateHistoria}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            <div className="space-y-1.5 sm:col-span-2 relative">
              <Label className="text-[10px] uppercase tracking-widest text-[#c9a84c]/80">
                Paciente (Cédula o Nombre)
              </Label>
              <Input
                placeholder="Buscar paciente..."
                value={histForm.paciente_id}
                onChange={(e) =>
                  setHistForm({ ...histForm, paciente_id: e.target.value })
                }
                className="h-9 w-full rounded-md border border-[#c9a84c]/25 bg-black/50 px-3 text-sm text-neutral-100"
              />
              {histForm.paciente_id &&
                !patients.find(
                  (p) =>
                    p.cedula === histForm.paciente_id ||
                    p.id === histForm.paciente_id,
                ) && (
                  <ul className="absolute z-50 mt-1 max-h-40 w-full overflow-auto rounded-md border border-[#c9a84c]/20 bg-neutral-900 shadow-xl">
                    {patients
                      .filter(
                        (p) =>
                          p.cedula.includes(histForm.paciente_id) ||
                          p.nombre
                            .toLowerCase()
                            .includes(histForm.paciente_id.toLowerCase()),
                      )
                      .map((p) => (
                        <li
                          key={p.id}
                          className="cursor-pointer px-3 py-2 text-sm text-neutral-100 hover:bg-[#c9a84c]/20"
                          onClick={() =>
                            setHistForm({ ...histForm, paciente_id: p.cedula })
                          }
                        >
                          <span className="font-mono text-[#f0d78c]">
                            {p.cedula}
                          </span>{" "}
                          — {p.nombre}
                        </li>
                      ))}
                  </ul>
                )}
            </div>

            <Field
              label="Fecha Consulta"
              type="date"
              value={histForm.fecha_consulta}
              onChange={(v) => setHistForm({ ...histForm, fecha_consulta: v })}
              required
            />
            <Field
              label="Motivo de Consulta"
              value={histForm.motivo_consulta}
              onChange={(v) => setHistForm({ ...histForm, motivo_consulta: v })}
              required
            />

            <div className="sm:col-span-2 p-3 border border-[#c9a84c]/20 rounded-md bg-black/40">
              <h4 className="text-xs uppercase tracking-widest text-[#f0d78c] mb-3">
                Refracción - Ojo Derecho (OD)
              </h4>
              <div className="grid grid-cols-3 gap-3">
                <Field
                  label="Esfera"
                  value={histForm.od_esfera}
                  onChange={(v) => setHistForm({ ...histForm, od_esfera: v })}
                />
                <Field
                  label="Cilindro"
                  value={histForm.od_cilindro}
                  onChange={(v) => setHistForm({ ...histForm, od_cilindro: v })}
                />
                <Field
                  label="Eje"
                  value={histForm.od_eje}
                  onChange={(v) => setHistForm({ ...histForm, od_eje: v })}
                />
              </div>
            </div>

            <div className="sm:col-span-2 p-3 border border-[#c9a84c]/20 rounded-md bg-black/40">
              <h4 className="text-xs uppercase tracking-widest text-[#f0d78c] mb-3">
                Refracción - Ojo Izquierdo (OI)
              </h4>
              <div className="grid grid-cols-3 gap-3">
                <Field
                  label="Esfera"
                  value={histForm.oi_esfera}
                  onChange={(v) => setHistForm({ ...histForm, oi_esfera: v })}
                />
                <Field
                  label="Cilindro"
                  value={histForm.oi_cilindro}
                  onChange={(v) => setHistForm({ ...histForm, oi_cilindro: v })}
                />
                <Field
                  label="Eje"
                  value={histForm.oi_eje}
                  onChange={(v) => setHistForm({ ...histForm, oi_eje: v })}
                />
              </div>
            </div>

            <Field
              label="DIP"
              value={histForm.dip}
              onChange={(v) => setHistForm({ ...histForm, dip: v })}
            />
            <Field
              label="Próxima Cita"
              type="date"
              value={histForm.proxima_cita}
              onChange={(v) => setHistForm({ ...histForm, proxima_cita: v })}
            />

            <div className="sm:col-span-2 space-y-1.5">
              <Label className="text-[10px] uppercase tracking-widest text-[#c9a84c]/80">
                Diagnóstico
              </Label>
              <textarea
                value={histForm.diagnostico}
                onChange={(e) =>
                  setHistForm({ ...histForm, diagnostico: e.target.value })
                }
                className="w-full h-20 rounded-md border border-[#c9a84c]/25 bg-black/50 p-2 text-sm text-neutral-100"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <Label className="text-[10px] uppercase tracking-widest text-[#c9a84c]/80">
                Recomendaciones
              </Label>
              <textarea
                value={histForm.recomendaciones}
                onChange={(e) =>
                  setHistForm({ ...histForm, recomendaciones: e.target.value })
                }
                className="w-full h-20 rounded-md border border-[#c9a84c]/25 bg-black/50 p-2 text-sm text-neutral-100"
              />
            </div>

            <DialogFooter className="sm:col-span-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpenNewHist(false)}
                className="text-neutral-300 hover:bg-neutral-800"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-[#c9a84c] text-neutral-900 hover:bg-[#e6c66a]"
              >
                Guardar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!viewingHist}
        onOpenChange={(o) => !o && setViewingHist(null)}
      >
        <DialogContent className="max-w-2xl border-[#c9a84c]/30 bg-neutral-950 text-neutral-100">
          <DialogHeader>
            <DialogTitle
              style={{
                color: "#f0d78c",
                fontFamily: "'Rajdhani', sans-serif",
                letterSpacing: "0.1em",
              }}
            >
              HISTORIA CLÍNICA · {viewingHist?.id}
            </DialogTitle>
          </DialogHeader>
          {viewingHist && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4 rounded-lg bg-black/40 p-4 border border-[#c9a84c]/20">
                <DetailRow k="Fecha" v={viewingHist.fecha_consulta} />
                <DetailRow k="Próxima" v={viewingHist.proxima_cita || "—"} />
                <DetailRow k="Motivo" v={viewingHist.motivo_consulta} />
                <DetailRow k="DIP" v={viewingHist.dip} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-black/40 p-4 border border-[#c9a84c]/20">
                  <h4 className="text-[10px] font-bold text-[#f0d78c] uppercase mb-2">
                    OD
                  </h4>
                  <DetailRow k="Esfera" v={viewingHist.od_esfera} />
                  <DetailRow k="Cilindro" v={viewingHist.od_cilindro} />
                  <DetailRow k="Eje" v={viewingHist.od_eje} />
                </div>
                <div className="rounded-lg bg-black/40 p-4 border border-[#c9a84c]/20">
                  <h4 className="text-[10px] font-bold text-[#f0d78c] uppercase mb-2">
                    OI
                  </h4>
                  <DetailRow k="Esfera" v={viewingHist.oi_esfera} />
                  <DetailRow k="Cilindro" v={viewingHist.oi_cilindro} />
                  <DetailRow k="Eje" v={viewingHist.oi_eje} />
                </div>
              </div>
              <div className="rounded-lg bg-black/40 p-4 border border-[#c9a84c]/20">
                <h4 className="text-[10px] font-bold text-[#f0d78c] uppercase mb-2">
                  Diagnóstico
                </h4>
                <p className="text-neutral-300">{viewingHist.diagnostico}</p>
                <h4 className="text-[10px] font-bold text-[#f0d78c] uppercase mt-4 mb-2">
                  Recomendaciones
                </h4>
                <p className="text-neutral-300">
                  {viewingHist.recomendaciones}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!confirmDeleteHist}
        onOpenChange={(o) => !o && setConfirmDeleteHist(null)}
      >
        <DialogContent className="border-[#c9a84c]/30 bg-neutral-950 text-neutral-100">
          <DialogHeader>
            <DialogTitle className="text-red-400">
              Eliminar historia
            </DialogTitle>
            <DialogDescription className="text-neutral-400">
              ¿Eliminar historia {confirmDeleteHist?.id}? Esta acción no se
              puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setConfirmDeleteHist(null)}
              className="text-neutral-300 hover:bg-neutral-800"
            >
              Cancelar
            </Button>
            <Button
              onClick={() =>
                confirmDeleteHist && handleDeleteHistoria(confirmDeleteHist)
              }
              className="bg-red-500/90 text-white hover:bg-red-500"
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══ DIALOGS ═══════════════════════════════════════════ */}

      {/* New patient */}
      <Dialog open={openNew} onOpenChange={setOpenNew}>
        <DialogContent className="max-w-lg border-[#c9a84c]/30 bg-neutral-950 text-neutral-100">
          <DialogHeader>
            <DialogTitle
              style={{
                color: "#f0d78c",
                fontFamily: "'Rajdhani', sans-serif",
                letterSpacing: "0.1em",
              }}
            >
              NUEVO PACIENTE
            </DialogTitle>
            <DialogDescription className="text-neutral-400">
              Registra un nuevo paciente en el sistema.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={handleCreate}
            className="grid grid-cols-1 gap-3 sm:grid-cols-2"
          >
            <Field
              label="Nombre"
              value={form.nombre}
              onChange={(v) => setForm({ ...form, nombre: v })}
              required
            />
            <Field
              label="Cédula"
              value={form.cedula}
              onChange={(v) => setForm({ ...form, cedula: v })}
              required
            />
            <Field
              label="Teléfono"
              value={form.telefono}
              onChange={(v) => setForm({ ...form, telefono: v })}
            />
            <Field
              label="WhatsApp"
              value={form.whatsapp}
              onChange={(v) => setForm({ ...form, whatsapp: v })}
            />
            <Field
              label="Correo"
              type="email"
              value={form.correo}
              onChange={(v) => setForm({ ...form, correo: v })}
            />
            <Field
              label="Dirección"
              value={form.direccion}
              onChange={(v) => setForm({ ...form, direccion: v })}
              className="sm:col-span-2"
            />
            <Field
              label="Fecha de ingreso"
              type="date"
              value={form.fechaIngreso}
              onChange={(v) => setForm({ ...form, fechaIngreso: v })}
            />
            <Field
              label="Encargado"
              value={form.encargado}
              onChange={(v) => setForm({ ...form, encargado: v })}
            />
            <DialogFooter className="sm:col-span-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpenNew(false)}
                className="text-neutral-300 hover:bg-neutral-800"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-[#c9a84c] text-neutral-900 hover:bg-[#e6c66a]"
              >
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
            <DialogTitle
              style={{
                color: "#f0d78c",
                fontFamily: "'Rajdhani', sans-serif",
                letterSpacing: "0.1em",
              }}
            >
              EDITAR PACIENTE · {editing?.id}
            </DialogTitle>
            <DialogDescription className="text-neutral-400">
              Actualiza la información del paciente.
            </DialogDescription>
          </DialogHeader>
          {editing && (
            <form
              onSubmit={handleUpdate}
              className="grid grid-cols-1 gap-3 sm:grid-cols-2"
            >
              <Field
                label="Nombre"
                value={editing.nombre}
                onChange={(v) => setEditing({ ...editing, nombre: v })}
                required
              />
              <Field
                label="Cédula"
                value={editing.cedula}
                onChange={(v) => setEditing({ ...editing, cedula: v })}
                required
              />
              <Field
                label="Teléfono"
                value={editing.telefono}
                onChange={(v) => setEditing({ ...editing, telefono: v })}
              />
              <Field
                label="WhatsApp"
                value={editing.whatsapp}
                onChange={(v) => setEditing({ ...editing, whatsapp: v })}
              />
              <Field
                label="Correo"
                type="email"
                value={editing.correo}
                onChange={(v) => setEditing({ ...editing, correo: v })}
              />
              <Field
                label="Dirección"
                value={editing.direccion}
                onChange={(v) => setEditing({ ...editing, direccion: v })}
                className="sm:col-span-2"
              />
              <Field
                label="Fecha de ingreso"
                type="date"
                value={editing.fechaIngreso}
                onChange={(v) => setEditing({ ...editing, fechaIngreso: v })}
              />
              <Field
                label="Encargado"
                value={editing.encargado}
                onChange={(v) => setEditing({ ...editing, encargado: v })}
              />
              <DialogFooter className="sm:col-span-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setEditing(null)}
                  className="text-neutral-300 hover:bg-neutral-800"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-[#c9a84c] text-neutral-900 hover:bg-[#e6c66a]"
                >
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
            <DialogTitle
              style={{
                color: "#f0d78c",
                fontFamily: "'Rajdhani', sans-serif",
                letterSpacing: "0.1em",
              }}
            >
              PACIENTE · {viewing?.id}
            </DialogTitle>
          </DialogHeader>
          {viewing && (
            <div className="space-y-2 text-sm">
              <DetailRow k="Nombre" v={viewing.nombre} />
              <DetailRow k="Cédula" v={viewing.cedula} />
              <DetailRow k="Teléfono" v={viewing.telefono} />
              <DetailRow k="WhatsApp" v={viewing.whatsapp} />
              <DetailRow k="Correo" v={viewing.correo} />
              <DetailRow k="Dirección" v={viewing.direccion} />
              <DetailRow k="Ingreso" v={viewing.fechaIngreso} />
              <DetailRow k="Encargado" v={viewing.encargado} />
              <div className="pt-3">
                <div className="mb-2 text-[10px] uppercase tracking-widest text-[#c9a84c]/70">
                  Citas asociadas
                </div>
                <div className="max-h-40 space-y-1 overflow-auto">
                  {appointments
                    .filter((a) => a.patientId === viewing.id)
                    .map((a) => (
                      <div
                        key={a.id}
                        className="flex items-center justify-between rounded border border-[#c9a84c]/15 bg-black/40 px-2 py-1 text-xs"
                      >
                        <span className="font-mono text-[#f0d78c]">{a.id}</span>
                        <span className="text-neutral-300">
                          {a.fecha} · {a.hora}
                        </span>
                        <span className="text-neutral-500">{a.estado}</span>
                      </div>
                    ))}
                  {appointments.filter((a) => a.patientId === viewing.id)
                    .length === 0 && (
                    <div className="text-xs text-neutral-500">
                      Sin citas registradas.
                    </div>
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

      {/* Delete patient confirm */}
      <Dialog
        open={!!confirmDelete}
        onOpenChange={(o) => !o && setConfirmDelete(null)}
      >
        <DialogContent className="border-[#c9a84c]/30 bg-neutral-950 text-neutral-100">
          <DialogHeader>
            <DialogTitle className="text-red-400">
              Eliminar paciente
            </DialogTitle>
            <DialogDescription className="text-neutral-400">
              ¿Seguro que quieres eliminar a{" "}
              <span className="text-neutral-100">{confirmDelete?.nombre}</span>?
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setConfirmDelete(null)}
              className="text-neutral-300 hover:bg-neutral-800"
            >
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
            <DialogTitle
              style={{
                color: "#f0d78c",
                fontFamily: "'Rajdhani', sans-serif",
                letterSpacing: "0.1em",
              }}
            >
              NUEVA CITA
            </DialogTitle>
            <DialogDescription className="text-neutral-400">
              Programa una cita para un paciente.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={handleCreateAppt}
            className="grid grid-cols-1 gap-3 sm:grid-cols-2"
          >
            <div className="space-y-1.5 sm:col-span-2 relative">
              <Label className="text-[10px] uppercase tracking-widest text-[#c9a84c]">
                Paciente
              </Label>
              <Input
                placeholder="Busca por ID, nombre o cédula..."
                value={apptForm.patientId}
                onChange={(e) =>
                  setApptForm({
                    ...apptForm,
                    patientId: e.target.value,
                    patientName: "",
                  })
                }
                className="h-9 w-full rounded-md border border-[#c9a84c]/20 bg-neutral-900 px-3 text-sm text-neutral-100 focus:border-[#c9a84c] focus:outline-none"
              />
              {apptForm.patientId && !apptForm.patientName && (
                <ul className="absolute z-50 mt-1 max-h-40 w-full overflow-auto rounded-md border border-[#c9a84c]/20 bg-neutral-900 shadow-xl">
                  {patients
                    .filter((p) => {
                      const q = apptForm.patientId.toLowerCase();
                      return (
                        p.id.toLowerCase().includes(q) ||
                        p.nombre.toLowerCase().includes(q) ||
                        (p.cedula || "").toString().toLowerCase().includes(q)
                      );
                    })
                    .map((p) => (
                      <li
                        key={p.id}
                        className="cursor-pointer px-3 py-2 text-sm text-neutral-100 hover:bg-[#c9a84c]/20"
                        onClick={() =>
                          setApptForm({
                            ...apptForm,
                            patientId: p.id,
                            patientName: p.nombre,
                            cedula: p.cedula,
                            encargado: p.encargado,
                          })
                        }
                      >
                        <span className="font-mono text-[#f0d78c]">{p.id}</span>{" "}
                        · {p.nombre}
                      </li>
                    ))}
                </ul>
              )}
            </div>
            <Field
              label="Fecha"
              type="date"
              value={apptForm.fecha}
              onChange={(v) => setApptForm({ ...apptForm, fecha: v })}
              required
            />
            <Field
              label="Hora"
              type="time"
              value={apptForm.hora}
              onChange={(v) => setApptForm({ ...apptForm, hora: v })}
              required
            />
            <Field
              label="Motivo"
              value={apptForm.motivo}
              onChange={(v) => setApptForm({ ...apptForm, motivo: v })}
              className="sm:col-span-2"
              required
            />
            <Field
              label="Encargado"
              value={apptForm.encargado}
              onChange={(v) => setApptForm({ ...apptForm, encargado: v })}
            />
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-widest text-[#c9a84c]/80">
                Estado
              </Label>
              <select
                value={apptForm.estado}
                onChange={(e) =>
                  setApptForm({
                    ...apptForm,
                    estado: e.target.value as Appointment["estado"],
                  })
                }
                className="h-9 w-full rounded-md border border-[#c9a84c]/25 bg-black/50 px-3 text-sm text-neutral-100 focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/40"
              >
                <option>Pendiente</option>
                <option>Confirmada</option>
                <option>Cancelada</option>
                <option>Realizada</option>
              </select>
            </div>
            <DialogFooter className="sm:col-span-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpenNewAppt(false)}
                className="text-neutral-300 hover:bg-neutral-800"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-[#c9a84c] text-neutral-900 hover:bg-[#e6c66a]"
              >
                Guardar cita
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit appointment */}
      <Dialog
        open={!!editingAppt}
        onOpenChange={(o) => !o && setEditingAppt(null)}
      >
        <DialogContent className="max-w-lg border-[#c9a84c]/30 bg-neutral-950 text-neutral-100">
          <DialogHeader>
            <DialogTitle
              style={{
                color: "#f0d78c",
                fontFamily: "'Rajdhani', sans-serif",
                letterSpacing: "0.1em",
              }}
            >
              EDITAR CITA · {editingAppt?.id}
            </DialogTitle>
            <DialogDescription className="text-neutral-400">
              Modifica los datos de la cita.
            </DialogDescription>
          </DialogHeader>
          {editingAppt && (
            <form
              onSubmit={handleUpdateAppt}
              className="grid grid-cols-1 gap-3 sm:grid-cols-2"
            >
              <div className="space-y-1.5 sm:col-span-2 relative">
                <Label className="text-[10px] uppercase tracking-widest text-[#c9a84c]/80">
                  Paciente (Cédula)
                </Label>
                <Input
                  placeholder="Cédula del paciente..."
                  value={editingAppt.cedula}
                  onChange={(e) =>
                    setEditingAppt({ ...editingAppt, cedula: e.target.value })
                  }
                  className="h-9 w-full rounded-md border border-[#c9a84c]/25 bg-black/50 px-3 text-sm text-neutral-100"
                />
                {editingAppt.cedula &&
                  !patients.find((p) => p.cedula === editingAppt.cedula) && (
                    <ul className="absolute z-50 mt-1 max-h-40 w-full overflow-auto rounded-md border border-[#c9a84c]/20 bg-neutral-900 shadow-xl">
                      {patients
                        .filter(
                          (p) =>
                            p.cedula.includes(editingAppt.cedula) ||
                            p.nombre
                              .toLowerCase()
                              .includes(editingAppt.cedula.toLowerCase()),
                        )
                        .map((p) => (
                          <li
                            key={p.id}
                            className="cursor-pointer px-3 py-2 text-sm text-neutral-100 hover:bg-[#c9a84c]/20"
                            onClick={() =>
                              setEditingAppt({
                                ...editingAppt,
                                cedula: p.cedula,
                                encargado: p.encargado,
                              })
                            }
                          >
                            <span className="font-mono text-[#f0d78c]">
                              {p.cedula}
                            </span>{" "}
                            — {p.nombre}
                          </li>
                        ))}
                    </ul>
                  )}
                {patients.find((p) => p.cedula === editingAppt.cedula) && (
                  <p className="text-xs text-emerald-400 mt-1">
                    ✓{" "}
                    {
                      patients.find((p) => p.cedula === editingAppt.cedula)
                        ?.nombre
                    }
                  </p>
                )}
              </div>
              <Field
                label="Fecha"
                type="date"
                value={editingAppt.fecha}
                onChange={(v) => setEditingAppt({ ...editingAppt, fecha: v })}
                required
              />
              <Field
                label="Hora"
                type="time"
                value={editingAppt.hora}
                onChange={(v) => setEditingAppt({ ...editingAppt, hora: v })}
                required
              />
              <Field
                label="Motivo"
                value={editingAppt.motivo}
                onChange={(v) => setEditingAppt({ ...editingAppt, motivo: v })}
                className="sm:col-span-2"
                required
              />
              <Field
                label="Encargado"
                value={editingAppt.encargado}
                onChange={(v) =>
                  setEditingAppt({ ...editingAppt, encargado: v })
                }
              />
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-widest text-[#c9a84c]/80">
                  Estado
                </Label>
                <select
                  value={editingAppt.estado}
                  onChange={(e) =>
                    setEditingAppt({
                      ...editingAppt,
                      estado: e.target.value as Appointment["estado"],
                    })
                  }
                  className="h-9 w-full rounded-md border border-[#c9a84c]/25 bg-black/50 px-3 text-sm text-neutral-100"
                >
                  <option>Pendiente</option>
                  <option>Confirmada</option>
                  <option>Cancelada</option>
                  <option>Realizada</option>
                </select>
              </div>
              <DialogFooter className="sm:col-span-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setEditingAppt(null)}
                  className="text-neutral-300 hover:bg-neutral-800"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-[#c9a84c] text-neutral-900 hover:bg-[#e6c66a]"
                >
                  Guardar cambios
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete appointment confirm */}
      <Dialog
        open={!!confirmDeleteAppt}
        onOpenChange={(o) => !o && setConfirmDeleteAppt(null)}
      >
        <DialogContent className="border-[#c9a84c]/30 bg-neutral-950 text-neutral-100">
          <DialogHeader>
            <DialogTitle className="text-red-400">Eliminar cita</DialogTitle>
            <DialogDescription className="text-neutral-400">
              ¿Eliminar la cita{" "}
              <span className="text-neutral-100">{confirmDeleteAppt?.id}</span>{" "}
              de {confirmDeleteAppt?.patientName || confirmDeleteAppt?.cedula}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setConfirmDeleteAppt(null)}
              className="text-neutral-300 hover:bg-neutral-800"
            >
              Cancelar
            </Button>
            <Button
              onClick={() =>
                confirmDeleteAppt && handleDeleteAppt(confirmDeleteAppt)
              }
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

/* ═══ Sub-components ═══════════════════════════════════════════ */

function DetailRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[#c9a84c]/10 py-1.5">
      <span className="text-[10px] uppercase tracking-widest text-[#c9a84c]/70">
        {k}
      </span>
      <span className="text-right text-neutral-200">{v}</span>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  className = "",
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`devi-hud-corner devi-fade-up rounded-xl border border-[#c9a84c]/25 bg-neutral-950/60 p-5 backdrop-blur ${className}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">
            {label}
          </div>
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

function WhatsAppLink({ phone, message }: { phone: string; message: string }) {
  const cleanPhone = phone ? phone.toString().replace(/\D/g, "") : "";

  if (!cleanPhone) {
    return (
      <button
        disabled
        className="inline-flex items-center justify-center h-8 w-8 text-neutral-600 cursor-not-allowed"
        title="Sin número de teléfono"
      >
        <MessageCircle className="h-4 w-4" />
      </button>
    );
  }

  return (
    <a
      href={`https://wa.me/57${cleanPhone}?text=${encodeURIComponent(message)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center h-8 w-8 text-green-500 hover:text-green-400 transition-colors"
      title="WhatsApp"
    >
      <MessageCircle className="h-4 w-4" />
    </a>
  );
}

function SidebarBtn({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition " +
        (active
          ? "border border-[#c9a84c]/40 bg-gradient-to-r from-[#c9a84c]/20 to-transparent text-[#f0d78c] shadow-[inset_0_0_20px_-10px_#c9a84c]"
          : "border border-transparent text-neutral-400 hover:bg-[#c9a84c]/5 hover:text-[#f0d78c]")
      }
      style={{ fontFamily: "'Rajdhani', sans-serif", letterSpacing: "0.08em" }}
    >
      {icon}
      {label}
    </button>
  );
}

function MobileNavBtn({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-0.5 px-4 py-2 text-[10px] uppercase tracking-widest transition ${
        active ? "text-[#f0d78c]" : "text-neutral-500"
      }`}
      style={{ fontFamily: "'Rajdhani', sans-serif" }}
    >
      {icon}
      {label}
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
      <Label className="text-[10px] uppercase tracking-widest text-[#c9a84c]/80">
        {label}
      </Label>
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
