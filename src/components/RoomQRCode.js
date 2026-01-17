"use client";

import { QRCodeCanvas } from "qrcode.react";

export default function RoomQRCode({ url, size = 128 }) {
    return (
        <div className="bg-white p-2 rounded-lg inline-block">
            <QRCodeCanvas value={url} size={size} />
        </div>
    );
}
