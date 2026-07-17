// src/pages/Private/ScheduleManagement.tsx
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  ClockIcon,
  PlusIcon,
  PencilIcon,
  XIcon,
  CheckCircleIcon,
  XCircleIcon,
  CopySimpleIcon,
  ArrowLeftIcon,
  TrashIcon,
  CalendarIcon,
  ListIcon,
} from "@phosphor-icons/react";
import { useApi } from "../../hooks/useApi";
import { Spinner } from "../../components/Common/Spinner";
import { ConfirmPopup } from "../../components/Common/ConfirmPopup";
import { Button } from "../../components/Common/Button";
import type { BlockedDate, WorkSchedule } from "../../types";
import { useGuestRedirect } from "../../hooks/useGuestRedirect";

const DAYS_OF_WEEK = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Segunda" },
  { value: 2, label: "Terça" },
  { value: 3, label: "Quarta" },
  { value: 4, label: "Quinta" },
  { value: 5, label: "Sexta" },
  { value: 6, label: "Sábado" },
];

export const ScheduleManagement = () => {
  const { loading, handleRequest, endpoints } = useApi();

  const [workSchedules, setWorkSchedules] = useState<WorkSchedule[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

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

  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockForm, setBlockForm] = useState({
    blocked_date: "",
    reason: "",
    is_full_day: true,
  });
  const [isBlockSubmitting, setIsBlockSubmitting] = useState(false);

  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkForm, setBulkForm] = useState({
    selectedDays: [] as number[],
    is_working: true,
    start_time: "09:00",
    end_time: "19:00",
    slot_duration: 30,
  });
  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false);

  // ✅ Detectar tamanho da tela
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useGuestRedirect({
    redirectTo: "/",
    toastMessage: "Página restrita, faça login para acessar",
    showToast: true,
    toastDelay: 300,
  });

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

  const schedulesMap = useMemo(() => {
    const map = new Map<number, WorkSchedule>();
    workSchedules.forEach((schedule) => {
      map.set(schedule.day_of_week, schedule);
    });
    return map;
  }, [workSchedules]);

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

      toast.success("Horário salvo com sucesso!");
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

  const handleOpenBulkModal = () => {
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

  const toggleDaySelection = (dayValue: number) => {
    setBulkForm((prev) => {
      const selected = prev.selectedDays.includes(dayValue)
        ? prev.selectedDays.filter((d) => d !== dayValue)
        : [...prev.selectedDays, dayValue];
      return { ...prev, selectedDays: selected };
    });
  };

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
        toast.success(`${successCount} dia(s) salvo(s) com sucesso!`);
      }
      if (errorCount > 0) {
        toast.warning(`${errorCount} dia(s) falharam ao salvar`);
      }

      setShowBulkModal(false);

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

  const handleOpenBlockModal = () => {
    setBlockForm({
      blocked_date: "",
      reason: "",
      is_full_day: true,
    });
    setShowBlockModal(true);
  };

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

      toast.success("Data bloqueada com sucesso!");
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

  const handleUnblock = async (id: number) => {
    try {
      await handleRequest(endpoints.schedule.unblockDate(id));
      toast.info("Data desbloqueada!");

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
        <Spinner color="#C9A84C" size={20} text="Carregando agenda..." />
      </div>
    );
  }

  return (
    <div className="pb-20 max-w-6xl mx-auto">
      {/* ✅ Header com Navegação */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Link
            to="/dashboard"
            className="p-2 text-text-muted hover:text-accent transition rounded-xl hover:bg-accent/5"
          >
            <ArrowLeftIcon size={18} />
          </Link>
          <div>
            <h1 className="font-serif text-xl md:text-2xl font-bold text-text">
              Agenda
            </h1>
            <p className="text-text-muted text-xs md:text-sm">
              Configure os horários da barbearia
            </p>
          </div>
        </div>
        {isDesktop && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-text-muted text-xs bg-primary-light/50 px-3 py-1.5 rounded-lg border border-border/50">
              <ListIcon size={14} className="text-accent" />
              <span className="font-medium">{workSchedules.length} dias</span>
            </div>
            <Button
              variant="secondary"
              size="sm"
              icon={<PlusIcon size={16} />}
              onClick={handleOpenBlockModal}
            >
              Bloquear Data
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<CopySimpleIcon size={16} />}
              onClick={handleOpenBulkModal}
            >
              Edição em Massa
            </Button>
          </div>
        )}
      </div>

      {/* ✅ Ações Rápidas - Mobile */}
      {!isDesktop && (
        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            variant="primary"
            size="sm"
            icon={<CopySimpleIcon size={16} />}
            onClick={handleOpenBulkModal}
          >
            Edição em Massa
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={<PlusIcon size={16} />}
            onClick={handleOpenBlockModal}
          >
            Bloquear Data
          </Button>
        </div>
      )}

      {/* ✅ Grid Principal - Adaptativo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* ✅ Horários de Trabalho */}
        <div>
          <h2 className="font-serif text-base md:text-lg font-bold text-text mb-3 flex items-center gap-2">
            <ClockIcon size={isDesktop ? 20 : 16} className="text-accent" />
            Horários
          </h2>

          <div className="space-y-2 md:space-y-2.5">
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
                  className={`bg-primary-light rounded-xl p-3 md:p-4 border cursor-pointer transition-all hover:border-accent/30 ${
                    isWorking
                      ? "border-border/50 hover:bg-accent/5"
                      : "border-red-500/20 hover:border-red-500/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-text text-sm md:text-base">
                        {day.label}
                      </p>
                      <p
                        className={`text-xs md:text-sm ${isWorking ? "text-text-muted" : "text-red-500"}`}
                      >
                        {isWorking ? (
                          <>
                            <ClockIcon
                              size={isDesktop ? 14 : 12}
                              className="inline mr-1"
                            />
                            {timeStr} • {schedule?.slot_duration || 30}min
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
                      className="p-2 md:p-2.5 bg-accent/10 text-accent rounded-lg hover:bg-accent/20 transition"
                      title="Editar"
                    >
                      <PencilIcon size={isDesktop ? 16 : 14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-text-muted text-[10px] md:text-xs mt-3 text-center">
            💡 Clique em qualquer dia para configurar
          </p>
        </div>

        {/* ✅ Datas Bloqueadas */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-serif text-base md:text-lg font-bold text-text flex items-center gap-2">
              <CalendarIcon
                size={isDesktop ? 20 : 16}
                className="text-accent"
              />
              Bloqueios
            </h2>
            <span className="text-text-muted text-xs md:text-sm bg-primary-light/50 px-3 py-1 rounded-lg border border-border/50">
              {blockedDates.length} bloqueio(s)
            </span>
          </div>

          {blockedDates.length === 0 ? (
            <div className="bg-primary-light rounded-xl text-center py-8 md:py-12 border border-border/50">
              <div className="text-4xl md:text-5xl mb-3">📅</div>
              <p className="text-text-muted text-sm font-medium">
                Nenhuma data bloqueada
              </p>
              <p className="text-text-muted text-xs mt-1">
                Bloqueie feriados ou folgas
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
              {blockedDates.map((block) => (
                <div
                  key={block.id}
                  className="bg-primary-light rounded-xl p-3 md:p-4 border border-red-500/20 hover:border-red-500/30 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-text text-sm md:text-base">
                        {new Date(block.blocked_date).toLocaleDateString(
                          "pt-BR",
                        )}
                      </p>
                      <p className="text-text-muted text-xs md:text-sm">
                        {block.reason || "Sem motivo"}
                        {!block.is_full_day && (
                          <span className="ml-2 text-[10px] md:text-xs">
                            {block.start_time} - {block.end_time}
                          </span>
                        )}
                      </p>
                    </div>
                    <ConfirmPopup
                      trigger={
                        <button
                          className="p-2 md:p-2.5 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition"
                          title="Desbloquear"
                        >
                          <TrashIcon size={isDesktop ? 18 : 14} />
                        </button>
                      }
                      onConfirm={() => handleUnblock(block.id)}
                      title="Desbloquear Data"
                      message={`Desbloquear ${new Date(block.blocked_date).toLocaleDateString("pt-BR")}?`}
                      confirmText="Desbloquear"
                      cancelText="Cancelar"
                      variant="danger"
                      size="sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ✅ Modal de Horário Individual - Otimizado */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-primary-light rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-slideUp">
            <div className="sticky top-0 bg-primary-light border-b border-border/50 p-4 flex justify-between items-center z-10 rounded-t-2xl">
              <h3 className="font-serif text-lg font-bold text-text">
                {editingSchedule ? "Editar Horário" : "Configurar Horário"}
              </h3>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="p-2 text-text-muted hover:text-text transition rounded-lg hover:bg-primary"
                disabled={isSubmitting}
              >
                <XIcon size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSaveSchedule}
              className="p-4 md:p-6 space-y-4"
            >
              <div>
                <label className="block text-xs md:text-sm font-medium text-text-secondary mb-1">
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
                  className="w-full px-3 py-2 bg-primary/50 border border-border/50 rounded-lg text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all disabled:opacity-50"
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

              <div className="flex items-center gap-2">
                <label className="text-xs md:text-sm font-medium text-text-secondary">
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
                  className={`px-3 py-1.5 rounded-lg transition text-xs md:text-sm font-medium ${
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
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs md:text-sm font-medium text-text-secondary mb-1">
                        Abre às
                      </label>
                      <input
                        type="time"
                        value={scheduleForm.start_time}
                        onChange={(e) =>
                          setScheduleForm({
                            ...scheduleForm,
                            start_time: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 bg-primary/50 border border-border/50 rounded-lg text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all disabled:opacity-50"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <label className="block text-xs md:text-sm font-medium text-text-secondary mb-1">
                        Fecha às
                      </label>
                      <input
                        type="time"
                        value={scheduleForm.end_time}
                        onChange={(e) =>
                          setScheduleForm({
                            ...scheduleForm,
                            end_time: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 bg-primary/50 border border-border/50 rounded-lg text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all disabled:opacity-50"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-text-secondary mb-1">
                      Duração do Slot (min)
                    </label>
                    <input
                      type="number"
                      placeholder="30"
                      value={scheduleForm.slot_duration}
                      onChange={(e) =>
                        setScheduleForm({
                          ...scheduleForm,
                          slot_duration: parseInt(e.target.value) || 30,
                        })
                      }
                      className="w-full px-3 py-2 bg-primary/50 border border-border/50 rounded-lg text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all disabled:opacity-50"
                      required
                      disabled={isSubmitting}
                    />
                    <p className="text-text-muted text-[10px] md:text-xs mt-0.5">
                      Tempo de cada agendamento
                    </p>
                  </div>
                </>
              )}

              <div className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  fullWidth
                  onClick={() => setShowScheduleModal(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  fullWidth
                  icon={<CheckCircleIcon size={16} />}
                  loading={isSubmitting}
                >
                  Salvar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ✅ Modal de Edição em Massa - Otimizado */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-primary-light rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-slideUp">
            <div className="sticky top-0 bg-primary-light border-b border-border/50 p-4 flex justify-between items-center z-10 rounded-t-2xl">
              <h3 className="font-serif text-lg font-bold text-text">
                Edição em Massa
              </h3>
              <button
                onClick={() => setShowBulkModal(false)}
                className="p-2 text-text-muted hover:text-text transition rounded-lg hover:bg-primary"
                disabled={isBulkSubmitting}
              >
                <XIcon size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveBulk} className="p-4 md:p-6 space-y-4">
              <div>
                <label className="block text-xs md:text-sm font-medium text-text-secondary mb-1.5">
                  Dias da Semana
                </label>
                <div className="flex flex-wrap gap-1.5 mb-1.5">
                  <button
                    type="button"
                    onClick={toggleAllDays}
                    className="text-[10px] md:text-xs px-2 py-1 bg-accent/10 text-accent rounded-lg hover:bg-accent/20 transition"
                  >
                    {bulkForm.selectedDays.length === DAYS_OF_WEEK.length
                      ? "Deselecionar Todos"
                      : "Selecionar Todos"}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {DAYS_OF_WEEK.map((day) => {
                    const isSelected = bulkForm.selectedDays.includes(
                      day.value,
                    );
                    return (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => toggleDaySelection(day.value)}
                        className={`p-2 rounded-lg border-2 text-xs md:text-sm transition ${
                          isSelected
                            ? "border-accent bg-accent/10 text-accent"
                            : "border-border/50 text-text-secondary hover:border-border-light"
                        }`}
                      >
                        {day.label}
                      </button>
                    );
                  })}
                </div>
                <p className="text-text-muted text-[10px] md:text-xs mt-1.5">
                  {bulkForm.selectedDays.length} dia(s) selecionado(s)
                </p>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs md:text-sm font-medium text-text-secondary">
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
                  className={`px-3 py-1.5 rounded-lg transition text-xs md:text-sm font-medium ${
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
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs md:text-sm font-medium text-text-secondary mb-1">
                        Abre às
                      </label>
                      <input
                        type="time"
                        value={bulkForm.start_time}
                        onChange={(e) =>
                          setBulkForm({
                            ...bulkForm,
                            start_time: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 bg-primary/50 border border-border/50 rounded-lg text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all disabled:opacity-50"
                        required
                        disabled={isBulkSubmitting}
                      />
                    </div>
                    <div>
                      <label className="block text-xs md:text-sm font-medium text-text-secondary mb-1">
                        Fecha às
                      </label>
                      <input
                        type="time"
                        value={bulkForm.end_time}
                        onChange={(e) =>
                          setBulkForm({
                            ...bulkForm,
                            end_time: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 bg-primary/50 border border-border/50 rounded-lg text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all disabled:opacity-50"
                        required
                        disabled={isBulkSubmitting}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-text-secondary mb-1">
                      Duração do Slot (min)
                    </label>
                    <input
                      type="number"
                      placeholder="30"
                      value={bulkForm.slot_duration}
                      onChange={(e) =>
                        setBulkForm({
                          ...bulkForm,
                          slot_duration: parseInt(e.target.value) || 30,
                        })
                      }
                      className="w-full px-3 py-2 bg-primary/50 border border-border/50 rounded-lg text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all disabled:opacity-50"
                      required
                      disabled={isBulkSubmitting}
                    />
                    <p className="text-text-muted text-[10px] md:text-xs mt-0.5">
                      Tempo de cada agendamento
                    </p>
                  </div>
                </>
              )}

              <div className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  fullWidth
                  onClick={() => setShowBulkModal(false)}
                  disabled={isBulkSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  fullWidth
                  icon={<CheckCircleIcon size={16} />}
                  loading={isBulkSubmitting}
                  disabled={bulkForm.selectedDays.length === 0}
                >
                  Salvar {bulkForm.selectedDays.length} dia(s)
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ✅ Modal de Data Bloqueada - Otimizado */}
      {showBlockModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-primary-light rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-slideUp">
            <div className="sticky top-0 bg-primary-light border-b border-border/50 p-4 flex justify-between items-center z-10 rounded-t-2xl">
              <h3 className="font-serif text-lg font-bold text-text">
                Bloquear Data
              </h3>
              <button
                onClick={() => setShowBlockModal(false)}
                className="p-2 text-text-muted hover:text-text transition rounded-lg hover:bg-primary"
                disabled={isBlockSubmitting}
              >
                <XIcon size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveBlock} className="p-4 md:p-6 space-y-4">
              <div>
                <label className="block text-xs md:text-sm font-medium text-text-secondary mb-1">
                  Data
                </label>
                <input
                  type="date"
                  value={blockForm.blocked_date}
                  onChange={(e) =>
                    setBlockForm({ ...blockForm, blocked_date: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-primary/50 border border-border/50 rounded-lg text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all disabled:opacity-50"
                  required
                  disabled={isBlockSubmitting}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-text-secondary mb-1">
                  Motivo
                </label>
                <input
                  type="text"
                  placeholder="Feriado, Férias, Folga..."
                  value={blockForm.reason}
                  onChange={(e) =>
                    setBlockForm({ ...blockForm, reason: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-primary/50 border border-border/50 rounded-lg text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all disabled:opacity-50"
                  disabled={isBlockSubmitting}
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs md:text-sm font-medium text-text-secondary">
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
                  className={`px-3 py-1.5 rounded-lg transition text-xs md:text-sm font-medium ${
                    blockForm.is_full_day
                      ? "bg-accent/20 text-accent border-accent/30 border"
                      : "bg-primary border border-border/50 text-text-secondary"
                  }`}
                >
                  {blockForm.is_full_day ? "Sim" : "Não"}
                </button>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  fullWidth
                  onClick={() => setShowBlockModal(false)}
                  disabled={isBlockSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="danger"
                  size="sm"
                  fullWidth
                  icon={<XCircleIcon size={16} />}
                  loading={isBlockSubmitting}
                >
                  Bloquear
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleManagement;
