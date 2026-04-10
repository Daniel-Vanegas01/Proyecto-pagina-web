import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../supabase/client";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";
import "./style.css";

function VerNegocio() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [negocio, setNegocio] = useState(null);
  const [cliente, setCliente] = useState(null);

  useEffect(() => {
    fetchNegocio();
  }, []);

  const fetchNegocio = async () => {
    const { data } = await supabase
      .from("negocios")
      .select("*")
      .eq("id", id)
      .single();

    if (data) {
      setNegocio(data);

      const { data: clienteData } = await supabase
        .from("clientes")
        .select("*")
        .eq("id", data.cliente_id)
        .single();

      setCliente(clienteData);
    }
  };

  const handleBack = () => {
    navigate(`/cliente/${negocio.cliente_id}`);
  };

  // PDF
  const handleExportPDF = async () => {
    const element = document.getElementById("documento");
    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, width, height);
    pdf.save(`negocio-${negocio.consecutivo}.pdf`);
  };

  // WORD
  const handleExportWord = () => {
    const content = document.getElementById("documento").innerHTML;

    const blob = new Blob(
      [`<html><body>${content}</body></html>`],
      { type: "application/msword" }
    );

    saveAs(blob, `negocio-${negocio.consecutivo}.doc`);
  };

  if (!negocio || !cliente) return <div>Cargando...</div>;

  return (
    <div className="container">

      {/* BOTÓN REGRESAR ARRIBA */}
      <div className="top-bar">
        <button onClick={handleBack}>Regresar</button>
      </div>

      {/* DOCUMENTO */}
      <div id="documento" className="documento">

        {/* CABECERA */}
        <div className="header-doc">
          <span>Fecha de Ingreso: {negocio.fecha_ingreso}</span>
          <span className="negocio-id">
            Negocio {negocio.consecutivo}
          </span>
        </div>

        <br />

        {/* CLIENTE */}
        <p><strong>Cliente:</strong> <strong>{cliente.nombre}</strong></p>
        <p>NIT. {cliente.nit}</p>

        {cliente.correos?.map((c, i) => (
          <p key={i}>E-mail: {c}</p>
        ))}

        {cliente.telefonos?.map((t, i) => (
          <p key={i}>Tel. – {t}</p>
        ))}

        <p>Dir:</p>
        <p>Gerente: {cliente.rep_legal}</p>

        {cliente.rep_legal_suplente && (
          <p>Contacto: {cliente.rep_legal_suplente}</p>
        )}

        <br />

        {/* DEUDOR */}
        <p><strong>Deudor:</strong> <strong>{negocio.deudor_nombre}</strong></p>
        <p><strong>NIT.:</strong> {negocio.deudor_nit}</p>

        {negocio.telefonos?.length > 0 && (
          <p><strong>Tel:</strong> {negocio.telefonos.join(" - ")}</p>
        )}

        {negocio.direcciones?.map((d, i) => (
          <p key={i}><strong>Dirección:</strong> {d}</p>
        ))}

        {negocio.correos?.map((c, i) => (
          <p key={i}><strong>Correo:</strong> {c}</p>
        ))}

        {negocio.pagina_web && (
          <p>{negocio.pagina_web}</p>
        )}

        <br />

        {/* CAPITAL */}
        <p><strong>Capital:</strong> $ {negocio.capital}</p>

        <br />

        {/* DETALLE */}
        <div className="detalle">
          {negocio.detalle}
        </div>

      </div>

      {/* 🔥 BOTONES ABAJO */}
      <div className="export-buttons">
        <button onClick={handleExportWord}>Descargar Word</button>
        <button onClick={handleExportPDF}>Descargar PDF</button>
      </div>

    </div>
  );
}

export default VerNegocio;