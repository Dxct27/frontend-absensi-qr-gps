import React from "react";
import { Link } from "react-router-dom";
import LayoutAdmin from "../../components/Layout/Admin";
import QRCodeCreate from "./QRCodeCreate";
import RectangleButton from "../../components/RectangleButton";

const QRCodePage = () => {
  const value = "hello";

  return (
    <LayoutAdmin>
      <Link to="/qrcodecreate">
        <RectangleButton>Buat kode QR baru</RectangleButton>
      </Link>
    </LayoutAdmin>
  );
};

export default QRCodePage;
