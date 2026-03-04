import React from 'react';
import { FaUserMd } from 'react-icons/fa';
import ChatSistemi from '../common/ChatSistemi';

export default function SaglikDanismani() {
    return <ChatSistemi type="saglik" title="Sağlık Asistanı (Veteriner AI)" icon={<FaUserMd />} />;
}
