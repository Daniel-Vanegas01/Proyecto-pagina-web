import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../supabase/client";

import "./style.css";


import {
  calcularLiquidacionFactura,
  calcularDocumentoLiquidacion
} from "../generarliquidacion/utils/liquidacion";

// EXPORTS
import html2pdf from "html2pdf.js";
import { Document, Packer, Paragraph, Table, TableRow, TableCell } from "docx";
import { saveAs } from "file-saver";

function GenerarDocumentoLiquidacion() {
  const { negocioId } = useParams();
  const navigate = useNavigate();

  const [negocio, setNegocio] = useState(null);
  const [facturas, setFacturas] = useState([]);
  const [calculos, setCalculos] = useState({});
  const [documento, setDocumento] = useState(null);
  const [guardando, setGuardando] = useState(false);

  // ======================
  // NEGOCIO
  // ======================
  useEffect(() => {
    fetchNegocio();
    fetchFacturas();
  }, []);

  const fetchNegocio = async () => {
    const { data } = await supabase
      .from("negocios")
      .select("*")
      .eq("id", negocioId)
      .single();

    if (data) setNegocio(data);
  };

  // ======================
  // FACTURAS
  // ======================
  const fetchFacturas = async () => {
    const { data } = await supabase
      .from("facturas")
      .select("*")
      .eq("negocio_id", negocioId)
      .order("numero", { ascending: true });

    if (data) setFacturas(data);
  };

  // ======================
  // CALCULO
  // ======================
  useEffect(() => {
    if (facturas.length > 0) calcularTodo();
  }, [facturas]);

  const calcularTodo = async () => {
    const resultados = {};

    for (const f of facturas) {
      const res = await calcularLiquidacionFactura(f);
      resultados[f.id] = res;
    }

    setCalculos(resultados);

    const doc = calcularDocumentoLiquidacion(facturas, resultados);
    setDocumento(doc);
  };

  // ======================
  // PDF PROFESIONAL
  // ======================
  const descargarPDF = () => {
    const element = document.getElementById("tabla-liquidacion");

    const opt = {
      margin: 0.5,
      filename: `LIQUIDACION-${negocio.consecutivo}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "a4", orientation: "landscape" }
    };

    html2pdf().set(opt).from(element).save();
  };

  // ======================
  // WORD PROFESIONAL
  // ======================
  const descargarWord = async () => {
    const filas = documento.filas;

    const rows = filas.map((f, i) =>
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph(String(i + 1))] }),
          new TableCell({ children: [new Paragraph(f.factura)] }),
          new TableCell({ children: [new Paragraph(f.saldo.toLocaleString())] }),
          new TableCell({ children: [new Paragraph(f.fecha_vencimiento)] }),
          new TableCell({ children: [new Paragraph(String(f.dias_mora))] }),
          new TableCell({ children: [new Paragraph(f.total_interes.toLocaleString())] }),
        ],
      })
    );

    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              text: "DOCUMENTO DE LIQUIDACIÓN JUDICIAL",
              bold: true,
            }),

            new Paragraph(`Cliente: ${negocio.deudor_nombre}`),
            new Paragraph(`NIT: ${negocio.deudor_nit}`),
            new Paragraph(`Fecha: ${new Date().toLocaleDateString()}`),

            new Paragraph(""),

            new Table({
              rows: [
                new TableRow({
                  children: [
                    "N°", "Factura", "Saldo", "Fecha Vto", "Días Mora", "Interés"
                  ].map(t => new TableCell({ children: [new Paragraph(t)] }))
                }),
                ...rows,

                // TOTALES
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph("TOTALES")] }),
                    new TableCell({ children: [new Paragraph("")] }),
                    new TableCell({ children: [new Paragraph(documento.totalSaldos.toLocaleString())] }),
                    new TableCell({ children: [new Paragraph("")] }),
                    new TableCell({ children: [new Paragraph("")] }),
                    new TableCell({ children: [new Paragraph(documento.totalIntereses.toLocaleString())] }),
                  ],
                }),

                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph("SUBTOTAL")], columnSpan: 5 }),
                    new TableCell({ children: [new Paragraph(documento.subtotal.toLocaleString())] }),
                  ],
                }),

                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph("HONORARIOS 10%")], columnSpan: 5 }),
                    new TableCell({ children: [new Paragraph(documento.honorarios.toLocaleString())] }),
                  ],
                }),

                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph("TOTAL DEUDA")], columnSpan: 5 }),
                    new TableCell({ children: [new Paragraph(documento.totalFinal.toLocaleString())] }),
                  ],
                }),
              ],
            }),

            new Paragraph(""),
            new Paragraph("__________________________"),
            new Paragraph("FIRMA ABOGADO RESPONSABLE"),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `LIQUIDACION-${negocio.consecutivo}.docx`);
  };

  // ======================
  // UI
  // ======================
  if (!negocio || !documento) return <div>Cargando...</div>;

  const volver = () => navigate(-1);

    return (
    <div className="doc-container">
      <div className="doc-card">

        <button className="back-button" onClick={volver}>
          Regresar
        </button>

        <div className="doc-header">
          <h2>Documento de Liquidación</h2>

          <div className="doc-buttons">
            <button onClick={descargarPDF}>Descargar PDF</button>
            <button onClick={descargarWord}>Descargar Word</button>
          </div>
        </div>

        <div className="doc-info">
          <p><b>Consecutivo:</b> {negocio.consecutivo}</p>
          <p><b>Nombre:</b> {negocio.deudor_nombre}</p>
          <p><b>NIT:</b> {negocio.deudor_nit}</p>
        </div>

        <div id="tabla-liquidacion" className="table-container">
          <table className="table-liquidacion">
            <thead>
              <tr>
                <th>#</th>
                <th>Factura</th>
                <th>Saldo</th>
                <th>Fecha Vto</th>
                <th>Días Mora</th>
                <th>Total Interés</th>
              </tr>
            </thead>

            <tbody>
              {documento.filas.map((f) => (
                <tr key={f.factura}>
                  <td>{f.numero}</td>
                  <td>{f.factura}</td>
                  <td>{f.saldo.toLocaleString()}</td>
                  <td>{f.fecha_vencimiento}</td>
                  <td>{f.dias_mora}</td>
                  <td>{f.total_interes.toLocaleString()}</td>
                </tr>
              ))}

              <tr className="total-row">
                <td></td>
                <td><b>TOTALES</b></td>
                <td><b>{documento.totalSaldos.toLocaleString()}</b></td>
                <td></td>
                <td></td>
                <td><b>{documento.totalIntereses.toLocaleString()}</b></td>
              </tr>

              <tr className="subtotal-row">
                <td colSpan="5"><b>SUBTOTAL</b></td>
                <td><b>{documento.subtotal.toLocaleString()}</b></td>
              </tr>

              <tr className="subtotal-row">
                <td colSpan="5"><b>HONORARIOS (10%)</b></td>
                <td><b>{documento.honorarios.toLocaleString()}</b></td>
              </tr>

              <tr className="final-row">
                <td colSpan="5"><b>TOTAL DEUDA</b></td>
                <td><b>{documento.totalFinal.toLocaleString()}</b></td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

export default GenerarDocumentoLiquidacion;