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
import logoLegales from "../../../../public/edition/logo.png";




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

    // Campos obligatorios
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

    // Fecha del incidente
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

    // Nombre y apellido: eliminar números y caracteres especiales
    if (name === "nombre" || name === "apellido") {
      newValue = value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]/g, "");
    }

    // Documento: solo números + límite según tipo
    if (name === "numeroDocumento") {
      if (formData.documento === "CE") {
        // CE: permite letras y números, máximo 20 caracteres
        newValue = value.replace(/[^a-zA-Z0-9]/g, "").slice(0, 20);
      } else {
        // DNI, RUC, PTP y OTROS: solo números
        newValue = value.replace(/\D/g, "");

        const maxLength = documentMaxLengths[formData.documento] || 20;

        newValue = newValue.slice(0, maxLength);
      }
    }

    // Celular: solo números
    if (name === "celular") {
      newValue = value.replace(/\D/g, "").slice(0, 9);
    }

    const updatedData = {
      ...formData,
      [name]: newValue,
    };

    setFormData(updatedData);

    // Si el campo ya fue tocado o es la fecha del incidente, validarlo inmediatamente
    if (touched[name] || name === "fechaIncidente") {
      const error = validateField(name, newValue, updatedData);

      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }

    // Si cambia el tipo de documento, volver a validar el número
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
    <div className="min-h-screen bg-gray-50 text-[#140048]">
      {/* 1. Barra de navegación global superior */}
      <Header />

      {/* 2. Sección del LOGO: Centrado arriba de forma limpia */}
      <header className="flex items-center justify-center bg-gradient-to-r from-[#1E033F] to-[#410C89] py-6 relative">
        <Image
          src={logoLegales}
          alt="Digimedia"
          width={160}
          height={120}
          priority
        />
      </header>

      {/* 3. Contenedor de contenido para el botón y el formulario */}
            {/* 3. Contenedor de contenido para el botón y el formulario */}
      <main className="mx-auto max-w-4xl px-4 py-8">
        
        {/* Botón Volver al inicio */}
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

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-center mb-4 text-black">
            Libro de Reclamaciones
          </h1>
          <p className="text-sm text-gray-600 mb-2">
            Conforme está establecido en el Código de Protección y Defensa del
            Consumidor contamos con un Libro de Reclamaciones Virtual a tu
            disposición DigiMedia.com
          </p>
          <p className="text-sm text-gray-600 mb-4">
            Debes de tener en cuenta que tus reclamos conforme a ley deben ser
            resueltos en un plazo no mayor a quince (15) días hábiles
            improrrogables, pudiendo extenderse el plazo cuando la naturaleza
            del reclamo lo acredite. Art. 24.1 Ley 29571.
          </p>
          <p className="text-sm font-semibold mb-4 text-black">
            Razón Social: DIGIMEDIA MARKETING S.A.C. RUC: 20605116559
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          {/* ... todo el formulario igual ... */}
        </div>

      </main>
    </div>
  );
};

export default ComplaintForm;
