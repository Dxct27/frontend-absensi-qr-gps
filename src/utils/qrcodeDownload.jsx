import { jsPDF } from "jspdf";
import QRCode from "react-qr-code";
import html2canvas from "html2canvas";
import { createRoot } from "react-dom/client";

const formatDateTime = (dateString) => {
  if (!dateString) return "Invalid Date";
  const date = new Date(dateString);
  return `${date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  })} ${date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })}`;
};

export const downloadSingleQRAsPDF = async (
  qrDetails,
  fileName = `Kode QR ${qrDetails.name}-${formatDateTime(
    qrDetails.waktu_awal
  )}.pdf`
) => {
  const fullQrUrl = `${window.location.origin}${qrDetails.url}`;
  const tempDiv = document.createElement("div");
  tempDiv.style.position = "absolute";
  tempDiv.style.left = "-9999px";
  document.body.appendChild(tempDiv);

  const root = createRoot(tempDiv);
  root.render(<QRCode value={fullQrUrl} size={256} />);

  await new Promise((resolve) => setTimeout(resolve, 500));
  const canvas = await html2canvas(tempDiv);
  const imgData = canvas.toDataURL("image/png");

  document.body.removeChild(tempDiv);

  const pdf = new jsPDF("portrait", "mm", "A4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const imgSize = Math.min(pageWidth - 40, 120);
  const xPos = (pageWidth - imgSize) / 2;
  const yPos = 40;

  pdf.addImage(imgData, "PNG", xPos, yPos, imgSize, imgSize);
  pdf.setFontSize(14);
  pdf.text(qrDetails.name, pageWidth / 2, yPos + imgSize + 10, {
    align: "center",
  });
  pdf.text(
    `Lokasi: ${qrDetails.latitude}, ${qrDetails.longitude}`,
    pageWidth / 2,
    yPos + imgSize + 20,
    { align: "center" }
  );
  pdf.text(`Radius: ${qrDetails.radius}m`, pageWidth / 2, yPos + imgSize + 30, {
    align: "center",
  });
  pdf.text(
    `Valid: ${formatDateTime(qrDetails.waktu_awal)} - ${formatDateTime(
      qrDetails.waktu_akhir
    )}`,
    pageWidth / 2,
    yPos + imgSize + 40,
    { align: "center" }
  );

  pdf.save(fileName);
};

export const downloadMultipleQRsAsPDF = async (selectedQRs) => {
  const fileName = `${selectedQRs[0].name}_to_${
    selectedQRs[selectedQRs.length - 1].name
  }_${new Date().toISOString().split("T")[0]}.pdf`;
  const pdf = new jsPDF("portrait", "mm", "A4");

  const qrPerPage = 10;
  const cellWidth = 70;
  const cellHeight = 57;
  const qrSize = 30;
  const marginX = 33;
  const marginY = 0;
  const spacing = 3;

  const positions = [];
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 2; col++) {
      const x = marginX + col * (cellWidth + spacing);
      const y = marginY + row * (cellHeight + spacing);
      positions.push({ x, y });
    }
  }

  for (let i = 0; i < selectedQRs.length; i++) {
    const qr = selectedQRs[i];
    const fullQrUrl = `${window.location.origin}${qr.url}`;

    const tempDiv = document.createElement("div");
    tempDiv.style.position = "absolute";
    tempDiv.style.left = "-9999px";
    document.body.appendChild(tempDiv);

    const root = createRoot(tempDiv);
    root.render(<QRCode value={fullQrUrl} size={256} />);
    await new Promise((resolve) => setTimeout(resolve, 300));

    const canvas = await html2canvas(tempDiv);
    const imgData = canvas.toDataURL("image/png");
    document.body.removeChild(tempDiv);

    if (i % qrPerPage === 0 && i !== 0) pdf.addPage();

    const { x, y } = positions[i % qrPerPage];

    // Optional: Border for debugging / visual clarity
    pdf.setDrawColor(180);
    pdf.rect(x, y, cellWidth, cellHeight);

    pdf.setFontSize(8);
    pdf.setFont("helvetica", "bold");
    const opdText = pdf.splitTextToSize(qr.opd.name, cellWidth - 4);
    const opdStartY = y + 3;
    opdText.forEach((line, idx) => {
      pdf.text(line, x + cellWidth / 2, opdStartY + idx * 4, {
        align: "center",
      });
    });

    const qrY = opdStartY + opdText.length * 4;
    pdf.addImage(
      imgData,
      "PNG",
      x + (cellWidth - qrSize) / 2,
      qrY,
      qrSize,
      qrSize
    );

    const textY = qrY + qrSize + 4;
    pdf.setFontSize(7);
    const centerX = x + cellWidth / 2;

    pdf.text(`Nama QR: ${qr.name}`, centerX, textY, { align: "center" });
    pdf.text(`Lokasi: ${qr.latitude}, ${qr.longitude}`, centerX, textY + 3, {
      align: "center",
    });
    pdf.text(`Radius: ${qr.radius}m`, centerX, textY + 6, { align: "center" });
    pdf.text(`Valid: ${formatDateTime(qr.waktu_awal)} - ${formatDateTime(qr.waktu_akhir)}`, centerX, textY + 9, {
      align: "center",
    });
  }

  pdf.save(fileName);
};
