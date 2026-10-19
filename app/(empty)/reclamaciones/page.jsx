"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { getCookie } from "cookies-next";
import Swal from "sweetalert2";

import url from "../../../api/url";
import { Loader2 } from "lucide-react";
import Header from "@/app/(client)/components/Header";
import Image from "next/image";
import Link from "next/link";
import logoLegales from "@/public/headerFooter/logoFooter.webp";

const URL_API = `${url}/api/reclamaciones`;

const documentMaxLengths = { DNI: 8, RUC: 11, CE: 20, PTP: 20, OTROS: 20 };

const SERVICIOS = [
  { id: 1, nombre: "Diseño y Desarrollo Web" },
  { id: 2, nombre: "Gestión de Redes Sociales" },
  { id: 3, nombre: "Marketing y Gestión Digital" },
  { id: 4, nombre: "Branding y Diseño" },
];

const TIPOS_DOCUMENTO = ["DNI", "RUC", "CE", "PTP", "OTROS"];

const ComplaintForm = () => {
  const today = new Date();
  const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  // Clase base para mantener texto blanco visible, fondo translúcido y placeholders claros
  const inputBaseStyles =
    "w-full p-2 border border-white/40 rounded bg-white/10 text-white placeholder-white/70 focus:outline-none focus:border-white focus:ring-2 focus:ring-white/20";

  const isFormValid = () => {
    const fields = [
      "nombre",
      "apellido",
      "documento",
      "numeroDocumento",
      "email",
      "celular",
      "direccion",
      "distrito",
      "ciudad",
      "tipoReclamo",
      "id_servicio",
      "fechaIncidente",
      "reclamoPerson",
    ];

    const fieldsValid = fields.every((field) => {
      return validateField(field, formData[field], formData) === "";
    });

    const checkboxesValid = checkReclamo === true && aceptaPolitica === true;

    return fieldsValid && checkboxesValid;
  };

  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [checkReclamo, setCheckReclamo] = useState(false);
  const [aceptaPolitica, setAceptaPolitica] = useState(false);

  const validateField = (name, value, data = formData) => {
    let error = "";

    const requiredFields = [
      "nombre",
      "apellido",
      "documento",
      "numeroDocumento",
      "email",
      "celular",
      "direccion",
      "distrito",
      "ciudad",
      "tipoReclamo",
      "id_servicio",
      "fechaIncidente",
      "reclamoPerson",
    ];

    if (requiredFields.includes(name) && !String(value).trim()) {
      return "El campo es obligatorio";
    }

    // Nombre
    if (name === "nombre" && value) {
      if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]+$/.test(value)) {
        return "El nombre solo puede contener letras y espacios";
      }
    }

    // Apellido
    if (name === "apellido" && value) {
      if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]+$/.test(value)) {
        return "El apellido solo puede contener letras y espacios";
      }
    }

    // Número de documento
    if (name === "numeroDocumento" && value) {
      if (!/^\d+$/.test(value) && data.documento !== "CE") {
        return "El documento solo puede contener números";
      }

      const maxLength = documentMaxLengths[data.documento] || 20;

      if (value.length > maxLength) {
        return `El número de documento no puede superar los ${maxLength} caracteres`;
      }

      // Para DNI/RUC exigimos exactamente la longitud correspondiente
      if (data.documento === "DNI" && value.length !== 8) {
        return "El DNI debe tener 8 dígitos";
      }

      if (data.documento === "RUC" && value.length !== 11) {
        return "El RUC debe tener 11 dígitos";
      }
      if (data.documento === "CE" && value.length < 9) {
        return "El CE debe estar completo";
      }
      if (data.documento === "PTP" && value.length < 9) {
        return "El PTP debe estar completo";
      }
    }

    // Correo
    if (name === "email" && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(value)) {
        return "Ingrese un correo electrónico válido";
      }
    }

    // Celular
    if (name === "celular" && value) {
      if (!/^\d+$/.test(value)) {
        return "El celular solo puede contener números";
      }
      if (!/^9\d{8}$/.test(value)) {
        return "El celular debe tener 9 dígitos y empezar con 9";
      }

      if (value.length > 20) {
        return "El celular no puede superar los 20 dígitos";
      }
    }

    if (name === "fechaIncidente" && value) {
      const selectedDate = new Date(`${value}T00:00:00`);
      const minDate = new Date("2000-01-01T00:00:00");
      const todayLimit = new Date(`${todayString}T23:59:59`);

      if (selectedDate < minDate) {
        return "La fecha no puede ser anterior al año 2000";
      }

      if (selectedDate > todayLimit) {
        return "La fecha del incidente no puede ser posterior al día de hoy";
      }
    }

    return error;
  };

  function cambioReclamo(valor) {
    setCheckReclamo(valor);
  }

  function cambioPolitica(valor) {
    setAceptaPolitica(valor);
  }

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    documento: "",
    numeroDocumento: "",
    email: "",
    celular: "",
    direccion: "",
    distrito: "",
    ciudad: "",
    tipoReclamo: "",
    id_servicio: "",
    reclamoPerson: "",
    fechaIncidente: "",
    checkReclamoForm: false,
    aceptaPoliticaPrivacidad: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    let newValue = value;

    if (name === "nombre" || name === "apellido") {
      newValue = value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]/g, "");
    }

    if (name === "numeroDocumento") {
      if (formData.documento === "CE") {
        newValue = value.replace(/[^a-zA-Z0-9]/g, "").slice(0, 20);
      } else {
        newValue = value.replace(/\D/g, "");
        const maxLength = documentMaxLengths[formData.documento] || 20;
        newValue = newValue.slice(0, maxLength);
      }
    }

    if (name === "celular") {
      newValue = value.replace(/\D/g, "").slice(0, 9);
    }

    const updatedData = {
      ...formData,
      [name]: newValue,
    };

    setFormData(updatedData);

    if (touched[name] || name === "fechaIncidente") {
      const error = validateField(name, newValue, updatedData);

      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }

    if (name === "documento" && touched.numeroDocumento) {
      const documentError = validateField(
        "numeroDocumento",
        updatedData.numeroDocumento,
        updatedData,
      );

      setErrors((prev) => ({
        ...prev,
        numeroDocumento: documentError,
      }));
    }
  };

  useEffect(() => {
    if (typeof window === "undefined" || !window.navigator?.modelContext)
      return;

    const unregister = window.navigator.modelContext.registerTool({
      name: "submit_complaint_form",
      description:
        "Envía una reclamación o queja con datos personales e información del incidente",
      inputSchema: {
        type: "object",
        properties: {
          nombre: { type: "string", description: "Nombre del usuario" },
          apellido: { type: "string", description: "Apellido del usuario" },
          documento: {
            type: "string",
            enum: TIPOS_DOCUMENTO,
            description: "Tipo de documento de identidad",
          },
          numeroDocumento: {
            type: "string",
            description: "Número del documento",
          },
          email: {
            type: "string",
            format: "email",
            description: "Correo electrónico",
          },
          celular: { type: "string", description: "Número de teléfono" },
          direccion: { type: "string", description: "Dirección del usuario" },
          distrito: { type: "string", description: "Distrito" },
          ciudad: { type: "string", description: "Ciudad" },
          tipoReclamo: {
            type: "string",
            enum: ["QUEJA", "RECLAMO"],
            description: "Tipo de reclamo",
          },
          id_servicio: {
            type: "integer",
            enum: [1, 2, 3, 4],
            description: "Servicio contratado",
          },
          reclamoPerson: {
            type: "string",
            description: "Descripción del incidente",
          },
          fechaIncidente: {
            type: "string",
            format: "date",
            description: "Fecha del incidente",
          },
          aceptaPoliticaPrivacidad: {
            type: "boolean",
            description: "Acepta políticas de privacidad",
          },
          checkReclamoForm: {
            type: "boolean",
            description: "Confirmación de envío",
          },
        },
        required: ["nombre", "apellido", "email", "celular", "reclamoPerson"],
      },
      execute: async ({
        nombre,
        apellido,
        documento,
        numeroDocumento,
        email,
        celular,
        direccion,
        distrito,
        ciudad,
        tipoReclamo,
        id_servicio,
        reclamoPerson,
        fechaIncidente,
      }) => {
        try {
          const response = await axios.post(
            URL_API,
            {
              nombre,
              apellido,
              documento,
              numeroDocumento,
              email,
              celular,
              direccion,
              distrito,
              ciudad,
              tipoReclamo,
              id_servicio,
              reclamoPerson,
              fechaIncidente,
            },
            {
              headers: {
                Authorization: `Bearer ${getCookie("token")}`,
                Accept: "application/json",
                "Content-Type": "application/json",
              },
            },
          );
          return response.status === 201
            ? { success: true, message: "Reclamación enviada correctamente" }
            : { success: false, message: "No se pudo enviar" };
        } catch (error) {
          return { success: false, message: error.message };
        }
      },
      annotations: {
        readOnlyHint: false,
        openWorldHint: true,
        destructiveHint: false,
        idempotentHint: false,
      },
    });

    return () => unregister && unregister();
  }, []);

  const handleBlur = (e) => {
    const { name, value } = e.target;

    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    const error = validateField(name, value, formData);

    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleCheckboxChange = (name, value) => {
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: value ? "" : "Debe aceptar este campo",
    }));
  };

  const handleSubmit = async (e) => {
    formData.aceptaPoliticaPrivacidad = aceptaPolitica;
    formData.checkReclamoForm = checkReclamo;
    e.preventDefault();

    if (!isFormValid()) {
      Swal.fire({
        title: "Datos inválidos",
        text: "Por favor, revise los campos del formulario antes de enviar.",
        icon: "warning",
        confirmButtonText: "OK",
      });
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const response = await axios.post(`${URL_API}`, formData, {
        headers: {
          Authorization: `Bearer ${getCookie("token")}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (response.status === 201) {
        Swal.fire({
          title: "Mensaje Enviado Correctamente",
          text: "Nos pondremos en contacto contigo lo antes posible.",
          icon: "success",
          confirmButtonText: "OK",
        });
        setFormData({
          nombre: "",
          apellido: "",
          documento: "",
          numeroDocumento: "",
          email: "",
          celular: "",
          direccion: "",
          distrito: "",
          ciudad: "",
          tipoReclamo: "",
          id_servicio: "",
          reclamoPerson: "",
          fechaIncidente: "",
          checkReclamoForm: false,
          aceptaPoliticaPrivacidad: false,
        });
        setAceptaPolitica(false);
        setCheckReclamo(false);
      } else {
        Swal.fire({
          title: "Error",
          text: "No se pudo enviar la reclamación correctamente.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      console.error(error);
      const errorMessage =
        error?.response?.data?.message ||
        (error?.response?.data?.errors
          ? Object.values(error.response.data.errors).flat().join(" ")
          : "Ocurrió un error inesperado.");
      Swal.fire({
        title: "Error",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#270564] to-[#320874]">
      {/* 1. Barra de navegación global superior */}
      <Header />

      {/* 2. Sección del LOGO */}
      <header className="flex items-center justify-center py-6">
        <Image
          src={logoLegales}
          alt="Digimedia"
          width={160}
          height={120}
          priority
        />
      </header>

      {/* 3. Contenedor de contenido para el botón y el formulario */}
      <main className="grid justify-items-center bg-gradient-to-r from-[#270564] to-[#320874] px-10 py-6 text-white w-full">
        <div className="mb-3 w-full border-b border-white/20 pb-3 text-left md:w-2/3">
          <div className="mb-6 w-full text-left">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-[#E94E77] hover:text-[#D13B62] transition-colors mb-4 font-medium"
              aria-label="Volver al inicio"
              title="Volver al inicio"
            >
              <span>← Volver al inicio</span>
            </Link>
          </div>

          <h1 className="text-3xl font-bold text-center mb-4 text-white">
            Libro de Reclamaciones
          </h1>
          <p className="text-sm text-white mb-2">
            Conforme está establecido en el Código de Protección y Defensa del
            Consumidor contamos con un Libro de Reclamaciones Virtual a tu
            disposición DigiMedia.com
          </p>
          <p className="text-sm text-white mb-4">
            Debes de tener en cuenta que tus reclamos conforme a ley deben ser
            resueltos en un plazo no mayor a quince (15) días hábiles
            improrrogables, pudiendo extenderse el plazo cuando la naturaleza
            del reclamo lo acredite. Art. 24.1 Ley 29571.
          </p>
          <p className="text-sm font-semibold mb-4 text-white">
            Razón Social: DIGIMEDIA MARKETING S.A.C. RUC: 20605116559
          </p>

          <div className="rounded-lg shadow">
            <h2 className="text-2xl font-bold text-center mb-6 text-white">
              Cuestionario de quejas
            </h2>

            <form
              className="space-y-6"
              onSubmit={handleSubmit}
              toolname="submit_complaint_form"
              tooldescription="Envía una reclamación o queja con datos personales e información del incidente"
            >
              <div className="space-y-4">
                <h3 className="font-semibold text-white">Datos Personales:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Nombre"
                      toolparamdescription="Nombre del usuario"
                      className={`${inputBaseStyles} ${
                        touched.nombre && errors.nombre ? "border-red-500" : ""
                      }`}
                    />
                    {touched.nombre && errors.nombre && (
                      <p className="mt-1 text-sm text-red-400">
                        {errors.nombre}
                      </p>
                    )}
                  </div>

                  <div>
                    <input
                      type="text"
                      name="apellido"
                      value={formData.apellido}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Apellido"
                      toolparamdescription="Apellido del usuario"
                      className={`${inputBaseStyles} ${
                        touched.apellido && errors.apellido
                          ? "border-red-500"
                          : ""
                      }`}
                    />
                    {touched.apellido && errors.apellido && (
                      <p className="mt-1 text-sm text-red-400">
                        {errors.apellido}
                      </p>
                    )}
                  </div>

                  <div>
                    <select
                      name="documento"
                      value={formData.documento}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`${inputBaseStyles} ${
                        touched.documento && errors.documento
                          ? "border-red-500"
                          : ""
                      }`}
                    >
                      <option value="" className="bg-[#270564] text-white">
                        Tipo de Documento
                      </option>
                      <option value="DNI" className="bg-[#270564] text-white">
                        DNI
                      </option>
                      <option value="RUC" className="bg-[#270564] text-white">
                        RUC
                      </option>
                      <option value="CE" className="bg-[#270564] text-white">
                        CE
                      </option>
                      <option value="PTP" className="bg-[#270564] text-white">
                        PTP
                      </option>
                      <option value="OTROS" className="bg-[#270564] text-white">
                        OTROS...
                      </option>
                    </select>
                    {touched.documento && errors.documento && (
                      <p className="mt-1 text-sm text-red-400">
                        {errors.documento}
                      </p>
                    )}
                  </div>

                  <div>
                    <input
                      type="text"
                      name="numeroDocumento"
                      value={formData.numeroDocumento}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Número de Documento"
                      inputMode="numeric"
                      className={`${inputBaseStyles} ${
                        touched.numeroDocumento && errors.numeroDocumento
                          ? "border-red-500"
                          : ""
                      }`}
                    />
                    {touched.numeroDocumento && errors.numeroDocumento && (
                      <p className="mt-1 text-sm text-red-400">
                        {errors.numeroDocumento}
                      </p>
                    )}
                  </div>

                  <div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Correo Electrónico"
                      className={`${inputBaseStyles} ${
                        touched.email && errors.email ? "border-red-500" : ""
                      }`}
                    />
                    {touched.email && errors.email && (
                      <p className="mt-1 text-sm text-red-400">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <input
                      type="tel"
                      name="celular"
                      value={formData.celular}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Celular"
                      inputMode="numeric"
                      toolparamdescription="Número de teléfono"
                      className={`${inputBaseStyles} ${
                        touched.celular && errors.celular
                          ? "border-red-500"
                          : ""
                      }`}
                    />
                    {touched.celular && errors.celular && (
                      <p className="mt-1 text-sm text-red-400">
                        {errors.celular}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <input
                      type="text"
                      name="direccion"
                      value={formData.direccion}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Dirección"
                      toolparamdescription="Dirección del usuario"
                      className={`${inputBaseStyles} ${
                        touched.direccion && errors.direccion
                          ? "border-red-500"
                          : ""
                      }`}
                    />
                    {touched.direccion && errors.direccion && (
                      <p className="mt-1 text-sm text-red-400">
                        {errors.direccion}
                      </p>
                    )}
                  </div>

                  <div>
                    <input
                      type="text"
                      name="distrito"
                      value={formData.distrito}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Distrito"
                      toolparamdescription="Distrito"
                      className={`${inputBaseStyles} ${
                        touched.distrito && errors.distrito
                          ? "border-red-500"
                          : ""
                      }`}
                    />
                    {touched.distrito && errors.distrito && (
                      <p className="mt-1 text-sm text-red-400">
                        {errors.distrito}
                      </p>
                    )}
                  </div>

                  <div>
                    <input
                      type="text"
                      name="ciudad"
                      value={formData.ciudad}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Ciudad"
                      toolparamdescription="Ciudad"
                      className={`${inputBaseStyles} ${
                        touched.ciudad && errors.ciudad ? "border-red-500" : ""
                      }`}
                    />
                    {touched.ciudad && errors.ciudad && (
                      <p className="mt-1 text-sm text-red-400">
                        {errors.ciudad}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-white">
                  Datos de incidente:
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <select
                      name="tipoReclamo"
                      value={formData.tipoReclamo}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`${inputBaseStyles} ${
                        touched.tipoReclamo && errors.tipoReclamo
                          ? "border-red-500"
                          : ""
                      }`}
                    >
                      <option value="" className="bg-[#270564] text-white">
                        Tipo de reclamo
                      </option>
                      <option value="QUEJA" className="bg-[#270564] text-white">
                        QUEJA
                      </option>
                      <option
                        value="RECLAMO"
                        className="bg-[#270564] text-white"
                      >
                        RECLAMO
                      </option>
                    </select>
                    {touched.tipoReclamo && errors.tipoReclamo && (
                      <p className="mt-1 text-sm text-red-400">
                        {errors.tipoReclamo}
                      </p>
                    )}
                  </div>

                  <div>
                    <select
                      name="id_servicio"
                      value={formData.id_servicio}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`${inputBaseStyles} ${
                        touched.id_servicio && errors.id_servicio
                          ? "border-red-500"
                          : ""
                      }`}
                    >
                      <option value="" className="bg-[#270564] text-white">
                        Servicio contratado
                      </option>
                      {SERVICIOS.map((servicio) => (
                        <option
                          key={servicio.id}
                          value={servicio.id}
                          className="bg-[#270564] text-white"
                        >
                          {servicio.nombre}
                        </option>
                      ))}
                    </select>
                    {touched.id_servicio && errors.id_servicio && (
                      <p className="mt-1 text-sm text-red-400">
                        {errors.id_servicio}
                      </p>
                    )}
                  </div>

                  <div className="ml-1">
                    <label
                      htmlFor="fechaIncidente"
                      className="text-white block mb-1"
                    >
                      Fecha Incidente
                    </label>
                    <input
                      value={formData.fechaIncidente}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      id="fechaIncidente"
                      name="fechaIncidente"
                      type="date"
                      min="2000-01-01"
                      max={todayString}
                      toolparamdescription="Fecha del incidente"
                      className={`${inputBaseStyles} [color-scheme:dark] ${
                        (touched.fechaIncidente || errors.fechaIncidente) &&
                        errors.fechaIncidente
                          ? "border-red-500"
                          : ""
                      }`}
                    />
                    {errors.fechaIncidente && (
                      <p className="mt-1 text-sm text-red-400">
                        {errors.fechaIncidente}
                      </p>
                    )}
                  </div>
                </div>

                <div className="ml-1">
                  <textarea
                    name="reclamoPerson"
                    value={formData.reclamoPerson}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Indicar incidente"
                    toolparamdescription="Descripción del incidente"
                    className={`${inputBaseStyles} h-32 ${
                      touched.reclamoPerson && errors.reclamoPerson
                        ? "border-red-500"
                        : ""
                    }`}
                  />
                  {touched.reclamoPerson && errors.reclamoPerson && (
                    <p className="mt-1 text-sm text-red-400">
                      {errors.reclamoPerson}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      name="checkReclamoForm"
                      checked={checkReclamo}
                      onChange={(e) => {
                        cambioReclamo(e.target.checked);
                        handleCheckboxChange(
                          "checkReclamoForm",
                          e.target.checked,
                        );
                      }}
                      className="mt-1 mr-2 accent-[#E94E77]"
                    />
                    <p className="text-sm text-white">
                      Soy consciente que la formulación del reclamo no impide
                      acudir a otras vías de solución de controversias ni es
                      requisito previo para interponer una denuncia ante el
                      INDECOPI. *El proveedor deberá dar respuesta al reclamo en
                      un plazo no mayor a quince (15) días calendario, de
                      acuerdo a la Ley 29571
                    </p>
                  </div>
                  {touched.checkReclamoForm && errors.checkReclamoForm && (
                    <p className="mt-1 ml-6 text-sm text-red-400">
                      {errors.checkReclamoForm}
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      name="aceptaPoliticaPrivacidad"
                      checked={aceptaPolitica}
                      onChange={(e) => {
                        cambioPolitica(e.target.checked);
                        handleCheckboxChange(
                          "aceptaPoliticaPrivacidad",
                          e.target.checked,
                        );
                      }}
                      className="mt-1 mr-2 accent-[#E94E77]"
                    />
                    <p className="text-sm text-white">
                      Acepto las{" "}
                      <a
                        className="text-[#E94E77] underline hover:text-[#D13B62]"
                        href="/politica-privacidad"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Políticas de Privacidad
                      </a>
                      .
                    </p>
                  </div>
                  {touched.aceptaPoliticaPrivacidad &&
                    errors.aceptaPoliticaPrivacidad && (
                      <p className="mt-1 ml-6 text-sm text-red-400">
                        {errors.aceptaPoliticaPrivacidad}
                      </p>
                    )}
                </div>
              </div>

              <button
                type="submit"
                className={`w-full p-2 rounded text-white font-medium transition-all duration-300 ${
                  isSubmitting || !isFormValid()
                    ? "bg-gray-400/50 cursor-not-allowed"
                    : "bg-[#3a0a7a] hover:bg-[#5c40d1]"
                }`}
                disabled={isSubmitting || !isFormValid()}
                title={isSubmitting ? "Guardando..." : "Enviar Reclamación"}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="animate-spin h-4 w-4 mx-auto" />
                  </span>
                ) : (
                  "Enviar Reclamación"
                )}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ComplaintForm;
