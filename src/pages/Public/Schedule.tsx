/* eslint-disable react-hooks/refs */
// src/pages/Public/Schedule.tsx
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

import { useApi } from "../../hooks/useApi";
import { useAuth } from "../../hooks/useAuth";
import { Input } from "../../components/Common/Input";
import { Spinner } from "../../components/Common/Spinner";
import { ServiceIcon } from "../../components/Common/ServiceIcon";
import { Button } from "../../components/Common/Button";
import { formatPrice } from "../../utils/formatPrice";
import { isValidPhone } from "../../utils/validators";
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
  ScissorsIcon,
  CheckCircleIcon,
} from "@phosphor-icons/react";

export const Schedule = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loading, handleRequest, endpoints } = useApi();
  const { isAuthenticated } = useAuth();

  const [services, setServices] = useState<Product[]>([]);
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [step, setStep] = useState(1);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  // Estados do Calendário
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [calendarDays, setCalendarDays] = useState<Date[]>([]);

  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  // ✅ Ref para armazenar os dados do cliente vindo da URL
  const clientDataRef = useRef<{ id: string; name: string; phone: string }>({
    id: "",
    name: "",
    phone: "",
  });

  const serviceRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);
  const clientRef = useRef<HTMLDivElement>(null);

  // ✅ Detectar tamanho da tela
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ Capturar parâmetros da URL (para agendamento via histórico do cliente)
  useEffect(() => {
    const clientId = searchParams.get("clientId");
    const name = searchParams.get("clientName");
    const phone = searchParams.get("clientPhone");

    if (clientId) {
      clientDataRef.current.id = clientId;
    }
    if (name) {
      clientDataRef.current.name = name;
    }
    if (phone) {
      clientDataRef.current.phone = phone;
    }
  }, [searchParams]);

  // Gerar dias do calendário
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

  // ✅ Quando chegar no step 3, carregar os dados do cliente (se existirem)
  useEffect(() => {
    if (step === 3) {
      const { name, phone } = clientDataRef.current;
      if (name && !clientName) {
        setClientName(name);
      }
      if (phone && !clientPhone) {
        setClientPhone(phone);
      }
    }
  }, [step, clientName, clientPhone]);

  // Validação de telefone em tempo real
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setClientPhone(value);

    if (value && !isValidPhone(value)) {
      setPhoneError("Digite um número de telefone válido (com DDD)");
    } else {
      setPhoneError(null);
    }
  };

  // Função para resetar o formulário e voltar ao step 1
  const resetForm = () => {
    setSuccess(false);
    setClientName("");
    setClientPhone("");
    setNotes("");
    setSelectedDate("");
    setSelectedTime("");
    setAvailableSlots([]);
    setSelectedDay(null);
    setSelectedService(services.length > 0 ? services[0].id : null);
    setStep(1);
    setPhoneError(null);
    setCurrentMonth(new Date());
  };

  // ✅ Função para voltar ao passo anterior
  const goToPreviousStep = () => {
    if (step > 1) {
      setStep(step - 1);
      setTimeout(() => {
        const refs = [serviceRef, dateRef, clientRef];
        const targetRef = refs[step - 2];
        if (targetRef.current) {
          targetRef.current.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, 300);
    }
  };

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

    // Validar telefone
    if (!clientName.trim()) {
      toast.warning("Preencha seu nome");
      return;
    }

    if (!clientPhone.trim()) {
      toast.warning("Preencha seu telefone");
      return;
    }

    if (!isValidPhone(clientPhone)) {
      toast.warning("Digite um número de telefone válido (com DDD)");
      return;
    }

    setSubmitting(true);
    try {
      const cleanPhone = clientPhone.replace(/\D/g, "");

      const response = await handleRequest(
        endpoints.appointments.create({
          client_name: clientName.trim(),
          client_phone: cleanPhone,
          service_id: selectedService,
          appointment_date: selectedDate,
          appointment_time: formattedTime,
          notes: notes.trim() || undefined,
        }),
      );

      setSuccess(true);
      toast.success("✅ Agendamento realizado com sucesso!");

      setAvailableSlots((prev) => prev.filter((slot) => slot !== selectedTime));
      setSelectedTime("");

      // ✅ Redirecionar baseado no status de autenticação e se veio do histórico
      setTimeout(() => {
        // ✅ Se for um barbeiro logado e veio do histórico (tem clientId)
        if (isAuthenticated && clientDataRef.current.id) {
          navigate(`/clientes/${clientDataRef.current.id}/historico`);
        } else {
          // ✅ Cliente não logado ou agendamento próprio - volta para home
          resetForm();
        }
      }, 2500);
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Erro ao realizar agendamento";
      toast.error(`❌ ${message}`);
    } finally {
      setSubmitting(false);
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

  // ✅ Stepper Desktop
  const renderStepper = () => (
    <div className="flex items-center justify-center gap-2 mb-6 md:mb-8">
      {[1, 2, 3].map((s) => (
        <div key={s} className="flex items-center">
          <div
            className={`flex items-center gap-2 ${
              s < step
                ? "text-accent"
                : s === step
                  ? "text-accent"
                  : "text-text-muted"
            }`}
          >
            <div
              className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                s <= step
                  ? "bg-accent text-primary-dark"
                  : "bg-primary-light border border-border/50 text-text-muted"
              }`}
            >
              {s < step ? <CheckIcon size={isDesktop ? 18 : 14} /> : s}
            </div>
            {isDesktop && (
              <span
                className={`text-sm font-medium ${s <= step ? "text-text" : "text-text-muted"}`}
              >
                {s === 1 && "Serviço"}
                {s === 2 && "Data/Horário"}
                {s === 3 && "Dados"}
              </span>
            )}
          </div>
          {s < 3 && (
            <div
              className={`w-8 md:w-16 h-0.5 mx-2 ${
                s < step ? "bg-accent" : "bg-border/50"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  // ✅ Botão "Voltar" discreto (aparece acima do conteúdo)
  const renderBackButton = () =>
    step > 1 && (
      <button
        type="button"
        onClick={goToPreviousStep}
        className="flex items-center gap-1.5 text-text-muted hover:text-accent transition text-xs font-medium mb-3 group"
      >
        <CaretCircleLeftIcon
          size={16}
          className="group-hover:-translate-x-0.5 transition-transform"
        />
        <span>Voltar</span>
      </button>
    );

  return (
    <div className="pb-20 max-w-4xl mx-auto">
      {/* ✅ Cabeçalho com Stepper */}
      <div className="mb-4 md:mb-6">
        <h1 className="font-serif text-xl md:text-2xl font-bold text-text text-center">
          Agendar Horário
        </h1>
        <p className="text-text-muted text-xs md:text-sm text-center mt-1">
          {step === 1 && "Escolha o serviço desejado"}
          {step === 2 && "Selecione data e horário"}
          {step === 3 && "Preencha seus dados"}
        </p>
        {renderStepper()}
      </div>

      {success ? (
        <section className="bg-primary-light rounded-2xl text-center py-16 md:py-20 border border-border/50">
          <div className="w-20 h-20 md:w-24 md:h-24 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-green-500/30">
            <CheckIcon
              size={isDesktop ? 44 : 36}
              className="text-green-500"
              weight="bold"
            />
          </div>
          <h2 className="font-serif text-xl md:text-2xl font-bold text-text mb-2">
            Agendamento Confirmado! ✅
          </h2>
          <p className="text-text-muted text-sm md:text-base max-w-sm mx-auto mb-6">
            Você receberá a confirmação no WhatsApp em instantes.
          </p>
          <Button
            variant="primary"
            size="md"
            onClick={() => {
              if (isAuthenticated && clientDataRef.current.id) {
                navigate(`/clientes/${clientDataRef.current.id}/historico`);
              } else {
                resetForm();
              }
            }}
          >
            {isAuthenticated && clientDataRef.current.id
              ? "Ver Perfil do Cliente"
              : "Fazer Novo Agendamento"}
          </Button>
        </section>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
          {/* ✅ Botão Voltar (discreto) */}
          {renderBackButton()}

          {/* ✅ Step 1: Seleção de Serviço */}
          {step === 1 && (
            <div ref={serviceRef} className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {services.map((service) => (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => handleServiceSelect(service.id)}
                    className={`p-4 md:p-5 rounded-2xl border-2 transition-all duration-200 text-center ${
                      selectedService === service.id
                        ? "border-accent bg-accent/10 ring-2 ring-accent/20 shadow-glow-sm"
                        : "border-border/50 hover:border-border-light bg-primary-light"
                    }`}
                    aria-pressed={selectedService === service.id}
                  >
                    <div className="flex flex-col items-center">
                      <div
                        className={`${isDesktop ? "w-14 h-14" : "w-12 h-12"} bg-accent/10 rounded-xl flex items-center justify-center mb-2`}
                      >
                        <ServiceIcon
                          category={service.category}
                          size={isDesktop ? 24 : 22}
                        />
                      </div>
                      <h4 className="font-semibold text-text text-sm md:text-base leading-tight">
                        {service.name}
                      </h4>
                      <p className="text-accent font-bold text-sm md:text-base mt-1">
                        {formatPrice(service.price)}
                      </p>
                      <p className="text-text-muted text-[10px] md:text-xs flex items-center gap-0.5">
                        <ClockIcon size={isDesktop ? 12 : 10} />
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
            <div ref={dateRef} className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {/* Calendário */}
                <div className="bg-primary-light rounded-2xl p-4 md:p-6 border border-border/50 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <button
                      type="button"
                      onClick={goToPreviousMonth}
                      className="p-2 text-text-muted hover:text-accent transition rounded-xl hover:bg-accent/10"
                    >
                      <CaretCircleLeftIcon size={isDesktop ? 24 : 20} />
                    </button>
                    <span className="font-semibold text-text text-sm md:text-base">
                      {monthNames[currentMonth.getMonth()]}{" "}
                      {currentMonth.getFullYear()}
                    </span>
                    <button
                      type="button"
                      onClick={goToNextMonth}
                      className="p-2 text-text-muted hover:text-accent transition rounded-xl hover:bg-accent/10"
                    >
                      <CaretCircleRightIcon size={isDesktop ? 24 : 20} />
                    </button>
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-center">
                    {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(
                      (day) => (
                        <span
                          key={day}
                          className="text-text-muted text-[10px] md:text-xs font-medium py-1.5"
                        >
                          {isDesktop ? day : day.slice(0, 1)}
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
                          className={`py-2 md:py-2.5 rounded-xl text-sm md:text-base transition-all ${
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

                  <div className="flex items-center justify-center gap-4 mt-3 text-[10px] md:text-xs text-text-muted">
                    <div className="flex items-center gap-1">
                      <div className="w-2.5 h-2.5 bg-accent rounded-full" />
                      <span>Selecionado</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2.5 h-2.5 border border-accent/50 rounded-full" />
                      <span>Hoje</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2.5 h-2.5 bg-primary-light border border-border/50 rounded-full" />
                      <span>Disponível</span>
                    </div>
                  </div>
                </div>

                {/* ✅ Horários Disponíveis */}
                <div className="bg-primary-light rounded-2xl p-4 md:p-6 border border-border/50 flex flex-col">
                  <label className="block text-xs md:text-sm font-medium text-text-secondary mb-3">
                    {selectedDate ? (
                      <>
                        Horários para{" "}
                        <span className="text-accent font-semibold">
                          {new Date(selectedDate).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "long",
                          })}
                        </span>
                      </>
                    ) : (
                      "Selecione uma data"
                    )}
                  </label>

                  {loadingSlots ? (
                    <div className="flex-1 flex items-center justify-center bg-primary rounded-xl border border-border/50">
                      <Spinner color="#C9A84C" size={12} />
                      <span className="text-text-muted text-sm ml-3">
                        Carregando horários...
                      </span>
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center bg-primary rounded-xl border border-border/50">
                      <div className="text-4xl mb-2">🕐</div>
                      <p className="text-text-muted text-sm">
                        {selectedDate
                          ? "Nenhum horário disponível"
                          : "Selecione uma data primeiro"}
                      </p>
                      <p className="text-text-muted text-xs mt-0.5">
                        {selectedDate
                          ? "Tente outra data"
                          : "Clique em um dia no calendário"}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1 grid grid-cols-3 gap-2 overflow-y-auto p-1 min-h-[200px] md:min-h-[250px]">
                        {availableSlots.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setSelectedTime(slot)}
                            className={`py-2.5 md:py-3 rounded-xl text-sm md:text-base font-medium transition border ${
                              selectedTime === slot
                                ? "bg-accent text-primary border-accent shadow-glow-sm scale-[0.97]"
                                : "bg-primary border-border/50 text-text hover:border-accent/30 hover:bg-accent/5"
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                      <p className="text-text-muted text-xs md:text-sm mt-3 flex-shrink-0">
                        {availableSlots.length} horário(s) disponível(is)
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ✅ Step 3: Dados do Cliente */}
          {step === 3 && (
            <div ref={clientRef} className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-3">
                  <div className="bg-primary-light rounded-2xl p-4 md:p-5 border border-border/50">
                    <div className="bg-primary/50 rounded-xl p-0.5">
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
                        className="bg-transparent border-0 focus:ring-0 text-sm md:text-base"
                        labelClassName="text-xs md:text-sm"
                        containerClassName="[&_input]:py-2.5 md:py-3 [&_input]:px-3 [&_input]:pl-10"
                      />
                    </div>
                  </div>

                  <div className="bg-primary-light rounded-2xl p-4 md:p-5 border border-border/50">
                    <div className="bg-primary/50 rounded-xl p-0.5">
                      <Input
                        label="Telefone"
                        type="tel"
                        placeholder="+5511999999999"
                        icon={<PhoneIcon size={18} />}
                        iconPosition="left"
                        value={clientPhone}
                        onChange={handlePhoneChange}
                        error={phoneError || undefined}
                        required
                        disabled={submitting}
                        helperText="Ex: +5511999999999 (com DDD)"
                        autoComplete="tel"
                        className="bg-transparent border-0 focus:ring-0 text-sm md:text-base"
                        labelClassName="text-xs md:text-sm"
                        containerClassName="[&_input]:py-2.5 md:py-3 [&_input]:px-3 [&_input]:pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-primary-light rounded-2xl p-4 md:p-5 border border-border/50">
                  <div className="bg-primary/50 rounded-xl p-0.5">
                    <Input
                      label="Observações (opcional)"
                      placeholder="Alguma observação sobre o serviço..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      disabled={submitting}
                      className="bg-transparent border-0 focus:ring-0 text-sm md:text-base"
                      labelClassName="text-xs md:text-sm"
                      containerClassName="[&_input]:py-2.5 md:py-3 [&_input]:px-3"
                    />
                  </div>
                </div>
              </div>

              {/* ✅ Botão de Submissão */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                icon={<CalendarIcon size={isDesktop ? 20 : 18} />}
                iconPosition="left"
                loading={submitting}
                disabled={
                  submitting ||
                  !selectedService ||
                  !selectedDate ||
                  !selectedTime ||
                  !clientName.trim() ||
                  !clientPhone.trim() ||
                  !!phoneError
                }
                className="text-base md:text-lg py-4"
              >
                Solicitar Agendamento
              </Button>

              <p className="text-text-muted text-xs md:text-sm text-center">
                Ao solicitar, você receberá a confirmação via WhatsApp.
              </p>
            </div>
          )}

          {/* ✅ Resumo do Agendamento (visível nos steps 2 e 3) */}
          {selectedServiceObj && step >= 2 && (
            <section className="bg-primary-light rounded-2xl p-4 md:p-6 border border-accent/20">
              <h3 className="font-semibold text-text text-sm md:text-base mb-3 flex items-center gap-2">
                <CalendarIcon
                  size={isDesktop ? 18 : 16}
                  className="text-accent"
                />
                Resumo do Agendamento
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 text-sm md:text-base">
                <div>
                  <span className="text-text-muted">Serviço:</span>
                  <span className="text-text font-medium ml-1.5">
                    {selectedServiceObj.name}
                  </span>
                </div>
                <div>
                  <span className="text-text-muted">Preço:</span>
                  <span className="text-accent font-bold ml-1.5">
                    {formatPrice(selectedServiceObj.price)}
                  </span>
                </div>
                <div>
                  <span className="text-text-muted">Duração:</span>
                  <span className="text-text ml-1.5">
                    {selectedServiceObj.duration_minutes}min
                  </span>
                </div>
                {selectedDate && (
                  <div>
                    <span className="text-text-muted">Data:</span>
                    <span className="text-text font-medium ml-1.5">
                      {new Date(selectedDate).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                )}
                {selectedTime && (
                  <div>
                    <span className="text-text-muted">Horário:</span>
                    <span className="text-text font-medium ml-1.5">
                      {selectedTime}
                    </span>
                  </div>
                )}
              </div>
            </section>
          )}
        </form>
      )}
    </div>
  );
};

export default Schedule;
