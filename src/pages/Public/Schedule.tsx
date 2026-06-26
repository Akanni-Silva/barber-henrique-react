// src/pages/Public/Schedule.tsx
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { useApi } from "../../hooks/useApi";
import { Input } from "../../components/Common/Input";
import { Spinner } from "../../components/Common/Spinner";
import { ServiceIcon } from "../../components/Common/ServiceIcon";
import { Button } from "../../components/Common/Button";
import { formatPrice } from "../../utils/formatPrice";
import type { Product } from "../../types";
import { categoryLabels } from "../../types";
import {
  CalendarIcon,
  CheckIcon,
  PhoneIcon,
  UserIcon,
  ClockIcon,
  
  ArrowRightIcon,
  CaretCircleLeftIcon,
  CaretCircleRightIcon,
} from "@phosphor-icons/react";
import { useAuthRedirect } from "../../hooks/useAuthRedirect";

export const Schedule = () => {
  const navigate = useNavigate();
  const { loading, handleRequest, endpoints } = useApi();

  const [services, setServices] = useState<Product[]>([]);
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [step, setStep] = useState(1);

  // ✅ Estados do Calendário
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [calendarDays, setCalendarDays] = useState<Date[]>([]);

  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const serviceRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);
  const clientRef = useRef<HTMLDivElement>(null);

  useAuthRedirect({
    redirectTo: "/dashboard",
    toastMessage: "Você já está logado! Acesse seu dashboard.",
    showToast: true,
    toastDelay: 500,
  });

  // ✅ Gerar dias do calendário
  const generateCalendarDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days: Date[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDay - 1; i >= 0; i--) {
      const day = new Date(year, month - 1, prevMonthLastDay - i);
      days.push(day);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const day = new Date(year, month, i);
      days.push(day);
    }

    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const day = new Date(year, month + 1, i);
      days.push(day);
    }

    setCalendarDays(days);
  };

  useEffect(() => {
    generateCalendarDays(currentMonth);
  }, [currentMonth]);

  const goToPreviousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1),
    );
    setSelectedDay(null);
    setSelectedDate("");
    setSelectedTime("");
  };

  const goToNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1),
    );
    setSelectedDay(null);
    setSelectedDate("");
    setSelectedTime("");
  };

  const handleDaySelect = (day: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);

    if (day < today || day > maxDate) {
      toast.warning(
        "Selecione uma data dentro do período disponível (hoje até 30 dias)",
      );
      return;
    }

    const year = day.getFullYear();
    const month = String(day.getMonth() + 1).padStart(2, "0");
    const dayOfMonth = String(day.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${dayOfMonth}`;

    setSelectedDate(dateStr);
    setSelectedDay(day.getDate());
    setSelectedTime("");
  };

  const isDayAvailable = (day: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return day >= today;
  };

  const isToday = (day: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return day.getTime() === today.getTime();
  };

  const isSelected = (day: Date) => {
    if (!selectedDate) return false;
    const year = day.getFullYear();
    const month = String(day.getMonth() + 1).padStart(2, "0");
    const dayOfMonth = String(day.getDate()).padStart(2, "0");
    return `${year}-${month}-${dayOfMonth}` === selectedDate;
  };

  const isCurrentMonth = (day: Date) => {
    return day.getMonth() === currentMonth.getMonth();
  };

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await handleRequest(endpoints.products.findActive());
        setServices(data || []);
        if (data && data.length > 0) {
          setSelectedService(data[0].id);
        }
      } catch {
        toast.error("Erro ao carregar serviços disponíveis");
      }
    };
    fetchServices();
  }, []);

  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedDate || !selectedService) {
        setAvailableSlots([]);
        return;
      }

      setLoadingSlots(true);
      try {
        const now = new Date();
        const todayStr = now.toISOString().split("T")[0];
        const isToday = selectedDate === todayStr;

        if (isToday) {
          try {
            const workingHours = await handleRequest(
              endpoints.schedule.getTodayWorkingHours(),
            );
            if (!workingHours.is_working) {
              toast.info("📅 Barbearia fechada hoje!");
              setAvailableSlots([]);
              setLoadingSlots(false);
              return;
            }
          } catch {
            // Erro silencioso
          }
        }

        const data = await handleRequest(
          endpoints.schedule.getAvailableSlots(selectedDate, 30),
        );

        let slots: string[] = [];
        if (Array.isArray(data)) {
          slots = data;
        } else if (data?.slots && Array.isArray(data.slots)) {
          slots = data.slots;
        } else if (data?.data && Array.isArray(data.data)) {
          slots = data.data;
        } else if (typeof data === "object" && data !== null) {
          for (const key of Object.keys(data)) {
            if (Array.isArray(data[key])) {
              slots = data[key];
              break;
            }
          }
        }

        setAvailableSlots(slots);
        setSelectedTime("");

        if (slots.length === 0 && selectedDate) {
          toast.info("Nenhum horário disponível para esta data");
        }
      } catch {
        setAvailableSlots([]);
        toast.error("Erro ao carregar horários disponíveis");
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [selectedDate, selectedService]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedService || !selectedDate || !selectedTime) {
      toast.warning("Selecione serviço, data e horário");
      return;
    }

    if (!availableSlots.includes(selectedTime)) {
      toast.warning("Este horário não está mais disponível");
      return;
    }

    const formattedTime =
      selectedTime.includes(":") && selectedTime.split(":").length === 2
        ? `${selectedTime}:00`
        : selectedTime;

    const [year, month, day] = selectedDate.split("-").map(Number);
    const [hours, minutes] = formattedTime.split(":").map(Number);

    const selectedDateTime = new Date(
      year,
      month - 1,
      day,
      hours,
      minutes,
      0,
      0,
    );
    const now = new Date();
    const diffMinutes = (selectedDateTime.getTime() - now.getTime()) / 60000;
    const todayStr = now.toISOString().split("T")[0];

    if (selectedDate === todayStr && diffMinutes < -2) {
      toast.warning(
        `Não é possível agendar para um horário que já passou (${formattedTime})`,
      );
      return;
    }

    if (!clientName.trim() || !clientPhone.trim()) {
      toast.warning("Preencha seus dados de contato");
      return;
    }

    setSubmitting(true);
    try {
      await handleRequest(
        endpoints.appointments.create({
          client_name: clientName.trim(),
          client_phone: clientPhone.trim(),
          service_id: selectedService,
          appointment_date: selectedDate,
          appointment_time: formattedTime,
          notes: notes.trim() || undefined,
        }),
      );

      setSuccess(true);
      toast.success("Agendamento realizado com sucesso!");

      setAvailableSlots((prev) => prev.filter((slot) => slot !== selectedTime));
      setSelectedTime("");

      setTimeout(() => {
        setSuccess(false);
        setClientName("");
        setClientPhone("");
        setNotes("");
        setSelectedDate("");
        setAvailableSlots([]);
        setSelectedDay(null);
        setCurrentMonth(new Date());
      }, 3000);
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Erro ao realizar agendamento";
      toast.error(`${message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const handleServiceSelect = (serviceId: number) => {
    setSelectedService(serviceId);
    setStep(2);
    setTimeout(() => {
      if (dateRef.current) {
        dateRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 400);
  };

  const handleBackToStep = (stepToGo: number) => {
    setStep(stepToGo);
    setTimeout(() => {
      const refs = [serviceRef, dateRef, clientRef];
      const targetRef = refs[stepToGo - 1];
      if (targetRef.current) {
        targetRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 400);
  };

  useEffect(() => {
    if (selectedDate && selectedTime && step === 2) {
      setStep(3);
      setTimeout(() => {
        if (clientRef.current) {
          clientRef.current.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, 400);
    }
  }, [selectedDate, selectedTime]);

  useEffect(() => {
    document.title = "Agendar Horário | Barbearia";
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Spinner color="#C9A84C" size={20} text="Carregando serviços..." />
      </div>
    );
  }

  const selectedServiceObj = services.find((s) => s.id === selectedService);
  const monthNames = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  return (
    <>
      {success ? (
        <section className="bg-primary-light rounded-2xl text-center py-12 border border-border/50">
          <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3 border-2 border-green-500/30">
            <CheckIcon size={32} className="text-green-500" weight="bold" />
          </div>
          <h2 className="font-serif text-xl font-bold text-text mb-1">
            Agendamento Confirmado! ✅
          </h2>
          <p className="text-text-muted text-sm mb-4">
            Você receberá a confirmação no WhatsApp em instantes.
          </p>
          <Button variant="primary" size="sm" onClick={() => navigate("/")}>
            Voltar para Home
          </Button>
        </section>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* ✅ Step 1: Seleção de Serviço */}
          {step === 1 && (
            <div ref={serviceRef} className="space-y-3 animate-fadeIn">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-accent rounded-full flex items-center justify-center text-primary text-[10px] font-bold">
                  1
                </div>
                <span className="text-sm font-medium text-text">
                  Escolha o serviço
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {services.map((service) => (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => handleServiceSelect(service.id)}
                    className={`p-3 rounded-xl border-2 transition-all duration-200 text-center ${
                      selectedService === service.id
                        ? "border-accent bg-accent/10 ring-2 ring-accent/20 shadow-glow-sm"
                        : "border-border/50 hover:border-border-light bg-primary-light"
                    }`}
                    aria-pressed={selectedService === service.id}
                  >
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center mb-1.5">
                        <ServiceIcon category={service.category} size={20} />
                      </div>
                      <h4 className="font-semibold text-text text-xs leading-tight">
                        {service.name}
                      </h4>
                      <p className="text-accent font-bold text-xs mt-0.5">
                        {formatPrice(service.price)}
                      </p>
                      <p className="text-text-muted text-[10px] flex items-center gap-0.5">
                        <ClockIcon size={10} />
                        {service.duration_minutes}min
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ✅ Step 2: Data e Horário com Calendário */}
          {step === 2 && (
            <div ref={dateRef} className="space-y-3 animate-fadeIn">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleBackToStep(1)}
                  className="text-text-muted hover:text-accent transition p-1"
                >
                  <CaretCircleLeftIcon size={16} />
                </button>
                <div className="w-7 h-7 bg-accent rounded-full flex items-center justify-center text-primary text-[10px] font-bold">
                  2
                </div>
                <span className="text-sm font-medium text-text">
                  Data e horário
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {/* Calendário */}
                <div className="bg-primary-light rounded-xl p-3 border border-border/50">
                  <div className="flex items-center justify-between mb-3">
                    <button
                      type="button"
                      onClick={goToPreviousMonth}
                      className="p-1.5 text-text-muted hover:text-accent transition rounded-lg hover:bg-accent/10"
                    >
                      <CaretCircleLeftIcon size={18} />
                    </button>
                    <span className="font-semibold text-text text-sm">
                      {monthNames[currentMonth.getMonth()]}{" "}
                      {currentMonth.getFullYear()}
                    </span>
                    <button
                      type="button"
                      onClick={goToNextMonth}
                      className="p-1.5 text-text-muted hover:text-accent transition rounded-lg hover:bg-accent/10"
                    >
                      <CaretCircleRightIcon size={18} />
                    </button>
                  </div>

                  <div className="grid grid-cols-7 gap-0.5 text-center">
                    {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(
                      (day) => (
                        <span
                          key={day}
                          className="text-text-muted text-[10px] font-medium py-1"
                        >
                          {day}
                        </span>
                      ),
                    )}
                    {calendarDays.map((day, index) => {
                      const isAvailable = isDayAvailable(day);
                      const isSelectedDay = isSelected(day);
                      const isTodayDay = isToday(day);
                      const isCurrentMonthDay = isCurrentMonth(day);

                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={() => isAvailable && handleDaySelect(day)}
                          disabled={!isAvailable}
                          className={`py-1.5 rounded-lg text-xs transition-all ${
                            !isAvailable
                              ? "text-text-muted/30 cursor-not-allowed"
                              : isSelectedDay
                                ? "bg-accent text-primary font-bold shadow-glow-sm"
                                : isTodayDay
                                  ? "border border-accent/50 text-text font-medium"
                                  : isCurrentMonthDay
                                    ? "text-text hover:bg-accent/10 hover:text-accent"
                                    : "text-text-muted/50"
                          }`}
                        >
                          {day.getDate()}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-center gap-3 mt-2 text-[10px] text-text-muted">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-accent rounded-full" />
                      <span>Selecionado</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 border border-accent/50 rounded-full" />
                      <span>Hoje</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-primary-light border border-border/50 rounded-full" />
                      <span>Disponível</span>
                    </div>
                  </div>
                </div>

                {/* Horários Disponíveis */}
                <div className="bg-primary-light rounded-xl p-3 border border-border/50">
                  <label className="block text-xs font-medium text-text-secondary mb-2">
                    {selectedDate ? (
                      <>
                        Horários para{" "}
                        {new Date(selectedDate).toLocaleDateString("pt-BR")}
                      </>
                    ) : (
                      "Selecione uma data"
                    )}
                  </label>

                  {loadingSlots ? (
                    <div className="flex items-center justify-center py-4 bg-primary rounded-xl border border-border/50">
                      <Spinner color="#C9A84C" size={8} />
                      <span className="text-text-muted text-xs ml-2">
                        Carregando...
                      </span>
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <div className="text-center py-4 bg-primary rounded-xl border border-border/50">
                      <p className="text-text-muted text-xs">
                        {selectedDate
                          ? "Nenhum horário disponível"
                          : "Selecione uma data primeiro"}
                      </p>
                      <p className="text-text-muted text-[10px] mt-0.5">
                        {selectedDate
                          ? "Tente outra data"
                          : "Clique em um dia no calendário"}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-1.5 max-h-32 overflow-y-auto p-0.5">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedTime(slot)}
                          className={`py-1.5 rounded-lg text-xs font-medium transition border ${
                            selectedTime === slot
                              ? "bg-accent text-primary border-accent shadow-glow-sm"
                              : "bg-primary border-border/50 text-text hover:border-accent/30 hover:bg-accent/5"
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  )}
                  {availableSlots.length > 0 && (
                    <p className="text-text-muted text-[10px] mt-1.5">
                      {availableSlots.length} horário(s) disponível(is)
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ✅ Step 3: Dados do Cliente */}
          {step === 3 && (
            <div ref={clientRef} className="space-y-3 animate-fadeIn">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleBackToStep(2)}
                  className="text-text-muted hover:text-accent transition p-1"
                >
                  <CaretCircleLeftIcon size={16} />
                </button>
                <div className="w-7 h-7 bg-accent rounded-full flex items-center justify-center text-primary text-[10px] font-bold">
                  3
                </div>
                <span className="text-sm font-medium text-text">
                  Seus dados
                </span>
              </div>

              <div className="space-y-2">
                <div className="bg-primary-light rounded-xl p-3 border border-border/50">
                  <div className="bg-primary/50 rounded-lg p-0.5">
                    <Input
                      label="Nome Completo"
                      placeholder="Digite seu nome"
                      icon={<UserIcon size={18} />}
                      iconPosition="left"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      required
                      disabled={submitting}
                      autoComplete="name"
                      className="bg-transparent border-0 focus:ring-0 text-sm"
                      labelClassName="text-xs"
                    />
                  </div>
                </div>

                <div className="bg-primary-light rounded-xl p-3 border border-border/50">
                  <div className="bg-primary/50 rounded-lg p-0.5">
                    <Input
                      label="Telefone"
                      type="tel"
                      placeholder="+5511999999999"
                      icon={<PhoneIcon size={18} />}
                      iconPosition="left"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      required
                      disabled={submitting}
                      helperText="Ex: +5511999999999"
                      autoComplete="tel"
                      className="bg-transparent border-0 focus:ring-0 text-sm"
                      labelClassName="text-xs"
                    />
                  </div>
                </div>

                <div className="bg-primary-light rounded-xl p-3 border border-border/50">
                  <div className="bg-primary/50 rounded-lg p-0.5">
                    <Input
                      label="Observações (opcional)"
                      placeholder="Alguma observação sobre o serviço..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      disabled={submitting}
                      className="bg-transparent border-0 focus:ring-0 text-sm"
                      labelClassName="text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ✅ Resumo do Agendamento */}
          {selectedServiceObj && step >= 2 && (
            <section className="bg-primary-light rounded-xl p-3 border border-accent/20">
              <h3 className="font-semibold text-text text-xs mb-2 flex items-center gap-1.5">
                <CalendarIcon size={14} className="text-accent" />
                Resumo
              </h3>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-text-muted">Serviço:</span>
                  <span className="text-text">{selectedServiceObj.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Preço:</span>
                  <span className="text-accent font-bold">
                    {formatPrice(selectedServiceObj.price)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Duração:</span>
                  <span className="text-text">
                    {selectedServiceObj.duration_minutes}min
                  </span>
                </div>
                {selectedDate && (
                  <div className="flex justify-between">
                    <span className="text-text-muted">Data:</span>
                    <span className="text-text">
                      {new Date(selectedDate).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                )}
                {selectedTime && (
                  <div className="flex justify-between">
                    <span className="text-text-muted">Horário:</span>
                    <span className="text-text">{selectedTime}</span>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* ✅ Botão de Submissão */}
          {step >= 3 && (
            <Button
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              icon={<CalendarIcon size={16} />}
              iconPosition="left"
              loading={submitting}
              disabled={
                submitting || !selectedService || !selectedDate || !selectedTime
              }
            >
              Solicitar Agendamento
            </Button>
          )}

          {step >= 3 && (
            <p className="text-text-muted text-[10px] text-center">
              Ao solicitar, você receberá a confirmação via WhatsApp.
            </p>
          )}
        </form>
      )}
    </>
  );
};
