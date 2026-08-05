import type { CSSProperties } from "react";

/**
 * Tema visual compartilhado dos documentos impressos (A4).
 * Valores fixos propositalmente: impressão não deve depender de tema claro/escuro.
 */
export const printColors = {
  ink: "#0f172a",
  body: "#1f2937",
  muted: "#6b7280",
  faint: "#9ca3af",
  line: "#e5e7eb",
  hairline: "#f1f5f9",
  soft: "#f8fafc",
  accent: "#0f172a",
  positive: "#15803d",
  positiveSoft: "#f0fdf4",
  negative: "#b91c1c",
  negativeSoft: "#fef2f2",
  warnSoft: "#fffbeb",
};

export const printPage: CSSProperties = {
  maxWidth: "210mm",
  margin: "0 auto",
  padding: "12mm 15mm",
  fontSize: "10.5px",
  lineHeight: 1.5,
  color: printColors.body,
  background: "#fff",
  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
};

export const printHeader: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "16px",
  paddingBottom: "10px",
  marginBottom: "12px",
  borderBottom: `2px solid ${printColors.accent}`,
};

export const companyTitle: CSSProperties = {
  fontSize: "17px",
  fontWeight: 700,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: printColors.ink,
  margin: 0,
};

export const companyLine: CSSProperties = {
  fontSize: "8.5px",
  color: printColors.muted,
  margin: "2px 0 0",
};

export const docBadge: CSSProperties = {
  display: "inline-block",
  fontSize: "8px",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: printColors.muted,
  border: `1px solid ${printColors.line}`,
  background: printColors.soft,
  borderRadius: "999px",
  padding: "2px 8px",
};

export const docNumber: CSSProperties = {
  fontSize: "16px",
  fontWeight: 700,
  color: printColors.ink,
  margin: "4px 0 2px",
  letterSpacing: "0.02em",
};

export const card: CSSProperties = {
  border: `1px solid ${printColors.line}`,
  borderRadius: "6px",
  overflow: "hidden",
  background: "#fff",
};

export const cardBody: CSSProperties = {
  padding: "7px 9px",
};

export const sectionTitle: CSSProperties = {
  fontSize: "8px",
  fontWeight: 700,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: printColors.muted,
  background: printColors.soft,
  borderBottom: `1px solid ${printColors.line}`,
  padding: "5px 9px",
  margin: 0,
};

export const label: CSSProperties = {
  fontSize: "7.5px",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: printColors.faint,
};

export const value: CSSProperties = {
  fontSize: "10px",
  fontWeight: 600,
  color: printColors.ink,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  display: "block",
};

export const tableStyle: CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: "9.5px",
};

export const th: CSSProperties = {
  textAlign: "left",
  padding: "5px 9px",
  fontSize: "7.5px",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: printColors.muted,
  borderBottom: `1px solid ${printColors.line}`,
  fontWeight: 700,
};

export const td: CSSProperties = {
  padding: "5px 9px",
  borderBottom: `1px solid ${printColors.hairline}`,
  color: printColors.body,
};

export const totalRow: CSSProperties = {
  background: printColors.soft,
  borderTop: `1px solid ${printColors.line}`,
  fontWeight: 700,
  color: printColors.ink,
};

export const termsList: CSSProperties = {
  fontSize: "8px",
  color: printColors.muted,
  paddingLeft: "14px",
  margin: 0,
  lineHeight: 1.6,
};

export const signatureLine: CSSProperties = {
  borderTop: `1px solid ${printColors.ink}`,
  paddingTop: "5px",
  marginTop: "44px",
  textAlign: "center",
};

export const footerNote: CSSProperties = {
  textAlign: "center",
  marginTop: "16px",
  paddingTop: "7px",
  borderTop: `1px solid ${printColors.line}`,
  fontSize: "7.5px",
  letterSpacing: "0.06em",
  color: printColors.faint,
};
