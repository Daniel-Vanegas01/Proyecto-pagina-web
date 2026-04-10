import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../supabase/client";
import "./style.css";

// 🔥 IMPORTS NUEVOS
import jsPDF from "jspdf";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { saveAs } from "file-saver";

function VerCliente() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [cliente, setCliente] = useState(null);
  const [negocios, setNegocios] = useState([]);

  useEffect(() => {
    fetchCliente();
    fetchNegocios();
  }, []);

  const fetchCliente = async () => {
    const { data, error } = await supabase
      .from("clientes")
      .select("*")
      .eq("id", id)
      .single();

    if (!error) setCliente(data);
  };

  const fetchNegocios = async () => {
    const { data, error } = await supabase
      .from("negocios")
      .select("*")
      .eq("cliente_id", id);

    if (!error) setNegocios(data);
  };

  const handleNewNegocio = () => {
    navigate(`/nuevo-negocio/${id}`);
  };

  const handleViewNegocio = (negocioId) => {
    navigate(`/negocio/${negocioId}`);
  };

  const handleEdit = () => {
    navigate(`/editar-cliente/${id}`);
  };

  const handleBack = () => {
    navigate("/clientes");
  };

  // 🔥 EXPORTAR PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();

    let y = 10;

    doc.setFontSize(16);
    doc.text("Información del Cliente", 10, y);
    y += 10;

    doc.setFontSize(12);
    doc.text(`Nombre: ${cliente.nombre}`, 10, y); y += 8;
    doc.text(`NIT: ${cliente.nit}`, 10, y); y += 8;
    doc.text(`Tipo: ${cliente.tipo_cliente}`, 10, y); y += 8;
    doc.text(`Representante: ${cliente.rep_legal}`, 10, y); y += 10;

    // Teléfonos
    doc.text("Teléfonos:", 10, y); y += 8;
    cliente.telefonos?.forEach(t => {
      doc.text(`- ${t}`, 10, y);
      y += 6;
    });

    y += 5;

    // Correos
    doc.text("Correos:", 10, y); y += 8;
    cliente.correos?.forEach(c => {
      doc.text(`- ${c}`, 10, y);
      y += 6;
    });

    y += 5;

    // Direcciones
    doc.text("Direcciones:", 10, y); y += 8;
    cliente.direcciones?.forEach(d => {
      doc.text(`- ${d}`, 10, y);
      y += 6;
    });

    doc.save(`cliente_${cliente.nombre}.pdf`);
  };

  // 🔥 EXPORTAR WORD
  const handleExportWord = async () => {
    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "Información del Cliente",
                  bold: true,
                  size: 28
                })
              ]
            }),

            new Paragraph(`Nombre: ${cliente.nombre}`),
            new Paragraph(`NIT: ${cliente.nit}`),
            new Paragraph(`Tipo: ${cliente.tipo_cliente}`),
            new Paragraph(`Representante: ${cliente.rep_legal}`),

            new Paragraph(" "),
            new Paragraph("Teléfonos:"),
            ...(cliente.telefonos || []).map(t => new Paragraph(`- ${t}`)),

            new Paragraph(" "),
            new Paragraph("Correos:"),
            ...(cliente.correos || []).map(c => new Paragraph(`- ${c}`)),

            new Paragraph(" "),
            new Paragraph("Direcciones:"),
            ...(cliente.direcciones || []).map(d => new Paragraph(`- ${d}`)),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `cliente_${cliente.nombre}.docx`);
  };

  if (!cliente) return <div>Cargando...</div>;

  return (
    <div className="ver-cliente-container">
      <div className="ver-cliente-card">

        {/* HEADER */}
        <div className="header">

          <div className="header-left">
            <button className="back-button" onClick={handleBack}>
              Regresar
            </button>
            <h1>{cliente.nombre}</h1>
          </div>

          <div className="header-buttons">
            <button onClick={handleEdit}>Editar</button>
            <button onClick={handleExportWord}>Word</button>
            <button onClick={handleExportPDF}>PDF</button>
          </div>

        </div>

        <div className="content">

          {/* IZQUIERDA */}
          <div className="left">

            <div className="section">
              <h3>Información general</h3>
              <p><strong>NIT:</strong> {cliente.nit}</p>
              <p><strong>Tipo:</strong> {cliente.tipo_cliente}</p>
              <p><strong>Representante:</strong> {cliente.rep_legal}</p>
              {cliente.rep_legal_suplente && (
                <p><strong>Suplente:</strong> {cliente.rep_legal_suplente}</p>
              )}
            </div>

            <div className="section">
              <h3>Teléfonos</h3>
              {cliente.telefonos?.length ? (
                cliente.telefonos.map((t, i) => <p key={i}>{t}</p>)
              ) : (
                <p>No registrados</p>
              )}
            </div>

            <div className="section">
              <h3>Correos</h3>
              {cliente.correos?.length ? (
                cliente.correos.map((c, i) => <p key={i}>{c}</p>)
              ) : (
                <p>No registrados</p>
              )}
            </div>

            <div className="section">
              <h3>Direcciones</h3>
              {cliente.direcciones?.length ? (
                cliente.direcciones.map((d, i) => <p key={i}>{d}</p>)
              ) : (
                <p>No registradas</p>
              )}
            </div>

            <div className="section">
              <h3>Notas</h3>
              {cliente.notas?.length ? (
                cliente.notas.map((n, i) => (
                  <p key={i}>{n.fecha}: {n.texto}</p>
                ))
              ) : (
                <p>No hay notas</p>
              )}
            </div>

          </div>

          {/* DERECHA */}
          <div className="right">

            <div className="section">
              <h3>Negocios</h3>

              <button className="main-button" onClick={handleNewNegocio}>
                + Nuevo Negocio
              </button>

              {negocios.length === 0 ? (
                <p>No hay negocios registrados</p>
              ) : (
                negocios.map((negocio) => (
                  <div key={negocio.id} className="negocio-item">
                    <div>
                      <strong>Negocio {negocio.consecutivo}</strong>
                      <p>{negocio.fecha_ingreso}</p>
                    </div>
                    <button onClick={() => handleViewNegocio(negocio.id)}>
                      Ver
                    </button>
                  </div>
                ))
              )}

            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

export default VerCliente;