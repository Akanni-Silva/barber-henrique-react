// src/pages/Private/ScheduleManagement.tsx
import React, { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import {
  ClockIcon,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  CalendarIcon,
  PlusIcon,
  PencilIcon,
  XIcon,
  CheckCircleIcon,
  XCircleIcon,
  CopySimpleIcon,

} from "@phosphor-icons/react";
import { useApi } from "../../hooks/useApi";
import { Spinner } from "../../components/Common/Spinner";
import { Input } from "../../components/Common/Input";
import { ConfirmPopup } from "../../components/Common/ConfirmPopup";
import type { BlockedDate, WorkSchedule } from "../../types";

const DAYS_OF_WEEK = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Segunda-feira" },
  { value: 2, label: "Terça-feira" },
  { value: 3, label: "Quarta-feira" },
  { value: 4, label: "Quinta-feira" },
  { value: 5, label: "Sexta-feira" },
  { value: 6, label: "Sábado" },
];

export const ScheduleManagement = () => {
  const { loading, handleRequest, endpoints } = useApi();

  const [workSchedules, setWorkSchedules] = useState<WorkSchedule[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Estados do Modal de Horário (individual)
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<WorkSchedule | null>(
    null,
  );
  const [scheduleForm, setScheduleForm] = useState({
    day_of_week: 1,
    is_working: true,
    start_time: "09:00",
    end_time: "19:00",
    slot_duration: 30,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados do Modal de Data Bloqueada
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockForm, setBlockForm] = useState({
    blocked_date: "",
    reason: "",
    is_full_day: true,
  });
  const [isBlockSubmitting, setIsBlockSubmitting] = useState(false);

  // ✅ Estados para edição em massa
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkForm, setBulkForm] = useState({
    selectedDays: [] as number[],
    is_working: true,
    start_time: "09:00",
    end_time: "19:00",
    slot_duration: 30,
  });
  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false);

  // ✅ Buscar dados
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [schedules, blocked] = await Promise.all([
          handleRequest(endpoints.schedule.findAllWorkSchedules()),
          handleRequest(endpoints.schedule.findAllBlockedDates()),
        ]);
        setWorkSchedules(schedules || []);
        setBlockedDates(blocked || []);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast.error("Erro ao carregar dados da agenda");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // ✅ Criar um mapa usando day_of_week como chave
  const schedulesMap = useMemo(() => {
    const map = new Map<number, WorkSchedule>();
    workSchedules.forEach((schedule) => {
      map.set(schedule.day_of_week, schedule);
    });
    return map;
  }, [workSchedules]);

  // ✅ Abrir modal de horário com o dia selecionado
  const handleOpenScheduleModal = (dayOfWeek: number) => {
    const existingSchedule = schedulesMap.get(dayOfWeek);

    if (existingSchedule) {
      setEditingSchedule(existingSchedule);
      setScheduleForm({
        day_of_week: existingSchedule.day_of_week,
        is_working: existingSchedule.is_working,
        start_time: existingSchedule.start_time || "09:00",
        end_time: existingSchedule.end_time || "19:00",
        slot_duration: existingSchedule.slot_duration || 30,
      });
    } else {
      setEditingSchedule(null);
      setScheduleForm({
        day_of_week: dayOfWeek,
        is_working: true,
        start_time: "09:00",
        end_time: "19:00",
        slot_duration: 30,
      });
    }
    setShowScheduleModal(true);
  };

  // Salvar horário individual
  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await handleRequest(
        endpoints.schedule.upsertWorkSchedule({
          day_of_week: scheduleForm.day_of_week,
          is_working: scheduleForm.is_working,
          start_time: scheduleForm.is_working
            ? scheduleForm.start_time
            : undefined,
          end_time: scheduleForm.is_working ? scheduleForm.end_time : undefined,
          slot_duration: scheduleForm.slot_duration,
        }),
      );

      toast.success("✅ Horário salvo com sucesso!");
      setShowScheduleModal(false);

      const schedules = await handleRequest(
        endpoints.schedule.findAllWorkSchedules(),
      );
      setWorkSchedules(schedules || []);
    } catch (error) {
      console.error("Erro ao salvar horário:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ Abrir modal de edição em massa
  const handleOpenBulkModal = () => {
    // Pré-selecionar dias que estão abertos
    const workingDays = DAYS_OF_WEEK.map((day) => day.value).filter(
      (dayValue) => schedulesMap.get(dayValue)?.is_working !== false,
    );

    setBulkForm({
      selectedDays: workingDays,
      is_working: true,
      start_time: "09:00",
      end_time: "19:00",
      slot_duration: 30,
    });
    setShowBulkModal(true);
  };

  // ✅ Alternar seleção de um dia
  const toggleDaySelection = (dayValue: number) => {
    setBulkForm((prev) => {
      const selected = prev.selectedDays.includes(dayValue)
        ? prev.selectedDays.filter((d) => d !== dayValue)
        : [...prev.selectedDays, dayValue];
      return { ...prev, selectedDays: selected };
    });
  };

  // ✅ Selecionar/Deselecionar todos os dias
  const toggleAllDays = () => {
    setBulkForm((prev) => {
      const allDays = DAYS_OF_WEEK.map((d) => d.value);
      const allSelected = prev.selectedDays.length === allDays.length;
      return {
        ...prev,
        selectedDays: allSelected ? [] : allDays,
      };
    });
  };

  // ✅ Salvar edição em massa
  const handleSaveBulk = async (e: React.FormEvent) => {
    e.preventDefault();

    if (bulkForm.selectedDays.length === 0) {
      toast.warning("Selecione pelo menos um dia");
      return;
    }

    setIsBulkSubmitting(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const dayOfWeek of bulkForm.selectedDays) {
        try {
          await handleRequest(
            endpoints.schedule.upsertWorkSchedule({
              day_of_week: dayOfWeek,
              is_working: bulkForm.is_working,
              start_time: bulkForm.is_working ? bulkForm.start_time : undefined,
              end_time: bulkForm.is_working ? bulkForm.end_time : undefined,
              slot_duration: bulkForm.slot_duration,
            }),
          );
          successCount++;
        } catch (error) {
          errorCount++;
          console.error(`Erro ao salvar dia ${dayOfWeek}:`, error);
        }
      }

      if (successCount > 0) {
        toast.success(`✅ ${successCount} dia(s) salvo(s) com sucesso!`);
      }
      if (errorCount > 0) {
        toast.warning(`⚠️ ${errorCount} dia(s) falharam ao salvar`);
      }

      setShowBulkModal(false);

      // Recarregar
      const schedules = await handleRequest(
        endpoints.schedule.findAllWorkSchedules(),
      );
      setWorkSchedules(schedules || []);
    } catch (error) {
      console.error("Erro ao salvar em massa:", error);
      toast.error("Erro ao salvar horários em massa");
    } finally {
      setIsBulkSubmitting(false);
    }
  };

  // Abrir modal de data bloqueada
  const handleOpenBlockModal = () => {
    setBlockForm({
      blocked_date: "",
      reason: "",
      is_full_day: true,
    });
    setShowBlockModal(true);
  };

  // Salvar data bloqueada
  const handleSaveBlock = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!blockForm.blocked_date) {
      toast.warning("Selecione uma data");
      return;
    }

    setIsBlockSubmitting(true);
    try {
      await handleRequest(
        endpoints.schedule.blockDate({
          blocked_date: blockForm.blocked_date,
          reason: blockForm.reason || undefined,
          is_full_day: blockForm.is_full_day,
        }),
      );

      toast.success("✅ Data bloqueada com sucesso!");
      setShowBlockModal(false);

      const blocked = await handleRequest(
        endpoints.schedule.findAllBlockedDates(),
      );
      setBlockedDates(blocked || []);
    } catch (error) {
      console.error("Erro ao bloquear data:", error);
    } finally {
      setIsBlockSubmitting(false);
    }
  };

  // Desbloquear data
  const handleUnblock = async (id: number) => {
    try {
      await handleRequest(endpoints.schedule.unblockDate(id));
      toast.info("📅 Data desbloqueada!");

      const updated = blockedDates.filter((b) => b.id !== id);
      setBlockedDates(updated);
    } catch (error) {
      console.error("Erro ao desbloquear:", error);
    }
  };

  const getDayLabel = (dayOfWeek: number) => {
    return DAYS_OF_WEEK.find((d) => d.value === dayOfWeek)?.label || "Dia";
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Spinner color="#C9A84C" size={20} />
        <p className="text-text-muted mt-4 text-sm">Carregando agenda...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-text">
            📅 Gerenciar Agenda
          </h1>
          <p className="text-text-muted text-sm">
            Configure os horários de funcionamento da barbearia
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleOpenBulkModal}
            className="btn-secondary inline-flex items-center gap-2 text-sm py-2 px-4"
          >
            <CopySimpleIcon size={20} />
            Edição em Massa
          </button>
          <button
            onClick={handleOpenBlockModal}
            className="btn-primary inline-flex items-center gap-2 text-sm py-2 px-4"
          >
            <PlusIcon size={20} />
            Bloquear Data
          </button>
        </div>
      </div>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Horários de Trabalho */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-serif text-xl font-bold text-text">
              🕐 Horários de Trabalho
            </h2>
          </div>

          <div className="space-y-2">
            {DAYS_OF_WEEK.map((day) => {
              const schedule = schedulesMap.get(day.value);
              const isWorking = schedule?.is_working ?? false;
              const timeStr = isWorking
                ? `${schedule?.start_time || "09:00"} - ${schedule?.end_time || "19:00"}`
                : "Fechado";

              return (
                <div
                  key={day.value}
                  onClick={() => handleOpenScheduleModal(day.value)}
                  className="card-primary flex items-center justify-between hover:border-accent/30 transition p-3 cursor-pointer group"
                >
                  <div>
                    <p className="font-semibold text-text">{day.label}</p>
                    <p
                      className={`text-sm ${isWorking ? "text-text-muted" : "text-red-500"}`}
                    >
                      {isWorking ? (
                        <>
                          <ClockIcon size={14} className="inline mr-1" />
                          {timeStr} • {schedule?.slot_duration || 30} min
                        </>
                      ) : (
                        "Fechado"
                      )}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenScheduleModal(day.value);
                    }}
                    className="p-1.5 bg-accent/10 text-accent rounded-lg hover:bg-accent/20 transition opacity-0 group-hover:opacity-100"
                    title="Editar"
                  >
                    <PencilIcon size={16} />
                  </button>
                </div>
              );
            })}
          </div>

          <div className="mt-4 text-sm text-text-muted">
            <p>💡 Clique em qualquer dia para configurar o horário.</p>
          </div>
        </div>

        {/* Datas Bloqueadas */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-serif text-xl font-bold text-text">
              🚫 Datas Bloqueadas
            </h2>
            <span className="text-text-muted text-sm">
              {blockedDates.length} bloqueios
            </span>
          </div>

          {blockedDates.length === 0 ? (
            <div className="card-primary text-center py-8">
              <div className="text-4xl mb-3">📅</div>
              <p className="text-text-muted">Nenhuma data bloqueada</p>
              <p className="text-text-muted text-sm">
                Bloqueie feriados ou dias de folga
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
              {blockedDates.map((block) => (
                <div
                  key={block.id}
                  className="card-primary flex items-center justify-between hover:border-red-500/30 transition p-3 border-red-500/10"
                >
                  <div>
                    <p className="font-semibold text-text">
                      {new Date(block.blocked_date).toLocaleDateString("pt-BR")}
                    </p>
                    <p className="text-text-muted text-sm">
                      {block.reason || "Sem motivo especificado"}
                      {!block.is_full_day && (
                        <span className="ml-2 text-xs">
                          {block.start_time} - {block.end_time}
                        </span>
                      )}
                    </p>
                  </div>
                  <ConfirmPopup
                    trigger={
                      <button
                        className="p-1.5 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition"
                        title="Desbloquear"
                      >
                        <XIcon size={16} />
                      </button>
                    }
                    onConfirm={() => handleUnblock(block.id)}
                    title="Desbloquear Data"
                    message={`Tem certeza que deseja desbloquear ${new Date(block.blocked_date).toLocaleDateString("pt-BR")}?`}
                    confirmText="Desbloquear"
                    cancelText="Cancelar"
                    variant="danger"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Horário Individual */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-primary-light rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-serif text-xl font-bold text-text">
                {editingSchedule ? "Editar Horário" : "Configurar Horário"}
              </h3>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="text-text-muted hover:text-text transition"
                disabled={isSubmitting}
              >
                <XIcon size={24} />
              </button>
            </div>

            <form onSubmit={handleSaveSchedule} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  Dia da Semana
                </label>
                <select
                  value={scheduleForm.day_of_week}
                  onChange={(e) =>
                    setScheduleForm({
                      ...scheduleForm,
                      day_of_week: parseInt(e.target.value),
                    })
                  }
                  className="input-primary"
                  disabled={!!editingSchedule}
                >
                  {DAYS_OF_WEEK.map((day) => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>
                {editingSchedule && (
                  <p className="text-text-muted text-xs mt-1">
                    {getDayLabel(editingSchedule.day_of_week)}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-text-secondary">
                  Funciona?
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setScheduleForm({
                      ...scheduleForm,
                      is_working: !scheduleForm.is_working,
                    })
                  }
                  className={`px-4 py-2 rounded-lg transition text-sm font-medium ${
                    scheduleForm.is_working
                      ? "bg-green-500/20 text-green-500 border-green-500/30 border"
                      : "bg-red-500/20 text-red-500 border-red-500/30 border"
                  }`}
                >
                  {scheduleForm.is_working ? "Aberto" : "Fechado"}
                </button>
              </div>

              {scheduleForm.is_working && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Abre às"
                      type="time"
                      value={scheduleForm.start_time}
                      onChange={(e) =>
                        setScheduleForm({
                          ...scheduleForm,
                          start_time: e.target.value,
                        })
                      }
                      required
                      disabled={isSubmitting}
                    />
                    <Input
                      label="Fecha às"
                      type="time"
                      value={scheduleForm.end_time}
                      onChange={(e) =>
                        setScheduleForm({
                          ...scheduleForm,
                          end_time: e.target.value,
                        })
                      }
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <Input
                    label="Duração do Slot (minutos)"
                    type="number"
                    placeholder="30"
                    value={scheduleForm.slot_duration}
                    onChange={(e) =>
                      setScheduleForm({
                        ...scheduleForm,
                        slot_duration: parseInt(e.target.value) || 30,
                      })
                    }
                    required
                    disabled={isSubmitting}
                    helperText="Tempo de cada agendamento"
                  />
                </>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="flex-1 px-4 py-2 text-text-secondary hover:text-text transition border border-border rounded-lg hover:border-border-light"
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Spinner color="#1A1A1A" size={10} />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon size={18} />
                      <span>Salvar</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Edição em Massa */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-primary-light rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-serif text-xl font-bold text-text">
                Edição em Massa
              </h3>
              <button
                onClick={() => setShowBulkModal(false)}
                className="text-text-muted hover:text-text transition"
                disabled={isBulkSubmitting}
              >
                <XIcon size={24} />
              </button>
            </div>

            <form onSubmit={handleSaveBulk} className="space-y-4">
              {/* Seleção de Dias */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Dias da Semana
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  <button
                    type="button"
                    onClick={toggleAllDays}
                    className="text-xs px-2 py-1 bg-accent/10 text-accent rounded hover:bg-accent/20 transition"
                  >
                    {bulkForm.selectedDays.length === DAYS_OF_WEEK.length
                      ? "Deselecionar Todos"
                      : "Selecionar Todos"}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {DAYS_OF_WEEK.map((day) => {
                    const isSelected = bulkForm.selectedDays.includes(
                      day.value,
                    );
                    return (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => toggleDaySelection(day.value)}
                        className={`p-2 rounded-lg border-2 text-sm transition ${
                          isSelected
                            ? "border-accent bg-accent/10 text-accent"
                            : "border-border text-text-secondary hover:border-border-light"
                        }`}
                      >
                        {day.label}
                      </button>
                    );
                  })}
                </div>
                <p className="text-text-muted text-xs mt-2">
                  {bulkForm.selectedDays.length} dia(s) selecionado(s)
                </p>
              </div>

              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-text-secondary">
                  Funciona?
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setBulkForm({
                      ...bulkForm,
                      is_working: !bulkForm.is_working,
                    })
                  }
                  className={`px-4 py-2 rounded-lg transition text-sm font-medium ${
                    bulkForm.is_working
                      ? "bg-green-500/20 text-green-500 border-green-500/30 border"
                      : "bg-red-500/20 text-red-500 border-red-500/30 border"
                  }`}
                >
                  {bulkForm.is_working ? "Aberto" : "Fechado"}
                </button>
              </div>

              {bulkForm.is_working && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Abre às"
                      type="time"
                      value={bulkForm.start_time}
                      onChange={(e) =>
                        setBulkForm({
                          ...bulkForm,
                          start_time: e.target.value,
                        })
                      }
                      required
                      disabled={isBulkSubmitting}
                    />
                    <Input
                      label="Fecha às"
                      type="time"
                      value={bulkForm.end_time}
                      onChange={(e) =>
                        setBulkForm({
                          ...bulkForm,
                          end_time: e.target.value,
                        })
                      }
                      required
                      disabled={isBulkSubmitting}
                    />
                  </div>

                  <Input
                    label="Duração do Slot (minutos)"
                    type="number"
                    placeholder="30"
                    value={bulkForm.slot_duration}
                    onChange={(e) =>
                      setBulkForm({
                        ...bulkForm,
                        slot_duration: parseInt(e.target.value) || 30,
                      })
                    }
                    required
                    disabled={isBulkSubmitting}
                    helperText="Tempo de cada agendamento"
                  />
                </>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBulkModal(false)}
                  className="flex-1 px-4 py-2 text-text-secondary hover:text-text transition border border-border rounded-lg hover:border-border-light"
                  disabled={isBulkSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={
                    isBulkSubmitting || bulkForm.selectedDays.length === 0
                  }
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                >
                  {isBulkSubmitting ? (
                    <>
                      <Spinner color="#1A1A1A" size={10} />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon size={18} />
                      <span>Salvar {bulkForm.selectedDays.length} dia(s)</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Data Bloqueada */}
      {showBlockModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-primary-light rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-serif text-xl font-bold text-text">
                Bloquear Data
              </h3>
              <button
                onClick={() => setShowBlockModal(false)}
                className="text-text-muted hover:text-text transition"
                disabled={isBlockSubmitting}
              >
                <XIcon size={24} />
              </button>
            </div>

            <form onSubmit={handleSaveBlock} className="space-y-4">
              <Input
                label="Data"
                type="date"
                value={blockForm.blocked_date}
                onChange={(e) =>
                  setBlockForm({ ...blockForm, blocked_date: e.target.value })
                }
                required
                disabled={isBlockSubmitting}
                min={new Date().toISOString().split("T")[0]}
              />

              <Input
                label="Motivo"
                placeholder="Ex: Feriado, Férias, Folga"
                value={blockForm.reason}
                onChange={(e) =>
                  setBlockForm({ ...blockForm, reason: e.target.value })
                }
                disabled={isBlockSubmitting}
              />

              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-text-secondary">
                  Dia inteiro?
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setBlockForm({
                      ...blockForm,
                      is_full_day: !blockForm.is_full_day,
                    })
                  }
                  className={`px-4 py-2 rounded-lg transition text-sm font-medium ${
                    blockForm.is_full_day
                      ? "bg-accent/20 text-accent border-accent/30 border"
                      : "bg-primary border border-border text-text-secondary"
                  }`}
                >
                  {blockForm.is_full_day ? "Sim" : "Não"}
                </button>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBlockModal(false)}
                  className="flex-1 px-4 py-2 text-text-secondary hover:text-text transition border border-border rounded-lg hover:border-border-light"
                  disabled={isBlockSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isBlockSubmitting}
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                >
                  {isBlockSubmitting ? (
                    <>
                      <Spinner color="#1A1A1A" size={10} />
                      <span>Bloqueando...</span>
                    </>
                  ) : (
                    <>
                      <XCircleIcon size={18} />
                      <span>Bloquear</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleManagement;
