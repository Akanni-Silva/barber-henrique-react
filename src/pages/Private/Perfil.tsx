// src/pages/Private/Perfil.tsx
/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useApi } from "../../hooks/useApi";
import { toast } from "react-toastify";
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  PencilIcon,
  CheckIcon,
  XIcon,
  SignOutIcon,
  CalendarIcon,
  ClockIcon,
  UsersIcon,
  MoneyIcon,
  LockIcon,
  TrendUpIcon,
  CameraIcon,
  MapPinIcon,
  InstagramLogoIcon,
  FacebookLogoIcon,
  WhatsappLogoIcon,
  MagnifyingGlassIcon,
} from "@phosphor-icons/react";
import { Button } from "../../components/Common/Button";
import { Input } from "../../components/Common/Input";
import { Spinner } from "../../components/Common/Spinner";
import { ConfirmPopup } from "../../components/Common/ConfirmPopup";
import { formatPrice } from "../../utils/formatPrice";
import { useGuestRedirect } from "../../hooks/useGuestRedirect";
import { fetchBarberStats } from "../../utils/barberStats";
import { fetchAddressByCep } from "../../services/cepService";
import type {
  BarberStats,
  UpdateProfileData,
  ChangePasswordData,
} from "../../types";

export const Perfil = () => {
  const { user, logout, updateUser } = useAuth();
  const { loading, handleRequest, endpoints } = useApi();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [stats, setStats] = useState<BarberStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSearchingCep, setIsSearchingCep] = useState(false);
  const [formData, setFormData] = useState<UpdateProfileData>({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    avatar_url: user?.avatar_url || "",
    address: user?.address || "",
    address_number: user?.address_number || "",
    neighborhood: user?.neighborhood || "",
    city: user?.city || "",
    state: user?.state || "",
    zip_code: user?.zip_code || "",
    working_hours: user?.working_hours || "",
    whatsapp: user?.whatsapp || "",
    instagram: user?.instagram || "",
    facebook: user?.facebook || "",
    google_maps_url: user?.google_maps_url || "",
  });

  const [passwordData, setPasswordData] = useState<
    ChangePasswordData & { confirm_password: string }
  >({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  // ✅ Ref para controlar se a requisição já foi feita
  const hasLoaded = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // ✅ Corrigido: usar ReturnType<typeof setTimeout> em vez de NodeJS.Timeout
  const cepTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useGuestRedirect({
    redirectTo: "/",
    toastMessage: "Faça login para acessar seu perfil",
    showToast: true,
    toastDelay: 300,
  });

  // ✅ Função de carregamento com controle de execução
  const loadStats = useCallback(async () => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;

    setIsLoadingStats(true);
    try {
      const statsData = await fetchBarberStats(endpoints, handleRequest);
      setStats(statsData);
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
      setStats({
        totalAppointments: 0,
        totalClients: 0,
        totalRevenue: 0,
        todayAppointments: 0,
        monthlyRevenue: 0,
        weeklyAppointments: 0,
        averageRating: 0,
      });
    } finally {
      setIsLoadingStats(false);
    }
  }, [endpoints, handleRequest]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // ✅ Função para buscar endereço via CEP
  const handleCepSearch = async (cep: string) => {
    const cleanedCep = cep.replace(/\D/g, "");

    if (cleanedCep.length !== 8) {
      return;
    }

    setIsSearchingCep(true);
    try {
      const addressData = await fetchAddressByCep(cleanedCep);

      if (addressData) {
        setFormData((prev) => ({
          ...prev,
          address: addressData.logradouro || "",
          neighborhood: addressData.bairro || "",
          city: addressData.localidade || "",
          state: addressData.uf || "",
          zip_code: cep,
        }));
        toast.success("Endereço preenchido automaticamente!");
      } else {
        toast.warning("CEP não encontrado. Preencha o endereço manualmente.");
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      toast.error("Erro ao buscar CEP. Preencha o endereço manualmente.");
    } finally {
      setIsSearchingCep(false);
    }
  };

  // ✅ Handler para mudança no CEP com debounce
  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, zip_code: value });

    // Limpar timeout anterior
    if (cepTimeoutRef.current) {
      clearTimeout(cepTimeoutRef.current);
    }

    // ✅ Buscar automaticamente após 500ms de inatividade
    const cleanedCep = value.replace(/\D/g, "");
    if (cleanedCep.length === 8) {
      cepTimeoutRef.current = setTimeout(() => {
        handleCepSearch(value);
      }, 500);
    }
  };

  // ✅ Função para comprimir imagem antes do upload
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_SIZE = 300;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_SIZE) {
              height = Math.round((height * MAX_SIZE) / width);
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width = Math.round((width * MAX_SIZE) / height);
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);

          resolve(canvas.toDataURL("image/jpeg", 0.5));
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  // ✅ Atualizar a função de upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.warning("Por favor, selecione uma imagem válida");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.warning("A imagem deve ter no máximo 2MB");
      return;
    }

    setIsUploadingAvatar(true);

    try {
      const compressedImage = await compressImage(file);

      const response = await handleRequest(
        endpoints.auth.updateProfile({
          avatar_url: compressedImage,
        }),
      );

      if (response?.barber) {
        updateUser({
          avatar_url: response.barber.avatar_url,
        });
        setFormData((prev) => ({
          ...prev,
          avatar_url: response.barber.avatar_url,
        }));
      }

      toast.success("Foto de perfil atualizada com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar avatar:", error);
      toast.error("Erro ao atualizar foto de perfil");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // ✅ Função para abrir seletor de arquivos
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleEdit = () => {
    setIsEditing(true);
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      avatar_url: user?.avatar_url || "",
      address: user?.address || "",
      address_number: user?.address_number || "",
      neighborhood: user?.neighborhood || "",
      city: user?.city || "",
      state: user?.state || "",
      zip_code: user?.zip_code || "",
      working_hours: user?.working_hours || "",
      whatsapp: user?.whatsapp || "",
      instagram: user?.instagram || "",
      facebook: user?.facebook || "",
      google_maps_url: user?.google_maps_url || "",
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      avatar_url: user?.avatar_url || "",
      address: user?.address || "",
      address_number: user?.address_number || "",
      neighborhood: user?.neighborhood || "",
      city: user?.city || "",
      state: user?.state || "",
      zip_code: user?.zip_code || "",
      working_hours: user?.working_hours || "",
      whatsapp: user?.whatsapp || "",
      instagram: user?.instagram || "",
      facebook: user?.facebook || "",
      google_maps_url: user?.google_maps_url || "",
    });
    setIsChangingPassword(false);
    setPasswordData({
      current_password: "",
      new_password: "",
      confirm_password: "",
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await handleRequest(
        endpoints.auth.updateProfile({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          avatar_url: formData.avatar_url,
          address: formData.address,
          address_number: formData.address_number,
          neighborhood: formData.neighborhood,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zip_code,
          working_hours: formData.working_hours,
          whatsapp: formData.whatsapp,
          instagram: formData.instagram,
          facebook: formData.facebook,
          google_maps_url: formData.google_maps_url,
        }),
      );

      if (response?.barber) {
        updateUser({
          name: response.barber.name,
          email: response.barber.email,
          phone: response.barber.phone,
          avatar_url: response.barber.avatar_url,
          address: response.barber.address,
          address_number: response.barber.address_number,
          neighborhood: response.barber.neighborhood,
          city: response.barber.city,
          state: response.barber.state,
          zip_code: response.barber.zip_code,
          working_hours: response.barber.working_hours,
          whatsapp: response.barber.whatsapp,
          instagram: response.barber.instagram,
          facebook: response.barber.facebook,
          google_maps_url: response.barber.google_maps_url,
        });
      }

      toast.success(response?.message || "Perfil atualizado com sucesso!");
      setIsEditing(false);
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      toast.error("Erro ao atualizar perfil");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.warning("As senhas não coincidem");
      return;
    }

    if (passwordData.new_password.length < 6) {
      toast.warning("A nova senha deve ter pelo menos 6 caracteres");
      return;
    }

    setIsSaving(true);

    try {
      await handleRequest(
        endpoints.auth.changePassword({
          current_password: passwordData.current_password,
          new_password: passwordData.new_password,
        }),
      );

      toast.success("Senha alterada com sucesso!");
      setIsChangingPassword(false);
      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (error) {
      console.error("Erro ao alterar senha:", error);
      toast.error("Erro ao alterar senha");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.info("👋 Até logo!");
  };

  if (loading || isLoadingStats) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Spinner color="#C9A84C" size={20} text="Carregando perfil..." />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-20">
      {/* ✅ Cabeçalho do Perfil com Avatar */}
      <div className="text-center mb-6">
        <div className="relative inline-block group">
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-accent/20 shadow-glow bg-primary-light flex items-center justify-center">
            {formData.avatar_url || user?.avatar_url ? (
              <img
                src={formData.avatar_url || user?.avatar_url || ""}
                alt={user?.name || "Barbeiro"}
                className="w-full h-full object-cover"
              />
            ) : (
              <UserIcon size={40} className="text-accent" weight="fill" />
            )}
          </div>

          {!isEditing && !isChangingPassword && (
            <button
              onClick={handleAvatarClick}
              disabled={isUploadingAvatar}
              className="absolute bottom-0 right-0 p-2 bg-accent rounded-full text-primary hover:bg-accent-light transition shadow-lg disabled:opacity-50"
            >
              {isUploadingAvatar ? (
                <Spinner color="#1A1A1A" size={8} />
              ) : (
                <CameraIcon size={16} />
              )}
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            className="hidden"
          />

          {!isEditing && !isChangingPassword && (
            <button
              onClick={handleEdit}
              className="absolute bottom-0 left-0 p-2 bg-primary-light border border-accent/20 rounded-full text-accent hover:bg-accent/10 transition shadow-lg"
            >
              <PencilIcon size={14} />
            </button>
          )}
        </div>

        <h1 className="font-serif text-xl font-bold text-text mt-3">
          {user?.name || "Barbeiro"}
        </h1>
        <p className="text-text-muted text-xs">{user?.email || ""}</p>
      </div>

      {/* ✅ Formulário de Edição */}
      {isEditing ? (
        <form onSubmit={handleSave} className="space-y-4">
          {/* Avatar */}
          <div className="bg-primary-light rounded-xl p-4 border border-border/50">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden border border-accent/20 bg-primary flex items-center justify-center flex-shrink-0">
                {formData.avatar_url ? (
                  <img
                    src={formData.avatar_url}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserIcon size={28} className="text-accent" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-text font-medium text-sm">Foto de Perfil</p>
                <p className="text-text-muted text-xs">
                  Clique na câmera na foto para alterar
                </p>
                <button
                  type="button"
                  onClick={handleAvatarClick}
                  className="text-accent text-xs hover:text-accent-light transition mt-1"
                >
                  Alterar foto
                </button>
              </div>
            </div>
          </div>

          {/* Informações Básicas */}
          <div className="bg-primary-light rounded-xl p-4 border border-border/50">
            <div className="bg-primary/50 rounded-lg p-1">
              <Input
                label="Nome Completo"
                placeholder="Seu nome"
                icon={<UserIcon size={18} />}
                iconPosition="left"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                disabled={isSaving}
                className="bg-transparent border-0 focus:ring-0 text-sm"
                labelClassName="text-xs"
                containerClassName="[&_input]:py-2.5 [&_input]:px-3 [&_input]:pl-10"
              />
            </div>
          </div>

          <div className="bg-primary-light rounded-xl p-4 border border-border/50">
            <div className="bg-primary/50 rounded-lg p-1">
              <Input
                label="Email"
                type="email"
                placeholder="seu@email.com"
                icon={<EnvelopeIcon size={18} />}
                iconPosition="left"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                disabled={isSaving}
                className="bg-transparent border-0 focus:ring-0 text-sm"
                labelClassName="text-xs"
                containerClassName="[&_input]:py-2.5 [&_input]:px-3 [&_input]:pl-10"
              />
            </div>
          </div>

          <div className="bg-primary-light rounded-xl p-4 border border-border/50">
            <div className="bg-primary/50 rounded-lg p-1">
              <Input
                label="Telefone"
                type="tel"
                placeholder="+55 (11) 99999-9999"
                icon={<PhoneIcon size={18} />}
                iconPosition="left"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                required
                disabled={isSaving}
                className="bg-transparent border-0 focus:ring-0 text-sm"
                labelClassName="text-xs"
                containerClassName="[&_input]:py-2.5 [&_input]:px-3 [&_input]:pl-10"
              />
            </div>
          </div>

          {/* ✅ Endereço com Busca de CEP */}
          <div className="bg-primary-light rounded-xl p-4 border border-border/50">
            <h3 className="text-sm font-semibold text-text mb-3 flex items-center gap-2">
              <MapPinIcon size={18} className="text-accent" />
              Endereço
            </h3>

            {/* CEP com busca automática */}
            <div className="bg-primary/50 rounded-lg p-1 mb-3">
              <Input
                label="CEP"
                placeholder="01000-000"
                icon={<MagnifyingGlassIcon size={18} className="text-accent" />}
                iconPosition="left"
                value={formData.zip_code || ""}
                onChange={handleCepChange}
                disabled={isSaving || isSearchingCep}
                helperText={
                  isSearchingCep
                    ? "Buscando endereço..."
                    : "Digite o CEP para preencher automaticamente"
                }
                className="bg-transparent border-0 focus:ring-0 text-sm"
                labelClassName="text-xs"
                containerClassName="[&_input]:py-2.5 [&_input]:px-3 [&_input]:pl-10"
              />
            </div>

            <div className="bg-primary/50 rounded-lg p-1">
              <Input
                label="Rua"
                placeholder="Rua Exemplo"
                value={formData.address || ""}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                disabled={isSaving}
                className="bg-transparent border-0 focus:ring-0 text-sm"
                labelClassName="text-xs"
                containerClassName="[&_input]:py-2.5 [&_input]:px-3"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-primary-light rounded-xl p-4 border border-border/50">
              <div className="bg-primary/50 rounded-lg p-1">
                <Input
                  label="Número"
                  placeholder="123"
                  value={formData.address_number || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, address_number: e.target.value })
                  }
                  disabled={isSaving}
                  className="bg-transparent border-0 focus:ring-0 text-sm"
                  labelClassName="text-xs"
                  containerClassName="[&_input]:py-2.5 [&_input]:px-3"
                />
              </div>
            </div>
            <div className="bg-primary-light rounded-xl p-4 border border-border/50">
              <div className="bg-primary/50 rounded-lg p-1">
                <Input
                  label="Bairro"
                  placeholder="Centro"
                  value={formData.neighborhood || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, neighborhood: e.target.value })
                  }
                  disabled={isSaving}
                  className="bg-transparent border-0 focus:ring-0 text-sm"
                  labelClassName="text-xs"
                  containerClassName="[&_input]:py-2.5 [&_input]:px-3"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-primary-light rounded-xl p-4 border border-border/50">
              <div className="bg-primary/50 rounded-lg p-1">
                <Input
                  label="Cidade"
                  placeholder="São Paulo"
                  value={formData.city || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  disabled={isSaving}
                  className="bg-transparent border-0 focus:ring-0 text-sm"
                  labelClassName="text-xs"
                  containerClassName="[&_input]:py-2.5 [&_input]:px-3"
                />
              </div>
            </div>
            <div className="bg-primary-light rounded-xl p-4 border border-border/50">
              <div className="bg-primary/50 rounded-lg p-1">
                <Input
                  label="Estado (UF)"
                  placeholder="SP"
                  value={formData.state || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, state: e.target.value })
                  }
                  disabled={isSaving}
                  className="bg-transparent border-0 focus:ring-0 text-sm"
                  labelClassName="text-xs"
                  containerClassName="[&_input]:py-2.5 [&_input]:px-3"
                />
              </div>
            </div>
          </div>

          {/* Horário e Contato */}
          <div className="bg-primary-light rounded-xl p-4 border border-border/50">
            <div className="bg-primary/50 rounded-lg p-1">
              <Input
                label="Horário de Funcionamento"
                placeholder="Seg-Sex: 09h-20h • Sáb: 09h-16h"
                value={formData.working_hours || ""}
                onChange={(e) =>
                  setFormData({ ...formData, working_hours: e.target.value })
                }
                disabled={isSaving}
                className="bg-transparent border-0 focus:ring-0 text-sm"
                labelClassName="text-xs"
                containerClassName="[&_input]:py-2.5 [&_input]:px-3 [&_input]:pl-10"
              />
            </div>
          </div>

          <div className="bg-primary-light rounded-xl p-4 border border-border/50">
            <div className="bg-primary/50 rounded-lg p-1">
              <Input
                label="WhatsApp"
                placeholder="5511999999999"
                icon={<WhatsappLogoIcon size={18} className="text-green-500" />}
                iconPosition="left"
                value={formData.whatsapp || ""}
                onChange={(e) =>
                  setFormData({ ...formData, whatsapp: e.target.value })
                }
                disabled={isSaving}
                helperText="Número com DDD, sem espaços ou caracteres especiais"
                className="bg-transparent border-0 focus:ring-0 text-sm"
                labelClassName="text-xs"
                containerClassName="[&_input]:py-2.5 [&_input]:px-3 [&_input]:pl-10"
              />
            </div>
          </div>

          {/* Redes Sociais */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-primary-light rounded-xl p-4 border border-border/50">
              <div className="bg-primary/50 rounded-lg p-1">
                <Input
                  label="Instagram"
                  placeholder="@barbearia"
                  icon={<InstagramLogoIcon size={18} className="text-accent" />}
                  iconPosition="left"
                  value={formData.instagram || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, instagram: e.target.value })
                  }
                  disabled={isSaving}
                  className="bg-transparent border-0 focus:ring-0 text-sm"
                  labelClassName="text-xs"
                  containerClassName="[&_input]:py-2.5 [&_input]:px-3 [&_input]:pl-10"
                />
              </div>
            </div>
            <div className="bg-primary-light rounded-xl p-4 border border-border/50">
              <div className="bg-primary/50 rounded-lg p-1">
                <Input
                  label="Facebook"
                  placeholder="https://facebook.com/..."
                  icon={<FacebookLogoIcon size={18} className="text-accent" />}
                  iconPosition="left"
                  value={formData.facebook || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, facebook: e.target.value })
                  }
                  disabled={isSaving}
                  className="bg-transparent border-0 focus:ring-0 text-sm"
                  labelClassName="text-xs"
                  containerClassName="[&_input]:py-2.5 [&_input]:px-3 [&_input]:pl-10"
                />
              </div>
            </div>
          </div>

          <div className="bg-primary-light rounded-xl p-4 border border-border/50">
            <div className="bg-primary/50 rounded-lg p-1">
              <Input
                label="Link do Google Maps"
                placeholder="https://maps.google.com/..."
                value={formData.google_maps_url || ""}
                onChange={(e) =>
                  setFormData({ ...formData, google_maps_url: e.target.value })
                }
                disabled={isSaving}
                helperText="Cole o link completo do Google Maps da sua barbearia"
                className="bg-transparent border-0 focus:ring-0 text-sm"
                labelClassName="text-xs"
                containerClassName="[&_input]:py-2.5 [&_input]:px-3"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              icon={<CheckIcon size={16} />}
              loading={isSaving}
            >
              Salvar
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="md"
              fullWidth
              icon={<XIcon size={16} />}
              onClick={handleCancel}
              disabled={isSaving}
            >
              Cancelar
            </Button>
          </div>
        </form>
      ) : isChangingPassword ? (
        // ✅ Formulário de alteração de senha
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="bg-primary-light rounded-xl p-4 border border-border/50">
            <div className="bg-primary/50 rounded-lg p-1">
              <Input
                label="Senha Atual"
                type="password"
                placeholder="Digite sua senha atual"
                icon={<LockIcon size={18} />}
                iconPosition="left"
                value={passwordData.current_password}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    current_password: e.target.value,
                  })
                }
                required
                disabled={isSaving}
                className="bg-transparent border-0 focus:ring-0 text-sm"
                labelClassName="text-xs"
                containerClassName="[&_input]:py-2.5 [&_input]:px-3 [&_input]:pl-10"
              />
            </div>
          </div>

          <div className="bg-primary-light rounded-xl p-4 border border-border/50">
            <div className="bg-primary/50 rounded-lg p-1">
              <Input
                label="Nova Senha"
                type="password"
                placeholder="Digite a nova senha"
                icon={<LockIcon size={18} />}
                iconPosition="left"
                value={passwordData.new_password}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    new_password: e.target.value,
                  })
                }
                required
                disabled={isSaving}
                minLength={6}
                className="bg-transparent border-0 focus:ring-0 text-sm"
                labelClassName="text-xs"
                containerClassName="[&_input]:py-2.5 [&_input]:px-3 [&_input]:pl-10"
              />
            </div>
          </div>

          <div className="bg-primary-light rounded-xl p-4 border border-border/50">
            <div className="bg-primary/50 rounded-lg p-1">
              <Input
                label="Confirmar Nova Senha"
                type="password"
                placeholder="Confirme a nova senha"
                icon={<LockIcon size={18} />}
                iconPosition="left"
                value={passwordData.confirm_password}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    confirm_password: e.target.value,
                  })
                }
                required
                disabled={isSaving}
                minLength={6}
                className="bg-transparent border-0 focus:ring-0 text-sm"
                labelClassName="text-xs"
                containerClassName="[&_input]:py-2.5 [&_input]:px-3 [&_input]:pl-10"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              icon={<CheckIcon size={16} />}
              loading={isSaving}
            >
              Alterar Senha
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="md"
              fullWidth
              icon={<XIcon size={16} />}
              onClick={handleCancel}
              disabled={isSaving}
            >
              Cancelar
            </Button>
          </div>
        </form>
      ) : (
        // ✅ Visualização do Perfil
        <>
          <div className="bg-primary-light rounded-xl border border-border/50 divide-y divide-border/50">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
                  <UserIcon size={16} className="text-accent" />
                </div>
                <div>
                  <p className="text-text-muted text-xs">Nome</p>
                  <p className="text-text font-medium text-sm">
                    {user?.name || "-"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
                  <EnvelopeIcon size={16} className="text-accent" />
                </div>
                <div>
                  <p className="text-text-muted text-xs">Email</p>
                  <p className="text-text font-medium text-sm">
                    {user?.email || "-"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
                  <PhoneIcon size={16} className="text-accent" />
                </div>
                <div>
                  <p className="text-text-muted text-xs">Telefone</p>
                  <p className="text-text font-medium text-sm">
                    {user?.phone || "-"}
                  </p>
                </div>
              </div>
            </div>

            {user?.address && (
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
                    <MapPinIcon size={16} className="text-accent" />
                  </div>
                  <div>
                    <p className="text-text-muted text-xs">Endereço</p>
                    <p className="text-text font-medium text-sm">
                      {[user.address, user.address_number, user.neighborhood]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                    <p className="text-text-muted text-xs">
                      {[user.city, user.state].filter(Boolean).join(" - ")}
                    </p>
                    {user.zip_code && (
                      <p className="text-text-muted text-xs">
                        CEP: {user.zip_code}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {user?.working_hours && (
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
                    <ClockIcon size={16} className="text-accent" />
                  </div>
                  <div>
                    <p className="text-text-muted text-xs">Horário</p>
                    <p className="text-text font-medium text-sm">
                      {user.working_hours}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {user?.whatsapp && (
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <WhatsappLogoIcon size={16} className="text-green-500" />
                  </div>
                  <div>
                    <p className="text-text-muted text-xs">WhatsApp</p>
                    <p className="text-text font-medium text-sm">
                      {user.whatsapp}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {(user?.instagram || user?.facebook) && (
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
                    <InstagramLogoIcon size={16} className="text-accent" />
                  </div>
                  <div>
                    <p className="text-text-muted text-xs">Redes Sociais</p>
                    <div className="flex items-center gap-3">
                      {user.instagram && (
                        <a
                          href={`https://instagram.com/${user.instagram.replace("@", "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-text font-medium text-sm hover:text-accent transition"
                        >
                          {user.instagram}
                        </a>
                      )}
                      {user.facebook && (
                        <a
                          href={user.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-text font-medium text-sm hover:text-accent transition"
                        >
                          Facebook
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ✅ Botão Alterar Senha */}
          <button
            onClick={() => setIsChangingPassword(true)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-accent border border-accent/30 hover:bg-accent/10 transition mt-4"
          >
            <LockIcon size={18} />
            <span className="text-sm font-medium">Alterar Senha</span>
          </button>

          {/* ✅ Estatísticas do Barbeiro */}
          <div className="mt-6">
            <h2 className="font-serif text-sm font-bold text-text mb-3">
              📊 Suas Estatísticas
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-primary-light rounded-xl p-4 border border-border/50 text-center">
                <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <CalendarIcon size={16} className="text-accent" />
                </div>
                <p className="text-2xl font-bold text-text">
                  {stats?.todayAppointments || 0}
                </p>
                <p className="text-text-muted text-[10px]">Hoje</p>
              </div>

              <div className="bg-primary-light rounded-xl p-4 border border-border/50 text-center">
                <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <ClockIcon size={16} className="text-accent" />
                </div>
                <p className="text-2xl font-bold text-text">
                  {stats?.totalAppointments || 0}
                </p>
                <p className="text-text-muted text-[10px]">Agendamentos</p>
              </div>

              <div className="bg-primary-light rounded-xl p-4 border border-border/50 text-center">
                <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <UsersIcon size={16} className="text-accent" />
                </div>
                <p className="text-2xl font-bold text-text">
                  {stats?.totalClients || 0}
                </p>
                <p className="text-text-muted text-[10px]">Clientes</p>
              </div>

              <div className="bg-primary-light rounded-xl p-4 border border-border/50 text-center">
                <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <MoneyIcon size={16} className="text-accent" />
                </div>
                <p className="text-lg font-bold text-accent">
                  {formatPrice(stats?.totalRevenue || 0)}
                </p>
                <p className="text-text-muted text-[10px]">Receita Total</p>
              </div>

              {stats?.monthlyRevenue !== undefined &&
                stats.monthlyRevenue > 0 && (
                  <div className="bg-primary-light rounded-xl p-4 border border-accent/20 text-center col-span-2">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <TrendUpIcon size={16} className="text-accent" />
                      <span className="text-text-muted text-[10px] font-medium uppercase tracking-wider">
                        Últimos 30 dias
                      </span>
                    </div>
                    <p className="text-xl font-bold text-accent">
                      {formatPrice(stats.monthlyRevenue)}
                    </p>
                    <p className="text-text-muted text-[10px]">
                      {stats.weeklyAppointments || 0} agendamentos
                    </p>
                  </div>
                )}
            </div>
          </div>

          {/* ✅ Botão Sair */}
          <div className="mt-6">
            <ConfirmPopup
              trigger={
                <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-red-500 border border-red-500/30 hover:bg-red-500/10 transition">
                  <SignOutIcon size={18} />
                  <span className="text-sm font-medium">Sair da conta</span>
                </button>
              }
              onConfirm={handleLogout}
              title="Sair da conta"
              message="Tem certeza que deseja sair da sua conta?"
              confirmText="Sair"
              cancelText="Cancelar"
              variant="danger"
              size="md"
            />
          </div>
        </>
      )}

      {/* ✅ Versão do App */}
      <div className="mt-6 text-center">
        <p className="text-text-muted text-[10px]">
          Henrique Cortes Barber v1.0.0
        </p>
      </div>
    </div>
  );
};

export default Perfil;
